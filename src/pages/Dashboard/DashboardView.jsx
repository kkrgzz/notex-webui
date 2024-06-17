import React, { useContext, useState } from 'react';
import {
    ChakraProvider, Box, Flex, Heading, Button, Input, Textarea, Stack, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, useDisclosure, IconButton, List, ListItem, VStack, HStack, Checkbox,
    CheckboxGroup, Divider, FormControl, FormLabel, Image, Tag, TagLabel, Menu, MenuButton, MenuList, MenuItem, Avatar, Wrap, WrapItem, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Text, useColorMode, Tooltip,
    Spacer,
    useToast
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, CheckIcon, AttachmentIcon, CloseIcon, ChevronDownIcon, SettingsIcon, HamburgerIcon, SunIcon, MoonIcon, CopyIcon } from '@chakra-ui/icons';
import theme from '../../config/theme';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../config/AuthContext';
import api from '../../config/api';

function DashboardView() {
    const [notes, setNotes] = useState([]);
    const [categories, setCategories] = useState(['Personal', 'Work', 'Ideas', 'Travel']);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [urls, setUrls] = useState(['']);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingCategoryValue, setEditingCategoryValue] = useState('');
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [editingNoteIndex, setEditingNoteIndex] = useState(null);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);
    const [copiedUrl, setCopiedUrl] = useState('');

    const { isOpen: isNoteModalOpen, onOpen: onOpenNoteModalBase, onClose: onCloseNoteModalBase } = useDisclosure();
    const { isOpen: isCatModalOpen, onOpen: onOpenCatModal, onClose: onCloseCatModal } = useDisclosure();
    const { isOpen: isDrawerOpen, onOpen: onOpenDrawer, onClose: onCloseDrawer } = useDisclosure();
    const { isOpen: isConfirmModalOpen, onOpen: onOpenConfirmModal, onClose: onCloseConfirmModal } = useDisclosure();
    const { isOpen: isViewModalOpen, onOpen: onOpenViewModal, onClose: onCloseViewModal } = useDisclosure();
    const { colorMode, toggleColorMode } = useColorMode();

    const { logout } = useContext(AuthContext);
    const toast = useToast();

    const onOpenNoteModal = () => {
        setIsEditingNote(false);
        setEditingNoteIndex(null);
        resetNoteFields();
        onOpenNoteModalBase();
    };

    const onCloseNoteModal = () => {
        setIsEditingNote(false);
        setEditingNoteIndex(null);
        onCloseNoteModalBase();
    };

    const handleLogout = async () => {

        await api.post("/logout");

        toast({
            title: "Logged Out.",
            description: "You have successfully logged out.",
            status: "success",
            duration: 2000,
            isClosable: true,
        });

        setTimeout(() => {
            logout();
        }, 2000);

    }

    const handleAddOrUpdateNote = () => {
        const newNote = { title, content, images, urls, categories: selectedCategories.slice(0, 3) };
        if (isEditingNote) {
            const updatedNotes = notes.map((note, index) =>
                index === editingNoteIndex ? newNote : note
            );
            setNotes(updatedNotes);
            setIsEditingNote(false);
            setEditingNoteIndex(null);
        } else {
            setNotes([...notes, newNote]);
        }
        resetNoteFields();
        onCloseNoteModal();
    };

    const handleEditNote = (index) => {
        const note = notes[index];
        setTitle(note.title);
        setContent(note.content);
        setImages(note.images);
        setImagePreviews(note.images.map((image) => URL.createObjectURL(image)));
        setUrls(note.urls);
        setSelectedCategories(note.categories);
        setIsEditingNote(true);
        setEditingNoteIndex(index);
        onOpenNoteModalBase();
    };

    const handleDeleteNote = () => {
        setNotes(notes.filter((_, i) => i !== noteToDelete));
        setNoteToDelete(null);
        onCloseConfirmModal();
    };

    const confirmDeleteNote = (index) => {
        setNoteToDelete(index);
        onOpenConfirmModal();
    };

    const handleViewNote = (index) => {
        setViewingNote(notes[index]);
        onOpenViewModal();
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [...images];
        const newPreviews = [...imagePreviews];

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newImages.push(file);
                newPreviews.push(reader.result);
                setImages(newImages);
                setImagePreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleUrlChange = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const handleAddUrl = () => {
        setUrls([...urls, '']);
    };

    const handleRemoveUrl = (index) => {
        const newUrls = urls.filter((_, i) => i !== index);
        setUrls(newUrls);
    };

    const handleCategoryChange = (selectedCategories) => {
        setSelectedCategories(selectedCategories);
    };

    const resetNoteFields = () => {
        setTitle('');
        setContent('');
        setImages([]);
        setImagePreviews([]);
        setUrls(['']);
        setSelectedCategories([]);
    };

    const handleAddCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setNewCategory('');
        }
    };

    const handleDeleteCategory = (category) => {
        setCategories(categories.filter((cat) => cat !== category));
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setEditingCategoryValue(category);
    };

    const handleSaveCategory = (oldCategory) => {
        setCategories(categories.map((cat) => (cat === oldCategory ? editingCategoryValue : cat)));
        setEditingCategory(null);
        setEditingCategoryValue('');
    };

    return (
        <ChakraProvider theme={theme}>
            <Flex height="100vh" flexDirection="column" bg={colorMode === 'light' ? 'gray.100' : 'gray.900'}>
                <Flex justify="space-between" align="center" bg={colorMode === 'light' ? 'white' : 'gray.800'} p={4}>
                    <IconButton
                        icon={<HamburgerIcon />}
                        variant="outline"
                        aria-label="Open menu"
                        onClick={onOpenDrawer}
                        color={colorMode === 'light' ? 'black' : 'white'}
                        _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.700' }}
                        display={{ base: 'block', md: 'none' }}
                    />
                    <HStack>
                        <Avatar size="sm" name="logo" src='./wizard-hat.png' />
                        <Heading size="md" color="teal.300">NoteX</Heading>
                    </HStack>
                    <HStack spacing={4}>
                        <IconButton
                            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                            variant="outline"
                            aria-label="Toggle color mode"
                            onClick={toggleColorMode}
                            color={colorMode === 'light' ? 'black' : 'white'}
                            _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.700' }}
                        />
                        <Menu>
                            <MenuButton as={Button} bg={colorMode === 'light' ? 'gray.100' : 'gray.700'} color={colorMode === 'light' ? 'gray.800' : 'white'} _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.600' }} rightIcon={<ChevronDownIcon />}>
                                <Avatar size="sm" name="Profile" src="./pp-woman.webp" />
                            </MenuButton>
                            <MenuList>
                                <MenuItem icon={<EditIcon />} as={Link} to="/profile">Edit Profile</MenuItem>
                                <MenuItem onClick={handleLogout} icon={<CloseIcon />} color="red.500">Logout</MenuItem>
                            </MenuList>
                        </Menu>
                    </HStack>
                </Flex>
                <Flex flex="1" direction={{ base: 'column', md: 'row' }}>
                    <Drawer isOpen={isDrawerOpen} placement="left" onClose={onCloseDrawer}>
                        <DrawerOverlay>
                            <DrawerContent bg={colorMode === 'light' ? 'white' : 'gray.800'} color={colorMode === 'light' ? 'black' : 'white'}>
                                <DrawerHeader borderBottomWidth="1px">
                                    Menu
                                </DrawerHeader>
                                <DrawerBody>
                                    <VStack spacing={4}>
                                        <Button colorScheme="teal" width="full" onClick={onOpenNoteModal} leftIcon={<AddIcon />}>
                                            Create Note
                                        </Button>
                                        <Button colorScheme="teal" width="full" onClick={onOpenCatModal} leftIcon={<EditIcon />}>
                                            Manage Categories
                                        </Button>
                                        <Button colorScheme="red" width="full" onClick={handleLogout} leftIcon={<CloseIcon />}>
                                            Logout
                                        </Button>
                                    </VStack>
                                </DrawerBody>
                                <DrawerFooter>
                                    <Button variant="outline" mr={3} onClick={onCloseDrawer}>
                                        Close
                                    </Button>
                                </DrawerFooter>
                            </DrawerContent>
                        </DrawerOverlay>
                    </Drawer>
                    <Box display={{ base: 'none', md: 'block' }} width="250px" bg={colorMode === 'light' ? 'white' : 'gray.800'} p={4} color={colorMode === 'light' ? 'black' : 'white'} shadow="md">
                        <Heading mb={6} size="md" textAlign="center">Menu</Heading>
                        <VStack spacing={4} height="90%">
                            <Button colorScheme="teal" width="full" onClick={onOpenNoteModal} leftIcon={<AddIcon />}>
                                Create Note
                            </Button>
                            <Button colorScheme="teal" width="full" onClick={onOpenCatModal} leftIcon={<EditIcon />}>
                                Manage Categories
                            </Button>
                            <Button colorScheme="red" width="full" onClick={handleLogout} leftIcon={<CloseIcon />}>
                                Logout
                            </Button>
                            <Spacer />
                            <Image src='./staff.png' />
                        </VStack>
                    </Box>
                    <Flex flex="1" direction="column" p={4}>
                        <List spacing={3}>
                            {notes.map((note, index) => (
                                <ListItem key={index} bg={colorMode === 'light' ? 'white' : 'gray.800'} p={4} rounded="md" shadow="md">
                                    <Wrap spacing={4} align="center">
                                        {note.images[0] && (
                                            <WrapItem>
                                                <Image src={URL.createObjectURL(note.images[0])} alt="Note Image" boxSize="100px" objectFit="cover" />
                                            </WrapItem>
                                        )}
                                        <WrapItem flex="1">
                                            <Box>
                                                <Heading size="md" color="teal.300">{note.title}</Heading>
                                                <Box color={colorMode === 'light' ? 'gray.800' : 'gray.300'} isTruncated>{note.content}</Box>
                                                <HStack spacing={2} mt={2}>
                                                    {note.categories.map((category, catIndex) => (
                                                        <Tag size="sm" key={catIndex} colorScheme="teal">
                                                            <TagLabel>{category}</TagLabel>
                                                        </Tag>
                                                    ))}
                                                </HStack>
                                            </Box>
                                        </WrapItem>
                                        <WrapItem>
                                            <HStack spacing={2}>
                                                <IconButton
                                                    icon={<EditIcon />}
                                                    colorScheme="cyan"
                                                    size="lg"
                                                    onClick={() => handleEditNote(index)}
                                                />
                                                <IconButton
                                                    icon={<DeleteIcon />}
                                                    colorScheme="red"
                                                    size="lg"
                                                    onClick={() => confirmDeleteNote(index)}
                                                />
                                                <IconButton
                                                    icon={<AttachmentIcon />}
                                                    colorScheme="teal"
                                                    size="lg"
                                                    onClick={() => handleViewNote(index)}
                                                />
                                            </HStack>
                                        </WrapItem>
                                    </Wrap>
                                </ListItem>
                            ))}
                        </List>
                    </Flex>
                </Flex>
            </Flex>

            {/* Note Modal */}
            <Modal isOpen={isNoteModalOpen} onClose={onCloseNoteModal}>
                <ModalOverlay />
                <ModalContent bg={colorMode === 'light' ? 'white' : 'gray.800'} color={colorMode === 'light' ? 'black' : 'white'}>
                    <ModalHeader>{isEditingNote ? 'Edit Note' : 'Add a new note'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={3}>
                            <Input
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Textarea
                                placeholder="Content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <Box maxHeight="100px" overflowY="auto" border="1px solid #4A5568" borderRadius="md" p={2}>
                                <CheckboxGroup value={selectedCategories} onChange={handleCategoryChange}>
                                    <Stack spacing={1}>
                                        {categories.map((category) => (
                                            <Checkbox key={category} value={category} colorScheme="teal">
                                                {category}
                                            </Checkbox>
                                        ))}
                                    </Stack>
                                </CheckboxGroup>
                            </Box>
                            {urls.map((url, index) => (
                                <HStack key={index} spacing={2}>
                                    <Input
                                        placeholder="URL"
                                        value={url}
                                        onChange={(e) => handleUrlChange(index, e.target.value)}
                                    />
                                    <IconButton
                                        icon={<DeleteIcon />}
                                        colorScheme="red"
                                        onClick={() => handleRemoveUrl(index)}
                                    />
                                </HStack>
                            ))}
                            <Button colorScheme="teal" onClick={handleAddUrl}>
                                Add URL
                            </Button>
                            <FormControl>
                                <FormLabel htmlFor="imageUpload" cursor="pointer" display="flex" alignItems="center">
                                    <AttachmentIcon mr={2} />
                                    Upload Files
                                </FormLabel>
                                <Input
                                    id="imageUpload"
                                    type="file"
                                    multiple
                                    display="none"
                                    onChange={handleImageUpload}
                                />
                            </FormControl>
                            <Flex wrap="wrap" mt={2}>
                                {imagePreviews.map((src, index) => (
                                    <Box key={index} position="relative" mr={2} mb={2}>
                                        <Image src={src} alt={`Image ${index}`} boxSize="100px" objectFit="cover" />
                                        <IconButton
                                            icon={<CloseIcon />}
                                            size="xs"
                                            colorScheme="red"
                                            position="absolute"
                                            top="0"
                                            right="0"
                                            onClick={() => handleRemoveImage(index)}
                                        />
                                    </Box>
                                ))}
                            </Flex>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="teal" mr={3} onClick={handleAddOrUpdateNote}>
                            {isEditingNote ? 'Update Note' : 'Add Note'}
                        </Button>
                        <Button onClick={onCloseNoteModal}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* View Note Modal */}
            <Modal isOpen={isViewModalOpen} onClose={onCloseViewModal}>
                <ModalOverlay />
                <ModalContent bg={colorMode === 'light' ? 'white' : 'gray.800'} color={colorMode === 'light' ? 'black' : 'white'}>
                    <ModalHeader>View Note</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {viewingNote && (
                            <Stack spacing={3}>
                                <Heading size="md" color="teal.300">{viewingNote.title}</Heading>
                                <Text color={colorMode === 'light' ? 'gray.800' : 'gray.300'}>{viewingNote.content}</Text>
                                <Box maxHeight="100px" overflowY="auto" border="1px solid #4A5568" borderRadius="md" p={2}>
                                    <Wrap spacing={1}>
                                        {viewingNote.categories.map((category, catIndex) => (
                                            <Tag size="sm" key={catIndex} colorScheme="teal">
                                                <TagLabel>{category}</TagLabel>
                                            </Tag>
                                        ))}
                                    </Wrap>
                                </Box>
                                <Wrap spacing={2} mt={2}>
                                    {viewingNote.images.map((image, index) => (
                                        <Box key={index}>
                                            <Image src={URL.createObjectURL(image)} alt={`Image ${index}`} boxSize="100px" objectFit="cover" />
                                        </Box>
                                    ))}
                                </Wrap>
                                <Stack spacing={2}>
                                    {viewingNote.urls.map((url, index) => (
                                        <HStack key={index} spacing={2}>
                                            <Text color="teal.300" wordBreak="break-all">{url}</Text>
                                        </HStack>
                                    ))}
                                </Stack>
                            </Stack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="teal" onClick={onCloseViewModal}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Category Modal */}
            <Modal isOpen={isCatModalOpen} onClose={onCloseCatModal}>
                <ModalOverlay />
                <ModalContent bg={colorMode === 'light' ? 'white' : 'gray.800'} color={colorMode === 'light' ? 'black' : 'white'}>
                    <ModalHeader>Manage Categories</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Stack spacing={3}>
                            <Input
                                placeholder="New Category Name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            />
                            <Button colorScheme="teal" onClick={handleAddCategory}>
                                Add Category
                            </Button>
                            <Divider />
                            <Box maxHeight="200px" overflowY="auto" border="1px solid #4A5568" borderRadius="md" p={2}>
                                <Stack spacing={3}>
                                    {categories.map((category) => (
                                        <Flex key={category} justify="space-between" align="center">
                                            {editingCategory === category ? (
                                                <HStack spacing={2} width="full">
                                                    <Input
                                                        value={editingCategoryValue}
                                                        onChange={(e) => setEditingCategoryValue(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <IconButton
                                                        icon={<CheckIcon />}
                                                        colorScheme="teal"
                                                        onClick={() => handleSaveCategory(category)}
                                                    />
                                                </HStack>
                                            ) : (
                                                <>
                                                    <Box>{category}</Box>
                                                    <HStack spacing={2}>
                                                        <IconButton
                                                            icon={<EditIcon />}
                                                            colorScheme="cyan"
                                                            size="sm"
                                                            onClick={() => handleEditCategory(category)}
                                                        />
                                                        <IconButton
                                                            icon={<DeleteIcon />}
                                                            colorScheme="pink"
                                                            size="sm"
                                                            onClick={() => handleDeleteCategory(category)}
                                                        />
                                                    </HStack>
                                                </>
                                            )}
                                        </Flex>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" onClick={onCloseCatModal}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Confirm Delete Modal */}
            <Modal isOpen={isConfirmModalOpen} onClose={onCloseConfirmModal}>
                <ModalOverlay />
                <ModalContent bg={colorMode === 'light' ? 'white' : 'gray.800'} color={colorMode === 'light' ? 'black' : 'white'}>
                    <ModalHeader>Confirm Delete</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text>Are you sure you want to delete this note?</Text>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" mr={3} onClick={handleDeleteNote}>
                            Delete
                        </Button>
                        <Button onClick={onCloseConfirmModal}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </ChakraProvider>
    );
}

export default DashboardView;
