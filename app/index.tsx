import { MaterialIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Alert, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import BottomTabNavigator from './buttomNavigation';
import { auth } from './service/firebaseconfig';

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Test Firebase connection
  console.log('Firebase auth object:', auth);
  console.log('Firebase auth currentUser:', auth.currentUser);

  // Test Firebase connection
  const testFirebaseConnection = () => {
    try {
      console.log('Testing Firebase connection...');
      console.log('Auth object exists:', !!auth);
      console.log('Auth app exists:', !!auth.app);
      console.log('Auth config exists:', !!auth.app.options);
      console.log('Project ID:', auth.app.options.projectId);
      return true;
    } catch (error) {
      console.log('Firebase connection test failed:', error);
      return false;
    }
  };

  // Run Firebase test on component mount
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  // Check if user has an active session on app load
  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase auth state changed:', user ? `User: ${user.email}` : 'No user');
      // Only auto-login if user has a valid session
      if (user) {
        console.log('Setting isLoggedIn to TRUE from Firebase listener');
        setIsLoggedIn(true);
      } else {
        console.log('No valid session, forcing sign out');
        // Force sign out if no valid session
        signOut(auth);
        setIsLoggedIn(false);
      }
      setHasCheckedAuth(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    console.log('handleLogin called!');
    const trimmedEmail = email.trim();
    console.log('Trimmed email:', trimmedEmail);
    console.log('Password length:', password.length);
    
    if (!trimmedEmail || !password) {
      console.log('Validation failed - missing email or password');
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    console.log('Starting Firebase authentication...');
    setIsLoading(true);
    
    try {
      console.log('Calling signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      console.log('Authentication successful!', userCredential.user?.email);
      
      if (userCredential.user) {
        console.log('Setting isLoggedIn to true...');
        // Clear form data after successful login
        setEmail("");
        setPassword("");
        setIsLoggedIn(true);
        console.log('Login complete!');
      }
    } catch (error: any) {
      console.log('Firebase Auth Error:', error.code, error.message);
      let errorMessage = "Login failed. Please try again.";
      
      // Firebase specific error codes
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email. Please create an account first.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email format. Please enter a valid email.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = `Login failed: ${error.message}`;
      }
      
      Alert.alert("Firebase Authentication Error", errorMessage);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      if (userCredential.user) {
        Alert.alert("Success", "Account created successfully! You are now logged in.");
        // Clear form data after successful signup
        setEmail("");
        setPassword("");
        setIsLoggedIn(true);
      }
    } catch (error: any) {
      console.log('Firebase SignUp Error:', error.code, error.message);
      let errorMessage = "Sign up failed. Please try again.";
      
      // Firebase specific error codes for signup
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "An account with this email already exists. Please log in instead.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Invalid email format. Please enter a valid email.";
          break;
        case 'auth/weak-password':
          errorMessage = "Password is too weak. Please use at least 6 characters.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection.";
          break;
        default:
          errorMessage = `Sign up failed: ${error.message}`;
      }
      
      Alert.alert("Firebase SignUp Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
  };

  // Show loading while checking authentication state
  if (!hasCheckedAuth) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="local-hospital" size={48} color="#fff" />
          </View>
          <Text style={styles.brand}>Bacuag Household</Text>
          <Text style={styles.subtitleBrand}>Emergency Alarm</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.welcome}>Checking authentication...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // After successful login, show bottom tabs
  if (isLoggedIn) {
    console.log('isLoggedIn is TRUE - showing BottomTabNavigator');
    return <BottomTabNavigator onLogout={handleLogout} />;
  }

  console.log('Current state - isLoggedIn:', isLoggedIn, 'hasCheckedAuth:', hasCheckedAuth);
  
  // Login screen (mandatory - shows until user successfully logs in)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.avatar}>
          <MaterialIcons name="local-hospital" size={48} color="#fff" />
        </View>
        <Text style={styles.brand}>Bacuag Household</Text>
        <Text style={styles.subtitleBrand}>Emergency Alarm</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.welcome}>Welcome back!</Text>
        <Text style={styles.label}>Email address</Text>
        <TextInput
          style={styles.input}
          placeholder="example@mail.com"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
          onSubmitEditing={() => {
            // focus password would be ideal; for now no ref, so do nothing
          }}
        />
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            placeholderTextColor="#aaa"
          secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />
                  <Pressable onPress={() => setShowPassword((show) => !show)} style={styles.eyeIcon}>
          <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={24} color="#888" />
        </Pressable>
        </View>
        <Text style={styles.passwordHint}>
          Use at least 8 characters with 1 number, and one special character.
        </Text>
        <Pressable 
          style={({ pressed }) => [
            styles.loginButton,
            pressed && { opacity: 0.7 }
          ]} 
          onPress={() => {
            console.log('LOG IN button pressed!');
            console.log('Email:', email);
            console.log('Password length:', password.length);
            
            if (email.trim() && password) {
              if (isSignUp) {
                console.log('Calling handleSignUp...');
                handleSignUp();
              } else {
                console.log('Calling handleLogin...');
                handleLogin();
              }
            } else {
              console.log('Form validation failed');
              Alert.alert('Error', 'Please enter both email and password');
            }
          }}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
          android_disableSound={false}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? (isSignUp ? "CREATING ACCOUNT..." : "LOGGING IN...") : (isSignUp ? "SIGN UP" : "LOG IN")}
          </Text>
        </Pressable>
        <Pressable>
          <Text style={styles.forgot}>Forgot password?</Text>
        </Pressable>
        
        {/* Toggle between Login and Sign Up */}
        <Pressable 
          style={styles.toggleButton} 
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.toggleButtonText}>
            {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </Text>
        </Pressable>
        
        {/* Test Firebase connection */}
        <Pressable 
          style={[styles.loginButton, { backgroundColor: '#FF9800', marginTop: 16 }]} 
          onPress={() => {
            console.log('Testing Firebase connection...');
            testFirebaseConnection();
            Alert.alert('Firebase Test', 'Check console for connection status');
          }}
        >
          <Text style={styles.loginButtonText}>TEST FIREBASE</Text>
        </Pressable>
        

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    backgroundColor: '#e53935',
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e53935',
    lineHeight: 40,
    textAlign: 'center',
  },
  subtitleBrand: {
    color: '#e53935',
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    width: 420,
    maxWidth: '95%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'stretch',
  },
  welcome: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    height: Platform.OS === 'ios' ? 44 : 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
    fontSize: 15,
    marginBottom: 4,
    minHeight: Platform.OS === 'ios' ? 44 : 48, // iOS and Android touch target guidelines
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  eyeIcon: {
    padding: 8,
  },
  passwordHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#e53935',
    borderRadius: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 8,
    minHeight: Platform.OS === 'ios' ? 44 : 48, // iOS and Android touch target guidelines
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgot: {
    color: '#888',
    textAlign: 'center',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  toggleButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  toggleButtonText: {
    color: '#E53935',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});
