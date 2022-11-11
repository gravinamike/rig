

REM Change to the directory of the repo.

cd /D "%~dp0"
cd ../../


REM Start H2 server for Rig back-end.

wmic process where "name like '%%java%%'" get commandline,processid | findstr "org.h2.tools.Server"
if %errorlevel% == 0 (
    echo H2 server already running - aborting new server.
) else (
    echo Starting H2 server.
    START /min "Rig back-end server" java -cp "static/app/h2-1.4.197.jar" org.h2.tools.Server -pg
)


REM Start Node server for Rig front-end.

wmic process where "name like '%%node%%'" get commandline,processid | findstr "build/index.js"
if %errorlevel% == 0 (
    echo Rig server already running - aborting new server.
) else (
    echo Starting Rig server.
    START /min "Rig front-end server" node build/index.js
)


REM Open app in default browser.

echo Opening app in default browser.
START "" http://localhost:3000/