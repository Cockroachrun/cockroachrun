@echo off
REM Temporarily add Node.js to the PATH for this script run
set PATH=C:\Progra~1\nodejs;%PATH%

REM Run the npm build command
npm run build
