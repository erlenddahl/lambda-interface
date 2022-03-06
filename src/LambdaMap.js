import React from 'react';
import PropTypes from 'prop-types';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MVTLayer } from '@deck.gl/geo-layers';
import circle from '@turf/circle';
import './LambdaMap.css';
import ReactMapGL from 'react-map-gl';
import { MAPBOX_TOKEN } from './Helpers/Constants';

class LambdaMap extends React.Component {

  constructor(props) {
    super(props);

    this._colors = [[58,181,74], [64, 214, 67], [84, 229, 88], [149, 236, 79], [191, 255, 96], [238, 255, 0], [255, 235, 1], [255, 217, 54], [255, 198, 29], [255, 175, 54], [255, 118, 55], [255, 52, 58], [236, 28, 28]];
    
    this.state = {
      hoveredObject: null,
      lastZoomOrder: 0
    };
  }

  getLinkColor(min, max, current){
    return this._colors[this.getLinkColorIndex(min, max, current)];
  }

  getLinkColorIndex(min, max, current){

    if(current <= min) return this._colors.length - 1;
    if(current >= max) return 0;

    current -= min;
    max -= min;

    const ratio = (this._colors.length - 1) / max;
    const value = current * ratio;

    return Math.round(this._colors.length - value - 1);
  }

  getStationColor(station) {
    return station.getColor();
  }
  
  getTooltip(data){
    if(data.isLink) return this.getLinkTooltip(data);
    return this.getStationTooltip(data);
  }

  getLinkTooltip(data){
    return "Average RSRP: " + data.Average.toFixed(2) + ", Min: " + data.Min.toFixed(2) + ", Max: " + data.Max.toFixed(2) + ", LCIx: " + this.getLinkColorIndex(-60, -125, data.Max);
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

    const baseStationGeoJson = {
      "type": "FeatureCollection",
      "features": this.props.stations.map(p => ({ "type": "Feature", "properties": p, "geometry": { "type": "Polygon", "coordinates": circle([p.lngLat[0], p.lngLat[1]], 0.01).geometry.coordinates } }))
    };

    const layers = [
      new MVTLayer({
        data: "https://openinframap.org/map.json",
        visible: this.props.layers.openinframap.visible
      }),
      new MVTLayer({
        id: "nvdb-roadlinks",
        data: "https://mobilitet.sintef.no/maps/roadnetwork/{z}/{x}/{y}/tile.mvt",
        getLineColor: [100, 100, 100],
        getLineWidth: 5,
        visible: this.props.layers.roadnetwork.visible
      }),
      new GeoJsonLayer({
        id: 'geojson-layer',
        data: baseStationGeoJson,
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

    if(this.props.layers.results.visible && this.props.resultsLayer?.geoJson){
      layers.push(new GeoJsonLayer({
        id: 'geojson-link-layer',
        data: this.props.resultsLayer.geoJson,
        pickable: true,
        stroked: false,
        filled: true,
        lineWidthScale: 8,
        getLineColor: p => this.getLinkColor(-125, -60, p.properties.Max),
        autoHighlight: true,
        highlightColor: [0, 0, 0, 255],
        visible: this.props.layers.mystations.visible
      }));
    }

    return (<ReactMapGL
      {...this.props.viewport}
      onViewportChange={this.props.onViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}>
      <DeckGL
        initialViewState={this.props.viewport}
        {...this.props.viewport}
        layers={layers}
        getTooltip={info => info.object && this.getTooltip(info.object.properties)}
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
  children: PropTypes.element,
  resultsLayer: PropTypes.object
}

export default LambdaMap;