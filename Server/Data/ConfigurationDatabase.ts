/**
 * Created by Robert on 10/01/2017.
 */
import * as fs from "fs";
import {AccessoryConfiguration} from "./AccessoryConfiguration";
import {Log} from "../Log";
import {AppConfig} from "../../AppConfig";


/**
 * This is one of the 2 Databases which are used in this project.
 * It is only responsible for the high-level logic (only the signal-id is stored and not the signal itself).
 *
 * The main purpose of the Database is saving and loading configuration-data for accessories and remotes.
 * The configuration-data contains some signal-ids any many other stuff.
 */
export namespace ConfigurationDatabase {

    export let accessories: AccessoryConfiguration[] = [];
    export let remotes;

    let timeOutHandler: any;
    const ACCESSORIES_FILE = "accessories.json";
    const REMOTES_FILE = "remotes.json";

    const ACCESSORIES_TEMPLATE = {nextPort: AppConfig.AccessoryStartingPort, accessories: []};
    const REMOTES_TEMPLATE = [];

    function init() {
        loadAccessoryConfiguration();
        remotes = readJson(REMOTES_FILE);
    }

    init();

    /**
     * Loads the configuration for all accessories from disk.
     */
    export function loadAccessoryConfiguration() {
        let json = readJson(ACCESSORIES_FILE);
        for (let object of json.accessories) {
            let acc = AccessoryConfiguration.recreate(object);
            accessories.push(acc);
        }
        AccessoryConfiguration.nextPort = json.nextPort;
    }


    /**
     * Adds a new configuration to the database
     * @param config
     */
    export function addAccessory(config: AccessoryConfiguration): void {
        accessories.push(config);
        let json = readJson(ACCESSORIES_FILE);
        json.nextPort += 1;
        json.accessories.push(AccessoryConfiguration.stringify(config));
        writeJson(json, ACCESSORIES_FILE);
        AccessoryConfiguration.nextPort = json.nextPort;
        Log.info(this, "AccessoryConfiguration added");
    }

    /**
     * Persists the configuration-data.
     * The function is called when an accessory changes its state.
     * Remotes don't have a state so they are never updated by this function.
     *
     * It can be called many times without updating. Only the last call updates the configurations.
     * The time between the last call and the update can be changed in the AppConfig.
     */
    export function persistData(): void {
        if (timeOutHandler !== undefined) {
            clearTimeout(timeOutHandler);
        }
        timeOutHandler = setTimeout(() => {
            let json = readJson(ACCESSORIES_FILE);
            json.accessories = [];
            for (let config of accessories) {
                json.accessories.push(AccessoryConfiguration.stringify(config));
            }
            writeJson(json, ACCESSORIES_FILE);
            writeJson(remotes, REMOTES_FILE);
            Log.info(this, "persisted data");
        }, AppConfig.AccessoryStateSavingDelay);
    }

    /**
     * Writes a json to disk.
     * @param newJson
     * @param filename The predefined filename for accessories or remotes
     */
    function writeJson(newJson: any, filename: string): void {
        fs.writeFileSync(filename, JSON.stringify(newJson));
    }


    /**
     * Reads the configuration from disk and converts it to a json-object.
     * If a file does not exist, it will be created from a template.
     * @param filename
     * @returns {any} The json-object depending on the file which was used to load the data.
     */
    function readJson(filename: string): any {
        let data;
        try {
            data = fs.readFileSync(filename, "utf8");
        } catch (err) {
            if (err.code === "ENOENT") {
                let template: any;
                if (filename === ACCESSORIES_FILE) {
                    template = ACCESSORIES_TEMPLATE;
                }
                if (filename === REMOTES_FILE) {
                    template = REMOTES_TEMPLATE;
                }
                data = JSON.stringify(template);
                fs.writeFileSync(filename, data);
            } else {
                throw err;
            }
        }
        return JSON.parse(data);
    }


    /**
     * Returns a json object of all remotes that are configured.
     * @returns {any}
     */
    export function getRemoteInfo(): any[] {
        return this.remotes;
    }

    /**
     * Returns a json object of all accessories that are configured
     * @returns {Array}
     */
    export function getAccessoryInfo(): any[] {
        let result = [];
        for (let acc of this.accessories) {
            result.push(JSON.parse(AccessoryConfiguration.stringify(acc)));
        }
        return result;
    }

    /**
     * Updates all remotes.
     * @param json
     */
    export function updateRemotes(json: any) {
        remotes = json;
    }

    /**
     *Returns an accessory by its name
     * @param name
     * @returns {any}
     */
    export function getAccessoryByName(name: string): AccessoryConfiguration {
        for (let acc of accessories) {
            if (acc.name == name) {
                return acc;
            }
        }
        return undefined
    }

    /**
     * Tries to clean the database.
     * If there are missing accessories thy will be removed.
     * (Does not modify data on disk)
     * @param newJson A json object to compare against
     * @returns {AccessoryConfiguration[]} The removed accessories
     */
    export function clean(newJson: any): AccessoryConfiguration[] {
        let removed: AccessoryConfiguration[] = [];
        for (let config of accessories) {
            let contains = false;
            for (let acc of newJson) {
                if (config.name == acc.name) {
                    contains = true;
                }
            }
            if (contains === false) {
                removed.push(config)
            }
        }
        for (let config of removed) {
            accessories.splice(accessories.indexOf(config), 1);
        }
        return removed;
    }

}