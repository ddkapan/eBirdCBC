import React, { useEffect } from 'react';
import { useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import './App.css';
let gpxParser = require('gpxparser');

// parsing the .gpx files
var gpx = new gpxParser();
let geoJSON = gpx.toGeoJSON('./my-app/src/ebird_track.gpx');
console.log(geoJSON);
function App() {
  return (
    <MapContainer center={[-122, 38]} zoom={5} scrollWheelZoom={true}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    </MapContainer>
  );
};

export default App;
