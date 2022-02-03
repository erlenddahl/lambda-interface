import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
//import moment from 'moment';
import ConsoleInformationPanel from './Helpers/ConsoleInformationPanel.js';
import CalcHelper from "./Calculations/CalcHelper.js";
import ReactFrappeChart from "react-frappe-charts";
import { faSpinner } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Card } from 'react-bootstrap';

class SinglePointCalculator extends React.Component {

    constructor(props) {
        super(props);

        this._helper = new CalcHelper();

        this.state = {
            isBusy: false,
            results: null
        };

        this.apiUrl = "https://localhost:44332/singlepoint";

        this.onCalculationClicked = this.onCalculationClicked.bind(this);
    }

    async onCalculationClicked(){
        this.setState({ results: null, isBusy: true });

        try{
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                        "baseStation": this._helper.toBaseStationObject(this.props.station),
                        "targetCoordinates": this._helper.toUtm(this.props.coordinate)
                    })
            };
            const response = await fetch(this.apiUrl, requestOptions);
            const data = await response.json();

            data.distance = data.vector.length;
            data.labels = data.rssi.map((_, i) => i);
            data.altitudes = data.vector.map(p => p.z);
            data.finalRssi = data.rssi[data.rssi.length - 1];
            
            this.setState({ results: data });

        }catch(ex){
            console.log(ex);
        }

        this.setState({ isBusy: false });
    }

    getCurrentCalcId(){
        return this.props.station.id + "_" + this.getCoordinateString(this.props.coordinate);
    }

    getCoordinateString(lngLat, decimals=8){
        return lngLat[0].toFixed(decimals) + ", " + lngLat[1].toFixed(decimals);
    }

    checkCalculation(){
        const id = this.getCurrentCalcId();
        if(!this.state.isBusy && id !== this.calculationId){
            this.calculationId = id;
            this.onCalculationClicked();
        }
    }

    componentDidMount(){
        this.checkCalculation();
    }

    componentDidUpdate() {
        this.checkCalculation();
    }

    render() {
        
        const r = this.state.results || {};

        return <div className="calculator-setup" style={this.props.style}>

            <div className="calculator-summary">
                <Card>
                    <Card.Header>From</Card.Header>
                    <Card.Body>
                        <Card.Text>
                            {this.props.station.name} ({this.props.station.id})<br />
                            {this.props.station.getCoordinateString(5)}
                        </Card.Text>
                    </Card.Body>
                </Card>
                
                <Card>
                    <Card.Header>To</Card.Header>
                    <Card.Body>
                        <Card.Text>
                            Coordinate<br />
                            {this.getCoordinateString(this.props.coordinate, 5)}
                        </Card.Text>
                    </Card.Body>
                </Card>
                
                <Card>
                    <Card.Header>Distance</Card.Header>
                    <Card.Body>
                        <Card.Text>
                            {r.distance} m
                        </Card.Text>
                    </Card.Body>
                </Card>
                
                <Card>
                    <Card.Header>Final RSSI</Card.Header>
                    <Card.Body>
                        <Card.Text>
                            {r.finalRssi?.toFixed(0)} dB
                        </Card.Text>
                    </Card.Body>
                </Card>
            </div>

            {this.state.isBusy && <div><FontAwesomeIcon spin={true} icon={faSpinner}></FontAwesomeIcon> Calculating ...</div>}

            {!this.state.isBusy && r && <div>
                
                {this.state.showDetails && (<div>
                    <ReactFrappeChart
                        type="line"
                        axisOptions={{ xAxisMode: "tick", yAxisMode: "tick", xIsSeries: true }}
                        lineOptions={{ hideDots: 1 }}
                        height={250}
                        data={{
                            labels: r.labels,
                            datasets: [{ 
                                name: "RSSI",
                                chartType: "line",
                                values: r.rssi 
                            }, { 
                                name: "Terrain height",
                                chartType: "line",
                                values: r.altitudes 
                            }],
                        }}
                    />
                    <ConsoleInformationPanel data={r.snapshot}></ConsoleInformationPanel>
                </div>)}
                
                
                {!this.state.showDetails && (<div>
                    <ReactFrappeChart
                        type="line"
                        axisOptions={{ xAxisMode: "tick", yAxisMode: "tick", xIsSeries: true }}
                        lineOptions={{ hideDots: 1 }}
                        height={380}
                        data={{
                            labels: r.labels,
                            datasets: [{ 
                                name: "RSSI",
                                chartType: "line",
                                values: r.rssi 
                            }, { 
                                name: "Terrain height",
                                chartType: "line",
                                values: r.altitudes 
                            }],
                        }}
                    />
                </div>)}

                <Button className="lower-left" variant="secondary" onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}>Details</Button>
                <Button className="lower-right" onClick={this.props.closeRequested}>Close</Button>
            </div>}
        </div>
    }
}

SinglePointCalculator.propTypes = {
    style: PropTypes.object,
    station: PropTypes.object,
    coordinate: PropTypes.array,
    closeRequested: PropTypes.func
};

export default SinglePointCalculator;