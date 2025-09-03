import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'; // Added ActivityIndicator
import handleCreateUserInFirebase, { UserProfile } from "../../services/handleCreateUserInFirebase";

export default function AddUser() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [barangay, setBarangay] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isBarangayModalVisible, setIsBarangayModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For loading state

  const BARANGAYS = [
    'Cabugao', 'Campo', 'Dugsangon', 'Pautao', 'Poblacion',
    'Pongtud', 'Santo Rosario', 'Cambuayon', 'Payapag',
  ];

  const validateInputs = (): boolean => {
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || !barangay) {
      Alert.alert('Missing Fields', 'Please fill in Email, Password, First Name, Last Name, and Barangay.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters long.');
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
      role: 'user', // Or 'admin', or make this selectable on the form
    };

    const detailsSummary =
      `Email: ${email}\n` +
      `Barangay: ${barangay}\n` +
      `First Name: ${firstName}\n` +
      `Last Name: ${lastName}\n` +
      `Contact No: ${contactNumber || '-'}`;

    Alert.alert(
      'Confirm New User Details',
      detailsSummary,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        {
          text: 'Confirm & Create',
          style: 'default',
          onPress: async () => {
            setIsLoading(true);
            const newUser = await handleCreateUserInFirebase(
              email.trim(),
              password, // Send the actual password
              profileDetails
            );
            setIsLoading(false);

            if (newUser) {
              // User created successfully
              // Optionally clear the form
              setEmail('');
              setPassword('');
              setBarangay('');
              setFirstName('');
              setLastName('');
              setContactNumber('');
//               router.back(); // Or router.push('/users-list') or similar
            } else {
              console.log('Failed to create user from AddUser screen.');
            }
          },
        },
      ]
    );
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
          {/* ... (Your existing Modal content for Barangay selection) ... */}
           <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Barangay</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {BARANGAYS.map((b) => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.optionItem, barangay === b && styles.optionItemSelected]}
                    onPress={() => {
                      setBarangay(b);
                      setIsBarangayModalVisible(false);
                    }}
                  >
                    <Text style={styles.optionText}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsBarangayModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
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

        {/* You could add a Role selection field here if needed */}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#222',
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 8,
    color: '#444',
    fontSize: 14,
    fontWeight: '600',
  },
  requiredStar: {
    color: 'red',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
  },
  dropdownTouchable: {
    justifyContent: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: '#222',
  },
  dropdownPlaceholder: {
    color: '#888',
  },
  fieldRow: {
    flexDirection: 'row',
  },
  flexItem: {
    flex: 1,
  },
  spacer: {
    width: 15,
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: '#00c853',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  saveButtonLoading: {
    backgroundColor: '#00c853',
    opacity: 0.8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionItemSelected: {
    backgroundColor: '#e6f2ff',

  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  modalActions: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  disabled: {
      opacity: 0.5,
      backgroundColor: '#e9ecef'
  }
});

