import { ChakraProvider, Box, Flex, Heading, Input, Button, Link, extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

function LoginView() {
  return (
    <ChakraProvider theme={theme}>
      <Flex
        height="100vh"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(to-r, gray.700, gray.900)"
      >
        <Box
          bg="gray.800"
          p={6}
          rounded="md"
          shadow="lg"
          width="100%"
          maxWidth="md"
        >
          <Heading as="h1" mb={6} textAlign="center" color="teal.300">
            Login
          </Heading>
          <Input
            placeholder="Email"
            type="email"
            mb={3}
            focusBorderColor="teal.300"
            bg="gray.700"
            color="white"
            _placeholder={{ color: 'gray.500' }}
          />
          <Input
            placeholder="Password"
            type="password"
            mb={6}
            focusBorderColor="teal.300"
            bg="gray.700"
            color="white"
            _placeholder={{ color: 'gray.500' }}
          />
          <Button
            width="full"
            colorScheme="teal"
            mb={4}
          >
            Login
          </Button>
          <Flex justifyContent="space-between">
            <Link color="teal.300" href="#">
              Forgot Password?
            </Link>
            <Link color="teal.300" href="#">
              Sign Up
            </Link>
          </Flex>
        </Box>
      </Flex>
    </ChakraProvider>
  );
}

export default LoginView;
