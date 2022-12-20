const axios = require('axios')
const MongoClient = require('mongodb').MongoClient;

// getting the ebird and passwords api key from the env 
key = process.env.EBIRDKEY;
password = process.env.MONGO_PASSWORD;

// connecting to the mongoDB
const uri = `mongodb+srv://mschulist:${password}@ebirdcbc.i3igsse.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

const checklists = ['S124281998'];

async function main(checklist) {
    var config = {
      method: 'get',
      url: `https://api.ebird.org/v2/product/checklist/view/${checklist}`,
      headers: { 
        'X-eBirdApiToken': key
      }
    };
    
    const response = await axios(config)
    .then(function (response) {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });

    /*
    const species = []
    response.obs.forEach(function(obs) {
        species.push(obs.speciesCode);
    });

    const count = []
    response.obs.forEach(function(obs) {
        count.push(obs.howManyAtmost);
    });
    */

    console.log(species, count)
    
  try{
    const database = client.db("eBirdCBC");
    const collection = database.collection("checklists");

    await collection.deleteMany({}); // delete all documents in the collection
    await collection.insertOne({response}); // insert the response from the api call

} finally {
    await client.close();
}
};

for (const checklist of checklists) {
    main(checklist);
};
