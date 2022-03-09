import _ from "lodash";
import { SELECTION_MODE } from "../Helpers/Constants.js";

export default class BaseStationList{

    constructor(stations){
        this.stations = stations;
        this.setSelectionMode(SELECTION_MODE.SINGLE);
    }

    getState(){
        const state = {
            selectedStation: this.selectionMode == SELECTION_MODE.SINGLE ? this.getSelectedItem() : null,
            selectedStations: this.selectionMode == SELECTION_MODE.MULTIPLE ? this.getSelectedItems() : null,
            stations: this.stations.map(p => p)
        };
        return state;
    }

    getStorageState(){
        return this.stations.filter(p => !p.isEditClone && !p.isPreview).map(p => p.getStorageState());
    }

    setSelectionMode(mode){

        if(mode != SELECTION_MODE.SINGLE && mode != SELECTION_MODE.MULTIPLE) throw "Invalid selection mode: '" + mode + "'";

        this.selectionMode = mode;
        
        if(mode == SELECTION_MODE.MULTIPLE){
            var selectedItems = this.getSelectedItems();
            for(var i = 1; i < selectedItems.length; i++)
                selectedItems[i].deselect();
        }
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

    startEditExisting(station){

        this.cancelEdit();

        this.editedStation = station;
        this.editClone = station.clone({ original: station, isPreview: true, isEditClone: true, isSelected: true });
        this.editClone.iconState = this.editClone.getState();
        this.stations.push(this.editClone);
        station.deselect().setEdited(true);
    }

    startEditNew(station){
        this.editedStation = station.setEdited(true);
        this.stations.push(station);
    }

    cancelEdit(){
        this.editedStation = null;
        this.editClone = null;
        this.removePreviews();
        this.resetSelections();
        _.each(this.stations, p => p.reset());
        return this;
    }

    applyEdit(newValues){
        for(var key in newValues){
            this.editedStation[key] = newValues[key];
        }
        this.editedStation.reset();
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

        result.clicked = _.find(this.stations, p => p.id == object.id).toggleSelect();
        result.selected = this.getSelection();
        
        return result;
    }
}