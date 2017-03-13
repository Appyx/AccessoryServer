#!/bin/sh

sudo killall node 2> /dev/null
if [ "$1" = "-d" ]
then

    if [ "$2" = "-t" ]
    then
    echo "transpiling..."
    tsc
    fi

    cd out
    if [ "$3" = "-r" ]
    then
    echo "deleting persist folder"
    sudo rm -rf persist
    fi

    echo "running in debug mode..."
    sudo node main.js
else
    cd /home/pi/AccessoryServer/out
    echo "server started"
    sudo nohup node main.js >> /home/pi/AccessoryServer/server.log 2>&1 &
    cd /home/pi/AccessoryServer/AccessoryHub/Example
    sudo nohup java -jar AccessoryHub.jar &
fi

