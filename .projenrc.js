const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.42.1',
  defaultReleaseBranch: 'main',
  name: 'asure-interview-test',
  gitignore: ['.DS_Store', 'cdk.context.json', '.env'],

  deps: [
    'fs-extra',
    '@types/fs-extra',
    'dotenv',
  ] /* Runtime dependencies of this module. */,
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

project.addTask('deploy-all', {
  exec: 'cdk deploy --all',
});
project.addTask('destroy-all', {
  exec: 'cdk destroy --all',
});
project.addTask('install-all', {
  exec: 'cd api && yarn install && cd ../site && yarn install && cd .. && yarn install',
});
project.synth();
