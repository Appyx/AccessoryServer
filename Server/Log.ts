import {AppConfig} from "../AppConfig";

/**
 * This is the custom logger used in the whole app.
 * The log level can be customized in the AppConfig.ts
 */
export namespace Log {
    export let debug = function (instance: any, message: string) {
        if (AppConfig.LogLevel > 3)
            console.log(getTimestamp() + "- DEBUG [" + instance.constructor.name + "] " + message);
    };

    export let info = function (instance: any, message: string) {
        if (AppConfig.LogLevel > 2)
            console.log(getTimestamp() + "- INFO [" + instance.constructor.name + "] " + message);
    };

    export let warn = function (instance: any, message: string) {
        if (AppConfig.LogLevel > 1)
            console.log(getTimestamp() + "- WARNING [" + instance.constructor.name + "] " + message);
    };

    export let error = function (instance: any, message: string) {
        if (AppConfig.LogLevel > 0)
            console.log(getTimestamp() + "- ERROR [" + instance.constructor.name + "] " + message);
    };


    function getTimestamp(): string {
        let date = new Date();
        let dateString = date.toString();
        return dateString.toString().substring(0, dateString.indexOf("("));
    }
}

