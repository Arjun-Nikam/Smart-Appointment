import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [role, setRole]   = useState(localStorage.getItem('role'));
    const [user, setUser]   = useState(JSON.parse(localStorage.getItem('user') || 'null'));

    const login = (token, role, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setRole(role);
        setUser(user);
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setRole(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            token, role, user, login, logout,
            isLoggedIn: !!token,
            isAdmin: role === 'ADMIN',
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);