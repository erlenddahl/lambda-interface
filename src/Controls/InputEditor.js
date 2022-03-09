import React from 'react';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import PropTypes from 'prop-types';
import { ErrorMessage } from 'formik';
import HelpText from './HelpText';

class InputEditor extends React.Component {

    render() {
        return (<FormGroup controlId={this.props.field.name}>
                    <FormLabel>
                        <HelpText tooltip={this.props.tooltip}>
                            {this.props.title}:
                        </HelpText>
                    </FormLabel>
                    <FormControl type={this.props.type || "text"} {...this.props.field} />
                    <ErrorMessage className="error-message" name={this.props.field.name} component="div" />
                </FormGroup>);
    }
}

InputEditor.propTypes = {
    title: PropTypes.string,
    tooltip: PropTypes.string,
    type: PropTypes.string,
    field: PropTypes.object
}

export default InputEditor