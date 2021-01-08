const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

exports.sendNotification = functions.firestore
    .document("notifications/{notificationID}")
    .onWrite((change, context) => {
      let fcmToken = "";
      let likedByUserID = "";

      const notificationID = context.params.notificationID;
      const notificationRef = admin.firestore()
          .doc(`notifications/${notificationID}`);
      notificationRef.get().then((document) => {
        likedByUserID = document.data().likedByUserID;
        const authorID = document.data().authorID;
        const authorRef = admin.firestore().doc(`users/${authorID}`);
        return authorRef.get();
      }).then((authorDocument) => {
        fcmToken = authorDocument.data().fcmToken;
        const userRef = admin.firestore().doc(`users/${likedByUserID}`);
        return userRef.get();
      }).then((userDocument) => {
        const userFullName = userDocument.data().name;
        const message = {
          notification: {
            title: "Someone Liked Your Post",
            body: `${userFullName} liked your post now, take a look`,
          },
          data: {
            someRandomValue: "55",
          },
        };
        admin.messaging().sendToDevice(fcmToken, message);
      });
    });
