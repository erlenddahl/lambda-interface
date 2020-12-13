import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert'

class CalculatorSetup extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="calculator-setup" style={this.props.style}>
            <Alert variant="info">Nothing here yet. When implemented, this panel will allow you to start various calculations.</Alert>
        </div>
    }
}

CalculatorSetup.propTypes = {
    style: PropTypes.object
};

export default CalculatorSetup;