const axios = require('axios')

key = process.env.EBIRDKEY;

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

    const species = []
    response.obs.forEach(function(obs) {
        species.push(obs.speciesCode);
    });

    const count = []
    response.obs.forEach(function(obs) {
        count.push(obs.howManyAtmost);
    });

    console.log(species, count)

};

for (const checklist of checklists) {
    main(checklist);
};
