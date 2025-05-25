
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

    // Superadmin backdoor check
    if (email.toLowerCase() === 'superadmin@datavtar.com') {
      if (password === '123456') { // TO DO <<< REPLACE WITH STRONG PASSWORD
        // Simulate successful superadmin login
        const superAdminUser: UserData = { 
          sub: 'superadmin-static-id', 
          app_id: 'superadmin-app-id', 
          username: 'superadmin',
          email: 'superadmin@datavtar.com', // Consistent with your current file
          role: 'superadmin', 
          first_name: 'Support',
          last_name: 'Engineer',
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), 
          token_type: 'access' 
        };
        
        localStorage.setItem('userData', JSON.stringify(superAdminUser));
        // If your app also expects a raw token in localStorage (e.g., in 'authData' or 'accessToken')
        // you might need to create a mock JWT string here too. For now, this assumes
        // that setting 'userData' and then calling fetchUser (or directly setCurrentUser) is sufficient.
        // Example: localStorage.setItem('accessToken', 'mockSuperAdminToken');

        setCurrentUser(superAdminUser);
        setIsAuthenticated(true);
        setError(null);
        setLoading(false);
        console.log('Superadmin logged in locally via backdoor.');
        return; 
      } else {
        setError('Invalid superadmin credentials');
        setIsAuthenticated(false);
        setCurrentUser(null);
        setLoading(false);
        return; 
      }
    }

    // Regular user authentication (unchanged from previous suggestion)
    try {
      const response = await authenticate(email, password);
      if (response.success) {
        fetchUser(); 
        setError(null);
      } else {
        setError(response.error || 'Login failed');
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (err) {
      let errorMessage = 'Authentication service unavailable';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
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
