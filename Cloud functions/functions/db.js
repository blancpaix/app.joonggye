const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const { firestore } = require('firebase-admin');
const fs = admin.firestore();
fs.settings({ ignoreUndefinedProperties: true });
const db = admin.database();


exports.trxRemoveEndedPrograms = async () => {
  const scheduleRef = fs.collection('onAir').where('endAt', '<', new Date());
  scheduleRef.get()
    .then(docs => {
      const batch = fs.batch();
      docs.forEach(doc => {
        db.ref(`chatRooms/${doc.id}`).remove();
        batch.delete(doc.ref);
      });
      return batch.commit();
    })
    .catch(() => {
      // console.error('Error!', err);
      functions.logger.error(`ERR@DEL trxRemoveEndedPrograms`)
    })
};

exports.trxMoveOntimeSchedules = async () => {
  const copyBatch = fs.batch();
  const deleteBatch = fs.batch();
  const copyTargetRef = fs.collection('weeklySchedules')
    .where('startAt', '<=', new Date())

  copyTargetRef.get()
    .then(docs => {
      docs.forEach(doc => {
        const targetRef = fs.collection('onAir').doc(doc.id);
        copyBatch.set(targetRef, doc.data());

        const deleteRef = fs.collection('weeklySchedules').doc(doc.id);
        deleteBatch.delete(deleteRef);
      })
      return;
    })
    .then(() => {
      return copyBatch.commit();
    })
    .then(() => {
      return deleteBatch.commit();
    })
    .catch(() => {
      // console.error('error! in Docs', err);
      functions.logger.error(`ERR@DEL trxMoveOntimeSchedules`)
    })

  return;
};

/**
 * @returns {boolean} - 크롤링 활성화 여부 확인
 */
exports.isCrawling = async () => {
  const stateRef = fs.collection('crawler').doc('state');
  const result = await stateRef.get()
    .then(doc => {
      if (doc.exists) {
        return doc.data().crawling;
      } else {
        return true;
      }
    });

  return result;
};

/**
 * @returns {boolean} - 크롤링 활성화
 */
exports.initCrawler = async () => {
  const result = await fs.collection('crawler').doc('state')
    .set({
      crawling: true
    })
    .then(() => {
      return true;
    })
    .catch(() => {
      functions.logger.error(`ERR@FS [SET /state] - initCrawler : `, err);
      return false;
    });

  return result;
};

/**
 * @returns {boolean} - 크롤링 비활성화
 */
exports.pauseCrawler = async () => {
  const result = await fs.collection('crawler').doc('state')
    .set({
      crawling: false
    })
    .then(() => {
      return true;
    })
    .catch(() => {
      // console.log('Error! initCrawler', err);
      functions.logger.error(`ERR@FS [SET /crawler] - pauseCrawler : `, err);
      return false;
    });

  return result;
};

/**
 * @param {Date(YYYYMMDD)} date 
 * new Date().toISOString().substring(0,10).replace(/-/g,'');
 * @param {Array: string} dueList 
 * @returns {boolean} - 크롤링 비활성화
 */
exports.completeCrawler = async (date, dueList) => {
  const result = await fs.collection('crawler').doc('state')
    .set({
      crawling: false
    })
    .then(() => {
      createCrawlDate(date, dueList);
      return true;
    })
    .catch((err) => {
      functions.logger.error(`ERR@FS [SET /completeCrawler] : `, date, err);
      return false;
    });

  return result;
};

/**
 * @param {Date(YYYYMMDD)} date 
 * @param {Array: string} dueList 
 */
const createCrawlDate = async (date, dueList) => {
  await fs.collection('crawler').doc(date)
    .set({
      dueList,
      createdAt: firestore.Timestamp.now()
    })
    .catch(err => {
      functions.logger.error(`ERR@FS [SET /cralwer] : `, date, err);
      return;
    })
};

/**
 * @param {Date(YYYYMMDD)} date 
 * @returns {Array:string || false || null}
 * 해당일자 크롤링 기록 존재 && 남은 크롤링 목록 존재 : Array
 * 해당일자 크롤링 기록 존재 && 남은 크롤링 목록 없음 : false
 * 해당일자 크롤링 기록 없음 : null
 */
exports.getCrawlingDueList = async (date) => {
  const ref = fs.collection('crawler').doc(date);
  const result = await ref.get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        if (data.dueList && data.dueList.length > 0) {
          return data.dueList;
        } else {
          return false;
        }
      } else {
        return null;
      }
    });

  if (typeof result === "object") {
    return result;
  } else {
    return false;
  }
};

/**
 * @param {string} broadTitle 
 * @returns Program data
 */
exports.loadProgramData = async (broadTitle) => {
  const programRef = fs.collection('programs').where('broad_title', '==', `${broadTitle}`);
  const programData = await programRef.get()
    .then(doc => {
      if (!doc.empty) {
        return Object.assign({ id: doc.docs[0].id }, { data: doc.docs[0].data() })
      } else {
        return null;
      }
    })
    .catch(() => {
      // console.error(`ERR@FS [GET /[programs/.] : ${broadTitle}`);
      functions.logger.error(`ERR@FS [GET /[programs/.] : ${broadTitle}`);
      return null;
    });

  return programData;
};

/**
 * @param {Program} programData 
 * @returns {string} programUID
 */
exports.createProgram = async (programData) => {
  const programId = await fs.collection('programs')
    .add(programData)
    .then(ref => {
      return ref.id;
    })
    .catch(() => {
      /* console.error(`ERR@FS [CREATE /programs/.] : ${programData.broad_title}`); */
      functions.logger.error(`ERR@FS [CREATE /programs/.] : ${programData.broad_title}`);
    });

  return programId;
};

/**
 * @param {string} programUID 
 */
exports.createFavoriteProgramCountor = async (programUID) => {
  await fs.collection('favoriteCounts').doc(`${programUID}`)
    .set({ likes: 0 })
    .then(() => {
      return;
    })
    .catch(() => {
      // console.error(`ERR@FS [CREATE /FavoriteCounts/.] : ${programUID}`)
      functions.logger.error(`ERR@FS [CREATE /FavoriteCounts/.] : ${programUID}`)
      return;
    })
};

/**
 * @param {object: {
 *  subTitle1?: string,
 *  subTitle2?: string,
 *  re?: boolean,
 *  special?: boolean,
 *  startAt: Date,
 *  endAt: Date,
 * }} scheduleData 
 * @param {Program} programData 
 */
exports.addScheduleDataInDB = async (scheduleData, programData) => {
  let scheduleUID;

  const filteredScheduleData = {
    subTitle1: scheduleData.subTitle1,
    subTitle2: scheduleData.subTitle2,
    re: scheduleData.re,
    special: scheduleData.special,
    startAt: firestore.Timestamp.fromDate(new Date(scheduleData.sDate + " " + scheduleData.sTime)),
    endAt: firestore.Timestamp.fromDate(new Date(scheduleData.eDate + " " + scheduleData.eTime)),
  };
  if (filteredScheduleData.re) filteredScheduleData.re = true;
  if (filteredScheduleData.special) filteredScheduleData.special = true;

  if (!programData.programUID) {
    delete programData.broad_title;
    delete programData.airTime;
    createWeeklySchedule(null, programData, filteredScheduleData)
  } else {
    await fs.collection('programs').doc(`${programData.programUID}`).collection('schedules')
      .add(filteredScheduleData)
      .then((doc) => {
        return scheduleUID = doc.id;
      })
      .then(() => {
        delete programData.broad_title;
        delete programData.airTime;
        createWeeklySchedule(scheduleUID, programData, filteredScheduleData);
        return;
      })
      .then(() => {
        return;
      })
      .catch(() => {
        // console.error(`ERR@addScheduleDataInDB`);
        functions.logger.error(`ERR@addScheduleDataInDB : ${programData.broadcastor}_${programData.title}  `)
      })
  }
};

/**
 * @param {string} scheduleUID 
 * @param {Program} programData 
 * @param {object: {
 *  subTitle1?: string,
 *  subTitle2?: string,
 *  re?: boolean,
 *  special?: boolean,
 *  startAt: Timestamp,
 *  endAt: Timestamp,
 * }} scheduleData 
 */
const createWeeklySchedule = async (scheduleUID, programData, scheduleData) => {
  if (scheduleUID) {
    fs.collection('weeklySchedules').doc(`${scheduleUID}`)
      .set(Object.assign(programData, scheduleData))
      .then(() => {
        createChatRoom(programData, scheduleUID);
        return;
      })
      .catch(() => {
        // console.error(`ERR@FS [CREATE /weeklySchedules] : ${programData.broadcastor}_${programData.title} - ${scheduleUID} `)
        functions.logger.error(`ERR@FS [CREATE /weeklySchedules] : ${programData.broadcastor}_${programData.title} - ${scheduleUID} `)
        return;
      })
  } else {
    fs.collection('weeklySchedules')
      .add(Object.assign(programData, scheduleData))
      .then((docRef) => {
        createChatRoom(programData, docRef.id);
        return;
      })
      .catch(() => {
        // console.error(`ERR@FS [CREATE /weeklySchedules NotExisting] : ${programData.broadcastor}_${programData.title} `)
        functions.logger.error(`ERR@FS [CREATE /weeklySchedules NotExisting] : ${programData.broadcastor}_${programData.title} `)
        return;
      })
  }
};

/**
 * @param {Program} programData 
 * @param {string} scheduleUID 
 */
const createChatRoom = async (programData, scheduleUID) => {
  const chatRoomKey = admin.database().ref(`chatRooms/${scheduleUID}`).push().key;
  db.ref(`chatRooms/${scheduleUID}/${chatRoomKey}`)
    .set({
      roomId: chatRoomKey,
      title: programData.title + ' 중계 1',
      count: 0,
      createdBy: 'admin',
      max: 100,
      state: 1,
    })
    .then(() => {
      return;
    })
    .catch(() => {
      // console.error(`ERR@RDB [CREATE /chatrooms] : ${programData.broadcastor}_${programData.title}  `)
      functions.logger.error(`ERR@RDB [CREATE /chatrooms] : ${programData.broadcastor}_${programData.title}  `)
    })
};

/**
 * @param {Array:Program} scheduleSet - 크롤링된 방송사 별 편성표
 * @param {string} broadcastor 
 * @param {Map} tvGuideGroupByBroadcastorMap 
 * @param {object: {Success: Array, Fail: Array}} crawlerResult 
 * @returns {boolean} 정상적 종료 여부 확인
 */
exports.addTvGuideInDB = async (scheduleSet, broadcastor, tvGuideGroupByBroadcastorMap, crawlerResult) => {
  const airDate = scheduleSet[0].sDate;
  let broadcastorAirTable = [];

  scheduleSet.map(el => {
    broadcastorAirTable.push({
      title: el.title,
      sTime: el.sTime,
      limit: el.limit,
      genre: el.genre,
      subTitle1: el.subTitle1,
      subTitle2: el.subTitle2,
    })
  });

  let result;
  try {
    result = await fs_addAirTable(airDate, broadcastor, broadcastorAirTable, crawlerResult);
  } catch (err) {
    functions.logger.error(`ERR@FS [ADD /AirTable] : ${airDate}@${broadcastor}`)
  } finally {
    tvGuideGroupByBroadcastorMap.delete(`${broadcastor}`)
  }

  return result;
};

/**
 * @param {string} programUID 
 * @param {object: {
 *  ...scheduleData,
 *  airTime: Date,
 * }} scheduleData 
 */
exports.updateAirTime = async (programUID, scheduleData) => {
  await fs.collection('programs').doc(`${programUID}`)
    .set({
      airTime: scheduleData.airTime
    }, { merge: true })
    .then(() => {
      return;
    })
    .catch(() => {
      // console.error(`ERR@FS [UPDATE /programs/.airTime] : ${scheduleData.broad_title}`)
      functions.logger.error(`ERR@FS [UPDATE /programs/.airTime] : ${scheduleData.broad_title}`)
      return;
    })
};

/**
 * @param {Date(YYYYMMDD)} airDate 
 * @param {string} broadcastor 
 * @param {Array:Schedule} airTable 
 * @param {boolean} crawlerResult 
 * @returns {boolean} 정상적 종료 여부 확인
 */
const fs_addAirTable = async (airDate, broadcastor, airTable, crawlerResult) => {
  const result = await fs.collection(`airTable`).doc(`${airDate}@${broadcastor}`)
    .set({ airTable })
    .then(() => {
      functions.logger.info('addTvGuideInDB complete -Broadcastor: ', broadcastor);
      crawlerResult.Fail = crawlerResult.Fail.filter(el => el !== broadcastor);
      crawlerResult.Success.push(broadcastor);

      return true;
    })
    .catch(() => {
      // console.log('Error! in addAirTable function', err);
      functions.logger.error(`ERR@FS [ADD /airTable] : ${broadcastor}`);
      return false;
    });

  return result;
};
