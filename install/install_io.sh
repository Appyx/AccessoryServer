#!/bin/bash

echo "installing wiring-pi"
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build
cd ..
rm -rf wiringPi

IRIN=15
IROUT=18
RFIN=2
RFOUT=0


echo "Do you want to install the components for transmitting and receiving infrared signals?"
echo "Enter 'skip' if you want to skip this step, otherwise press any key."
read answer
if [[  $answer != "skip" ]]
then
echo "\nIn the following steps you can change the pins for receiving and transmitting signals."
echo "The recommended pins are the default pins (only change them if you know what you are doing).\n"
echo "The infrared Pins are mapped after the 'BCM' scheme."
echo "Here is the mapping table: (Please ignore the 'Mode' and the 'V' column)"
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


echo "installing gpio-reflect"
git clone https://github.com/Appyx/gpio-reflect.git
cd gpio-reflect
chmod +x build.sh
./build.sh
cp gpio-reflect.ko /lib/modules/$(uname -r)/kernel/drivers/
echo gpio-reflect >> /etc/modules
echo "options gpio-reflect in=$IRIN out=$IROUT" > /etc/modprobe.d/gpio-reflect.conf
depmod
cd ..
rm -rf gpio-reflect
fi

echo "Do you want to install the components for transmitting and receiving infrared signals?"
echo "Enter 'skip' if you want to skip this step, otherwise press any key."
read answer
if [[  $answer != "skip" ]]
then
echo "\nIn the following steps you can change the pins for receiving and transmitting signals."
echo "The recommended pins are the default pins (only change them if you know what you are doing).\n"
echo "The 433MHz Pins are mapped after the 'wPi' scheme.\n"
echo "Here is the mapping table: (Please ignore the 'Mode' and the 'V' column)"
gpio readall

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
echo "installing rc-switch"
git clone https://github.com/sui77/rc-switch.git
sed -i "1i#define PIN $RFOUT" codesend.cpp
sed -i "1i#define PIN $RFIN" sniffer.cpp
make
echo "$(tail -n +2 codesend.cpp)" > codesend.cpp
echo "$(tail -n +2 sniffer.cpp)" > sniffer.cpp
mkdir ../bin
mv codesend ../bin/codesend
mv sniffer ../bin/sniffer
rm -rf codesend.o
rm -rf sniffer.o
rm -rf rc-switch
fi
