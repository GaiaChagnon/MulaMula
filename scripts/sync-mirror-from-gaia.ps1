# Makes your local main (and by default your Rika52 remote) match GaiaChagnon/MulaMula exactly.
# WARNING: Discards local commits on main that are not on gaia/main.
$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $RepoRoot

Write-Host "Fetching gaia (GaiaChagnon/MulaMula)..."
git fetch gaia
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Resetting main to gaia/main..."
git checkout main
git reset --hard gaia/main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Pushing to origin (your mirror, e.g. Rika52/mulamula)..."
git push origin main --force
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. origin/main should match gaia/main."
