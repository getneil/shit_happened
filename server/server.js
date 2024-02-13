require('dotenv').config();

const cron = require('node-cron');
const cheerio = require('cheerio');
const { get } = require('lodash');
const sound = require("sound-play");
const path = require("path");
const axios = require('axios');
const _ = require('lodash');


const urls = {
  'coindesk': 'https://www.coindesk.com/livewire/',
  'blockworks': 'https://blockworks.co',
  'bloomberg': 'https://www.bloomberg.com/search?query=btc'
}

const getRejectionConfidence = async (titles) => {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  const query = `Based only on the following sample titles, \n`+
    titles +
    ', has the BTC etf applications been rejected? respond only 0 - 100 nothing else';

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
  console.log('RESPONSE', candidates[0].content.parts);
  const confidenceLevel = +get(candidates, '[0].content.parts[0].text', '0');
  return isNaN(confidenceLevel) ? 0 : confidenceLevel;
}

const getCoindeskTitles = async () => {
  const page = await fetch(urls.coindesk);
  const html = await page.text();
  const $ = cheerio.load(html);
  const articles = $('h3 > a');
  // uncommet to test rejection alarm
  // return 'Bitcoin Dream Deferred: SEC Rejects First ETF Applications, Crushing Crypto Rally'
  const titles = articles.map((i, el) => $(el).text()).get();
  console.log('coindesk titles:', titles);
  return titles.join('\n');
}

const getBlockworksTitles = async () => {
  const page = await fetch(path.join(urls.blockworks, '/news'));
  const html = await page.text();
  const $ = cheerio.load(html);
  const articles = $('a.font-headline');
  const completeTitles = await Promise.all(articles.map(async (i, el) => {
    const href = $(el).attr('href');
    const url = path.join(urls.blockworks, href)
    console.log('blockworks: fetching...', url);
    const articlePage = await fetch(url);
    const articleHtml = await articlePage.text();
    const $$ = cheerio.load(articleHtml);
    return $$('h1.self-stretch.text-xl').text();
  }));
  console.log('blockworks titles:', completeTitles);
  return completeTitles.join(' \n');
}

// const getBloomberg = async () => {
//   const chromeUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36';

//   const { data } = await axios.get(urls.bloomberg, {
//     headers: {
//       'User-Agent': chromeUserAgent,
//     },
//   });

//   const $ = cheerio.load(data);
//   const articles = $('a:first-child');
//   console.log(articles[0])
//   const titles = articles
//     .filter((a) => _.get(a, 'attribs.class','').includes('headline'))
//     .map((a) => $(a).text());
//   // console.log(titles)
//   // console.log(titles)
// }

async function main() {
  const srcs = await Promise.all([
    getCoindeskTitles(),
    getBlockworksTitles()
  ]);

  const confidenceLevels = await Promise.all(srcs.map(getRejectionConfidence));
  console.log('CONFIDENCE LEVELS', confidenceLevels);
  // average level of confidence that shit happened
  const averageConfidenceLevel = confidenceLevels.reduce((acc, curr) => acc + curr, 0) / confidenceLevels.length;
  console.log('REJECTION CONFIDENCE LEVEL', averageConfidenceLevel);
  if (averageConfidenceLevel > 70) {
    console.log('Rejection');
    sound.play("./sound.mp3");
  } else {
    console.log('no rejection');
  }
}

cron.schedule('*/10 * * * *', main);