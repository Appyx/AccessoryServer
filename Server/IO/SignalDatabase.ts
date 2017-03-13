import {spawnSync} from "child_process";
import * as fs from "fs";
import {Signal} from "./Signal";
import {Log} from "../Log";


/**
 * This is the low-level-database which stores all the signals and the info how to process them correctly.
 *
 */
export class SignalDatabase {

    private static jsonTemplate = {
        nextID: 0, signals: []
    };

    private signals: Signal[];

    //These are the values contain alway the most recent data (if not the WaitAgain-request)
    private lircBackup: string;
    private jsonBackup: any;


    constructor() {
        this.signals = this.readJson().signals;
    }

    /**
     * Saves multiple IP-signals which are provided by a websocket.
     * This signals are only saved if they are not already in the database.
     *
     * @param signals The signals to save
     * @returns {Signal[]} An Array containing the saved signals.
     */
    public saveIPSignals(signals: Signal[]): Signal[] {
        let result: Signal[] = [];
        for (let sig of signals) {
            if (!this.contains(sig)) {
                this.writeJson(this.jsonBackup, sig);
                result.push(sig);
            }
        }
        Log.debug(this, "saved " + result.length + " IP-signals");
        return result;
    }

    public getIPSignals() {
        let result: Signal[] = [];
        for (let sig of this.signals) {
            if (sig.type === "IP") {
                result.push(sig);
            }
        }
        return result;
    }

    /**
     * Checks the database for an existing signal.
     * @param signal
     * @returns {boolean} True if existing
     */
    private contains(signal: Signal): boolean {
        this.jsonBackup = this.readJson(); //always read json to be safe
        for (let sig of this.jsonBackup.signals) {
            if (sig.type === signal.type && sig.data === signal.data) {
                return true;
            }
        }
        return false;
    }


    /**
     * Saves non-IP signals.
     *
     * An optional backupmode can be used in order to re-record a signal.
     * If this mode is used the previously recorded signal gets overwritten.
     *
     * @param signal
     * @param backupMode True = Do NOT use the most recent backup-values.
     */
    public saveSignal(signal: Signal, backupMode = false): void {
        if (backupMode === false) {
            //make backup for later
            this.jsonBackup = this.readJson();
            this.lircBackup = this.readLircConfig();
            if (this.jsonBackup === undefined) {
                Log.error(this, "reading json failed");
            }
            if (this.lircBackup === undefined) {
                Log.error(this, "reading lirc failed");
            }
        } else {
            Log.info(this, "using backupmode");
            if (this.lircBackup === undefined || this.jsonBackup === undefined) {
                Log.error(this, "no backups defined");
            }
        }
        //always use backup value (if backupmode is true there will be the old value)

        if (signal.type === "IR") {
            this.writeLircConfig(this.lircBackup, signal);
        }

        signal.dataExtension = undefined; //we don't want to save this useless huge amount of data

        this.writeJson(this.jsonBackup, signal);

        Log.info(this, "signal saved: id=" + signal.id + " type=" + signal.type + " data=" + signal.data);

    }

    /**
     * Takes an old json, adds a signal and writes a new one to the disk.
     * Increases the nextID value prepare for future calls.
     * @param oldJson
     * @param signal
     */
    private writeJson(oldJson: any, signal: Signal): void {
        let newJson = JSON.parse(JSON.stringify(oldJson));
        signal.id = oldJson.nextID;
        newJson.signals.push(signal);
        newJson.nextID += 1;
        fs.writeFileSync('io.json', JSON.stringify(newJson));
        this.signals = newJson.signals;
    }

    /**
     * Reads all data from disk and returns a json representing the data.
     * @returns {any}
     */
    private readJson(): any {
        let data;
        try {
            data = fs.readFileSync('io.json', "utf8");
        } catch (err) {
            if (err.code === 'ENOENT') {
                data = JSON.stringify(SignalDatabase.jsonTemplate);
                fs.writeFileSync('io.json', data);
            } else {
                throw err;
            }
        }
        return JSON.parse(data);
    }

    /**
     * Takes the old file-content, appends the new values and writes the new content, including the new signal, to the disk.
     * @param oldContent
     * @param signal
     */
    private writeLircConfig(oldContent: string, signal: Signal) {
        let pos = oldContent.lastIndexOf("end raw_codes");
        let content = oldContent.substring(0, pos) + "name " + signal.data + '\n' + signal.dataExtension + '\n' + oldContent.substring(pos);

        fs.writeFileSync("/etc/lirc/lircd.conf", content);

        spawnSync("/etc/init.d/lirc", ["restart"]);
    }

    /**
     * Reads the lirc-file.
     * @returns {string}
     */
    private readLircConfig(): string {
        return fs.readFileSync("/etc/lirc/lircd.conf", "utf8");
    }

    /**
     * Returns the right signal for a provided id.
     *
     * @param id
     * @returns {Signal}
     */
    public getSignal(id: number): Signal {
        for (let signal of this.signals) {
            if (signal.id == id) {
                return signal;
            }
        }
        Log.error(this, "unknown signal: id=" + id);
    }

    public removeSignal(id: number) {
        //TODO: parse lirc config or json or both and remove entry (for lirc use 'sed' with dataExtension)
    }
}