"use client";

import { useState, useEffect, useCallback } from "react";

const USER_ID_KEY = "virtualnet_user_id";

export interface User {
    id: string;
}

/**
 * Generate a random UUID v4
 */
function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Validate UUID format
 */
function isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

export interface UseUserReturn {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    createUser: () => void;
    login: (userId: string) => boolean;
    logout: () => void;
}

/**
 * Hook for managing user authentication state with localStorage persistence
 */
export function useUser(): UseUserReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUserId = localStorage.getItem(USER_ID_KEY);
        if (storedUserId && isValidUUID(storedUserId)) {
            setUser({ id: storedUserId });
        }
        setIsLoading(false);
    }, []);

    // Create a new user with a random UUID
    const createUser = useCallback(() => {
        const newUserId = generateUUID();
        localStorage.setItem(USER_ID_KEY, newUserId);
        setUser({ id: newUserId });
    }, []);

    // Login with an existing UUID
    const login = useCallback((userId: string): boolean => {
        const trimmedId = userId.trim();
        if (!isValidUUID(trimmedId)) {
            return false;
        }
        localStorage.setItem(USER_ID_KEY, trimmedId);
        setUser({ id: trimmedId });
        return true;
    }, []);

    // Logout - clear user from state and localStorage
    const logout = useCallback(() => {
        localStorage.removeItem(USER_ID_KEY);
        setUser(null);
    }, []);

    return {
        user,
        isLoading,
        isAuthenticated: user !== null,
        createUser,
        login,
        logout,
    };
}
