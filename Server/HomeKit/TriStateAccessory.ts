import {DualStateAccessory} from "./DualStateAccessory";
import {Log} from "../Log";
import {AccessoryConfiguration} from "../Data/AccessoryConfiguration";
/**
 * Created by Robert on 11/01/2017.
 */


/**
 * This is the most powerful accessory.
 * In addition to the 2 other states it is able to use a third state.
 */
export class TriStateAccessory extends DualStateAccessory {

    constructor(data: AccessoryConfiguration) {
        super(data);

        this.addSetCharacteristic(data.type.thirdCharacteristic, (value) => {
            if (this.data.thirdState === undefined) {
                this.data.thirdState = true;
            }
            if (value === 1 || value === true) { //on
                if (this.data.thirdState === true) {
                    return;
                }
                if (this.sendSignals(data.thirdStateOnSignals)) {
                    Log.warn(this, "no second on-action has been set");
                }
                this.data.thirdState = true;
            } else { //off
                if (this.data.thirdState === false) {
                    return;
                }
                if (this.sendSignals(data.thirdStateOffSignals) === false) {
                    Log.warn(this, "no second off-action has been set");
                }
                this.data.thirdState = false;
            }
        });

        this.addGetCharacteristic(data.type.thirdCharacteristic, (): any => {
            if (this.data.thirdState === undefined) {
                this.data.thirdState = true;
            }
            return this.data.thirdState;
        });
    }
}