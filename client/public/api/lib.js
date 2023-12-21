const puppeteer = require("puppeteer");
const ebirdcode = require("./public/ebirdCodes.json");
const axios = require("axios");
const { response } = require("express");
var DataFrame = require("dataframe-js").DataFrame;
var path = require("path");
var Datastore = require("@seald-io/nedb");
const { resolve } = require("path");
const ebirdTaxonomy = require("./public/ebirdTaxOrder.json");
const fs = require("fs");
const findChrome = require("chrome-finder");
const chromePath = findChrome();

// getting the ebird and passwords api key from the env
const key = process.env.EBIRDKEY;
//const password = process.env.MONGO_PASSWORD;
const password = process.env.abbottspassword;
const username = process.env.abbottsusername;

let dir;

if (process.platform === 'win32') {
  dir = path.join(process.env.HOMEPATH, "Documents/eBirdCBC/");
} else {
  dir = path.join(process.env.HOME, "Documents/eBirdCBC/");
}
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// saving the db for faster degugging
const db = new Datastore({
  filename: path.join(dir, "database.db"),
  autoload: true,
});

// try to get to work with multiple species at once so only have to log in once
async function getTrack(lists) {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false,
    devtools: false,
  });
  const page = await browser.newPage();
  await page.goto(
    "https://secure.birds.cornell.edu/cassso/login?service=https%3A%2F%2Febird.org%2Flogin%2Fcas%3Fportal%3Debird&locale=en_US",
    {
      waitUntil: "networkidle0",
    }
  );
  console.log(page.url());
  //await page.screenshot({ path: 'screenshot.png' }); // for debugging
  if (page.url() != "https://ebird.org/home") {
    //await page.type('#input-user-name', username);
    //await page.type('#input-password', password);
    //await page.screenshot({ path: 'screenshot.png' }); // for debugging
    await Promise.all([
      page.waitForNavigation({ timeout: 1000000 }),
      //page.click('#form-submit')
    ]);
  }

  let all_points = [];

  for (let i = 0; i < lists.length; i++) {
    console.log("checklist", lists[i]);
    await page.goto(`https://ebird.org/checklist/${lists[i]}`, {
      waitUntil: "networkidle0",
    });
    //await page.screenshot({ path: 'screenshot.png' }); // for debugging
    const data = await page.evaluate(() => {
      if (document.querySelector(".Track")) {
        return document.querySelector(".Track").dataset.maptrackData.split(",");
      } else {
        return null;
      }
    });
    const points = [];
    if (data != null) {
      for (let i = 0; i < data.length; i += 2) {
        points.push([data[i + 1], data[i]]); // lat, long
      }
    }
    all_points.push(points);
  }
  await browser.close();
  console.log(all_points);
  return all_points;
}

async function tripReport(report) {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    devtools: true,
  });
  const page = await browser.newPage();
  await page.goto(`https://ebird.org/tripreport/${report}?view=checklists`, {
    waitUntil: "networkidle0",
  });

  // await page.screenshot({path: 'screenshot.png'}); // for debugging
  const data = await page.evaluate(() => {
    let checknums = document
      .getElementsByClassName("ReportList-checklists")[0]
      .getElementsByClassName("ChecklistItem");
    let checklists = [];
    for (var i = 0; i < checknums.length; i++) {
      checklists.push(
        checknums[i].getElementsByTagName("a")[0].getAttribute("href").slice(11)
      );
    }
    return checklists;
  });
  await browser.close();
  console.log(data);
  return data;
}

async function main(checklists) {
  const parsed = JSON.parse(checklists);
  console.log("parsed", parsed);
  //console.log("string", JSON.parse(checklists));
  console.log("length", parsed.length);
  const tracks = await getTrack(parsed); // get the tracks for all checklists
  //const db = new Datastore();
  // get the checklist information
  for (let i = 0; i < parsed.length; i++) {
    var configChecklist = {
      method: "get",
      url: `https://api.ebird.org/v2/product/checklist/view/${parsed[i]}`,
      headers: {
        "X-eBirdApiToken": key,
      },
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
      method: "get",
      url: `https://api.ebird.org/v2/ref/region/info/${location}`,
      headers: {
        "X-eBirdApiToken": key,
      },
    };

    function getRandomInt() {
      return Math.floor(Math.random()) * 2 - 1;
    }

    const loc = await axios(configLoc)
      .then(function (response) {
        const minX = response.data.bounds.minX;
        const maxX = response.data.bounds.maxX;
        const long = (minX + maxX) / 2;
        const minY = response.data.bounds.minY;
        const maxY = response.data.bounds.maxY;
        const lat = (minY + maxY) / 2;
        const lat_jitter = (Math.random() / 2500) * getRandomInt();
        const long_jitter = (Math.random() / 2500) * getRandomInt();

        const name = response.data.result;
        return [[lat + lat_jitter, long + long_jitter], name];
      })
      .catch(function (error) {
        console.log(error);
      });

    console.log(loc);

    responseChecklist.coords = loc[0];

    responseChecklist.locName = loc[1];

    responseChecklist.track = tracks[i];

    responseChecklist.dependent = i;

    //const database = client.db("eBirdCBC");
    //const collection = database.collection("checklists");

    //await collection.deleteMany({}); // delete all documents in the collection
    db.insert({ responseChecklist }); // insert the response from the api call
  }
}

async function clear() {
  try {
    db.remove({}, { multi: true }, function (err, numRemoved) {
      db.loadDatabase(function (err) {
        // done
      });
    }); // delete all documents in the collection
  } finally {
  }
}

async function getPoints() {
  //const db = new Datastore();
  //await client.connect();
  //const database = client.db("eBirdCBC");
  //const collection = database.collection("checklists");
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
  const result = await db.find({});
  return result;
}

// update species dependency
// update == "checklistId, new dependent value, species"
// we need to convert from the common name to the species code
async function updateSpeciesDep(update) {
  const parse = update.split(",");
  console.log(parse);
  const speciesCode = Object.keys(ebirdcode).find(
    (key) => ebirdcode[key] === parse[2]
  ); // get the species code from the common name

  // nedb doesn't support positional operators ($) so we need to get the data and find the position of the species
  const result = await db.find({ "responseChecklist.subId": parse[0] });
  const obs = result[0].responseChecklist.obs;
  console.log(obs);
  let position = 0;
  for (let i = 0; i < obs.length; i++) {
    if (obs[i].speciesCode === speciesCode) {
      position = i;
    }
  }
  let json = `{"responseChecklist.subId": "${parse[0]}", "responseChecklist.obs.speciesCode": "${speciesCode}"}`;
  const filter = JSON.parse(json);
  console.log(filter);
  const updateDoc = {
    $set: {
      [`responseChecklist.obs.${position}.speciesDependent`]: `${parse[1]}`,
    },
  };
  console.log(updateDoc);
  await db.updateAsync(filter, updateDoc);
}

// update == "checklistId, new dependent value"
async function updateDep(update) {
  //const db = new Datastore();

  //await client.connect();
  //const database = client.db("eBirdCBC");
  //const collection = database.collection("checklists");
  const parse = update.split(",");
  let json = `{"responseChecklist.subId": "${parse[0]}"}`;
  //console.log(db.find({}));
  const filter = JSON.parse(json);
  const updateDoc = {
    $set: {
      "responseChecklist.dependent": String(`${parse[1]}`),
    },
  };
  db.update(filter, updateDoc);
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
  // get the deps on a species level first
  const speciesDeps = [];
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].responseChecklist.obs.length; j++) {
      const dep = data[i].responseChecklist.obs[j].speciesDependent;
      speciesDeps.push(dep);
    }
  }
  //console.log("speciesDeps", speciesDeps);

  // get the deps on a checklist level
  const deps = [];
  for (let i = 0; i < obs.length; i++) {
    for (let j = 0; j < obs[i].length; j++) {
      const dep = data[i].responseChecklist.dependent;
      deps.push(dep);
    }
  }
  console.log("deps", deps);

  for (let i = 0; i < deps.length; i++) {
    if (speciesDeps[i] != undefined) {
      deps[i] = speciesDeps[i];
    }
  }

  console.log("true", deps.length == speciesDeps.length);

  // get the checklist that the dep is from
  const checklist = [];
  for (let i = 0; i < obs.length; i++) {
    for (let j = 0; j < obs[i].length; j++) {
      const dep = data[i].responseChecklist.obs[j].subId;
      checklist.push(dep);
    }
  }
  console.log("checklist", checklist);

  // take from "GCKI: 1" to {species: "GCKI", count: 1}
  var obs = obs.flat(1);
  const species = [];
  for (let i = 0; i < obs.length; i++) {
    species.push(Object.keys(obs[i])[0]);
  }
  const counts = [];
  for (let i = 0; i < obs.length; i++) {
    counts.push(Object.values(obs[i])[0]);
  }
  const names = [];
  for (let i = 0; i < species.length; i++) {
    names.push(ebirdcode[species[i]]);
  }

  const position = [];
  for (let i = 0; i < species.length; i++) {
    position.push(ebirdTaxonomy[species[i]]);
  }
  console.log("position", position);

  console.log(obs.length);
  //console.log(data);
  const df = new DataFrame({
    count: counts,
    species: species,
    common_name: names,
    dependent: deps,
    taxPos: position,
    checklist: checklist,
  });
  df.show();
  console.log(df.dim());
  df.sortBy("taxPos");

  // agg by 'species' and get the checklists as a string for that species
  const checklistString = df.toArray();
  console.log(checklistString);

  // get the list of checklists sorted by species
  let checklistBySpecies = [];
  for (let i = 0; i < checklistString.length; i++) {
    checklistBySpecies.push(checklistString[i][5]);
  }
  console.log(checklistBySpecies);

  // get the number of times each species was seen
  const checklistCount = df
    .groupBy("species")
    .aggregate((group) => group.count())
    .toArray();
  const speciesCounts = [];
  for (let i = 0; i < checklistCount.length; i++) {
    speciesCounts.push(checklistCount[i][1]);
  }
  console.log(speciesCounts);

  // get the list of checklists for each species
  const checklistList = [];
  for (let i = 0; i < speciesCounts.length; i++) {
    let speciesChecks = [];
    for (let j = 0; j < speciesCounts[i]; j++) {
      speciesChecks.push(checklistBySpecies[0]);
    }
  } // NOT WORKING YET

  const speciesList = df
  .filter((row) => row.get("dependent") !== "Delete")
  .groupBy("dependent", "species", "common_name")
  .aggregate((group) => {
      const sum = group.stat.max("count");
      const checklists = group.select("checklist").toArray();
      return [ sum, checklists ];
  })
  .rename("aggregation", "count_checklists")
  .withColumn("count", (row) => row.get("count_checklists")[0])
  .withColumn("checklists", (row) => "(" + String(row.get("count_checklists")[1]) + ")")
  .groupBy("species", "common_name")
  .aggregate((group) => {
      const sum = group.stat.sum("count");
      const checklists = [].concat(...group.select("checklists").toArray());
      console.log(checklists);
      return [ sum, checklists ];
  })
  .rename("aggregation", "count_checklists")
  .withColumn("count", (row) => row.get("count_checklists")[0])
  .withColumn("checklists", (row) => String(row.get("count_checklists")[1]))
  .select("species", "common_name", "count", "checklists")
speciesList.show();
const speciesListCollection = speciesList.toCollection();
console.log(speciesListCollection);
return speciesListCollection;
}

//getTrack('S124180823')

module.exports = {
  main,
  clear,
  getPoints,
  updateDep,
  getSpecies,
  tripReport,
  updateSpeciesDep,
};
