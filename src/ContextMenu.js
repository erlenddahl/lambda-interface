import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';

class ContextMenu extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if(!this.props.shown) return null;

        return <div className="map-context-menu" style={{ left: this.props.left, top: this.props.top }}>
            WGS84: {this.props.coordinate[0].toFixed(8) + ", " + this.props.coordinate[1].toFixed(8)}
            
            {!this.props.station && <Button variant="success" className="mt-4 w-100" onClick={() => this.props.onNewStationRequested(this.props.coordinate)}>Create new station at this location</Button>}
            {this.props.station && <Button className="mt-2 w-100" onClick={() => this.props.onMoveStationRequested()}>Move station to this location</Button>}
            {this.props.station && this.props.station.isEditClone && <Button className="mt-2 w-100" onClick={() => this.props.onCalculationRequested(this.props.station, this.props.coordinate)}>Calculate path loss from {this.props.station.name}</Button>}
            <Button variant="secondary" className="mt-2 w-100" onClick={() => this.props.onHideMenuRequested()}>Hide menu</Button>
        </div>
    }
}

ContextMenu.propTypes = {
    shown: PropTypes.bool,
    left: PropTypes.number,
    top: PropTypes.number,
    coordinate: PropTypes.array,
    station: PropTypes.object,
    onNewStationRequested: PropTypes.func,
    onMoveStationRequested: PropTypes.func,
    onCalculationRequested: PropTypes.func,
    onHideMenuRequested: PropTypes.func
};

export default ContextMenu;