/**
 * Created by Robert on 10/01/2017.
 */
import * as storage from "node-persist";
import {AccessoryConfiguration} from "./AccessoryConfiguration";
import {BaseAccessory} from "../HomeKit/BaseAccessory";
import {StatelessAccessory} from "../HomeKit/StatelessAccessory";
import {SingleStateAccessory} from "../HomeKit/SingleStateAccessory";
import {DualStateAccessory} from "../HomeKit/DualStateAccessory";
import {TriStateAccessory} from "../HomeKit/TriStateAccessory";
import {ConfigurationDatabase} from "./ConfigurationDatabase";
import {Request, RequestType} from "../Request";
import {AccessoryType} from "../HomeKit/AccessoryType";
import {DigitalSensorAccessory} from "../HomeKit/DigitalSensorAccessory";
import {AnalogSensorAccessory} from "../HomeKit/AnalogSensorAccessory";
import {Log} from "../Log";

/**
 * This namespace handles all ACP-data (Accessory Configuration Protocol).
 * The term ACP includes Remote- and Accessory Data.
 * It is one of the 2 APIs that are used by the server class.
 */
export namespace ConfigurationHandler {

    function init() {
        storage.initSync();
        loadAccessories();
    }

    let publishedAccessories: BaseAccessory[] = [];

    init();

    /**
     * Handles the request-objects from the server.
     * @param req The request object
     * @param callback A optional callback for returning a result json.
     */
    export function handleRequest(req: Request, callback?: (result: any) => void): void {
        switch (req.type) {
            case RequestType.Info:
                //merge all data to a single json
                let json = {
                    types: AccessoryType.getTypeInfo(),
                    remotes: ConfigurationDatabase.getRemoteInfo(),
                    accessories: ConfigurationDatabase.getAccessoryInfo()
                };
                callback(json);
                break;
            case RequestType.Save:
                for (let entry of req.json.accessories) {
                    let oldAcc = ConfigurationDatabase.getAccessoryByName(entry.name);
                    if (oldAcc !== undefined) {
                        //accessory exists already and needs to be updated
                        let newAcc = AccessoryConfiguration.recreate(JSON.stringify(entry));
                        AccessoryConfiguration.update(oldAcc, newAcc);
                        Log.info(this, "updated " + newAcc.name)
                    } else {
                        //accessory is a new one and needs to be published
                        let newAcc = AccessoryConfiguration.create(JSON.stringify(entry));
                        ConfigurationDatabase.addAccessory(newAcc);
                        let acc = create(newAcc);
                        acc.publish();
                        publishedAccessories.push(acc);
                    }
                }
                ConfigurationDatabase.updateRemotes(req.json.remotes);
                let removedAccs = ConfigurationDatabase.clean(req.json.accessories);
                for (let acc of removedAccs) {
                    unpublishAccessory(getPublishedAccessory(acc.name));
                }
                ConfigurationDatabase.persistData();

                if (typeof (callback) === "function") {
                    callback({text: "ACK"});
                }
                break;
        }
    }

    /**
     * creates a new accessory depending on the configuration.
     * @param data The accessory configuration created by the iOS-App.
     * @returns {any} The actual accessory object, which can be published by HAP-nodejs
     */
    function create(data: AccessoryConfiguration): BaseAccessory {
        switch (data.usedStates) {
            case -2:
                return new AnalogSensorAccessory(data);
            case -1:
                return new DigitalSensorAccessory(data);
            case 0:
                return new StatelessAccessory(data);
            case 1:
                return new SingleStateAccessory(data);
            case 2:
                return new DualStateAccessory(data);
            case 3:
                return new TriStateAccessory(data);
        }
    }

    /**
     * Called to load all accessories that are stored in the database.
     * After loading they are published by HAP-nodejs.
     */
    function loadAccessories(): void {
        for (let acc of ConfigurationDatabase.accessories) {
            let accessory = create(acc);
            accessory.publish();
            publishedAccessories.push(accessory);
        }
    }

    /**
     * Removes a published accessory from hap-nodejs
     * @param accessory The published accessory
     */
    function unpublishAccessory(accessory: BaseAccessory): void {
        let index = publishedAccessories.indexOf(accessory);
        publishedAccessories.splice(index, 1);
        accessory.destroy();
    }

    /**
     * Looks for a published accessory.
     * @param name The unique name
     * @returns {BaseAccessory} The found accessory
     */
    function getPublishedAccessory(name: String): BaseAccessory {
        let accessory: BaseAccessory;
        for (let acc of publishedAccessories) {
            if (acc.data.name == name) {
                accessory = acc;
            }
        }
        return accessory;
    }
}