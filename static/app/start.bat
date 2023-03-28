REM Change to the directory of the repo.

cd /D "%~dp0"
cd ../../


REM Load the port number from the serverconfig file.

for /f "tokens=1,2 delims=:{}, " %%A in (static/config/serverconfig.json) do (
    If "%%~A"=="serverPort" set /A port=%%~B
    If "%%~A"=="dbPort" set /A dbport=%%~B
)


REM Start H2 server for Rig back-end.

wmic process where "name like '%%java%%'" get commandline,processid | findstr "org.h2.tools.Server"
if %errorlevel% == 0 (
    echo H2 server already running - aborting new server.
) else (
    echo Starting H2 server.
    START /min "Rig back-end server" java -cp "static/app/h2-1.4.197.jar" org.h2.tools.Server -pg -pgPort %dbport%
)


REM Start Node server for Rig front-end.

wmic process where "name like '%%node%%'" get commandline,processid | findstr "build/index.js"
if %errorlevel% == 0 (
    echo Rig server already running - aborting new server.
) else (
    echo Starting Rig server.
    set PORT = %port%
    START /min "Rig front-end server" node build/index.js
)


REM Open app in default browser.

echo Opening app in default browser.
set url=http://localhost:%port%/
START /max "" %url%