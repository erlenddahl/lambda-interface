import React from 'react';
import PropTypes from 'prop-types';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MVTLayer } from '@deck.gl/geo-layers';
import circle from '@turf/circle';
import './LambdaMap.css';
import ReactMapGL from 'react-map-gl';

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

    this.state = {
      hoveredObject: null,
      lastZoomOrder: 0
    };
  }

  getStationColor(station) {
    if (station.state == "new") return [0, 160, 0, 255];
    if (station.state == "edited") return [100, 100, 100, 100];
    if (station.state == "preview") return [255, 247, 0, 255];
    if (station.state == "selected") return [5, 247, 255, 255];

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
    if (station.state == "selected")
      prefix = "Selected for calculation";

    return prefix + " (" + station.name + ")";
  }

  render() {

    const data = {
      "type": "FeatureCollection",
      "features": this.props.stations.map(p => ({ "type": "Feature", "properties": p, "geometry": { "type": "Polygon", "coordinates": circle([p.lngLat[0], p.lngLat[1]], 0.01).geometry.coordinates } }))
    };

    const layers = [
      new TerrainLayer({
        id: 'terrain',
        minZoom: 0,
        maxZoom: 23,
        strategy: 'no-overlap',
        elevationDecoder: ELEVATION_DECODER,
        elevationData: TERRAIN_IMAGE,
        texture: SURFACE_IMAGE,
        wireframe: false,
        color: [255, 255, 255],
        visible: this.props.layers.terrain.visible
      }),
      new MVTLayer({
        data: "https://openinframap.org/map.json",
        visible: this.props.layers.openinframap.visible
      }),
      new MVTLayer({
        id: "nvdb-roadlinks",
        data: "http://mobilitet.sintef.no/maps/roadnetwork/{z}/{x}/{y}/tile.mvt",
        visible: this.props.layers.roadnetwork.visible
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
        getFillColor: p => this.getStationColor(p.properties),
        getRadius: 10,
        getLineWidth: 1,
        getElevation: p => p.properties.height,
        autoHighlight: true,
        highlightColor: [0, 0, 0, 255],
        visible: this.props.layers.mystations.visible
      })
    ];

    return (<ReactMapGL
      {...this.props.viewport}
      onViewportChange={this.props.onViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}>
      <DeckGL
        initialViewState={this.props.viewport}
        {...this.props.viewport}
        layers={layers}
        getTooltip={info => info.object && this.getStationTooltip(info.object.properties)}
        onClick={this.props.onMapClicked}
        getCursor={() => 'crosshair'} />
        {this.props.children}
    </ReactMapGL>);
  }
}

LambdaMap.propTypes = {
  onMapClicked: PropTypes.func.isRequired,
  stations: PropTypes.array.isRequired,
  onViewportChange: PropTypes.func.isRequired,
  viewport: PropTypes.object.isRequired,
  layers: PropTypes.object.isRequired,
  children: PropTypes.element
}

export default LambdaMap;