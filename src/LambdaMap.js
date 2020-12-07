import React from 'react';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer} from '@deck.gl/layers';
import circle from '@turf/circle';
import './LambdaMap.css';

import {TerrainLayer} from '@deck.gl/geo-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiZXJsZW5kZGFobCIsImEiOiJjamwyMjh6eWsxbTE4M3JxdGF3MHplb2l1In0.t2NyiwBoC_OjujWzYu9-rQ";

const INITIAL_VIEW_STATE = {
  latitude: 63.42050427064208,
  longitude: 10.355430273040675,
  zoom: 13.5,
  bearing: 0,
  pitch: 60,
  maxPitch: 89
};

const TERRAIN_IMAGE = `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;
const SURFACE_IMAGE = `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`;

// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
const ELEVATION_DECODER = {
  rScaler: 6553.6,
  gScaler: 25.6,
  bScaler: 0.1,
  offset: -10000
};

class LambdaMap extends React.Component{
  render(){

    const sites = [
      {
        id: 0,
        name: "Test",
        color: {
          r: 160,
          g: 0,
          b: 0,
          a: 255
        },
        latLng: [63.42050427064208, 10.355430273040675]
      }
    ];
  
    const data = {
      "type":"FeatureCollection",
      "features": sites.map(p => ({"type":"Feature","properties": p,"geometry":{"type":"Polygon","coordinates":circle([p.latLng[1], p.latLng[0]], 0.01).geometry.coordinates}}))
    };

    return <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={[
      new TerrainLayer({
        id: 'terrain',
        minZoom: 0,
        maxZoom: 23,
        strategy: 'no-overlap',
        elevationDecoder: ELEVATION_DECODER,
        elevationData: TERRAIN_IMAGE,
        texture: SURFACE_IMAGE,
        wireframe: false,
        color: [255, 255, 255]
      }),
      new GeoJsonLayer({
        id: 'geojson-layer',
        data,
        pickable: true,
        stroked: false,
        filled: true,
        extruded: true,
        lineWidthScale: 20,
        lineWidthMinPixels: 2,
        getFillColor: p => { var c = p.properties.color || {}; return [c.r || 0, c.g || 0, c.b || 0, c.a || 255]; },
        getRadius: 10,
        getLineWidth: 1,
        getElevation: 300
      })
    ]} />;
  }
}

export default LambdaMap;