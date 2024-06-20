self.addEventListener('push', event => {
    const data = event.data.json();
    console.log("sw.js")
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/assets/icon.png', // Path to your app's icon
      vibrate: [200, 100, 200],
      tag: 'notification-tag'
    });
  });