import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import './App.css';
import L from 'leaflet';
import { GeoJSON } from 'https://cdn.esm.sh/react-leaflet/GeoJSON';
//const track = require('./tracks.json');
const axios = require('axios');


  
// reversing the coordinates
// for (let i = 0; i < track.features[0].geometry.coordinates[0].length; i++) {
//   track.features[0].geometry.coordinates[0][i].reverse();
// }


// parsing the .gpx files
//var gpx = new gpxParser();
//let geoJSON = gpx.toGeoJSON('./public/ebird_track.gpx');
function App() {
  const [checklists, setlist] = useState("");
  
  let handleSubmit = async (e) => {
    console.log('hello');

    e.preventDefault();
  
  await axios.get('http://localhost:9000/clear') 
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });

  for (const checklist of e) {
    await axios.get(`http://localhost:9000/add-check?checklist=${checklist}`)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
  });
};
}

  //console.log(track.features[0].geometry.coordinates[0])

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
      <MapContainer center={[38, -122]} zoom={10} scrollWheelZoom={true}>
        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
        
      </MapContainer>
    </div>
  );
};

export default App;
