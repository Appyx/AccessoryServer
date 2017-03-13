#!/bin/sh

echo "Welcome! (I hope you started this script with sudo...)"
echo "This programm will install all nescessary components automatically."
echo "You only have to connect the 4 data-pins and 1 ground pin.\n"

if [ "$1" = "-u" ]
then
    apt-get --yes --force-yes update
    apt-get --yes --force-yes upgrade
fi

#install wiring pi
apt-get --yes --force-yes install git

git clone git://git.drogon.net/wiringPi
cd wiringPi
./build
cd ..
rm -rf wiringPi

IRIN=23
IROUT=22
RFIN=2
RFOUT=0

echo "\nIn the following steps you can change the pins for receiving and transmitting signals."
echo "The recommended pins are the default pins (only change them if you know what you are doing).\n"
echo "The infrared Pins are mapped after the 'BCM' scheme."
echo "The 433MHz Pins are mapped after the 'wPi' scheme.\n"
echo "Here is the mapping table: (Please ignore the 'Mode' and the 'V' collumn)"
gpio readall

echo "\nEnter the input pin for the infrared receiver (Press enter for default: $IRIN):"
read input
if [  $input ]
then
      IRIN=$input
fi
echo "Input pin is $IRIN!"

echo "Enter the output pin for the infrared transmitter (Press enter for default: $IROUT):"
read input
if [  $input ]
then
      IROUT=$input
fi
echo "Output pin is $IROUT!"

echo "Enter the input pin for the 433MHz receiver (Press enter for default: $RFIN):"
read input
if [  $input ]
then
      RFIN=$input
fi
echo "Input pin is $RFIN!"

echo "Enter the output pin for the 433MHz transmitter (Press enter for default: $RFOUT):"
read input
if [  $input ]
then
      RFOUT=$input
fi
echo "Output pin is $RFOUT!"


#lirc setup
apt-get --yes --force-yes install lirc
echo "lirc_dev" >> /etc/modules
echo "lirc_rpi gpio_in_pin=$IRIN gpio_out_pin=$IROUT" >> /etc/modules
echo "dtoverlay=lirc-rpi,gpio_in_pin=$IRIN,gpio_out_pin=$IROUT" >> /boot/config.txt

echo DRIVER="default" >> /etc/lirc/hardware.conf
echo DEVICE="/dev/lirc0" >> /etc/lirc/hardware.conf
echo MODULES="lirc_rpi" >> /etc/lirc/hardware.conf

cp lircd.conf.template /etc/lirc/lircd.conf

#install rcswitch
git clone https://github.com/sui77/rc-switch.git
sed -i "1i#define PIN $RFOUT" codesend.cpp
sed -i "1i#define PIN $RFIN" sniffer.cpp

make

#install libavahi
apt-get install --yes --force-yes libavahi-compat-libdnssd-dev

#install project components
mkdir ../out

mv codesend ../out/codesend
mv sniffer ../out/sniffer

rm -rf codesend.o
rm -rf sniffer.o
rm -rf rc-switch

curl -sL https://deb.nodesource.com/setup_6.x | bash -
apt-get install --yes --force-yes nodejs
cd ..
npm install
npm install -g typescript
tsc

#install platformio
python -c "$(curl -fsSL https://raw.githubusercontent.com/platformio/platformio/master/scripts/get-platformio.py)"

chmod -R 777  .

#install java
apt-get install --yes --force-yes oracle-java8-jdk

echo "rebooting..."
echo "Successfully installed!"
reboot

