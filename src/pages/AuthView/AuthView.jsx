import React, { useContext, useEffect, useState } from 'react'
import { ChakraProvider, Box, Flex, Heading, Input, Button, Link, extendTheme, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../config/AuthContext';
import { EncryptionContext } from '../../config/EncryptionContext';
const config = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
};

const theme = extendTheme({ config });


function AuthView() {

    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { encPassword, setEncPass } = useContext(EncryptionContext);
    const [password, setPassword] = useState('');
    const toast = useToast();

    useEffect(()=>{
        if (!token) {
            navigate('/login');
        } else {
            toast({
                title: "Login successfull.",
                description: "Please enter your security key.",
                status: "success",
                duration: 2000,
                isClosable: true,
              });
            if (encPassword) {
                navigate('/dashboard');
                //console.log(`token: ${token} | encPassword: ${encPassword}`)
            } else{
                toast({
                    title: "Security Key Missing.",
                    description: "Please enter your security key.",
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                  });
                //console.log(`token: ${token} | encPassword: ${encPassword}`)
            }
        }
        
    }, [token, encPassword, navigate]);

    const handleLogin = () => {
        setEncPass(password);
    }

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
                        Enter Encryption Password
                    </Heading>
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
                </Box>
            </Flex>
        </ChakraProvider>
    )
}

export default AuthView