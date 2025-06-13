# Environment Setup Guide

This guide explains how to set up environment variables securely for the TaskaLoop application.

## 🔒 Security Overview

All API keys and sensitive configuration are now stored in environment variables and are **NOT** committed to version control. This ensures your keys remain private and secure.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
npm run setup-env
```

This will create a `.env` file with all the correct values for your project.

### Option 2: Manual Setup

1. Copy the example file:
```bash
cp env.example .env
```

2. Edit the `.env` file with your actual values:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Environment
NODE_ENV=development

# Firebase Messaging VAPID Key
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

## 📋 Required Environment Variables

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics Measurement ID | Firebase Console → Project Settings → General |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Google Cloud Console → APIs & Services → Credentials |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API Key | Google Cloud Console → APIs & Services → Credentials |
| `VITE_FIREBASE_VAPID_KEY` | Firebase Cloud Messaging VAPID Key | Firebase Console → Project Settings → Cloud Messaging |

## 🔧 After Setup

1. Generate the service worker:
```bash
npm run generate-sw
```

2. Start the development server:
```bash
npm run dev
```

## 🛡️ Security Best Practices

### ✅ What's Secure Now:
- ✅ All API keys are in environment variables
- ✅ `.env` file is in `.gitignore` (never committed)
- ✅ Environment variables are validated at startup
- ✅ Clear error messages when keys are missing

### 🚨 Important Security Notes:

1. **Never commit `.env` files** - They contain sensitive API keys
2. **Use VITE_ prefix** - Only `VITE_` prefixed variables are exposed to the client
3. **Rotate keys regularly** - Change API keys periodically for security
4. **Restrict API key usage** - Configure API key restrictions in Google Cloud Console

## 🔍 Troubleshooting

### Missing Environment Variables
If you see warnings about missing environment variables:

1. Check that your `.env` file exists in the project root
2. Verify all required variables are set
3. Restart the development server after making changes

### Firebase Authentication Errors
If you get authentication errors:

1. Ensure Firebase Authentication is enabled in Firebase Console
2. Add your domain to authorized domains in Firebase Console
3. Verify the Google OAuth Client ID is correct

### Google Maps Not Loading
If maps don't load:

1. Check that the Google Maps API key is valid
2. Ensure the Maps JavaScript API is enabled in Google Cloud Console
3. Verify API key restrictions allow your domain

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Authentication Setup](https://firebase.google.com/docs/auth/web/start)
- [Google Maps API Setup](https://developers.google.com/maps/documentation/javascript/get-api-key)

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase services are enabled in Firebase Console
4. Check that API keys have the correct permissions 