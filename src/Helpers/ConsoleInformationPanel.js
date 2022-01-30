import React from 'react';
import PropTypes from 'prop-types';

class ConsoleInformationPanel extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        if(!this.props.data) return <div></div>;

        const d = this.props.data;
        const info = d.Info || d.info;
        const progress = d.Progress || d.progress;

        const infos = Object.keys(info).map(p => ({
            label: p, 
            value: info[p]
        }));
        
        const progresses = Object.keys(progress).map(p => ({
            label: p, 
            value: progress[p]
        }));

        return <div style={{fontSize: "12px", fontFamily: "monospace"}}>
            <div>
                {infos.map(p => (
                    <div key={p.label}>
                        <span style={{fontWeight: "bold"}}>{p.label}: </span>
                        <span>{p.value}</span>
                    </div>
                ))}
            </div>
            <div>
                {progresses.map(p => (
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