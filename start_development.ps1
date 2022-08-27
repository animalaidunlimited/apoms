#Start git bash for StreetTreat and Apoms
start "C:\Program Files\Git\git-bash.exe" "--cd=D:\Development\Apoms"
start "C:\Program Files\Git\git-bash.exe" "--cd=D:\Development\StreetTreat"

#Start StreetTreat and Apoms apps
#wt -p cmd -d D:\Development\
start "D:\Development\ng-serve.bat"
start "D:\Development\nodemon_start.bat"
#start "D:\Development\ng-test.bat"


#start "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:4200"
#start "C:\Program Files\Google\Chrome\Application\chrome.exe" "https://mail.google.com"

#Open VS Code to the correct folders
code D:\Development\Apoms
code D:\Development\StreetTreat
