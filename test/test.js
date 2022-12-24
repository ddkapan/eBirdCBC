var axios = require('axios');

checklists = ['S124281998', 'S124324579', 'S124324581'];

axios.get('http://localhost:9000/clear') 
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });


for (const checklist of checklists) {
axios.get(`http://localhost:9000/add-check?checklist=${checklist}`)
.then(function (response) {
  console.log(response);
})
.catch(function (error) {
  console.log(error);
});
};