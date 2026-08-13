@echo off
title Expiry Tracker - Demo
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0serve_demo.ps1"
pause