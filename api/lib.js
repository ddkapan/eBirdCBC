const axios = require('axios');
const { response } = require('express');
const MongoClient = require('mongodb').MongoClient;
var DataFrame = require('dataframe-js').DataFrame;

// getting the ebird and passwords api key from the env 
const key = process.env.EBIRDKEY;
//const password = process.env.MONGO_PASSWORD;

// connecting to the mongoDB
const url = 'mongodb://localhost:27017'



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

  console.log(obs.length);
  //console.log(data);
  const df = new DataFrame({
    count: counts,
    species: species,
    dependent: deps,
  });
  df.show();
  console.log(df.dim());

  const speciesList = df.groupBy('dependent', 'species').aggregate(group => group.stat.max('count'))
    .rename('aggregation', 'count').groupBy('species').aggregate(group => group.stat.sum('count')).rename('aggregation', 'count');
  speciesList.show();
  const speciesListCollection = speciesList.toCollection();
  console.log(speciesListCollection);
  return speciesListCollection;
}





module.exports = { main, clear, getPoints, updateDep, getSpecies };