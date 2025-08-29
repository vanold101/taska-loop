# Taska Loop - Smart Household Management App

A comprehensive React Native mobile app for intelligent household management, built with Expo and designed for modern families who want to coordinate tasks, shopping, and pantry management seamlessly.

## 🌟 Key Features

### 🏠 **Smart Dashboard**
- **Interactive Calendar**: Weekly strip view with full calendar modal for task scheduling
- **Daily Overview**: Dynamic dashboard showing tasks, trips, and pantry items for selected dates
- **Quick Actions**: One-tap access to add tasks, trips, and pantry items
- **Calendar Integration**: Import from Google Calendar and Apple Calendar

### 🛒 **Intelligent Shopping & Trips**
- **Route Optimization**: AI-powered route planning based on distance and location
- **Google Maps Integration**: Seamless navigation with pre-loaded optimized waypoints
- **Store Search**: Smart location search with local store prioritization
- **Trip Management**: Create, edit, and manage shopping trips with item lists
- **Real-time Location**: Live user location tracking for accurate route planning

### 📦 **Advanced Pantry Management**
- **Barcode Scanning**: Scan products to automatically add to pantry with Open Food Facts integration
- **Item Editing**: Full item details editing with units, quantities, and categories
- **Expiration Tracking**: Monitor expiring items and get timely notifications
- **Smart Lists**: Automatic shopping list generation based on pantry levels

### ✅ **Task Coordination**
- **Household Tasks**: Create, assign, and track tasks across family members
- **Recurring Items**: Manage recurring purchases and household items
- **Progress Tracking**: Mark tasks complete with real-time updates
- **Smart Scheduling**: Calendar-based task organization

### 🎨 **Modern UI/UX**
- **Dark Theme**: Sleek dark mode design with optimal contrast
- **Mobile-First**: Optimized for iOS and Android with platform-specific features
- **Accessible Design**: High contrast text and touch-friendly interface
- **Smooth Animations**: Fluid transitions and responsive interactions

### 🔐 **Authentication & Security**
- **Google OAuth**: Secure Google Sign-In integration
- **Firebase Auth**: Robust authentication with email/password and social login
- **Guest Mode**: Try the app without creating an account
- **Data Privacy**: Secure data handling and user privacy protection

## 🚀 Tech Stack

### **Frontend**
- **React Native** with **Expo** (SDK 51+)
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **React Native Maps** for location and routing
- **Expo Camera** for barcode scanning

### **Backend & Services**
- **Firebase** (Authentication, Firestore, Cloud Functions)
- **Google Maps API** (Places, Directions, Geocoding)
- **Open Food Facts API** for product information
- **Stripe** for payment processing
- **Google Calendar API** for calendar integration

### **Development Tools**
- **ESLint** & **TypeScript** for code quality
- **Jest** & **React Native Testing Library** for testing
- **EAS Build** for app store builds
- **Expo Dev Tools** for debugging

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your mobile device
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taska-loop.git
   cd taska-loop
   ```

2. **Install dependencies**
   ```bash
   npx expo install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Test on your device**
   - Install [Expo Go](https://expo.dev/client) on your phone
   - Scan the QR code displayed in the terminal
   - The app will load on your device

## 📱 Development Commands

```bash
# Start development server
npx expo start

# Start with specific options
npx expo start --tunnel     # For testing on physical devices
npx expo start --clear      # Clear cache and restart

# Platform-specific development
npx expo start --ios        # iOS Simulator
npx expo start --android    # Android Emulator
npx expo start --web        # Web browser

# Development utilities
npx expo install             # Install/update dependencies
npx expo doctor             # Check project health
npx expo customize          # Customize Expo configuration

# Code quality
npx eslint . --fix          # Lint and fix code
npx tsc --noEmit           # TypeScript type checking
npx jest                   # Run tests
```

## 🏗️ Building for App Stores

### Setup EAS Build

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   npx eas login
   ```

3. **Configure EAS Build**
   ```bash
   npx eas build:configure
   ```

### Build Commands

```bash
# Development builds
npx eas build --profile development --platform ios
npx eas build --profile development --platform android

# Preview builds
npx eas build --profile preview --platform all

# Production builds
npx eas build --profile production --platform ios
npx eas build --profile production --platform android
npx eas build --profile production --platform all
```

### App Store Submission

```bash
# Submit to App Store
npx eas submit --platform ios

# Submit to Play Store
npx eas submit --platform android
```

## 📁 Project Structure

```
taska-loop/
├── app/                      # Expo Router app directory
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Dashboard with calendar
│   │   ├── trips.tsx        # Shopping trips & route optimization
│   │   ├── pantry.tsx       # Pantry management
│   │   ├── recurring.tsx    # Recurring items & lists
│   │   └── settings.tsx     # Settings & user profile
│   ├── auth/                # Authentication screens
│   ├── onboarding/          # User onboarding flow
│   └── _layout.tsx          # Root layout configuration
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   │   ├── tutorial/       # Onboarding tutorial components
│   │   └── ...             # Feature-specific components
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx # Authentication state
│   │   ├── TripContext.tsx # Trip management
│   │   └── ...            # Other context providers
│   ├── services/           # External API integrations
│   │   ├── googlePlacesMobile.ts  # Google Places API
│   │   ├── OpenFoodFactsService.ts # Product information
│   │   └── ...            # Other services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── lib/                # Configuration and setup
├── assets/                 # Static assets (images, fonts, icons)
├── functions/              # Firebase Cloud Functions
├── app.json               # Expo app configuration
├── eas.json              # EAS Build configuration
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Services
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id

# External APIs
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
EXPO_PUBLIC_APP_ENV=development
```

### Google Cloud Console Setup

For Google OAuth and Maps integration:

1. **Google Cloud Console**: https://console.cloud.google.com/
2. **Enable APIs**: Maps, Places, Directions, Calendar
3. **OAuth Setup**: Configure authorized domains and redirect URIs
4. **API Keys**: Restrict keys to specific APIs and platforms

### Firebase Setup

1. **Firebase Console**: https://console.firebase.google.com/
2. **Enable Authentication**: Google, Email/Password providers
3. **Firestore Database**: Set up security rules
4. **Cloud Functions**: Deploy backend functions

## 📱 Testing

### Local Testing Checklist

- [ ] App launches without errors on iOS/Android
- [ ] Navigation between all tabs works
- [ ] Calendar selection updates dashboard
- [ ] Task creation and completion
- [ ] Trip planning and route optimization
- [ ] Pantry item management and barcode scanning
- [ ] Google OAuth login flow
- [ ] Location services and map integration
- [ ] Push notifications (if enabled)
- [ ] Offline functionality and error handling

### Test Commands

```bash
# Run unit tests
npx jest

# Run specific test file
npx jest src/components/__tests__/ComponentName.test.tsx

# Run tests with coverage
npx jest --coverage

# Run tests in watch mode
npx jest --watch
```

## 🚀 Deployment

### Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] App store metadata updated in `app.json`
- [ ] Icons and splash screens optimized
- [ ] Privacy policy and terms of service
- [ ] App store descriptions and screenshots
- [ ] Beta testing completed

### Release Process

1. **Update version** in `app.json`
2. **Create release build** with EAS
3. **Test build** thoroughly
4. **Submit to app stores**
5. **Monitor for issues** and user feedback

## 📚 API Documentation

### Key External APIs

- **Google Maps Platform**: Places, Directions, Geocoding
- **Open Food Facts**: Product information and nutrition data
- **Firebase**: Authentication, Firestore, Cloud Functions
- **Google Calendar**: Calendar integration and event management
- **Stripe**: Payment processing for premium features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use consistent code formatting (ESLint/Prettier)
- Test on both iOS and Android
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- **Issues**: Create an issue in this repository
- **Documentation**: Check the [Expo documentation](https://docs.expo.dev/)
- **Community**: Join the [Expo Discord](https://chat.expo.dev/)

---

**Built with ❤️ using React Native, Expo, and modern mobile development practices**