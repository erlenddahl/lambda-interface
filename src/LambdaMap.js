import React from 'react';
import PropTypes from 'prop-types';
import ReactMapGL, { FlyToInterpolator } from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import circle from '@turf/circle';
import * as d3 from 'd3-ease';
import './LambdaMap.css';

import { TerrainLayer } from '@deck.gl/geo-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiZXJsZW5kZGFobCIsImEiOiJjamwyMjh6eWsxbTE4M3JxdGF3MHplb2l1In0.t2NyiwBoC_OjujWzYu9-rQ";

const TERRAIN_IMAGE = `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;
const SURFACE_IMAGE = `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`;

// https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb
const ELEVATION_DECODER = {
  rScaler: 6553.6,
  gScaler: 25.6,
  bScaler: 0.1,
  offset: -10000
};

class LambdaMap extends React.Component {

  constructor(props) {
    super(props);

    this.__onViewportChange = this.__onViewportChange.bind(this);

    this.state = {
      hoveredObject: null,
      viewport: {
        width: "100%",
        height: 900,
        latitude: 63.42050427064208,
        longitude: 10.355430273040675,
        zoom: 13.5,
        bearing: 0,
        pitch: 60,
        maxPitch: 89
      }
    };
  }

  getStationColor(station) {
    if (station.state == "new") return [0, 160, 0, 255];
    if (station.state == "edited") return [100, 100, 100, 100];
    if (station.state == "preview") return [255, 247, 0, 255];

    return [160, 0, 0, 255];
  }

  getStationTooltip(station) {
    var prefix = "Station";

    if (station.state == "new")
      prefix = "Newly created station";
    if (station.state == "edited" || station.isEditClone)
      prefix = "Currently edited station";
    if (station.state == "preview")
      prefix = "Import preview station";

    return prefix + " (" + station.name + ")";
  }

  __onViewportChange(data) {
    if (data.pitch > 60) data.pitch = 60;
    this.setState({ viewport: data });
  }

  _goToNYC() {
    //TODO: Somehow use this to zoom to selected station
    const viewport = {
      ...this.state.viewport,
      longitude: -74.1,
      latitude: 40.7,
      zoom: 14,
      transitionDuration: 2500,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: d3.easeCubic
    };
    this.setState({ viewport });
  }

  render() {

    const data = {
      "type": "FeatureCollection",
      "features": this.props.stations.map(p => ({ "type": "Feature", "properties": p, "geometry": { "type": "Polygon", "coordinates": circle([p.lngLat[0], p.lngLat[1]], 0.01).geometry.coordinates } }))
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

    const geoJsonLayer = new GeoJsonLayer({
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
      highlightColor: [0, 0, 0, 255]
    });

    return (<ReactMapGL
      {...this.state.viewport}
      onViewportChange={this.__onViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}>
      <DeckGL
        initialViewState={this.state.viewport}
        {...this.state.viewport}
        layers={[geoJsonLayer]}
        getTooltip={info => info.object && this.getStationTooltip(info.object.properties)}
        onClick={this.props.onMapClicked}
        getCursor={() => 'crosshair'} />
    </ReactMapGL>);
  }
}

LambdaMap.propTypes = {
  onMapClicked: PropTypes.func.isRequired,
  stations: PropTypes.array.isRequired
}

export default LambdaMap;