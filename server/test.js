var axios = require('axios');

var config = {
  method: 'get',
  url: 'https://api.ebird.org/v2/ref/region/info/L21851965',
  headers: { 
    'X-eBirdApiToken': 'vd22umpprej0'
  }
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});