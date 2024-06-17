import { ChakraProvider, Box, Flex, Heading, Input, Button, Link, extendTheme, useToast } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { AuthContext } from '../../config/AuthContext';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({ config });


function LoginView() {

  const {login, token} = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(()=>{
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleLogin = async () => {
    try {
      const response = await api.post(`/login`, { email, password });

      login(response.data.token);

      navigate("/dashboard");

    } catch (error) {
      toast({
        title: "Login failed.",
        description: "Please check your email and password.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            focusBorderColor="teal.300"
            bg="gray.700"
            color="white"
            _placeholder={{ color: 'gray.500' }}
          />
          <Input
            placeholder="Password"
            type="password"
            mb={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            focusBorderColor="teal.300"
            bg="gray.700"
            color="white"
            _placeholder={{ color: 'gray.500' }}
          />
          <Button
            width="full"
            colorScheme="teal"
            mb={4}
            onClick={handleLogin}
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
