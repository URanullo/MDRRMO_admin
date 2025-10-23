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

  // Debug function to log notification structure
  const debugNotificationData = (notification: any) => {
    console.log('=== NOTIFICATION DEBUG INFO ===');
    console.log('Full notification object:', JSON.stringify(notification, null, 2));
    console.log('Notification request:', notification.request);
    console.log('Notification content:', notification.request?.content);
    console.log('Notification data:', notification.request?.content?.data);
    console.log('Notification title:', notification.request?.content?.title);
    console.log('Notification body:', notification.request?.content?.body);
    console.log('================================');
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
      
      // Debug notification structure
      debugNotificationData(notification);
      
      try {
        const notificationData = notification.request.content.data as any;
        console.log('Raw notification data:', notificationData);
        
        // Validate notification data exists
        if (!notificationData) {
          console.warn('No notification data received');
          setModalTitle('Emergency Alert');
          setModalBody('Emergency notification received but no detailed data available.');
          setModalImageUrl(null);
          setShowModal(true);
          return;
        }

        const userDetails = notificationData as EmergencyReportPayload;
        console.log('Parsed user details:', userDetails);

        // Validate required fields with safe defaults
        const safeUserDetails = {
          reportedBy: userDetails?.reportedBy || 'Unknown Reporter',
          barangay: userDetails?.barangay || 'Unknown Location',
          reporterContactNumber: userDetails?.reporterContactNumber || 'N/A',
          description: userDetails?.description || 'No description provided',
          type: userDetails?.type || 'Emergency',
          images: userDetails?.images || [],
          email: userDetails?.email || 'N/A',
          priority: userDetails?.priority || 'Medium',
          location: userDetails?.location || 'Unknown Location'
        };

        console.log('Safe user details:', safeUserDetails);

        // Wake screen and foreground app functionality
        handleEmergencyAlertWake();
        
        // Also use the enhanced wake service (works better after ejecting)
        const emergencyService = EmergencyWakeService.getInstance();
        if (emergencyService.isServiceAvailable()) {
          emergencyService.handleEmergencyAlert(safeUserDetails).catch(error => {
            console.error('Error in enhanced wake service:', error);
          });
        }

        const bodyDetails = `${notification.request.content.body || 'Emergency Alert'}\nReporter: ${safeUserDetails.reportedBy} - (${safeUserDetails.barangay})\nContact No: ${safeUserDetails.reporterContactNumber}\n${safeUserDetails.description}`;

        setModalTitle(notification.request.content.title || 'Emergency Alert');
        setModalBody(bodyDetails);
        
        const imageUrl = safeUserDetails.images?.[0] || null;

        setModalImageUrl(imageUrl);
        setShowModal(true);

        // Play emergency sound
        (async () => {
          try {
            const { sound } = await Audio.Sound.createAsync(
              require('./assets/notify.mp3')
            );
            await sound.playAsync();
          } catch (soundError) {
            console.error('Error playing emergency sound:', soundError);
          }
        })();

        // --- Save Notification Data to Firestore ---
        try {
          if (safeUserDetails.type && safeUserDetails.description && safeUserDetails.barangay) {
            saveNewEmergencyReport(safeUserDetails)
              .then(reportId => {
                if (reportId) {
                  console.log(`Report data from notification ${notification.request.identifier} saved as Firestore document ${reportId}`);
                } else {
                  console.error(`Failed to save report data from notification ${notification.request.identifier}`);
                }
              })
              .catch(error => {
                console.error(`Error in saveNewEmergencyReport promise for notification ${notification.request.identifier}:`, error);
              });
          } else {
            console.warn('Received notification with insufficient data to save report:', safeUserDetails);
          }
        } catch (saveError) {
          console.error('Error saving notification data to Firestore:', saveError);
        }
      } catch (error) {
        console.error('Error processing notification:', error);
        setModalTitle('Emergency Alert');
        setModalBody('Emergency notification received but there was an error processing the data.');
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
