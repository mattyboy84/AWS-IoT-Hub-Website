export function listDevices(userId) {
  return `query listDevices {
    listDevices(userId: "${userId}") {
      deviceId
      name
      type
      userId
    }
  }`;
}

export function publishToDevice(deviceId, state) {
  return `mutation publishToDevice {
    publishToDevice(input: {
      deviceId: "${deviceId}",
      message: "{\\"changeState\\":\\"${state}\\"}"
    }) {
      message
      traceId
    }
  }`;
}
