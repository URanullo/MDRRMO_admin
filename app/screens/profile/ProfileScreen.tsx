import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Auth, signOut, User } from 'firebase/auth';
import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as FirebaseConfig from '../../../app/services/firebaseConfig';

export default function ProfileScreen() {
  const typedAuth = (FirebaseConfig as any).auth as Auth;
  const user = typedAuth.currentUser as User | null;

  const [logoutVisible, setLogoutVisible] = useState(false);

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
            <TouchableOpacity style={styles.listItem} activeOpacity={0.75}>
              <View style={styles.listLeft}>
                <View style={[styles.iconPill, { backgroundColor: '#fff3e0' }]}>
                  <MaterialIcons name="lock" size={18} color="#fb8c00" />
                </View>
                <Text style={styles.listLabel}>Change Password</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#bbb" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.listItem} activeOpacity={0.75}>
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
