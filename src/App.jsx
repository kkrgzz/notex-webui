import { useContext, useEffect } from 'react';

import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import DashboardView from './pages/Dashboard/DashboardView';
import LoginView from './pages/Login/LoginView'
import ProfileView from './pages/Profile/ProfileView';

import theme from './config/theme';
import { BrowserRouter, Navigate, Route, Router, Routes, useNavigate } from 'react-router-dom';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import LogoutView from './pages/Logout.jsx/LogoutView';
import { AuthContext, AuthProvider } from './config/AuthContext';
import './style/main.scss';
import { EncryptionContext, EncryptionProvider } from './config/EncryptionContext';
import AuthView from './pages/AuthView/AuthView';

function ProtectedRoute({ children }) {

  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { encPassword } = useContext(EncryptionContext);

  useEffect(() => {

    if (!token) {
      navigate("/login");
    } else if (!encPassword) {
      
      navigate("/auth");
    } else {
      
      navigate("/dashboard");
    }

  }, []);

  return children;
}

function App() {

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      <AuthProvider>
        <EncryptionProvider>
          <Routes>
            <Route path="/" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
            <Route path="/logout" element={<ProtectedRoute><LogoutView /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/auth" element={<AuthView />} />
            <Route path="/*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
          </Routes>
        </EncryptionProvider>
      </AuthProvider>

    </ChakraProvider>
  );
}

export default App;
