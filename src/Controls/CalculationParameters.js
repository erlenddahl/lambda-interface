import React from 'react';
import FormControl from 'react-bootstrap/FormControl';
import PropTypes from 'prop-types';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import UserSettings from '../Helpers/UserSettings';
import InputEditor from './InputEditor';

class CalculationParameters extends React.Component {

    constructor(props) {
        super(props);

        this.validation = yup.object().shape({
            apiKey: yup.string().required(),
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
                        <Field name="apiKey">
                            {({ field }) => <InputEditor field={field} title="API key" tooltip="You need to provide an API key in order to run a road network calculation on the server. If you do not have an API key, you can either contact erlend.dahl@sintef.no, or download the application (or source code) and run it on your own computer (see the 'Offline calculations' section of the documentation)."></InputEditor>}
                        </Field>
                        <Field name="minimumAllowableRsrp">
                            {({ field }) => <InputEditor field={field} type="number" title="Minimum RSRP" tooltip="The minimum accepted RSRP. Any road links with a guaranteed lower RSRP than this (calculated using horizontal and vertical distances) will be excluded from the calculation (see the 'Performance' section of the documentation). Any road links with a lower RSRP than this will be excluded from the results. A higher value will result in much faster calculations and a smaller result file size."></InputEditor>}
                        </Field>
                        <Field name="receiverHeightAboveTerrain">
                            {({ field }) => <InputEditor field={field} type="number" title="Receiver height above the terrain" tooltip="The height of the receiver above the terrain."></InputEditor>}
                        </Field>
                        <Field name="linkCalculationPointFrequency">
                            {({ field }) => <InputEditor field={field} type="number" title="Link calculation point frequency" tooltip="How many meters between each point on a road link that is calculated. The lowest possible value is 1. A higher value will result in a more detailed result, but longer calculation times. The first and last point on the road link is guaranteed to be calculated even if this value is larger than the length of the link."></InputEditor>}
                        </Field>
                        <Field name="mobileNetworkRegressionType">
                            {({ field }) => (
                                <InputEditor field={field} title="Mobile network regression type" tooltip="The regression formula used in path loss calculations for the mobile network has three different sets of constants: 'All' is trained on all values in the test set, 'LOS' is trained on values with line of sight, and 'NLOS' is trained on values without line of sight. Pick one of them, or 'Dynamic' to automatically pick either LOS or NLOS depending on whether the current path loss calculation has line of sight or not.">
                                    <FormControl as="select" {...field}>
                                        <option value="Dynamic">Dynamic -- use LOS or NLOS where appropriate</option>
                                        <option value="All">All -- use regression model calculated from all points</option>
                                        <option value="LineOfSight">LOS -- use regression model calculated from points with LOS</option>
                                        <option value="NoLineOfSight">NLOS -- use regression model calculated from points without LOS</option>
                                    </FormControl>
                                </InputEditor>)}
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