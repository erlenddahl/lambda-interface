import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import { FlyToInterpolator } from 'react-map-gl';
import * as d3 from 'd3-ease';

class StationList extends React.Component {

    constructor(props) {
        super(props);

        this._renderStation = this._renderStation.bind(this);
    }

    _zoomToStation(station) {
        return {
            longitude: station.lngLat[0],
            latitude: station.lngLat[1],
            zoom: 13.5,
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator(),
            transitionEasing: d3.easeCubic
        }
    }

    _renderHeaders() {
        return <tr>
            <th>id</th>
            <th>name</th>
            <th>antenna type</th>
            <th>power</th>
            <th>gain</th>
            <th>height</th>
            <th>max radius</th>
            <th>lng</th>
            <th>lat</th>
        </tr>
    }

    _renderStation(station) {
        return <tr key={station.id} onClick={() => this.props.onMapTransitionRequested(this._zoomToStation(station))}>
            <td>{station.id}</td>
            <td>{station.name}</td>
            <td>{station.antennaType}</td>
            <td>{station.transmitPower} dB</td>
            <td>{station.gain}</td>
            <td>{station.height} m</td>
            <td>{station.maxRadius} m</td>
            <td title={station.lngLat[0]}>{station.lngLat[0].toFixed(5)}</td>
            <td title={station.lngLat[1]}>{station.lngLat[1].toFixed(5)}</td>
        </tr>
    }

    exportCsv(){
        let csv = "id;name;antennaType;power;gain;height;maxRadius;lng;lat<br />";

        for(var i = 0; i < this.props.stations.length; i++){
            const s = this.props.stations[i];
            csv += s.id + ";" + s.name + ";" + s.antennaType + ";" + s.transmitPower + ";" + s.gainDefinition + ";" + s.height + ";" + s.maxRadius + ";" + s.lngLat[0] + ";" + s.lngLat[1] + "<br />";
        }

        this.props.onPopupRequested({
            contents: csv
        });
    }

    render() {
        return <div className="station-list-container sidebar-content-container" style={this.props.style}>
            <div className="sidebar-content-controls">
                <Table striped bordered hover>
                    <thead>{this._renderHeaders()}</thead>
                    <tbody>{this.props.stations.map(this._renderStation)}</tbody>
                </Table>
            </div>

            <div className='sidebar-content-buttons'>
                <Button className="mt-4" onClick={this.props.onImportRequested}>Import CSV</Button>
                <Button className="mt-4 mx-2" onClick={() => this.exportCsv()}>Export CSV</Button>
            </div>
        </div>
    }
}

StationList.propTypes = {
    style: PropTypes.object,
    stations: PropTypes.array.isRequired,
    onMapTransitionRequested: PropTypes.func.isRequired,
    onImportRequested: PropTypes.func.isRequired,
    onPopupRequested: PropTypes.func.isRequired
};

export default StationList;