/**
 * This object is used by the server to provide information about the current request.
 */
export class Request {

    public type: RequestType;

    public json: any;

    constructor(type: RequestType, json?: any) {
        this.type = type;
        this.json = json;
    }

}

/**
 * These types match the HTTP-URL calls.
 */
export enum RequestType{
    Restart,
    WaitCancel,
    Action,
    Wait,
    WaitAgain,
    WaitIP,
    Save,
    Info,
    Sensor,
}