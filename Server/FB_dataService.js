const dotenv = require('dotenv');
const { firestore } = require('firebase-admin');
dotenv.config();

const firebaseAdmin = require('firebase-admin');
const serviceAccount = require("./fbServiceAccountKey.json");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: process.env.FBDATABASEURL,
});

const db = firebaseAdmin.database();
const fs = firebaseAdmin.firestore();


// data: socket.handshake.query(phoneNumber. userUID, displayNAme, photoURL )
exports.searchUser = async (data) => {
  const result = await firebaseAdmin.auth().getUser(data.userUID)
    .then((userRecord) => {
      if (userRecord.uid === data.userUID && userRecord.displayName === data.displayName && userRecord.phoneNumber === data.phoneNumber) {
        return true;
      }
      return false;
    })
    .catch(err => {
      console.log('err!!', err);
      return false;
    });

  return result;
}

exports.loadChatRooms = async (namespace) => {
  try {
    const roomSet = [];
    await db.ref(`chatRooms/${namespace}`)
      .once('value')
      .then(snapshot => {
        snapshot.forEach(el => {
          // ?? 왜 ??
          if (el.val().state !== 0) {
            let pushData = {
              roomId: el.key,
              title: el.val().title,
              count: 0,
              max: el.val().max,
            }
            if (el.val().createdBy === 'admin') pushData.createdBy = el.val().createdBy;
            if (el.val().password) pushData.password = el.val().password;
            roomSet.push(pushData);
          };

        })
      });
    return roomSet;
  } catch (err) {
    console.log('error Occured!', err.code, '\n', err);
    return err;
  }
};

exports.createRoom = async (scheduleUID, userUID, title, password, max) => {
  if (!scheduleUID || !title || !userUID) return;
  let result = {};
  try {
    const refKey = await db.ref(`chatRooms/${scheduleUID}`).push().key;
    const roomData = {
      roomId: refKey,
      createdBy: userUID,
      title,
      state: 1,
      count: 0,
      max
    };
    if (password) roomData.password = password;

    await db.ref(`chatRooms/${scheduleUID}/${refKey}`)
      .set(roomData, (err) => {
        if (err) {
          result.err = '채팅방 생성에 실패하였습니다.';
          console.log('error Occured! - createRoom fb', err)
        } else {
          result.key = refKey;
        }
      })
    return result;
  } catch (err) {
    console.log('err Occured!', err);
    result.err = '채팅방 생성에 실패하였습니다.';
    return result;
  }
};

exports.hibernateRoom = (scheduleUID, roomUID) => {
  if (roomUID.length != 20) return;   // => regex 변환
  const chatRoomRef = db.ref(`chatRooms/${scheduleUID}/${roomUID}`);
  return chatRoomRef.update({
    state: 0,
  });
};

// Transaction 전환 - https://firebase.google.com/docs/database/admin/save-data?hl=ko
exports.updateClientCount = (scheduleUID, roomUID, count) => {
  if (roomUID.length != 20) return;
  const chatRoomRef = db.ref(`chatRooms/${scheduleUID}/${roomUID}`);
  return chatRoomRef.update({
    count,
  });
};

exports.uploadAggro = (userUID, titleBroad, msg, count) => {
  console.log(userUID, titleBroad, msg, count);
  const aggroRef = fs.collection('aggros').doc(userUID).collection('lists');
  const aggroData = {
    titleBroad,
    msg,
    count,
    createdAt: firestore.FieldValue.serverTimestamp(),
    rCreatedAt: new Date() * -1,
  };
  aggroRef.add(aggroData)
    .catch(err => {
      console.error('[Err] Aggro Uploader Err', err);
    });
}