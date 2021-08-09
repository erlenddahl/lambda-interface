import React from 'react';
import Button from 'react-bootstrap/Button';
import FormControl from 'react-bootstrap/FormControl';
import FormCheck from 'react-bootstrap/FormCheck';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import Alert from 'react-bootstrap/Alert'
import PropTypes from 'prop-types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import Papa from 'papaparse';

class ImportStationsDialog extends React.Component {

    constructor(props) {
        super(props);

        this.onSave = this.onSave.bind(this);
        this.onFormValueChanged = this.onFormValueChanged.bind(this);

        this.validation = yup.object().shape({
            delimiter: yup.string().required(),
            decimalSign: yup.string().required(),
            hasHeaders: yup.bool(),
            csv: yup.string().required()
        });

        this.state = {
            defaultValues: {
                delimiter: ";",
                decimalSign: ",",
                hasHeaders: true,
                csv: "id;name;frequency;height;lat;lng\r\n" + 
                     "181199;Station name;25000;250;63,42050427064208;10,365430273040675"
            }
        }
    }

    onSave(values, { setSubmitting }) {
        setSubmitting(false);
        this.props.onSave(values);
    }

    parseNumberWithSign(v, decimalSign, error){
        if(v == null) throw error;
        if(decimalSign == ".")
            return parseFloat(v.replaceAll(",", ""));
        else
            return parseFloat(v.replaceAll(".", "").replaceAll(",", "."));
    }

    onFormValueChanged(values, errors){

        if(this.formValues){
            var isChanged = false;
            for(var key in values)
                if(this.formValues.values[key] != values[key]){
                    isChanged = true;
                    break;
                }

            if(!isChanged) return;
        }

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

                    try{
                        const csv = Papa.parse(values.csv, {
                            delimiter: values.delimiter,
                            header: values.hasHeaders
                        });
    
                        const previewStations = csv.data.map((p, i) => ({
                            id: p.id,
                            name: p.name,
                            frequency: this.parseNumberWithSign(p.frequency, values.decimalSign, "Invalid frequency at line " + i),
                            height: this.parseNumberWithSign(p.height, values.decimalSign, "Invalid height at line " + i),
                            lngLat: [this.parseNumberWithSign(p.lng, values.decimalSign, "Invalid lng at line " + i), this.parseNumberWithSign(p.lat, values.decimalSign, "Invalid lat at line " + i)],
                            color: [100, 100, 100, 100],
                            state: "preview"
                        }));

                        if(previewStations.map((p, i) => {
                            if(!p.id && p.id != 0) throw "Invalid id at line " + i;
                            if(!p.name) throw "Invalid name at line " + i;
                            if(isNaN(p.frequency)) throw "Invalid frequency at line " + i;
                            if(isNaN(p.height)) throw "Invalid height at line " + i;
                            if(isNaN(p.lngLat[0])) throw "Invalid lng at line " + i;
                            if(isNaN(p.lngLat[1])) throw "Invalid lat at line " + i;
                            if(p.lngLat[0] < 0 || p.lngLat[0] > 180) throw "Longitude out of bounds at line " + i;
                            if(p.lngLat[1] < 0 || p.lngLat[1] > 180) throw "Latitude out of bounds at line " + i;
                        }))
    
                        this.setState({
                            parsedStations: previewStations.length,
                            parseError: null
                        });

                        this.props.onPreview(previewStations);
                    }catch(err){
                        this.setState({
                            parsedStations: null,
                            parseError: JSON.stringify(err)
                        });
                        this.props.onPreview([]);
                    }
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
                        <Field name="delimiter">
                            {({ field }) => (
                                <FormGroup controlId="delimiter">
                                    <FormLabel>Delimiter:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage name="delimiter" component="div" />
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

                        {this.state.parsedStations && <Alert variant="info">Previewing {this.state.parsedStations} parsed stations on the map.</Alert>}
                        {this.state.parseError && <Alert variant="danger">Parse error: {this.state.parseError}</Alert>}

                        <Button className="w-100 mb-2" disabled={isSubmitting || this.state.parseError} type="submit">{(this.state.parseError || !this.state.parsedStations) ? "[Nothing to import]" : "Import " + this.state.parsedStations + " stations"}</Button>
                        <Button className="w-100 mb-2" variant="secondary" disabled={isSubmitting} onClick={this.props.onCancel}>Cancel</Button>
                    </Form>
                )}
            </Formik>
        </div>
    }
}

ImportStationsDialog.propTypes = {
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onPreview: PropTypes.func.isRequired
};

export default ImportStationsDialog;