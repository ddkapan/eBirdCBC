const puppeteer = require('puppeteer');
const ebirdcode = require("./public/ebirdCodes.json")
const axios = require('axios');
const { response } = require('express');
const MongoClient = require('mongodb').MongoClient;
var DataFrame = require('dataframe-js').DataFrame;
var path = require('path');


// getting the ebird and passwords api key from the env 
const key = process.env.EBIRDKEY;
//const password = process.env.MONGO_PASSWORD;

// connecting to the mongoDB
const url = 'mongodb://localhost:27017'

// try to get to work with multiple species at once so only have to log in once
async function getTrack(checklist) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    devtools: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
    }
  });
  const page = await browser.newPage();
  await page.goto('https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Flogin%2Fcas%3Fportal%3Debird&locale=en_US', {
    waitUntil: "networkidle0",
  });
  console.log(page.url());
  await page.screenshot({path: 'screenshot.png'}); // for debugging
  if (page.url() != 'https://ebird.org/home') {
  await page.type('#input-user-name', 'abbottslagoon');
  await page.type('#input-password', '[insert password]');
  await page.screenshot({path: 'screenshot.png'}); // for debugging
  await Promise.all([
  await page.click('#form-submit'),
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 10000 }),
  ]);
  }

  await page.goto(`https://ebird.org/checklist/${checklist}`, {
    waitUntil: "networkidle0"
  });
  const data = await page.evaluate(() => {
    if (document.querySelector(".Track")){
    return document.querySelector('.Track').dataset.maptrackData.split(',');
    } else {
      return null;
    }
  });
  const points = [];
  if (data != null){
  for(let i = 0; i < data.length; i+=2) {
    points.push([data[i + 1], data[i]]); // lat, long
  }
}
  await browser.close();
  //console.log(points);
  return points;
}

async function tripReport(report) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    devtools: true,
    defaultViewport: {
      width: 1920,
      height: 1080,
    }
  });
  const page = await browser.newPage();
  await page.goto(`https://ebird.org/tripreport/${report}?view=checklists`, {
    waitUntil: "networkidle0",
  });

  // await page.screenshot({path: 'screenshot.png'}); // for debugging
  const data = await page.evaluate(() => {
    let checknums = document.getElementsByClassName('ReportList-checklists')[0].getElementsByClassName('ChecklistItem');
    let checklists = [];
    for (var i = 0; i < checknums.length; i++) {
      checklists.push(checknums[i].getElementsByTagName('a')[0].getAttribute('href').slice(11));
    }
    return checklists

  });
  await browser.close();
  console.log(data);
  return data;
}

async function main(checklist) {
  const client = new MongoClient(url);
  // get the checklist information
  var configChecklist = {
    method: 'get',
    url: `https://api.ebird.org/v2/product/checklist/view/${checklist}`,
    headers: {
      'X-eBirdApiToken': key
    }
  };

  const responseChecklist = await axios(configChecklist)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });

  // get the checklist locId
  const location = responseChecklist.locId;

  console.log(location);

  // use the locId to get the coords of the location
  var configLoc = {
    method: 'get',
    url: `https://api.ebird.org/v2/ref/region/info/${location}`,
    headers: {
      'X-eBirdApiToken': key
    }
  };

  const loc = await axios(configLoc)
    .then(function (response) {
      const minX = response.data.bounds.minX;
      const maxX = response.data.bounds.maxX;
      const long = ((minX + maxX) / 2);
      const minY = response.data.bounds.minY;
      const maxY = response.data.bounds.maxY;
      const lat = ((minY + maxY) / 2);
      return [lat, long];
    })
    .catch(function (error) {
      console.log(error);
    });

  console.log(loc);

  responseChecklist.coords = loc;

  //responseChecklist.dependent = 0;

  try {
    const database = client.db("eBirdCBC");
    const collection = database.collection("checklists");

    //await collection.deleteMany({}); // delete all documents in the collection
    await collection.insertOne({ responseChecklist }); // insert the response from the api call

  } finally {
    await client.close();
  }
};

async function clear() {
  const client = new MongoClient(url);
  try {
    const database = client.db("eBirdCBC");
    const collection = database.collection("checklists");
    await collection.deleteMany({}); // delete all documents in the collection
  } finally {
    await client.close();
  }
};

async function getPoints() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const database = client.db("eBirdCBC");
    const collection = database.collection("checklists");
    /*const IDs = await collection.distinct('_id', {}); // get the number and IDs of documents in the collection
    console.log(IDs);
    for(let i = 0; i < IDs.length; i++) {
      const filter = { _id: IDs[i]};
      const updateDoc = {
        $set: {
          dependent: i
      },
    };
    const result = await collection.updateOne(filter, updateDoc);
    }*/
    const data = await collection.find({}).toArray();
    return data;
  } finally {
    await client.close();
  }
};

// update == "checklistId, new dependent value"
async function updateDep(update) {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const database = client.db("eBirdCBC");
    const collection = database.collection("checklists");
    const parse = update.split(",")
    let json = `{"responseChecklist.subId": "${parse[0]}"}`
    console.log(await collection.find({}).toArray());
    const filter = JSON.parse(json);
    const updateDoc = {
      $set: {
        dependent: String(`${parse[1]}`)
      },
    };
    const result = await collection.updateOne(filter, updateDoc);
    console.log(result);
  } finally {
    await client.close();
  }
}

// getting the species list from the database
async function getSpecies() {
  const data = await getPoints();
  console.log(data);
  var obs = [];
  for (let i = 0; i < data.length; i++) {
    const observ = data[i].responseChecklist.obs;
    const species = [];
    for (let j = 0; j < observ.length; j++) {
      const code = observ[j].speciesCode;
      const count = observ[j].howManyAtleast;
      species.push(JSON.parse(`{"${code}": ${count}}`));
    }
    obs.push(species);
  }
  // get the deps
  const deps = [];
  for (let i = 0; i < obs.length; i++) {
    for (let j = 0; j < obs[i].length; j++) {
      const dep = data[i].dependent;
      deps.push(dep);
    }
  }
  console.log(deps);
  // take from "GCKI: 1" to {species: "GCKI", count: 1}
  var obs = obs.flat(1)
  const species = [];
  for (let i = 0; i < obs.length; i++) {
    species.push(Object.keys(obs[i])[0]);
  }
  const counts = [];
  for (let i = 0; i < obs.length; i++) {
    counts.push(Object.values(obs[i])[0]);
  }
  const names = []
  for (let i = 0; i < species.length; i++) {
    names.push(ebirdcode[species[i]])
  }

  console.log(obs.length);
  //console.log(data);
  const df = new DataFrame({
    count: counts,
    species: species,
    common_name: names,
    dependent: deps,
  });
  df.show();
  console.log(df.dim());

  const speciesList = df.groupBy('dependent', 'species', 'common_name').aggregate(group => group.stat.max('count'))
    .rename('aggregation', 'count').groupBy('species', 'common_name').aggregate(group => group.stat.sum('count')).rename('aggregation', 'count');
  speciesList.show();
  const speciesListCollection = speciesList.toCollection();
  console.log(speciesListCollection);
  return speciesListCollection;
}

// getTrack('S124180823')

module.exports = { main, clear, getPoints, updateDep, getSpecies, tripReport };
