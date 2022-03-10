import React from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import InputEditor from './InputEditor';
import HelpText from './HelpText';
import { Tooltip } from 'react-tippy';

class EditStationDialog extends React.Component {

    constructor(props) {
        super(props);

        this.onSave = this.onSave.bind(this);

        this.validation = yup.object().shape({
            id: yup.string().required(),
            name: yup.string().required(),
            transmitPower: yup.number().positive().integer().required(),
            gainDefinition: yup.string().required(),
            maxRadius: yup.number().positive().integer().required(),
            height: yup.number().positive().required()
        });
    }

    onSave(values, { setSubmitting }) {
        setSubmitting(false);
        this.props.onSave(values);
    }

    render() {
        if (!this.props.selectedStation) return null;
        return <div className="station-editor sidebar-block">
            <Formik
                initialValues={this.props.selectedStation}
                validationSchema={this.validation}
                enableReinitialize={true}
                onSubmit={this.onSave}
            >
                {({ isSubmitting, handleSubmit }) => (
                    <Form onSubmit={handleSubmit} className="sidebar-content-container">
                        
                        <div className="sidebar-content-controls">
                            
                            <h2>{this.props.isEditing ? "Edit station" : "New station"}</h2>

                            <FormGroup>
                                <FormLabel>
                                    <HelpText tooltip="The location of this station (WGS84).">
                                        Location:
                                    </HelpText>
                                </FormLabel>
                                <FormControl type="text" value={this.props.selectedStation.getCoordinateString()} readOnly></FormControl>
                            </FormGroup>

                            <Field name="id">
                                {({ field }) => <InputEditor field={field} title="Id" tooltip="The unique ID of this station, used for identifying the station in calculation results. If this ID is not unique, road link calculations will fail."></InputEditor>}
                            </Field>
                            <Field name="name">
                                {({ field }) => <InputEditor field={field} title="Name" tooltip="A simple display name to help you identify this station on the map. Does not have to be unique, and is only for your convenience."></InputEditor>}
                            </Field>
                            <Field name="antennaType">
                            {({ field }) => (
                                <InputEditor field={field} title="Antenna type" tooltip="The unique ID of this station, used for identifying the station in calculation results. If this ID is not unique, road link calculations will fail.">
                                    <FormControl as="select" {...field}>
                                        <option value="MobileNetwork">Mobile network</option>
                                        <option value="ItsG5">ITS G5</option>
                                    </FormControl>
                                </InputEditor>)}
                            </Field>
                            <Field name="transmitPower">
                                {({ field }) => <InputEditor field={field} unit="Db" title="Power" tooltip="The base transmit power of this station. It is equal in all directions. For RSRP calculations, power and (directional) gain is added before subtracting the different losses."></InputEditor>}
                            </Field>
                            <Field name="gainDefinition">
                                {({ field }) => <InputEditor field={field} unit="Db" title="Gain" tooltip="The (directional) gain of this station. It can be a single number for constant gain in all directions, or a sector definition for different gain in different directions. Example: '-45:45:18|45:60:7' (18 Db between -45 and 45 degrees, and 7 Db between 45 and 60 degrees). See the the 'Station parameters' section in the documentation."></InputEditor>}
                            </Field>
                            <Field name="height">
                                {({ field }) => <InputEditor field={field} unit="m" title="Height above terrain" tooltip="Transmitter height above the terrain."></InputEditor>}
                            </Field>
                            <Field name="maxRadius">
                                {({ field }) => <InputEditor field={field} unit="m" title="Maximum signal radius" tooltip="The radius around this station that it is necessary for the road link calculation to consider road links. A higher radius prolongs the calculation time, as more road links must be considered. See the 'Performance' section in the documentation."></InputEditor>}
                            </Field>
                        </div>
                        
                        <div className='sidebar-content-buttons'>
                            <Tooltip title="Save all changes you have made to this station.">
                                <Button className="mt-4" disabled={isSubmitting} type="submit">{this.props.isEditing ? "Save changes" : "Save station"}</Button>
                            </Tooltip>
    
                            <Tooltip title="Discard all changes you have made to this station.">
                                <Button variant="secondary" disabled={isSubmitting} onClick={this.props.onCancel}>Cancel</Button>
                            </Tooltip>
                            {this.props.isEditing && (
                                <Tooltip title="Delete this station. This action cannot be undone!">
                                    <Button variant="danger" disabled={isSubmitting} onClick={this.props.onDelete}>Delete station</Button>
                                </Tooltip>)}
                        </div>

                    </Form>
                )}
            </Formik>
        </div>
    }
}

EditStationDialog.propTypes = {
    selectedStation: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    isEditing: PropTypes.bool
};

export default EditStationDialog;