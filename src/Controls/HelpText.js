import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-tippy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/pro-solid-svg-icons';

class HelpText extends React.Component {

    render() {
        return (<Tooltip title={this.props.tooltip}>
                    <div className={'help-text ' + this.props.className}>
                        {this.props.children} <FontAwesomeIcon className='discrete' icon={faInfoCircle}></FontAwesomeIcon>
                    </div>
                </Tooltip>);
    }
}

HelpText.propTypes = {
    children: PropTypes.element,
    tooltip: PropTypes.string,
    className: PropTypes.string
}

export default HelpText