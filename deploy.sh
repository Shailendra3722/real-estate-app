#!/bin/bash

# Real Estate Wala Bhai - Deployment Auto-Script 🚀

echo "=========================================="
echo "    REAL ESTATE WALA BHAI - DEPLOYER"
echo "=========================================="

# 1. Check for Backend Docker
echo ""
echo "backend: Checking Docker..."
if ! command -v docker &> /dev/null
then
    echo "⚠️  Docker could not be found. Please install Docker Desktop to build the backend."
else
    echo "✅ Docker found."
    echo "backend: Building Container..."
    cd backend
    docker build -t real-estate-wala-backend .
    echo "✅ Backend Container Built: real-estate-wala-backend"
    cd ..
fi

# 2. Frontend Web Build
echo ""
echo "frontend: Building Web Bundle..."
cd frontend
if ! command -v vercel &> /dev/null
then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "frontend: exporting..."
npx expo export -p web

echo "frontend: deploying to Vercel..."
# checking login status
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  You are not logged in to Vercel."
    echo "👉 Please log in in the browser window that opens..."
    vercel login
fi

# Deploying the 'dist' folder directly ensures we skip the failing remote build step
vercel deploy dist --prod
echo "✅ Web Deployed!"


# 3. Mobile Build (Expo)
echo ""
echo "mobile: Checking Expo Login..."
npx expo whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  You are not logged in to Expo."
    echo "👉 Please log in now:"
    npx expo login
fi

echo "mobile: Triggering Cloud Builds (EAS)..."

# Check for EAS CLI
if ! command -v eas &> /dev/null
then
    echo "⚠️  EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

echo "Do you want to build Android & iOS now? (y/n)"
read build_mobile
if [ "$build_mobile" == "y" ]; then
    # Automatic EAS Project Creation
    echo "Initializing EAS Project..."
    eas init
    
    eas build -p android --profile production
    eas build -p ios --profile production
    echo "✅ Mobile Builds Triggered check expo.dev dashboard."
else
    echo "ℹ️  Skipping Mobile Build."
fi

echo ""
echo "=========================================="
echo "       🚀 MISSION ACCOMPLISHED 🚀"
echo "=========================================="
