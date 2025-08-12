import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Removed NavigationContainer to avoid nesting inside Expo Router's container
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import 'react-native-gesture-handler';
import Details from '../components/Details';
import { auth } from './service/firebaseconfig';

const Tab = createBottomTabNavigator();

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  // Check authentication state on app load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
    } catch (error: any) {
      let errorMessage = "Login failed. Please try again.";
      if (error.code === 'auth/user-not-found') errorMessage = "No account found with this email.";
      else if (error.code === 'auth/wrong-password') errorMessage = "Incorrect password.";
      else if (error.code === 'auth/invalid-email') errorMessage = "Invalid email format.";
      Alert.alert("Login Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Alarm screen
  const SendAlarmScreen = () => (
    <SafeAreaView style={[styles.container, { padding: 24, alignItems: 'stretch' }]}> 
      <Text style={[styles.brand, { fontSize: 28 }]}>Send Alarm</Text>
      <Text style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>Trigger an alarm for immediate assistance.</Text>
      <TouchableOpacity style={styles.sosButton} onPress={() => Alert.alert('Send Alarm', 'Alarm sent!')}> 
        <MaterialIcons name="warning" size={28} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Send Alarm</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  // Dummy screen for Log Out (we intercept tab press and show confirm dialog)
  const DummyScreen = () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />;

  // Loading while initializing auth
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

  // After login, show bottom tabs (no NavigationContainer since Expo Router provides one)
  if (isLoggedIn) {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: '#e53935',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: { height: 56, paddingBottom: 6, paddingTop: 6 },
          tabBarIcon: ({ color }) => {
            let iconName: any = 'home';
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Send Alarm') iconName = 'warning';
            else if (route.name === 'Log Out') iconName = 'logout';
            return <MaterialIcons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" options={{ tabBarLabel: 'Home' }}>
          {() => <Details />}
        </Tab.Screen>
        <Tab.Screen name="Send Alarm" component={SendAlarmScreen} options={{ tabBarLabel: 'Send Alarm' }} />
        <Tab.Screen
          name="Log Out"
          component={DummyScreen}
          options={{ tabBarLabel: 'Log Out' }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              Alert.alert(
                'Log out',
                'Are you sure you want to log out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Log Out', style: 'destructive', onPress: () => auth.signOut() },
                ]
              );
            },
          }}
        />
      </Tab.Navigator>
    );
  }

  // Login screen (default)
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
          <TouchableOpacity onPress={() => setShowPassword((show) => !show)} style={styles.eyeIcon}>
            <MaterialIcons name={showPassword ? "visibility-off" : "visibility"} size={24} color="#888" />
          </TouchableOpacity>
        </View>
        <Text style={styles.passwordHint}>
          Use at least 8 characters with 1 number, and one special character.
        </Text>
        <TouchableOpacity 
          style={[styles.loginButton, (!canSubmit) && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={!canSubmit}
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
  sosButton: {
    backgroundColor: '#e53935',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
