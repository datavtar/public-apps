
// src/components/AILayer.types.ts

// Props for the AILayer component
export interface AILayerProps {
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

// Expected shape of the auth token API response
export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Handle interface exposed by AILayer to its parent via ref
export interface AILayerHandle {
  sendToAI: () => void;
}
