import { messaging } from './firebase-config';
import { getToken, onMessage } from 'firebase/messaging';

// Replace with your VAPID key from Firebase Console
const VAPID_KEY = "BPoYlmVJrm1CXt8cdW0WI5hGUspoqXVm1o3j5DbubLN57YzR5Rwu6xj9Ftgm236QXe5vX1iFARfNWVagYmoaP8I";

export const requestFirebaseNotificationPermission = async () => {
  try {
    if (Notification.permission === "granted") {
      // Already granted - get token
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      return token;
    }

    if (Notification.permission === "default") {
      // Not asked yet - prompt now
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        console.log("FCM TOKEN " ,token )
        return token;
      } else {
        console.warn("Notification permission denied by user.");
        return null;
      }
    }

    // Permission denied
    console.warn("Notification permission previously denied.");
    return null;

  } catch (error) {
    console.error("Error getting notification permission or token:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
