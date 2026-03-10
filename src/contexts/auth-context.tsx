"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  loginUserApi, 
  logoutApi, 
  refreshTokenApi, 
  getAccessToken, 
  isAuthenticated,
  AuthError 
} from "@/client/api/auth";

type User = {
  id?: string;
  name?: string;
  email?: string;
  provider?: "credentials" | "google";
  role?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // User has tokens, consider them authenticated
          // You might want to validate the token with the backend here
          setUser({ 
            id: "authenticated", 
            email: "organization@example.com" 
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUserApi({ identifier, password });
      setUser({ 
        id: "authenticated", 
        email: identifier 
      });
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout error:", error);
      // Continue with local logout even if API call fails
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      await refreshTokenApi();
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, log out the user
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
