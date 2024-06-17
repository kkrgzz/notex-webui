import { useContext } from 'react';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import DashboardView from './pages/Dashboard/DashboardView';
import LoginView from './pages/Login/LoginView'
import ProfileView from './pages/Profile/ProfileView';

import theme from './config/theme';
import { BrowserRouter, Navigate, Route, Router, Routes } from 'react-router-dom';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import LogoutView from './pages/Logout.jsx/LogoutView';
import { AuthContext, AuthProvider } from './config/AuthContext';

function ProtectedRoute ({ children }) {

  const { token } = useContext(AuthContext);
  if (!token) {
    return <Navigate to="/login" />
  }
  return children;
}

function App() {
  
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/logout" element={<ProtectedRoute><LogoutView /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
          <Route path="/*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>

    </ChakraProvider>
  );
}

export default App;
