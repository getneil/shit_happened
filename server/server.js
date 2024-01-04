require('dotenv').config();

const cheerio = require('cheerio');
const { get } = require('lodash');
const sound = require("sound-play");


const urls = {
  'coindesk': 'https://www.coindesk.com/livewire/'
}

const getRejectionConfidence = async (titles) => {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  const query = `Based only on the following sample titles, \n`+
    titles +
    ', what is your confidence that the Bitcoin/BTC ETF has been rejected? answer only 0 - 100';

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: query
          }
        ]
      }
    ]
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  };

  const response = await fetch(`${url}?key=${process.env.GEMINI_KEY}`, options)
  const { candidates } = await response.json();

  const confidenceLevel = +get(candidates, '[0].content.parts[0].text', '0');
  return confidenceLevel;
}

const getCoindeskTitles = async () => {
  const page = await fetch(urls.coindesk);
  const html = await page.text();
  const $ = cheerio.load(html);
  const articles = $('h3 > a');
  // uncommet to test rejection alarm
  // return 'Bitcoin Dream Deferred: SEC Rejects First ETF Applications, Crushing Crypto Rally'
  const titles = articles.map((i, el) => $(el).text()).get();
  return titles.join('\n');
}

async function main() {
  const srcs = await Promise.all([
    getCoindeskTitles()
  ]);
  const confidenceLevels = await Promise.all(srcs.map(getRejectionConfidence));
  console.log('CONFIDENCE LEVELS', confidenceLevels);
  // average level of confidence that shit happened
  const averageConfidenceLevel = confidenceLevels.reduce((acc, curr) => acc + curr, 0) / confidenceLevels.length;
  console.log('REJECTION CONFIDENCE LEVEL', averageConfidenceLevel);
  if (averageConfidenceLevel > 50) {
    console.log('Rejection');
    sound.play("./sound.mp3");
  } else {
    console.log('no rejection');
  }
}

cron.schedule('*/10 * * * *', main);