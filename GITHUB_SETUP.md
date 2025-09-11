# GitHub + Firebase Hosting Auto-Deployment Setup

This guide will help you set up automatic deployment from GitHub to Firebase Hosting.

## 🚀 Quick Setup Steps

### Step 1: Create GitHub Repository

1. **Go to [GitHub](https://github.com) and create a new repository:**
   - Repository name: `focus-challenge` (or your preferred name)
   - Description: "Focus Challenge - A React/Firebase app for Islamic personal development"
   - Make it **Public** or **Private** (your choice)
   - **DON'T** initialize with README, .gitignore, or license (we already have these)
   - Click **"Create repository"**

### Step 2: Connect Local Repository to GitHub

Run these commands in your terminal:

```bash
# Add GitHub remote (replace 'your-username' with your actual GitHub username)
git remote add origin https://github.com/your-username/focus-challenge.git

# Push your code to GitHub
git push -u origin main
```

### Step 3: Set up Firebase Hosting with GitHub Actions

```bash
# This will set up automatic deployment
firebase init hosting:github --project focus-challenge2
```

When prompted:
- **Repository format**: `your-username/focus-challenge`
- **Deploy on merge**: Yes (for main branch)
- **Deploy on PR**: Yes (for preview deployments)

## 🔧 What This Setup Includes

### GitHub Actions Workflows
Two workflow files have been created:

1. **`.github/workflows/firebase-hosting-merge.yml`**
   - Triggers on push to `main` branch
   - Builds and deploys to live Firebase Hosting

2. **`.github/workflows/firebase-hosting-pull-request.yml`**
   - Triggers on pull requests
   - Creates preview deployments for testing

### Automatic Deployment Process
1. **Push to GitHub** → Triggers GitHub Action
2. **Install Dependencies** → `npm ci`
3. **Build Project** → `npm run build`
4. **Deploy to Firebase** → Live at `https://focus-challenge2.web.app`

## 🔑 Firebase Service Account

Firebase will automatically:
- Create a service account for your project
- Add it as a GitHub secret (`FIREBASE_SERVICE_ACCOUNT_FOCUS_CHALLENGE2`)
- Configure secure deployment access

## 🌐 Live URLs

- **Production**: https://focus-challenge2.web.app
- **Preview**: Generated automatically for pull requests

## 📝 Development Workflow

1. **Make changes** to your code
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. **Automatic deployment** happens within 2-3 minutes
4. **Check your live site** at https://focus-challenge2.web.app

## 🛠️ Commands Reference

```bash
# Check deployment status
firebase projects:list

# View hosting info
firebase hosting:sites:list

# Manual deployment (if needed)
npm run build
firebase deploy --only hosting

# View logs
firebase functions:log
```

## 🔒 Security Notes

- Firebase service account is securely stored in GitHub Secrets
- Only authorized GitHub users can trigger deployments
- All builds happen in isolated GitHub Actions runners

## 🎉 You're All Set!

Once you complete the setup, every push to your main branch will automatically update your live website. No more manual deployments needed!

---

**Need Help?** 
- Firebase Console: https://console.firebase.google.com/project/focus-challenge2
- GitHub Actions: Check the "Actions" tab in your repository
- Live App: https://focus-challenge2.web.app