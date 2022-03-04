import React from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import InputGroup from 'react-bootstrap/InputGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import PropTypes from 'prop-types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';

import './EditStationDialog.css';

class EditStationDialog extends React.Component {

    constructor(props) {
        super(props);

        this.onSave = this.onSave.bind(this);

        this.validation = yup.object().shape({
            id: yup.string().required(),
            name: yup.string().required(),
            transmitPower: yup.number().positive().integer().required(),
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
            <h2>{this.props.isEditing ? "Edit station" : "New station"}</h2>
            
            <FormGroup>
                <FormLabel>Location:</FormLabel>
                <FormControl type="text" value={this.props.selectedStation.getCoordinateString()} readOnly></FormControl>
            </FormGroup>

            <Formik
                initialValues={this.props.selectedStation}
                validationSchema={this.validation}
                enableReinitialize={true}
                onSubmit={this.onSave}
            >
                {({ isSubmitting, handleSubmit }) => (
                    <Form onSubmit={handleSubmit}>
                        <Field name="id">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Id:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="name">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Name:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="antennaType">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Antenna type:</FormLabel>
                                    <FormControl as="select" {...field}>
                                        <option value="MobileNetwork">Mobile network</option>
                                        <option value="ItsG5">ITS G5</option>
                                    </FormControl>
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="transmitPower">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Total transmit power:</FormLabel>
                                    <InputGroup>
                                        <FormControl type="number" {...field} />
                                        <InputGroup.Append>
                                            <InputGroup.Text style={{width: "45px"}}>Db</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="height">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Height above terrain:</FormLabel>
                                    <InputGroup>
                                        <FormControl type="number" {...field} />
                                        <InputGroup.Append>
                                            <InputGroup.Text style={{width: "45px"}}>m</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="maxRadius">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Maximum radius:</FormLabel>
                                    <InputGroup>
                                        <FormControl type="number" {...field} />
                                        <InputGroup.Append>
                                            <InputGroup.Text style={{width: "45px"}}>m</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        
                        <Button className="mt-4" disabled={isSubmitting} type="submit">{this.props.isEditing ? "Save changes" : "Save station"}</Button>
                        <Button variant="secondary" disabled={isSubmitting} onClick={this.props.onCancel}>Cancel</Button>
                        {this.props.isEditing && <Button variant="danger" disabled={isSubmitting} onClick={this.props.onDelete}>Delete station</Button>}
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