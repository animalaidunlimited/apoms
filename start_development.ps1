#Start git bash for StreetTreat and Apoms
start "C:\Development\Git\git-bash.exe" "--cd=C:\Development\Apps\Apoms"
start "C:\Development\Git\git-bash.exe" "--cd=C:\Development\Apps\StreetTreat"

#Start StreetTreat and Apoms apps
start "C:\Development\Apps\Apoms\ng-serve.bat"
start "C:\Development\Apps\StreetTreat\nodemon_start.bat"

#Open VS Code to the correct folders
code C:\Development\Apps\Apoms
code C:\Development\Apps\StreetTreat
