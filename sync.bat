@echo off
cd /d "%~dp0"
echo [1/3] Building content.json...
node build.js
if errorlevel 1 (
    echo BUILD FAILED
    pause
    exit /b 1
)
echo [2/3] Staging changes...
git add content.json
echo [3/3] Committing and pushing...
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Update briefing content %date% %time:~0,5%"
    git push
    echo DONE - site will update in ~1 minute.
) else (
    echo No changes to push.
)