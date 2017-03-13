import {BaseAccessory} from "./BaseAccessory";
import * as hap from "hap-nodejs";
import {Log} from "../Log";
import {AccessoryConfiguration} from "../Data/AccessoryConfiguration";


/**
 * This accessory is commonly used for devices that not able to send feedback for a command.
 * So this accessory is always on.
 */
export class StatelessAccessory extends BaseAccessory {

    constructor(data: AccessoryConfiguration) {
        super(data);

        this.addSetCharacteristic(data.type.firstCharacteristic, (value) => {

            if (this.sendSignals(data.firstStateOnSignals) === false) {
                Log.warn(this, "no action has been set");
            }

            setTimeout(() => {
                this.updateCharacteristic(hap.Characteristic.On, true);
            }, 100); //new "thread"
        });

        this.addGetCharacteristic(data.type.firstCharacteristic, (): any => {
            return true;
        });
    }


}