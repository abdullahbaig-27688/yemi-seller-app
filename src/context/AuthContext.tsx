import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // 🔁 Restore session on app start
    useEffect(() => {
        const restoreSession = async () => {
            const token = await SecureStore.getItemAsync("auth_token");
            setIsAuthenticated(!!token);
            setLoading(false);
        };

        restoreSession();
    }, []);

    const login = async (token: string) => {
        await SecureStore.setItemAsync("auth_token", token);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync("auth_token");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
