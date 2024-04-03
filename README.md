# iot-hub-website

![Diagram](images/diagram.png)

## Amplify Setup

  1. In order to use Amplify you will need to generate and provide an access token for it to be able to build the frontend. The required scopes are `api`, `read_api` & `read_repository`
  2. When deploying the stack to AWS, it can optionally be configured with a domain in Route53 via the domain params.
  3. When the stack deploys you will then need to trigger an Amplify job to build the web frontend similar to what's done in the **`update-frontend`** job in the `.gitlab-ci.yml` file

## Arduino Setup

1. Find your AWS Account & Region specific `AWS IoT Broker Endpoint` - This can be found here:
<https://console.aws.amazon.com/iot/home#/settings>
![Broker Endpoint Image](images/broker-endpoint.png)

2. create the AWS IoT certificate

```bash
aws iot create-keys-and-certificate --set-as-active
```

The Response will be:

```json
{
  "certificateArn": "arn:aws:iot:{Region}:{AccountId}:cert/2c0f72bf-b230-4c49-9e0e-cbf177926d96",
  "certificateId": "2c0f72bf-b230-4c49-9e0e-cbf177926d96",
  "certificatePem": "-----BEGIN CERTIFICATE-----\n{Certificate}\n-----END CERTIFICATE-----\n",
  "keyPair": {
    "PublicKey": "-----BEGIN PUBLIC KEY-----\n{Public Key Material}\n-----END PUBLIC KEY-----\n",
    "PrivateKey": "-----BEGIN RSA PRIVATE KEY-----\n{Private Key Material}\n-----END RSA PRIVATE KEY-----\n"
  }
}
```

3. Prepare `arduino_secrets.h` file in `arduino/iot-lightbulb/`
   1. Enter your Wifi name & password
   2. Enter your Account & Region specific `AWS IoT Broker Endpoint` from Step 1
   3. Enter a unique identifier for the device.
   4. Enter the complete `Device Certificate` & `Device Private Key` from Step 2
![example arduino secrets](images/arduino_secrets.png)

4. deploy the `template.yaml` including the `certificateArn` parameter from step 2
5. upload the `.ino` file to Arduino using the Arduino IDE
6. The board will now listen on the `${DEVICE_ID}/${INCOMING_TOPIC}` topic for events targeted for this device

## Usage
1. Create a cognito user in the userpool
2. Associate a device to the user in the `devicesTable`
```json
{
 "userId": "${Cognito user sub}",
 "deviceId": "light-bulb",
 "name": "demo light bulb thing",
 "type": "LIGHT_BULB"
}
```
This associated only allows logged in users to interact with their own devices

### Devices before logging in

![Website before logging in](images/devices_before_login.png)

### Login page

![Website before logging in](images/login_page.png)

### Devices after logging in

![Website before logging in](images/devices_after_login.png)
The `On/Off` switch for the device will send a message to the arduino over MQTT to turn the LED On or Off.


### Arduino setup
![Arduino sketch](images/sketch.png)
When the Arduino receives a message over MQTT it will either be told to turn the LED `ON` or `OFF`. The arduino will then set the voltage of the relevant data pin to turn the LED On or Off