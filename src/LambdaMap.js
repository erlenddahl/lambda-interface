import React from 'react';
import PropTypes from 'prop-types';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
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

  constructor(props){
    super(props);

    this.state = { 
      hoveredObject: null
    };
  }

  getStationColor(station){
    if(station.state == "new") return [0, 160, 0, 255];
    if(station.state == "edited") return [100, 100, 100, 100];
    if(station.state == "preview") return [255, 247, 0, 255];

    return [160, 0, 0, 255];
  }

  render(){

    const data = {
      "type":"FeatureCollection",
      "features": this.props.stations.map(p => ({"type":"Feature","properties": p,"geometry":{"type":"Polygon","coordinates":circle([p.lngLat[0], p.lngLat[1]], 0.01).geometry.coordinates}}))
    };

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
    });

    return (<DeckGL 
      initialViewState={INITIAL_VIEW_STATE} 
      controller={true} 
      layers={[
        new GeoJsonLayer({
          id: 'geojson-layer',
          data,
          pickable: true,
          stroked: false,
          filled: true,
          extruded: true,
          lineWidthScale: 20,
          lineWidthMinPixels: 2,
          getFillColor: p => this.getStationColor(p.properties),
          getRadius: 10,
          getLineWidth: 1,
          getElevation: p => p.properties.height,
          autoHighlight: true,
          highlightColor: [0,0,0,255]
        })
    ]}
    getTooltip={function(info){return info.object && info.object.properties.name; }}
    onClick={this.props.onMapClicked}
    getCursor={() => 'crosshair'}>
      <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
    </DeckGL>);
  }
}

LambdaMap.propTypes = {
  onMapClicked: PropTypes.func.isRequired,
  stations: PropTypes.array.isRequired
}

export default LambdaMap;