import * as dotenv from 'dotenv';
// load environments from .env
dotenv.config();

const stage = process.env.STAGE || 'dev';

export const config = {
  // this prefix is used to name provisioned resources
  projectName: `asure-interview-test-${stage}`,
  stage,
  env: {
    account: process.env.AWS_ACCOUNT,
    region: process.env.AWS_REGION || 'ap-southeast-1',
  },
};
