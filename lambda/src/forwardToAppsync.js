const fetch = require('node-fetch');

const {
  X_API_KEY,
  X_API_URL,
} = require('../config');

const {
  publishToAppsync,
} = require('../queries');

/*
{
  "confirmState": "OFF",
  "deviceId": "light-bulb"
}
*/

// The device publishes a confirmation message when its changes state. This forwards that to Appsync
async function handler(event, context) {
  console.log(event);

  const { deviceId } = event;

  const body = await publishToAppsync(deviceId, Buffer.from(JSON.stringify(event), 'utf8').toString('base64'));
  console.log(body);

  const requestBody = {
    query: body,
    variables: {},
  };
  const res = await fetch(X_API_URL, {
    method: 'POST',
    headers: {
      'X-API-KEY': X_API_KEY,
    },
    body: JSON.stringify(requestBody),
  });
  const response = await res.text();
  console.log(response);
}

module.exports = {
  handler,
};
