const puppeteer = require('puppeteer');
const functions = require('firebase-functions');
const { PUPPETEER_TIMEOUT } = require('../Constant');


class CustomPage {
  constructor(browser, page) {
    this.browser = browser;
    this.page = page;
  }

  static async launch() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-extensions', '--disable-setuid-sandbox',],
      timeout: PUPPETEER_TIMEOUT,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900 });
    const customPage = new CustomPage(browser, page);

    return new Proxy(customPage, {
      get: function (target, property) {

        return customPage[property] || page[property];
      }
    })
  }

  // pre | check url includes accounts.google.com/v3/signin
  async signinGoogle() {
    try {
      await this.page.waitForSelector('input[type="email');
      await this.page.type('[types="email"]', process.env.GOOGLEID);
      await this.page.click('#identifierNext');
      await this.page.waitForSelector('#passwordNext');
      await this.page.type('[type="password"]', process.env.GOOGLEPW);
      await this.page.click('#passwordNext');

      await this.page.waitForTimeout(20000);
    } catch (err) {
      // console.error('error on signin Google accounts', err);
      functions.logger.error('Error on signin Google accounts', err);
    }
  }

  /**
   * @param {string} url 
   */
  async gotoTestPage(url) {
    try {
      await this.page.goto(url ? url : 'http://www.google.com', { waitUntil: 'networkidle2' });
    } catch (err) {
      // console.error('eror Ouccred in goto test page function', err);
      functions.logger.error('Error on goto Test Page', err);
    }
  }

  /** 
   * @param {string} selector - querySelector
   * @returns innerHTML of selected tag
   */
  async getContentsOf(selector) {
    return this.page.$eval(selector, el => el.innerHTML);
  }

  // 방송사 이름이 렌더링 될 때 까지 기다림
  async gotoChannelGuidePage() {
    try {
      await this.page.goto('https://www.lguplus.com/iptv/channel-guide', { waitUntil: "networkidle2" });
      await this.page.click('.c-tab-slidemenu > ul > li:nth-child(2)');
      await this.page.waitForSelector('.c-tabcontent-box div h3');
    } catch (err) {
      // console.error('error Occured in gotoChannelGuidePage function', err);
      functions.logger.error('Error on gotoChannelGuidePage function', err);
    }
  }

  /**
   * @param {Array: string} broadcastorLists 
   * @param {Date} targetDate - Already added target Hours (today: 9, tomorrow: 33, two days later: 57)
   * @returns {Map} Tv guides group by Broadcastor
   */
  async getSchedules(broadcastorLists, targetDate) {
    const tvGuideGroupByBroadcastorMap = new Map();

    const targetDateKorForm = targetDate.getMonth() + 1 + "월 " + targetDate.getDate() + "일";

    const targetNextDate = new Date(targetDate);
    targetNextDate.setHours(targetNextDate.getHours() + 24);
    const targetNextDateKorForm = targetNextDate.getMonth() + 1 + "월 " + targetNextDate.getDate() + "일";

    // YYYY-MM-DD
    const targetDayString = targetDate.toISOString().split('T')[0];
    const dayOfWeek = targetDate.getDay();

    const defaultBroadcastorSet = [
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

    const targets = (broadcastorLists && broadcastorLists.length > 0) ? defaultBroadcastorSet.filter(el => broadcastorLists.includes(el[0])) : defaultBroadcastorSet;

    try {
      for (let br = 0; br < targets.length; br++) {
        await this.page.click(targets[br][2]);
        await this.page.waitForSelector('.c-tabcontent-box div h3');

        const todayTarget = await this.page.$x("//div[contains(@class, 'c-tabmenu-tab')]/div[contains(@class, 'c-tab-slidemenu')]/ul/li/a[contains(., '" + targetDateKorForm + "')]");
        if (todayTarget.length < 1) {
          functions.logger.error('Fail to clicking schedule', targetDateKorForm, targets[br][0]);
          continue;
        }
        await todayTarget[0].click();
        await this.page.waitForXPath("//div[contains(@class, 'c-tabmenu-tab')]/div[contains(@class, 'c-tab-slidemenu')]/ul/li[contains(@class, 'is-active')]/a[contains(., '" + targetDateKorForm + "')]")

        const broadcastor = targets[br][0];

        const scheduleSet = await this.page.evaluate(({ broadcastor, targetDayString, dayOfWeek }) => {
          const RGX_specialRemover = /[\{\}\[\]\(\)\<\>\|\\\=\'\"]/g;
          const RGX_starting = /[1]부/g;
          const RGX_continue = /[2-9]부/g;
          const RGX_inning = /제\d+[회화]|\d+[회화]/g;
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
          };

          const scheduleTable = document.querySelectorAll('.table-bordered > tbody > tr');
          const filteredScheduleTable = [];

          for (let i = 0; i < scheduleTable.length; i++) {
            if (i > 0) {
              filteredScheduleTable[filteredScheduleTable.length - 1].eTime = scheduleTable[i].querySelector('tr > td:nth-child(1)').innerText.substr(0, 5);   // endTime
              filteredScheduleTable[filteredScheduleTable.length - 1].eDate = targetDayString;                                            // endDate
            }
            let title = scheduleTable[i].querySelector('tr > td:nth-child(2)').firstChild.firstChild.data.trim();
            if (title.match(RGX_continue) && isContinue) {
              continue;
            } else {
              isContinue = false;
            }
            let sTime = scheduleTable[i].querySelector('tr > td:nth-child(1)').innerText.substr(0, 5);                                          // startTime
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


        const tomorrowTarget = await this.page.$x("//div[contains(@class, 'c-tabmenu-tab')]/div[contains(@class, 'c-tab-slidemenu')]/ul/li/a[contains(., '" + targetNextDateKorForm + "')]");
        if (tomorrowTarget.length < 1) {
          functions.logger.error('Fail to clicking schedule', targetNextDateKorForm, targets[br][0]);
          continue;
        }
        await tomorrowTarget[0].click();
        await this.page.waitForXPath("//div[contains(@class, 'c-tabmenu-tab')]/div[contains(@class, 'c-tab-slidemenu')]/ul/li[contains(@class, 'is-active')]/a[contains(., '" + targetNextDateKorForm + "')]")


        const endTime = await this.page.evaluate(() => {
          const continueRegex = /^.+[2-9]+부/g;
          const scheduleTable = document.querySelectorAll('.table-bordered > tbody > tr');
          let endAtIndex = 0;
          for (let i = endAtIndex; i < scheduleTable.length; i++) {
            if (!scheduleTable[i].querySelector('tr > td:nth-child(2)').firstChild.firstChild.data.match(continueRegex)) break;
          }

          return scheduleTable[endAtIndex].querySelector('tr > td:nth-child(1)').innerText.substr(0, 5);
        });

        const targetNextDayString = targetNextDate.toISOString().split('T')[0];
        scheduleSet[scheduleSet.length - 1].eDate = targetNextDayString;
        scheduleSet[scheduleSet.length - 1].eTime = endTime;

        tvGuideGroupByBroadcastorMap.set(`${broadcastor}`, scheduleSet);
      }
    } catch (err) {
      // console.error('[ERROR!] Occured when crawlring', err);
      functions.logger.error(`ERR@PUPPETEER : `, err);
    }

    return tvGuideGroupByBroadcastorMap;
  }

  async closeBrowser() {
    const pages = await this.browser.pages();
    for (const page of pages) await page.close();

    await this.browser.close();
  }
}


module.exports = CustomPage;