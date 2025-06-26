# PowerShell script to test failed student endpoints with alternative solutions

$API_BASE_URL = "https://staykaru-backend-60ed08adb2a7.herokuapp.com/api"

# Function to get test token
function Get-TestToken {
    try {
        $loginData = @{
            email    = "admin@staykaru.com"
            password = "admin123"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/auth/login" -Method POST -Body $loginData -ContentType "application/json"
        return $response.access_token
    }
    catch {
        Write-Host "❌ Failed to get test token: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Get token
Write-Host "🔧 Getting authentication token..." -ForegroundColor Cyan
$token = Get-TestToken

if (-not $token) {
    Write-Host "❌ Could not get authentication token" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Got authentication token" -ForegroundColor Green

# Headers
$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $token"
}

# Test alternatives for failed endpoints
$failedTests = @(
    @{
        name         = "Update Student Profile"
        alternatives = @(
            @{ method = "PUT"; url = "/profile"; body = @{ name = "Test Student"; phone = "1234567890" } },
            @{ method = "PUT"; url = "/users/profile"; body = @{ name = "Test Student"; phone = "1234567890" } },
            @{ method = "PATCH"; url = "/users/profile"; body = @{ name = "Test Student"; phone = "1234567890" } },
            @{ method = "PUT"; url = "/student/profile"; body = @{ name = "Test Student"; phone = "1234567890" } },
            @{ method = "PATCH"; url = "/student/profile"; body = @{ name = "Test Student"; phone = "1234567890" } }
        )
    },
    @{
        name         = "Search Accommodations"
        alternatives = @(
            @{ method = "GET"; url = "/search/accommodations?query=apartment" },
            @{ method = "GET"; url = "/accommodations/search?query=apartment" },
            @{ method = "GET"; url = "/accommodations?search=apartment" },
            @{ method = "GET"; url = "/accommodations?q=apartment" },
            @{ method = "POST"; url = "/accommodations/search"; body = @{ query = "apartment" } }
        )
    },
    @{
        name         = "Filter Accommodations"
        alternatives = @(
            @{ method = "GET"; url = "/accommodations/filter?type=apartment`&minPrice=100`&maxPrice=500" },
            @{ method = "GET"; url = "/accommodations?type=apartment`&minPrice=100`&maxPrice=500" },
            @{ method = "GET"; url = "/accommodations?filter[type]=apartment`&filter[price][min]=100`&filter[price][max]=500" },
            @{ method = "POST"; url = "/accommodations/filter"; body = @{ type = "apartment"; minPrice = 100; maxPrice = 500 } }
        )
    },
    @{
        name         = "Booking History"
        alternatives = @(
            @{ method = "GET"; url = "/bookings/history" },
            @{ method = "GET"; url = "/bookings?status=history" },
            @{ method = "GET"; url = "/student/bookings" },
            @{ method = "GET"; url = "/bookings/user" },
            @{ method = "GET"; url = "/my/bookings" }
        )
    },
    @{
        name         = "Order History"
        alternatives = @(
            @{ method = "GET"; url = "/orders/history" },
            @{ method = "GET"; url = "/orders?status=history" },
            @{ method = "GET"; url = "/student/orders" },
            @{ method = "GET"; url = "/orders/user" },
            @{ method = "GET"; url = "/my/orders" }
        )
    },
    @{
        name         = "Student Preferences"
        alternatives = @(
            @{ method = "GET"; url = "/preferences" },
            @{ method = "GET"; url = "/user/preferences" },
            @{ method = "GET"; url = "/student/preferences" },
            @{ method = "GET"; url = "/profile/preferences" }
        )
    },
    @{
        name         = "Student Dashboard"
        alternatives = @(
            @{ method = "GET"; url = "/dashboard/student" },
            @{ method = "GET"; url = "/student/dashboard" },
            @{ method = "GET"; url = "/dashboard" },
            @{ method = "GET"; url = "/student/summary" }
        )
    }
)

$workingEndpoints = @()
$stillFailingEndpoints = @()

foreach ($test in $failedTests) {
    Write-Host "`n🔍 Testing $($test.name):" -ForegroundColor Cyan
    $found = $false

    foreach ($alternative in $test.alternatives) {
        try {
            $uri = "$API_BASE_URL$($alternative.url)"
            
            if ($alternative.body) {
                $body = $alternative.body | ConvertTo-Json
                $response = Invoke-RestMethod -Uri $uri -Method $alternative.method -Headers $headers -Body $body -ErrorAction Stop
            }
            else {
                $response = Invoke-RestMethod -Uri $uri -Method $alternative.method -Headers $headers -ErrorAction Stop
            }
            
            Write-Host "✅ $($test.name) -> $($alternative.method) $($alternative.url) (200)" -ForegroundColor Green
            $workingEndpoints += @{
                name     = $test.name
                method   = $alternative.method
                endpoint = $alternative.url
                status   = 200
                body     = $alternative.body
            }
            $found = $true
            break
        }
        catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -ne 404) {
                Write-Host "⚠️ $($test.name) -> $($alternative.method) $($alternative.url) ($statusCode)" -ForegroundColor Yellow
            }
        }
    }

    if (-not $found) {
        Write-Host "❌ $($test.name) -> All alternatives failed" -ForegroundColor Red
        $stillFailingEndpoints += $test.name
    }
}

# Summary
Write-Host "`n🏁 RECOVERY TEST SUMMARY:" -ForegroundColor Cyan
Write-Host "📊 Total Failed Endpoints: $($failedTests.Count)" -ForegroundColor White
Write-Host "✅ Recovered: $($workingEndpoints.Count)" -ForegroundColor Green
Write-Host "❌ Still Failing: $($stillFailingEndpoints.Count)" -ForegroundColor Red
Write-Host "📈 Recovery Rate: $([math]::Round(($workingEndpoints.Count / $failedTests.Count) * 100, 1))%" -ForegroundColor White

if ($workingEndpoints.Count -gt 0) {
    Write-Host "`n🎯 RECOVERED ENDPOINTS:" -ForegroundColor Green
    foreach ($endpoint in $workingEndpoints) {
        Write-Host "✅ $($endpoint.name) -> $($endpoint.method) $($endpoint.endpoint) ($($endpoint.status))" -ForegroundColor Green
    }
}

if ($stillFailingEndpoints.Count -gt 0) {
    Write-Host "`n❌ STILL FAILING:" -ForegroundColor Red
    foreach ($name in $stillFailingEndpoints) {
        Write-Host "❌ $name" -ForegroundColor Red
    }
}

# Export working endpoints to JSON for code use
$workingEndpoints | ConvertTo-Json -Depth 3 | Out-File -FilePath "working_student_endpoints.json" -Encoding UTF8
Write-Host "`n💾 Saved working endpoints to working_student_endpoints.json" -ForegroundColor Green
