import {BaseAccessory} from "./BaseAccessory";
import {AccessoryConfiguration} from "../Data/AccessoryConfiguration";
import {IO} from "../IO/IO";
import {RequestType, Request} from "../Request";
/**
 * Created by Robert on 12/01/2017.
 */


/**
 * This represents a digital sensor that communicates with the connected Arduino.
 */
export class DigitalSensorAccessory extends BaseAccessory {
    constructor(data: AccessoryConfiguration) {
        super(data);

        this.addGetCharacteristic(data.type.firstCharacteristic, (): any => {
            if (data.sensorValue === undefined) {
                return false;
            } else {
                return data.sensorValue;
            }
        });

        IO.handleRequest(new Request(RequestType.Sensor, {
            type: "digital",
            pin: data.sensorPin
        }), (res: boolean) => {
            data.sensorValue = res;
            this.updateCharacteristic(data.type.firstCharacteristic, res);
        });
    }


}