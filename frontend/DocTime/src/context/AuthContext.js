import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load saved token on app startup
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const savedToken = await SecureStore.getItemAsync('token');
            const savedRole  = await SecureStore.getItemAsync('role');
            const savedUser  = await SecureStore.getItemAsync('user');

            if (savedToken) {
                setToken(savedToken);
                setRole(savedRole);
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.log('Error loading auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (token, role, user) => {
        try {
            // Save to secure storage
            await SecureStore.setItemAsync('token', token);
            await SecureStore.setItemAsync('role', role);
            await SecureStore.setItemAsync('user', JSON.stringify(user));

            // Update state
            setToken(token);
            setRole(role);
            setUser(user);
        } catch (error) {
            console.log('Error saving auth:', error);
        }
    };

    const logout = async () => {
        try {
            // Clear secure storage
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('role');
            await SecureStore.deleteItemAsync('user');

            // Clear state
            setToken(null);
            setRole(null);
            setUser(null);
        } catch (error) {
            console.log('Error clearing auth:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            token,
            role,
            user,
            loading,
            login,
            logout,
            isLoggedIn: !!token,
            isPatient: role === 'PATIENT',
            isDoctor: role === 'DOCTOR',
            isAdmin: role === 'ADMIN',
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook — use this in any screen
export const useAuth = () => useContext(AuthContext);