import React from 'react';
import PropTypes from 'prop-types';
import Table from 'react-bootstrap/Table';

import { FlyToInterpolator } from 'react-map-gl';
import * as d3 from 'd3-ease';

import './StationList.css';

class StationList extends React.Component {

    constructor(props) {
        super(props);

        this._renderStation = this._renderStation.bind(this);
    }

    _renderHeaders() {
        return <tr>
            <th>id</th>
            <th>name</th>
            <th>antenna type</th>
            <th>transmit power</th>
            <th>height</th>
            <th>lng</th>
            <th>lat</th>
        </tr>
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

    _renderStation(station) {
        return <tr key={station.id} onClick={() => this.props.onMapTransitionRequested(this._zoomToStation(station))}>
            <td>{station.id}</td>
            <td>{station.name}</td>
            <td>{station.antennaType}</td>
            <td>{station.transmitPower} dB</td>
            <td>{station.height} m</td>
            <td title={station.lngLat[0]}>{station.lngLat[0].toFixed(5)}</td>
            <td title={station.lngLat[1]}>{station.lngLat[1].toFixed(5)}</td>
        </tr>
    }

    render() {
        return <div className="station-list-container" style={this.props.style}>
            <Table striped bordered hover>
                <thead>{this._renderHeaders()}</thead>
                <tbody>{this.props.stations.map(this._renderStation)}</tbody>
            </Table>
        </div>
    }
}

StationList.propTypes = {
    style: PropTypes.object,
    stations: PropTypes.array.isRequired,
    onMapTransitionRequested: PropTypes.func.isRequired
};

export default StationList;