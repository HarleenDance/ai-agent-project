@echo off
title AI Agent Launcher

cd /d "%~dp0"

echo.
echo  ==========================================
echo       AI Agent - One Click Start
echo  ==========================================
echo.
echo  Project Dir: %cd%
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js not found!
    echo  Download: https://nodejs.org/
    pause
    exit /b 1
)
echo  [OK] Node.js:
node -v
echo.

:: Check project structure
if not exist "server\package.json" (
    echo  [ERROR] server\package.json not found!
    pause
    exit /b 1
)
if not exist "webs\package.json" (
    echo  [ERROR] webs\package.json not found!
    pause
    exit /b 1
)

:: Install backend deps
echo  [1/4] Check backend deps...
if not exist "server\node_modules\" (
    echo        Installing backend deps...
    pushd server
    call npm install
    popd
    echo        Done.
) else (
    echo        Already installed, skip.
)
echo.

:: Install frontend deps
echo  [2/4] Check frontend deps...
if not exist "webs\node_modules\" (
    echo        Installing frontend deps...
    pushd webs
    call npm install
    popd
    echo        Done.
) else (
    echo        Already installed, skip.
)
echo.

:: Start backend
echo  [3/4] Starting backend (Port 3000)...
start "AI-Agent-Backend" cmd /k "cd /d "%~dp0server" && node app.js"
echo        Backend window opened.
echo.

timeout /t 3 /nobreak >nul

:: Start frontend
echo  [4/4] Starting frontend (Vite)...
start "AI-Agent-Frontend" cmd /k "cd /d "%~dp0webs" && npm run dev"
echo        Frontend window opened.
echo.

echo  ==========================================
echo       All services started!
echo  ==========================================
echo.
echo     Backend:  http://localhost:3000
echo     Frontend: http://localhost:5173
echo.
echo  Check the two new windows for logs:
echo    - AI-Agent-Backend
echo    - AI-Agent-Frontend
echo.
echo  Close those windows to stop services.
echo  ==========================================
echo.
pause
