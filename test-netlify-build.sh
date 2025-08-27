#!/bin/bash

echo "🧪 Testing Netlify Build Simulation"
echo "=================================="

# Backup current state
echo "📦 Backing up current node_modules..."
if [ -d "node_modules" ]; then
    mv node_modules node_modules_backup
fi

if [ -f "package-lock.json" ]; then
    cp package-lock.json package-lock.json.backup
fi

# Clean start like Netlify
echo "🧹 Cleaning build artifacts..."
rm -rf .next
rm -f package-lock.json

# Use Node 20 like Netlify
echo "🔍 Checking Node version..."
node --version

echo "📥 Fresh npm install (like Netlify)..."
npm install

echo "🔨 Running build..."
npm run build

EXIT_CODE=$?

# Restore if needed
if [ -d "node_modules_backup" ]; then
    echo "🔄 Restoring original node_modules..."
    rm -rf node_modules
    mv node_modules_backup node_modules
fi

if [ -f "package-lock.json.backup" ]; then
    echo "🔄 Restoring original package-lock.json..."
    mv package-lock.json.backup package-lock.json
fi

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Build successful! Should work on Netlify."
else
    echo "❌ Build failed! This is the same error Netlify would see."
    exit 1
fi
