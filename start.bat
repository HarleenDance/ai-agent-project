@echo off
title AI Agent 启动脚本

echo ==========================================
echo    AI Agent 系统正在启动...
echo ==========================================

:: 1. 启动后端服务器
echo [1/2] 正在准备后端服务 (Port: 3000)...
pushd server

:: 检查 node_modules
if not exist "node_modules\" (
    echo 正在安装后端依赖...
    call npm install
)

:: 在新窗口启动后端
start "AI-Agent-Backend" cmd /k "npm start"
popd
echo 后端启动指令已发出。

:: 2. 启动前端页面
echo [2/2] 正在准备前端页面 (Vite)...
pushd webs

:: 检查 node_modules
if not exist "node_modules\" (
    echo 正在安装前端依赖...
    call npm install
)

:: 在新窗口启动前端
start "AI-Agent-Frontend" cmd /k "npm run dev"
popd
echo 前端启动指令已发出。

echo ==========================================
echo    系统启动指令已全量发出！
echo    - 后端地址: http://localhost:3000
echo    - 前端地址: http://localhost:5173 (通常)
echo ==========================================
echo 请检查弹出的两个新窗口查看运行日志。
pause
