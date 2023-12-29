require("dotenv").config();
const express = require("express");
const app = express();
const multer  = require('multer');
var path = require("path");

const cors = require("cors");

app.use(cors());

let dir;

if (process.platform === 'win32') {
  dir = path.join(process.env.HOMEPATH, "Documents/eBirdCBC/");
} else {
  dir = path.join(process.env.HOME, "Documents/eBirdCBC/");
}

// using axios to make api calls to eBird and mongodb to connect to the database

const funs = require("./lib.js");

app.put("/add-check", async (req, res) => {
  const checklist = req.query.checklist;
  console.log(checklist.data);
  await funs.main(checklist);
  res.send(`inputted ${checklist} into the database`);
});

app.post("/clear", (req, res) => {
  funs.clear();
  res.send("cleared the database");
});

app.get("/get-points", async function (req, res) {
  const points = await funs.getPoints();
  //console.log(points);
  res.send(points);
});

app.post("/dependency-update", async function (req, res) {
  const dependent = req.query.dependent;
  await funs.updateDep(dependent);
  res.send(`updated ${dependent} in the database`);
});

app.get("/get-species", async function (req, res) {
  const species = await funs.getSpecies();
  res.send(species);
});

app.get("/report", async function (req, res) {
  const number = req.query.number;
  const report = await funs.tripReport(number);
  res.send(report);
});

app.get("/species-dep", async function (req, res) {
  const update = req.query.update;
  await funs.updateSpeciesDep(update);
  res.send(`updated ${update} in the database`);
});

// app.post("/uploadDB", async function (req, res) {
//   console.log(req.params);
//   await funs.uploadDB(req.files);
//   res.send("uploaded the database");
// });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, "database.db");
  },
});
const upload = multer({ storage: storage  }); 
app.post('/uploadDB', upload.single('file'), async function (req, res, next) {
  // req.file is the 'file' file
  console.log(req.file);
  await funs.uploadDB(req.file);
  res.send('uploaded the database');
});

app.get("/downloadDB", async function (req, res) {
  const db = await funs.downloadDB();
  res.send(db);
});

app.listen(9000, () => {
  console.log("Server listening on port 9000");
});
