import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';
//import moment from 'moment';
import ConsoleInformationPanel from './Helpers/ConsoleInformationPanel.js';
import CalcHelper from "./Calculations/CalcHelper.js";

class SinglePointCalculator extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isBusy: false,
            results: null
        };

        this.apiUrl = "https://localhost:44332/singlepoint";

        this.onCalculationClicked = this.onCalculationClicked.bind(this);
    }

    async onCalculationClicked(){
        this.setState({ isBusy: true });

        const helper = new CalcHelper();

        try{
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                        "baseStation": helper.toBaseStationObject(this.props.station),
                        "targetCoordinates": helper.toUtm(this.props.coordinate)
                    })
            };
            const response = await fetch(this.apiUrl, requestOptions);
            const data = await response.json();

            this.setState({
                results: data
            });

        }catch(ex){
            console.log(ex);
        }

        this.setState({ isBusy: false });
    }

    render() {
        return <div className="calculator-setup" style={this.props.style}>
            <Alert variant="info">Selected station: {this.props.station.name} ({this.props.station.id})</Alert>
            
            <Button onClick={this.onCalculationClicked} disabled={this.state.isBusy || !this.props.station}>Calculate</Button>

            {this.state.results && <div>
                {JSON.stringify(this.state.results.rssi)}
                <ConsoleInformationPanel data={this.state.results.snapshot}></ConsoleInformationPanel>
            </div>}
        </div>
    }
}

SinglePointCalculator.propTypes = {
    style: PropTypes.object,
    station: PropTypes.object,
    coordinate: PropTypes.array
};

export default SinglePointCalculator;