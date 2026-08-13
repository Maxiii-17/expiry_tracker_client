@echo off
title Expiry Tracker - CLIENT APP
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0serve_demo.ps1"
pause