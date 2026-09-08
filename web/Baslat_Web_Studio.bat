@echo off
title GNSS Pos Web Studio - Local Server
echo ========================================================
echo GNSS Pos Web Studio v2.0 Baslatiliyor...
echo ========================================================
echo Tarayici aciliyor: http://localhost:8080
start http://localhost:8080
python -m http.server 8080
pause
