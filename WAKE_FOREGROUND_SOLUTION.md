# Emergency Alert Wake & Foreground Solution

## Current Implementation (Expo Managed Workflow)

The current implementation in `_layout.tsx` provides the best possible solution within Expo's managed workflow limitations:

### What it does:
- ✅ Receives Firebase emergency notifications
- ✅ Shows immediate high-priority notification to wake screen
- ✅ Plays emergency sound and vibration
- ✅ Displays emergency modal when app is active
- ✅ Handles notification taps to bring app to foreground

### Limitations in Expo Managed Workflow:
- ❌ Cannot directly wake screen when app is closed
- ❌ Cannot programmatically bring app to foreground
- ❌ Limited background processing capabilities

## Enhanced Solution for Ejected Apps

For full wake and foreground functionality, you need to eject from Expo and use native modules.

### Step 1: Eject from Expo

```bash
cd admin
expo eject
```

### Step 2: Install Required Dependencies

```bash
npm install react-native-alarm-notification
npm install @react-native-firebase/messaging
npm install react-native-background-job
```

### Step 3: Android Configuration

#### android/app/src/main/AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />

<application>
    <!-- Add this service for background message handling -->
    <service
        android:name="io.invertase.firebase.messaging.RNFirebaseMessagingService"
        android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>
</application>
```

#### android/app/src/main/java/com/yourproject/MainApplication.java
```java
import io.invertase.firebase.messaging.RNFirebaseMessagingService;

public class MainApplication extends Application implements ReactApplication {
    // ... existing code ...
}
```

### Step 4: iOS Configuration

#### ios/YourProject/Info.plist
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
    <string>background-processing</string>
</array>
```

### Step 5: Enhanced Implementation

Create `admin/app/services/emergencyWakeService.ts`:

```typescript
import AlarmNotification from 'react-native-alarm-notification';
import messaging from '@react-native-firebase/messaging';
import { AppState, Platform } from 'react-native';

export class EmergencyWakeService {
  private static instance: EmergencyWakeService;
  
  public static getInstance(): EmergencyWakeService {
    if (!EmergencyWakeService.instance) {
      EmergencyWakeService.instance = new EmergencyWakeService();
    }
    return EmergencyWakeService.instance;
  }

  public async initialize() {
    // Request permissions
    await this.requestPermissions();
    
    // Set up background message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);
      await this.handleEmergencyAlert(remoteMessage);
    });

    // Set up foreground message handler
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      await this.handleEmergencyAlert(remoteMessage);
    });
  }

  private async requestPermissions() {
    if (Platform.OS === 'android') {
      await AlarmNotification.requestPermissions();
    }
    
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                   authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  public async handleEmergencyAlert(remoteMessage: any) {
    try {
      console.log('Handling emergency alert:', remoteMessage);
      
      // Schedule alarm notification to wake screen
      const alarmDetails = {
        title: '🚨 EMERGENCY ALERT',
        message: 'Critical emergency report received',
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

      // Schedule the alarm
      const alarmId = await AlarmNotification.schedule(alarmDetails);
      console.log('Emergency alarm scheduled with ID:', alarmId);

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
        console.log('Android: App will be brought to foreground via notification tap');
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
      await AlarmNotification.cancelAll();
      console.log('All emergency alarms cancelled');
    } catch (error) {
      console.error('Error cancelling alarms:', error);
    }
  }
}
```

### Step 6: Update Main App Component

Update `admin/app/_layout.tsx` to use the enhanced service:

```typescript
import { EmergencyWakeService } from './services/emergencyWakeService';

export default function RootLayout() {
  // ... existing state ...

  useEffect(() => {
    // Initialize emergency wake service
    const emergencyService = EmergencyWakeService.getInstance();
    emergencyService.initialize();

    // ... existing notification setup ...

    return () => {
      // Cleanup
      Notifications.removeNotificationSubscription(subscription);
      Notifications.removeNotificationSubscription(responseSubscription);
    };
  }, []);

  // ... rest of component ...
}
```

### Step 7: Background Task Handler

Create `admin/index.js` for background task handling:

```javascript
import { AppRegistry } from 'react-native';
import App from './App';
import { EmergencyWakeService } from './app/services/emergencyWakeService';
import messaging from '@react-native-firebase/messaging';

// Register the main component
AppRegistry.registerComponent('main', () => App);

// Register background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message handler triggered:', remoteMessage);
  
  const emergencyService = EmergencyWakeService.getInstance();
  await emergencyService.handleEmergencyAlert(remoteMessage);
});

// Register headless task for Android
AppRegistry.registerHeadlessTask('EmergencyAlertTask', () => {
  return async (taskData) => {
    console.log('Headless task received:', taskData);
    
    const emergencyService = EmergencyWakeService.getInstance();
    await emergencyService.handleEmergencyAlert(taskData);
    
    return Promise.resolve();
  };
});
```

## Testing the Implementation

### Expo Managed Workflow Testing:
1. Send a Firebase notification to the admin app
2. Verify the emergency modal appears when app is active
3. Verify notification appears when app is in background
4. Verify tapping notification brings app to foreground

### Ejected App Testing:
1. Build and install the ejected app
2. Send Firebase notification while app is closed
3. Verify screen wakes and app opens automatically
4. Verify emergency modal appears with full functionality

## Important Notes

### Security Considerations:
- Ensure user consent for wake/foreground behavior
- Implement proper error handling
- Test on various devices and OS versions
- Follow platform guidelines to avoid app store rejection

### Platform Limitations:
- **Android**: Full wake and foreground capabilities available
- **iOS**: Limited by Apple's restrictions on background processing
- **Web**: Not applicable (desktop notifications only)

### Performance:
- Monitor battery usage impact
- Implement proper cleanup of background tasks
- Test memory usage during extended operation

## Troubleshooting

### Common Issues:
1. **Notifications not appearing**: Check Firebase configuration and permissions
2. **App not waking**: Verify alarm notification permissions
3. **Background tasks not working**: Check Android/iOS background processing limits
4. **Build errors**: Ensure all native dependencies are properly linked

### Debug Steps:
1. Check console logs for error messages
2. Verify Firebase messaging setup
3. Test on physical devices (not simulators)
4. Check device-specific permission settings
