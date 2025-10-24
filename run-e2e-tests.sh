#!/bin/bash
set -e

echo "🧹 Cleaning .next directory..."
find .next -user root -exec sudo rm -rf {} + 2>/dev/null || true

echo "🔨 Building production..."
npm run build

echo "🚀 Starting production server on port 3004..."
PORT=3004 npm start &
SERVER_PID=$!

echo "⏳ Waiting for server to be ready..."
sleep 5

echo "🧪 Running Cypress tests..."
npm run test:e2e

echo "🛑 Stopping server..."
kill $SERVER_PID

echo "✅ Done!"
