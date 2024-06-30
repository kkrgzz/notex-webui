import { createContext, useEffect, useState } from "react";

export const EncryptionContext = createContext();

export const EncryptionProvider = ({ children }) => {
    const [encPassword, setEncPassword] = useState(null);

    useEffect(() => {
        const storedEncPass = localStorage.getItem('encPass');

        if (storedEncPass) {
            setEncPassword(storedEncPass);
        }
    }, []);

    const setEncPass = (pass) => {
        localStorage.setItem('encPass', pass);
        setEncPassword(pass);
    }

    const remEncPass = () => {
        localStorage.removeItem('encPass');
        setEncPassword(null);
    }

    return (
        <EncryptionContext.Provider value={{ encPassword, setEncPass, remEncPass }}>
            {children}
        </EncryptionContext.Provider>
    );
}