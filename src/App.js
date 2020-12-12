import React from 'react';
import LambdaMap from './LambdaMap';
import EditStationDialog from './EditStationDialog'
import Sidebar from './Sidebar'
import MainMenu from './MainMenu'
import _ from 'lodash';

import { faCloudUpload, faMapMarkerEdit } from '@fortawesome/pro-solid-svg-icons'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ImportStationsDialog from './importStationsDialog';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.onMapClicked = this.onMapClicked.bind(this);

        this.onEditSaved = this.onEditSaved.bind(this);
        this.onEditCancelled = this.onEditCancelled.bind(this);
        this.onEditDelete = this.onEditDelete.bind(this);
        
        this.onMenuItemClicked = this.onMenuItemClicked.bind(this);
        
        this.onImportSaved = this.onImportSaved.bind(this);
        this.onImportCancelled = this.onImportCancelled.bind(this);
        this.onImportPreview = this.onImportPreview.bind(this);

        this.defaultStationColor = [160, 0, 0, 255];
        this.editedStationColor = [0, 160, 0, 255];

        this.state = {
            menuItems: [
                {
                    icon: faMapMarkerEdit,
                    text: "Edit",
                    cmd: "edit",
                    active: true
                },
                {
                    icon: faCloudUpload,
                    text: "Import",
                    cmd: "import"
                }
            ],
            activeCommand: "edit",
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

        if(this.state.activeCommand != "edit") return;

        let selectedStation = this.state.selectedStation;

        let wasCreatedNow = false;
        let wasExistingActivated = false;

        if (info.object && !selectedStation) {
            selectedStation = info.object.properties;
            selectedStation.color = this.editedStationColor;
            wasExistingActivated = true;
            this.setState({
                editOriginal: {
                    lngLat: selectedStation.lngLat,
                    id: selectedStation.id
                }
            });
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

        if (!wasCreatedNow && !wasExistingActivated) {
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

        if (isNew)
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
                if (this.state.editOriginal && p.id == this.state.editOriginal.id) {
                    p.lngLat = this.state.editOriginal.lngLat;
                }
                return p;
            }).filter(p => p.id != -1)
        }));
    }

    onEditDelete() {

        if (!this.state.editOriginal) return;

        this.setState((state) => ({
            selectedStation: null,
            stations: state.stations.filter(p => p.id != this.state.editOriginal.id)
        }));
    }

    onMenuItemClicked(item){
        this.setState(state => ({
            menuItems: state.menuItems.map(p => {
                p.active = p.text == item.text;
                return p;
            }),
            activeCommand: item.cmd
        }));

        if(this.state.selectedStation && item.cmd != "edit") this.onEditCancelled();
        if(_.some(this.state.stations, p => p.state == "preview") && item.cmd != "import") this.removePreviewedStations();
    }

    onImportSaved(){
        this.setState(state => ({
            stations: state.stations.map(p => {
                if(p.state == "preview"){
                    p.state = null;
                    p.color = this.defaultStationColor;
                }
                return p;
            })
        }));
        this.onMenuItemClicked(this.state.menuItems[0]);
    }

    removePreviewedStations(){
        this.setState(state => ({
            stations: state.stations.filter(p => p.state != "preview")
        }));
    }

    onImportCancelled(){
        this.removePreviewedStations();
        this.onMenuItemClicked(this.state.menuItems[0]);
    }

    onImportPreview(previewStations){
        this.setState(state => ({
            stations: state.stations.filter(p => p.state != "preview").concat(previewStations)
        }));
    }

    render() {
        return (<div>
            <MainMenu style={{ zIndex: 1, position: "absolute", padding: "10px" }} items={this.state.menuItems} onMenuItemClicked={this.onMenuItemClicked} />
            {this.state.selectedStation &&
                <Sidebar style={{ marginTop: "60px" }}>
                    <EditStationDialog selectedStation={this.state.selectedStation} onSave={this.onEditSaved} onCancel={this.onEditCancelled} onDelete={this.onEditDelete} isEditing={this.state.isEditing} />
                </Sidebar>}
            {this.state.activeCommand == "import" &&
                <Sidebar style={{ marginTop: "60px", width: "600px" }}>
                    <ImportStationsDialog onPreview={this.onImportPreview} onSave={this.onImportSaved} onCancel={this.onImportCancelled} ></ImportStationsDialog>
                </Sidebar>}
            <LambdaMap stations={this.state.stations} onMapClicked={this.onMapClicked} />
        </div>)
    }
}

export default App;