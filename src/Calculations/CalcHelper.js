import proj4 from 'proj4';

export default class CalcHelper{

    constructor(){
        const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";
        const utm33 = "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs"; //EPSG:32633
        this.proj = proj4(wgs84, utm33);
    }

    toBaseStationObject(bs, maxRadius = 50000){
        var xy = this.proj.forward(bs.lngLat);
        return {
            "name": bs.name,
            "x": xy[0],
            "y": xy[1],
            "heightAboveTerrain": bs.height, 
            "totalTransmissionLevel": bs.transmitPower,
            "maxRadius": maxRadius
        };
    }

}