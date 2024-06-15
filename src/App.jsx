
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import DashboardView from './pages/Dashboard/DashboardView';
import LoginView from './pages/Login/LoginView'
import ProfileView from './pages/Profile/ProfileView';

import theme from './config/theme';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import LogoutView from './pages/Logout.jsx/LogoutView';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/logout" element={<LogoutView />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </ChakraProvider>
  );
}

export default App;
