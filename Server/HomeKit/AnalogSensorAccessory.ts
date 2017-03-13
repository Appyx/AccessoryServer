import {BaseAccessory} from "./BaseAccessory";
import {AccessoryConfiguration} from "../Data/AccessoryConfiguration";
import {RequestType, Request} from "../Request";
import {IO} from "../IO/IO";
import {Log} from "../Log";
/**
 * Created by Robert on 12/01/2017.
 */


/**
 * This accessory is used to provide data from a connected Arduino to HomeKit.
 * It automatically refreshes the data when possible an converts the received value into a percentage value.
 * This value is also altered by an analog reference in case this is used on the Arduino.
 */
export class AnalogSensorAccessory extends BaseAccessory {

    constructor(data: AccessoryConfiguration) {
        super(data);

        this.addGetCharacteristic(data.type.firstCharacteristic, (): any => {
            if (data.sensorValue === undefined) {
                return 0;
            } else {
                return data.sensorValue;
            }
        });

        IO.handleRequest(new Request(RequestType.Sensor, {
            type: "analog",
            pin: data.sensorPin
        }), (value: number) => {
            let min = this.data.analogReference || 0;
            let max = 1024;
            let res = (value - min) / (max - min) * 100;
            if (res >= 0 && res <= 100) {
                this.data.sensorValue = res;
                this.updateCharacteristic(data.type.firstCharacteristic, res);
            } else {
                Log.error(this, "The value for the AnalogSensor is out of range! (value=" + res + ")");
            }
        });
    }
}