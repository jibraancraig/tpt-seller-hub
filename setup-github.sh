#!/bin/bash

echo "🚀 Setting up GitHub repository for TPT Seller Hub"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "static" ]; then
    echo "❌ Error: 'static' directory not found. Please run this script from the EventSphere directory."
    exit 1
fi

echo "✅ Static site found in 'static' directory"
echo ""

# Get current git status
echo "📊 Current Git status:"
git status --short
echo ""

# Check if remote is already configured
if git remote -v | grep -q "origin"; then
    echo "✅ Remote origin already configured:"
    git remote -v
    echo ""
    echo "To push to GitHub, run:"
    echo "  git push -u origin main"
else
    echo "❌ No remote origin configured yet."
    echo ""
    echo "📝 To set up GitHub repository:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a new repository named 'tpt-seller-hub'"
    echo "3. Make it public"
    echo "4. Don't initialize with README, .gitignore, or license"
    echo "5. Copy the repository URL"
    echo ""
    echo "Then run these commands:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/tpt-seller-hub.git"
    echo "  git push -u origin main"
fi

echo ""
echo "🎯 After pushing to GitHub, deploy to Vercel:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Set Root Directory to: static"
echo "4. Leave Build Command empty"
echo "5. Deploy!"
echo ""
echo "📚 See DEPLOYMENT.md for detailed instructions"
