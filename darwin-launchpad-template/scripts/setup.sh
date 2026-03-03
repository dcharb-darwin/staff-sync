#!/bin/bash
# Darwin Launchpad — Project Setup
# Run this after cloning the template to initialize the project.

set -euo pipefail

echo "🚀 Setting up Darwin project..."

# Create data directory for SQLite
mkdir -p data

# Install dependencies
if [ -f "package-lock.json" ]; then
  echo "📦 Installing dependencies (npm ci)..."
  npm ci
else
  echo "📦 Installing dependencies (npm install)..."
  npm install
fi

echo "✅ Setup complete. Run 'npm run dev' to start."
