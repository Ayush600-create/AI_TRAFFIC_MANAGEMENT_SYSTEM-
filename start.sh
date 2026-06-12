#!/bin/sh
set -e

# Trap exits and signals to clean up all background jobs (including Python service)
trap 'echo "[Monitor] Cleaning up background processes..."; kill $(jobs -p) 2>/dev/null' EXIT INT TERM

# Run Python AI service in a monitoring loop on port 8001
# If the Python service fails, it will log the error and restart after 2 seconds
while true; do
  echo "[Monitor] Starting Python AI service on port 8001..."
  PORT=8001 python3 backend/python-ml/main.py
  echo "[Monitor] Python AI service exited with status $?. Restarting in 2 seconds..."
  sleep 2
done &

# Start Node backend as the primary foreground process (exposes port 5000)
echo "[Monitor] Starting Node backend..."
node backend/server.js
