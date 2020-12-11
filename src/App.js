import React from 'react';
import LambdaMap from './LambdaMap';
import EditStationDialog from './EditStationDialog'
import _ from 'lodash';

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.onMapClicked = this.onMapClicked.bind(this);
        this.onEditSaved = this.onEditSaved.bind(this);
        this.onEditCancelled = this.onEditCancelled.bind(this);
        this.onEditDelete = this.onEditDelete.bind(this);

        this.defaultStationColor = [160, 0, 0, 255];
        this.editedStationColor = [0, 160, 0, 255];

        this.state = {
            selectedStation: null,
            clickedPoint: null,
            stations: [
                {
                    id: 1254,
                    name: "Stasjon 1",
                    color: this.defaultStationColor,
                    lngLat: [10.355430273040675, 63.42050427064208],
                    frequency: 22000,
                    height: 300
                },
                {
                    id: 1255,
                    name: "Alfabra",
                    color: this.defaultStationColor,
                    lngLat: [10.355430273040675, 63.41050427064208],
                    frequency: 22000,
                    height: 300
                }
            ]
        };
    }

    onMapClicked(info) {

        let selectedStation = this.state.selectedStation;

        let wasCreatedNow = false;
        let wasExistingActivated = false;

        if(info.object && !selectedStation){
            selectedStation = info.object.properties;
            selectedStation.color = this.editedStationColor;
            wasExistingActivated = true;
            this.setState({ editOriginal: {
                lngLat: selectedStation.lngLat,
                id: selectedStation.id
            } });
        }

        if (!selectedStation) {
            wasCreatedNow = true;
            selectedStation = {
                id: -1,
                name: "New station",
                color: this.editedStationColor,
                lngLat: info.lngLat,
                frequency: 22000,
                height: 300
            };
        }
        
        if(!wasCreatedNow && !wasExistingActivated){
            selectedStation.lngLat = info.lngLat;
        }

        this.setState((state) => {

            var newState = {
                selectedStation: selectedStation,
                isEditing: selectedStation.id != -1
            };

            if (wasCreatedNow)
                newState.stations = state.stations.concat(selectedStation);

            return newState;
        });
    }

    onEditSaved(values) {

        const isNew = values.id == -1;
        const originalId = values.id;

        values.color = this.defaultStationColor;

        if(isNew)
            values.id = _(this.state.stations).map("id").max() + 1;

        console.log(values);

        this.setState((state) => ({
            selectedStation: null,
            stations: state.stations.map(p => p.id == originalId ? values : p)
        }));
    }

    onEditCancelled() {

        this.setState((state) => ({
            selectedStation: null,
            stations: state.stations.map(p => { 
                p.color = this.defaultStationColor; 
                if(this.state.editOriginal && p.id == this.state.editOriginal.id){
                    p.lngLat = this.state.editOriginal.lngLat;
                }
                return p;
            }).filter(p => p.id != -1)
        }));
    }

    onEditDelete() {

        if(!this.state.editOriginal) return;

        this.setState((state) => ({
            selectedStation: null,
            stations: state.stations.filter(p => p.id != this.state.editOriginal.id)
        }));
    }

    render() {
        return (<div>
            <EditStationDialog selectedStation={this.state.selectedStation} onSave={this.onEditSaved} onCancel={this.onEditCancelled} onDelete={this.onEditDelete} isEditing={this.state.isEditing} />
            <LambdaMap stations={this.state.stations} onMapClicked={this.onMapClicked} />
        </div>)
    }
}

export default App;