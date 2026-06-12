#!/bin/sh
set -e

# Diagnostics
echo "[Diagnostics] --- Deployment Startup Diagnostics ---"
echo "[Diagnostics] Target PORT (from env): ${PORT:-5000}"
echo "[Diagnostics] Python AI service target URL: http://127.0.0.1:8001"
echo "[Diagnostics] Node Backend Server expected URL: http://0.0.0.0:${PORT:-5000}"
echo "[Diagnostics] Current working directory: $(pwd)"
echo "[Diagnostics] -------------------------------------"

# Trap exits and signals to clean up all background jobs (including Python service)
trap 'echo "[Monitor] Cleaning up background processes..."; kill $(jobs -p) 2>/dev/null || true' EXIT INT TERM

# Run Python AI service in a monitoring loop on port 8001 in the background
(
  while true; do
    echo "[Monitor] Starting Python AI service on port 8001..."
    python3 backend/python-ml/main.py
    echo "[Monitor] Python AI service exited with status $?. Restarting in 2 seconds..."
    sleep 2
  done
) &

PYTHON_MONITOR_PID=$!

# Wait for Python AI service to start listening on 127.0.0.1:8001
echo "[Monitor] Waiting for Python AI service to start listening on 127.0.0.1:8001..."
max_attempts=30
attempt=0
python_ready=0

while [ $attempt -lt $max_attempts ]; do
  # Perform a silent check. If uvicorn is up, it will reply (even if 404, connection succeeds).
  if curl -s -o /dev/null http://127.0.0.1:8001/; then
    echo "[Monitor] Python AI service is successfully listening on port 8001!"
    python_ready=1
    break
  fi
  
  # Verify if our background loop/python is still alive
  if ! kill -0 $PYTHON_MONITOR_PID 2>/dev/null; then
    echo "[Monitor] Python background process group has died."
    exit 1
  fi
  
  attempt=$((attempt + 1))
  echo "[Monitor] Python AI service not ready yet (attempt $attempt/$max_attempts). Retrying in 1 second..."
  sleep 1
done

if [ $python_ready -ne 1 ]; then
  echo "[Monitor] Python AI service failed to start on port 8001 within 30 seconds."
  exit 1
fi

# Start Node backend as the primary foreground process
echo "[Monitor] Starting Node backend on port ${PORT:-5000}..."
node backend/server.js
