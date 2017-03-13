
# Defines the RPI variable which is needed by rc-switch/RCSwitch.h
CXXFLAGS=-DRPI

all: codesend sniffer
	
codesend: rc-switch/RCSwitch.o codesend.o
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $+ -o $@ -lwiringPi
	
sniffer: rc-switch/RCSwitch.o sniffer.o
	$(CXX) $(CXXFLAGS) $(LDFLAGS) $+ -o $@ -lwiringPi
	
clean:
	$(RM) rc-switch/*.o *.o codesend sniffer

