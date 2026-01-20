#!/bin/bash

# Real Estate App Deployment Helper
# This script will build your frontend and guide you through deployment.

echo "=========================================="
echo "🚀 Real Estate App Deployment Helper"
echo "=========================================="

# 1. Frontend Build Verification
echo ""
echo "📦 Step 1: Building Frontend (Web)..."
cd frontend || exit
npm run build:web

if [ $? -eq 0 ]; then
    echo "✅ Frontend Build Success! (Artifacts in frontend/dist)"
else
    echo "❌ Frontend Build Failed. Please check errors above."
    exit 1
fi

cd ..

# 2. Backend Verification
echo ""
echo "📦 Step 2: Checking Backend Configuration..."
if [ -f "backend/Procfile" ] && [ -f "backend/requirements.txt" ]; then
    echo "✅ Backend Configured (Procfile & requirements.txt found)"
else
    echo "⚠️  Missing Backend Configuration. Please assume standard Python setup."
fi

# 3. Deployment Instructions
echo ""
echo "=========================================="
echo "🚀 READY TO DEPLOY"
echo "=========================================="
echo ""
echo "🔹 OPTION A: Deploy Frontend to Vercel (Recommended)"
echo "   Run the following command in terminal:"
echo "   cd frontend && npx vercel deploy --prod"
echo ""
echo "🔹 OPTION B: Deploy Backend to Render"
echo "   1. Push this code to GitHub."
echo "   2. Allow Render to access the 'backend' folder."
echo "   3. It will auto-detect the Procfile."
echo ""
echo "=========================================="
