import { AppState, Platform } from 'react-native';

// Note: These imports will only work after ejecting from Expo
// import AlarmNotification from 'react-native-alarm-notification';
// import messaging from '@react-native-firebase/messaging';

export interface EmergencyAlertData {
  type: string;
  description: string;
  location: string;
  barangay: string;
  reportedBy: string;
  reporterContactNumber: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  images?: string[];
  email: string;
}

export class EmergencyWakeService {
  private static instance: EmergencyWakeService;
  private isInitialized = false;
  
  public static getInstance(): EmergencyWakeService {
    if (!EmergencyWakeService.instance) {
      EmergencyWakeService.instance = new EmergencyWakeService();
    }
    return EmergencyWakeService.instance;
  }

  public async initialize() {
    if (this.isInitialized) {
      console.log('EmergencyWakeService already initialized');
      return;
    }

    try {
      console.log('Initializing EmergencyWakeService...');
      
      // Request permissions
      await this.requestPermissions();
      
      // Set up background message handler (only works after ejecting)
      // messaging().setBackgroundMessageHandler(async remoteMessage => {
      //   console.log('Background message received:', remoteMessage);
      //   await this.handleEmergencyAlert(remoteMessage.data);
      // });

      // Set up foreground message handler (only works after ejecting)
      // messaging().onMessage(async remoteMessage => {
      //   console.log('Foreground message received:', remoteMessage);
      //   await this.handleEmergencyAlert(remoteMessage.data);
      // });

      this.isInitialized = true;
      console.log('EmergencyWakeService initialized successfully');
    } catch (error) {
      console.error('Error initializing EmergencyWakeService:', error);
    }
  }

  private async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        // Request alarm notification permissions (only works after ejecting)
        // await AlarmNotification.requestPermissions();
        console.log('Android permissions requested (requires ejected app)');
      }
      
      // Request Firebase messaging permissions (only works after ejecting)
      // const authStatus = await messaging().requestPermission();
      // const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //                authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      console.log('Firebase messaging permissions requested (requires ejected app)');
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  public async handleEmergencyAlert(alertData: EmergencyAlertData) {
    try {
      console.log('Handling emergency alert:', alertData);
      
      // Schedule alarm notification to wake screen (only works after ejecting)
      const alarmDetails = {
        title: '🚨 EMERGENCY ALERT',
        message: `Emergency: ${alertData.type} in ${alertData.barangay}`,
        channel: 'emergency',
        small_icon: 'ic_launcher',
        large_icon: 'ic_launcher',
        color: 'red',
        sound: 'default',
        vibrate: true,
        vibration: 200,
        tag: 'emergency_alert',
        play_sound: true,
        sound_name: 'default',
        schedule_type: 'once',
        fire_date: Date.now() + 1000, // 1 second delay
        actions: [
          {
            id: 'view',
            title: 'View Report',
            launch: true,
          },
          {
            id: 'dismiss',
            title: 'Dismiss',
            launch: false,
          }
        ]
      };

      // Schedule the alarm (only works after ejecting)
      // const alarmId = await AlarmNotification.schedule(alarmDetails);
      // console.log('Emergency alarm scheduled with ID:', alarmId);

      console.log('Emergency alarm details prepared (requires ejected app):', alarmDetails);

      // Try to bring app to foreground
      await this.bringAppToForeground();

    } catch (error) {
      console.error('Error handling emergency alert:', error);
    }
  }

  private async bringAppToForeground() {
    try {
      if (Platform.OS === 'android') {
        // For Android, we can use the alarm notification to bring app to foreground
        // The notification tap will automatically bring the app to foreground
        console.log('Android: App will be brought to foreground via notification tap (requires ejected app)');
      } else if (Platform.OS === 'ios') {
        // iOS has stricter limitations
        console.log('iOS: Limited foreground capabilities due to platform restrictions');
      }
    } catch (error) {
      console.error('Error bringing app to foreground:', error);
    }
  }

  public async cancelAllAlarms() {
    try {
      // Cancel all alarms (only works after ejecting)
      // await AlarmNotification.cancelAll();
      console.log('All emergency alarms cancelled (requires ejected app)');
    } catch (error) {
      console.error('Error cancelling alarms:', error);
    }
  }

  public async scheduleTestAlarm() {
    try {
      console.log('Scheduling test alarm (requires ejected app)');
      
      const testAlarmDetails = {
        title: 'Test Emergency Alert',
        message: 'This is a test emergency alert',
        channel: 'emergency',
        small_icon: 'ic_launcher',
        large_icon: 'ic_launcher',
        color: 'blue',
        sound: 'default',
        vibrate: true,
        vibration: 100,
        tag: 'test_emergency',
        play_sound: true,
        sound_name: 'default',
        schedule_type: 'once',
        fire_date: Date.now() + 5000, // 5 seconds delay
      };

      // Schedule test alarm (only works after ejecting)
      // const alarmId = await AlarmNotification.schedule(testAlarmDetails);
      // console.log('Test alarm scheduled with ID:', alarmId);
      
      console.log('Test alarm details prepared (requires ejected app):', testAlarmDetails);
    } catch (error) {
      console.error('Error scheduling test alarm:', error);
    }
  }

  public isServiceAvailable(): boolean {
    // This will return true only after ejecting and installing native dependencies
    return false; // Change to true after ejecting and installing dependencies
  }
}
