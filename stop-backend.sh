#!/bin/bash

if [ -f backend.pid ]; then
  PID=$(cat backend.pid)
  echo "🛑 Deteniendo backend (PID $PID)..."
  kill $PID
  rm backend.pid
else
  echo "❌ No se encontró backend corriendo."
fi

