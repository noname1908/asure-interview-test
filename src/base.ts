import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elbv2,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { config } from './config';
import { ApplicationLoadBalancer } from './constructs/alb';
import { CustomVPC } from './constructs/vpc';

export class BaseStack extends Stack {
  public readonly vpc: ec2.IVpc;
  public readonly albListener: elbv2.IApplicationListener;
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // VPC
    const { vpc } = new CustomVPC(this, { prefix: config.projectName });
    this.vpc = vpc;

    // ALB
    const { listener } = new ApplicationLoadBalancer(this, {
      prefix: config.projectName,
      vpc,
    });
    this.albListener = listener;
  }
}
