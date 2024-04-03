import React, { useState, useEffect } from 'react';
import {
  API,
  Auth,
  graphqlOperation,
} from 'aws-amplify';

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Switch,
} from '@chakra-ui/react';

import {
  listDevices,
  publishToDevice,
} from '../../graphql/queries';

// Define device types
const DeviceType = {
  LIGHT_BULB: 'Light Bulb',
  THERMOSTAT: 'Thermostat',
  CAMERA: 'Camera',
};

function DeviceControls({ type, onToggle }) {
  switch (type) {
    case 'LIGHT_BULB':
      return (
        <Switch
          size="md"
          colorScheme="green"
          onChange={onToggle}
        />
      );
    default:
      return null; // Return null if no specific controls are needed for the type
  }
}

function DeviceItem({
  userId,
  deviceId,
  name,
  type,
}) {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const deviceTypeDescription = DeviceType[type] || 'Unknown';

  const handleToggle = async (event) => {
    const isChecked = event.target.checked;
    console.log(`Device ${deviceId} is now ${isChecked ? 'on' : 'off'}`);

    if (isChecked) {
      console.log(publishToDevice(deviceId, 'ON'));
      const response = await API.graphql(
        graphqlOperation(
          publishToDevice(deviceId, 'ON'),
          {},
        ),
      );
    } else {
      const response = await API.graphql(
        graphqlOperation(
          publishToDevice(deviceId, 'OFF'),
          {},
        ),
      );
    }
  };

  return (
    <HStack
      p={4}
      bg={bgColor}
      borderRadius="md"
      w="full"
      justifyContent="space-between"
      alignItems="center"
    >
      <VStack align="start">
        <Text fontWeight="bold" color={textColor}>
          {name || 'Unnamed Device'}
        </Text>
        <Text fontSize="sm" color={textColor}>
          Device ID: {deviceId}
        </Text>
        <Badge colorScheme="green">{deviceTypeDescription}</Badge>
      </VStack>
      <HStack>
        <DeviceControls type={type} onToggle={handleToggle} />
        <Badge colorScheme="blue">User: {userId}</Badge>
      </HStack>
    </HStack>
  );
}

function DevicesPage() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        // Will error if there's no current session
        const currentSession = await Auth.currentUserInfo();
        const { sub } = currentSession.attributes;
        console.log(sub);
        const response = await API.graphql(
          graphqlOperation(
            listDevices(sub),
            {},
          ),
        );
        console.log(response);
        const { data } = response;
        const newDevices = data.listDevices;

        setDevices([...newDevices]);
      } catch (error) {
        if (error === 'No current user') {
          setDevices([]);
        } else {
          console.error('Error fetching devices:', error);
        }
      }
    };

    fetchDevices();
  }, []);

  return (
    <Box>
      {devices.map((device, index) => (
        <DeviceItem
          key={device.deviceId}
          userId={device.userId}
          deviceId={device.deviceId}
          name={device.name}
          type={device.type}
        />
      ))}
    </Box>
  );
}

export default DevicesPage;
