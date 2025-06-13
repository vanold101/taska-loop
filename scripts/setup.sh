#!/bin/bash

# Check if .env file exists
if [ -f .env ]; then
  echo "⚠️  .env file already exists. If you want to create a new one, please delete it first."
  read -p "Do you want to continue with the existing .env file? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup aborted."
    exit 1
  fi
else
  echo "Creating .env file..."
  
  echo "Please enter your Firebase configuration:"
  read -p "Firebase API Key: " api_key
  read -p "Firebase Auth Domain: " auth_domain
  read -p "Firebase Project ID: " project_id
  read -p "Firebase Storage Bucket: " storage_bucket
  read -p "Firebase Messaging Sender ID: " messaging_sender_id
  read -p "Firebase App ID: " app_id
  read -p "Firebase Measurement ID: " measurement_id
  read -p "Google OAuth Client ID: " google_client_id
  read -p "Google Maps API Key: " google_maps_key
  read -p "Firebase VAPID Key: " vapid_key
  
  cat > .env << EOL
# Firebase Configuration
VITE_FIREBASE_API_KEY="${api_key}"
VITE_FIREBASE_AUTH_DOMAIN="${auth_domain}"
VITE_FIREBASE_PROJECT_ID="${project_id}"
VITE_FIREBASE_STORAGE_BUCKET="${storage_bucket}"
VITE_FIREBASE_MESSAGING_SENDER_ID="${messaging_sender_id}"
VITE_FIREBASE_APP_ID="${app_id}"
VITE_FIREBASE_MEASUREMENT_ID="${measurement_id}"

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID="${google_client_id}"

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY="${google_maps_key}"

# Environment
NODE_ENV=development

# Firebase Messaging VAPID Key
VITE_FIREBASE_VAPID_KEY="${vapid_key}"
EOL
  
  echo "✅ .env file created successfully."
fi

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Generate service worker
echo "Generating Firebase messaging service worker..."
npm run generate-sw

echo "✅ Setup completed successfully!"
echo "You can now run the development server with: npm run dev" 