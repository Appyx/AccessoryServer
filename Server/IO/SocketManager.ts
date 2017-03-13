import {Log} from "../Log";


/**
 * This class wraps a socket.io socket into a typescript interface.
 *
 * The main purpose is to provide a nicer socket API.
 */
export class SocketManager {

    private sockets: SocketClient[] = [];

    constructor() {

    }

    /**
     * Adds a native socket.io socket.
     * @param socket
     */
    public add(socket) {
        let client = new SocketClient(socket, (client: SocketClient) => {
            this.remove(client);
        });
        this.sockets.push(client);
        Log.debug(this, "added socket");
    }

    /**
     * Removes a non-native socket.
     * @param client
     */
    public remove(client: SocketClient) {
        delete client.socket;
        let index = this.sockets.indexOf(client);
        this.sockets.splice(index, 1);

        Log.debug(this, "removed socket (" + this.size() + " remaining)");
    }

    public size() {
        return this.sockets.length;
    }

    /**
     * Returns all the native sockets.
     * @returns {Array}
     */
    public getSockets(): any[] {
        let res = [];
        for (let sock of this.sockets) {
            res.push(sock.socket);
        }
        return res;
    }

    /**
     * Sens a message to all sockets.
     * @param json
     */
    public broadcast(json: any): void {
        Log.debug(this, "broadcasting to " + this.size() + " clients");
        for (let socketClient of this.sockets) {
            socketClient.socket.emit("event", json);
        }
    }
}

/**
 * Useless at the moment. (Maybe in the future useful :D)
 */
class SocketClient {
    public socket;

    constructor(socket, onDisconnect: (id: SocketClient) => void) {
        this.socket = socket;
        socket.on("disconnect", () => {
            onDisconnect(this);
        })
    }
}