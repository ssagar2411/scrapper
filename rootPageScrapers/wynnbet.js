
const axios = require("axios");
// returns all events from a category on draftkings
async function testingScraper(){
var url = "https://in.wynnbet.com/competition/1";
  // extract category id from url
  const categoryId = parse(url);
  const apiUrl = `https://in.wynnbet.com/api/sportsbook/tournaments/${categoryId}`;
  try {
    const resp = await axios.get(apiUrl, {
        headers: {
            'User-Agent': 'Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36',
            'Accept': 'application/xml,application/xhtml+xml,text/html;q=0.9, text/plain;q=0.8,image/png,*/*;q=0.5'
        }
    });
    const eventList = await Promise.all(
      await resp.data.data[0].events.map(async (event) => {
        const { id } = event;
        var teamname = event.name;
        return {
          id,
          teams: teamname,
          url: `https://in.wynnbet.com/event/${id}`,
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
  return url.slice(url.lastIndexOf("/"));
};

testingScraper();

