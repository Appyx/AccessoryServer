import {spawn} from "child_process";
import {Signal} from "./Signal";
import {Log} from "../Log";
import {AppConfig} from "../../AppConfig";
import {SocketManager} from "./SocketManager";


/**
 * This class is responsible for receiving signals through GPIO and IP.
 */
export class SignalReceiver {

    public socketManager: SocketManager;
    private socketSignals: Signal[] = [];
    private socketCounter: number = 0;

    private onSignalReceived: (signal: Signal) => void;

    private lircDevice = AppConfig.LircReceiver;

    private mode2;
    private sniffer;


    constructor() {
        this.socketManager = new SocketManager();
    }

    /**
     * Receives a GPIO-Signal and converts it to an object.
     * @param callback
     */
    public receive(callback: (signal: Signal) => void): void {
        this.onSignalReceived = callback;

        Log.info(this, "waiting for signal...");

        this.receiveIR();
        this.receiveRF();
    }


    /**
     * Helper to listen for infrared signals.
     */
    private receiveIR(): void {
        let irData: string = undefined;

        this.mode2 = spawn('cat', ["/dev/gpio-reflect"]);

        this.mode2.stdout.on('data', (data) => {
            if (irData === undefined) {
                irData = data.toString();
                this.killReceiver(new Signal("IR", irData));
            }
        });
        this.mode2.stderr.on("data", (data) => {
            Log.warn(this, "recording failed");
        })
    }

    /**
     * Helper to listen for radio frequency signals.
     */
    private receiveRF(): void {
        let rfData: string = undefined;
        this.sniffer = spawn('../bin/sniffer');

        this.sniffer.stdout.on('data', (data) => {
            if (rfData === undefined) {
                rfData = data.toString();
                this.killReceiver(new Signal("RF", rfData));
            }
        });
    }

    /**
     * Kills the external receiving programs.
     * @param sig
     */
    public killReceiver(sig?: Signal): void {
        this.sniffer.kill();
        this.mode2.kill();
        this.onSignalReceived(sig);
    }

    /**
     * Requests the content of the commands.txt of every connected java-client.
     * After receiving all content it creates an array of signals which can be used normally in the project.
     *
     * @param callback Contains all signals that are available by all clients.
     */
    public receiveIPSignals(callback: (signals: Signal[]) => void): void {
        if (this.socketManager.size() === 0) {
            callback([]); //return empty array to complete the request
            Log.warn(this, "no socket-clients connected");
        }
        for (let client of this.socketManager.getSockets()) {
            let onData = (data) => {
                //first collect all messages
                this.socketCounter += 1;

                Log.debug(this, "data received from socket-client: " + JSON.stringify(data));
                for (let entry of data.data) {

                    this.socketSignals.push(new Signal("IP", entry));
                }

                client.removeListener("data", onData);

                if (this.socketCounter === this.socketManager.size()) {
                    //then return the signals
                    callback(this.socketSignals);
                    this.socketSignals = [];
                    this.socketCounter = 0;
                }
            };
            client.on("data", onData);
            client.emit("dataRequest");
        }
    }
}
