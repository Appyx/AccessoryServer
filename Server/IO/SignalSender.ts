import {spawnSync} from "child_process";
import {Signal} from "./Signal";
import {Log} from "../Log";
import {SocketManager} from "./SocketManager";
import * as fs from "fs";

/**
 * Responsible for sending signals.
 */
export class SignalSender {

    public socketManager: SocketManager;

    constructor() {
        this.socketManager = new SocketManager();
    }

    /**
     * Sens a signal once specified by the object.
     * @param signal The signal-object
     */
    public send(signal: Signal): void {
        switch (signal.type) {
            case "IR":
                fs.writeFileSync('/dev/gpio-reflect', signal.data);
                break;
            case "RF":
                spawnSync("../bin/codesend", [signal.data]);
                break;
            case "IP":
                this.socketManager.broadcast({data: signal.data}); //send to all (the clients will handle the data overflow)
                break;
        }
        Log.debug(this, "signal sent: id=" + signal.id + " type=" + signal.type + " data=" + signal.data);
    }


}