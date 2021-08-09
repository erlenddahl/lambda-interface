import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert'

class CalculatorSetup extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="calculator-setup" style={this.props.style}>
            <Alert variant="info">{this.props.selectedStations.length} stations selected for calculations.</Alert>
        </div>
    }
}

CalculatorSetup.propTypes = {
    style: PropTypes.object,
    selectedStations: PropTypes.array
};

export default CalculatorSetup;