import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface StackProps {
  prefix: string;
}

export class CustomVPC {
  public readonly vpc: ec2.IVpc;

  constructor(scope: Construct, props: StackProps) {
    this.vpc = new ec2.Vpc(scope, `${props.prefix}-vpc`, {
      natGateways: 1,
    });
  }
}
