import React from 'react';
import LambdaMap from './LambdaMap';
import EditStationDialog from './Controls/EditStationDialog'
import SinglePointCalculator from './SinglePointCalculator'
import RoadNetworkCalculator from './Controls/RoadNetworkCalculator'
import LayerPicker from './Controls/LayerPicker'
import StationList from './Controls/StationList'
import Sidebar from './Controls/Sidebar.js';
import MainMenu from './Controls/MainMenu.js';
import ContextMenu from './ContextMenu.js';
import _ from 'lodash';
import { SELECTION_MODE } from './Helpers/Constants';
import { faMapMarkerEdit, faAbacus, faClipboardList } from '@fortawesome/pro-solid-svg-icons'
import ImportStationsDialog from './Controls/ImportStationsDialog';
import BaseStationList from './Models/BaseStationList';
import BaseStation from './Models/BaseStation';
import PopupContainer from './Controls/PopupContainer';
import { Button } from 'react-bootstrap';
import CalcHelper from './Calculations/CalcHelper';
import UserSettings from './Helpers/UserSettings';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-tippy/dist/tippy.css';
import './App.css';

class App extends React.Component {

    constructor(props) {
        super(props);

        //TODO: Check MinPathLossTests
        
        this.helper = new CalcHelper();

        this.baseStations = new BaseStationList(UserSettings.getBaseStations().map(p => new BaseStation(p)));

        this.onMapClicked = this.onMapClicked.bind(this);
        this.onViewportChange = this.onViewportChange.bind(this);
        this.addGeoJsonLayer = this.addGeoJsonLayer.bind(this);
        
        this.hideContextMenu = this.hideContextMenu.bind(this);
        this.onPointCalculationRequested = this.onPointCalculationRequested.bind(this);
        this.onMoveStationRequested = this.onMoveStationRequested.bind(this);
        this.onCreateNewStationRequested = this.onCreateNewStationRequested.bind(this);
        this.onDeselectStationRequested = this.onDeselectStationRequested.bind(this);
        
        this.onCsvImportRequested = this.onCsvImportRequested.bind(this);
        this.openCsvPopup = this.openCsvPopup.bind(this);

        this.onEditSaved = this.onEditSaved.bind(this);
        this.onEditCancelled = this.onEditCancelled.bind(this);
        this.onEditDelete = this.onEditDelete.bind(this);

        this.onMenuItemClicked = this.onMenuItemClicked.bind(this);

        this.onImportSaved = this.onImportSaved.bind(this);
        this.onImportCancelled = this.onImportCancelled.bind(this);

        this.initiateMapTransition = this.initiateMapTransition.bind(this);

        this.onLayerVisibilityChange = this.onLayerVisibilityChange.bind(this);

        this.state = {
            contextmenu: {
                shown: false,
                left: "100px",
                top: "100px"
            },
            menuItems: [
                {
                    icon: faMapMarkerEdit,
                    text: "Info/Edit",
                    cmd: "edit",
                    active: true
                },
                {
                    icon: faClipboardList,
                    text: "List",
                    cmd: "list"
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
                    visible: UserSettings.getLayerVisibility("openinframap"),
                    enabled: true
                },
                /*cellcoverage: {
                    name: "Cell coverage",
                    visible: false
                },
                aadt: {
                    name: "Traffic",
                    visible: false
                },*/
                roadnetwork: {
                    name: "Road network",
                    visible: UserSettings.getLayerVisibility("roadnetwork"),
                    enabled: true
                },
                mystations: {
                    name: "My stations",
                    visible: UserSettings.getLayerVisibility("mystations", true),
                    enabled: true
                },
                results: {
                    name: "Results",
                    visible: UserSettings.getLayerVisibility("results"),
                    enabled: false
                }
            },
            activeCommand: "edit",
            selectedStation: null,
            selectedStations: [],
            clickedPoint: null,
            stations: this.baseStations.stations,
            viewport: UserSettings.getViewport()
        };
    }

    addGeoJsonLayer(name, geoJson){
        const layers = this.state.layers;
        layers.results.visible = !!name;
        layers.results.enabled = !!name;

        this.setState({
            resultsLayer: {
                name: name,
                geoJson: geoJson
            }, 
            layers: layers
        });
    }

    explodeResultsLink(linkProperties){

        if(linkProperties.isExploded) return;

        this.setState(s => {

            const gj = s.resultsLayer.geoJson;

            if(!gj) return;

            const newGeoJson = {
                "type": "FeatureCollection",
                "features": gj.features
                    .filter(p => p.properties.ID != linkProperties.ID)
                    .concat(linkProperties.Points.filter(p => p.length > 2).map(p => {

                        let sum = 0;
                        let min = 9999999;
                        let max = -9999999;
                        let count = 0;
                        for(var i = 2; i < p.length; i++){
                            count++;
                            sum += p[i];
                            if(p[i] < min) min = p[i];
                            if(p[i] > max) max = p[i];
                        }
                        const avg = sum / count;

                        return {
                            "type": "Feature", 
                                "properties": {...linkProperties, isExploded: true, Average: avg, Min: min, Max: max}, 
                                "geometry": { 
                                    "type": "Point", 
                                    "coordinates": this.helper.toWgsArr([p[0], p[1]])
                                }
                        }
                    }))
            };

            return {
                resultsLayer: {
                    name: s.resultsLayer.name,
                    geoJson: newGeoJson
                }
            };
        });
    }

    onMapClicked(info) {


        if(info?.object?.properties?.isLink == true){ 
            this.explodeResultsLink(info.object.properties);
            return;
        }

        const c = this.baseStations.handleClick(info);
        let showContextMenu = !c.selected;

        switch(this.state.activeCommand){
            case "list":
            case "calculate":
                showContextMenu = false;
                break;
            case "edit":
                
                // Clicked a station -- create a clone of this station for editing
                if(c.selected){
                    this.baseStations.startEditExisting(c.selected);
                    showContextMenu = false;

                // Clicked outside of a station -- keep the selection
                }else if(c.previouslySelected && !c.selected){
                    c.previouslySelected.select();
                }
                
                // In other cases, a context menu is shown from which the user can create a new station or move an existing station.

                break;
        }

        this.refreshState();
        
        this.setState(state => ({
            contextmenu: {
                ...state.contextmenu,
                coordinate: info.coordinate,
                left: info.x + "px",
                top: info.y + "px",
                shown: showContextMenu,
                clickData: c
            }
        }));
    }

    onMoveStationRequested(){
        const c = this.state.contextmenu.clickData;

        c.previouslySelected.lngLat = c.lngLat;
        this.baseStations.resetSelections();
        c.previouslySelected.select();
        
        this.hideContextMenu();
        this.refreshState();
    }

    onCreateNewStationRequested(coordinate){
        this.baseStations.startEditNew(new BaseStation({
            id: Math.floor((Math.random() * 1000000) + 100000).toFixed(0),
            name: "New station",
            lngLat: coordinate,
            transmitPower: 46,
            gainDefinition: "18",
            height: 5,
            maxRadius: 10000,
            isPreview: true,
            isSelected: true,
            antennaType: "MobileNetwork"
        }));

        this.hideContextMenu();
        this.refreshState();
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

        this.baseStations.cancelEdit().setSelectionMode(item.selectionMode || SELECTION_MODE.SINGLE);
        this.refreshState();
    }

    refreshState(){
        UserSettings.setBaseStations(this.baseStations.getStorageState());
        this.setState(this.baseStations.getState());
    }

    onDeselectStationRequested(){
        this.baseStations.cancelEdit();
        this.refreshState();
        this.hideContextMenu();
    }

    onImportSaved(stations) {
        this.baseStations.stations = this.baseStations.stations.concat(stations.map(p => new BaseStation(p)));
        this.setState({
            stations: this.baseStations.stations,
            showStationImportDialog: false
        });
    }

    onImportCancelled() {
        this.baseStations.removePreviews();
        this.setState({showStationImportDialog: false});
    }

    initiateMapTransition(transition) {
        this.setState(state => ({
            viewport: { ...state.viewport, ...transition }
        }));
    }

    onViewportChange(data) {
        this.setState({ 
            viewport: data
        });
        this.hideContextMenu();
        UserSettings.setViewport(data);
    }

    onPointCalculationRequested(station, coordinate){
        this.setState({
            singlePointCalculation: { station, coordinate }
        });
        this.hideContextMenu();
    }

    hideContextMenu(){
        this.setState({ 
            contextmenu: {...this.state.contextmenu, shown: false}
        });
    }

    onCsvImportRequested(){
        this.setState({showStationImportDialog: true});
    }

    onLayerVisibilityChange(layerKey, visibility) {
        if(!this.state.layers[layerKey].enabled) return;

        UserSettings.setLayerVisibility(layerKey, visibility);

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

    openCsvPopup(data){
        this.setState({ copyPopup: data });
    }

    render() {
        return (<div style={{ width: "100%", height: "100%" }}>
            <MainMenu style={{ zIndex: 1, position: "absolute", padding: "10px" }} items={this.state.menuItems} onMenuItemClicked={this.onMenuItemClicked} />
            <ContextMenu {...this.state.contextmenu} station={this.state.selectedStation} onCalculationRequested={this.onPointCalculationRequested} onMoveStationRequested={this.onMoveStationRequested} onNewStationRequested={this.onCreateNewStationRequested} onHideMenuRequested={this.hideContextMenu} onDeselectStationRequested={this.onDeselectStationRequested}></ContextMenu>
            {this.state.singlePointCalculation && <PopupContainer>
                <SinglePointCalculator {...this.state.singlePointCalculation} popupRequested={this.openCsvPopup} closeRequested={() => this.setState({ singlePointCalculation: null })}></SinglePointCalculator>
            </PopupContainer>}
            {this.state.showStationImportDialog && <PopupContainer>
                <ImportStationsDialog onSave={this.onImportSaved} onCancel={this.onImportCancelled} ></ImportStationsDialog>
            </PopupContainer>}
            {this.state.copyPopup && <PopupContainer>
                <div>
                    <div style={{ border: "1px solid black", margin: "10px", padding: "5px", overflow: "scroll", maxHeight: "500px", whiteSpace: "pre-line" }} dangerouslySetInnerHTML={{ __html: this.state.copyPopup.contents }}>
                    </div>
                    
                    <Button className="lower-right" onClick={() => this.setState({copyPopup: null})}>Close</Button>
                </div>
            </PopupContainer>}
            {this.state.activeCommand == "edit" && this.state.selectedStation &&
                <Sidebar style={{ marginTop: "60px" }}>
                    <EditStationDialog selectedStation={this.state.selectedStation} onSave={this.onEditSaved} onCancel={this.onEditCancelled} onDelete={this.onEditDelete} isEditing={this.state.selectedStation.isEditClone} />
                </Sidebar>}
            {this.state.activeCommand == "calculate" &&
                <Sidebar style={{ marginTop: "60px", width: "900px" }}>
                    <RoadNetworkCalculator selectedStations={this.state.selectedStations} onAddGeoJsonLayer={this.addGeoJsonLayer} currentGeoJsonLayerName={this.state.resultsLayer?.name} />
                </Sidebar>}
            {this.state.activeCommand == "list" &&
                <Sidebar style={{ marginTop: "60px", width: "800px" }}>
                    <StationList stations={this.state.stations} onMapTransitionRequested={this.initiateMapTransition} onImportRequested={this.onCsvImportRequested} onPopupRequested={this.openCsvPopup} />
                </Sidebar>}
            <LambdaMap stations={this.state.stations} resultsLayer={this.state.resultsLayer} onMapClicked={this.onMapClicked} viewport={this.state.viewport} onViewportChange={this.onViewportChange} layers={this.state.layers}>
                <div style={{ position: 'absolute', right: 0 }}>
                    <LayerPicker layers={this.state.layers} onVisibilityChange={this.onLayerVisibilityChange} />
                </div>
            </LambdaMap>
        </div>)
    }
}

export default App;