import React, { createContext, useContext, useState, useCallback } from "react";
import authService from "../services/authService";
import type { User, LoginCredentials, AuthContextType } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 1. Inisialisasi state langsung menggunakan fungsi (Lazy Initialization)
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // Jika token dan user ada, langsung set true sejak awal render
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("token") && !!localStorage.getItem("user");
  });

  // Karena pengecekan langsung selesai di awal, kita tidak butuh fase loading dari useEffect
  const [isLoading] = useState(false);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);

      if (response.success) {
        const { token: newToken, user: userData } = response.data;

        setToken(newToken);
        setUser(userData);
        setIsAuthenticated(true);

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.me();

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to refresh user:", error);
      await logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    isLoading, // Tetap disertakan agar tidak merusak types jika dipakai di komponen lain
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
