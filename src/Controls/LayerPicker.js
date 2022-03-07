import React from 'react';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare, faCheckSquare } from '@fortawesome/pro-regular-svg-icons'

class LayerPicker extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (<div className="layer-picker">
            {Object.keys(this.props.layers).map(p => ({key: p, ...this.props.layers[p]})).map(p => 
                <div key={p.key} onClick={() => this.props.onVisibilityChange(p.key, !p.visible)} className={p.enabled ? "" : "disabled"}>
                    <FontAwesomeIcon icon={p.visible ? faCheckSquare : faSquare} className="mr-1"></FontAwesomeIcon>
                    <span>{p.name}</span>
                </div>
            )}
        </div>)
    }
}

LayerPicker.propTypes = {
    layers: PropTypes.object.isRequired,
    onVisibilityChange: PropTypes.func.isRequired
};

export default LayerPicker;