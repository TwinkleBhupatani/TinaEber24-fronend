import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {


  constructor() {}

  requestPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else if (permission === 'denied') {
          console.warn('Notification permission denied. You may want to inform the user about notification features.');
        } else {
          console.warn('Notification permission has not been granted or denied yet.');
        }
      });
    }
  }

  sendDriverNotFoundNotification(driverName: string) {
    const title = 'Message for Driver Not Found';
    const body = `Driver ${driverName} not found!`;
    this.sendNotification(title, { body });
  }

  private sendNotification(title: string, options?: any) {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          const mergedOptions = { ...options };
          const notification = new Notification(title, mergedOptions);

          notification.addEventListener('show', () => {
              const audio = new Audio(mergedOptions.sound);
              audio.play();
          });

        } else {
          console.warn('Cannot show notification. Permission not granted.');
        }
      });
    } else {
      console.warn('Notifications not supported by this browser.');
    }
  }
}
