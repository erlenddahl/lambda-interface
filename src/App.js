import React from 'react';
import LambdaMap from './LambdaMap';
import EditStationDialog from './EditStationDialog'
import SinglePointCalculator from './SinglePointCalculator'
import CalculatorSetup from './CalculatorSetup'
import LayerPicker from './LayerPicker'
import StationList from './StationList'
import StationInfoDialog from './StationInfoDialog';
import Sidebar from './Sidebar'
import MainMenu from './MainMenu'
import _ from 'lodash';
import { SELECTION_MODE } from './Helpers/Constants';

import { faCloudUpload, faMapMarkerEdit, faAbacus, faClipboardList, faInfoCircle } from '@fortawesome/pro-solid-svg-icons'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ImportStationsDialog from './ImportStationsDialog';
import BaseStationList from './Models/BaseStationList';
import BaseStation from './Models/BaseStation';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.baseStations = new BaseStationList([
            {
                id: "1254",
                name: "Stasjon 1",
                lngLat: [10.355430273040675, 63.42050427064208],
                transmitPower: 62,
                height: 300,
                antennaType: "mobileNetwork"
            },
            {
                id: "1255",
                name: "Alfabra",
                lngLat: [10.355430273040675, 63.41050427064208],
                transmitPower: 71,
                height: 300,
                antennaType: "mobileNetwork"
            }
        ].map(p => new BaseStation(p)));

        this.onMapClicked = this.onMapClicked.bind(this);
        this.onViewportChange = this.onViewportChange.bind(this);

        this.onEditRequested = this.onEditRequested.bind(this);
        this.onEditSaved = this.onEditSaved.bind(this);
        this.onEditCancelled = this.onEditCancelled.bind(this);
        this.onEditDelete = this.onEditDelete.bind(this);

        this.onMenuItemClicked = this.onMenuItemClicked.bind(this);

        this.onImportSaved = this.onImportSaved.bind(this);
        this.onImportCancelled = this.onImportCancelled.bind(this);
        this.onImportPreview = this.onImportPreview.bind(this);

        this.initiateMapTransition = this.initiateMapTransition.bind(this);

        this.onLayerVisibilityChange = this.onLayerVisibilityChange.bind(this);

        this.state = {
            menuItems: [
                {
                    icon: faInfoCircle,
                    text: "Info",
                    cmd: "info",
                    active: true
                },
                {
                    icon: faMapMarkerEdit,
                    text: "Edit",
                    cmd: "edit"
                },
                {
                    icon: faCloudUpload,
                    text: "Import",
                    cmd: "import"
                },
                {
                    icon: faClipboardList,
                    text: "List",
                    cmd: "list"
                },
                {
                    icon: faAbacus,
                    text: "Calculate single point",
                    cmd: "calculate-point"
                },
                {
                    icon: faAbacus,
                    text: "Calculate road network",
                    cmd: "calculate",
                    selectionMode: SELECTION_MODE.MULTIPLE
                }
            ],
            layers: {
                openinframap: {
                    name: "Infrastructure (openinframap.org)",
                    visible: false
                },
                cellcoverage: {
                    name: "Cell coverage",
                    visible: false
                },
                aadt: {
                    name: "Traffic",
                    visible: false
                },
                roadnetwork: {
                    name: "Road network",
                    visible: false,
                    enabled: true
                },
                mystations: {
                    name: "My stations",
                    visible: true,
                    enabled: true
                }
            },
            activeCommand: "info",
            selectedStation: null,
            selectedStations: [],
            clickedPoint: null,
            stations: this.baseStations.stations,
            viewport: {
                width: "100%",
                height: "100%",
                latitude: 63.42050427064208,
                longitude: 10.355430273040675,
                zoom: 13.5,
                bearing: 0
            }
        };
    }

    onMapClicked(info) {
        
        const c = this.baseStations.handleClick(info);

        switch(this.state.activeCommand){
            case "info":
            case "calculate":
            case "calculate-point":
                // No special logic, just selection/deselection
                break;
            case "edit":
                
                // Clicked a station with nothing already selected -- create a clone of this station for editing
                if(!c.previouslySelected && c.selected){
                    this.baseStations.startEditExisting(c.selected);
                
                // Clicked an empty spot with nothing already selected -- create a new station here.
                }else if(!c.previouslySelected && !c.selected){
                    this.baseStations.startEditNew(new BaseStation({
                        id: Math.floor((Math.random() * 1000000) + 100000).toFixed(0),
                        name: "New station",
                        lngLat: c.lngLat,
                        frequency: 22000,
                        transmitPower: 62,
                        height: 300,
                        isPreview: true,
                        isSelected: true
                    }));

                // Clicked somewhere with a station already selected -- move it to the new location
                }else if(c.previouslySelected){
                    c.previouslySelected.lngLat = c.lngLat;
                    this.baseStations.resetSelections();
                    c.previouslySelected.select();
                }

                break;
        }

        this.refreshState();
    }

    resetStationList(stations) {
        return stations.filter(p => p.state != "preview" && p.state != "new").map(p => {
            p.state = null;
            return p;
        });
    }

    onEditSaved(values) {
        this.baseStations.applyEdit(values);
        this.refreshState();
    }

    onEditCancelled() {
        this.baseStations.cancelEdit();
        this.refreshState();
    }

    onEditDelete() {

        if (!this.state.selectedStation.isEditClone) return;

        this.baseStations.remove(this.state.selectedStation.original);
        this.baseStations.cancelEdit();

        this.refreshState();
    }

    onMenuItemClicked(item) {
        this.setState(state => ({
            menuItems: state.menuItems.map(p => {
                p.active = p.text == item.text;
                return p;
            }),
            activeCommand: item.cmd
        }));

        if (this.state.selectedStation && item.cmd != "edit") this.onEditCancelled();
        if (_.some(this.state.stations, p => p.state == "preview") && item.cmd != "import"){
            this.baseStations.removePreviews();
        }

        this.baseStations.setSelectionMode(item.selectionMode || SELECTION_MODE.SINGLE);
        this.refreshState();
    }

    refreshState(){
        this.setState(this.baseStations.getState());
    }

    onImportSaved() {
        this.setState(state => ({
            stations: state.stations.map(p => {
                if (p.state == "preview") {
                    p.state = null;
                }
                return p;
            })
        }));
        this.onMenuItemClicked(this.state.menuItems[0]);
    }

    onImportCancelled() {
        this.removePreviewedStations();
        this.onMenuItemClicked(this.state.menuItems[0]);
    }

    onImportPreview(previewStations) {
        this.setState(state => ({
            stations: state.stations.filter(p => p.state != "preview").concat(previewStations)
        }));
    }

    onEditRequested() {
        this.onMenuItemClicked(_.find(this.state.menuItems, p => p.cmd == "edit"));
        this.baseStations.startEditExisting(this.baseStations.getSelectedItem());
        this.refreshState();
    }

    initiateMapTransition(transition) {
        this.setState(state => ({
            viewport: { ...state.viewport, ...transition }
        }));
    }

    onViewportChange(data) {
        this.setState({ viewport: data });
    }

    onLayerVisibilityChange(layerKey, visibility) {
        if(!this.state.layers[layerKey].enabled) return;

        this.setState(state => {
            const layers = state.layers;
            layers[layerKey].visible = visibility;

            const newState = {
                layers: layers
            };

            if(layerKey == "terrain" && !visibility && state.viewport.pitch > 60){
                newState.viewport = {...state.viewport, pitch: 60};
            }

            return newState;
        });
    }

    render() {
        return (<div style={{ width: "100%", height: "100%" }}>
            <MainMenu style={{ zIndex: 1, position: "absolute", padding: "10px" }} items={this.state.menuItems} onMenuItemClicked={this.onMenuItemClicked} />
            {this.state.activeCommand == "info" && this.state.selectedStation &&
                <Sidebar style={{ marginTop: "60px" }}>
                    <StationInfoDialog selectedStation={this.state.selectedStation} onEditRequested={this.onEditRequested} />
                </Sidebar>}
            {this.state.activeCommand == "edit" && this.state.selectedStation &&
                <Sidebar style={{ marginTop: "60px" }}>
                    <EditStationDialog selectedStation={this.state.selectedStation} onSave={this.onEditSaved} onCancel={this.onEditCancelled} onDelete={this.onEditDelete} isEditing={this.state.selectedStation.isEditClone} />
                </Sidebar>}
            {this.state.activeCommand == "import" &&
                <Sidebar style={{ marginTop: "60px", width: "600px" }}>
                    <ImportStationsDialog onPreview={this.onImportPreview} onSave={this.onImportSaved} onCancel={this.onImportCancelled} ></ImportStationsDialog>
                </Sidebar>}
            {this.state.activeCommand == "calculate-point" &&
                <Sidebar style={{ marginTop: "60px", width: "900px" }}>
                    <SinglePointCalculator selectedStation={this.state.selectedStation} />
                </Sidebar>}
            {this.state.activeCommand == "calculate" &&
                <Sidebar style={{ marginTop: "60px", width: "900px" }}>
                    <CalculatorSetup selectedStations={this.state.selectedStations} />
                </Sidebar>}
            {this.state.activeCommand == "list" &&
                <Sidebar style={{ marginTop: "60px", width: "800px" }}>
                    <StationList stations={this.state.stations} onMapTransitionRequested={this.initiateMapTransition} />
                </Sidebar>}
            <LambdaMap stations={this.state.stations} onMapClicked={this.onMapClicked} viewport={this.state.viewport} onViewportChange={this.onViewportChange} layers={this.state.layers}>
                <div style={{ position: 'absolute', right: 0 }}>
                    <LayerPicker layers={this.state.layers} onVisibilityChange={this.onLayerVisibilityChange} />
                </div>
            </LambdaMap>
        </div>)
    }
}

export default App;