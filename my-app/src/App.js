import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import './App.css';
import L from 'leaflet';
import { GeoJSON } from 'https://cdn.esm.sh/react-leaflet/GeoJSON';
import track from './tracks.geojson';
let gpxParser = require('gpxparser');




// parsing the .gpx files
//var gpx = new gpxParser();
//let geoJSON = gpx.toGeoJSON('./public/ebird_track.gpx');
function App() {
  const mapRef = useRef();

  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;

    if ( !map ) return;

    L.GeoJSON(track, {
      style: function() {
        return {
          color: 'red',
          weight: 5,
          opacity: 0.65
        };
      }
    }).addTo(map);
  }, [])

  //onst tracks = new L.geoJSON(tracks);

  //tracks.addTo(mapRef.current);

  return (
    <div classname="App">
    <MapContainer center={[38,-122]} zoom={10} scrollWheelZoom={true}>
      <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
    </MapContainer>
    </div>
  );
};

export default App;
