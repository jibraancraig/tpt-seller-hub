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

# Check SSH key status
echo "🔑 SSH Key Status:"
if ssh-add -l | grep -q "id_ed25519"; then
    echo "✅ SSH key is loaded in agent"
else
    echo "⚠️  SSH key not loaded. Run: ssh-add ~/.ssh/id_ed25519"
fi

# Check if SSH key exists
if [ -f ~/.ssh/id_ed25519.pub ]; then
    echo "✅ SSH key exists: $(cat ~/.ssh/id_ed25519.pub | cut -d' ' -f3)"
else
    echo "❌ SSH key not found. Generate one with: ssh-keygen -t ed25519 -C 'your_email@example.com'"
fi

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
    echo "📝 To set up GitHub repository with SSH (Recommended):"
    echo "1. Add SSH key to GitHub:"
    echo "   - Go to https://github.com/settings/keys"
    echo "   - Click 'New SSH key'"
    echo "   - Copy your public key: cat ~/.ssh/id_ed25519.pub"
    echo ""
    echo "2. Create repository on GitHub:"
    echo "   - Go to https://github.com/new"
    echo "   - Name: tpt-seller-hub"
    echo "   - Make it public"
    echo "   - Don't initialize with README, .gitignore, or license"
    echo ""
    echo "3. Add remote and push:"
    echo "   git remote add origin git@github.com:YOUR_USERNAME/tpt-seller-hub.git"
    echo "   git push -u origin main"
    echo ""
    echo "📝 Alternative: Using HTTPS:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/tpt-seller-hub.git"
    echo "   git push -u origin main"
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
echo ""
echo "🔑 SSH Key (copy this to GitHub):"
echo "$(cat ~/.ssh/id_ed25519.pub)"
