import React from 'react';
import LambdaMap from './LambdaMap';
import EditStationDialog from './EditStationDialog'
import CalculatorSetup from './CalculatorSetup'
import LayerPicker from './LayerPicker'
import StationList from './StationList'
import Sidebar from './Sidebar'
import MainMenu from './MainMenu'
import _ from 'lodash';

import { faCloudUpload, faMapMarkerEdit, faAbacus, faClipboardList } from '@fortawesome/pro-solid-svg-icons'

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ImportStationsDialog from './ImportStationsDialog';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.onMapClicked = this.onMapClicked.bind(this);
        this.onViewportChange = this.onViewportChange.bind(this);

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
                    icon: faMapMarkerEdit,
                    text: "Edit",
                    cmd: "edit",
                    active: true
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
                    text: "Calculate",
                    cmd: "calculate"
                }
            ],
            layers: {
                terrain: {
                    name: "Terrain",
                    visible: false,
                    enabled: true
                },
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
            activeCommand: "edit",
            selectedStation: null,
            selectedStations: [],
            clickedPoint: null,
            stations: [
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
            ],
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
        if (this.state.activeCommand == "calculate"){
            if(!info.object) return;

            const newValue = info.object.properties.state !== "selected" ? "selected" : null;

            this.setState((state) => {
                const newState = {
                    stations: state.stations.map(p => {
                        if (p.id == info.object.properties.id) {
                            p.state = newValue;
                        }
                        return p;
                    })
                };
                newState.selectedStations = newState.stations.filter(p => p.state == "selected");
                return newState;
            });

            return;
        }

        if (this.state.activeCommand != "edit") return;

        let selectedStation = this.state.selectedStation;

        let wasCreatedNow = false;
        let wasExistingActivated = false;

        if (info.object && !selectedStation) {
            wasExistingActivated = true;
        }

        if (!selectedStation) {
            wasCreatedNow = true;
            if (wasExistingActivated)
                selectedStation = { ...info.object.properties, state: "new", isEditClone: true };
            else
                selectedStation = {
                    id: Math.floor((Math.random() * 1000000) + 100000).toFixed(0),
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
                    if (wasExistingActivated && p.id == info.object.properties.id) {
                        p.state = "edited";
                    }
                    return p;
                }).concat(newlyCreated)
            };
        });
    }

    resetStationList(stations) {
        return stations.filter(p => p.state != "preview" && p.state != "new").map(p => {
            p.state = null;
            return p;
        });
    }

    onEditSaved(values) {
        values.state = null;
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

    onMenuItemClicked(item) {
        this.setState(state => ({
            menuItems: state.menuItems.map(p => {
                p.active = p.text == item.text;
                return p;
            }),
            activeCommand: item.cmd
        }));

        if (this.state.selectedStation && item.cmd != "edit") this.onEditCancelled();
        if (_.some(this.state.stations, p => p.state == "preview") && item.cmd != "import") this.removePreviewedStations();
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

    removePreviewedStations() {
        this.setState(state => ({
            stations: state.stations.filter(p => p.state != "preview")
        }));
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

    initiateMapTransition(transition) {
        this.setState(state => ({
            viewport: { ...state.viewport, ...transition }
        }));
    }

    onViewportChange(data) {
        if (data.pitch > 60 && !this.state.layers.terrain.visible) data.pitch = 60;
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
            {this.state.selectedStation &&
                <Sidebar style={{ marginTop: "60px" }}>
                    <EditStationDialog selectedStation={this.state.selectedStation} onSave={this.onEditSaved} onCancel={this.onEditCancelled} onDelete={this.onEditDelete} isEditing={this.state.selectedStation.isEditClone} />
                </Sidebar>}
            {this.state.activeCommand == "import" &&
                <Sidebar style={{ marginTop: "60px", width: "600px" }}>
                    <ImportStationsDialog onPreview={this.onImportPreview} onSave={this.onImportSaved} onCancel={this.onImportCancelled} ></ImportStationsDialog>
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