async function main(checklist) {
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
        const lat = response.data.bounds.minY;
        const long = response.data.bounds.minX;
        return [lat, long];
      })
      .catch(function (error) {
        console.log(error);
      });
  
      console.log(loc);
  
      responseChecklist.coords = loc;
  
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
      
    try{
      const database = client.db("eBirdCBC");
      const collection = database.collection("checklists");
  
      await collection.deleteMany({}); // delete all documents in the collection
      await collection.insertOne({responseChecklist}); // insert the response from the api call
  
  } finally {
      await client.close();
  }
  };