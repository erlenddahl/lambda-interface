import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';
import moment from 'moment';
import ConsoleInformationPanel from '../Helpers/ConsoleInformationPanel.js';
import CalcHelper from "../Calculations/CalcHelper.js";

class CalculatorSetup extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isBusy: false,
            jobs: []
        };

        this.apiUrl = "https://localhost:44332/roadnetwork";

        this.onCalculationClicked = this.onCalculationClicked.bind(this);
        this.generateConfig = this.generateConfig.bind(this);
        
        this.helper = new CalcHelper();
    }
    
    async componentDidMount() {
        await this.loadJobs();
        await this.refreshJobStatuses();
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    async refreshJobStatuses() {
        try{
            await Promise.all(this.state.jobs.map(async p => {

                if(p.status == "Failed" || p.status == "Finished") return;

                const requestOptions = {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                };
                const response = await fetch(this.apiUrl + "?key=" + p.data.Id, requestOptions);
                const data = await response.json();
                if(!data.data) return;
                
                this.updateJobState(data);
            }));
        }catch(ex){
            console.log(ex);
        }
        this.intervalID = setTimeout(this.refreshJobStatuses.bind(this), 1000);
    }

    updateJobState(data){
        this.setState(state => ({
            jobs: state.jobs.filter(p => p.data.Id !== data.data.Id).concat(data).sort((a,b) => a.data.Enqueued.localeCompare(b.data.Enqueued)),
            showDetails: !state.showDetails || state.showDetails.data.Id !== data.data.Id ? state.showDetails : data
        }));
    }

    async loadJobs(){

        this.setBusy(true);

        try{
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            };
            const response = await fetch(this.apiUrl + "/jobs", requestOptions);
            const data = await response.json();
            const jobs = data.map(p => p);

            this.setState(s => ({ jobs: (s.jobs || []).concat(jobs) }));

        }catch(ex){
            console.log(ex);
        }

        this.setBusy(false);
    }

    async generateConfig(){

        this.setBusy(true);

        try{
            const response = await fetch(this.apiUrl + "/generateConfig", this.getCalculationRequestOptions());
            const data = await response.json();
            
            alert(JSON.stringify(data, null, 4));

        }catch(ex){
            this.setState({ calculationError: ex.message });
        }

        this.setBusy(false);
    }

    async toggleResults(job){

        if(this.props.currentGeoJsonLayerName == this.getLayerName(job)){
            this.props.onAddGeoJsonLayer(null, null);
            return;
        }

        this.setBusy(true);

        try{
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            };
            const response = await fetch(this.apiUrl + "/results?key=" + job.data.Id, requestOptions);
            const data = await response.json();
            const geoJson = {
                "type": "FeatureCollection",
                "features": data.links.map(p => ({ 
                    "type": "Feature", 
                    "properties": {...p, isLink: true}, 
                    "geometry": { 
                        "type": "LineString", 
                        "coordinates": p.Points.map(c => this.helper.toWgsArr([c[0], c[1]]))
                    } 
                }))
            };

            this.props.onAddGeoJsonLayer(this.getLayerName(job), geoJson);

        }catch(ex){
            this.setState({ calculationError: ex.message });
        }

        this.setBusy(false);
    }

    getLayerName(job){
        return "results-geojson-" + job.data.Id;
    }

    getCalculationRequestOptions(){
        return {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                    "baseStations": this.props.selectedStations.map(p => this.helper.toBaseStationObject(p)),
                    "minimumAllowableSignalValue": -125
                })
        };
    }

    async onCalculationClicked(){
        this.setBusy(true);

        try{
            const response = await fetch(this.apiUrl, this.getCalculationRequestOptions());
            const data = await response.json();

            if(data.error){
                this.setState({ calculationError: data.error, isBusy: false });
                return;
            }

            this.updateJobState(data);

        }catch(ex){
            this.setState({ calculationError: ex.message });
        }

        this.setBusy(false);
    }

    setBusy(value){
        this.setState(s => ({ isBusy: value, calculationError: value ? null : s.calculationError }));
    }

    render() {
        return <div className="calculator-setup" style={this.props.style}>

            <h3 className="my-3">New calculation</h3>
            <Alert variant="info">{this.props.selectedStations.length} stations selected for calculations. {!this.props.selectedStations.length && <span>Click a station on the map to select it.</span>}</Alert>
            <Button onClick={this.onCalculationClicked} disabled={this.state.isBusy || !this.props.selectedStations.length}>Calculate</Button>
            <Button className="mx-2" variant="secondary" onClick={this.generateConfig} disabled={this.state.isBusy || !this.props.selectedStations.length}>Generate config for offline calculation</Button>

            <h3 className="my-3 mt-5">Calculation log</h3>
            {this.state.calculationError && <Alert className="mt-4" variant="danger">{this.state.calculationError}</Alert>}

            {this.state.jobs.length > 0 && (<table style={{width: "100%"}} className="mt-4">
                <thead>
                    <tr>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                {this.state.jobs.map(p =>
                    <React.Fragment key={p.data.Id}>
                        <tr>
                            <td>{moment(p.data.Enqueued).format('MMMM Do YYYY, HH:mm:ss')}</td>
                            <td>{p.status}</td>
                            <td>
                                {!this.state.isBusy && p.status != "InQueue" && (<a disabled={this.state.isBusy} href="#" onClick={() => this.setState(s => ({showDetails: p == s.showDetails ? null : p }))}>{this.state.showDetails == p ? "Hide details" : "Show details"}</a>)}
                                {!this.state.isBusy && p.status == "Finished" && (<a disabled={this.state.isBusy} href="#" className="mx-2" onClick={() => this.toggleResults(p)}>{this.props.currentGeoJsonLayerName == this.getLayerName(p) ? "Hide results from map" : "Show results on map"}</a>)}
                                {this.state.isBusy && <span>Loading data ...</span>}
                            </td>
                        </tr>

                        {this.state.showDetails == p && (<tr><td colSpan="3">
                            {p.data.RunException && 
                                <Alert className="mt-4" variant="danger">{p.data.RunException}</Alert>
                            }
                            <ConsoleInformationPanel data={p.data.Snapshot}></ConsoleInformationPanel>
                            </td></tr>)}
                    </React.Fragment>
                )}
                </tbody>
            </table>)}
        </div>
    }
}

CalculatorSetup.propTypes = {
    style: PropTypes.object,
    selectedStations: PropTypes.array,
    onAddGeoJsonLayer: PropTypes.func,
    currentGeoJsonLayerName: PropTypes.string
};

export default CalculatorSetup;