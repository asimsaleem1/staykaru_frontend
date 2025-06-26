# StayKaru Frontend Setup Script for Expo

Write-Host "🚀 Setting up StayKaru Frontend with Expo..." -ForegroundColor Green

# Check if Expo CLI is installed
try {
    expo --version | Out-Null
    Write-Host "✅ Expo CLI is already installed" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Expo CLI globally..." -ForegroundColor Yellow
    npm install -g expo-cli
}

# Install Node.js dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Green
npm install

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Yellow
Write-Host "1. Install Expo Go app on your mobile device"
Write-Host "2. Run 'npm start' to start the development server"
Write-Host "3. Scan the QR code with Expo Go (Android) or Camera (iOS)"
Write-Host ""
Write-Host "📱 Development commands:" -ForegroundColor Cyan
Write-Host "• npm start       - Start Expo development server"
Write-Host "• npm run android - Open Android simulator"
Write-Host "• npm run ios     - Open iOS simulator (macOS only)"
Write-Host "• npm run web     - Open in web browser"
Write-Host ""
Write-Host "📚 For detailed setup instructions, check README.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your StayKaru app is ready for development with Expo Go!" -ForegroundColor Green
