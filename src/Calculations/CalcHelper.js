import proj4 from 'proj4';

export default class CalcHelper{

    constructor(){
        const wgs84 = "+proj=longlat +datum=WGS84 +no_defs";
        const utm33 = "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs"; //EPSG:32633
        this.proj = proj4(wgs84, utm33);
    }

    toUtm(wgs84Array){
        var xy = this.proj.forward(wgs84Array);
        return { x: xy[0], y: xy[1] };
    }

    toWgsArr(utmArray){
        var xy = this.proj.inverse(utmArray);
        return xy;
    }

    toBaseStationObject(bs){
        var utm = this.toUtm(bs.lngLat);
        return {
            "name": bs.name,
            "center": utm,
            "heightAboveTerrain": bs.height, 
            "totalTransmissionLevel": bs.transmitPower,
            "antennaType": bs.antennaType,
            "maxRadius": bs.maxRadius
        };
    }

}