import { WEEK; DAY; HOUR; MINUTE; SECOND } "mo:time-consts";
import Types "../types/types";
module {
    //exp token lifetime from the moment of creation (exp_regarding * type_time);
    public type SETTINGS_TIME = Types.SETTINGS_TIME;
    
    //token length (according to the standard)
    public let length_bytes = 26;

    public let default_settings_31day: SETTINGS_TIME = {
        exp_regarding = 31;
        type_time = DAY;
    };
    
    public let default_settings_24hour: SETTINGS_TIME = {
        exp_regarding = 24;
        type_time = HOUR;
    };

    public let default_settings_180min: SETTINGS_TIME = {
        exp_regarding = 180;
        type_time = MINUTE;
    };

    public let default_settings_2min: SETTINGS_TIME= {
        exp_regarding = 2;
        type_time = MINUTE;
    };
};
