<#
PowerShell helper to install dependencies, build frontend, and run backend + frontend preview.
Usage (from project root):
  PowerShell -ExecutionPolicy Bypass -File .\scripts\run_all.ps1
#>

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Output "Project root: $root"

function Run-Command($cmd, $cwd) {
  Push-Location $cwd
  Write-Output "-> $cmd (cwd: $cwd)"
  & cmd /c $cmd
  <#
  PowerShell helper to install dependencies, build frontend, and run backend + frontend preview.
  Usage (from project root):
    PowerShell -ExecutionPolicy Bypass -File .\scripts\run_all.ps1
  #>

  $root = Split-Path -Parent $MyInvocation.MyCommand.Path
  Write-Output "Project root: $root"

  function Run-Command($cmd, $cwd) {
    Push-Location $cwd
    Write-Output "-> $cmd (cwd: $cwd)"
    & cmd /c $cmd
    $code = $LASTEXITCODE
    Pop-Location
    if ($code -ne 0) {
      throw "Command failed: $cmd (exit $code)"
    }
  }

  try {
    # 1) Install frontend deps (try normal, then fallback to legacy-peer-deps)
    Write-Output "Installing frontend dependencies..."
    Push-Location $root
    & npm install
    if ($LASTEXITCODE -ne 0) {
      Write-Output "npm install failed; retrying with --legacy-peer-deps..."
      & npm install --legacy-peer-deps
      if ($LASTEXITCODE -ne 0) { throw "Failed to install frontend dependencies." }
    }
    Pop-Location

    # 2) Install backend deps
    Write-Output "Installing backend dependencies..."
    $backendDir = Join-Path $root 'backend'
    Push-Location $backendDir
    & npm install
    if ($LASTEXITCODE -ne 0) { throw "Failed to install backend dependencies." }
    Pop-Location

    # 3) Build frontend
    Write-Output "Building frontend (production)..."
    Push-Location $root
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }
    Pop-Location

    # 4) Start backend and frontend preview in new terminals
    Write-Output "Starting backend (npm run start) in a new terminal..."
    Start-Process -FilePath cmd.exe -ArgumentList '/c','npm run start' -WorkingDirectory $backendDir -WindowStyle Normal

    Start-Sleep -Seconds 1

    Write-Output "Starting frontend preview (npm run preview) in a new terminal..."
    Start-Process -FilePath cmd.exe -ArgumentList '/c','npm run preview' -WorkingDirectory $root -WindowStyle Normal

    Write-Output "All done. Backend: http://localhost:3003    Frontend preview: http://localhost:4173 (or dev: http://localhost:3000 if you run dev)"
  } catch {
    Write-Error "ERROR: $_"
    exit 1
  }
