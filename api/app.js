const express = require('express');
const app = express();

const cors = require('cors');

app.use(cors());

// using axios to make api calls to eBird and mongodb to connect to the database

const funs = require('./lib.js');


app.put('/add-check', (req, res) => {
    const checklist = req.query.checklist;
    console.log(checklist.data);
    funs.main(checklist);
    res.send(`inputted ${checklist} into the database`);
});

app.post('/clear', (req, res) => {
    funs.clear();
    res.send('cleared the database');
});

app.get('/get-points', async function (req, res) {
    const points = await funs.getPoints();
    //console.log(points);
    res.send(points);
});

app.post('/dependency-update', async function (req, res) {
    const dependent = req.query.dependent;
    await funs.updateDep(dependent);
    res.send(`updated ${dependent} in the database`);
});

app.listen(9000, () => {
    console.log('Server listening on port 9000');
});