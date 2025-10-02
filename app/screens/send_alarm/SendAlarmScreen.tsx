import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const baseUrl = Constants.expoConfig?.extra?.baseUrl;

export default function SendAlarmScreen() {
  const [alarmType, setAlarmType] = useState('');
  const [alarmLevel, setAlarmLevel] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const ALARM_TYPES = ['Flood', 'Fire', 'Landslide', 'Earthquake', 'Typhoon', 'Other'];
  const ALARM_LEVELS = [
    { label: 'Advisory', color: '#2e7d32' },
    { label: 'Alert', color: '#fdd835' },
    { label: 'Warning', color: '#fb8c00' },
    { label: 'Evacuation', color: '#e53935' },
    { label: 'Emergency', color: '#000000' },
  ];

  const canSend = alarmType && alarmLevel;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        title: `Alert! ${alarmType} reported`,
        body: `Emergency in all areas`,
        sound: "default",
        data: {
          type: alarmType,
          description: message,
          reportedBy: 'MDRRMO Bacuag',
          alarmLevel,
          clientDateTime: now,
        }
      };

      console.log('payload', payload);
      const response = await fetch(`${baseUrl}/broadcast-update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert(
          'Alarm Submitted',
          'Your emergency report has been successfully sent.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
          setAlarmType('');
          setAlarmLevel('');
          setMessage('');
      } else {
        let errorTitle = `Submit Failed (Status: ${response.status})`;
        let errorMessage = 'An unknown error occurred.';
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData: ServerError = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = 'Could not retrieve specific error details from server.';
            }
          } else {
            const errorText = await response.text();
            errorMessage = errorText || 'Server returned a non-JSON error response.';
          }
        } catch (e) {
          console.warn('Failed to parse error details:', e);
          errorMessage = 'Could not parse error details from server.';
        }
        Alert.alert(errorTitle, errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Submit Failed', `An error occurred: ${error.message || 'Please check your network connection.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}></Text>

        {/* Alarm Type */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Alarm Type</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowTypeModal(true)} activeOpacity={0.7}>
            <Text style={[styles.dropdownText, !alarmType && styles.placeholderText]}>
              {alarmType || 'Select Type'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alarm Level */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Alarm Level</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowLevelModal(true)} activeOpacity={0.7}>
            <View style={styles.inlineRow}>
              {alarmLevel ? (
                <View style={[styles.levelDot, { backgroundColor: ALARM_LEVELS.find(l => l.label === alarmLevel)?.color || '#ccc' }]} />
              ) : (
                <View style={[styles.levelDot, { backgroundColor: '#ccc' }]} />
              )}
              <Text style={[styles.dropdownText, !alarmLevel && styles.placeholderText]}>
                {alarmLevel || 'Select Level'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Message */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Message / Additional Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter message..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.button, styles.sendButton, !canSend && styles.buttonDisabled]}
            activeOpacity={canSend ? 0.8 : 1}
            onPress={() => canSend && setShowConfirmModal(true)}
          >
            <Text style={styles.sendButtonText}>Send Alarm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setAlarmType('');
              setAlarmLevel('');
              setMessage('');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Alarm Type Modal */}
      <Modal transparent visible={showTypeModal} animationType="fade" onRequestClose={() => setShowTypeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Alarm Type</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {ALARM_TYPES.map(type => (
                <TouchableOpacity key={type} style={styles.optionItem} onPress={() => { setAlarmType(type); setShowTypeModal(false); }}>
                  <Text style={styles.optionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowTypeModal(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Alarm Level Modal */}
      <Modal transparent visible={showLevelModal} animationType="fade" onRequestClose={() => setShowLevelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Alarm Level</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {ALARM_LEVELS.map(level => (
                <TouchableOpacity key={level.label} style={styles.optionItem} onPress={() => { setAlarmLevel(level.label); setShowLevelModal(false); }}>
                  <View style={styles.inlineRow}>
                    <View style={[styles.levelDot, { backgroundColor: level.color }]} />
                    <Text style={styles.optionText}>{level.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowLevelModal(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Send Modal */}
      <Modal transparent visible={showConfirmModal} animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Send</Text>
            <Text style={styles.confirmText}>Are you sure you want to send this alarm?</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={[styles.button, styles.confirmBtn]}
                onPress={() => {
                  setShowConfirmModal(false);
                  handleSubmit();
                  console.log('Alarm sent!');
                }}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.modalCancelBtn]} onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#e53935" />
            <Text style={styles.loadingText}>Broadcasting...</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  fieldGroup: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 6,
    color: '#444',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#222',
  },
  placeholderText: {
    color: '#888',
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#e53935',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
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
  optionText: {
    fontSize: 14,
    color: '#222',
  },
  modalActions: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalCancelText: {
    color: '#e53935',
    fontWeight: '700',
  },
  confirmText: {
    color: '#444',
    marginBottom: 12,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmBtn: {
    backgroundColor: '#e53935',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#444',
    fontWeight: '600',
  },
});
