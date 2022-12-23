const express = require('express');
const app = express();

// using axios to make api calls to eBird and mongodb to connect to the database

const funs = require('./lib.js');


app.get('/add-check', (req, res) => {
    const checklist = req.query.checklist;
    console.log(checklist.data);
        funs.main(checklist);
    res.send(`inputted ${checklist} into the database`);
});

app.get('/clear', (req, res) => {
    funs.clear();
    res.send('cleared the database');
});

app.listen(9000, () => {
    console.log('Server listening on port 9000');
  });