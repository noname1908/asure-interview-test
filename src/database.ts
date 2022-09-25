import { Stack, StackProps, aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { config } from './config';
import { MySQLRdsInstance } from './constructs/rds';

interface RdsMysqlStackProps extends StackProps {
  vpc: ec2.IVpc;
}

export class RdsMysqlStack extends Stack {
  public readonly dbSecretName: string;

  constructor(scope: Construct, id: string, props: RdsMysqlStackProps) {
    super(scope, id, props);

    const vpc = props.vpc;

    // RDS mysql database
    const mysqlRds = new MySQLRdsInstance(this, {
      prefix: config.projectName,
      vpc,
      username: 'admin',
      database: 'testing',
      port: 3306,
    });

    this.dbSecretName = mysqlRds.dbSecretName;
  }
}
