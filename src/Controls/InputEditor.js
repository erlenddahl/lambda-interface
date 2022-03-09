import React from 'react';
import FormControl from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import InputGroup from 'react-bootstrap/InputGroup';
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
                    {this.props.children}
                    {!this.props.children && (<div>
                            {this.props.unit && (<InputGroup>
                                <FormControl type={this.props.type || "text"} {...this.props.field} />
                                <InputGroup.Append>
                                    <InputGroup.Text style={{width: "45px"}}>{this.props.unit}</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>)}
                            {!this.props.unit && <FormControl type={this.props.type || "text"} {...this.props.field} />}
                        </div>
                    )}
                    <ErrorMessage className="error-message" name={this.props.field.name} component="div" />
                </FormGroup>);
    }
}

InputEditor.propTypes = {
    title: PropTypes.string,
    tooltip: PropTypes.string,
    type: PropTypes.string,
    unit: PropTypes.string,
    field: PropTypes.object,
    children: PropTypes.element
}

export default InputEditor