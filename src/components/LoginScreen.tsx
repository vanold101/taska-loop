import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, createGuestUser, isLoading, error, user } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Navigate to main app when user is authenticated
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google login failed:', err);
      // Error is already handled by AuthContext
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsLoggingIn(true);
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      console.error('Login failed:', err);
      // Error is already handled by AuthContext
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setIsRegistering(true);
    try {
      await registerWithEmail(email, password, name);
      Alert.alert('Success', 'Account created successfully! You can now log in.');
      setShowRegister(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err) {
      console.error('Registration failed:', err);
      // Error is already handled by AuthContext
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* App Logo/Icon */}
            <View style={styles.logoContainer}>
              <Ionicons name="home" size={80} color="#2E8BFF" />
              <Text style={styles.appName}>Taska Loop</Text>
              <Text style={styles.tagline}>Smart Household Management</Text>
            </View>

            {/* Welcome Text */}
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeTitle}>
                {showRegister ? 'Create Account' : 'Welcome Back!'}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                {showRegister 
                  ? 'Sign up to start managing your household tasks, trips, and pantry'
                  : 'Sign in to access your household tasks, trips, and pantry'
                }
              </Text>
            </View>

            {/* Auth Form */}
            <View style={styles.formContainer}>
              {/* Google Sign-In Button */}
              <TouchableOpacity
                style={[styles.googleButton, isLoggingIn && styles.disabledButton]}
                onPress={handleGoogleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <ActivityIndicator color="#B3B3B3" size="small" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={24} color="#DB4437" />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {showRegister && (
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#B3B3B3" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#757575"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#B3B3B3" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#757575"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#B3B3B3" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#757575"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.actionButton, (isLoggingIn || isRegistering) && styles.disabledButton]}
                onPress={showRegister ? handleEmailRegister : handleEmailLogin}
                disabled={isLoggingIn || isRegistering}
              >
                {(isLoggingIn || isRegistering) ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {showRegister ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle Auth Mode */}
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowRegister(!showRegister)}
              >
                <Text style={styles.toggleButtonText}>
                  {showRegister 
                    ? 'Already have an account? Sign In' 
                    : 'Need an account? Sign Up'
                  }
                </Text>
              </TouchableOpacity>

              {/* Skip Sign In Button */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={async () => {
                  try {
                    await createGuestUser();
                    // Navigation will happen automatically via useEffect when user is set
                  } catch (error) {
                    console.error('Error creating guest user:', error);
                    Alert.alert('Error', 'Failed to create guest user. Please try again.');
                  }
                }}
              >
                <Text style={styles.skipButtonText}>Skip Sign In for Now</Text>
              </TouchableOpacity>

              {/* Error Display */}
              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="warning" size={16} color="#F44336" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Info Text */}
              <Text style={styles.infoText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Version 1.0.0</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    marginBottom: 16,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 320,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#2E8BFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleButton: {
    marginTop: 16,
    padding: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#2E8BFF',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderColor: '#2C2C2C',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    maxWidth: 320,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#757575',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 16,
    width: '100%',
    maxWidth: 320,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    maxWidth: 320,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2C2C2C',
  },
  dividerText: {
    fontSize: 14,
    color: '#757575',
    marginHorizontal: 10,
  },
  skipButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
    fontWeight: '500',
  },
});
