import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EmergencyReportPayload, saveNewEmergencyReport } from './services/emergencyService';

export default function RootLayout() {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
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
      
      // Debug: Log the notification data to see what fields are available
      console.log('Notification data:', notificationData);
      console.log('User details:', userDetails);

      const bodyDetails = `${notification.request.content.body}\nReporter: ${userDetails.reportedBy} - (${userDetails.barangay})\nContact No: ${userDetails.reporterContactNumber}\n${userDetails.description}`;

      // Show custom modal instead of Alert
      setModalTitle(notification.request.content.title || 'Emergency Alert');
      setModalBody(bodyDetails);
      
      // Try multiple possible image field names and structures
      const imageUrl = userDetails.imageUrl || 
                      userDetails.image || 
                      (userDetails.images && userDetails.images[0]) || 
                      notificationData.imageUrl || 
                      notificationData.image || 
                      (notificationData.images && notificationData.images[0]) ||
                      notificationData.attachedImage ||
                      notificationData.photo ||
                      notificationData.photoUrl ||
                      notificationData.attachment ||
                      // Check nested data structures
                      (notificationData.data && notificationData.data.imageUrl) ||
                      (notificationData.data && notificationData.data.image) ||
                      (notificationData.data && notificationData.data.images && notificationData.data.images[0]) ||
                      (notificationData.payload && notificationData.payload.imageUrl) ||
                      (notificationData.payload && notificationData.payload.image) ||
                      (notificationData.payload && notificationData.payload.images && notificationData.payload.images[0]) ||
                      null;
      
      console.log('Image URL found:', imageUrl);
      console.log('Full notification data structure:', JSON.stringify(notificationData, null, 2));
      console.log('Available image fields:', {
        userDetails_imageUrl: userDetails.imageUrl,
        userDetails_image: userDetails.image,
        userDetails_images: userDetails.images,
        notificationData_imageUrl: notificationData.imageUrl,
        notificationData_image: notificationData.image,
        notificationData_images: notificationData.images,
        notificationData_attachedImage: notificationData.attachedImage,
        notificationData_photo: notificationData.photo,
        notificationData_photoUrl: notificationData.photoUrl,
        notificationData_attachment: notificationData.attachment,
        notificationData_data: notificationData.data,
        notificationData_payload: notificationData.payload
      });
      
      // For testing purposes, if no image is found, you can uncomment the line below to test with a sample image
      // const testImageUrl = imageUrl || 'https://picsum.photos/400/300?random=1';
      
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

    return () => {
       Notifications.removeNotificationSubscription(subscription);
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
