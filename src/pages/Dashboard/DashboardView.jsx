import React, { useContext, useEffect, useState } from 'react';
import {
    ChakraProvider, Box, Flex, Heading, Button, Input, Textarea, Stack, Modal, ModalOverlay, ModalContent, ModalHeader,
    ModalCloseButton, ModalBody, ModalFooter, useDisclosure, IconButton, List, ListItem, VStack, HStack, Checkbox,
    CheckboxGroup, Divider, FormControl, FormLabel, Image, Tag, TagLabel, Menu, MenuButton, MenuList, MenuItem, Avatar, Wrap, WrapItem, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Text, useColorMode, Tooltip,
    Spacer,
    useToast,
    Select,
    Spinner
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, CheckIcon, AttachmentIcon, CloseIcon, ChevronDownIcon, SettingsIcon, HamburgerIcon, SunIcon, MoonIcon, CopyIcon, Search2Icon } from '@chakra-ui/icons';
import theme from '../../config/theme';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../config/AuthContext';
import api from '../../config/api';
import ReactQuill from 'react-quill';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css'; // Import the styles
import EncryptionService from '../../config/EncryptionService';
import { EncryptionContext } from '../../config/EncryptionContext';

function DashboardView() {
    const [notes, setNotes] = useState([]);
    const [categories, setCategories] = useState([]);
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
    const [noteToDeleteFromArray, setNoteToDeleteFromArray] = useState(null);
    const [viewingNote, setViewingNote] = useState(null);

    const [encryptedTitle, setEncryptedTitle] = useState('');
    const [encryptedContent, setEncryptedContent] = useState('');

    const [isNoteLoading, setIsNoteLoading] = useState(true);
    const { isOpen: isNoteModalOpen, onOpen: onOpenNoteModalBase, onClose: onCloseNoteModalBase } = useDisclosure();
    const { isOpen: isCatModalOpen, onOpen: onOpenCatModal, onClose: onCloseCatModal } = useDisclosure();
    const { isOpen: isDrawerOpen, onOpen: onOpenDrawer, onClose: onCloseDrawer } = useDisclosure();
    const { isOpen: isConfirmModalOpen, onOpen: onOpenConfirmModal, onClose: onCloseConfirmModal } = useDisclosure();
    const { isOpen: isViewModalOpen, onOpen: onOpenViewModal, onClose: onCloseViewModal } = useDisclosure();
    const { colorMode, toggleColorMode } = useColorMode();

    const encrpytionService = new EncryptionService();
    const image_base_url = import.meta.env.VITE_API_IMAGE_URL;
    const { logout } = useContext(AuthContext);
    const { encPassword } = useContext(EncryptionContext);
    const toast = useToast();


    useEffect(() => {
        const fetchData = async () => {
            setIsNoteLoading(true);
            try {
                const [categoriesResponse, notesResponse] = await Promise.all([
                    api.get('/categories'),
                    api.get('/notes')
                ]);

                setCategories(categoriesResponse.data);
                setNotes(notesResponse.data);

                /*
                notesResponse.data.forEach((note, index) => {
                    console.log(`Note ${index}:`, note);
                });
                */
                setNotes(notesResponse.data);

                setIsNoteLoading(false);
            } catch (error) {
                toast({
                    title: "Error loading data.",
                    description: "There was an error loading categories or notes.",
                    status: "error",
                    duration: 2000,
                    isClosable: true,
                });
            }
        }

        fetchData();
    }, []);

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

    const handleAddNote = async () => {

        // Encrypt the data
        const encTitle = encrpytionService.encrypt(title, encPassword);
        const encContent = encrpytionService.encrypt(content, encPassword);

        const formData = new FormData();
        formData.append('title', encTitle);
        formData.append('content', encContent);


        // Kategorileri ekleme
        selectedCategories.forEach((category) => {
            formData.append('categories[]', category);
        });

        // URL'leri ekleme
        urls.forEach((url) => {
            formData.append('urls[]', url);
        });

        // Resimleri ekleme
        images.forEach((image) => {
            formData.append('images[]', image);
        });

        try {
            const response = await api.post('/notes', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setNotes([...notes, response.data]);

            resetNoteFields();
            onCloseNoteModal();
            toast({
                title: "Note created.",
                description: "Your note has been created successfully.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error creating note.",
                description: error.response?.data?.message || "There was an error creating your note.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        }

    };


    const handleUpdateNote = async () => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);

        // Kategorileri ekleme
        selectedCategories.forEach((category) => {
            formData.append('categories[]', category);
        });

        // URL'leri ekleme
        urls.forEach((url) => {
            formData.append('urls[]', url);
        });

        // Tüm resimleri ekle (mevcut ve yeni) based on a condition
        images.forEach((image) => {
            if (image.file) {
                formData.append('images[]', image.file);
            } else if (image.id) {
                formData.append('images[]', image.file_path);
            }
        });

        try {
            const response = await api.post(`/notes/${notes[editingNoteIndex].id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-HTTP-Method-Override': 'PUT' // Laravel PUT methodunu desteklemesi için
                }
            });
            const updatedNotes = notes.map((note, index) =>
                index === editingNoteIndex ? response.data : note
            );
            setNotes(updatedNotes);
            setIsEditingNote(false);
            setEditingNoteIndex(null);

            resetNoteFields();
            onCloseNoteModal();
            toast({
                title: "Note updated.",
                description: "Your note has been updated successfully.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error updating note.",
                description: error.response?.data?.message || "There was an error updating your note.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        }
    };




    const handleEditNote = (index) => {
        const note = notes[index];
        setTitle(note.title);
        setContent(note.content);
        setImages(note.images.map((image) => ({
            file_path: image.file_path,
            id: image.id
        })));
        setImagePreviews(note.images.map((image) => `${image_base_url}${image.file_path}`));
        setUrls(note.urls.map(url => url.url));
        setSelectedCategories(note.categories.map(category => category.id));
        setIsEditingNote(true);
        setEditingNoteIndex(index);
        onOpenNoteModalBase();
    };



    const handleNoteCategoryChange = (event) => {
        const value = parseInt(event.target.value); // ID'yi integer olarak al
        setSelectedCategories((prevSelectedCategories) => {
            if (prevSelectedCategories.includes(value)) {
                return prevSelectedCategories.filter((category) => category !== value);
            } else {
                return [...prevSelectedCategories, value];
            }
        });
    };


    const handleDeleteNote = async () => {

        await api.delete(`/notes/${noteToDelete}`);
        toast({
            title: "Note deleted.",
            description: "Your note has been deleted successfully.",
            status: "success",
            duration: 2000,
            isClosable: true,
        });

        setNotes(notes.filter((_, i) => i !== noteToDeleteFromArray));

        setNoteToDelete(null);
        setNoteToDeleteFromArray(null);
        onCloseConfirmModal();
    };

    const confirmDeleteNote = (index, arrayIndex) => {
        setNoteToDelete(index);
        setNoteToDeleteFromArray(arrayIndex);
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
        const imageToRemove = images[index];

        if (imageToRemove.id) {
            // Sunucudan silinmesi gereken mevcut bir resim
            api.delete(`/images/${imageToRemove.id}`)
                .then(() => {
                    const newImages = images.filter((_, i) => i !== index);
                    const newPreviews = imagePreviews.filter((_, i) => i !== index);
                    setImages(newImages);
                    setImagePreviews(newPreviews);
                    toast({
                        title: "Image removed.",
                        description: "The image has been removed successfully.",
                        status: "success",
                        duration: 2000,
                        isClosable: true,
                    });
                })
                .catch((error) => {
                    toast({
                        title: "Error removing image.",
                        description: "There was an error removing the image.",
                        status: "error",
                        duration: 2000,
                        isClosable: true,
                    });
                });
        } else {
            // Yalnızca state'den silinmesi gereken yeni bir resim
            const newImages = images.filter((_, i) => i !== index);
            const newPreviews = imagePreviews.filter((_, i) => i !== index);
            setImages(newImages);
            setImagePreviews(newPreviews);
        }
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

    const handleCategoryChange = (event) => {
        const value = event.target.value;
        setSelectedCategories((prevSelectedCategories) => {
            if (prevSelectedCategories.includes(value)) {
                return prevSelectedCategories.filter((category) => category !== value);
            } else {
                return [...prevSelectedCategories, value];
            }
        });
    };



    const resetNoteFields = () => {
        setTitle('');
        setContent('');
        setImages([]);
        setImagePreviews([]);
        setUrls(['']);
        setSelectedCategories([]);
    };

    const handleAddCategory = async () => {
        if (newCategory && !categories.includes(newCategory)) {
            try {
                const response = await api.post('/categories', { name: newCategory });
                setCategories([...categories, response.data]);
                setNewCategory('');
                toast({
                    title: "Category added.",
                    description: "The new category has been added successfully.",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                });
            } catch (error) {
                toast({
                    title: "Error adding category.",
                    description: "There was an error adding the category.",
                    status: "error",
                    duration: 2000,
                    isClosable: true,
                });
            }
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            await api.delete(`/categories/${categoryId}`);
            setCategories(categories.filter((category) => category.id !== categoryId));
            toast({
                title: "Category deleted.",
                description: "The category has been deleted successfully.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error deleting category.",
                description: "There was an error deleting the category.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        }
    };


    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setEditingCategoryValue(category);
    };

    const handleSaveCategory = async (categoryId, newName) => {
        try {
            await api.put(`/categories/${categoryId}`, { name: newName });
            setCategories(categories.map((category) =>
                category.id === categoryId ? { ...category, name: newName } : category
            ));
            setEditingCategory(null);
            setEditingCategoryValue('');
            toast({
                title: "Category updated.",
                description: "The category has been updated successfully.",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: "Error updating category.",
                description: "There was an error updating the category.",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
        }
    };


    return (
        <ChakraProvider theme={theme}>
            <Flex height="100%" flexDirection="column" bg={colorMode === 'light' ? 'gray.100' : 'gray.900'}>
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
                            {isNoteLoading ? (
                                <Flex justify="center" align="center" height="100%">
                                    <Spinner
                                        thickness='4px'
                                        speed='0.65s'
                                        emptyColor='gray.200'
                                        color='blue.500'
                                        size='xl'
                                    />
                                </Flex>
                            ) : (
                                <div>
                                    {notes.map((note, index) => (
                                        <ListItem key={index} bg={colorMode === 'light' ? 'white' : 'gray.800'} p={4} rounded="md" shadow="md">
                                            <Wrap spacing={4} align="center">
                                                {note.images[0] && (
                                                    <WrapItem>
                                                        <Image src={`${image_base_url}${note.images[0].file_path}`} alt="Note Image" boxSize="100px" objectFit="cover" />
                                                    </WrapItem>
                                                )}
                                                <WrapItem flex="1">
                                                    <Box>
                                                        <Heading size="md" color="teal.300">
                                                            {note.title.length > 24 ? `${note.title.substring(0, 24)}...` : note.title}
                                                        </Heading>
                                                        <HStack spacing={2} mt={2}>
                                                            {note.categories.slice(0, 3).map((category) => (
                                                                <Tag size="sm" key={category.id} colorScheme="teal">
                                                                    <TagLabel>{category.name}</TagLabel>
                                                                </Tag>
                                                            ))}
                                                        </HStack>
                                                    </Box>
                                                </WrapItem>
                                                <WrapItem>
                                                    <HStack spacing={2}>
                                                        <IconButton
                                                            icon={<Search2Icon />}
                                                            colorScheme="teal"
                                                            size="lg"
                                                            onClick={() => handleViewNote(index)}
                                                        />
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
                                                            onClick={() => confirmDeleteNote(note.id, index)}
                                                        />
                                                    </HStack>
                                                </WrapItem>
                                            </Wrap>
                                        </ListItem>
                                    ))}
                                </div>
                            )}
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
                            <ReactQuill
                                value={content}
                                onChange={setContent}
                            />
                            <Box maxHeight="100px" overflowY="auto" border="1px solid #4A5568" borderRadius="md" p={2}>
                                {categories.map((category) => (
                                    <div key={category.id} className='form-check'>
                                        <input
                                            className='form-check-input'
                                            type='checkbox'
                                            name='categories'
                                            id={category.name}
                                            value={category.id}
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={handleNoteCategoryChange}
                                        />
                                        <label
                                            className='form-check-label'
                                            htmlFor={category.name}>{category.name}</label>
                                    </div>
                                ))}
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
                                        <Image src={src.startsWith('data:') ? src : src} alt={`Image ${index}`} boxSize="100px" objectFit="cover" />
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
                        <Button colorScheme="teal" mr={3} onClick={isEditingNote ? handleUpdateNote : handleAddNote}>
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
                                <Wrap spacing={1}>
                                    {viewingNote.categories.map((category, catIndex) => (
                                        <Tag size="sm" key={catIndex} colorScheme="teal">
                                            <TagLabel>{category.name}</TagLabel>
                                        </Tag>
                                    ))}
                                </Wrap>
                                <Box p={2}>
                                    <Text
                                        className='note-content-text'
                                        color={colorMode === 'light' ? 'gray.800' : 'gray.300'}
                                        dangerouslySetInnerHTML={
                                            { __html: DOMPurify.sanitize(viewingNote.content) }
                                        } />
                                </Box>
                                <Wrap spacing={2} mt={2}>
                                    {viewingNote.images.map((image, index) => (
                                        <Box key={index}>
                                            <Image src={`${image_base_url}${image.file_path}`} alt={`Image ${index}`} boxSize="100px" objectFit="cover" />
                                        </Box>
                                    ))}
                                </Wrap>
                                <Stack spacing={2}>
                                    {viewingNote.urls.map((url, index) => (
                                        <Box key={index} maxHeight="100px" overflowY="auto" border="1px solid #4A5568" borderRadius="md" p={2}>
                                            <HStack key={index} spacing={2}>
                                                <Text color={colorMode === 'light' ? 'gray.800' : 'gray.300'} wordBreak="break-all">{url.url}</Text>
                                            </HStack>
                                        </Box>

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
                                        <Flex key={category.id} justify="space-between" align="center">
                                            {editingCategory === category.id ? (
                                                <HStack spacing={2} width="full">
                                                    <Input
                                                        value={editingCategoryValue}
                                                        onChange={(e) => setEditingCategoryValue(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <IconButton
                                                        icon={<CheckIcon />}
                                                        colorScheme="teal"
                                                        onClick={() => handleSaveCategory(category.id, editingCategoryValue)}
                                                    />
                                                </HStack>
                                            ) : (
                                                <>
                                                    <Box>{category.name}</Box>
                                                    <HStack spacing={2}>
                                                        <IconButton
                                                            icon={<EditIcon />}
                                                            colorScheme="cyan"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingCategory(category.id);
                                                                setEditingCategoryValue(category.name);
                                                            }}
                                                        />
                                                        <IconButton
                                                            icon={<DeleteIcon />}
                                                            colorScheme="pink"
                                                            size="sm"
                                                            onClick={() => handleDeleteCategory(category.id)}
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
