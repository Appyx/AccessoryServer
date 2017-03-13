export namespace AppConfig {

    export let ServerPort = 8888;
    export let AccessoryStartingPort = ServerPort + 10; //can be any port
    export let AccessoryStateSavingDelay = 1000 * 7; // 7 seconds
    export let LogLevel = 4; //no log = 0, complete log = 4

    export let ArduinoDevice = "/dev/ttyACM0"; //this may vary depending on your raspberry configuration
    export let BaudRate = 9600; //this needs to be in sync with the arduino program

    export let LircReceiver = "/dev/lirc0"; //usually the default is just fine
}
