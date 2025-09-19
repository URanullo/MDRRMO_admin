import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { saveNewEmergencyReport, EmergencyReportPayload } from './services/emergencyService';
import { Timestamp } from 'firebase/firestore';

export default function RootLayout() {
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
       const notificationData = notification.request.content.data;
      const userDetails = notificationData as EmergencyReportPayload;

      const bodyDetails = `${notification.request.content.body}\nReporter: ${userDetails.reportedBy} - (${userDetails.barangay})\nContact No: ${userDetails.reporterContactNumber}\n${userDetails.description}`;

      Alert.alert(
        notification.request.content.title || 'Notification',
        bodyDetails,
      );

      (async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/notify.mp3')
        );
        await sound.playAsync();
      })();

     // --- Save Notification Data to Firestore ---
      if (notificationData && typeof notificationData === 'object') {
        const reportPayload = notificationData as EmergencyReportPayload;

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
          Alert.alert("Data Incomplete", "Received an emergency alert, but some details are missing to create a full report.");
        }
      } else {
        console.warn('Received notification without a valid data payload.');
         Alert.alert("Alert Received", "An emergency alert was received, but detailed information was not included for reporting.");
      }
    });

    return () => {
       Notifications.removeNotificationSubscription(foregroundSubscription);
       Notifications.removeNotificationSubscription(backgroundInteractionSubscription);
     };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
