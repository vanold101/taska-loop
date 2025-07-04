#!/bin/bash
echo "🔥 Quick Firebase Fix"
echo "===================="
echo ""
echo "Please provide your Firebase configuration values:"
echo ""
read -p "Firebase API Key (starts with AIzaSy...): " api_key
read -p "Messaging Sender ID (numbers only): " sender_id  
read -p "App ID (starts with 1:...): " app_id
echo ""

# Update .env file with real values
sed -i.bak "s/VITE_FIREBASE_API_KEY=.*/VITE_FIREBASE_API_KEY=$api_key/" .env
sed -i.bak "s/VITE_FIREBASE_MESSAGING_SENDER_ID=.*/VITE_FIREBASE_MESSAGING_SENDER_ID=$sender_id/" .env
sed -i.bak "s/VITE_FIREBASE_APP_ID=.*/VITE_FIREBASE_APP_ID=$app_id/" .env

echo "✅ Updated .env with your Firebase configuration"
echo "🔄 Restart your dev server now: npm run dev"

