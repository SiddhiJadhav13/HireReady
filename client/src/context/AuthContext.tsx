import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface MatchedRole {
    role: string;
    matchScore: number;
}

interface User {
    id: string;
    name: string;
    email: string;
    hasResume: boolean;
    extractedSkills: string[];
    selectedRole: string;
    programmingLanguages: string[];
    matchedRoles: MatchedRole[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: { name: string; email: string; password: string }) => Promise<void>;
    uploadResume: (file: File) => Promise<{
        extractedSkills: string[];
        programmingLanguages: string[];
        matchedRoles: MatchedRole[];
    }>;
    refreshUser: () => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('hireready_token');
        const storedUser = localStorage.getItem('hireready_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const saveUser = (userData: User) => {
        localStorage.setItem('hireready_user', JSON.stringify(userData));
        setUser(userData);
    };

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { token: newToken, user: newUser } = response.data;

        localStorage.setItem('hireready_token', newToken);
        saveUser(newUser);
        setToken(newToken);
    };

    const signup = async (data: { name: string; email: string; password: string }) => {
        const response = await api.post('/auth/signup', data);
        const { token: newToken, user: newUser } = response.data;

        localStorage.setItem('hireready_token', newToken);
        saveUser(newUser);
        setToken(newToken);
    };

    const uploadResume = async (file: File) => {
        const formData = new FormData();
        formData.append('resume', file);
        const response = await api.post('/resume/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        const payload = response.data?.data || response.data || {};
        const { extractedSkills, programmingLanguages, matchedRoles, selectedRole } = payload;

        // Update user state with all resume-derived data
        if (user) {
            saveUser({
                ...user,
                hasResume: true,
                extractedSkills,
                selectedRole: selectedRole || user.selectedRole,
                programmingLanguages,
                matchedRoles,
            });
        }

        return { extractedSkills, programmingLanguages, matchedRoles };
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/auth/profile');
            saveUser(response.data.user);
        } catch {
            // If profile fetch fails, keep existing user
        }
    };

    const logout = () => {
        localStorage.removeItem('hireready_token');
        localStorage.removeItem('hireready_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, signup, uploadResume, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
