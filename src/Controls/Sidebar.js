import React from 'react';
import PropTypes from 'prop-types';

class Sidebar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="sidebar" style={this.props.style}>
            {this.props.children}
        </div>
    }
}

Sidebar.propTypes = {
    children: PropTypes.element,
    style: PropTypes.object
};

export default Sidebar;