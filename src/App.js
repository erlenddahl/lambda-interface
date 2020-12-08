import React from 'react';
import LambdaMap from './LambdaMap';
import AddStationDialog from './AddStationDialog'

class App extends React.Component{
    
    constructor(props){
        super(props);

        this.onMapClicked = this.onMapClicked.bind(this);
        this.onDialogSubmitted = this.onDialogSubmitted.bind(this);

        this.state = {
            selectedStation: null,
            clickedPoint: null
        };
    }

    onMapClicked(info){
        if(!info.object)
            this.setState({
                clickedPoint: info
            });
    }

    onDialogSubmitted(){
        this.setState({
            clickedPoint: null
        });
    }

    render(){
        return <div>
            <AddStationDialog clickedPoint={this.state.clickedPoint} onDialogSubmitted={this.onDialogSubmitted} />
            <LambdaMap onMapClicked={this.onMapClicked} />
        </div>
    }
}

export default App;