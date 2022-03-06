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

}

const UserSettings = new UserSettingsWrapper();
export default UserSettings;