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


//Handle messages whilst the app is in the background. We'll show a notification
//here and also post a message to the angular app so it can be sent to the messaging service.
  messaging.setBackgroundMessageHandler(function(payload) {

    let data = JSON.parse(JSON.parse(payload.data.messageData));

    // const notificationTitle = data.emergencyNumber + " updated";
    // const notificationOptions = {
    //   body: "An update has been made to outstanding rescue number: " + data.emergencyNumber,
    //   data: payload.data,
    //   icon: "assets/images/AAU-with-heart-80x80.jpg",
    //   images: "assets/images/AAU-with-heart-80x80.jpg",
    //   click_action : "http://localhost:4200/nav/emergency-register"
    // };

    //Find the correct tab and send a postmessage so it can be sent on to the service.
    const promiseChain = clients.matchAll({
      type: 'window',
      includeUncontrolled: true
      })
      .then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        windowClient.postMessage(data);
      }
      });
      // .then(() => {
      //   return self.registration.showNotification(notificationTitle,notificationOptions);
      // });
      return promiseChain;



  });
