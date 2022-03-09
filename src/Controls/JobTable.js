import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Alert from 'react-bootstrap/Alert';
import ConsoleInformationPanel from '../Helpers/ConsoleInformationPanel.js';
import { faTrash, faTasksAlt, faMap, faFileCsv, faBan, faFileArchive, faSpinner } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_URL } from '../Helpers/Constants.js';
import { Tooltip } from 'react-tippy';

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
                            {!this.state.isBusy && (<React.Fragment>
                            {p.status != "InQueue" && (<Tooltip title="Show or hide details about this job">
                                <a href="#" onClick={() => this.setState(s => ({showDetails: p.data.Id == s.showDetails?.data.Id ? null : p }))} style={{opacity: this.state.showDetails?.data.Id == p.data.Id ? 1 : 0.4}}>
                                    <FontAwesomeIcon icon={faTasksAlt} size="lg"></FontAwesomeIcon>
                                </a>
                            </Tooltip>)}
                            {p.status == "Finished" && (<span>
                                <Tooltip title="Show or hide results from this job on the map">
                                    <a href="#" onClick={() => this.onResultToggleRequested(p)} style={{opacity: this.props.currentGeoJsonLayerName == this.getLayerName(p) ? 1 : 0.4}}>
                                        <FontAwesomeIcon icon={faMap} size="lg"></FontAwesomeIcon>
                                    </a>
                                </Tooltip>
                                <Tooltip title="Download results as CSV">
                                    <a target="_blank" rel="noopener noreferrer" href={API_URL + "/RoadNetwork/download?key=" + p.data.Id + "&format=csv"}>
                                        <FontAwesomeIcon icon={faFileCsv} size="lg"></FontAwesomeIcon>
                                    </a>
                                </Tooltip>
                                <Tooltip title="Download results as SHP">
                                    <a target="_blank" rel="noopener noreferrer" href={API_URL + "/RoadNetwork/download?key=" + p.data.Id + "&format=shp"}>
                                        <FontAwesomeIcon icon={faFileArchive} size="lg"></FontAwesomeIcon>
                                    </a>
                                </Tooltip>
                            </span>)}
                            {p.status != "Processing" && (
                                <Tooltip title="Delete this job and any results from it">
                                    <a style={{color:"rgb(193, 46, 46)"}} href="#" onClick={() => this.props.onDeleteRequested(p)}>
                                        <FontAwesomeIcon icon={faTrash} size="lg"></FontAwesomeIcon>
                                    </a>
                                </Tooltip>)}
                            {p.status == "Processing" && (
                                <Tooltip title="Abort this job">
                                    <a style={{color:"rgb(193, 46, 46)"}} href="#" onClick={() => this.props.onAbortRequested(p)}>
                                        <FontAwesomeIcon icon={faBan} size="lg"></FontAwesomeIcon>
                                    </a>
                                </Tooltip>)}
                            </React.Fragment>)}
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