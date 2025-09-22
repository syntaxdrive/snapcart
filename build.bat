@echo off
echo Building dist folder...

if not exist dist mkdir dist

xcopy views dist\views\ /E /I /Y /Q
xcopy public dist\public\ /E /I /Y /Q
xcopy netlify dist\netlify\ /E /I /Y /Q
xcopy models dist\models\ /E /I /Y /Q
xcopy data dist\data\ /E /I /Y /Q

copy server.js dist\ >nul
copy package.json dist\ >nul

echo Build complete!