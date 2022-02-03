export default class BaseStation{

    constructor(data){
        for(let key in data)
            this[key] = data[key];
    }

    reset(){
        this.isEditClone = false;
        this.isPreview = false;
        this.original = null;
        this.deselect();
        this.setEdited(false);
    }

    getCoordinateString(decimals=8){
        return this.lngLat[0].toFixed(decimals) + ", " + this.lngLat[1].toFixed(decimals);
    }

    toggleSelect(){
        this.isSelected = !this.isSelected;
        return this;
    }

    select(){
        this.isSelected = true;
        return this;
    }

    clone(extras){
        const n = new BaseStation(this);

        if(extras){
            for(var key in extras)
                n[key] = extras[key];
        }

        return n;
    }

    deselect(){
        this.isSelected = false;
        return this;
    }

    setEdited(value){
        this.isBeingEdited = value;
        return this;
    }

    getColor(){
        if (this.state == "new") return [0, 160, 0, 255];
        if (this.isBeingEdited) return [100, 100, 100, 100];
        if (this.isPreview) return [255, 247, 0, 255];
        if (this.isSelected) return [5, 247, 255, 255];

        return [160, 0, 0, 255];
    }
}