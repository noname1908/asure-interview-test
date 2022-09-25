import { execSync, ExecSyncOptions } from 'child_process';
import path from 'path';
import {
  App,
  Stack,
  StackProps,
  Duration,
  DockerImage,
  aws_s3_assets as s3assets,
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elbv2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { copySync } from 'fs-extra';
import { BaseStack } from './base';
import { config } from './config';
import { EC2AutoScalingGroup } from './constructs/ec2';
import { RdsMysqlStack } from './database';

interface EC2FullStackProps extends StackProps {
  vpc: ec2.IVpc;
  albListener: elbv2.IApplicationListener;
  dbSecretPath: string;
}

export class EC2FullStack extends Stack {
  constructor(scope: Construct, id: string, props: EC2FullStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;
    const listener = props.albListener;
    const dbSecretPath = props.dbSecretPath;

    // EC2 instance in an autoscaling group
    const { asg } = new EC2AutoScalingGroup(this, {
      prefix: config.projectName,
      vpc,
    });

    // add the autoscaling group to the load balancer
    listener.addTargets(`${config.projectName}-asg-targets`, {
      port: 80,
      targets: [asg],
      healthCheck: {
        path: '/',
        unhealthyThresholdCount: 2,
        healthyThresholdCount: 5,
        interval: Duration.seconds(30),
      },
    });

    // add scaling policy for the auto scaling group
    asg.scaleOnRequestCount('request-per-minute-scaling', {
      targetRequestsPerMinute: 100,
    });
    asg.scaleOnCpuUtilization('cpu-scaling', {
      targetUtilizationPercent: 70,
    });

    // --- App ---
    const execOptions: ExecSyncOptions = { stdio: 'inherit' };

    // --- API ---
    // Upload the api to s3
    const apiAsset = new s3assets.Asset(this, 'ApiAsset', {
      path: path.join(__dirname, '../api'),
      bundling: {
        image: DockerImage.fromRegistry('alpine'),
        local: {
          tryBundle(outputDir: string) {
            try {
              execSync(
                'cd api && yarn install --frozen-lockfile && yarn build && cp .env.example ./build/.env',
                execOptions,
              );
              copySync('./api/build', outputDir, {
                ...execOptions,
                recursive: true,
              });
              return true;
            } catch (error) {
              return false;
            }
          },
        },
      },
    });

    // Allow EC2 instance to read the files from the api s3 bucket
    apiAsset.grantRead(asg.role);

    // Download the api files from S3
    const apiFilePath = asg.userData.addS3DownloadCommand({
      bucket: apiAsset.bucket,
      bucketKey: apiAsset.s3ObjectKey,
    });
    // #--- API ---

    // --- Site
    // Upload the site to s3
    const siteAsset = new s3assets.Asset(this, 'SiteAsset', {
      path: path.join(__dirname, '../site'),
      bundling: {
        image: DockerImage.fromRegistry('alpine'),
        local: {
          tryBundle(outputDir: string) {
            try {
              execSync(
                'cd site && yarn install --frozen-lockfile && yarn generate && cp ../nginx/nginx-app.conf ./dist/nginx-app.conf',
                execOptions,
              );
              copySync('./site/dist', outputDir, {
                ...execOptions,
                recursive: true,
              });
              return true;
            } catch (error) {
              return false;
            }
          },
        },
      },
    });

    // Allow EC2 instance to read the files
    siteAsset.grantRead(asg.role);

    // Download the file from S3
    const siteFilePath = asg.userData.addS3DownloadCommand({
      bucket: siteAsset.bucket,
      bucketKey: siteAsset.s3ObjectKey,
    });
    // #--- Site ---
    // #--- App ---

    // --- Configuration Script ---

    // Upload the configuration file to s3
    const configScriptAsset = new s3assets.Asset(this, 'ConfigScriptAsset', {
      path: path.join(__dirname, '../scripts/configure_app.sh'),
    });

    // Allow EC2 instance to read the file
    configScriptAsset.grantRead(asg.role);

    // Download the file from s3
    const configScriptFilePath = asg.userData.addS3DownloadCommand({
      bucket: configScriptAsset.bucket,
      bucketKey: configScriptAsset.s3ObjectKey,
    });

    // Execute the downloaded file
    asg.userData.addExecuteFileCommand({
      filePath: configScriptFilePath,
      arguments: [
        siteFilePath,
        apiFilePath,
        config.env.region,
        dbSecretPath,
      ].join(' '),
    });
    // #--- Configuration Script ---
  }
}

const app = new App();
// base
const base = new BaseStack(app, `${config.projectName}-base`, {
  env: config.env,
  description: 'Deploys base infrastructure',
  tags: { Project: config.projectName },
});
// mysql
const database = new RdsMysqlStack(app, `${config.projectName}-rds-mysql`, {
  env: config.env,
  description: 'Deploys database infrastructure',
  tags: { Project: config.projectName },
  vpc: base.vpc,
});
// ec2
new EC2FullStack(app, `${config.projectName}-ec2`, {
  env: config.env,
  description: 'Deploys EC2 scaling group for web application infrastructure',
  tags: { Project: config.projectName },
  vpc: base.vpc,
  albListener: base.albListener,
  dbSecretPath: database.dbSecretName,
});

app.synth();
