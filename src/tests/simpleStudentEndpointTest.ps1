# Simple Student Endpoint Test - PowerShell

$API_BASE_URL = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"

Write-Host "🔧 Testing student endpoints..." -ForegroundColor Cyan

# Get token first
$loginData = '{"email":"admin@staykaru.com","password":"admin123"}'

try {
    $response = Invoke-RestMethod -Uri "$API_BASE_URL/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    $token = $response.access_token
    Write-Host "✅ Got authentication token" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to get token" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# Test basic endpoints
$endpoints = @(
    @{ name = "User Profile"; method = "GET"; url = "/users/profile" },
    @{ name = "User Preferences"; method = "GET"; url = "/user/preferences" },
    @{ name = "Student Preferences"; method = "GET"; url = "/student/preferences" },
    @{ name = "Profile Preferences"; method = "GET"; url = "/profile/preferences" },
    @{ name = "Dashboard"; method = "GET"; url = "/dashboard" },
    @{ name = "Student Dashboard"; method = "GET"; url = "/student/dashboard" },
    @{ name = "Dashboard Student"; method = "GET"; url = "/dashboard/student" },
    @{ name = "Accommodations Search"; method = "GET"; url = "/accommodations/search" },
    @{ name = "Accommodations Filter"; method = "GET"; url = "/accommodations/filter" },
    @{ name = "Student Bookings"; method = "GET"; url = "/student/bookings" },
    @{ name = "Bookings User"; method = "GET"; url = "/bookings/user" },
    @{ name = "My Bookings"; method = "GET"; url = "/my/bookings" },
    @{ name = "Student Orders"; method = "GET"; url = "/student/orders" },
    @{ name = "Orders User"; method = "GET"; url = "/orders/user" },
    @{ name = "My Orders"; method = "GET"; url = "/my/orders" }
)

$working = @()
$failed = @()

foreach ($endpoint in $endpoints) {
    try {
        $uri = "$API_BASE_URL$($endpoint.url)"
        $response = Invoke-RestMethod -Uri $uri -Method $endpoint.method -Headers $headers -ErrorAction Stop
        Write-Host "✅ $($endpoint.name) -> $($endpoint.url)" -ForegroundColor Green
        $working += $endpoint
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ $($endpoint.name) -> $($endpoint.url) ($statusCode)" -ForegroundColor Red
        $failed += $endpoint
    }
}

Write-Host "`n📊 RESULTS:" -ForegroundColor Cyan
Write-Host "✅ Working: $($working.Count)" -ForegroundColor Green
Write-Host "❌ Failed: $($failed.Count)" -ForegroundColor Red

if ($working.Count -gt 0) {
    Write-Host "`n🎯 WORKING ENDPOINTS:" -ForegroundColor Green
    foreach ($ep in $working) {
        Write-Host "✅ $($ep.name) -> $($ep.method) $($ep.url)" -ForegroundColor Green
    }
}

# Save working endpoints
$working | ConvertTo-Json -Depth 2 | Out-File -FilePath "simple_working_endpoints.json" -Encoding UTF8
Write-Host "`n💾 Saved working endpoints to simple_working_endpoints.json" -ForegroundColor Green
