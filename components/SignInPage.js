import React, { useEffect, useState } from 'react';

import { Amplify, Auth } from 'aws-amplify';

import { useRouter } from 'next/router';

import {
  Box,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';

function SignInPage(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInHref, setSignInHref] = useState('');

  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check if the browser has auto-filled values and update the component's state
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');

    if (emailInput) {
      setEmail(emailInput.value);
    }

    if (passwordInput) {
      setPassword(passwordInput.value);
    }

    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : '';
    const url = new URL(`${origin}${router.asPath}`);

    if (url.searchParams.has('redirect_url')) {
      setSignInHref(url.searchParams.get('redirect_url'));
    }
  }, [router.asPath]);

  async function signIn(e) {
    e.preventDefault();
    if (email && password) {
      try {
        const signInResponse = await Auth.signIn(email, password);
        // console.log(signInResponse);
        router.push(signInHref);
      } catch (error) {
        const { name, code } = error;
        if (code === 'NotAuthorizedException') {
          toast({
            title: 'Invalid Email or Password',
            description: 'Your Email Or Password Is Incorrect.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else if (code === 'UserNotFoundException') {
          toast({
            title: 'Account Not Found',
            description: 'An Account Can\'t Be Found With That Email',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          console.log(`error signing in, ${name}, ${code}`);
        }
      }
    }
    setEmail('');
    setPassword('');
  }

  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={4}>
        Sign in to your account
      </Heading>
      <form onSubmit={signIn}>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            mb={2}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb={4}
          />
        </FormControl>
        <Button type="submit" colorScheme="teal">
          Sign In
        </Button>
      </form>
    </Box>
  );
}

export default SignInPage;
