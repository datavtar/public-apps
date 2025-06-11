
/**
 * Authentication Service
 * 
 * This service handles authentication with an external API endpoint.
 * It reads configuration from environment variables:
 * 
 * - REACT_APP_AUTH_APP_ID: Application ID for authentication
 * - REACT_APP_AUTH_ENDPOINT: URL of the authentication API endpoint
 */

// src/services/authService.ts

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  error?: string;
  [key: string]: any;
}

interface AuthConfig {
  appId: string;
  apiEndpoint: string;
}

// Define an interface for the decoded user data based on the JWT structure
export interface UserData {
  sub: string;
  app_id: string;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  exp: number;
  token_type: string;
}

// Default configuration for testing when env vars are not set
const DEFAULT_CONFIG: AuthConfig = {
  appId: 'test_app_id',
  apiEndpoint: 'https://api.example.com/auth',
};

// Read env vars
const getAuthConfig = (): AuthConfig => ({
  appId: process.env.REACT_APP_AUTH_APP_ID || DEFAULT_CONFIG.appId,
  apiEndpoint: process.env.REACT_APP_AUTH_ENDPOINT || DEFAULT_CONFIG.apiEndpoint,
});

/**
 * Authenticate user via API endpoint
 * 
 */
export const authenticate = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const config = getAuthConfig();

    if (!config.appId || !config.apiEndpoint) {
      console.error('Missing authentication config');
      return { success: false, error: 'Missing config' };
    }

    const loginUrl = `${config.apiEndpoint}/app-users/login/${config.appId}`;

    const payload = {
      username: email,
      password,
    };

    const response = await axios.post<AuthResponse>(
      loginUrl,
      payload,
      { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } }
    );

    // Store the raw auth response (which includes the token)
    localStorage.setItem('authData', JSON.stringify(response.data));

    // If a token exists, decode it and store the user data
    const token = response.data.token || response.data.access_token;
    if (token) {
      try {
        const decodedToken = jwtDecode<UserData>(token);
        localStorage.setItem('userData', JSON.stringify(decodedToken));
      } catch (decodeError) {
        console.error('Failed to decode JWT or store user data:', decodeError);
        // Optionally handle this error, e.g., by clearing potentially partial data or logging
      }
    }

    return { ...response.data, success: true };
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Handle axios errors
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        error: error.response.data?.message || 'Authentication failed',
      };
    }
    
    return {
      success: false,
      error: 'Authentication service unavailable',
    };
  }
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  const raw = localStorage.getItem('authData');
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed.token || parsed.access_token || null;
  } catch {
    return null;
  }
};

/**
 * Remove stored access token and user data
 */
export const logout = (): void => {
  localStorage.removeItem('authData');
  localStorage.removeItem('userData');
};

/**
 * Handle logout with UI updates
 * This will clear ALL localStorage for the site, except for 'tourCompleted', and reload the page.
 */
export const handleLogout = (): void => {
  const tourCompleted = localStorage.getItem('tourCompleted');
  localStorage.clear();
  if (tourCompleted !== null) {
    localStorage.setItem('tourCompleted', tourCompleted);
  }
  console.log("User logged out. localStorage has been cleared (except for 'tourCompleted').");
  window.location.reload();
};

/**
 * Simple token verification using localStorage
 */
export const verifyToken = (): boolean => !!getAccessToken();

/**
 * Get stored user data
 */
export const getUser = (): UserData | null => {
  const rawUserData = localStorage.getItem('userData');
  if (!rawUserData) return null;

  try {
    const parsedUserData: UserData = JSON.parse(rawUserData);
    return parsedUserData;
  } catch (error) {
    console.error('Failed to parse user data from localStorage:', error);
    return null;
  }
};

