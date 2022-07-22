const functions = require('firebase-functions');
const puppeteer = require('puppeteer');
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


const tvGuideGroupByBroadcastorMap = new Map();
const RGX_notOnAir = /^방송\s?시간이/g;

const currentDate = new Date();
currentDate.setHours(currentDate.getHours() + 9);   // timezone 한국으로 이렇게라도 변경
const nextDate = new Date();
nextDate.setHours(nextDate.getHours() + 33);

const initPuppeteer = async () => {
  functions.logger.info('== LAUNCH PUPPETEER ==')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const openedPages = await browser.pages();
  if (openedPages) await Promise.all(openedPages.map(thisPage => thisPage.close()));
  const page = await browser.newPage();

  try {
    const broadcastorSet = [
      ['SBS', 101, `.result-area > ul > li:nth-child(1)`],
      ['KBS2', 131, `.result-area > ul > li:nth-child(31)`],
      ['KBS1', 132, `.result-area > ul > li:nth-child(32)`],
      ['MBC', 152, `.result-area > ul > li:nth-child(52)`],
      ['EBS1', 172, `.result-area > ul > li:nth-child(72)`],
      ['EBS2', 178, `.result-area > ul > li:nth-child(78)`],
      ['JTBC', 173, `.result-area > ul > li:nth-child(73)`],
      ['MBN', 174, `.result-area > ul > li:nth-child(74)`],
      ['채널A', 175, `.result-area > ul > li:nth-child(75)`],
      ['TV조선', 176, `.result-area > ul > li:nth-child(76)`],
    ];

    const page = await browser.newPage();
    await page.goto('https://www.lguplus.com/iptv/channel-guide', { waitUntil: "networkidle2" });
    await page.click('.c-tab-slidemenu > ul > li:nth-child(2)');
    await page.waitFor(2000);
    // 내일거를 해야 하는데.. 일단은 오늘걸로 하자

    for (let br = 0; br < broadcastorSet.length; br++) {
      await page.click(broadcastorSet[br][2]);
      // deprecated waitFor
      await page.waitFor(1000);

      const broadcastor = broadcastorSet[br][0];

      const targetDayString = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();

      const scheduleSet = await page.evaluate(({ broadcastor, targetDayString, dayOfWeek }) => {
        const RGX_specialRemover = /[\{\}\[\]\(\)\<\>\|\\\=\'\"]/g;
        const RGX_starting = /[1]부/g;
        const RGX_continue = /[2-9]부/g;
        const RGX_inning = /\d+[회화]/g;
        const RGX_isRe = /\<재\>\s?$/g;
        const RGX_special = /\s스페셜\s?$/g;
        const RGX_braket = /.\[.+.*\]?/g;
        const RGX_parenthese = /\(.+.*\)?/g;
        let isContinue = false;

        const speicalRemover = (title) => {
          if (RGX_specialRemover.test(title)) {
            return title.replace(RGX_specialRemover, " ").trim();
          } else {
            return title.trim();
          }
        }

        const scheduleTable = document.querySelectorAll('.table-bordered > tbody > tr');
        const filteredScheduleTable = [];

        for (let i = 0; i < scheduleTable.length; i++) {
          if (i > 0) {
            filteredScheduleTable[filteredScheduleTable.length - 1].eTime = scheduleTable[i].querySelector('tr > td:nth-child(1)').innerText.trim();   // endTime
            filteredScheduleTable[filteredScheduleTable.length - 1].eDate = targetDayString;                                            // endDate
          }
          let title = scheduleTable[i].querySelector('tr > td:nth-child(2)').firstChild.firstChild.data.trim();
          if (title.match(RGX_continue) && isContinue) {
            continue;
          } else {
            isContinue = false;
          }
          let sTime = scheduleTable[i].querySelector('tr > td:nth-child(1)').innerText.trim();                                          // startTime
          let subTitle1;
          let subTitle2;
          let special;
          let re;

          if (RGX_isRe.test(title)) {
            title = title.replace(RGX_isRe, "");
            re = true;
          }
          if (RGX_starting.test(title)) {
            isContinue = true;
            title = title.replace(RGX_starting, "");
          }
          if (RGX_inning.test(title)) {
            subTitle1 = title.match(RGX_inning)[0];
            title = title.replace(RGX_inning, "");
          }
          if (RGX_braket.test(title)) {
            subTitle2 = title.match(RGX_braket)[0];
            title = title.replace(RGX_braket, "");
          }
          if (RGX_parenthese.test(title)) {
            const matching = title.match(RGX_parenthese)[0];
            if (subTitle1) {
              subTitle1 = subTitle1 + matching;
            } else {
              subTitle1 = matching;
            }
            title = title.replace(RGX_parenthese, "");
          }

          title = speicalRemover(title);
          if (subTitle1) subTitle1 = speicalRemover(subTitle1);
          if (subTitle2) subTitle2 = speicalRemover(subTitle2);

          if (RGX_special.test(title)) {
            title = title.replace(RGX_special, "");
            special = true;
          }

          const filteredProgramData = {
            broad_title: `${broadcastor}_${title}`,
            title,
            subTitle1,
            subTitle2,
            re,
            special,
            limit: scheduleTable[i].querySelector('tr > td:nth-child(2) div > small').innerText.trim(),
            genre: scheduleTable[i].querySelector('tr > td:nth-child(3)').innerText.trim(),
            sTime,                    // startTime
            sDate: targetDayString,   // startDate
            airTime: { [dayOfWeek]: sTime },
          };

          filteredScheduleTable.push(filteredProgramData);
        }

        return filteredScheduleTable;
      }, { broadcastor, targetDayString, dayOfWeek });

      await page.waitFor(1000);
      await page.click('.slide-area > div:nth-child(1) > .swiper-container > .swiper-wrapper > li:nth-child(7)');

      const endTime = await page.evaluate(() => {
        const continueRegex = /^.+[2-9]+부/g;
        const scheduleTable = document.querySelectorAll('.table-bordered > tbody > tr');
        let endAtIndex = 0;
        for (let i = endAtIndex; i < scheduleTable.length; i++) {
          if (!scheduleTable[i].querySelector('tr > td:nth-child(2)').firstChild.firstChild.data.match(continueRegex)) break;
        }

        return scheduleTable[endAtIndex].querySelector('tr > td:nth-child(1)').innerText.trim();
      });

      const targetNextDayString = nextDate.toISOString().split('T')[0];
      scheduleSet[scheduleSet.length - 1].eDate = targetNextDayString;
      scheduleSet[scheduleSet.length - 1].eTime = endTime;

      tvGuideGroupByBroadcastorMap.set(`${broadcastor}`, scheduleSet);
    }
  } catch (err) {
    // console.error('[ERROR!] Occured when crawlring', err);
    functions.logger.error(`ERR@PUPPETEER : `, err);
  } finally {
    await page.close();
    await browser.close();
  }
};


const loadProgramData = async (broadTitle) => {
  const programRef = fs.collection('programs').where('broad_title', '==', `${broadTitle}`);
  const programData = await programRef.get()
    .then(doc => {
      if (!doc.empty) {
        return Object.assign({ id: doc.docs[0].id }, { data: doc.docs[0].data() })
      } else {
        return null;
      }
    })
    .catch((err) => {
      // console.error(`ERR@FS [GET /[programs/.] : ${broadTitle}`);
      console.error('프로그램 불러오기 오류 : ', err);
      functions.logger.error(`ERR@FS [GET /[programs/.] : ${broadTitle}`);
      return null;
    });

  return programData;
};

const updateAirTime = async (programUID, scheduleData) => {
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
const createProgram = async (programData) => {
  const programId = await fs.collection('programs')
    .add(programData)
    .then(ref => {
      return ref.id;
    })
    .catch((err) => {
      // console.error(`ERR@FS [CREATE /programs/.] : ${programData.broad_title}`);
      console.error(err);
      functions.logger.error(`ERR@FS [CREATE /programs/.] : ${programData.broad_title}`)
      return null;
    });

  return programId;
};

const createFavoriteProgramCountor = async (programUID) => {
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


// program Maker 너무 두루뭉술하다...
const programMaker = async () => {
  tvGuideGroupByBroadcastorMap.forEach(async (scheduleSet, broadcastor) => {
    functions.logger.info('programMaker init - Broadcastor: ', broadcastor);
    for (let i = 0; i < scheduleSet.length; i++) {
      if (RGX_notOnAir.test(scheduleSet[i].title)) continue;
      let programData = {};

      const programInfo = await loadProgramData(scheduleSet[i].broad_title);
      if (programInfo) {
        programData = programInfo.data;
        programData.programUID = programInfo.id;
        if (!scheduleSet[i].re && !scheduleSet[i].special) {
          const dayOfWeek = Object.keys(scheduleSet[i].airTime)[0];
          if (programData.airTime[dayOfWeek] !== scheduleSet[i].airTime[dayOfWeek]) updateAirTime(programInfo.id, scheduleSet[i]);
        }
      } else {
        programData = {
          broadcastor,
          broad_title: scheduleSet[i].broad_title,
          title: scheduleSet[i].title,
          genre: scheduleSet[i].genre,
          limit: scheduleSet[i].limit,
          img: null,
          airTime: scheduleSet[i].airTime
        }

        if (!scheduleSet[i].re && !scheduleSet[i].special) {
          const id = await createProgram(programData);
          if (id) {
            createFavoriteProgramCountor(id);
            programData.programUID = id;
          }
        }
      }

      await addScheduleDataInDB(scheduleSet[i], programData);
    }
    addTvGuideInDB(scheduleSet, broadcastor);
  })
};

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

const addScheduleDataInDB = async (scheduleData, programData) => {
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
        console.error(`ERR@addScheduleDataInDB`);
        functions.logger.error(`ERR@addScheduleDataInDB : ${programData.broadcastor}_${programData.title}  `)
      })
  }
};

const addTvGuideInDB = (scheduleSet, broadcastor) => {
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

  fs.collection(`airTable`).doc(`${airDate}@${broadcastor}`)
    .set({ airTable: broadcastorAirTable })
    .then(() => {
      functions.logger.info('addTvGuideInDB complete -Broadcastor: ', broadcastor);
      tvGuideGroupByBroadcastorMap.delete(`${broadcastor}`)
      return;
    })
    .catch(() => {
      // console.error(`ERR@FS [ADD /AirTable] : ${airDate}@${broadcastor}`)
      functions.logger.error(`ERR@FS [ADD /AirTable] : ${airDate}@${broadcastor}`)
      tvGuideGroupByBroadcastorMap.delete(`${broadcastor}`)
      return;
    });
};

exports.runCralwer = () => {
  initPuppeteer()
    .then(() => {
      programMaker();
      return;
    })
    .catch(err => {
      functions.logger.error('programMaker/addTvGuideInDB Error!', err);
    })
};

// edited 20220531 0319

