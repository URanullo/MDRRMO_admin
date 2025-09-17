import Constants from 'expo-constants';
import * as Device from "expo-device";
import * as Notifications from 'expo-notifications';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import {  Alert,KeyboardAvoidingView, Platform, ScrollView, StyleSheet} from "react-native";
import { auth, db } from "../../../app/services/firebaseConfig";
import LoginForm from './LoginForm';

const baseUrl = Constants.expoConfig?.extra?.baseUrl;
 console.log('baseUrl',baseUrl);


export default function LoginScreen() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (email: string, password: string, isLoading: boolean) => {
        console.log('Login attempt with:', email, password);
        const trimmedEmail = email.trim();
        console.log('Trimmed email:', trimmedEmail);
        console.log('Password length:', password.length);

        if (!trimmedEmail || !password) {
            Alert.alert("Error", "Please enter both email and password");
            isLoading = false;
            return;
        }
        try {
            setIsLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
            const user = userCredential.user;

        // 2. Get user profile from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (!userDoc.exists()) {
              Alert.alert("Error", "User profile not found");
              return;
            }

            const userData = userDoc.data();
            console.log("User Data:", userData);

            // 3. Check role
            if (userData.role !== "admin") {
              Alert.alert("Access Denied", "You must be an admin to log in.");
              return;
            }

            console.log("Login successful:", userCredential.user.email);
            const token = await registerForPushNotificationsAsync();
            console.log("📱 Expo Push Token:", token);

            if (token) {
                await setDoc(doc(db, "users", user.uid), { expoPushToken: token }, { merge: true });
            }

            // Send token to your backend
            console.log("BASE_URL", `${baseUrl}/save-token`);
            await fetch(`${baseUrl}/save-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userCredential.user.email,
                    token: token
                })
            });

        } catch (error: any) {
            let errorMessage = "Login failed. Please try again.";
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
                case 'auth/invalid-credential':
                    errorMessage = "Incorrect password or email. Please try again.";
                    break;
                default:
                    errorMessage = `Login failed: ${error.message}`;
            }

            Alert.alert("Login Failed", errorMessage);
        } finally {
            setIsLoading(false);
        }

    };

    return (
          <KeyboardAvoidingView
              style={{ flex: 1, backgroundColor: '#fff' }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
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

        console.log("📱 Native Push Token:", token);
        return token;
    } else {
        alert("Must use physical device for push notifications");
    }
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center', // center when space available
        padding: 24,
        backgroundColor: '#fff',
    },
});