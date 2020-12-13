import React from 'react';
import PropTypes from 'prop-types';
import Table from 'react-bootstrap/Table';

class StationList extends React.Component {

    constructor(props) {
        super(props);
    }

    __renderHeaders() {
        return <tr>
            <th>id</th>
            <th>name</th>
            <th>frequency</th>
            <th>height</th>
            <th>lng</th>
            <th>lat</th>
        </tr>
    }

    __renderStation(station) {
        return <tr key={station.id} onClick={() => this.props.onStationClicked(station)}>
            <td>{station.id}</td>
            <td>{station.name}</td>
            <td>{station.frequency}</td>
            <td>{station.height}</td>
            <td title={station.lngLat[0]}>{station.lngLat[0].toFixed(5)}</td>
            <td title={station.lngLat[1]}>{station.lngLat[1].toFixed(5)}</td>
        </tr>
    }

    render() {
        return <div className="station-list-container" style={this.props.style}>
            <Table striped bordered hover>
                <thead>{this.__renderHeaders()}</thead>
                <tbody>{this.props.stations.map(this.__renderStation)}</tbody>
            </Table>
        </div>
    }
}

StationList.propTypes = {
    style: PropTypes.object,
    stations: PropTypes.array.isRequired,
    onStationClicked: PropTypes.func.isRequired
};

export default StationList;