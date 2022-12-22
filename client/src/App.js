import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import './App.css';
import L from 'leaflet';
import { GeoJSON } from 'https://cdn.esm.sh/react-leaflet/GeoJSON';
const track = require('./tracks.json');
//let gpxParser = require('gpxparser');


  
// reversing the coordinates
for (let i = 0; i < track.features[0].geometry.coordinates[0].length; i++) {
  track.features[0].geometry.coordinates[0][i].reverse();
}


// parsing the .gpx files
//var gpx = new gpxParser();
//let geoJSON = gpx.toGeoJSON('./public/ebird_track.gpx');
function App() {
  // const mapRef = useRef();

  // useEffect(() => {
  //   const { current = {} } = mapRef;
  //   const { leafletElement: map } = current;

  //   if (!map) return;

  //   L.GeoJSON(track, {
  //     style: function () {
  //       return {
  //         color: 'red',
  //         weight: 5,
  //         opacity: 0.65
  //       };
  //     }
  //   }).addTo(map);
  // }, [])

  //onst tracks = new L.geoJSON(tracks);

  //tracks.addTo(mapRef.current);

  console.log(track.features[0].geometry.coordinates[0])

  return (
    <div classname="App">
      <MapContainer center={[38, -122]} zoom={10} scrollWheelZoom={true}>
        <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
        <Polyline pathOptions={{ color: 'red' }} positions={track.features[0].geometry.coordinates[0]} />
      </MapContainer>
    </div>
  );
};

export default App;
