import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { Auth, EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword, User } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Image, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';


import * as FirebaseConfig from '../../../app/services/firebaseConfig';

export default function ProfileScreen() {
  const typedAuth = (FirebaseConfig as any).auth as Auth;
  const user = typedAuth.currentUser as User | null;

  const [logoutVisible, setLogoutVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [selectedSound, setSelectedSound] = useState<string>('default');
  const [themeOverride, setThemeOverride] = useState<'system' | 'light' | 'dark'>('system');

  React.useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('notificationsEnabled');
        if (stored != null) setNotificationsEnabled(stored === 'true');
        const sound = await AsyncStorage.getItem('alarmSound');
        if (sound) setSelectedSound(sound);
        const theme = await AsyncStorage.getItem('themeOverride');
        if (theme === 'light' || theme === 'dark') setThemeOverride(theme);
        else setThemeOverride('system');
      } catch {}
    })();
  }, []);

  const saveNotificationsPreference = async (enabled: boolean) => {
    try {
      setNotificationsEnabled(enabled);
      await AsyncStorage.setItem('notificationsEnabled', enabled ? 'true' : 'false');
      if (enabled) {
        const settings = await Notifications.getPermissionsAsync();
        if (!settings.granted) {
          await Notifications.requestPermissionsAsync();
        }
      }
    } catch {}
  };

  const saveSound = async (sound: string) => {
    try {
      setSelectedSound(sound);
      await AsyncStorage.setItem('alarmSound', sound);
      // Best effort: configure Android channel with selected sound
      if (sound) {
        await Notifications.setNotificationChannelAsync('alarm', {
          name: 'Alarm',
          importance: Notifications.AndroidImportance.MAX,
          sound: sound === 'default' ? undefined : sound,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch {}
  };

  const saveTheme = async (override: 'system' | 'light' | 'dark') => {
    try {
      setThemeOverride(override);
      if (override === 'system') {
        await AsyncStorage.removeItem('themeOverride');
      } else {
        await AsyncStorage.setItem('themeOverride', override);
      }
    } catch {}
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) {
      Alert.alert('Error', 'No authenticated user.');
      return;
    }
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirm password do not match.');
      return;
    }
    try {
      setChanging(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      Alert.alert('Success', 'Password updated successfully.');
      setPasswordVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      Alert.alert('Update Failed', e?.message || 'Could not update password.');
    } finally {
      setChanging(false);
    }
  };

  const confirmLogout = async () => {
    try {
      await signOut(typedAuth);
      console.log("User signed out successfully");
    } catch (e: any) {
      console.error("Logout Error", e.message);
    } finally {
      setLogoutVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient colors={["#e53935", "#ff7043"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.avatarWrap}>
              <Image
                source={{
                  uri:
                    'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(user?.displayName || user?.email || 'User') +
                    '&background=E53935&color=fff'
                }}
                style={styles.avatar}
              />
              <View style={styles.statusDot} />
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerName}>{user?.displayName || 'Administrator'}</Text>
              <Text style={styles.headerEmail}>{user?.email || 'admin@example.com'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Profile Info Card */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <MaterialIcons name="person" size={20} color="#e53935" />
            <Text style={styles.cardRowLabel}>Name</Text>
            <Text style={styles.cardRowValue}>{user?.displayName || 'Administrator'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <MaterialIcons name="email" size={20} color="#e53935" />
            <Text style={styles.cardRowLabel}>Email</Text>
            <Text style={styles.cardRowValue}>{user?.email || 'admin@example.com'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.cardRow}>
            <MaterialIcons name="verified-user" size={20} color="#e53935" />
            <Text style={styles.cardRowLabel}>Status</Text>
            <Text style={styles.badge}>Active</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.list}>
            <TouchableOpacity style={styles.listItem} activeOpacity={0.75} onPress={() => setPasswordVisible(true)}>
              <View style={styles.listLeft}>
                <View style={[styles.iconPill, { backgroundColor: '#fff3e0' }]}>
                  <MaterialIcons name="lock" size={18} color="#fb8c00" />
                </View>
                <Text style={styles.listLabel}>Change Password</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#bbb" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.listItem} activeOpacity={0.75} onPress={() => setNotifVisible(true)}>
              <View style={styles.listLeft}>
                <View style={[styles.iconPill, { backgroundColor: '#e3f2fd' }]}>
                  <MaterialIcons name="notifications" size={18} color="#1e88e5" />
                </View>
                <Text style={styles.listLabel}>Notification Settings</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#bbb" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => setLogoutVisible(true)}>
          <MaterialIcons name="logout" size={18} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 🔴 Custom Logout Modal */}
      <Modal transparent animationType="fade" visible={logoutVisible}>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <Text style={modalStyles.title}>⚠️ Confirm Logout</Text>
            <Text style={modalStyles.message}>Are you sure you want to log out?</Text>
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity style={[modalStyles.button, modalStyles.cancel]} onPress={() => setLogoutVisible(false)}>
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[modalStyles.button, modalStyles.logout]} onPress={confirmLogout}>
                <Text style={modalStyles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal transparent animationType="slide" visible={passwordVisible} onRequestClose={() => setPasswordVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.container, { borderColor: '#fb8c00' }]}>
            <Text style={[modalStyles.title, { color: '#fb8c00' }]}>Change Password</Text>
            <View style={{ width: '100%', gap: 10 }}>
              <TextInput
                placeholder="Current Password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={formStyles.input}
                placeholderTextColor="#999"
              />
              <TextInput
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={formStyles.input}
                placeholderTextColor="#999"
              />
              <TextInput
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={formStyles.input}
                placeholderTextColor="#999"
              />
            </View>
            <View style={modalStyles.buttonRow}>
              <TouchableOpacity style={[modalStyles.button, modalStyles.cancel]} onPress={() => setPasswordVisible(false)} disabled={changing}>
                <Text style={modalStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[modalStyles.button, { backgroundColor: '#fb8c00' }]} onPress={handleChangePassword} disabled={changing}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{changing ? 'Updating...' : 'Update'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notification Settings Modal */}
      <Modal transparent animationType="slide" visible={notifVisible} onRequestClose={() => setNotifVisible(false)}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.container, { borderColor: '#1e88e5' }]}>
            <Text style={[modalStyles.title, { color: '#1e88e5' }]}>Notification Settings</Text>
            <View style={{ width: '100%', gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#333', fontWeight: '600' }}>Enable Notifications</Text>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={saveNotificationsPreference}
                />
              </View>
              <View style={{ marginTop: 4 }}>
                <Text style={{ color: '#333', fontWeight: '600', marginBottom: 8 }}>Alarm Sound</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {['default', 'notify.mp3'].map((snd) => (
                    <TouchableOpacity
                      key={snd}
                      onPress={() => saveSound(snd)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: selectedSound === snd ? '#1e88e5' : '#f0f0f0'
                      }}
                    >
                      <Text style={{ color: selectedSound === snd ? '#fff' : '#333', fontWeight: '700', fontSize: 12 }}>
                        {snd === 'default' ? 'Default' : 'Notify.mp3'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={{ color: '#333', fontWeight: '600', marginBottom: 8 }}>Theme</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['system', 'light', 'dark'] as const).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => saveTheme(opt)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: themeOverride === opt ? '#1e88e5' : '#f0f0f0'
                      }}
                    >
                      <Text style={{ color: themeOverride === opt ? '#fff' : '#333', fontWeight: '700', fontSize: 12 }}>
                        {opt === 'system' ? 'System' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Text style={{ color: '#666', fontSize: 12 }}>
                You can manage system notification permissions from device settings.
              </Text>
            </View>
            <View style={[modalStyles.buttonRow, { marginTop: 16 }]}>
              <TouchableOpacity style={[modalStyles.button, { backgroundColor: '#1e88e5' }]} onPress={() => setNotifVisible(false)}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', paddingTop: StatusBar.currentHeight || 0 },
  scrollContent: { paddingBottom: 24 },
  header: { paddingHorizontal: 20, paddingVertical: 24, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { marginRight: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
  statusDot: { position: 'absolute', right: 2, bottom: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#2e7d32', borderWidth: 2, borderColor: '#fff' },
  headerTextBlock: { flex: 1 },
  headerName: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 2 },
  headerEmail: { color: '#ffe0e0' },
  card: { backgroundColor: '#fff', marginTop: -16, marginHorizontal: 16, borderRadius: 14, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 4 },
  cardRowLabel: { color: '#777', width: 80 },
  cardRowValue: { color: '#222', fontWeight: '600', flex: 1 },
  badge: { marginLeft: 'auto', backgroundColor: '#e8f5e9', color: '#2e7d32', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontWeight: '700' },
  section: { marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { color: '#222', fontWeight: '700', marginBottom: 8 },
  list: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f2f2f2' },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listLabel: { color: '#222', fontWeight: '500' },
  iconPill: { padding: 8, borderRadius: 999 },
  logoutButton: { marginTop: 20, marginHorizontal: 16, backgroundColor: '#E53935', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  logoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  container: { width: "80%", backgroundColor: "#fff", borderRadius: 12, padding: 20, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 8, borderWidth: 2, borderColor: "#d9534f" },
  title: { fontSize: 20, fontWeight: "bold", color: "#d9534f", marginBottom: 10 },
  message: { fontSize: 14, textAlign: "center", color: "#333", marginBottom: 20 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10 },
  button: { flex: 1, paddingVertical: 12, marginHorizontal: 5, borderRadius: 8, alignItems: "center" },
  cancel: { backgroundColor: "#f0f0f0" },
  logout: { backgroundColor: "#d9534f" },
  cancelText: { color: "#333", fontWeight: "600" },
  logoutText: { color: "#fff", fontWeight: "600" },
});

const formStyles = StyleSheet.create({
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#222',
  },
});
