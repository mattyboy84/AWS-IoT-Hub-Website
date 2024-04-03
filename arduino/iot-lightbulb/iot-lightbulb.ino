#include <Arduino.h>
#include <ArduinoBearSSL.h>
#include <ArduinoMqttClient.h>
#include <WiFiNINA.h>
#include <ArduinoECCX08.h>
#include <Arduino_JSON.h>
#include "arduino_secrets.h"

const char ssid[] = SECRET_SSID;
const char pass[] = SECRET_PASS;
const char broker[] = SECRET_BROKER;
const char deviceId[] = DEVICE_ID;
const char outgoingTopicPrefix[] = OUTGOING_TOPIC;
const char incomingTopicSuffix[] = INCOMING_TOPIC;
const char* deviceCertificate  = SECRET_CERTIFICATE;
const char* privateCertificate  = AWS_CERT_PRIVATE;

WiFiClient wifiClient;
BearSSLClient sslClient(wifiClient);
MqttClient mqttClient(sslClient);

const String outgoingTopic = (String(outgoingTopicPrefix) + String(deviceId));
const String incomingTopic = (String(deviceId) + String(incomingTopicSuffix));


unsigned long lastTime = 0;
unsigned long publishFrequency = 5; // publish every x seconds

#define DATA_PIN 6

String LEDState = "OFF";

void setup() {
  pinMode(DATA_PIN, OUTPUT); // Set pin 6 as an output

  Serial.println("setup");
  if (Serial.available()) {
    Serial.begin(9600);
    while (!Serial);
  }

  if (!ECCX08.begin()) {
    Serial.println("No ECCX08 present!");
    while (1);
  }

  ArduinoBearSSL.onGetTime(getTime);
  sslClient.setKey(privateCertificate, deviceCertificate);
  mqttClient.setId(deviceId);
  mqttClient.onMessage(receiveMessage);
}

void loop() {
  mqttClient.poll();
  // digitalWrite(DATA_PIN, LOW);

  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  if (!mqttClient.connected()) {
    // connect over MQTT if not already.
    connectMQTT();
    // the second parameter sets the QoS of the subscription,
    // the library supports subscribing at QoS 0, 1, or 2
    // AWS IoT Core supports 0 & 1
    // Quality of Service (QOS) 0 - Message will be delivered at most once
    // Quality of Service (QOS) 1 - Message will be delivered at least once
    int subscribeQos = 1;
    mqttClient.subscribe(incomingTopic, subscribeQos);
  }
}

unsigned long getTime() {
  // get the current time from the WiFi module  
  return WiFi.getTime();
}

void connectWiFi() {
  Serial.print(String("Attempting to connect to SSID: ") + ssid);

  while (WiFi.begin(ssid, pass) != WL_CONNECTED) {
    // failed try again
    Serial.print(".");
    delay(3000);
  }
  Serial.println("");

  Serial.println(String("Now connected to: ") + ssid);
}

void connectMQTT() {
  Serial.println(String("Attempting to connect to MQTT endpoint: ") + broker);
  
  while (!mqttClient.connect(broker, 8883)) {
    Serial.println(String("MQTT Connection Error: ") + mqttClient.connectError());
    delay(3000);
  }
  
  Serial.println(String("Now connected to: ") + broker);
}

// {
//   "changeState": "ON"
// }
void receiveMessage(int messageSize) {
  // we received a message, print out the topic and contents
  Serial.print("Received a message with topic '");
  Serial.print(mqttClient.messageTopic());
  Serial.print("', duplicate = ");
  Serial.print(mqttClient.messageDup() ? "true" : "false");
  Serial.print(", QoS = ");
  Serial.print(mqttClient.messageQoS());
  Serial.print(", retained = ");
  Serial.print(mqttClient.messageRetain() ? "true" : "false");
  Serial.print("', length ");
  Serial.print(messageSize);
  Serial.println(" bytes:");

  // allocate the memory for the message
  char messageBuffer[messageSize + 1]; // +1 for the null terminator
  
  int bytesRead = 0;
  while (bytesRead < messageSize && mqttClient.available()) {
    messageBuffer[bytesRead++] = (char)mqttClient.read();
  }

  messageBuffer[bytesRead] = '\0';
  
  // time to parse the json
  JSONVar receivedJson = JSON.parse(messageBuffer);
  Serial.println(receivedJson);

  String state = receivedJson["changeState"];

  // there has been a change - turn the LED On or Off
  if (state == "ON") {
    digitalWrite(DATA_PIN, HIGH);
  } else if (state == "OFF") {
    digitalWrite(DATA_PIN, LOW);
  }
  // Send a confirmation message
  LEDState = state;
  JSONVar jsonObject;
  jsonObject["confirmState"] = LEDState;
  String jsonString = JSON.stringify(jsonObject);

  mqttClient.beginMessage(outgoingTopic);
  mqttClient.print(jsonString);
  mqttClient.endMessage();

  Serial.println(state);

  Serial.println();
}