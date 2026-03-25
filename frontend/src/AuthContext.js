import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken) setToken(savedToken);
  }, []);

  const login = (userData, tokenData) => {
    // Save properly
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));

    //Update state
    setUser(userData);
    setToken(tokenData);

    console.log("TOKEN SAVED:", tokenData); //degub
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}