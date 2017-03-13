/**
 * This is an example implementation for a digital sensor (it's a movement sensor in my case).

 * It is quite simple to interface with the server:
 * Just read your values and print them in the following format: '#D7=1#D2=0#A3=577#D8=1' and so on.
 * The Character defines the type (Analog or Digital), the hash defines that there is a value new value available.
 * The order and the timing of the prints is not important.
 *
 *
 * After implementing the sensor you can use the "./upload" script to upload it to the Arduino UNO R3 board.
 * Then you can add the sensor through the iOS-App (use the same pin!).
 *
 * (You can change the debug output of the AppConfig.ts to '3' in order to receive detailed output of the received values)
 * (by starting the Server with './start.sh -d', the Project will be transpiled and you will receive debug output on the cli)
 *
 */


#include "Arduino.h"

#define DIGITAL_PIN 7
#define ANALOG_PIN 3

int analogValue=500;

void setup()
{
  Serial.begin(9600); //don't forget to change the AppConfig.ts and to re-transpile after changing this value.
  pinMode(DIGITAL_PIN,INPUT);
}

void loop()
{
  //NOTE: Serial.println() will not work because the newLine character will not be interpreted correctly on the server side.
  Serial.print("#D");
  Serial.print(DIGITAL_PIN);
  Serial.print("=");
  Serial.print(digitalRead(DIGITAL_PIN));
  delay(2000); //just for avoiding to much debug output

  Serial.print("#A");
  Serial.print(ANALOG_PIN);
  Serial.print("=");
  Serial.print(analogValue+=10);
  delay(2000);


}
