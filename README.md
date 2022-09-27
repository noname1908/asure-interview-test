# Full stack CDK

## Deploy Setup

```bash
# ensure that AWS credentials and region already setup on local 
$ aws configure

# deploys the CDK toolkit stack into an AWS environment
$ cdk bootstrap

# install all dependencies
$ yarn install

# deploy full-stack application to AWS environment
$ yarn deploy-all
```
Then get the load balancer dns name from the console and access the application.

Admin account: admin@gmail.com - secret

## Clean up

```bash
# delete all resources
$ yarn destroy-all
```