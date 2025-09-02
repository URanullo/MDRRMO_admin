import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AddUser() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [barangay, setBarangay] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isBarangayModalVisible, setIsBarangayModalVisible] = useState(false);

  const BARANGAYS = [
    'Cabugao',
    'Campo',
    'Dugsangon',
    'Pautao',
    'Poblacion',
    'Pongtud',
    'Santo Rosario',
    'Cambuayon',
    'Payapag',
  ];

  const handleSave = () => {
    if (!barangay) {
      Alert.alert('Barangay required', 'Please select a Barangay before saving.');
      return;
    }

    const details =
      `Email: ${email || '-'}\n` +
      `Password: ${password ? '••••••••' : '-'}\n` +
      `Barangay: ${barangay}\n` +
      `First Name: ${firstName || '-'}\n` +
      `Last Name: ${lastName || '-'}\n` +
      `Contact Number: ${contactNumber || '-'}`;

    Alert.alert(
      'Confirm Details',
      details,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'default', onPress: () => router.back() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Add User</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Barangay</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setIsBarangayModalVisible(true)}
            activeOpacity={0.7}
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
          <View style={styles.flexItem}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.flexItem}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
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
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save User</Text>
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
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#222',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: '#444',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#222',
  },
  dropdownPlaceholder: {
    color: '#888',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  flexItem: {
    flex: 1,
  },
  spacer: {
    width: 12,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#00c853',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionItemSelected: {
    backgroundColor: '#f1f8e9',
  },
  optionText: {
    fontSize: 14,
    color: '#222',
  },
  modalActions: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    color: '#00c853',
    fontWeight: '700',
  },
});


