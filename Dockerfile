# Build Stage for Frontend
FROM node:20-slim AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Final Stage
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    libsm6 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

# Copy backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy python requirements
COPY backend/python-ml/requirements.txt ./backend/python-ml/
RUN pip install --no-cache-dir -r backend/python-ml/requirements.txt

# Copy built frontend
COPY --from=build-frontend /app/dist ./dist

# Copy the rest of the application
COPY . .

# Ensure directories exist for storage
RUN mkdir -p backend/uploads backend/frames backend/violations

# Copy start script and make it executable
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose the port (Render default)
EXPOSE 5000

# Environment variables
ENV PORT=5000
ENV PYTHON_AI_SERVICE_URL=http://localhost:8001

# Start script: run Python AI engine and backend server together
CMD ["./start.sh"]
