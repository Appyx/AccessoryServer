#!/bin/sh

echo "Welcome! (I hope you started this script with 'sudo' and updated your system)"
echo "This program will install all necessary components automatically and will take some time.\n"
echo "Press any key to continue..."
read anykey


chmod +x install_io.sh
./install_io.sh


echo "installing libavahi"
apt-get install -y --force-yes libavahi-compat-libdnssd-dev

echo "installing node"
curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get install -y --force-yes nodejs
cd ..
npm install
npm install -g typescript
tsc

#install platformio
#python -c "$(curl -fsSL https://raw.githubusercontent.com/platformio/platformio/master/scripts/get-platformio.py)"

echo "installing java"
apt-get install --y --force-yes oracle-java8-jdk

echo "rebooting..."
echo "Successfully installed!"
reboot

