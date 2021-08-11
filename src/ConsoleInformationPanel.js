import React from 'react';
import PropTypes from 'prop-types';

class ConsoleInformationPanel extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        if(!this.props.data) return <div></div>;

        const info = Object.keys(this.props.data.Info).map(p => ({
            label: p, 
            value: this.props.data.Info[p]
        }));
        
        const progress = Object.keys(this.props.data.Progress).map(p => ({
            label: p, 
            value: this.props.data.Progress[p]
        }));

        return <div style={{fontSize: "12px", fontFamily: "monospace"}}>
            <div>
                {info.map(p => (
                    <div key={p.label}>
                        <span style={{fontWeight: "bold"}}>{p.label}: </span>
                        <span>{p.value}</span>
                    </div>
                ))}
            </div>
            <div>
                {progress.map(p => (
                    <div key={p.label}>
                        <span style={{fontWeight: "bold"}}>{p.label}: </span>
                        <span>{p.value.Visualization}</span>
                    </div>
                ))}
            </div>
        </div>
    }
}

ConsoleInformationPanel.propTypes = {
    data: PropTypes.object
};

export default ConsoleInformationPanel;