import {
  aws_ec2 as ec2,
  aws_secretsmanager as secrets,
  aws_rds as rds,
  Duration,
  RemovalPolicy,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface StackProps {
  prefix: string;
  vpc: ec2.IVpc;
  username: string;
  port: number;
  database: string;
}

export class MySQLRdsInstance {
  public readonly dbSecretName: string;

  constructor(scope: Construct, props: StackProps) {
    const vpc = props.vpc;

    // generate the username and password
    const secret = new secrets.Secret(
      scope,
      `${props.prefix}-mysql-credentials`,
      {
        // DB credentials will be saved under this pathname in AWS Secrets Manager
        secretName: `${props.prefix}/rds/mysql/credentials`, // secret pathname,
        description: 'Credentials to access MySQL Database on RDS',
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ username: props.username }),
          generateStringKey: 'password',
          excludePunctuation: true,
          includeSpace: false,
        },
      },
    );

    // create the security group for the RDS instance
    const securityGroup = new ec2.SecurityGroup(
      scope,
      `${props.prefix}-rds-sg`,
      {
        vpc,
        securityGroupName: `${props.prefix}-rds-sg`,
      },
    );

    securityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(props.port),
      'Allow only local resources inside VPC to access this MySQL',
    );

    // create the RDS instance
    new rds.DatabaseInstance(scope, `${props.prefix}-mysql-rds-instance`, {
      vpc,
      credentials: rds.Credentials.fromSecret(secret),
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_28,
      }),
      port: props.port,
      allocatedStorage: 100,
      storageType: rds.StorageType.GP2,
      backupRetention: Duration.days(7),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO,
      ),
      // to place the database in an isolated subnet of the VPC
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      // if the database be destroyed, AWS will take a snapshot of the database instance before terminating it
      removalPolicy: RemovalPolicy.DESTROY,
      // accidental deletion protection
      deletionProtection: false,
      databaseName: props.database,
      securityGroups: [securityGroup],
    });

    this.dbSecretName = secret.secretName;
  }
}
