import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(null);

    useEffect(()=>{
        const storedToken = localStorage.getItem('token');

        if (storedToken) {
            setToken(storedToken);
        }
    }, []);


    const login = ( token) => {
        localStorage.setItem('token', token);
        setToken(token);
    }

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('encPass');
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );

};