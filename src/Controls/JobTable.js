import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Alert from 'react-bootstrap/Alert';
import ConsoleInformationPanel from '../Helpers/ConsoleInformationPanel.js';
import { faTrash, faTasksAlt, faMap, faFileCsv, faBan, faFileArchive, faSpinner } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_URL } from '../Helpers/Constants.js';

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

        if(!this.props.jobs)
            return <span></span>;

        if(this.props.jobs.length < 1)
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
                        <td className="link-container">
                            {!this.state.isBusy && p.status != "InQueue" && (<a disabled={this.state.isBusy} href="#" title="Show or hide details about this job" onClick={() => this.setState(s => ({showDetails: p.data.Id == s.showDetails?.data.Id ? null : p }))} style={{opacity: this.state.showDetails?.data.Id == p.data.Id ? 1 : 0.4}}><FontAwesomeIcon icon={faTasksAlt} size="lg"></FontAwesomeIcon></a>)}
                            {!this.state.isBusy && p.status == "Finished" && (<span>
                                <a disabled={this.state.isBusy} href="#" title="Show or hide results from this job on the map" onClick={() => this.onResultToggleRequested(p)} style={{opacity: this.props.currentGeoJsonLayerName == this.getLayerName(p) ? 1 : 0.4}}><FontAwesomeIcon icon={faMap} size="lg"></FontAwesomeIcon></a>
                                <a target="_blank" rel="noopener noreferrer" href={API_URL + "/RoadNetwork/download?key=" + p.data.Id + "&format=csv"} title="Download results as CSV"><FontAwesomeIcon icon={faFileCsv} size="lg"></FontAwesomeIcon></a>
                                <a target="_blank" rel="noopener noreferrer" href={API_URL + "/RoadNetwork/download?key=" + p.data.Id + "&format=shp"} title="Download results as SHP"><FontAwesomeIcon icon={faFileArchive} size="lg"></FontAwesomeIcon></a>
                            </span>)}
                            {!this.state.isBusy && p.status != "Processing" && (<a disabled={this.state.isBusy} style={{color:"rgb(193, 46, 46)"}} href="#" title="Delete this job and any results from it" onClick={() => this.props.onDeleteRequested(p)}><FontAwesomeIcon icon={faTrash} size="lg"></FontAwesomeIcon></a>)}
                            {!this.state.isBusy && p.status == "Processing" && (<a disabled={this.state.isBusy} style={{color:"rgb(193, 46, 46)"}} href="#" title="Abort this job" onClick={() => this.props.onAbortRequested(p)}><FontAwesomeIcon icon={faBan} size="lg"></FontAwesomeIcon></a>)}
                            {this.state.isBusy && <span><FontAwesomeIcon icon={faSpinner} spin={true} size="lg"></FontAwesomeIcon> Working ...</span>}
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
    onDeleteRequested: PropTypes.func,
    onAbortRequested: PropTypes.func
};

export default JobTable;