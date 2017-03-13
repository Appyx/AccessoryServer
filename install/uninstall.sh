#uninstall lirc
apt-get --yes --force-yes remove lirc

sed -i '/lirc_dev/d' /etc/modules
sed -i -E '/lirc_rpi gpio_in_pin=[0-9]+ gpio_out_pin=[0-9]+/d' /etc/modules
sed -i -E '/dtoverlay=lirc-rpi,gpio_in_pin=[0-9]+,gpio_out_pin=[0-9]+/d' /boot/config.txt

rm -rf /etc/lirc

#uninstall wiring pi
git clone git://git.drogon.net/wiringPi
cd wiringPi
./build uninstall
cd ..
rm -rf wiringPi

apt-get --yes --force-yes remove git

#uninstall node components
npm uninstall -g typescript
cd ..
rm -rf node_modules
apt-get --yes --force-yes remove nodejs

rm -rf out

#uninstall project components
sed -i -E '/#define PIN [0-9]+/d' codesend.cpp
sed -i -E '/#define PIN [0-9]+/d' sniffer.cpp

echo "Please reconnect manually per ssh after the reboot."
echo "rebooting..."
echo "Successfully uninstalled!"
reboot
