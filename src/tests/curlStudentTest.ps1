# Student Endpoint Test using curl
# Run this from PowerShell

$API_BASE_URL = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"

Write-Host "Getting authentication token..." -ForegroundColor Yellow

# Get token using curl
$loginResponse = curl -s -X POST "$API_BASE_URL/auth/login" -H "Content-Type: application/json" -d '{"email":"admin@staykaru.com","password":"admin123"}'

if ($LASTEXITCODE -eq 0) {
    $loginData = $loginResponse | ConvertFrom-Json
    $token = $loginData.access_token
    Write-Host "✅ Got token" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to get token" -ForegroundColor Red
    exit 1
}

# Test endpoints
$endpoints = @(
    "/users/profile",
    "/user/preferences", 
    "/student/preferences",
    "/profile/preferences",
    "/dashboard",
    "/student/dashboard",
    "/dashboard/student",
    "/accommodations/search",
    "/accommodations/filter",
    "/student/bookings",
    "/bookings/user",
    "/my/bookings",
    "/student/orders",
    "/orders/user",
    "/my/orders",
    "/preferences",
    "/student/summary",
    "/analytics/student",
    "/student/analytics"
)

$working = @()
$failed = @()

Write-Host "`nTesting endpoints..." -ForegroundColor Yellow

foreach ($endpoint in $endpoints) {
    $url = "$API_BASE_URL$endpoint"
    
    # Test with curl
    $response = curl -s -w "%{http_code}" -H "Authorization: Bearer $token" "$url"
    $httpCode = $response[-3..-1] -join ""
    
    if ($httpCode -eq "200") {
        Write-Host "✅ $endpoint" -ForegroundColor Green
        $working += $endpoint
    }
    else {
        Write-Host "❌ $endpoint ($httpCode)" -ForegroundColor Red
        $failed += $endpoint
    }
    
    Start-Sleep -Milliseconds 200  # Small delay between requests
}

Write-Host "`n📊 SUMMARY:" -ForegroundColor Cyan
Write-Host "Total tested: $($endpoints.Count)" -ForegroundColor White
Write-Host "Working: $($working.Count)" -ForegroundColor Green  
Write-Host "Failed: $($failed.Count)" -ForegroundColor Red
Write-Host "Success rate: $([math]::Round(($working.Count / $endpoints.Count) * 100, 1))%" -ForegroundColor White

if ($working.Count -gt 0) {
    Write-Host "`n🎯 WORKING ENDPOINTS:" -ForegroundColor Green
    foreach ($ep in $working) {
        Write-Host "✅ GET $ep" -ForegroundColor Green
    }
    
    # Save to file
    $working | Out-File -FilePath "working_student_endpoints.txt" -Encoding UTF8
    Write-Host "`n💾 Saved working endpoints to working_student_endpoints.txt" -ForegroundColor Green
}
