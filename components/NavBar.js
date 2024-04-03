import React, { useEffect, useState } from 'react';

import {
  Storage,
  Hub,
  Auth,
  Amplify,
} from 'aws-amplify';

import { useRouter } from 'next/router';

import {
  Text,
  Flex,
  Input,
  Button,
  Image,
  Link,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Icon,
  useToast,
} from '@chakra-ui/react';

import {
  CgSoftwareUpload,
} from 'react-icons/cg';

function Navbar() {
  const [authUser, setAuthUser] = useState(null);
  const [signInHref, setSignInHref] = useState('');

  const [identityPoolId, setIdentityPoolId] = useState('');
  const [userPoolId, setUserPoolId] = useState('');

  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : '';
    const url = new URL(`${origin}${router.asPath}`);

    if (url.searchParams.has('redirect_url')) {
      setSignInHref(`/signIn?redirect_url=${encodeURIComponent(url.searchParams.get('redirect_url'))}`);
    } else {
      setSignInHref(`/signIn?redirect_url=${encodeURIComponent(router.asPath)}`);
    }
  }, [router.asPath]);

  async function signOut() {
    setAuthUser(null);
  }

  async function attemptSignOut() {
    try {
      await Auth.signOut({ global: true });
    } catch (error) {
      const { name, code } = error;
      if (name === 'NotAuthorizedException' || name === 'UserNotFoundException') {
        signOut();
      } else {
        console.error('Error signing out:', error);
        console.log(`name: ${error.name}`);
        console.log(`code: ${error.code}`);
      }
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentSession = await Auth.currentSession();
        const currentUserInfo = await Auth.currentUserInfo();
        const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();

        setAuthUser(currentAuthenticatedUser);

        setIdentityPoolId(currentUserInfo.id.split(':')[1]);
        setUserPoolId(currentUserInfo.username);
      } catch (error) {
        setAuthUser(null);
      }
    };

    checkUser(); // Check if the user is still authenticated across refreshes

    const listener = Hub.listen('auth', ({ payload }) => {
      const { event } = payload;

      console.log(`Hub received event: ${event}`);
      console.log(payload);
      if (event === 'signIn' || event === 'autoSignIn') {
        const user = payload.data;
        setAuthUser(user);
      } else if (event === 'signIn_failure' || event === 'autoSignIn_failure') {
        // do something?
      }
      if (event === 'signOut') {
        signOut();
      }
    });

    return () => {
      listener();
    };
  }, []);

  return (
    <Flex bg="blue.500" p={4} alignItems="center">
      <Link href="/">
        <Image
          src="/favicon.png" // Replace with the path to your logo image
          alt="Logo"
          boxSize="64px" // Adjust the size as needed
          mr={2} // Margin to separate the logo from the input
        />
      </Link>

      <Input
        flex="1"
        placeholder="Search..."
        size="md"
        variant="filled"
      />
      {authUser ? (
        <Box ml={2}>
          <Menu>
            <MenuButton
              as={Button}
              size="s"
              bg="transparent"
              _hover={{ bg: 'transparent' }}
              _active={{ bg: 'transparent' }}
            >
              <Avatar
                size="md"
                name={authUser.attributes.preferred_username}
                // name={identityPoolId}
                bg="purple.300"
              />
            </MenuButton>
          </Menu>
          <Button
            colorScheme="red"
            ml={2}
            onClick={attemptSignOut}
          >
            Sign Out
          </Button>
        </Box>
      )
        : (
          <>
            <Link href={signInHref}>
              <Button
                colorScheme="teal"
                ml={2}
              >
                Sign In
              </Button>
            </Link>
          </>
        )}
    </Flex>
  );
}

export default Navbar;
