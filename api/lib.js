const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

// getting the ebird and passwords api key from the env 
const key = process.env.EBIRDKEY;
const password = process.env.MONGO_PASSWORD;

// connecting to the mongoDB
const url = `mongodb+srv://mschulist:${password}@ebirdcbc.i3igsse.mongodb.net/?retryWrites=true&w=majority`;



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
    const data = await collection.find({}).toArray();
    for (let i = 0; i < data.length; i++) {
      data[i].responseChecklist.dependent = String(i);
    }
    return data;
  } finally {
    await client.close();
  }
};




module.exports = { main, clear, getPoints };