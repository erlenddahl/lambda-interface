import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import './MainMenu.css';

class MainMenu extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div className="main-menu" style={this.props.style}>
            {this.props.items.map(p =>
                <Button variant={p.active ? "primary" : "outline-primary"} key={p.text} onClick={() => this.props.onMenuItemClicked(p)}>
                    <FontAwesomeIcon icon={p.icon} size="lg"></FontAwesomeIcon>&nbsp;&nbsp;
                    <span className="text">{p.text}</span>
                </Button>
            )}
        </div>
    }
}

MainMenu.propTypes = {
    items: PropTypes.array.isRequired,
    style: PropTypes.object,
    onMenuItemClicked: PropTypes.func.isRequired
};

export default MainMenu;