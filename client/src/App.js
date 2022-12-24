import React, { useCallback, useEffect, useRef, useState, Component, handleOpen, setOpen } from 'react';
import { MapContainer, Polyline, TileLayer, useMap, useLeafletContext, Popup, Marker } from 'react-leaflet';
import './App.css';
import L from 'leaflet';
import { GeoJSON } from 'https://cdn.esm.sh/react-leaflet/GeoJSON';
import axios from 'axios';
//import Marker from 'react-leaflet-enhanced-marker';
//const track = require('./tracks.json');
var zip = require('lodash.zip');

function App() {

  const [checklists, setlist] = useState("");
  const [markers, setpoints] = useState([]);
  const [deps, setdeps] = useState([]);
  const [colors, setcolors] = useState([])
  const [map, setMap] = useState(null);
  const [count, setCount] = useState(0);


  let clear = async () => {
    // clear the database
    await axios.post('http://localhost:9000/clear')
      .then(function (response) {
        console.log("CLEARED", response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  let updateDep = async (e) => {
    // update the dependent variable in the database
    await axios.post(`http://localhost:9000/dependency-update?dependent=${e}`)
      .then(function (response) {
        console.log("DEPENDENCY UPDATED", response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  // when the form is submitted, add the checklists to the database
  function handleSubmit(e) {
    e.preventDefault();
    // add the checklists to the database
    const data = checklists.split(",");
    const getChecklist = async (a) => {
      await axios.put(`http://localhost:9000/add-check?checklist=${a}`)
        .then(function (response) {
          console.log("PUT CHECKLISTS", response);
        }).catch (function (error) {
          console.log(error);
        });
    };
    const updateDep = async (a) => {
      await axios.post(`http://localhost:9000/dependency-update?dependent=${a}`)
        .then(function (response) {
          console.log("DEPENDENCY UPDATED", response);
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    for (let i = 0; i < data.length; i++) {
      getChecklist(data[i]);
      setTimeout(function(){
        updateDep(`${data[i]},${i}`);
      }, 500)
      console.log("added", String(`${data[i]},${i}`));
    };
  }

  const handleClick = (dependent) => {
    console.log('Click happened');
    console.log(dependent);
  };

  let getpts = async () => {
    // get the points from the database
    const points = await axios.get(`http://localhost:9000/get-points`)
      .then(function (response) {
        console.log("GOT POINTS", response.data);
        const coords = [];
        for (let i = 0; i < response.data.length; i++) {
          coords.push(response.data[i].responseChecklist.coords);
        };
        const dependent = [];
        for (let i = 0; i < response.data.length; i++) {
          dependent.push(response.data[i].dependent);
        };
        const date = [];
        for (let i = 0; i < response.data.length; i++) {

          date.push(response.data[i].responseChecklist.obsDt);
        };
        const duration = [];
        for (let i = 0; i < response.data.length; i++) {
          duration.push(Math.round(response.data[i].responseChecklist.durationHrs * 60) + " mins");
        };
        const ID = [];
        for (let i = 0; i < response.data.length; i++) {
          ID.push(response.data[i].responseChecklist.subId);
        };
        const notes = [];
        for (let i = 0; i < response.data.length; i++) {
          notes.push(response.data[i].responseChecklist.comments);
        };
        // get the species from the database and format them into a string for the popup
        const species = [];
        for (let i = 0; i < response.data.length; i++) {
          const speciesList = [];
          for (let j = 0; j < response.data[i].responseChecklist.obs.length; j++) {
            const code = (response.data[i].responseChecklist.obs[j].speciesCode);
            var comments = (response.data[i].responseChecklist.obs[j].comments);
            if (comments === undefined) {
              speciesList.push(`${code}`);
            } else { // if the comments are too long, split them into multiple lines every 12 words
              if (comments.split(" ").length > 12) {
                var comments = comments.split(' ');
                for (let k = 1; k < (comments.length / 12); k++) {
                  comments.splice(k * 12, 0, "\n");
                };
                var comments = comments.join(" ");
              }
              speciesList.push(`${code} -- ${comments}`);

            }

          };
          species.push(speciesList.join('\n'));
        };
        return {
          coords: coords,
          dependent: dependent,
          date: date,
          duration: duration,
          ID: ID,
          notes: notes,
          species: species,
        };
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log(points);
    const data = zip(points.dependent, points.coords, points.date, points.duration,
      points.ID, points.species, points.notes);
    console.log(data);
    setpoints(data);
    
    const dep_arr = []; // array of dependents
    for(let i = 0; i < data.length; i++) {
      dep_arr.push(String(i))
    };
    setdeps(dep_arr);

    // set the colors and dependents of the points

  };


  return (
    <div classname="App">
      <form onSubmit={handleSubmit}>
        <label>Checklists IDs
          <input
            type="text"
            value={checklists}
            placeholder="Checklists IDs"
            onChange={(e) => setlist(e.target.value)}
          />
        </label>
        <input type="submit" />
      </form>

      <button onClick={clear}>Clear</button>

      <button onClick={getpts}>Get Points</button>
      <MapContainer whenCreated={setMap} classname='Map' center={[38, -122]} zoom={10} scrollWheelZoom={true}>
        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
        {markers.map((marker) => (
          <Marker position={marker[1]}>
            <Popup maxWidth="500" maxHeight="auto">
              <h2>Checklist ID: {marker[4]}</h2>
              <h3>Date: {marker[2]}</h3>
              <h3>Duration: {marker[3]}</h3>
              <h3>Checklist Comments: {marker[6]}</h3>
              <h3>Dependent: {marker[0]}
                <br></br>
                {deps.map((i) => (
                  <button value={String(`${marker[4]},${i[0]}`)} // marker[4] is the checklist ID, i[0] is the dependent
                  onClick={e => updateDep(e.target.value)}>Dependent {i[0]}</button>
                ))}
              </h3>
              <h3>Species: </h3>
              <h5><pre>{marker[5]}</pre></h5>
            </Popup>
          </Marker>
        ))};
      </MapContainer>
    </div>
  );
};

export default App;
