import {
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elbv2,
  CfnOutput,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface StackProps {
  prefix: string;
  vpc: ec2.IVpc;
}

export class ApplicationLoadBalancer {
  public readonly loadBalancerDnsName: string;
  listener: elbv2.IApplicationListener;

  constructor(scope: Construct, props: StackProps) {
    const alb = new elbv2.ApplicationLoadBalancer(
      scope,
      `${props.prefix}-alb`,
      {
        vpc: props.vpc,
        internetFacing: true,
      },
    );

    // expose the dns name of the load balancer to use it later
    this.loadBalancerDnsName = alb.loadBalancerDnsName;

    // create a listener to add to autoscaling group later
    this.listener = alb.addListener(`${props.prefix}-alb-listener`, {
      port: 80,
      open: true,
    });

    // print out the dns name of the load balancer
    new CfnOutput(scope, `${props.prefix}-alb-dns-name`, {
      value: alb.loadBalancerDnsName,
    });
  }
}
