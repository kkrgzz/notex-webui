import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  components: {
    MenuButton: {
      baseStyle: (props) => ({
        bg: props.colorMode === 'light' ? 'gray.100' : 'gray.700',
        color: props.colorMode === 'light' ? 'gray.800' : 'white',
        _hover: {
          bg: props.colorMode === 'light' ? 'gray.200' : 'gray.600',
        },
        _focus: {
          boxShadow: 'none',
        },
      }),
    },
  },
});

export default theme;
