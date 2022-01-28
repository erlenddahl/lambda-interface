import React from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import PropTypes from 'prop-types';

import './StationInfoDialog.css';

class StationInfoDialog extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.selectedStation) return null;

        return <div className="station-editor sidebar-block">
            <h2>Selected station</h2>
            <FormGroup>
                <FormLabel>Location:</FormLabel>
                <FormControl type="text" value={this.props.selectedStation.lngLat[0].toFixed(8) + ", " + this.props.selectedStation.lngLat[1].toFixed(8)} readOnly></FormControl>
            </FormGroup>

            <FormGroup>
                <FormLabel>Id:</FormLabel>
                <FormControl type="text" value={this.props.selectedStation.id} readOnly></FormControl>
            </FormGroup>
        
            <FormGroup>
                <FormLabel>Name:</FormLabel>
                <FormControl type="text" value={this.props.selectedStation.name} readOnly></FormControl>
            </FormGroup>
    
            <FormGroup>
                <FormLabel>Total transmit power:</FormLabel>
                <InputGroup>
                    <FormControl type="number" value={this.props.selectedStation.transmitPower} readOnly></FormControl>
                    <InputGroup.Append>
                        <InputGroup.Text style={{width: "45px"}}>Db</InputGroup.Text>
                    </InputGroup.Append>
                </InputGroup>
            </FormGroup>
        
            <FormGroup>
                <FormLabel>Height above terrain:</FormLabel>
                <InputGroup>
                    <FormControl type="number" value={this.props.selectedStation.height} readOnly></FormControl>
                    <InputGroup.Append>
                        <InputGroup.Text style={{width: "45px"}}>m</InputGroup.Text>
                    </InputGroup.Append>
                </InputGroup>
            </FormGroup>

            <Button className="mt-4" onClick={this.props.onEditRequested}>Calculate path loss for single point</Button>
            <Button onClick={this.props.onEditRequested}>Edit this station</Button>
        </div>
    }
}

StationInfoDialog.propTypes = {
    selectedStation: PropTypes.object,
    onEditRequested: PropTypes.func.isRequired,
};

export default StationInfoDialog;