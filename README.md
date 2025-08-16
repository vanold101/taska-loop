# Taska Loop Mobile App

A React Native mobile app for smart household management, built with Expo and designed for iOS and Android app stores.

## 📱 Mobile App Features

- **🏠 Smart Home Management** - Organize household tasks and shopping
- **🛒 Pantry Management** - Track items, expiration dates, and shopping lists
- **🗺️ Shopping Trips** - Plan and optimize shopping routes
- **✅ Task Coordination** - Assign and track household tasks
- **📱 Mobile-First Design** - Optimized for iOS and Android
- **📷 Barcode Scanning** - Scan products to add to inventory
- **📍 Location Services** - Find nearby stores and optimize routes
- **🔔 Push Notifications** - Reminders for tasks and expiring items

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your mobile device
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taska-loop-mobile.git
   cd taska-loop-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Test on your device**
   - Install [Expo Go](https://expo.dev/client) on your phone
   - Scan the QR code displayed in the terminal
   - The app will load on your device

## 📱 Development Commands

```bash
# Start development server
npm start

# Start with tunnel (for testing on physical devices)
npm run preview

# Start on specific platform
npm run ios          # iOS Simulator
npm run android      # Android Emulator
npm run web          # Web browser

# Build for app stores
npm run build:ios    # Build iOS app
npm run build:android # Build Android app
npm run build:all    # Build for both platforms

# Submit to app stores
npm run submit:ios   # Submit to App Store
npm run submit:android # Submit to Play Store

# Development utilities
npm run clean        # Clear cache and restart
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
npm test            # Run tests
```

## 🏗️ Building for App Stores

### Prerequisites for App Store Deployment

1. **Apple Developer Account** (for iOS)
2. **Google Play Console** (for Android)
3. **EAS CLI** for building and submitting

### Setup EAS Build

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS Build**
   ```bash
   eas build:configure
   ```

4. **Build for production**
   ```bash
   # iOS
   eas build --platform ios --profile production
   
   # Android
   eas build --platform android --profile production
   ```

### App Store Submission

1. **Update app.json** with your app store details
2. **Build the app** using EAS
3. **Submit to stores**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## 📁 Project Structure

```
taska-loop-mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   └── onboarding/        # Onboarding screens
├── src/
│   ├── components/        # Reusable components
│   ├── context/           # React Context providers
│   ├── services/          # API and external services
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript type definitions
├── assets/                # Images, fonts, and static assets
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### App Store Configuration

Update `app.json` with your app store details:

- Bundle identifier (`com.yourcompany.yourapp`)
- App store URLs
- Team IDs and certificates
- App store metadata

## 📱 Testing

### Local Testing

1. **Expo Go** - Test on physical devices
2. **iOS Simulator** - Test iOS-specific features
3. **Android Emulator** - Test Android-specific features
4. **Web Browser** - Test basic functionality

### Testing Checklist

- [ ] App launches without errors
- [ ] Navigation works correctly
- [ ] Camera and barcode scanning
- [ ] Location services
- [ ] Push notifications
- [ ] Offline functionality
- [ ] Performance on different devices
- [ ] Accessibility features

## 🚀 Deployment

### Development Build

```bash
# Create development build for testing
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Build

```bash
# Create production build
eas build --profile production --platform all
```

### App Store Submission

```bash
# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check the [Expo documentation](https://docs.expo.dev/)

---

**Built with ❤️ using React Native and Expo**
