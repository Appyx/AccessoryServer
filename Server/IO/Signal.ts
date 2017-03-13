/**
 * This class is the data-container for a signal.
 */
export class Signal {
    public type: string;
    public data: string;
    public dataExtension: string; //needed in case of infrared because there is very much data
    public id: number;

    constructor(type: string, data: string, dataExtension?: string) {
        this.type = type;
        this.data = data;
        this.dataExtension = dataExtension;
    }
}