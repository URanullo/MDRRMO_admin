import { MaterialIcons } from '@expo/vector-icons';
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Details from '../components/Details';
import { auth } from './service/firebaseconfig';

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check authentication state on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        console.log("User is authenticated:", user.email);
        setIsLoggedIn(true);
      } else {
        // User is signed out
        console.log("User is not authenticated");
        setIsLoggedIn(false);
      }
      setIsInitializing(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user.email);
      // Note: We don't need to set setIsLoggedIn(true) here because onAuthStateChanged will handle it
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      }
      
      Alert.alert("Login Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Sign out the user when going back
    auth.signOut();
    // Note: We don't need to set setIsLoggedIn(false) here because onAuthStateChanged will handle it
  };

  // Show loading screen while checking authentication state
  if (isInitializing) {
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
          <Text style={styles.welcome}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If logged in, show the Details page
  if (isLoggedIn) {
    return <Details onBack={handleBack} />;
  }

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
          />
          <TouchableOpacity onPress={() => setShowPassword((show) => !show)} style={styles.eyeIcon}>
            <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={24} color="#888" />
          </TouchableOpacity>
        </View>
        <Text style={styles.passwordHint}>
          Use at least 8 characters with 1 number, and one special character.
        </Text>
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? "LOGGING IN..." : "LOG IN"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>
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
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa',
    fontSize: 15,
    marginBottom: 4,
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
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
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
});
