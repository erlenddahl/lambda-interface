import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';
//import moment from 'moment';
import ConsoleInformationPanel from './Helpers/ConsoleInformationPanel.js';
import CalcHelper from "./Calculations/CalcHelper.js";
import ReactFrappeChart from "react-frappe-charts";

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
        
        const r = this.state.results;

        return <div className="calculator-setup" style={this.props.style}>
            <Alert variant="info">Selected station: {this.props.station.name} ({this.props.station.id})</Alert>
            
            <Button onClick={this.onCalculationClicked} disabled={this.state.isBusy || !this.props.station}>Calculate</Button>

            {r && <div>
                <ReactFrappeChart
                    type="line"
                    axisOptions={{ xAxisMode: "tick", yAxisMode: "tick", xIsSeries: true }}
                    lineOptions={{ hideDots: 1 }}
                    height={250}
                    data={{
                        labels: r.rssi.map((_, i) => i),
                        datasets: [{ 
                            name: "RSSI",
                            chartType: "line",
                            values: r.rssi 
                        }, { 
                            name: "Terrain height",
                            chartType: "line",
                            values: r.vector.map(p => p.z) 
                        }],
                    }}
                />
                <ConsoleInformationPanel data={r.snapshot}></ConsoleInformationPanel>
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