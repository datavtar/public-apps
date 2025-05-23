
import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';

// API Configuration
const API_KEY = process.env.REACT_APP_DATAVTAR_API_KEY;
const USERNAME = process.env.REACT_APP_DATAVTAR_USERNAME;
const PASSWORD = process.env.REACT_APP_DATAVTAR_PASSWORD;
const API_BASE_URL = process.env.REACT_APP_DATAVTAR_API_BASE_URL
const AUTH_URL = `${API_BASE_URL}/api/v1/auth/token`;
const INPUT_URL = `${API_BASE_URL}/api/v1/input?async_mode=False`;

// Default configurations for AI Layer - now read from .env or fallback
const DEFAULT_MODEL_CODE_TEXT = process.env.REACT_APP_DEFAULT_MODEL_CODE_TEXT || '4a';
const DEFAULT_MODEL_CODE_FILE = process.env.REACT_APP_DEFAULT_MODEL_CODE_FILE || '4b2-datavtar';
const DEFAULT_OUTPUT_FORMAT: 'code' | 'string' | 'json' = 
    (process.env.REACT_APP_DEFAULT_OUTPUT_FORMAT as 'code' | 'string' | 'json') || 'string';
const DEFAULT_PRIORITY = parseInt(process.env.REACT_APP_DEFAULT_PRIORITY || '2', 10);
const DEFAULT_FORMAT = process.env.REACT_APP_DEFAULT_FORMAT || 'simple';
const AUTH_SCOPE = process.env.REACT_APP_DATAVTAR_AUTH_SCOPE || 'user';

interface AILayerProps {
  // Required input: the main textual content or prompt
  prompt: string; 
  
  // Optional file attachment
  attachment?: File;

  // Optional configurations - AILayer will use internal defaults if not provided
  modelCode?: string;
  outputFormat?: 'code' | 'string' | 'json';
  priority?: number;
  format?: 'simple' | string;

  // Callbacks to communicate with the parent
  onResult: (response: string) => void;
  onError: (error: any) => void;
  onLoading: (isLoading: boolean) => void;
}

interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface AILayerHandle {
  callApi: () => void;
}

const AILayer = forwardRef<AILayerHandle, AILayerProps>((
  props,
  ref
) => {
  const {
    prompt, // Now always a string
    attachment,
    modelCode: propsModelCode,
    outputFormat: propsOutputFormat,
    priority: propsPriority,
    format: propsFormat,
    onResult,
    onError,
    onLoading
  } = props;

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number>(0);

  const fetchAuthToken = useCallback(async () => {
    if (!API_KEY || !USERNAME || !PASSWORD || !AUTH_SCOPE) {
      let errorMsg = 'Datavtar API Key, Username, Password, or Auth Scope is not configured in environment variables. Please check:';
      if (!API_KEY) errorMsg += '
- REACT_APP_DATAVTAR_API_KEY';
      if (!USERNAME) errorMsg += '
- REACT_APP_DATAVTAR_USERNAME';
      if (!PASSWORD) errorMsg += '
- REACT_APP_DATAVTAR_PASSWORD';
      if (!AUTH_SCOPE) errorMsg += '
- REACT_APP_DATAVTAR_AUTH_SCOPE';
      console.error(errorMsg);
      onError(new Error(errorMsg));
      onLoading(false);
      return null;
    }
    onLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('username', USERNAME);
      params.append('password', PASSWORD);
      params.append('scope', AUTH_SCOPE);

      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch auth token and parse error JSON.' }));
        throw new Error(errorData.detail || 'Failed to fetch auth token');
      }

      const data: AuthTokenResponse = await response.json();
      setAuthToken(data.access_token);
      setTokenExpiry(Date.now() + data.expires_in * 1000 - 60000);
      onLoading(false);
      return data.access_token;
    } catch (error) {
      console.error('Auth token fetch error:', error);
      onError(error);
      onLoading(false);
      return null;
    }
  }, [onLoading, onError]);

  const getValidToken = useCallback(async () => {
    if (authToken && Date.now() < tokenExpiry) {
      return authToken;
    }
    return await fetchAuthToken();
  }, [authToken, tokenExpiry, fetchAuthToken]);

  const callAIAPIInternal = useCallback(async () => {
    const token = await getValidToken();
    if (!token) {
      // Error already handled by fetchAuthToken or a general 'no valid token' error will be set by it.
      // onError(new Error('No valid auth token available. Cannot proceed.'));
      return;
    }
    if (!API_KEY) { // Double check, though fetchAuthToken should catch it.
        const errorMsg = 'Datavtar API Key (REACT_APP_DATAVTAR_API_KEY) is not configured.';
        console.error(errorMsg);
        onError(new Error(errorMsg));
        onLoading(false);
        return;
    }

    onLoading(true);

    const isFileCall = attachment instanceof File;
    const modelCodeToUse = propsModelCode || (isFileCall ? DEFAULT_MODEL_CODE_FILE : DEFAULT_MODEL_CODE_TEXT);
    const outputFormatToUse = propsOutputFormat || DEFAULT_OUTPUT_FORMAT;
    const priorityToUse = propsPriority || DEFAULT_PRIORITY;
    const formatToUse = propsFormat || DEFAULT_FORMAT;

    try {
      let response;
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': API_KEY,
      };

      if (isFileCall) {
        // File call logic
        if (!attachment) { // Should be caught by isFileCall, but as a safeguard
            throw new Error('Attachment is missing for a file call.'); 
        }
        const formData = new FormData();
        formData.append('files', attachment);
        formData.append('request_data', JSON.stringify({
          model_code: modelCodeToUse,
          content: prompt, // The main prompt string is now the content for the file
          input_type: 'text', 
          output_format: outputFormatToUse,
          priority: priorityToUse,
        }));
        response = await fetch(INPUT_URL, { method: 'POST', headers, body: formData });
      } else {
        // Text call logic
        if (typeof prompt !== 'string' || !prompt.trim()) {
          throw new Error('Text prompt cannot be empty.');
        }
        headers['Content-Type'] = 'application/json';
        const body = JSON.stringify({
          model_code: modelCodeToUse,
          content: prompt,
          input_type: 'text',
          output_format: outputFormatToUse,
          priority: priorityToUse,
          format: formatToUse,
        });
        response = await fetch(INPUT_URL, { method: 'POST', headers, body });
      }
      
      if (!response) {
        throw new Error('API response was unexpectedly null.');
      }

      if (!response.ok) {
        let errorDetail = `API request failed with status ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
        } catch (e) {
            const textError = await response.text();
            errorDetail = textError || errorDetail;
            if (textError.toLowerCase().includes('<html')) {
                errorDetail = "Received an HTML error page from the API. Check server logs or API configuration.";
            }
        }
        throw new Error(errorDetail);
      }

      const resultData = await response.json();
      if (resultData && typeof resultData.response === 'string') {
        onResult(resultData.response);
      } else {
        console.warn('API response did not contain a "response" field as expected or was not a string. Returning full result as JSON string.', resultData);
        onResult(JSON.stringify(resultData, null, 2));
      }

    } catch (error) {
      console.error('AI API call error:', error);
      onError(error);
    } finally {
      onLoading(false);
    }
  }, [
    getValidToken,
    prompt, // Main text prompt
    attachment, // Optional file
    propsModelCode,
    propsOutputFormat,
    propsPriority,
    propsFormat,
    onResult,
    onError,
    onLoading
  ]);

  useImperativeHandle(ref, () => ({
    callApi: callAIAPIInternal, 
  }));

  // This component does not render any UI itself.
  return null;
});

export default AILayer; 
