@echo off
echo Sellit Setup Instructions for Windows
echo ====================================
echo.
echo 1. Install MongoDB Community Edition:
echo    - Download from: https://www.mongodb.com/try/download/community
echo    - Choose: Windows x64, MSI installer
echo    - Run the installer and follow the setup wizard
echo    - Choose "Complete" installation
echo.
echo 2. Add MongoDB to PATH (if not done automatically):
echo    - Go to System Properties ^> Advanced ^> Environment Variables
echo    - Under System Variables, find Path and click Edit
echo    - Add: C:\Program Files\MongoDB\Server\7.0\bin
echo    - Click OK to save
echo.
echo 3. Create MongoDB data directory:
echo    - Open Command Prompt as Administrator
echo    - Run: mkdir C:\data\db
echo.
echo 4. Start MongoDB service:
echo    - Open Command Prompt as Administrator
echo    - Run: net start MongoDB
echo.
echo    - OR run MongoDB manually:
echo    - Open Command Prompt
echo    - Run: mongod
echo    - Keep this window open
echo.
echo 5. Test MongoDB connection:
echo    - Open another Command Prompt
echo    - Run: mongo --version
echo.
echo 6. Start Sellit application:
echo    - In the sellit folder, run: npm start
echo.
echo 7. Open browser to: http://localhost:3000
echo.
echo Features:
echo - Register with @ui.edu.ng email
echo - Login and access dashboard
echo - List products for sale
echo - Browse products by category
echo - Contact sellers via WhatsApp
echo - Real-time product updates
echo.
pause