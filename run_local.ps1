# Helper script to run TrafficGuard AI locally on Windows

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "     Starting TrafficGuard AI Local Environment    " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Start Python AI service in background using the virtual environment
Write-Host "[Local] Starting Python AI service on port 8001 (using venv)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend/python-ml; ..\..\.venv\Scripts\python.exe main.py" -WindowStyle Normal

# Wait for Python service to boot (YOLO model loading takes 5-6 seconds)
Start-Sleep -Seconds 8

# 2. Start Node backend in background
Write-Host "[Local] Starting Node Backend on port 5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Normal

# Wait for Node backend to boot
Start-Sleep -Seconds 2

# 3. Start Vite frontend in foreground
Write-Host "[Local] Starting Vite Frontend..." -ForegroundColor Green
npm run dev
