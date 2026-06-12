#!/bin/sh
set -e

# Diagnostics
echo "[Diagnostics] --- Deployment Startup Diagnostics ---"
echo "[Diagnostics] Target PORT (from env): ${PORT:-5000}"
echo "[Diagnostics] Python AI service target URL: http://127.0.0.1:8001"
echo "[Diagnostics] Node Backend Server expected URL: http://0.0.0.0:${PORT:-5000}"
echo "[Diagnostics] Current working directory: $(pwd)"
echo "[Diagnostics] -------------------------------------"

echo "[Monitor] Starting Python AI service in background..."
# Run Python service from its correct directory so that relative imports and ASGI imports resolve correctly
(cd backend/python-ml && python3 main.py) &

# Wait briefly for startup
echo "[Monitor] Waiting 10 seconds for Python startup..."
sleep 10

# Start Node backend as the primary foreground process
echo "[Monitor] Starting Node backend on port ${PORT:-5000}..."
exec node backend/server.js
