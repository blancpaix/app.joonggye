const functions = require('firebase-functions');
const Axios = require('axios');

const { fetchAirTable } = require('./puppeteer/targets');
const {
  initCrawler, completeCrawler, pauseCrawler,
  loadProgramData,
  createProgram,
  createFavoriteProgramCountor,
  addScheduleDataInDB,
  addTvGuideInDB,
  updateAirTime,
} = require('./db');
const { BROADCASTOR_LIST } = require('./Constant');

const crawlerResult = {
  "Success": [],
  "Fail": [],
};

/**
 * @param {Map} tvGuideGroupByBroadcastorMap 
 */
const saveCrawledData = async (tvGuideGroupByBroadcastorMap) => {
  const RGX_notOnAir = /^방송\s?시간이/g;
  const keys = tvGuideGroupByBroadcastorMap.keys();

  let broadcastor = keys.next().value;

  while (broadcastor) {
    const scheduleSet = tvGuideGroupByBroadcastorMap.get(broadcastor);

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

    await addTvGuideInDB(scheduleSet, broadcastor, tvGuideGroupByBroadcastorMap, crawlerResult);
    // const result = 
    // console.log('result in scheduleManager saveCrawled data', result);

    broadcastor = keys.next().value;
  }
};

/**
 * @param {Date(YYYYMMDD)} date 
 * @param {Array: string} dueList 
 * @param {string} targetDate - "today" || null || undefined || "two"
 */
exports.runCralwer = async (date, dueList, targetDate) => {
  await initCrawler();

  const startTime = new Date();

  try {
    crawlerResult.Success = [];
    crawlerResult.Fail = dueList ? dueList : BROADCASTOR_LIST;

    const onairTable = await fetchAirTable(dueList, targetDate);
    functions.logger.info('Crawled schedule count : ', onairTable.size);

    functions.logger.info('Duration of fetcing schedules : ', new Date() - startTime + 'ms');

    await saveCrawledData(onairTable);
    functions.logger.info('Duration of Saving schedule data : ', new Date() - startTime + 'ms');

    const successList = JSON.stringify(crawlerResult.Success);
    const failList = JSON.stringify(crawlerResult.Fail);
    await completeCrawler(date, crawlerResult.Fail);

    const blocks = [
      {
        type: 'header',
        text: {
          type: "plain_text",
          text: 'Puppetter Result : Succ: ' + crawlerResult.Success.length + ' / Fail:' + crawlerResult.Fail.length
        },
      },
      {
        type: "divider"
      },
    ];

    if (crawlerResult.Success.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: "mrkdwn",
          text: "Crawling Success lists :"
        }
      });
      blocks.push({
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": successList
        }
      });
      blocks.push({
        type: "divider"
      });
    }

    if (crawlerResult.Fail.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: "mrkdwn",
          text: "Crawling Fail lists :"
        }
      });
      blocks.push({
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": failList
        }
      });
      blocks.push({
        type: "divider"
      });
    }

    Axios.post(
      'https://hooks.slack.com/services/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',
      { blocks },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
      .then(() => functions.logger.info('Send Slack Notification!'))
      .catch(err => {
        functions.logger.error('ERR@Axios [Slack Alarm Message] : ', err);
        // console.log('ERR@Axios [Slack Alarm Message]', err)
      });

  } catch (err) {
    console.error('Error on Run Cralwer', err);
    await pauseCrawler();
  }
};

// edited 20220824 2010
