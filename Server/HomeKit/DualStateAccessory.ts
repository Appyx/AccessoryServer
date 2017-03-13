import {SingleStateAccessory} from "./SingleStateAccessory";
import {Log} from "../Log";
import {AccessoryConfiguration} from "../Data/AccessoryConfiguration";

/**
 * This accessory is able to store and modify 2 states.
 * The first state is defined in the base class.
 * The second state is the possibility to react to a change of percentage values.
 */
export class DualStateAccessory extends SingleStateAccessory {

    constructor(data: AccessoryConfiguration) {
        super(data);

        let step = Math.round(100 / this.data.secondStateMaxValue); //in case that a device can not use 100 steps.

        this.addSetCharacteristic(data.type.secondCharacteristic, (value) => {
            if (this.data.secondState === undefined) {
                this.data.secondState = 1;
            }
            if (value < 1) { //to prevent the accessory from modifying the first state when reaching 0
                value = 1;
                this.singleStateEnabled = false;
                setTimeout(() => {
                    this.singleStateEnabled = true;
                }, 500); //this timeout is needed to re-enable the first state.
                setTimeout(() => {
                    this.updateCharacteristic(this.data.type.secondCharacteristic, value);
                    this.updateCharacteristic(this.data.type.firstCharacteristic, true);
                }, 10); //this timeout is needed to switch the device on again after reaching 0.
            }
            if (value > this.data.secondState) { //increase value
                while (Math.abs(value - this.data.secondState) > 1) {
                    if (this.sendSignals(data.secondStateIncreaseSignals) === false) {
                        Log.warn(this, "no percent-increase-action has been set");
                    }
                    this.data.secondState += step;
                }
            }
            if (value < this.data.secondState) { //devrease value
                while (Math.abs(value - this.data.secondState) > 1) {
                    if (this.sendSignals(data.secondStateDecreaseSignals) === false) {
                        Log.warn(this, "no percent-decrease-action has been set");
                    }
                    this.data.secondState -= step;
                    if (this.data.secondState < 1) {
                        this.data.secondState = 1;
                    }
                }
            }

        });

        this.addGetCharacteristic(data.type.secondCharacteristic, (): any => {
            if (this.data.secondState === undefined) {
                this.data.secondState = 1;
            }
            return this.data.secondState
        });
    }

}