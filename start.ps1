# StayKaru Frontend - Quick Start Guide

Write-Host "🚀 StayKaru Frontend - Starting Application..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the staykaru_frontend directory." -ForegroundColor Red
    exit 1
}

Write-Host "📋 System Information:" -ForegroundColor Yellow
Write-Host "  • Backend API: https://staykaru-backend-60ed08adb2a7.herokuapp.com/api" -ForegroundColor White
Write-Host "  • Authentication: Simplified (Email/Password only)" -ForegroundColor White
Write-Host "  • Features: Role-based dashboards, Immediate login after registration" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencies ready" -ForegroundColor Green
Write-Host ""

Write-Host "🧪 Testing API connectivity..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api/auth/health" -Method GET -ErrorAction SilentlyContinue | Out-Null
    Write-Host "✅ Backend API is accessible" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Backend API check failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Starting StayKaru Frontend..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Test Credentials:" -ForegroundColor Yellow
Write-Host "  Student: test@example.com / password123" -ForegroundColor White
Write-Host "  (Registration also works with immediate login)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Application starting... Press Ctrl+C to stop" -ForegroundColor Green
Write-Host ""

# Start the Expo development server
npm start
