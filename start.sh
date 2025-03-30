#!/bin/bash

# Navega al backend y arranca en background
echo "🚀 Iniciando backend..."
cd backend
nohup node server.js > backend.log 2>&1 &

# Guarda el PID para parar después si quieres
echo $! > ../backend.pid

# Navega al frontend y arranca en foreground
echo "🌐 Iniciando frontend..."
cd ../frontend
npm start

