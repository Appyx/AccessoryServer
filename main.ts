import {Server} from "./Server/Server";

/*
 * This project requires its folder structure - do NOT modify it!
 * Don't move or rename files in this folder structure!
 *
 *
 * To install all required components just run the 'install.sh' script (Do NOT use sudo for this script!).
 * After the reboot, you can start the server with the 'start.sh' script.
 * (Use the '-d' option to get debug info on the console instead of the 'server.log' file).
 * You don't have to compile anything or do any configuration (the install script does this work).
 * In order to use the arduino as sensor provider you have to connect it to any USB BEFORE the install script runs.
 *
 * Use the RemoteApp for iOS to record all the commands and create sensors (or dive into the code and write your own thing^^).
 *
 *
 * All code is compiled with the 'tsc' command. The rules are defined in 'tsconfig.json'.
 * Due to the heavy dependencies that come with the task of controlling hardware, it is important to update the project
 * correctly.
 * (For now use the 'uninstall.sh' script and then the 'install.sh' script to update all parts automatically.)
 *
 * Here is the list of external dependencies:
 *
 * WiringPi (c-library for GPIO-pins)
 * Lirc (kernel extension for infrared)
 * RC-Switch (c-library for 433Mhz)
 * Libavahi (c-library for bonjour and co.)
 * NodeJS and npm (of course :D)
 * PlatformIO (for compiling and uploading arduino code)
 *
 * The list of dependencies for the JS-Code can be found in the 'package.json' file.
 * (Nodte: Without the awesome HAP-Nodejs library it would not be possible to create such a project in any way :)
 *
 * (Note: for now it is required, that the arduino is listed under '/dev/ttyACM0')
 *
 *
 */

let server = new Server();
server.start();

























