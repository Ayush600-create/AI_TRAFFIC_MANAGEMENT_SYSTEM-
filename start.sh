#!/bin/sh
set -e

python3 backend/python-ml/main.py &
PYTHON_PID=$!

trap 'kill -- -$PYTHON_PID 2>/dev/null' EXIT

node backend/server.js
