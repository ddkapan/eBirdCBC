import React, { useEffect } from 'react';
import {useState} from 'react';
import { MapContainer, GeoJSON, TileLayer } from 'react-leaflet';

const ShapefileOverlayMap = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Load the shapefile data from a URL or file
    fetch('/src/ebird_track.gpx')
      .then(response => response.json())
      .then(json => setData(json));
  }, []);

  return (
    <MapContainer center={[0, 0]} zoom={13}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      {data && (
        <GeoJSON data={data} style={() => ({ color: 'red' })} />
      )}
    </MapContainer>
  );
};

export default ShapefileOverlayMap;
