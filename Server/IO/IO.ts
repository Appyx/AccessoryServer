import {Request, RequestType} from "../Request";
import {SignalReceiver} from "./SignalReceiver";
import {SignalDatabase} from "./SignalDatabase";
import {SignalSender} from "./SignalSender";
import {Signal} from "./Signal";
import {Log} from "../Log";
import {SDAProvider} from "./SDAProvider";


/**
 * This namespace is one of the 2 APIs used by the server to handle requests.
 * The main purpose is to delegate the request types to the right components and to provide a response.
 *
 * It is the lowest layer in the hierarchy and is used to manage the signal processing.
 */
export namespace IO {
    let receiver: SignalReceiver = new SignalReceiver();
    let database: SignalDatabase = new SignalDatabase();
    let sender: SignalSender = new SignalSender();
    let sdaProvider: SDAProvider = new SDAProvider();


    let queueIndex: number = 0;
    let queueArray: number[] = [];
    let queueIsOperating = false;

    function queueSignals() {
        queueIsOperating = true;
        if (queueIndex == queueArray.length) { //stop recursion
            queueIndex = 0;
            queueArray = [];
            queueIsOperating = false;
            return
        }
        if (queueArray[queueIndex] < 0) { //delay
            setTimeout(queueSignals, queueArray[queueIndex] * -1);
            queueIndex += 1;
        } else { //no delay
            sender.send(database.getSignal(queueArray[queueIndex]));
            queueIndex += 1;
            queueSignals();
        }
    }

    /**
     * Handles all requests that are used for sending or recording signals.
     * @param req
     * @param callback A json-object containing the response
     */
    export function handleRequest(req: Request, callback?: (res: any) => void): void {
        switch (req.type) {
            case RequestType.Action:
                for (let sig of req.json.signalIDs) {
                    queueArray.push(sig);
                }
                if (!queueIsOperating) {
                    queueSignals();
                }
                if (typeof (callback) === "function") {
                    callback({text: "ACK"});
                }
                break;
            case RequestType.Wait:
            case RequestType.WaitAgain:
                receiver.receive((signal: Signal) => {
                    if (signal === undefined) { //if no signal it was cancelled
                        callback({canceled: true});

                    } else {
                        database.saveSignal(signal, req.type === RequestType.WaitAgain);
                        callback({
                            recordedID: signal.id,
                            type: signal.type
                        });
                    }
                });
                break;
            case RequestType.WaitCancel:
                receiver.killReceiver(); //kills the executing C++ programs
                Log.info(this, "Wait-Request cancelled");
                callback({
                    text: "wait cancelled"
                });
                break;
            case RequestType.Sensor:
                if (req.json.type === "digital")
                    sdaProvider.setDigitalCallback(req.json.pin, callback);
                if (req.json.type === "analog")
                    sdaProvider.setAnalogCallback(req.json.pin, callback);
                break;
            case RequestType.WaitIP:
                receiver.receiveIPSignals((signals: Signal[]) => {
                    database.saveIPSignals(signals); //save only the new ones
                    let newSignals: Signal[] = database.getIPSignals();

                    //The result contains all ip signals
                    let callbackJson = [];
                    for (let sig of newSignals) {
                        callbackJson.push({
                            recordedID: sig.id,
                            type: sig.type,
                            name: sig.data
                        })
                    }
                    let result = {signals: callbackJson};
                    callback(result);
                });
                break;
        }
    }

    /**
     * Called when a client is connected.
     * @param socketClient the socket.io object of the connection
     */
    export function addSocketClient(socketClient): void {
        receiver.socketManager.add(socketClient);
        sender.socketManager.add(socketClient);
    }

    export function clean(listOfIDs: number[]) {
        //TODO: delete this ids from io.json and lircd.conf
    }


}