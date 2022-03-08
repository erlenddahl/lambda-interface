import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';
import JobTable from './JobTable.js';
import CalcHelper from "../Calculations/CalcHelper.js";
import CalculationParameters from "./CalculationParameters.js";
import { API_URL } from '../Helpers/Constants.js';
import UserSettings from '../Helpers/UserSettings.js';

class RoadNetworkCalculator extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isBusy: false,
            jobs: []
        };

        this.apiUrl = API_URL + "/RoadNetwork";

        this.onCalculationClicked = this.onCalculationClicked.bind(this);
        this.generateConfig = this.generateConfig.bind(this);
        this.toggleResults = this.toggleResults.bind(this);
        this.onDeleteRequested = this.onDeleteRequested.bind(this);
        this.onAbortRequested = this.onAbortRequested.bind(this);
        this.onCalculationParametersChanged = this.onCalculationParametersChanged.bind(this);
        
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
                if(!data.data){
                    // This job has been finished, and will not return status data anymore.
                    // Reload the job list to fetch the final item.
                    await this.loadJobs();
                    return; 
                }
                
                this.updateJobState(data);
            }));
        }catch(ex){
            console.log(ex);
        }
        this.intervalID = setTimeout(this.refreshJobStatuses.bind(this), 1000);
    }

    updateJobState(data){
        this.setState(state => ({
            jobs: state.jobs.filter(p => p.data.Id !== data.data.Id).concat(data).sort((a,b) => a.data.Enqueued.localeCompare(b.data.Enqueued))
        }));
    }

    async onDeleteRequested(job){
        this.setBusy(true);

        try{
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            };
            const response = await fetch(this.apiUrl + "/delete?key=" + job.data.Id, requestOptions);
            const data = await response.json();
            
            if(data.error){
                this.setState({ calculationError: data.error });
            }

            await this.loadJobs();

            if(this.props.currentGeoJsonLayerName == this.getLayerName(job)){
                this.props.onAddGeoJsonLayer(null, null);
            }

        }catch(ex){
            this.setState({ calculationError: ex.message });
        }

        this.setBusy(false);
    }

    async onAbortRequested(job){
        try{
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            };
            const response = await fetch(this.apiUrl + "/abort?key=" + job.data.Id, requestOptions);
            const data = await response.json();
            
            if(data.error){
                this.setState({ calculationError: data.error });
            }

            await this.loadJobs();

        }catch(ex){
            this.setState({ calculationError: ex.message });
        }
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

            this.setState({ jobs: jobs });

        }catch(ex){
            console.log(ex);
        }

        this.setBusy(false);
    }

    async generateConfig(){
        if(this.hasParameterErrors()){
            console.log("Calculation aborted -- parameters has errors");
            return;
        }

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
            body: JSON.stringify(this.helper.addCalculationParameters({
                    "baseStations": this.props.selectedStations.map(p => this.helper.toBaseStationObject(p))
                }, this.parameterValues))
        };
    }

    hasParameterErrors(){
        return this.parameterErrors && Object.keys(this.parameterErrors).length;
    }

    async onCalculationClicked(){

        if(this.hasParameterErrors()){
            console.log("Calculation aborted -- parameters has errors");
            return;
        }

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

    onCalculationParametersChanged(values, errors){
        this.parameterErrors = errors;
        this.parameterValues = values;

        if(!this.hasParameterErrors()){
            UserSettings.setCalculationParameters(this.parameterValues);
        }
    }

    render() {
        const calculationStartBlocks = this.state.isBusy || !this.props.selectedStations.length || (this.parameterErrors && this.parameterErrors.length > 0);

        return <div className="calculator-setup" style={this.props.style}>

            <h3 className="my-3">New calculation</h3>

            <CalculationParameters onValuesChanged={this.onCalculationParametersChanged}></CalculationParameters>

            <Alert className="my-3" variant="info">{this.props.selectedStations.length} stations selected for calculations. {!this.props.selectedStations.length && <span>Click a station on the map to select it.</span>}</Alert>
            <Button onClick={this.onCalculationClicked} disabled={calculationStartBlocks}>Calculate</Button>

            <Button className="mx-2" variant="secondary" onClick={this.generateConfig} disabled={calculationStartBlocks}>Generate config for offline calculation</Button>

            <h3 className="my-3 mt-5">Calculation log</h3>
            {this.state.calculationError && <Alert className="mt-4" variant="danger">{this.state.calculationError}</Alert>}

            <JobTable jobs={this.state.jobs} currentGeoJsonLayerName={this.props.currentGeoJsonLayerName} onResultToggleRequested={this.toggleResults} onDeleteRequested={this.onDeleteRequested} onAbortRequested={this.onAbortRequested}></JobTable>
        </div>
    }
}

RoadNetworkCalculator.propTypes = {
    style: PropTypes.object,
    selectedStations: PropTypes.array,
    onAddGeoJsonLayer: PropTypes.func,
    currentGeoJsonLayerName: PropTypes.string
};

export default RoadNetworkCalculator;