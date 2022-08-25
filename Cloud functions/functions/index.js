const functions = require('firebase-functions');
const { runCralwer } = require('./manager');
const { trxMoveOntimeSchedules, trxRemoveEndedPrograms, isCrawling, getCrawlingDueList } = require('./db');
const { UTC9, RGX_CHECK, RGX_TODAY, RGX_TWO, DEFAULT_TARGET_HOURS, } = require('./Constant');
require('dotenv').config();

// 시간은 region 상관없이 UTC로 입력됨. new Date() 마찬가지, 한국 시간쓰려면 UTC9 설정

exports.scheduleUpdator = functions
  .region('asia-northeast3')
  .pubsub.schedule('*/5 0-2,5-23 * * *')
  .timeZone('Asia/Seoul')
  .onRun(() => {
    functions.logger.log('START Schedule Updator');
    trxMoveOntimeSchedules();
    trxRemoveEndedPrograms();

    return null;
  });

exports.scheduleCralwer = functions
  .region('asia-northeast1')
  .runWith({
    memory: '2GB',
    timeoutSeconds: '120',
    maxInstances: 1,
  })
  .pubsub.schedule('0 2 * * *')
  // .pubsub.schedule('*/30 2-6 * * *')   // call Crawler 가 완벽하게 작동하면 변경
  .timeZone('Asia/Seoul')
  .onRun(async () => {
    const targetDate = new Date();
    targetDate.setHours(targetDate.getHours() + UTC9 + 24);
    const date = new Date(targetDate).toISOString().substring(0, 10).replace(/-/g, '');
    functions.logger.log('START Schedule Cralwer', new Date(), 'utc9+24 serverdate : ', date);

    try {
      const dueList = await getCrawlingDueList(date);
      if (typeof dueList === 'boolean') {
        functions.logger.info('ERR-scheduleCralwer@Already done!');
        return false;
      }

      await runCralwer(date, dueList);
    } catch (err) {
      throw err;
    }

    return null;
  });

/**
 * @param {string} req.body.event.text : "UserUID OPTION"
 * OPTION
 *  "today"             : 오늘의 편성표 
 *  "null || undefined" : 내일 편성표
 *  "two"               : 이틀 뒤 편성표
 */
exports.callcrawler = functions
  .region('asia-northeast1')
  .runWith({
    memory: '2GB',
    timeoutSeconds: '120',
  })
  .https.onRequest(async (req, res) => {
    if (req.body.challenge && req.body.type === "url_verification") {
      return res.send(req.body.challenge);
    }

    const state = await isCrawling();
    if (state) return res.status(406).send();

    const { token, team_id, api_app_id } = req.body;
    const user_id = req.body.authorizations[0].user_id;

    if (token !== process.env.CALL_TOKEN
      || team_id !== process.env.TEAM_ID
      || api_app_id !== process.env.APP_ID
      || user_id !== process.env.USER_ID) {
      functions.logger.log('ERR@WRONG AUTH is provided.');
      return res.status(401).send();
    }

    const input = req.body.event.text;
    const rID = RGX_CHECK.test(input);
    const rToday = RGX_TODAY.test(input);
    const rTwo = RGX_TWO.test(input);
    if (!rID && !rToday && !rTwo) {
      return res.status(400).send();
    }

    // default target : tomorrow
    let targetHours = DEFAULT_TARGET_HOURS // 33
    if (rToday) {
      targetHours = UTC9; // 9
    } else if (rTwo) {
      targetHours = UTC9 + 48; // 57
    }

    try {
      const targetDate = new Date();
      targetDate.setHours(targetDate.getHours() + targetHours);
      const date = new Date(targetDate).toISOString().substring(0, 10).replace(/-/g, '');
      functions.logger.info('Target date, Options : ', date, targetHours);
      const dueList = await getCrawlingDueList(date);

      if (typeof dueList === 'boolean') {
        functions.logger.info('ERR@Already done!');
        return res.status(406).send('Already done!');
      }

      await runCralwer(date, dueList, targetHours);
    } catch (err) {
      functions.logger.info('ERR@Cannot running crawler!', err);
      return res.status(503).send('crawling err!');
    }

    return res.status(200).send('Done!');
  });

// cloud functions, cloud scheduler 배포방식 동일
// firebase deploy --only functions: functionName
// firebase functions:delete [myFunction]

// =local crawling
// const targetDate = new Date();
// targetDate.setHours(targetDate.getHours() + UTC9 + 24);
// const date = new Date(targetDate).toISOString().substring(0, 10).replace(/-/g, '');
// functions.logger.log('START Schedule Cralwer', new Date(), 'utc9+24 serverdate : ', date);

// const dueList = null;
// runCralwer(date, dueList, DEFAULT_TARGET_HOURS);
