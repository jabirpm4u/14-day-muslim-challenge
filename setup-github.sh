#!/bin/bash

# Setup script for GitHub repository and Firebase hosting deployment

echo "🚀 Setting up GitHub repository and Firebase hosting deployment..."
echo ""

# Repository name
REPO_NAME="14-day-muslim-challenge"
GITHUB_USERNAME="jabirpm4u"  # Change this to your GitHub username

echo "📁 Repository: $GITHUB_USERNAME/$REPO_NAME"
echo ""

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found. Creating repository..."
    
    # Create GitHub repository
    gh repo create $REPO_NAME --public --description "14-Day Proud Muslim Challenge - A React/Firebase app for Islamic personal development"
    
    # Add remote origin
    git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git
    
    # Push to GitHub
    git branch -M main
    git push -u origin main
    
    echo "✅ Repository created and code pushed to GitHub!"
    echo ""
    
    # Now set up Firebase hosting with GitHub Actions
    echo "🔧 Setting up Firebase hosting deployment..."
    firebase init hosting:github --project focus-challenge2
    
else
    echo "❌ GitHub CLI not found. Please install it first:"
    echo "   brew install gh"
    echo ""
    echo "Or create the repository manually:"
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Make it public"
    echo "4. Don't initialize with README/gitignore"
    echo "5. Create repository"
    echo ""
    echo "Then run these commands:"
    echo "   git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo "   firebase init hosting:github --project focus-challenge2"
fi

echo ""
echo "🎉 Setup complete! Your app will now auto-deploy to Firebase on every push to main branch."
echo "🌐 Live URL: https://focus-challenge2.web.app"