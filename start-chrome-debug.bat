@echo off
REM Abre Chrome Stable con control remoto (CDP) en el puerto 9222.
REM Perfil dedicado: Chrome 136+ ignora --remote-debugging-port en el perfil por defecto.
setlocal
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" (
  echo No se encontro chrome.exe en Program Files.
  exit /b 1
)
set "PROFILE=C:\ghl-profile"
set "PORT=9222"
if not exist "%PROFILE%" mkdir "%PROFILE%"
start "" "%CHROME%" --remote-debugging-port=%PORT% --user-data-dir="%PROFILE%" --no-first-run --no-default-browser-check --new-window "%~1"
echo Chrome lanzado. Perfil: %PROFILE%  Puerto: %PORT%
