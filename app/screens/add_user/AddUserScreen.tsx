import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import handleCreateUserInFirebase, { UserProfile } from "../../screens/add_user/handleCreateUserInFirebase";

export default function AddUserScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [barangay, setBarangay] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isBarangayModalVisible, setIsBarangayModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Custom error state

  const BARANGAYS = [
    'Cabugao', 'Campo', 'Dugsangon', 'Pautao', 'Poblacion',
    'Pongtud', 'Santo Rosario', 'Cambuayon', 'Payapag',
  ];

  const validateInputs = (): boolean => {
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || !barangay) {
      setErrorMessage("⚠️ Missing Fields\nPlease fill in Email, Password, First Name, Last Name, and Barangay.");
      return false;
    }
    if (password.length < 6) {
      setErrorMessage("🔒 Weak Password\nPassword should be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      return;
    }

    const profileDetails: Omit<UserProfile, 'uid' | 'email' | 'createdAt'> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      barangay: barangay,
      contactNumber: contactNumber.trim(),
      role: isAdmin ? 'admin' : 'user',
    };

    const detailsSummary =
      `Email: ${email}\n` +
      `Barangay: ${barangay}\n` +
      `First Name: ${firstName}\n` +
      `Last Name: ${lastName}\n` +
      `Contact No: ${contactNumber || '-'}\n` +
      `Role: ${isAdmin ? 'Admin' : 'User'}`;

    // Confirmation popup
    setErrorMessage(`📋 Confirm New User\n\n${detailsSummary}\n\nPress OK to continue.`);
  };

  const confirmCreateUser = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const profileDetails: Omit<UserProfile, 'uid' | 'email' | 'createdAt'> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      barangay: barangay,
      contactNumber: contactNumber.trim(),
      role: isAdmin ? 'admin' : 'user',
    };

    const newUser = await handleCreateUserInFirebase(email.trim(), password, profileDetails);
    setIsLoading(false);

    if (newUser) {
      setEmail('');
      setPassword('');
      setBarangay('');
      setFirstName('');
      setLastName('');
      setContactNumber('');
      setIsAdmin(false);
    } else {
      setErrorMessage("❌ Failed to create user.\nPlease try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Add New User</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password <Text style={styles.requiredStar}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password (min. 6 characters)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Barangay <Text style={styles.requiredStar}>*</Text></Text>
          <TouchableOpacity
            style={[styles.input, styles.dropdownTouchable, isLoading && styles.disabled]}
            onPress={() => !isLoading && setIsBarangayModalVisible(true)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={[styles.dropdownText, !barangay && styles.dropdownPlaceholder]}>
              {barangay || 'Select Barangay'}
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={isBarangayModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsBarangayModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Barangay</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {BARANGAYS.map(b => (
                  <TouchableOpacity key={b} style={styles.optionItem} onPress={() => { setBarangay(b); setIsBarangayModalVisible(false); }}>
                    <Text style={styles.optionText}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setIsBarangayModalVisible(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.fieldRow}>
          <View style={[styles.flexItem, styles.fieldGroup]}>
            <Text style={styles.label}>First Name <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
              editable={!isLoading}
            />
          </View>
          <View style={styles.spacer} />
          <View style={[styles.flexItem, styles.fieldGroup]}>
            <Text style={styles.label}>Last Name <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter contact number"
            keyboardType="phone-pad"
            value={contactNumber}
            onChangeText={setContactNumber}
            editable={!isLoading}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>User Role</Text>
          <TouchableOpacity
            style={[styles.checkboxContainer, isLoading && styles.disabled]}
            onPress={() => !isLoading && setIsAdmin(!isAdmin)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={[styles.checkbox, isAdmin && styles.checkboxChecked]}>
              {isAdmin && <MaterialIcons name="check" size={16} color="#fff" />}
            </View>
            <View style={styles.checkboxTextContainer}>
              <Text style={styles.checkboxLabel}>Admin User</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonLoading]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Create User</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Error Modal */}
      {errorMessage && (
        <Modal transparent animationType="fade" visible={!!errorMessage} onRequestClose={() => setErrorMessage(null)}>
          <View style={styles.errorOverlay}>
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={28} color="#e53935" style={{ marginBottom: 10 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.errorButton}
                onPress={() => {
                  if (errorMessage.startsWith("📋 Confirm New User")) {
                    confirmCreateUser();
                  } else {
                    setErrorMessage(null);
                  }
                }}
              >
                <Text style={styles.errorButtonText}>
                  {errorMessage.startsWith("📋 Confirm New User") ? "Confirm & Create" : "OK"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#222', textAlign: 'center' },
  fieldGroup: { marginBottom: 15 },
  label: { marginBottom: 8, color: '#444', fontSize: 14, fontWeight: '600' },
  requiredStar: { color: 'red' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d0d0d0', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15 },
  dropdownTouchable: { justifyContent: 'center' },
  dropdownText: { fontSize: 15, color: '#222' },
  dropdownPlaceholder: { color: '#888' },
  fieldRow: { flexDirection: 'row' },
  flexItem: { flex: 1 },
  spacer: { width: 15 },
  saveButton: { marginTop: 25, backgroundColor: '#00c853', borderRadius: 8, alignItems: 'center', paddingVertical: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.5 },
  saveButtonLoading: { backgroundColor: '#00c853', opacity: 0.8 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 15, textAlign: 'center' },
  optionItem: { paddingVertical: 14, paddingHorizontal: 10, borderRadius: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionText: { fontSize: 15, color: '#333' },
  modalActions: { marginTop: 15, alignItems: 'center' },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 6, backgroundColor: '#6c757d' },
  cancelButtonText: { color: '#333', fontWeight: '600' },
  disabled: { opacity: 0.5, backgroundColor: '#e9ecef' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#d0d0d0', borderRadius: 4, marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#00c853', borderColor: '#00c853' },
  checkboxTextContainer: { flex: 1 },
  checkboxLabel: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 2 },

  // 🔴 Custom Error Modal Styles (red border added)
  errorOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  errorBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#e53935', // <-- red border accent
  },
  errorText: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#333' },
  errorButton: { backgroundColor: '#e53935', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  errorButtonText: { color: '#fff', fontWeight: '700' },
});
