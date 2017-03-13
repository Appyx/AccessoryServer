/**
 * Created by Robert on 11/01/2017.
 */
import * as hap from "hap-nodejs";
import {Log} from "../Log";


/**
 * This class represents a type of accessory that can be used with infrared, radio frequency or network device.
 * The types used here are not random picked, they were chosen to provide the maximum range of possibilities for the user.
 */
export class AccessoryType {

    private static types = [
        new AccessoryType("Lightbulb",
            "Appears visually as a lightbulb and can be configured as Switch and optionally with a brightness control ranging from 1% to 100%."
            , 2, hap.Service.Lightbulb, hap.Characteristic.On, hap.Characteristic.Brightness),
        new AccessoryType("Switch",
            "Appears visually as a switch."
            , 1, hap.Service.Switch, hap.Characteristic.On),
        new AccessoryType("Outlet",
            "Like a Switch but with a different icon."
            , 1, hap.Service.Outlet, hap.Characteristic.On),
        new AccessoryType("Fan",
            "This is the most powerful type. It contains two switches and a speed control ranging from 1% to 100%."
            , 3, hap.Service.Fan, hap.Characteristic.On, hap.Characteristic.RotationSpeed, hap.Characteristic.RotationDirection),
        new AccessoryType("TemperatureSensor",
            "Sensor for measuring values in degree ranging from 0° to 100°."
            , -2, hap.Service.TemperatureSensor, hap.Characteristic.CurrentTemperature),
        new AccessoryType("MotionSensor",
            "A digital trigger."
            , -1, hap.Service.MotionSensor, hap.Characteristic.MotionDetected),
        new AccessoryType("HumiditySensor",
            "With this Sensor it is possible to measure percentage ranging from 0% to 100%."
            , -2, hap.HumiditySensor, hap.Characteristic.CurrentRelativeHumidity,
            new AccessoryType("LightSensor",
                "This is the most accurate Sensor with a value range from 0.0001 to 100000. (The drawback is the lux-unit which is displayed.)"
                , -2, hap.Service.LightSensor, hap.Characteristic.CurrentAmbientLightLevel))];


    private constructor(public name: string,
                        public description: string,
                        public possibleStates: number,
                        public service: any,
                        public firstCharacteristic: any,
                        public secondCharacteristic?: any,
                        public thirdCharacteristic?: any) {
    }

    /**
     * Returns all types that are defined.
     * Used to respond to the INFO request.
     *
     * @returns {Array}
     */
    public static getTypeInfo(): AccessoryType[] {
        let result = [];
        for (let type of this.types) {
            result.push({name: type.name, possibleStates: type.possibleStates, description: type.description})
        }
        return result;
    }

    /**
     * Returns a specific type for the name.
     * Used to create and recreate an accessory configuration.
     *
     * @param typeName
     * @returns {AccessoryType}
     */
    static getTypeForName(typeName: string): AccessoryType {
        for (let type of this.types) {
            if (type.name === typeName) {
                return type;
            }
        }
        Log.error(this, "Could not find any type with name: " + typeName);
    }
}