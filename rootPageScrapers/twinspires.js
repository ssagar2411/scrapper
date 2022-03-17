
const axios = require("axios");
// returns all events from a category on draftkings
async function testingScraper(){
var url = "https://in.twinspires.com/sports.shtml#filter/basketball/nba";
  // extract category id from url
  const categoryId = parse(url);
  const apiUrl = `https://eu-offering.kambicdn.org/offering/v2018/winusin/listView/${categoryId[0]}/${categoryId[1]}/all/all/matches.json?lang=en_US&market=US`;
  try {
    const resp = await axios.get(apiUrl, {
        headers: {
            'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
            'Accept': 'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5'
        }
    });
    const eventList = await Promise.all(
      await resp.data.events.map(async (event) => {
        var id = event.event.id;
        var teamname = event.event.name;
        return {
          id: id,
          teams: teamname,
          url: `https://in.twinspires.com/sports.shtml#event/${id}`,
        };
      })
    );
    console.log(eventList);
  } catch (err) {
    // Handle Error Here
    console.error(err);
    console.log(err);
  }
}


const parse = (url) => {
    var splitURL=url.toString().split("/");
    var sportsid = splitURL[4];
    var gameid = splitURL[5];
    // sportsid = sportsid.slice(sportsid.lastIndexOf("-")+1);
    // gameid = gameid.slice(gameid.lastIndexOf("-")+1);
    var finalUrl = [sportsid,gameid];
  return finalUrl;
};

testingScraper();

