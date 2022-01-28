import React from 'react';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/Alert';
import moment from 'moment';
import ConsoleInformationPanel from './ConsoleInformationPanel.js';
import CalcHelper from "./Calculations/CalcHelper.js";

class SinglePointCalculator extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isBusy: false,
            jobs: []
        };

        this.apiUrl = "https://localhost:44332/roadnetwork";

        this.onCalculationClicked = this.onCalculationClicked.bind(this);
    }
    
    componentDidMount() {
        this.refreshJobStatuses();
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

    async onCalculationClicked(){
        this.setState({ isBusy: true });

        const helper = new CalcHelper();

        try{
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                        "baseStations": [this.props.selectedStation].map(p => helper.toBaseStationObject(p)),
                        "minimumAllowableSignalValue": -150
                    })
            };
            const response = await fetch(this.apiUrl, requestOptions);
            const data = await response.json();

            this.updateJobState(data);

        }catch(ex){
            console.log(ex);
        }

        this.setState({ isBusy: false });
    }

    render() {
        return <div className="calculator-setup" style={this.props.style}>
            {!this.props.selectedStation && <Alert variant="info">Click a station to select it for calculations, then click somewhere on the map to calculate path loss from the selected station to this point.</Alert>}

            {this.props.selectedStation && <Alert variant="info">Selected station: {this.props.selectedStation.name} ({this.props.selectedStation.id})</Alert>}
            
            <Button onClick={this.onCalculationClicked} disabled={this.state.isBusy || !this.props.selectedStation}>Calculate</Button>

            {this.state.jobs.length > 0 && (<table style={{width: "100%"}}>
                <thead>
                    <tr>
                        <th>Created</th>
                        <th>Status</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                {this.state.jobs.map(p =>
                    <React.Fragment key={p.data.Id}>
                        <tr>
                            <td>{moment(p.data.Enqueued).format('MMMM Do YYYY, HH:mm:ss')}</td>
                            <td>{p.status}</td>
                            <td>{p.status != "InQueue" && (<Button onClick={() => this.setState({showDetails: p})}>Show details</Button>)}</td>
                        </tr>
                    </React.Fragment>
                )}
                </tbody>
            </table>)}

            {this.state.showDetails != null && (<div>
                {this.state.showDetails.data.RunException && 
                    <Alert variant="danger">{this.state.showDetails.data.RunException}</Alert>
                }
                <ConsoleInformationPanel data={this.state.showDetails.data.Snapshot}></ConsoleInformationPanel>
            </div>)}
        </div>
    }
}

SinglePointCalculator.propTypes = {
    style: PropTypes.object,
    selectedStation: PropTypes.object
};

export default SinglePointCalculator;