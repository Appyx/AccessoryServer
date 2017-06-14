
#include "rc-switch/RCSwitch.h"
#include <stdlib.h>
#include <stdio.h>
     
RCSwitch mySwitch;
 
int main(int argc, char *argv[]) {
     
     if(wiringPiSetup() == -1) {
       printf("wiringPiSetup failed, exiting...");
       return 0;
     }

     int pulseLength = 0;
     if (argv[1] != NULL) pulseLength = atoi(argv[1]);

     mySwitch = RCSwitch();
     if (pulseLength != 0) mySwitch.setPulseLength(pulseLength);
     mySwitch.enableReceive(PIN);
     
     while(1) {
  
      if (mySwitch.available()) {
    
        int value = mySwitch.getReceivedValue();
    
        if (value == 0) {
          printf("");
          fflush(stdout);
        } else {    
          printf("%i", mySwitch.getReceivedValue() );
          fflush(stdout);
        }
    
        mySwitch.resetAvailable();
    
      }
      
  
  }

  exit(0);


}
