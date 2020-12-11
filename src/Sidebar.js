import React from 'react';
import PropTypes from 'prop-types';

import './Sidebar.css';

class Sidebar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="sidebar">
            {this.props.children}
        </div>
    }
}

Sidebar.propTypes = {
    children: PropTypes.array
};

export default Sidebar;