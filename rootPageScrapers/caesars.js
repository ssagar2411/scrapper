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
        // const browser = await puppeteerExtra.launch({ headless: false });
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
        
    }

    generateLink(){
        var url = "https://www.williamhill.com/us/in/bet/basketball/events/all?id=5806c896-4eec-4de1-874f-afed93114b8c";
          // extract category id from url
          const categoryId = this.parse(url);
        //   console.log(categoryId);          
          const apiUrl = `https://www.williamhill.com/us/in/bet/api/v3/sports/basketball/events/schedule/?competitionIds=${categoryId}`;
         return apiUrl;
    }
    parse(url) {
        var splitURL= url.slice(url.lastIndexOf("=")+1);
        return splitURL;
    };

   async eventsData(data) {
    try {
        // console.log(data.competitions[0].events);
        const eventList = await Promise.all(
           
          await data.competitions[0].events.map(async (event) => {
            const { id } = event;
            var teamname = event.name.replace(/[|]+/g,'');
            teamname = teamname.replace(/\s+/g,"-").toLowerCase();
            return {
              id,
              teams: teamname,
              url: `https://www.williamhill.com/us/in/bet/basketball/${id}/${teamname}`,
            };
          })
        );
        console.log(eventList);
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
    }

    close() {
        if (!this.browser) {
            this.browser.close();
        }
    }
}

const puppeteerService = new PuppeteerService();
puppeteerService.initiate(true);

