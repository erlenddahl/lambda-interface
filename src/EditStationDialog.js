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
            frequency: yup.number().required().positive().integer(),
            height: yup.number().required().positive().required()
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
                <FormControl type="text" value={this.props.selectedStation.lngLat[0].toFixed(8) + ", " + this.props.selectedStation.lngLat[1].toFixed(8)} readOnly></FormControl>
            </FormGroup>

            <Formik
                initialValues={this.props.selectedStation}
                validationSchema={this.validation}
                onSubmit={this.onSave}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Field name="id">
                            {({ field }) => (
                                <FormGroup controlId="id">
                                    <FormLabel>Id:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage name="id" component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="name">
                            {({ field }) => (
                                <FormGroup controlId="name">
                                    <FormLabel>Name:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage name="name" component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="frequency">
                            {({ field }) => (
                                <FormGroup controlId="frequency">
                                    <FormLabel>Frequency:</FormLabel>
                                    <InputGroup>
                                        <FormControl type="number" {...field} />
                                        <InputGroup.Append>
                                            <InputGroup.Text style={{width: "45px"}}>Hz</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage name="frequency" component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="height">
                            {({ field }) => (
                                <FormGroup controlId="height">
                                    <FormLabel>Height:</FormLabel>
                                    <InputGroup>
                                        <FormControl type="number" {...field} />
                                        <InputGroup.Append>
                                            <InputGroup.Text style={{width: "45px"}}>m</InputGroup.Text>
                                        </InputGroup.Append>
                                    </InputGroup>
                                    <ErrorMessage name="height" component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Button disabled={isSubmitting} type="submit">{this.props.isEditing ? "Save changes" : "Create station"}</Button>
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