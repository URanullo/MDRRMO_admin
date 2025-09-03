import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

type LoginFormProps = {
    onSubmit: (email: string, password: string, isLoading: boolean) => void;
    isLoading: boolean;
};

export default function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

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
                        if (email.trim() && password) {
                            if (isSignUp) {
                                console.log('Calling handleSignUp...');
                                // handleSignUp();
                            } else {
                                console.log('Calling handleLogin...');
                                onSubmit(email, password, isLoading);
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
        marginTop: 32,
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