import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BaseStack } from '../src/base';
import { config } from '../src/config';
import { RdsMysqlStack } from '../src/database';
import { EC2FullStack } from '../src/main';

test('Snapshot', () => {
  const app = new App();
  const base = new BaseStack(app, 'test-base', {
    env: config.env,
  });
  const database = new RdsMysqlStack(app, 'test-rds-mysql', {
    env: config.env,
    description: 'Deploys database infrastructure',
    tags: { Project: config.projectName },
    vpc: base.vpc,
  });
  const stack = new EC2FullStack(app, 'test-ec2', {
    env: config.env,
    vpc: base.vpc,
    albListener: base.albListener,
    dbSecretPath: database.dbSecretName,
  });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
