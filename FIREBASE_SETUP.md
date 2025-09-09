# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: "14-day-muslim-challenge" (or your preferred name)
4. Enable Google Analytics (optional)
5. Create the project

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Google" provider:
   - Click on Google
   - Toggle "Enable" switch
   - Add your project's authorized domains (localhost for development)
   - Save

## 3. Set up Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Start in "test mode" for now (you can change rules later)
4. Choose a location (preferably close to your users)

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and choose web (</>) icon
4. Register your app with nickname: "14-day-challenge-web"
5. Copy the Firebase configuration object

## 5. Update Configuration

Replace the configuration in `src/firebase/config.ts` with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 6. Set up Admin User (Optional)

To make a user an admin:

1. Sign in to your app with Google
2. Go to Firestore Database in Firebase Console
3. Find your user document in the "users" collection
4. Edit the document and change the "role" field from "participant" to "admin"
5. Save the changes

## 7. Firestore Security Rules (Production)

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Only admins can read all users
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Tasks can be read by authenticated users
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 8. Deploy to Firebase Hosting (Optional)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build your app: `npm run build`
5. Deploy: `firebase deploy`

Your app will be available at: `https://your-project-id.web.app`