import React from 'react';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import PropTypes from 'prop-types';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import UserSettings from '../Helpers/UserSettings';

class CalculationParameters extends React.Component {

    constructor(props) {
        super(props);

        this.validation = yup.object().shape({
            minimumAllowableRsrp: yup.number().integer().required(),
            receiverHeightAboveTerrain: yup.number().required(),
            linkCalculationPointFrequency: yup.number().required()
        });
    }

    render() {
        return <div>

            <Formik
                initialValues={UserSettings.getCalculationParameters()}
                validationSchema={this.validation}
                enableReinitialize={true}
                onSubmit={this.onSave}
            >
                {({ handleSubmit, values, errors }) => (
                    <Form onSubmit={handleSubmit}>
                        <Field name="minimumAllowableRsrp">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Minimum RSRP:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="receiverHeightAboveTerrain">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Receiver height above terrain:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="linkCalculationPointFrequency">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Link calculation point frequency:</FormLabel>
                                    <FormControl type="text" {...field} />
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>
                        <Field name="mobileNetworkRegressionType">
                            {({ field }) => (
                                <FormGroup controlId={field.name}>
                                    <FormLabel>Mobile network regression type:</FormLabel>
                                    <FormControl as="select" {...field}>
                                        <option value="Dynamic">Dynamic -- use LOS or NLOS where appropriate</option>
                                        <option value="All">All -- use regression model calculated from all points</option>
                                        <option value="LineOfSight">LOS -- use regression model calculated from points with LOS</option>
                                        <option value="NoLineOfSight">NLOS -- use regression model calculated from points without LOS</option>
                                    </FormControl>
                                    <ErrorMessage className="error-message" name={field.name} component="div" />
                                </FormGroup>
                            )}
                        </Field>

                        {this.props.onValuesChanged(values, errors) || ""}
                    </Form>
                )}
            </Formik>
        </div>
    }
}

CalculationParameters.propTypes = {
    onValuesChanged: PropTypes.func.isRequired
}

export default CalculationParameters