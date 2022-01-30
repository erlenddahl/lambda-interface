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
            
            <Button className="mt-4 w-100" onClick={() => this.props.onNewStationRequested(this.props.coordinate)}>Create new station here</Button>
            {this.props.selectedStation && <Button className="w-100" onClick={() => this.props.onNewStationRequested(this.props.coordinate)}>Calculate path loss from {this.props.selectedStation.name}</Button>}
        </div>
    }
}

ContextMenu.propTypes = {
    shown: PropTypes.bool,
    left: PropTypes.number,
    top: PropTypes.number,
    coordinate: PropTypes.array,
    selectedStation: PropTypes.object,
    onNewStationRequested: PropTypes.func,
};

export default ContextMenu;