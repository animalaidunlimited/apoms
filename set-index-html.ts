/*
The purpose of this file is to replace sensitive values within our project with GitHub Actions secrets.
You can read more about this below:

https://betterprogramming.pub/how-to-secure-angular-environment-variables-for-use-in-github-actions-39c07587d590
https://medium.com/@ferie/how-to-pass-environment-variables-at-building-time-in-an-angular-application-using-env-files-4ae1a80383c
*/

const { writeFile, existsSync, mkdirSync } = require('fs');
// Configure Angular `index.html` file path
const environmentTargetPath = './src/index.html';
// Load node modules
const colors = require('colors');

require('dotenv').config();

// `index.html` file structure
const indexHTML = `   
    <!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>apoms</title>
    <base href="/">

    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Outlined" rel="stylesheet">

      <script src="https://maps.googleapis.com/maps/api/js?libraries=places&amp;key=${process.env.GOOGLE_API_KEY}"></script>

    <link rel="manifest" href="manifest.webmanifest">
    <meta name="theme-color" content="#1976d2">
</head>
<body>
  <app-root></app-root>
  <!-- <noscript>Please enable JavaScript to continue using this application.</noscript> -->
</body>


</html>`;


console.log(colors.magenta('The file `index.html` will be updated.'));
writeFile(environmentTargetPath, indexHTML, function (err:string) {
   if (err) {
       throw console.error(err);
   } else {
       console.log(colors.magenta(`Angular index.html file generated correctly at ${environmentTargetPath} \n`));
   }
});
