
const functions = require('firebase-functions');
const Page = require('./index');

// in cloud function
// 2 comp Duration : 20868ms
// 10 comp Duration : 38329ms
/**
 * @param {Array: string} lists 
 * @param {Date(YYYYMMDD)} targetDate 
 * @returns {Map} Tv guides grouped by Broadcastor
 */
exports.fetchAirTable = async (lists, targetDate) => {
  let result;

  try {
    const page = await Page.launch();
    if (page.url().includes('accounts.google.com/') && page.url().includes('signin')) {
      await page.signinGoogle();
    }
    await page.gotoChannelGuidePage(targetDate);

    result = await page.getSchedules(lists, targetDate);
    functions.logger.info('Crawler result in target/fetchAirTable: ', result.size);
    await page.closeBrowser();
  } catch (err) {
    functions.logger.error('Error Occured in runCrawler Function!', err);
    throw err;
  }

  return result;
};

/**
 * @returns innerHTML of selected tag
 */
exports.fetchUplusH3Content = async () => {
  let result;

  try {
    const page = await Page.launch();
    if (page instanceof Error) {
      return page;
    }
    if (page.url().includes('accounts.google.com/') && page.url().includes('signin')) {
      await page.signinGoogle();
    }
    await page.gotoChannelGuidePage(url);
    result = await page.getContentsOf(selector ? selector : '.c-tabcontent-box div h3');
    functions.logger.info('simple cralwer test result : ', result);
    await page.closeBrowser();
  } catch (err) {
    functions.logger.info('Tesing current Phase Error : ', err);
    throw err;
  }

  return result;
};