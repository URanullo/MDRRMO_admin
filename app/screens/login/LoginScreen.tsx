import Constants from 'expo-constants';
import * as Device from "expo-device";
import * as Notifications from 'expo-notifications';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { auth, db } from "../../../app/services/firebaseConfig";
import LoginForm from './LoginForm';

const baseUrl = Constants.expoConfig?.extra?.baseUrl;
console.log('baseUrl', baseUrl);

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (email: string, password: string) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage("⚠️ Please enter both email and password");
      setErrorVisible(true);
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        setErrorMessage("❌ User profile not found");
        setErrorVisible(true);
        return;
      }

      const userData = userDoc.data();
      if (userData.role !== "admin") {
        setErrorMessage("🚫 This account does not have administrator privileges.\n\nPlease log in with an admin account to continue.");
        setErrorVisible(true);
        return;
      }

      // Push token registration
      const token = await registerForPushNotificationsAsync();
      if (token) {
        await setDoc(doc(db, "users", user.uid), { expoPushToken: token }, { merge: true });
      }

      await fetch(`${baseUrl}/save-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userCredential.user.email, token }),
      });

    } catch (error: any) {
      let message = "Login failed. Please try again.";
      switch (error.code) {
        case 'auth/user-not-found':
          message = "No account found with this email. Please create an account first.";
          break;
        case 'auth/wrong-password':
          message = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          message = "Invalid email format. Please enter a valid email.";
          break;
        case 'auth/too-many-requests':
          message = "Too many failed attempts. Please try again later.";
          break;
        case 'auth/network-request-failed':
          message = "Network error. Please check your internet connection.";
          break;
        case 'auth/invalid-credential':
          message = "Incorrect password or email. Please try again.";
          break;
        default:
          message = `Login failed: ${error.message}`;
      }
      setErrorMessage(`❌ ${message}`);
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

        {/* Error Modal */}
        <Modal transparent animationType="fade" visible={errorVisible}>
          <View style={modalStyles.overlay}>
            <View style={modalStyles.container}>
              <Text style={modalStyles.title}>Login Error</Text>
              <Text style={modalStyles.message}>{errorMessage}</Text>
              <TouchableOpacity style={modalStyles.button} onPress={() => setErrorVisible(false)}>
                <Text style={modalStyles.buttonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    })).data;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  } else {
    alert("Must use physical device for push notifications");
  }
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#E53935", // red tone
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    color: "#333",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
