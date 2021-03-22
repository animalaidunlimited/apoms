/*
The purpose of this file is to replace sensitive values within our project with GitHub Actions secrets.
You can read more about this below:

https://betterprogramming.pub/how-to-secure-angular-environment-variables-for-use-in-github-actions-39c07587d590
https://medium.com/@ferie/how-to-pass-environment-variables-at-building-time-in-an-angular-application-using-env-files-4ae1a80383c
*/



const { writeFile, existsSync, mkdirSync } = require('fs');
// Configure Angular `environment.ts` file path
const environmentTargetPath = './src/environments/environment.ts';
// Load node modules
const colors = require('colors');

require('dotenv').load();
// `environment.ts` file structure
const envConfigFile = `export const environment = {
    production: true,
    API_URL: '${process.env.API_URL}',
    firebase: {
      apiKey: '${process.env.FIREBASE_API_KEY}',
      authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
      databaseURL: '${process.env.FIREBASE_DATABASE_URL}',
      projectId: '${process.env.PROJECT_ID}',
      storageBucket: '${process.env.STORAGE_BUCKET}',
      messagingSenderId: '${process.env.FIREBASE_SENDER_ID}',
      appId: '${process.env.FIREBASE_APP_ID}',
      measurementId: '${process.env.FIREBASE_MEASUREMENT_ID}',
      email: '${process.env.ANGULAR_FIRE_EMAIL}',
      password: '${process.env.ANGULAR_FIRE_PASSWORD}'}
  };`;


console.log(colors.magenta('The file `environment.ts` will be updated.'));
writeFile(environmentTargetPath, envConfigFile, function (err:string) {
   if (err) {
       throw console.error(err);
   } else {
       console.log(colors.magenta(`Angular environment.ts file generated correctly at ${environmentTargetPath} \n`));
   }
});

console.log(colors.magenta('Updating the package.json file to build for the correct environment'));

console.log(colors.magenta('Adding the current deployment environment, i.e. the service'));
const appYamlPath = 'dist/app.yaml';

const appYamlFile =`service: ${process.env.DEPLOYMENT_ENVIRONMENT}
runtime: nodejs12
env: standard

resources:
  cpu: 1
  memory_gb: 0.5
  disk_size_gb: 10

handlers:
- url: /
  secure: always
  static_files: apoms/index.html
  upload: apoms/index.html

#  Routing rules for resources, css, js, images etc. Any file with format filename.ext
- url: /(.*\\.(.+))$
  secure: always
  static_files: apoms/\\1
  upload: apoms/(.*\\.(.+))$

#  Routing rule for Angular Routing
- url: /(.*)
  secure: always
  static_files: apoms/index.html
  upload: apoms/index.html`;

  writeFile(appYamlPath, appYamlFile, function (err:string) {
    if (err) {
        throw console.error(err);
    } else {
        console.log(colors.magenta(`Angular app.yaml file generated correctly at ${appYamlPath}`));
    }
 });

