import { MaterialIcons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../services/firebaseConfig';

type UserRecord = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  barangay?: string;
  contactNumber?: string;
  createdAt?: any;
};

export default function UserAccount() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editEmail, setEditEmail] = useState<string>('');
  const [editFirstName, setEditFirstName] = useState<string>('');
  const [editLastName, setEditLastName] = useState<string>('');
  const [editBarangay, setEditBarangay] = useState<string>('');
  const [editContactNumber, setEditContactNumber] = useState<string>('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data: UserRecord[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setUsers(data);
      setIsLoading(false);
    }, () => setIsLoading(false));
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const full = `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''} ${u.barangay || ''}`.toLowerCase();
      return full.includes(term);
    });
  }, [users, search]);

  const openEdit = (user: UserRecord) => {
    setEditingUser(user);
    setEditEmail(user.email || '');
    setEditFirstName(user.firstName || '');
    setEditLastName(user.lastName || '');
    setEditBarangay(user.barangay || '');
    setEditContactNumber(user.contactNumber || '');
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    try {
      const ref = doc(db, 'users', editingUser.id);
      await updateDoc(ref, {
        email: editEmail || null,
        firstName: editFirstName || null,
        lastName: editLastName || null,
        barangay: editBarangay || null,
        contactNumber: editContactNumber || null,
      });
      setIsEditOpen(false);
      setEditingUser(null);
    } catch (err) {
      Alert.alert('Update Failed', Platform.OS === 'web' ? String(err) : 'Please try again.');
    }
  };

  const confirmDelete = (user: UserRecord) => {
    Alert.alert(
      'Delete user',
      `Are you sure you want to delete ${user.firstName || ''} ${user.lastName || ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => doDelete(user.id) },
      ]
    );
  };

  const doDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      Alert.alert('Delete Failed', Platform.OS === 'web' ? String(err) : 'Please try again.');
    }
  };

  const renderItem = ({ item }: { item: UserRecord }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{`${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unnamed User'}</Text>
            {!!item.email && <Text style={styles.email}>{item.email}</Text>}
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
            <MaterialIcons name="edit" size={22} color="#1976d2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => confirmDelete(item)}>
            <MaterialIcons name="delete" size={22} color="#d32f2f" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          {!!item.barangay && (
            <View style={styles.row}>
              <MaterialIcons name="place" size={18} color="#666" />
              <Text style={styles.rowText}>{item.barangay}</Text>
            </View>
          )}
          {!!item.contactNumber && (
            <View style={styles.row}>
              <MaterialIcons name="call" size={18} color="#666" />
              <Text style={styles.rowText}>{item.contactNumber}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
        </View>

        {/* Quick Action section */}
        <View style={styles.topRow}>
          <View style={[styles.topCard, styles.activeTopCard]}>
            <Text style={styles.topCardTitle}>User Accounts</Text>
            <Text style={styles.topCardSubtitle}>View, edit, and delete accounts</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            placeholder="Search name, email, barangay"
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />
        </View>

        {isLoading ? (
          <Text style={styles.hint}>Loading users...</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.hint}>No users found.</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>

      <Modal visible={isEditOpen} transparent animationType="fade" onRequestClose={() => setIsEditOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={editEmail}
                onChangeText={setEditEmail}
              />
            </View>
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>First Name</Text>
                <TextInput style={styles.input} placeholder="First name" value={editFirstName} onChangeText={setEditFirstName} />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput style={styles.input} placeholder="Last name" value={editLastName} onChangeText={setEditLastName} />
              </View>
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Barangay</Text>
              <TextInput style={styles.input} placeholder="Barangay" value={editBarangay} onChangeText={setEditBarangay} />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput style={styles.input} placeholder="Contact number" keyboardType="phone-pad" value={editContactNumber} onChangeText={setEditContactNumber} />
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setIsEditOpen(false)}>
                <Text style={[styles.actionText, { color: '#1976d2' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={saveEdit}>
                <Text style={[styles.actionText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 12,
  },
  topCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  activeTopCard: {
    borderColor: '#e53935',
  },
  topCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  topCardSubtitle: {
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#222',
  },
  hint: {
    textAlign: 'center',
    color: '#777',
    marginTop: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  email: {
    fontSize: 13,
    color: '#666',
  },
  iconBtn: {
    padding: 6,
    marginLeft: 6,
  },
  cardBody: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rowText: {
    marginLeft: 6,
    color: '#444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 10,
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
  row2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 8,
  },
  cancelBtn: {
    backgroundColor: '#e3f2fd',
  },
  saveBtn: {
    backgroundColor: '#1976d2',
  },
  actionText: {
    fontWeight: '700',
  },
});


