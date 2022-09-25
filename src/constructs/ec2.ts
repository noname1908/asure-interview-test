import {
  aws_ec2 as ec2,
  aws_autoscaling as autoscaling,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

interface StackProps {
  prefix: string;
  vpc: ec2.IVpc;
}

export class EC2AutoScalingGroup {
  public readonly asg: autoscaling.AutoScalingGroup;

  constructor(scope: Construct, props: StackProps) {
    const vpc = props.vpc;

    // define IAM role to allow access to other AWS services
    const role = new iam.Role(scope, `${props.prefix}-ec2-role`, {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        // allows ec2 instance to access secrets maanger and retrieve secrets
        iam.ManagedPolicy.fromAwsManagedPolicyName('SecretsManagerReadWrite'),
      ],
    });

    // create and export out auto scaling group
    this.asg = new autoscaling.AutoScalingGroup(scope, `${props.prefix}-asg`, {
      vpc,
      role,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      userData: ec2.UserData.forLinux(),
      minCapacity: 1,
      maxCapacity: 2,
    });
  }
}
