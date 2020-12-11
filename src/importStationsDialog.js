import React from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormCheck from 'react-bootstrap/FormCheck';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import PropTypes from 'prop-types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';

import { WithOnChangeHandler } from 'formik-form-callbacks';

class ImportStationsDialog extends React.Component {

    constructor(props) {
        super(props);

        this.onSave = this.onSave.bind(this);
        this.onFormValueChanged = this.onFormValueChanged.bind(this);

        this.validation = yup.object().shape({
            separator: yup.string().required(),
            decimalSign: yup.string().required(),
            hasHeaders: yup.bool(),
            csv: yup.string().required()
        });

        this.state = {
            defaultValues: {
                separator: ";",
                decimalSign: ",",
                hasHeaders: true,
                csv: "id;name;frequency;height;lat;lng\r\n" + 
                     "181199;Station name;25000;250;10,365430273040675;63,42050427064208"
            }
        }
    }

    onSave(values, { setSubmitting }) {
        setSubmitting(false);
        this.props.onSave(values);
    }

    onFormValueChanged(values, errors){

        if(this.formValues && this.formValues.timer){
            clearTimeout(this.formValues.timer);
        } 

        this.formValues = {
            values, 
            errors, 
            hasErrors: Object.keys(errors).length > 0,
            timer: setTimeout(() => {
                if(!this.formValues.hasErrors){
                    // Now, here is an actual valid form change.
                    console.log(this.formValues.values);
                }
            }, 500)
        };
    }

    render() {
        return <div className="station-importer sidebar-block">

            <Formik
                initialValues={this.state.defaultValues}
                validationSchema={this.validation}
                onSubmit={this.onSave}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Field name="separator">
                            {({ field }) => (
                                <FormGroup controlId="separator">
                                    <FormLabel>Separator:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage name="separator" component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="decimalSign">
                            {({ field }) => (
                                <FormGroup controlId="decimalSign">
                                    <FormLabel>Decimal sign:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage name="decimalSign" component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="hasHeaders">
                            {({ field }) => (
                                <FormGroup controlId="hasHeaders">
                                    <FormCheck label="Has headers" type="checkbox" {...field} checked={field.value} />
                                    <ErrorMessage name="hasHeaders" component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="csv">
                            {({ field }) => (
                                <FormGroup controlId="csv">
                                    <FormLabel>Station csv:</FormLabel>
                                    <FormControl as="textarea" {...field} />
                                    <ErrorMessage name="csv" component="div" />
                                </FormGroup>
                            )}
                        </Field>

                        <WithOnChangeHandler>
                            {({ values, errors }) => this.onFormValueChanged(values, errors)}
                        </WithOnChangeHandler>

                        <Button disabled={isSubmitting} type="submit">Import</Button>
                        <Button variant="secondary" disabled={isSubmitting} onClick={this.props.onCancel}>Cancel</Button>
                    </Form>
                )}
            </Formik>
        </div>
    }
}

ImportStationsDialog.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ImportStationsDialog;