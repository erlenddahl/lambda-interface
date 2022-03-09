class UserSettingsWrapper{

    get(key){
        const str = localStorage.getItem("usersettings__" + key);
        if(!str) return null;
        try{
            return JSON.parse(str);
        }catch(err){
            return null;
        }
    }
    
    set(key, data){
        localStorage.setItem("usersettings__" + key, JSON.stringify(data));
    }

    getCalculationParameters(){
        return this.get("calculationParameters") || {
            minimumAllowableRsrp: -125,
            receiverHeightAboveTerrain: 2,
            mobileNetworkRegressionType: "All",
            linkCalculationPointFrequency: 20
        };
    }

    setCalculationParameters(data){
        this.set("calculationParameters", data);
    }

    getViewport(){
        return this.get("viewport") || {
            width: "100%",
            height: "100%",
            latitude: 63.42050427064208,
            longitude: 10.355430273040675,
            zoom: 13.5,
            bearing: 0
        }
    }

    setViewport(data){
        this.set("viewport", {
            width: "100%",
            height: "100%",
            latitude: data.latitude,
            longitude: data.longitude,
            zoom: data.zoom,
            bearing: data.bearing
        });
    }

    getBaseStations(){
        return this.get("basestations") || [
            {
                id: "1254",
                name: "Stasjon 1",
                lngLat: [10.355430273040675, 63.42050427064208],
                transmitPower: 46,
                gainDefinition: "125:140:5|90:125:25|65:90:15|40:65:4",
                height: 12,
                maxRadius: 10000,
                antennaType: "MobileNetwork"
            },
            {
                id: "1255",
                name: "Alfabra",
                lngLat: [10.355430273040675, 63.41050427064208],
                transmitPower: 49,
                gainDefinition: "-40:-30:8|-30:30:22|30:40:8",
                height: 4,
                maxRadius: 10000,
                antennaType: "MobileNetwork"
            }
        ];
    }

    setBaseStations(data){
        this.set("basestations", data);
    }

    getLayerVisibility(layerName, defaultValue = false){
        return this.get("layerVisibility-" + layerName) || defaultValue;
    }

    setLayerVisibility(layerName, value){
        this.set("layerVisibility-" + layerName, value);
    }

}

const UserSettings = new UserSettingsWrapper();
export default UserSettings;