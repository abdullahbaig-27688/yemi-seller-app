import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
// ⬆️ ADD useContext to imports

// Define user profile type
type UserProfile = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    // You can add bank info here if you want
    holderName?: string;
    bankName?: string;
    branchName?: string;
    accountNumber?: string;
};

// Context type
type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    token: string | null;
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile) => void;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
    login: (token: string, profile?: UserProfile) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [userProfile, setUserProfileState] = useState<UserProfile>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        holderName: "",
        bankName: "",
        branchName: "",
        accountNumber: "",
    });

    // Restore session
    useEffect(() => {
        const restoreSession = async () => {
            const storedToken = await SecureStore.getItemAsync("auth_token");
            const storedProfile = await SecureStore.getItemAsync("user_profile");

            if (storedProfile) {
                setUserProfileState(JSON.parse(storedProfile));
            }

            setToken(storedToken);
            setIsAuthenticated(!!storedToken);
            setLoading(false);
        };
        restoreSession();
    }, []);

    // ✅ Make setUserProfile ALSO persist to SecureStore
    const setUserProfile = async (profile: UserProfile) => {
        setUserProfileState(profile);
        await SecureStore.setItemAsync("user_profile", JSON.stringify(profile));
    };

    // Login
    const login = async (token: string, profile?: UserProfile) => {
        await SecureStore.setItemAsync("auth_token", token);
        if (profile) {
            await SecureStore.setItemAsync("user_profile", JSON.stringify(profile));
            setUserProfileState(profile);
        }
        setToken(token);
        setIsAuthenticated(true);
    };

    // Logout
    const logout = async () => {
        await SecureStore.deleteItemAsync("auth_token");
        await SecureStore.deleteItemAsync("user_profile");
        setToken(null);
        setUserProfileState({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            holderName: "",
            bankName: "",
            branchName: "",
            accountNumber: "",
        });
        setIsAuthenticated(false);
    };

    // Update user profile
    const updateUserProfile = async (updates: Partial<UserProfile>) => {
        const updatedProfile = { ...userProfile, ...updates };
        setUserProfileState(updatedProfile);
        await SecureStore.setItemAsync("user_profile", JSON.stringify(updatedProfile));
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                loading,
                token,
                userProfile,
                setUserProfile,
                updateUserProfile,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// ✅✅✅ ADD THIS AT THE END - THIS WAS MISSING! ✅✅✅
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};