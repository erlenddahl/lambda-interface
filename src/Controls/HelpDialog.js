import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Alert from 'react-bootstrap/Alert';

class HelpDialog extends React.Component {

    render() {
        return (<div className="p-3" style={{overflow: "auto", height: "100%"}}>

            <h2>LambdaRoad</h2>

            <p>Welcome to the online demonstrator for the LambdaRoad path loss models. In this tool, you can create base stations on the map (or import them from CSV), and run highly detailed path loss calculations along the road network. Stations you have created are stored in your browser&apos;s local storage for your convenience. To run road network calculations, you need an API key. Contact <a href="mailto:erlend.dahl@sintef.no">erlend.dahl@sintef.no</a> to get one.</p>

            <p>Source code and documentation of the online tool can be found <a href="https://github.com/erlenddahl/lambdaroad-interface" target="_blank" rel="noreferrer">here</a>. Source code and documentation for the calculation core and command line application that can be used for offline calculations can be found <a href="https://github.com/erlenddahl/lambdaroad-model" target="_blank" rel="noreferrer">here</a>.</p>

            <p style={{"fontWeight": "bold"}}>In general, hold your mouse over something in the tool to get a mouseover explanation.</p>

            <p>For long-running calculations with high performance requirements, it is recommended to download the model executable and run it on your own calculation computer, as the current server and queue system may make calculations take a long time. See the &quot;Offline calculations&quot; section in the documentation.</p>

            <Alert variant="info">
                <span>Warning: The online demonstrator has primarly been tested in Mozilla Firefox and Google Chrome. It will probably work in most modern browsers, but it should not be surprising if there are issues in older browsers such as Internet Explorer.</span>
            </Alert>

            <div className="lower-right">
                <Button onClick={() => this.props.closeRequested()}>Close</Button>
            </div>
        </div>);
    }
}

HelpDialog.propTypes = {
    closeRequested: PropTypes.func,
}

export default HelpDialog