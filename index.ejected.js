// Background task handler for ejected React Native app
// This file should be used as index.js after ejecting from Expo

import { AppRegistry } from 'react-native';
import App from './App';
import { EmergencyWakeService } from './app/services/emergencyWakeService';

// Note: These imports will only work after ejecting from Expo and installing dependencies
// import messaging from '@react-native-firebase/messaging';

// Register the main component
AppRegistry.registerComponent('main', () => App);

// Background message handler (only works after ejecting)
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Background message handler triggered:', remoteMessage);
  
//   const emergencyService = EmergencyWakeService.getInstance();
//   await emergencyService.handleEmergencyAlert(remoteMessage.data);
// });

// Register headless task for Android (only works after ejecting)
AppRegistry.registerHeadlessTask('EmergencyAlertTask', () => {
  return async (taskData) => {
    console.log('Headless task received:', taskData);
    
    const emergencyService = EmergencyWakeService.getInstance();
    await emergencyService.handleEmergencyAlert(taskData);
    
    return Promise.resolve();
  };
});

// Alternative background task registration (only works after ejecting)
// AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => {
//   return async (message) => {
//     console.log('Firebase background message received:', message);
    
//     const emergencyService = EmergencyWakeService.getInstance();
//     await emergencyService.handleEmergencyAlert(message.data);
    
//     return Promise.resolve();
//   };
// });

console.log('Background task handlers registered (requires ejected app)');
