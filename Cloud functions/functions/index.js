const functions = require('firebase-functions');
const { trxMoveOntimeSchedules, trxRemoveEndedPrograms, runCralwer } = require('./scheduleManager');

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
  .runWith({
    memory: '1GB',
    timeoutSeconds: '120'
  })
  .region('asia-northeast3')
  .pubsub.schedule('0 2 * * *')
  .timeZone('Asia/Seoul')
  .onRun(() => {
    functions.logger.log('START Schedule Cralwer');
    runCralwer();

    return null; S
  });

runCralwer();

// firebase deploy --only functions: functionName
// firebase functions:delete [myFunction]