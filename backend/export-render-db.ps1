# Export Render DB and Import to Local DB
# This script safely exports data from Render and imports to local PostgreSQL

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  Export Render DB → Import Local DB" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for Render credentials securely
Write-Host "Enter your Render External Database URL:" -ForegroundColor Yellow
Write-Host "(Format: postgresql://user:password@host:5432/database)" -ForegroundColor Gray
$renderUrl = Read-Host -AsSecureString "Render DB URL" | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }

if (-not $renderUrl -or -not $renderUrl.StartsWith("postgresql://")) {
    Write-Host "Error: Invalid PostgreSQL URL format" -ForegroundColor Red
    exit 1
}

# Parse the URL
$url = [System.Uri]$renderUrl
$renderUser = $url.UserInfo.Split(':')[0]
$renderPass = $url.UserInfo.Split(':')[1]
$renderHost = $url.Host
$renderPort = if ($url.Port -eq -1) { 5432 } else { $url.Port }
$renderDb = $url.AbsolutePath.TrimStart('/')

Write-Host ""
Write-Host "Parsed connection details:" -ForegroundColor Green
Write-Host "  Host: $renderHost" -ForegroundColor Gray
Write-Host "  Port: $renderPort" -ForegroundColor Gray
Write-Host "  Database: $renderDb" -ForegroundColor Gray
Write-Host "  Username: $renderUser" -ForegroundColor Gray
Write-Host ""

$backupFile = "render_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

Write-Host "Step 1: Exporting from Render..." -ForegroundColor Cyan
$env:PGPASSWORD = $renderPass
try {
    pg_dump -h $renderHost -p $renderPort -U $renderUser -d $renderDb --no-owner --no-privileges -f $backupFile 2>&1
    if ($LASTEXITCODE -ne 0) { throw "pg_dump failed" }
    Write-Host "✅ Export complete: $backupFile" -ForegroundColor Green
} catch {
    Write-Host "❌ Export failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Importing to local database..." -ForegroundColor Cyan

# Local DB credentials (from .env)
$localUser = "sovereon"
$localPass = "@Qwe@123"
$localDb = "sovereon"
$localHost = "localhost"
$localPort = "5432"

# Clear local database first
Write-Host "  Clearing local database..." -ForegroundColor Gray
$env:PGPASSWORD = $localPass
psql -U postgres -h $localHost -c "DROP DATABASE IF EXISTS $localDb WITH (FORCE); CREATE DATABASE $localDb OWNER $localUser;" 2>&1 | Out-Null

# Import data
Write-Host "  Importing data..." -ForegroundColor Gray
try {
    $env:PGPASSWORD = $localPass
    psql -U $localUser -h $localHost -p $localPort -d $localDb -f $backupFile 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "psql import failed" }
    Write-Host "✅ Import complete!" -ForegroundColor Green
} catch {
    Write-Host "❌ Import failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  ✅ Database sync complete!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your local database now has the Render data." -ForegroundColor White
Write-Host "Backup saved as: $backupFile" -ForegroundColor Gray
Write-Host ""
Write-Host "To verify, run:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  npm run dev" -ForegroundColor Gray
