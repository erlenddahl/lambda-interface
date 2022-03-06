import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Alert from 'react-bootstrap/Alert';
import ConsoleInformationPanel from '../Helpers/ConsoleInformationPanel.js';

class JobTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    getLayerName(job){
        return "results-geojson-" + job.data.Id;
    }

    async onResultToggleRequested(job){
        this.setState({isBusy: true});
        await this.props.onResultToggleRequested(job);
        this.setState({isBusy: false});
    }

    render() {

        if(!this.props.jobs || this.props.jobs.length < 1)
            return <span>You have no previously started jobs.</span>

        return (<table style={{width: "100%"}} className="mt-4">
            <thead>
                <tr>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
            {this.props.jobs.map(p =>
                <React.Fragment key={p.data.Id}>
                    <tr>
                        <td>{moment(p.data.Enqueued).format('MMMM Do YYYY, HH:mm:ss')}</td>
                        <td>{p.status}</td>
                        <td>
                            {!this.state.isBusy && p.status != "InQueue" && (<a disabled={this.state.isBusy} href="#" onClick={() => this.setState(s => ({showDetails: p == s.showDetails ? null : p }))}>{this.state.showDetails?.data.Id == p.data.Id ? "Hide details" : "Show details"}</a>)}
                            {!this.state.isBusy && p.status == "Finished" && (<a disabled={this.state.isBusy} href="#" className="mx-2" onClick={() => this.onResultToggleRequested(p)}>{this.props.currentGeoJsonLayerName == this.getLayerName(p) ? "Hide results from map" : "Show results on map"}</a>)}
                            {!this.state.isBusy && p.status == "Finished" && (<a disabled={this.state.isBusy} href="#" className="mx-2" onClick={() => this.props.onDeleteRequested(p)}>Delete</a>)}
                            {this.state.isBusy && <span>Loading data ...</span>}
                        </td>
                    </tr>

                    {this.state.showDetails?.data.Id == p.data.Id && (<tr><td colSpan="3">
                        {p.data.RunException && 
                            <Alert className="mt-4" variant="danger">{p.data.RunException}</Alert>
                        }
                        <ConsoleInformationPanel data={p.data.Snapshot}></ConsoleInformationPanel>
                        </td></tr>)}
                </React.Fragment>
            )}
            </tbody>
        </table>)
    }
}

JobTable.propTypes = {
    jobs: PropTypes.array,
    currentGeoJsonLayerName: PropTypes.string,
    onResultToggleRequested: PropTypes.func,
    onDeleteRequested: PropTypes.func
};

export default JobTable;