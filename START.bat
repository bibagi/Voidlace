@echo off
echo ========================================
echo Voidlace - Reading App
echo ========================================
echo.
echo Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)
echo Starting development server...
call npm run dev
pause
