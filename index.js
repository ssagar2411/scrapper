const request = require("request");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
// const nodemailer = require('nodemailer');
const cronJob = require("cron").CronJob;
const url = "https://www.mybookie.ag/sportsbook/nfl/"; // Base Url
console.log("starting point");

// request(url, cb);

// function cb(error, response, html){
//     if(error){
//         console.log(error);
//     } else {
//         console.log(html);
//     }
// }
// console.log("end");

async function configureBrowser(){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function checkData(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
    // console.log(html);
    const $ = cheerio.load(html, {xmlMode: true});
    let finalData=[]
   $('.game-line__tnt-line>.lines-odds',html).each(function() {  // Parsing Data
    let data = $(this).text();
    finalData.push(data);
    
   });
//    var gameName = $('.ame-line__tnt-team__name').text();
//    console.log(gameName);
   console.log("***********Team Name | Odd Data*************");
   console.log(finalData); // Displaying Data in Console
   console.log("*****Data Extracted On Every 10 Seconds*****");
//    sendNotification(finalData);
}

// async function monitor(){
//     let page = await configureBrowser();
//     await checkPrice(page);
// }

// monitor();

async function startTracking() {
    const page = await configureBrowser();
  
    let job = new cronJob('*/10 * * * * *', function() { //runs every 10 Seconds in this config
      checkData(page);
    }, null, true, null, null, true);
    job.start();
}

// async function sendNotification(oddData) {

//     let transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: 'bikkysitaula795@gmail.com',
//         pass: '***************'
//       }
//     });
  
//     let textToSend = '' + oddData;
//     let htmlText = `<a href=\"${url}\">Link</a>`;
  
//     let info = await transporter.sendMail({
//       from: '"Scrapped Odd Data" <bikkysitaula795@gmail.com>',
//       to: "sagarsitaula795@gmail.com",
//       subject: 'Price dropped to ' + oddData, 
//       text: textToSend,
//       html: htmlText
//     });
  
//     console.log("Message sent: %s", info.messageId);
//   }

startTracking();