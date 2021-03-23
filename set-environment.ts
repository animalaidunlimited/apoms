/*
The purpose of this file is to replace sensitive values within our project with GitHub Actions secrets.
You can read more about this below:

https://betterprogramming.pub/how-to-secure-angular-environment-variables-for-use-in-github-actions-39c07587d590
https://medium.com/@ferie/how-to-pass-environment-variables-at-building-time-in-an-angular-application-using-env-files-4ae1a80383c
*/

const { writeFile, existsSync, mkdirSync } = require('fs');
// Configure Angular `environment.ts` file path
const targetPath = './src/environments/environment.ts';
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


console.log(colors.magenta('The file `environment.ts` will be written with the following content: \n'));
console.log(colors.grey(envConfigFile));
writeFile(targetPath, envConfigFile, function (err:string) {
   if (err) {
       throw console.error(err);
   } else {
       console.log(colors.magenta(`Angular environment.ts file generated correctly at ${targetPath} \n`));
   }
});

console.log(colors.magenta('Updating the package.json file to build for the correct environment'));


