// src/hooks/useAuth.ts
import { createContext, useContext, useState, useEffect } from "react";
import {
  isAuthenticated as checkTokenAuth,
  getUserData,
  logout as apiLogout,
  getToken as getStoredToken,
  setToken as setStoredToken
} from "../api/auth";

export interface User {
  id: number;
  nombre: string;
  rol: string;
  email: string;
  rol_id: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (token: string) => void;
  token: string | null;
}

// Crear el contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}

// Función para crear el valor del contexto
export function useAuthValue(): AuthContextType {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => checkTokenAuth());
  const [user, setUser] = useState<User | null>(() => getUserData());
  const [loading, setLoading] = useState(true);

  // Inicialización
  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      setUser(getUserData());
    }
    setLoading(false);
  }, []);

  // Escuchar cambios en localStorage (para sincronización entre pestañas)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        const newToken = e.newValue;
        if (newToken) {
          setToken(newToken);
          setIsAuthenticated(true);
          setUser(getUserData());
        } else {
          setToken(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Función login para actualizar el estado
  const login = (newToken: string) => {
    console.log('🔐 Login ejecutado con nuevo token');
    setToken(newToken);
    setStoredToken(newToken); // Guarda en localStorage
    setIsAuthenticated(true);
    
    // Obtener datos del usuario
    const userData = getUserData();
    setUser(userData);
    
    console.log('✅ Estado actualizado:', { 
      hasToken: !!newToken, 
      hasUser: !!userData 
    });
  };

  const logout = async () => {
    console.log('🚪 Logout ejecutado');
    await apiLogout();
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    logout,
    login,
    token
  };
}