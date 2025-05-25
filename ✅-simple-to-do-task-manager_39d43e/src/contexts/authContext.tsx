
// src/contexts/authContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getUser, UserData, authenticate, getAccessToken, verifyToken } from '../services/authService';

interface AuthContextType {
  currentUser: UserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = () => {
    try {
      const user = getUser();
      const token = getAccessToken();
      const isValid = verifyToken();
      
      if (user && token && isValid) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error fetching user in AuthProvider:", error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authenticate(email, password);
      
      if (response.success) {
        // After successful authentication, fetch the user data
        fetchUser();
        setError(null);
      } else {
        setError(response.error || 'Login failed');
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (err) {
      setError('Authentication service unavailable');
      setIsAuthenticated(false);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear local state
    setCurrentUser(null);
    setIsAuthenticated(false);
    setError(null);
    
    // Clear localStorage and reload (using the existing handleLogout logic)
    const tourCompleted = localStorage.getItem('tourCompleted');
    localStorage.clear();
    if (tourCompleted !== null) {
      localStorage.setItem('tourCompleted', tourCompleted);
    }
    console.log("User logged out. localStorage has been cleared (except for 'tourCompleted').");
    window.location.reload();
  };

  useEffect(() => {
    // Initial check on mount
    fetchUser();
    setLoading(false);
    
    // Listen for storage changes to update user, e.g., after login/logout from another tab
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userData' || event.key === 'authData') {
        fetchUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      loading, 
      error, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
