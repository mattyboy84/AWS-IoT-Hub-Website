#define SECRET_SSID "WiFi Name"
#define SECRET_PASS "WiFi Passowrd"

#define SECRET_BROKER "broker-ats.iot.${AWS::Region}.amazonaws.com"

#define DEVICE_ID "light-bulb" // A unique identifier - must match the test thing name in the template.yaml

#define OUTGOING_TOPIC "outgoing/" // outgoing to AWS

#define INCOMING_TOPIC "/incoming" // incoming to the device


// Device Certificate
const char SECRET_CERTIFICATE[] = R"(
-----BEGIN CERTIFICATE-----
{Certificate}
-----END CERTIFICATE-----
)";

// Device Private Key
const char AWS_CERT_PRIVATE[] = R"(
-----BEGIN RSA PRIVATE KEY-----
{Device Private Key}
-----END RSA PRIVATE KEY-----
)";
