import React from 'react';
import PropTypes from 'prop-types';

class PopupContainer extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="popup-container" style={this.props.style}>
            {this.props.children}
        </div>
    }
}

PopupContainer.propTypes = {
    children: PropTypes.element,
    style: PropTypes.object
};

export default PopupContainer;