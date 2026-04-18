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
import { apiClient } from "@/client/api/api-client";

type User = {
  id?: string;
  name?: string;
  email?: string;
  provider?: "credentials" | "google";
  role?: string;
  verificationStatus?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      if (isAuthenticated()) {
        const profile: any = await apiClient("http://localhost:3000/organizations/profile");
        setUser({ 
          id: profile.userId, 
          email: profile.email,
          name: profile.name,
          verificationStatus: profile.verificationStatus,
        });
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      if (isAuthenticated()) {
        await logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUserApi({ identifier, password });
      
      // Fetch profile immediately after login to get status
      const profile: any = await apiClient("http://localhost:3000/organizations/profile");
      setUser({ 
        id: profile.userId, 
        email: profile.email,
        name: profile.name,
        verificationStatus: profile.verificationStatus,
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

  // Add proactive refresh timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (user) {
      // Set interval to 12 minutes (tokens expire in 15m)
      interval = setInterval(async () => {
        try {
          console.log("Proactively refreshing organization token...");
          await refreshToken();
        } catch (error) {
          console.error("Proactive refresh failed:", error);
        }
      }, 12 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken,
    refreshUser: checkAuth,
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
