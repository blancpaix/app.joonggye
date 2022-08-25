import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

/**
 * @param {object: {
 *  displayName: string,
 *  photoURL?: string
 * }} updateInfo 
 * @returns {boolean} 업데이트 여부
 */
export const FB_updateProfile = async (updateInfo) => {
  const result = await auth().currentUser.updateProfile(updateInfo)
    .then(() => {
      return auth().currentUser;
    })
    .catch(err => {
      throw Error('업데이트에 실패하였습니다.');
    });

  return result;
};

/**
 * @param {object: {
 *  phoneNumber: string,
 *  img: object
 * }} updateInfo 
 * @returns {string} 파일이름
 */
// param: { phoneNumber: String, img: Object }
export const FB_uploadProfileImg = async ({ phoneNumber, img }) => {
  const uploadPath = storage().ref(`thn128/${phoneNumber}_${img.modificationDate}.png`);
  const imgPath = img.path;
  const task = await uploadPath.putFile(imgPath)
    .catch(err => {
      throw Error('업데이트에 실패하였습니다.');
    });

  return task.metadata.name;
};

export const FB_dropout = async () => {
  await auth().currentUser.delete()
    .then(() => {
      return;
    })
    .catch(err => {
      throw Error('회원 탈퇴에 실패하였습니다.');
    });
};

/**
 * @param {string} programUID 
 * @returns {int} 해당 프로그램의 좋아요 수
 */
export const FB_loadFavCnt = async (programUID) => {
  const favCntRef = firestore().collection('favoriteCounts').doc(programUID);
  const countData = await favCntRef
    .get()
    .catch(err => {
      throw Error('불러오는데 실패하였습니다.');
    });
  if (!countData.exists) throw '프로그램을 찾을 수 없습니다.';
  return countData.data().likes;
};

/**
 * @param {string} userUID 
 * @param {string} programUID 
 * @param {string} titleBroad 
 */
export const FB_trxAddFavProgram = async (userUID, programUID, titleBroad) => {
  const increment = firestore.FieldValue.increment(1);
  const favCntRef = firestore().collection('favoriteCounts').doc(programUID);
  const favRef = firestore().collection('favorites').doc(userUID).collection('lists').doc(programUID);
  const createdAt = firestore.FieldValue.serverTimestamp();

  const favData = { titleBroad, createdAt };

  return firestore().runTransaction(async trx => {
    const programSnapshot = await trx.get(favCntRef);
    if (!programSnapshot.exists) throw '대상이 존재하지 않습니다.'
    await trx.update(favCntRef, {
      likes: increment,
    });
    await trx.set(favRef, favData)
  })
    .catch(err => {
      throw Error('업데이트에 실패하였습니다');
    });
};

/**
 * @param {string} userUID 
 * @param {string} programUID 
 */
export const FB_trxDelFavProgram = async (userUID, programUID) => {
  const decrement = firestore.FieldValue.increment(-1);
  const favCntRef = firestore().collection('favoriteCounts').doc(programUID);
  const favRef = firestore().collection('favorites').doc(userUID).collection('lists').doc(programUID);

  return firestore().runTransaction(async trx => {
    const programSnapshot = await trx.get(favCntRef);

    if (!programSnapshot.exists) throw '대상이 존재하지 않습니다.'
    await trx.update(favCntRef, {
      likes: decrement,
    });
    await trx.delete(favRef)
  })
    .catch(err => {
      throw Error('업데이트에 실패하였습니다');
    });
};

/**
 * @param {string} programName 
 * @returns {Array: Program} 프로그램 검색 결과 목록
 */
export const FB_searchByTitle = async (programName) => {
  const result = [];
  await firestore().collection('programs').orderBy('title')
    .startAt(programName)
    .endAt(programName + '\uf8ff')
    .limit(10)
    .get()
    .then(docs => {
      docs.forEach(doc => {
        result.push({ programUID: doc.id, ...doc.data() })
      })
    })
    .catch(err => {
      throw Error('찾는데 오류가 발생했습니다');
    });

  return result;
}

/**
 * @param {string} dateBroadcastor
 * @returns {Array: schedule} 방송사의 해당일자 방송 편성표
 */
export const FB_loadAirTable = async (dateBroadcastor) => {
  const airTable = await firestore().collection('airTable').doc(`${dateBroadcastor}`).get();
  if (!airTable.exists) throw '방송사의 데이터를 찾을 수 없습니다.';
  return airTable.data();
};

/**
 * @param {string} userUID 
 * @returns {Array: Favorites} 좋아하는 프로그램 목록
 */
export const FB_loadFavorites = async (userUID) => {
  const ref = firestore().collection('favorites').doc(userUID).collection('lists');
  const dataArr = [];
  await ref.get()
    .then(docuSnapshot => {
      if (!docuSnapshot.empty) {
        docuSnapshot.forEach(docu => {
          const mergeData = Object.assign(
            { id: docu.id },
            {
              titleBroad: docu.data().titleBroad,
              createdAt: docu.data().createdAt.toDate()
            }
          );
          dataArr.unshift(mergeData);
        });
      }
    })
    .catch(err => {
      throw Error('불러오기에 실패하였습니다.');
    })
    ;

  return dataArr;
}


let limitCount = 12;
let lastLoadedAggro = null;
let isEndAggros = false;

/**
 * @param {string} userUID 
 * @returns {Array: Aggro} 해당 유저의 저장된 어그로 목록
 */
export const FB_loadAggros = async (userUID) => {
  const ref = firestore().collection('aggros').doc(userUID).collection('lists').orderBy('rCreatedAt').limit(limitCount).startAfter(lastLoadedAggro);
  const aggros = await ref.get()
    .then(docuSnapshot => {
      if (!docuSnapshot.empty) {
        const dataArr = [];
        docuSnapshot.forEach(docu => {
          const aggroData = {
            id: docu.id,
            createdAt: docu.data().createdAt.toDate(),
            down: docu.data().down,
            msg: docu.data().msg,
            titleBroad: docu.data().titleBroad,
            up: docu.data().up,
          };
          dataArr.push(aggroData);
        });
        if (docuSnapshot.size !== limitCount) isEndAggros = true;
        lastLoadedAggro = docuSnapshot.docs[docuSnapshot.size - 1];

        return dataArr;
      } else {
        return null;
      }
    })
    .catch(err => {
      throw Error('불러오기에 실패하였습니다.');
    });

  return { aggros, isEnd: isEndAggros }
}

/**
 * @returns {Array: Notice} 공지사항 목록
 */
export const FB_loadNotices = async () => {
  const ref = firestore().collection('notices').orderBy('rCreatedAt').limit(limitCount);
  const notices = await ref.get()
    .then(docuSnapshot => {
      if (!docuSnapshot.empty) {
        const dataArr = [];
        docuSnapshot.forEach(docu => {
          const noticeData = {
            id: docu.id,
            title: docu.data().title,
            content: docu.data().content,
            img: docu.data().img,
            createdAt: docu.data().createdAt.toDate(),
          }
          dataArr.push(noticeData);
        });
        return dataArr;
      }
    })
    .catch(err => {
      throw Error('불러오기에 실패하였습니다.');
    });

  return notices;
};

/**
 * @returns {Terms} 서비스 이용약관
 */
export const FB_loadTerms = async () => {
  const termRef = firestore().collection('terms').doc('service');
  const result = await termRef.get().then((doc) => {
    if (doc.exists) {
      return doc.data().gistPath;
    } else {
      throw Error('불러오기에 실패하였습니다.');
    }
  })
    .catch(err => {
      throw Error('불러오기에 실패하였습니다.');
    });

  return result;
};