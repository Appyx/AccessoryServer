import {Log} from "../Log";
import * as hap from "hap-nodejs";
import {AccessoryConfiguration} from "../Data/AccessoryConfiguration";
import {IO} from "../IO/IO";
import {Request, RequestType} from "../Request";
import {Remote} from "../Data/Remote";
import {ConfigurationDatabase} from "../Data/ConfigurationDatabase";
/**
 * Created by Robert on 10/01/2017.
 */


/**
 * This accessory is the base class for all other accessories and builds the bridge between the library hap-nodejs and typescript.
 * If a class inherits this class it gets pairable with HomeKit.
 *
 */
export abstract class BaseAccessory {

    private pincode: string = "000-00-000"; //this is useless in our use-case

    private hapAccessory;

    public data: AccessoryConfiguration;
    private serviceType: any;

    constructor(data: AccessoryConfiguration) {
        this.data = data;
        this.serviceType = data.type.service;

        this.hapAccessory = new hap.Accessory(data.name, this.data.uuid);
        this.hapAccessory.addService(this.serviceType, this.data.name);

        if (this.data.name !== undefined) {
            this.hapAccessory.getService(hap.Service.AccessoryInformation).setCharacteristic(hap.Characteristic.Name, this.data.name);
        }
        if (this.data.manufacturer !== undefined) {
            this.hapAccessory.getService(hap.Service.AccessoryInformation).setCharacteristic(hap.Characteristic.Manufacturer, "Simulated Accessory Inc.");
        }
        if (this.data.model !== undefined) {
            this.hapAccessory.getService(hap.Service.AccessoryInformation).setCharacteristic(hap.Characteristic.Model, "Level " + this.data.usedStates + " Accessory");
        }
        if (this.data.serial !== undefined) {
            this.hapAccessory.getService(hap.Service.AccessoryInformation).setCharacteristic(hap.Characteristic.SerialNumber, "Port: " + this.data.port);
        }
    }

    /**
     * This call exposes the accessory to HomeKit.
     */
    public publish(): void {

        this.hapAccessory.publish({
            port: this.data.port,
            username: this.data.username,
            pincode: this.pincode,
        });

        // listen for the "identify" event for this Accessory
        this.hapAccessory.on("identify", (paired, callback) => {
            if (paired) {
                Log.info(this, this.data.name + " is paired");
            } else {
                Log.warn(this, this.data.name + " is not paired!");
            }
            callback();
        });

        Log.info(this, this.data.name + " published");
    }

    public destroy(): void {
        this.hapAccessory.destroy();
        Log.info(this, this.data.name + " destroyed");
    }

    /**
     * Used to add a SET characteristic which is used to write to an accessory.
     * @param type
     * @param onSet Callback
     */
    protected addSetCharacteristic(type: any, onSet: (value: any) => void) {
        this.hapAccessory.getService(this.serviceType)
            .getCharacteristic(type)
            .on('set', (value, callback) => {
                onSet(value);
                callback();
            });
    }

    /**
     * Used to add a GET characteristic which is used to read from an accessory.
     * @param type The characteristic
     * @param onGet Callback
     */
    protected addGetCharacteristic(type: any, onGet: () => any) {
        this.hapAccessory.getService(this.serviceType)
            .getCharacteristic(type)
            .on('get', (callback) => {
                callback(null, onGet());
            });
    }

    /**
     * Used to update a characteristic in case of an external change.
     * @param type The characteristic
     * @param value
     */
    protected updateCharacteristic(type: any, value: any) {
        this.hapAccessory.getService(this.serviceType)
            .getCharacteristic(type)
            .updateValue(value)
    }

    /**
     * Sends a collection of Signals specified by their signal-ids.
     *
     * @param remote
     * @returns {boolean}
     */
    protected sendSignals(remote: Remote): boolean {
        if (remote === undefined) {
            return false;
        }

        ConfigurationDatabase.persistData(); //used here because it is the only common call for all accessories

        let command = remote.commands[0]; //this remote only contains 1 command
        if (command.commands === undefined) {
            IO.handleRequest(new Request(RequestType.Action, {signalIDs: [command.signal]}));
        } else {
            let array = [];
            for (command of command.commands) {
                array.push(command.signal)
            }
            IO.handleRequest(new Request(RequestType.Action, {signalIDs: array}));
        }
        return true;
    }
}