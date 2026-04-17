@echo off
CHCP 65001 > nul
title AI Agent 系统一键启动脚本

echo ==========================================
echo    🚀 AI Agent 系统正在启动...
echo ==========================================

:: 获取当前目录
set ROOT_DIR=%~dp0

:: 1. 启动后端服务器
echo [1/2] 正在准备后端服务 (Port: 3000)...
cd /d "%ROOT_DIR%server"

:: 检查 node_modules
if not exist "node_modules\" (
    echo 📦 正在安装后端依赖...
    call npm install
)

:: 在新窗口启动后端
start "AI-Agent-Backend" cmd /k "npm start"
echo ✅ 后端启动指令已发出。

:: 2. 启动前端页面
echo [2/2] 正在准备前端页面 (Vite Dev Server)...
cd /d "%ROOT_DIR%webs"

:: 检查 node_modules
if not exist "node_modules\" (
    echo 📦 正在安装前端依赖...
    call npm install
)

:: 在新窗口启动前端
start "AI-Agent-Frontend" cmd /k "npm run dev"
echo ✅ 前端启动指令已发出。

echo ==========================================
echo    🎉 系统启动完成！
echo    - 后端地址: http://localhost:3000
echo    - 前端地址: 请查看前端窗口输出 (通常为 http://localhost:5173)
echo ==========================================
echo 按任意键关闭此窗口...
pause > nul
