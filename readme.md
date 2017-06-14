# What is it?

The goal of this project is to replace all remote controls with HomeKit Accessories. 

There are four ways to communicate with devices:

### 38KHz Infrared
Most standard devices like TVs can be controlled with regular infrared remote controls.
The integrated kernel module is able to send and record all types of signals. No crazy repeating of key presses is needed. It just works with any remote control.

This requires additional hardware for sending and receiving such signals.

### 433MHz RF
Radio-controlled sockets operating in the 433 MHz range are a very cheap solution for automating lights or other devices.
The integrated programs are able to record such signals and send them again. There is only one key press necessary. 

This requires additional hardware for sending and receiving such signals.
### IP
With the AccessoryHub it is possible to execute any shell command on a remote machine. Many AccessoryHubs can be used at the same time. This only works at the local IP-network.
The AccessoryHub is written in Java for portability reasons.

This does not require additional hardware.


### Analog/Digital Sensors
HomeKit supports analog and digital sensors. So you can add your own custom sensors with this project.
Just write a program for the Arduino Platform and send the data to the serial port.

This requires an Arduino Uno R3 board.

Each described component is optional. Use only what you want to use.


# How to use it?



# Installation

* `sudo apt-get -y update`
* `sudo apt-get -y upgrade`
* `sudo rpi-update`
