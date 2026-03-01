# Exécute les migrations RLS sur Supabase
# 1. Ouvre un terminal et lance: npx supabase login
# 2. Une fois connecté, exécute ce script

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Liaison au projet Supabase..." -ForegroundColor Cyan
npx supabase link --project-ref loegnuaklxacxfkjcvdr

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nApplication des migrations RLS..." -ForegroundColor Cyan
    npx supabase db push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nRLS activé avec succès!" -ForegroundColor Green
    } else {
        Write-Host "`nErreur lors du push des migrations." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`nConnexion requise. Lance d'abord: npx supabase login" -ForegroundColor Yellow
    exit 1
}
