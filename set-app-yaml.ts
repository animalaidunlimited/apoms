
const { writeFile, existsSync, mkdirSync } = require('fs');

const colors = require('colors');

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
