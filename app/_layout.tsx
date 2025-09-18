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
      // Set default channel for Android with sound
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default', // ensure sound plays
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    })();

    // Listen for incoming notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('📱 Mobile notification received:', notification);
      console.log('Notification data:', JSON.stringify(notification.request.content.data));

      Alert.alert(
        notification.request.content.title || 'Notification',
        notification.request.content.body || ''
      );

      (async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/notify.mp3')
        );
        await sound.playAsync();
      })();

     // --- Save Notification Data to Firestore ---
      const notificationData = notification.request.content.data;
      console.log('Notification data payload:', notificationData);

      if (notificationData && typeof notificationData === 'object') {
        // Assume the data payload from FCM directly matches EmergencyReportPayload structure
        // Perform basic validation or type casting if necessary
        const reportPayload = notificationData as EmergencyReportPayload;

        // You might want to add more robust validation here
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
      // --- End Save Notification Data ---

     // Handle notifications that are tapped on when the app is in the background or killed
      // This is important if you want to navigate or perform actions when the user opens the app via a notification.
      const backgroundInteractionSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('📱 Notification tapped (background/killed):', response);
        const notificationData = response.notification.request.content.data;
        console.log('Notification data payload (from tap):', notificationData);

        // Here you might navigate to the EmergencyCasesScreen or a specific report detail screen
        // e.g., router.push(`/emergency-cases/${notificationData.reportId}`);
        // You could also save the data here if it wasn't saved by the foreground listener
        // (though it's usually better to save on receipt if possible).
        // For now, let's assume saving is handled by the foreground listener or a Cloud Function.

        if (notificationData && typeof notificationData === 'object') {
          // Example: If the notification data includes an ID of an already saved report
          const { reportId } = notificationData as { reportId?: string };
          if (reportId) {
              // Potentially navigate to the specific report
              // router.push(`/emergency_cases/${reportId}`); // Adjust your route
              console.log("User tapped notification, potentially for report ID:", reportId);
          } else {
              // Or navigate to the general list if no specific ID
              // router.push('/emergency_cases');
               console.log("User tapped notification, navigating to general emergency list.");
          }
        }
      });
    });

    return () => {
       Notifications.removeNotificationSubscription(foregroundSubscription);
       Notifications.removeNotificationSubscription(backgroundInteractionSubscription);
     };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
