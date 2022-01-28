import _ from "lodash";
import { SELECTION_MODE } from "../Helpers/Constants.js";

export default class MapHelper{

    constructor(stations){
        this.stations = stations;
        this.setSelectionMode(SELECTION_MODE.SINGLE);
    }

    getState(){
        const state = {
            selectedStation: this.selectionMode == SELECTION_MODE.SINGLE ? this.getSelectedItem() : null,
            selectedStations: this.selectionMode == SELECTION_MODE.MULTIPLE ? this.getSelectedItems() : null,
            stations: this.stations
        };
        return state;
    }

    setSelectionMode(mode){

        if(mode != SELECTION_MODE.SINGLE && mode != SELECTION_MODE.MULTIPLE) throw "Invalid selection mode: '" + mode + "'";

        this.selectionMode = mode;
        this.resetSelections();
    }

    getSelectedItem(){
        return _.find(this.stations, p => p.isSelected);
    }

    getSelectedItems(){
        return this.stations.filter(p => p.isSelected);
    }

    getSelection(){
        return this.selectionMode == SELECTION_MODE.SINGLE ? this.getSelectedItem() : this.getSelectedItems();
    }

    resetSelections(){
        _.each(this.stations, p => p.deselect());
        return this;
    }

    startEdit(station){
        this.editedStation = station;
        this.editClone = station.clone({ original: station, isPreview: true, isEditClone: true, isSelected: true });
        this.stations.push(this.editClone);
        station.deselect().setEdited(true);
    }

    cancelEdit(){
        this.editedStation = null;
        this.editClone = null;
        _.each(this.stations, p => p.reset());
        this.removePreviews();
        this.resetSelections();
        return this;
    }

    applyEdit(newValues){
        for(var key in newValues){
            this.editedStation[key] = newValues[key];
        }
        return this.cancelEdit();
    }

    remove(station){
        this.stations = this.stations.filter(p => p.id != station.id);
        return this;
    }

    removePreviews(){
        this.stations = this.stations.filter(p => !p.isPreview);
        return this;
    }

    removeNews(){
        this.stations = this.stations.filter(p => p.state != "new");
        return this;
    }
    
    handleClick(info){

        const result = {
            previouslySelected: this.getSelection(),
            lngLat: info.coordinate
        };

        if(this.selectionMode == SELECTION_MODE.SINGLE)
            this.resetSelections();

        if(info.object) return this.handleObjectClick(info.object, result);

        return result;
    }

    handleObjectClick(object, result){

        result.clicked = _.find(this.stations, p => p.id == object.properties.id).toggleSelect();
        result.selected = this.getSelection();
        
        return result;
    }
}