async function publishToAppsync(deviceId, message) {
  return `mutation PublishMessageToDevice {
    publishToAppsync(
      deviceId: "${deviceId}",
      message: "${message}"
    ) {
      message
      deviceId
    }
  }`;
}

module.exports = {
  publishToAppsync,
};
