import {Request, RequestType} from "./Request";
import {IO} from "./IO/IO";
import {Log} from "./Log";
import {ConfigurationHandler} from "./Data/ConfigurationHandler";
import {AppConfig} from "../AppConfig";

/**
 * This is the entry point for the application.
 * The Server is only responsible for converting HTTP messages to API calls.
 * There are 2 APIs that are used:
 *  - IO (responsible for recording and receiving signals from GPIO and IP)
 *  - ConfigurationHandler (responsible for creating and modifying accessories)
 *
 *  Socket.io is used for communicating with the java clients, which can execute any command on WIN/UNIX.
 *  Express is used for working with a nice HTTP API.
 *
 *  All requests return a JSON-object depending on the current use-case.
 */
export class Server {

    private express;
    private bodyParser;
    private server;
    private socket;
    private port: number;

    constructor() {
        //TODO: clean imports
        this.bodyParser = require('body-parser');
        this.port = AppConfig.ServerPort;
        this.express = require("express")();
        this.configureExpress();
        this.server = require("http").Server(this.express);
        this.socket = require("socket.io")(this.server);
        this.configureSocket();

    }

    public start(): void {
        this.server.listen(this.port, () => {
            Log.info(this, "listening on port " + this.port);
        });
    }

    private configureSocket(): void {
        this.socket.on('connection', (socket) => {
            IO.addSocketClient(socket);
            Log.info(this, "socket-client connected");
        });
    }

    private configureExpress(): void {
        this.express.use((req, res, next) => { //logging middleware
            Log.info(this, req.method + " " + req.url);
            next();
        });

        this.express.use(this.bodyParser.json());
        this.express.get("/info", this.handleInfo); //called to get all data from all configurations
        this.express.get("/action", this.handleAction); //called to send one previously recorded signals
        this.express.post("/action", this.handleActionPost);
        this.express.get("/wait", this.handleWait); //called to start the recording process for GPIO-signals
        this.express.get("/waitAgain", this.handleWaitAgain); //called after a regular wait request in order to repeat the recording
        this.express.get("/waitCancel", this.handleWaitCancel); //called to cancel recording
        this.express.get("/waitIP", this.handleWaitIP); //called to record an IP-signal from a java-client
        this.express.post("/save", this.handleSavePost); //called to save a new configuration (remotes + accessories)
        this.express.get("/sensor", this.handleSensor); //called to get the current value of sensors
    }

    private handleInfo = (req, res) => {
        ConfigurationHandler.handleRequest(new Request(RequestType.Info), (json: any) => {
            res.send(JSON.stringify(json));
        });
    };

    private handleSavePost = (req, res) => {
        let data = req.body;
        ConfigurationHandler.handleRequest(new Request(RequestType.Save, data), (json: any) => {
            res.send(JSON.stringify(json));
        });
    };

    private handleAction = (req, res) => {
        let data = {signalIDs: [req.query.id]};
        IO.handleRequest(new Request(RequestType.Action, data), (json: any) => {
            res.send(JSON.stringify(json));
        });
    };
    private handleActionPost = (req, res) => {
        let data = req.body;
        IO.handleRequest(new Request(RequestType.Action, data), (json: any) => {
            res.send(JSON.stringify(json));
        });
    };

    private handleWait = (req, res) => {
        IO.handleRequest(new Request(RequestType.Wait), (json: any) => {
            res.send(JSON.stringify(json));
        });
    };
    private handleWaitAgain = (req, res) => {
        IO.handleRequest(new Request(RequestType.WaitAgain), (json: any) => {
            res.send(JSON.stringify(json));
        });
    };
    private handleWaitCancel = (req, res) => {
        IO.handleRequest(new Request(RequestType.WaitCancel), (json: any) => {
            res.send(JSON.stringify(json));
        });
    };
    private handleWaitIP = (req, res) => {
        IO.handleRequest(new Request(RequestType.WaitIP), (json: any) => {
            res.send(JSON.stringify(json));
        });
    };

    private handleSensor = (req, res) => {
        let sensorJson = {type: "digital", pin: 3}; //TODO: parse body
        IO.handleRequest(new Request(RequestType.Sensor, sensorJson), (json: any) => {
            res.send(json); //no stringify - data is only a number/boolean
        });
    };


}