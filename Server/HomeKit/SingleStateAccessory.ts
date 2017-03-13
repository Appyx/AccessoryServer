import {BaseAccessory} from "./BaseAccessory";
import {Log} from "../Log";
import {AccessoryConfiguration} from "../Data/AccessoryConfiguration";

/**
 * This is the basic version of an accessory that can handle a single state change.
 */
export class SingleStateAccessory extends BaseAccessory {

    protected singleStateEnabled = true; //needed to temporary disable the functionality (called from a child class)

    constructor(data: AccessoryConfiguration) {
        super(data);

        this.addSetCharacteristic(data.type.firstCharacteristic, (value) => {
            let timeout = 0;
            if (data.usedStates >= 2) { //if is dualstate
                timeout = 100;
            }

            setTimeout(() => {
                if (this.singleStateEnabled === false) {
                    return;
                }
                if (value === 1 || value === true) { //on
                    if (this.data.firstState === true) {
                        return;
                    }
                    if (this.sendSignals(data.firstStateOnSignals) == false) {
                        Log.warn(this, "no first on-action has been set");
                    }
                    this.data.firstState = true;
                }
                if (value === 0 || value === false) { //off
                    if (this.data.firstState === false) {
                        return;
                    }
                    if (this.sendSignals(data.firstStateOffSignals) === false) {
                        Log.warn(this, "no first off-function has been set");
                    }
                    this.data.firstState = false;
                }
            }, timeout); //this crazy timeout is needed to swap the callback order of dualstate and singlestate
        });

        this.addGetCharacteristic(data.type.firstCharacteristic, (): any => {
            if (this.data.firstState === undefined) {
                this.data.firstState = true;
            }
            return this.data.firstState;
        });
    }

}