// Test notification function for debugging
// You can call this function to test the notification handling

import * as Notifications from 'expo-notifications';

export const sendTestEmergencyNotification = async () => {
  try {
    console.log('Sending test emergency notification...');
    
    const testNotificationData = {
      type: 'Fire Emergency',
      description: 'Test fire emergency in building',
      location: '123 Test Street',
      barangay: 'Test Barangay',
      reportedBy: 'John Doe',
      reporterContactNumber: '0912-345-6789',
      priority: 'Critical',
      images: ['https://example.com/test-image.jpg'],
      email: 'john.doe@example.com'
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 EMERGENCY ALERT',
        body: 'Fire emergency reported in Test Barangay',
        data: testNotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
      },
      trigger: null, // Show immediately
    });

    console.log('Test notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

export const sendMinimalTestNotification = async () => {
  try {
    console.log('Sending minimal test notification...');
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 EMERGENCY ALERT',
        body: 'Minimal test emergency notification',
        data: {}, // Empty data to test error handling
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
      },
      trigger: null, // Show immediately
    });

    console.log('Minimal test notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending minimal test notification:', error);
    return false;
  }
};
