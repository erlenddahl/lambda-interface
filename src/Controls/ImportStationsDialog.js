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
                csv: "id;name;antennaType;transmitPower;height;maxRadius;lat;lng\n" + 
                     "181199;Station name;MobileNetwork;62;250;50000;63,42050427064208;10,365430273040675"
            }
        }
    }

    onSave(values, { setSubmitting }) {
        this.attemptCsvParse(values, setSubmitting);
        this.props.onSave(values);
    }

    parseNumberWithSign(v, decimalSign, error){
        if(v == null) throw error;
        let value = null;
        if(decimalSign == ".")
            value = Number(v.replaceAll(",", ""));
        else
            value = Number(v.replaceAll(".", "").replaceAll(",", "."));

        if(isNaN(value)) throw error;

        return value;
    }

    attemptCsvParse(values, setSubmitting){
        try{
            const csv = Papa.parse(values.csv, {
                delimiter: values.delimiter,
                header: values.hasHeaders
            });

            const previewStations = csv.data.map((p, i) => ({
                id: p.id,
                name: p.name,
                transmitPower: this.parseNumberWithSign(p.transmitPower, values.decimalSign, "Invalid transmit power at line " + i),
                antennaType: p.antennaType,
                height: this.parseNumberWithSign(p.height, values.decimalSign, "Invalid height at line " + i),
                maxRadius: this.parseNumberWithSign(p.maxRadius, values.decimalSign, "Invalid max radius at line " + i),
                lngLat: [this.parseNumberWithSign(p.lng, values.decimalSign, "Invalid lng at line " + i), this.parseNumberWithSign(p.lat, values.decimalSign, "Invalid lat at line " + i)],
                color: [100, 100, 100, 100],
                state: "preview"
            }));

            const headerOffset = values.hasHeaders ? 1 : 0;
            previewStations.map((p, i) => {
                if(!p.id && p.id != 0) throw "Invalid id at line " + (i + headerOffset);
                if(!p.name) throw "Invalid name at line " + (i + headerOffset);
                if(p.antennaType.toLowerCase() != "mobilenetwork" && p.antennaType.toLowerCase() != "itsg5") throw "Invalid antenna type at line " + (i + headerOffset);
                if(isNaN(p.transmitPower)) throw "Invalid transmit power at line " + (i + headerOffset);
                if(isNaN(p.height)) throw "Invalid height at line " + (i + headerOffset);
                if(isNaN(p.maxRadius)) throw "Invalid max radius at line " + (i + headerOffset);
                if(isNaN(p.lngLat[0])) throw "Invalid lng at line " + (i + headerOffset);
                if(isNaN(p.lngLat[1])) throw "Invalid lat at line " + (i + headerOffset);
                if(p.lngLat[0] < 0 || p.lngLat[0] > 180) throw "Longitude out of bounds at line " + (i + headerOffset);
                if(p.lngLat[1] < 0 || p.lngLat[1] > 180) throw "Latitude out of bounds at line " + (i + headerOffset);
            });

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

        setSubmitting(false);
    }

    render() {
        return <div className="station-importer sidebar-block">

            <Formik
                initialValues={this.state.defaultValues}
                validationSchema={this.validation}
                onSubmit={this.onSave} 
                validateOnChange={true}
            >
                {({ isSubmitting, handleSubmit, values, setSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                        <Field name="delimiter">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Delimiter:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="decimalSign">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Decimal sign:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="hasHeaders">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormCheck label="Has headers" type="checkbox" {...field} checked={field.value} />
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="csv">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Station csv:</FormLabel>
                                    <FormControl as="textarea" style={{whiteSpace: "pre"}} {...field} />
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>

                        {this.state.parsedStations && <Alert className="mt-4" variant="info">Previewing {this.state.parsedStations} parsed stations on the map (yellow).</Alert>}
                        {this.state.parseError && <Alert className="mt-4" variant="danger">Parse error: {this.state.parseError}</Alert>}

                        <div className="mt-4 lower-right">
                            <Button className="mx-2" variant="info" disabled={isSubmitting} onClick={() => this.attemptCsvParse(values, setSubmitting)}>Preview</Button>
                            <Button disabled={isSubmitting} type="submit">Import</Button>
                        </div>
                        <Button className="mt-4 lower-left" variant="secondary" disabled={isSubmitting} onClick={this.props.onCancel}>Cancel</Button>
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