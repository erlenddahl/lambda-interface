import React from 'react';
import PropTypes from 'prop-types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';

class AddStationDialog extends React.Component{
    
    constructor(props){
        super(props);

        this.onMapClicked = this.onMapClicked.bind(this);
        this.onDialogSubmitted = this.onDialogSubmitted.bind(this);

        this.state = {
            selectedStation: null,
            clickedPoint: null
        };

        this.validation = yup.object().shape({
            name: yup.string().required(),
            frequency: yup.number().required().positive().integer(),
            height: yup.number().required().positive().required()
        });
    }

    onMapClicked(info){
        if(!info.object)
            this.setState({
                clickedPoint: info
            });
    }

    onDialogSubmitted(values, { setSubmitting }){
        setSubmitting(false);
        this.props.onDialogSubmitted(values);
        console.log(values);
    }

    render(){
        if(!this.props.clickedPoint) return null;
        return <div style={{ position: "absolute", zIndex: 1 }}>
            <h2>New station</h2>
            <strong>Location:</strong> ({this.props.clickedPoint.lngLat[0].toFixed(8)}, {this.props.clickedPoint.lngLat[1].toFixed(8)})

            <Formik
                initialValues={{ name: '', frequency: 22000, height: 12 }}
                validationSchema={this.validation}
                onSubmit={this.onDialogSubmitted}
                >
                {({ isSubmitting }) => (
                    <Form>
                    <Field type="text" name="name" />
                    <ErrorMessage name="name" component="div" />
                    <Field type="number" name="frequency" />
                    <ErrorMessage name="frequency" component="div" />
                    <Field type="number" name="height" />
                    <ErrorMessage name="height" component="div" />
                    <button type="submit" disabled={isSubmitting}>
                        Submit
                    </button>
                    </Form>
                )}
                </Formik>
        </div>
    }
}

AddStationDialog.propTypes = {
    clickedPoint: PropTypes.object,
    onDialogSubmitted: PropTypes.func.isRequired
};

export default AddStationDialog;