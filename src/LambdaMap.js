import React from 'react';
import PropTypes from 'prop-types';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer, IconLayer } from '@deck.gl/layers';
import { MVTLayer } from '@deck.gl/geo-layers';
import ReactMapGL from 'react-map-gl';
import { MAPBOX_TOKEN, API_URL } from './Helpers/Constants';

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
    if(data.properties?.isLink) return this.getLinkTooltip(data.properties);
    if(data.properties) return this.getGenericTooltip(data.properties);
    return this.getStationTooltip(data);
  }

  getGenericTooltip(props){
    console.log(props);
    let s = "";
    for(var key in props){
      s += key + ": " + props[key] + "\n";
    }
    return s;
  }

  getLinkTooltip(data){
    return "Average RSRP: " + data.Average.toFixed(2) + ", Min: " + data.Min.toFixed(2) + ", Max: " + data.Max.toFixed(2);
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

    const layers = [
      new MVTLayer({
        data: "https://openinframap.org/map.json",
        visible: this.props.layers.openinframap.visible,
        pickable: true
      }),
      new MVTLayer({
        id: "nvdb-roadlinks",
        data: "https://mobilitet.sintef.no/maps/roadnetwork/{z}/{x}/{y}/tile.mvt",
        getLineColor: [100, 100, 100],
        getLineWidth: 5,
        pickable: true,
        visible: this.props.layers.roadnetwork.visible
      })
    ];

    if(this.props.layers.results.visible && this.props.resultsLayer?.geoJson){
      layers.push(new GeoJsonLayer({
        id: 'geojson-link-layer',
        data: this.props.resultsLayer.geoJson,
        pickable: true,
        stroked: false,
        filled: true,
        lineWidthScale: 15,
        getPointRadius: () => 3,
        getFillColor: p => this.getLinkColor(-110, -60, p.properties.Max),
        getLineColor: p => this.getLinkColor(-110, -60, p.properties.Max),
        autoHighlight: true,
        highlightColor: [0, 0, 0, 255],
        visible: this.props.layers.results.visible
      }));
    }

    layers.push(new IconLayer({
      id: 'icon-layer',
      data: this.props.stations,
      getIcon: d => ({
        url: API_URL + "/icon?power=" + d.transmitPower + "&gainDefinition=" + d.gainDefinition + "&state=" + d.iconState,
        width: 128,
        height: 128,
        anchorY: 64
      }),
      getSize: () => 64,
      pickable: true,
      sizeScale: 1,
      getPosition: d => d.lngLat,
      visible: this.props.layers.mystations.visible,
      onIconError: e => console.log(e)
    }));

    return (<ReactMapGL
      {...this.props.viewport}
      onViewportChange={this.props.onViewportChange}
      mapboxApiAccessToken={MAPBOX_TOKEN}>
      <DeckGL
        initialViewState={this.props.viewport}
        {...this.props.viewport}
        layers={layers}
        getTooltip={info => info.object && this.getTooltip(info.object)}
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