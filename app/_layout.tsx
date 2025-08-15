import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      // Request permission for iOS (sound, alert, badge)
      if (Platform.OS === 'ios') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: { allowAlert: true, allowSound: true, allowBadge: true },
        });
      }

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
      Alert.alert(
        notification.request.content.title || 'Notification',
        notification.request.content.body || ''
      );

      (async () => {
        const { sound } = await Audio.Sound.createAsync(
          require('../app/assets/notify.mp3') 
        );
        await sound.playAsync();
      })();
    });


    return () => subscription.remove?.();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
