import React, { useCallback, useEffect, useRef, useState, Component } from 'react';
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
  const [colors, setcolors] = useState([])
  const [map, setMap] = useState(null);


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


  let handleSubmit = async (e) => {
    e.preventDefault();
    // add the checklists to the database
    for (const checklist of checklists.split(",")) {
      await axios.put(`http://localhost:9000/add-check?checklist=${checklist}`)
        .then(function (response) {
          console.log("PUT CHECKLISTS", response);
        })
        .catch(function (error) {
          console.log(error);
        });
    };
  };

  let getpts = async () => {
    // get the points from the database
    const points = await axios.get(`http://localhost:9000/get-points`)
      .then(function (response) {
        console.log("GOT POINTS", response.data);
        const coords = [];
        for(let i = 0; i < response.data.length; i++){
          coords.push(response.data[i].responseChecklist.coords);
        };
        const dependent = [];
        for(let i = 0; i < response.data.length; i++){
          dependent.push(response.data[i].responseChecklist.dependent);
        };
        const date = [];
        for(let i = 0; i < response.data.length; i++){
          
          date.push(response.data[i].responseChecklist.obsDt);
        };
        const duration = [];
        for(let i = 0; i < response.data.length; i++){
          duration.push(Math.round(response.data[i].responseChecklist.durationHrs * 60) + " mins");
        };
        const ID = [];
        for(let i = 0; i < response.data.length; i++){
          ID.push(response.data[i].responseChecklist.checklistId);
        };
        const species = [];
        for(let i = 0; i < response.data.length; i++){
          const speciesList = [];
          for(let j = 0; j < response.data[i].responseChecklist.obs.length; j++){
            speciesList.push(response.data[i].responseChecklist.obs[j].speciesCode);
          };
          species.push(speciesList.join('\n'));
        };
        return {
          coords: coords,
          dependent: dependent,
          date: date,
          duration: duration,
          ID: ID,
          species: species,
        };
      })
      .catch(function (error) {
        console.log(error);
      });
      console.log(points);
      const data = zip(points.dependent, points.coords, points.date, points.duration, points.ID, points.species);
      console.log(data);
        setpoints(data);
      

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
          <h3>Dependent: {marker[0]}</h3>
          <h3> Species: </h3>
          <pre>{marker[5]}</pre>
        </Popup>
        </Marker>
      ))};
      </MapContainer>
    </div>
  );
};

export default App;
