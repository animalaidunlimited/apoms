importScripts("https://www.gstatic.com/firebasejs/7.15.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.15.1/firebase-messaging.js");



const firebaseConfig = {
apiKey: "AIzaSyB1FEu4JYuoJhxeUpYmNDq8t5EeI3RjAl4",
authDomain: "streettreat.firebaseapp.com",
databaseURL: "https://streettreat.firebaseio.com",
projectId: "streettreat",
storageBucket: "streettreat.appspot.com",
messagingSenderId: "275309609166",
appId: "1:275309609166:web:57881f3451f618d031909f",
measurementId: "G-2FQTQ26YCP"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();



  messaging.setBackgroundMessageHandler(function(payload) {

    let data = JSON.parse(JSON.parse(payload.data.messageData));

    const notificationTitle = data.emergencyNumber + " updated";
    const notificationOptions = {
      body: "An update has been made to outstanding rescue number: " + data.emergencyNumber,
      data: payload.data,
      icon: "assets/images/AAU-with-heart-80x80.jpg",
      images: "assets/images/AAU-with-heart-80x80.jpg",
      click_action : "http://localhost:4200/nav/emergency-register"
    };

    const promiseChain = clients.matchAll({
      type: 'window',
      includeUncontrolled: true
      })
      .then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        windowClient.postMessage(data);
      }
      })
      .then(() => {
        return self.registration.showNotification(notificationTitle,
          notificationOptions);
      });
      return promiseChain;



  });
/*


  messaging.usePublicVapidKey("BPAdCGzx7Ch_XAZQFhIRDjm64GpAZRIbcObwGyrKUKLHBeVGelTe4wF0ypY44kYktdwfntqQWK6JTntu52RGODQ");

  console.log("Service worker");

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/firebase-messaging-sw.js');
    });
  }



*/
  // messaging.getToken().then((currentToken) => {
  //   if (currentToken) {
  //     sendTokenToServer(currentToken);
  //     updateUIForPushEnabled(currentToken);
  //   } else {
  //     // Show permission request.
  //     console.log('No Instance ID token available. Request permission to generate one.');
  //     // Show permission UI.
  //     updateUIForPushPermissionRequired();
  //     setTokenSentToServer(false);
  //   }
  // }).catch((err) => {
  //   console.log('An error occurred while retrieving token. ', err);
  //   showToken('Error retrieving Instance ID token. ', err);
  //   setTokenSentToServer(false);
  // });

  // Callback fired if Instance ID token is updated.
// messaging.onTokenRefresh(() => {
//   messaging.getToken().then((refreshedToken) => {
//     console.log('Token refreshed.');
//     // Indicate that the new Instance ID token has not yet been sent to the
//     // app server.
//     setTokenSentToServer(false);
//     // Send Instance ID token to app server.
//     sendTokenToServer(refreshedToken);
//     // ...
//   }).catch((err) => {
//     console.log('Unable to retrieve refreshed token ', err);
//     showToken('Unable to retrieve refreshed token ', err);
//   });
// });

// sendTokenToServer(token)
// {
//   console.log("Send the token to the server");
// }

