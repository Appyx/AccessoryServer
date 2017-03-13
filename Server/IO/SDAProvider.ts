import {Log} from "../Log";
import {AppConfig} from "../../AppConfig";


/**
 * The SDA-Provider provides access to the SDA-protocol (Sensor Data Array).
 *
 * The main purpose is to register a callback for a pin on the Arduino.
 */
export class SDAProvider {

    private digitalArray = [];
    private analogArray = [];
    private shouldReceive: boolean = false;

    private buffer: string = "";

    constructor() {
        this.digitalArray = new Array(14); //uno has 14 digital pins
        this.analogArray = new Array(6); //and 6 analog pins
        let fs = require('fs');
        if (fs.existsSync(AppConfig.ArduinoDevice)) { //to prevent an exception if no device is connected
            let SerialPort = require("serialport");
            let serialPort = new SerialPort(AppConfig.ArduinoDevice, {
                baudrate: AppConfig.BaudRate
            });
            serialPort.on("open", () => {
                setTimeout(() => {
                    this.shouldReceive = true;
                    Log.info(this, "ready to receive sensor data");
                }, 2000); //this timout is used to provide time for stabilizing of the UART
                serialPort.on('data', (data) => {
                    this.onData(data.toString());
                });
            });
        } else {
            setTimeout(() => {
                Log.warn(this, "could not connect to device on: " + AppConfig.ArduinoDevice);
            }, 2000); //only to print the log later for having a pretty log :D
        }
    }

    /**
     * Used to register for receiving messages from a specific digital pin.
     * @param pin
     * @param callback
     */
    public setDigitalCallback(pin: number, callback: (value: boolean) => void): void {
        this.digitalArray[pin] = callback;
        Log.debug(this, "registered digital sensor on pin " + pin);
    }

    /**
     * Used to register for receiving messages from a specific analog pin.
     * @param pin
     * @param callback
     */
    public setAnalogCallback(pin: number, callback: (value: number) => void): void {
        this.analogArray[pin] = callback;
        Log.debug(this, "registered analog sensor on pin " + pin);

    }

    /**
     * Called when data is available trough the serial communication.
     * This data is useless, so we need to modify it in order to get a useful value.
     * @param data The useless data.
     */
    private onData(data: string) {
        if (this.shouldReceive === false) {
            return;
        }
        for (let i = 0; i < data.length; i++) {
            let c = data.charAt(i);
            if (c === '#') {
                this.newValue(); //useful data available
                this.buffer = "";
            } else {
                this.buffer += c;
            }
        }
    }

    /**
     * Called when a useful value is available.
     *
     * The data is split into analog or digital and the value is sent to the registered callbacks.
     */
    private newValue() {
        let value = this.buffer;
        Log.debug(this, "Received value: " + value);

        if (value.indexOf('D') === 0) { //digital
            let bool = value.charAt(value.indexOf("=") + 1);
            let pin = value.charAt(value.indexOf('D') + 1);

            if (bool === "1") {
                if (typeof (this.digitalArray[pin]) === "function") {
                    this.digitalArray[pin](true);
                    Log.debug(this, "Sensor at digital pin '" + pin + "' transmitted the value 'true' to HomeKit");
                }
            }
            else if (bool === "0") {
                if (typeof (this.digitalArray[pin]) === "function") {
                    this.digitalArray[pin](false);
                    Log.debug(this, "Sensor at digital pin '" + pin + "' transmitted the value 'false' to HomeKit");
                }
            } else {
                Log.error(this, "Incorrect Format! '(D" + pin + "=" + bool + ")'");
            }
        }
        if (value.indexOf('A') === 0) { //analog
            let integer = parseInt(value.substring(value.indexOf("=") + 1));
            let pin = value.charAt(value.indexOf('A') + 1);

            if (integer <= 1024 && integer >= 0) {
                if (typeof (this.analogArray[pin]) === "function") {
                    this.analogArray[pin](integer);
                    Log.debug(this, "Sensor at analog pin '" + pin + "' transmitted the value '" + integer + "' to HomeKit");
                }
            } else {
                Log.error(this, "Incorrect Format! '(A" + pin + "=" + integer + ")'");
            }
        }
    }

}