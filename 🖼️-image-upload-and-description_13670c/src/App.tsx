import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sun, Moon, UploadCloud, Image as LucideImage, Loader2, AlertTriangle, FileText, Trash2, Eye } from 'lucide-react';
import styles from './styles/styles.module.css';

// Assume AILayer.tsx exists in ./components/AILayer.tsx as per instructions
// If AILayer.tsx is not available or at a different path, this import will fail.
// The AILayer component itself is not generated here, only its usage is demonstrated.
interface AILayerHandle {
  sendToAI: () => void;
}

// Placeholder for AILayer component if not available, to allow UI to render without AI functionality.
// Replace this with the actual import: import AILayer from './components/AILayer';
const AILayer: React.ForwardRefRenderFunction<AILayerHandle, {
  prompt: string;
  attachment?: File;
  onResult: (result: any) => void;
  onError: (error: any) => void;
  onLoading: (loading: boolean) => void;
}> = React.forwardRef(({ prompt, attachment, onResult, onError, onLoading }, ref) => {
  React.useImperativeHandle(ref, () => ({
    sendToAI: () => {
      onLoading(true);
      console.log('Mock AILayer: Sending to AI', { prompt, attachment });
      // Simulate AI processing
      setTimeout(() => {
        if (attachment && attachment.type.startsWith('image/')) {
          onResult(`This is a mock description for the image: ${attachment.name}. The prompt was: "${prompt}"`);
        } else if (attachment) {
          onError({ message: 'Mock AILayer Error: Invalid file type. Only images are supported for description.' });
        } else {
          onError({ message: 'Mock AILayer Error: No attachment provided for description.' });
        }
        onLoading(false);
      }, 2000);
    }
  }));
  return null; // AILayer is headless
});

interface AppSettings {
  darkMode: boolean;
  lastDescription: string | null;
}

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('imageDescriberAppSettings');
      if (savedSettings) {
        return (JSON.parse(savedSettings) as AppSettings).darkMode;
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [promptText] = useState<string>("Describe this image in detail, focusing on its main subjects, colors, and overall mood.");

  const aiLayerRef = useRef<AILayerHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
        const currentSettings = JSON.parse(localStorage.getItem('imageDescriberAppSettings') || '{}') as Partial<AppSettings>;
        localStorage.setItem('imageDescriberAppSettings', JSON.stringify({ ...currentSettings, darkMode: isDarkMode }));
    } catch (e) {
        console.error("Failed to save dark mode to localStorage", e);
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
        const savedSettings = localStorage.getItem('imageDescriberAppSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings) as AppSettings;
            if(settings.lastDescription) {
                setDescription(settings.lastDescription);
            }
        }
    } catch(e) {
        console.error("Failed to load settings from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setDescription(null);
        setError(null);
        localStorage.removeItem('imageDescriberAppSettings'); // Clear old description from storage
      } else {
        setError('Invalid file type. Please upload an image (PNG, JPG, GIF, etc.).');
        setSelectedFile(null);
      }
    }
  };

  const handleDescribeImage = useCallback(() => {
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }
    if (!promptText.trim()) {
        setError("Prompt cannot be empty.");
        return;
    }

    setDescription(null); 
    setError(null);      
    // setIsLoading(true); // AILayer's onLoading will handle this more accurately
    
    aiLayerRef.current?.sendToAI();
  }, [selectedFile, promptText]);

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    try {
        const currentSettings = JSON.parse(localStorage.getItem('imageDescriberAppSettings') || '{}') as Partial<AppSettings>;
        localStorage.setItem('imageDescriberAppSettings', JSON.stringify({ ...currentSettings, lastDescription: null }));
    } catch (e) {
        console.error("Failed to clear description from localStorage", e);
    }
  };

  const aiOnResult = (apiResult: any) => {
    const resultText = typeof apiResult === 'string' ? apiResult : JSON.stringify(apiResult);
    setDescription(resultText);
    try {
        const currentSettings = JSON.parse(localStorage.getItem('imageDescriberAppSettings') || '{}') as Partial<AppSettings>;
        localStorage.setItem('imageDescriberAppSettings', JSON.stringify({ ...currentSettings, lastDescription: resultText }));
    } catch (e) {
        console.error("Failed to save description to localStorage", e);
    }
  };

  const aiOnError = (apiError: any) => {
    setError(apiError?.message || 'An unknown AI error occurred.');
  };

  const aiOnLoading = (loadingStatus: boolean) => {
    setIsLoading(loadingStatus);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''} theme-transition-all`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-between h-16">
            <div className="flex-start">
              <Eye className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">AI Image Describer</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-slate-300 mr-2">Theme:</span>
              <button
                onClick={toggleDarkMode}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span className="theme-toggle-thumb">
                  {isDarkMode ? <Moon size={12} className='text-slate-500 m-auto' /> : <Sun size={12} className='text-yellow-500 m-auto' />}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-narrow mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="card card-responsive theme-transition-all">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700 dark:text-slate-200">Upload an Image to Get its Description</h2>

          <div className="form-group text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              id="imageUpload"
              aria-labelledby="imageUploadLabel"
            />
            <label
              htmlFor="imageUpload"
              id="imageUploadLabel"
              className={`btn btn-primary btn-responsive inline-flex items-center justify-center gap-2 cursor-pointer ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            >
              <UploadCloud size={20} />
              {selectedFile ? 'Change Image' : 'Upload Image'}
            </label>
            {selectedFile && (
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Selected: {selectedFile.name}</p>
            )}
          </div>

          {error && (
            <div className="alert alert-error mt-4 animate-fade-in" role="alert">
              <AlertTriangle size={20} />
              <p>{error}</p>
            </div>
          )}

          {previewUrl && (
            <div className={`mt-6 text-center animate-fade-in ${styles.previewContainer}`}>
              <h3 className="text-lg font-medium text-gray-700 dark:text-slate-300 mb-2">Image Preview</h3>
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden shadow-inner inline-block max-w-full">
                <img src={previewUrl} alt="Selected preview" className="object-contain w-full h-full" />
              </div>
            </div>
          )}

          {selectedFile && (
            <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={handleDescribeImage}
                className={`btn btn-secondary btn-responsive inline-flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading || !selectedFile}
                aria-label='Describe uploaded image'
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
                {isLoading ? 'Describing...' : 'Describe Image'}
              </button>
              <button
                onClick={handleClear}
                className={`btn bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-500 btn-responsive inline-flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
                aria-label='Clear selected image and description'
              >
                <Trash2 size={20} />
                Clear
              </button>
            </div>
          )}
          
          {isLoading && !description && (
             <div className="mt-6 text-center text-gray-600 dark:text-slate-300 flex items-center justify-center gap-2">
                <Loader2 size={24} className="animate-spin" />
                <p className="text-lg">AI is thinking...</p>
             </div>
          )}

          {description && (
            <div className="mt-8 card card-sm bg-slate-50 dark:bg-slate-700 animate-slide-in" role="article">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-slate-100 flex items-center gap-2">
                <FileText size={24} className="text-primary-600 dark:text-primary-400" />
                AI Generated Description
              </h3>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-gray-700 dark:text-slate-300">
                <p>{description}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Headless AILayer component instance */}
        <AILayer
            ref={aiLayerRef}
            prompt={promptText}
            attachment={selectedFile || undefined} // Pass undefined if no file, AILayer must handle it
            onResult={aiOnResult}
            onError={aiOnError}
            onLoading={aiOnLoading}
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-slate-900 text-center py-4 theme-transition-bg no-print">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;
