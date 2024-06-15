import React, { useState, useEffect } from 'react';
import {
  ChakraProvider, Box, Flex, Heading, Button, Input, Textarea, Stack, FormControl, FormLabel, Avatar, RadioGroup, Radio, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useColorMode, useColorModeValue
} from '@chakra-ui/react';
import theme from '../../config/theme'; // Tema dosyanızı buraya ekleyin
import { Link } from 'react-router-dom';

function Profile() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, setColorMode } = useColorMode();
  const bg = useColorModeValue('gray.100', 'gray.900');
  const boxBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('black', 'white');

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    profilePhoto: './pp-woman.webp',
    preferredTheme: colorMode,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, profilePhoto: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleThemeChange = (value) => {
    setProfile({ ...profile, preferredTheme: value });
    setColorMode(value); // Change the theme dynamically
  };

  useEffect(() => {
    setColorMode(profile.preferredTheme); // Apply theme on component mount
  }, [profile.preferredTheme, setColorMode]);

  return (
    <ChakraProvider theme={theme}>
      <Flex justify="center" align="center" height="100%" paddingY={5} bg={bg} >
        <Box bg={boxBg} color={textColor} p={6} rounded="md" shadow="md" width={{ base: '90%', md: '60%', lg: '40%' }}>
          <Heading textAlign="center" mb={6}>Profile</Heading>
          <Flex direction="column" align="center" mb={6}>
            <Avatar size="2xl" name="Profile Photo" src={profile.profilePhoto} mb={4} />
            <Button onClick={onOpen}>Change Profile Photo</Button>
          </Flex>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input name="firstName" value={profile.firstName} onChange={handleInputChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input name="lastName" value={profile.lastName} onChange={handleInputChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input type="email" name="email" value={profile.email} onChange={handleInputChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Phone</FormLabel>
              <Input name="phone" value={profile.phone} onChange={handleInputChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input name="address" value={profile.address} onChange={handleInputChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Bio</FormLabel>
              <Textarea name="bio" value={profile.bio} onChange={handleInputChange} />
            </FormControl>
            <FormControl>
              <FormLabel>Preferred Theme</FormLabel>
              <RadioGroup onChange={handleThemeChange} value={profile.preferredTheme}>
                <Stack direction="row">
                  <Radio value="light">Light</Radio>
                  <Radio value="dark">Dark</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
            <Button colorScheme="teal" onClick={() => alert('Profile updated!')}>Update Profile</Button>
            <Button colorScheme="teal" as={Link} to="/dashboard">My Notes</Button>
          </Stack>
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Profile Photo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input type="file" onChange={handlePhotoUpload} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
}

export default Profile;
