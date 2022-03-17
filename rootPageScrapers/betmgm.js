const puppeteerExtra = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
const axios = require("axios");


class PuppeteerService {

    constructor() {
        this.browser = null;
        this.page = null;
        this.pageOptions = null;
        this.waitForFunction = null;
        this.isLinkCrawlTest = null;
    
    }

    async initiate( isLinkCrawlTest) {
        this.pageOptions = {
            waitUntil: 'networkidle2',
            timeout: 30000
        };
        this.waitForFunction = 'document.querySelector("body")';
        puppeteerExtra.use(pluginStealth());
        //const browser = await puppeteerExtra.launch({ headless: false });
        this.browser = await puppeteerExtra.launch({ headless: true });
        this.page = await this.browser.newPage();
        // console.log("page inititated");
        await this.page.setRequestInterception(true);
        this.page.on('request', (request) => {
            if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
                request.abort();
            } else {
                request.continue();
            }
        });
        this.isLinkCrawlTest = isLinkCrawlTest;
        var link = this.generateLink();
        this.crawl(link);
        // this.crawl("https://cds-api.in.betmgm.com/bettingoffer/fixtures?x-bwin-accessid=YjY4MjJmODYtMWU3OC00NjU5LWFjOTYtMmIzNjk4OTJhMGJm&lang=en-us&country=US&fixtureTypes=Standard&state=Latest&fixtureCategories=Gridable,NonGridable,Other&sportIds=7&competitionIds=6004");
    }

    generateLink(){
        var url = "https://sports.in.betmgm.com/en/sports/basketball-7/betting/usa-9/nba-6004";
          // extract category id from url
          const categoryId = this.parse(url);          
          const apiUrl = `https://cds-api.in.betmgm.com/bettingoffer/fixtures?x-bwin-accessid=YjY4MjJmODYtMWU3OC00NjU5LWFjOTYtMmIzNjk4OTJhMGJm&lang=en-us&country=US&fixtureTypes=Standard&state=Latest&fixtureCategories=Gridable,NonGridable,Other&sportIds=${categoryId[0]}&competitionIds=${categoryId[1]}`;
         return apiUrl;
    }
    parse(url) {
        var splitURL=url.toString().split("/");
        var sportsid = splitURL[5];
        var gameid = splitURL[8];
        sportsid = sportsid.slice(sportsid.lastIndexOf("-")+1);
        gameid = gameid.slice(gameid.lastIndexOf("-")+1);
        var finalUrl = [sportsid,gameid];
      return finalUrl;
    };

   async eventsData(data) {
    try {
        // console.log(data);
        const eventList = await Promise.all(
           
          await data.fixtures.map(async (fixture) => {
            const { id } = fixture;
            var teamname = fixture.name.value;
            teamname = teamname.replace(/\s+/g,"-").toLowerCase();
            return {
              id,
              teams: teamname,
              url: `https://sports.in.betmgm.com/en/sports/events/${teamname}-${id}`,
            };
          })
        );
        console.log(eventList)
        this.close();
      } catch (err) {
        // Handle Error Here
        console.error(err);
        console.log(err);
      }
    }


    async crawl(link) {
        const userAgent = randomUseragent.getRandom();
        const crawlResults = { isValidPage: true, pageSource: null };
        try {
            await this.page.setUserAgent(userAgent);
            await this.page.goto(link, this.pageOptions);
            await this.page.waitForFunction(this.waitForFunction);
            crawlResults.pageSource = await this.page.content();
        }
        catch (error) {
            console.log(error);
            crawlResults.isValidPage = false;
        }
        if (this.isLinkCrawlTest) {
            this.close();
        }
        const textContent = await this.page.evaluate(() => {
            return document.querySelector('body').textContent;
         });
         this.eventsData(JSON.parse(textContent));
        // return JSON.parse(textContent);
    }

    close() {
        if (!this.browser) {
            this.browser.close();
        }
    }
}

const puppeteerService = new PuppeteerService();
puppeteerService.initiate(true);

