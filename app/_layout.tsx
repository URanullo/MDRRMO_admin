import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EmergencyReportPayload, saveNewEmergencyReport } from './services/emergencyService';
import { EmergencyWakeService } from './services/emergencyWakeService';

export default function RootLayout() {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  // Function to handle emergency alert wake and foreground behavior
  const handleEmergencyAlertWake = async () => {
    try {
      console.log('Emergency alert received - attempting to wake and foreground app');
      
      // Request notification permissions to ensure we can show notifications
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }

      // Schedule an immediate notification to help wake the screen
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 EMERGENCY ALERT',
          body: 'Critical emergency report received - Tap to view',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
        },
        trigger: null, // Show immediately
      });

      // Try to bring app to foreground if it's in background
      if (AppState.currentState !== 'active') {
        console.log('App is in background, attempting to bring to foreground');
        // Note: In Expo managed workflow, we can't directly control app state
        // This will be handled by the notification tap
      }

      console.log('Emergency alert wake sequence completed');
    } catch (error) {
      console.error('Error in emergency alert wake sequence:', error);
    }
  };

  useEffect(() => {
    (async () => {
        // Initialize emergency wake service
        const emergencyService = EmergencyWakeService.getInstance();
        await emergencyService.initialize();

        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default', // ensure sound plays
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
    })();

    // Listen for incoming notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Mobile notification received:', notification);
       const notificationData = notification.request.content.data as any;
      const userDetails = notificationData as EmergencyReportPayload;
      
      console.log('Notification data:', notificationData);
      console.log('User details:', userDetails);

      // Wake screen and foreground app functionality
      handleEmergencyAlertWake();
      
      // Also use the enhanced wake service (works better after ejecting)
      const emergencyService = EmergencyWakeService.getInstance();
      if (emergencyService.isServiceAvailable()) {
        emergencyService.handleEmergencyAlert(userDetails).catch(error => {
          console.error('Error in enhanced wake service:', error);
        });
      }

      const bodyDetails = `${notification.request.content.body}\nReporter: ${userDetails.reportedBy} - (${userDetails.barangay})\nContact No: ${userDetails.reporterContactNumber}\n${userDetails.description}`;

      setModalTitle(notification.request.content.title || 'Emergency Alert');
      setModalBody(bodyDetails);
      
      const imageUrl = userDetails.images?.[0] || null;

      setModalImageUrl(imageUrl);
      setShowModal(true);

      (async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/notify.mp3')
        );
        await sound.playAsync();
      })();

      // --- Save Notification Data to Firestore ---
      if (notificationData && typeof notificationData === 'object') {
        const reportPayload = notificationData as any;

        if (reportPayload.type && reportPayload.description && reportPayload.barangay) {
          saveNewEmergencyReport(reportPayload)
            .then(reportId => {
              if (reportId) {
                console.log(`Report data from notification ${notification.request.identifier} saved as Firestore document ${reportId}`);
                // Optionally, trigger a local in-app update or subtle UI cue
              } else {
                console.error(`Failed to save report data from notification ${notification.request.identifier}`);
              }
            })
            .catch(error => {
              console.error(`Error in saveNewEmergencyReport promise for notification ${notification.request.identifier}:`, error);
            });
        } else {
          console.warn('Received notification with insufficient data to save report:', reportPayload);
          setModalTitle("Data Incomplete");
          setModalBody("Received an emergency alert, but some details are missing to create a full report.");
          setModalImageUrl(null);
          setShowModal(true);
        }
      } else {
        console.warn('Received notification without a valid data payload.');
        setModalTitle("Alert Received");
        setModalBody("An emergency alert was received, but detailed information was not included for reporting.");
        setModalImageUrl(null);
        setShowModal(true);
      }
    });

    // Handle notification taps to bring app to foreground
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped - bringing app to foreground');
      // The app will automatically come to foreground when notification is tapped
      // This is the closest we can get to foregrounding in Expo managed workflow
    });

    return () => {
       Notifications.removeNotificationSubscription(subscription);
       Notifications.removeNotificationSubscription(responseSubscription);
     };
  }, []);

  const handleDismissModal = () => {
    setShowModal(false);
    setModalImageUrl(null);
  };

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleDismissModal}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🚨</Text>
              </View>
              <Text style={styles.title}>{modalTitle}</Text>
            </View>
            
            <View style={styles.content}>
              <Text style={styles.body}>{modalBody}</Text>
              {modalImageUrl ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: modalImageUrl }} 
                    style={styles.emergencyImage}
                    resizeMode="cover"
                    onError={(error) => {
                      console.log('Image load error:', error);
                      console.log('Failed to load image URL:', modalImageUrl);
                      setModalImageUrl(null);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', modalImageUrl);
                    }}
                  />
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <Text style={styles.noImageText}>No image attached</Text>
                </View>
              )}
            </View>
            
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.dismissButton} 
                onPress={handleDismissModal}
                activeOpacity={0.8}
              >
                <Text style={styles.dismissButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 16,
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  imageContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  emergencyImage: {
    width: '100%',
    maxHeight: 250,
    minHeight: 150,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noImageContainer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  noImageText: {
    color: '#6c757d',
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
  dismissButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
