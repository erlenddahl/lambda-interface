import React from 'react';
import LambdaMap from './LambdaMap';
import EditStationDialog from './EditStationDialog'
import Sidebar from './Sidebar'
import MainMenu from './MainMenu'
import _ from 'lodash';

import { faCloudUpload, faMapMarkerEdit } from '@fortawesome/pro-solid-svg-icons'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ImportStationsDialog from './ImportStationsDialog';

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
                    lngLat: [10.355430273040675, 63.42050427064208],
                    frequency: 22000,
                    height: 300
                },
                {
                    id: 1255,
                    name: "Alfabra",
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
            wasExistingActivated = true;
        }

        if (!selectedStation) {
            wasCreatedNow = true;
            if(wasExistingActivated)
                selectedStation = {...info.object.properties, state: "new", isEditClone: true};
            else
                selectedStation = {
                    id: -1,
                    name: "New station",
                    lngLat: info.lngLat,
                    frequency: 22000,
                    height: 300,
                    state: "new"
                };
        }

        if (!wasCreatedNow && !wasExistingActivated) {
            selectedStation.lngLat = info.lngLat;
        }

        this.setState((state) => {

            const newlyCreated = wasCreatedNow ? [selectedStation] : [];

            return {
                selectedStation: selectedStation,
                stations: state.stations.map(p => {
                    if(wasExistingActivated && p.id == info.object.properties.id){
                        p.state = "edited";
                    }
                    return p;
                }).concat(newlyCreated)
            };
        });
    }

    resetStationList(stations){
        return stations.filter(p => p.state != "preview" && p.state != "new").map(p => {
            p.state = null;
            return p;
        });
    }

    onEditSaved(values) {

        if (values.state == "new")
            values.id = _(this.state.stations).map("id").max() + 1;

        this.setState((state) => ({
            selectedStation: null,
            stations: this.resetStationList(state.stations.map(p => p.state == "edited" ? values : p))
        }));
    }

    onEditCancelled() {

        this.setState((state) => ({
            selectedStation: null,
            stations: this.resetStationList(state.stations)
        }));
    }

    onEditDelete() {

        if (!this.state.selectedStation.isEditClone) return;

        this.setState((state) => ({
            selectedStation: null,
            stations: this.resetStationList(state.stations.filter(p => p.state != "edited"))
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
                    <EditStationDialog selectedStation={this.state.selectedStation} onSave={this.onEditSaved} onCancel={this.onEditCancelled} onDelete={this.onEditDelete} isEditing={this.state.selectedStation.isEditClone} />
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