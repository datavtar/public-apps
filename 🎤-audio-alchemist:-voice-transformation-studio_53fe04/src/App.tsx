import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Mic, MicOff, Play, Pause, StopCircle, Settings, History, Download,
  Volume2, VolumeX, RotateCcw, Trash2, User, LogOut, Menu, X,
  MessageCircle, Clock, Headphones, Brain, Zap, Globe, Moon, Sun,
  ChevronDown, ChevronUp, FileAudio, Users, Heart, Star, Sparkles
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface AudioConversation {
  id: string;
  timestamp: Date;
  userText: string;
  aiResponse: string;
  duration: number;
  mode: VoiceMode;
}

interface VoiceMode {
  id: string;
  name: string;
  description: string;
  prompt: string;
  icon: ReactNode; // Changed from React.ReactNode
  color: string;
}

interface AppSettings {
  language: string;
  voiceSpeed: number;
  autoPlay: boolean;
  theme: 'light' | 'dark' | 'system';
  recordingQuality: 'low' | 'medium' | 'high';
  maxRecordingTime: number;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'playing' | 'error';
type Page = 'main' | 'history' | 'settings' | 'modes';

const VOICE_MODES: VoiceMode[] = [
  {
    id: 'assistant',
    name: 'AI Assistant',
    description: 'General purpose helpful assistant',
    prompt: 'You are a helpful AI assistant. Respond naturally and conversationally to the user\'s voice input. Keep responses concise but informative.',
    icon: <Brain className="w-5 h-5" />,
    color: 'bg-blue-500'
  },
  {
    id: 'coach',
    name: 'Life Coach',
    description: 'Motivational and supportive guidance',
    prompt: 'You are an encouraging life coach. Provide motivational, supportive, and uplifting responses. Help the user feel confident and inspired.',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-green-500'
  },
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Educational and explanatory responses',
    prompt: 'You are a patient teacher. Explain concepts clearly, ask follow-up questions, and help the user learn. Break down complex topics into simple terms.',
    icon: <Star className="w-5 h-5" />,
    color: 'bg-purple-500'
  },
  {
    id: 'therapist',
    name: 'Wellness Guide',
    description: 'Supportive mental health companion',
    prompt: 'You are a compassionate wellness guide. Listen actively, provide emotional support, and offer practical coping strategies. Be empathetic and non-judgmental.',
    icon: <Heart className="w-5 h-5" />,
    color: 'bg-pink-500'
  },
  {
    id: 'creative',
    name: 'Creative Partner',
    description: 'Brainstorming and creative inspiration',
    prompt: 'You are a creative partner. Help with brainstorming, creative writing, artistic ideas, and imaginative problem-solving. Be playful and innovative.',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-yellow-500'
  }
];

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' }
];

function App() {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<number | null>(null); // Changed NodeJS.Timeout to number
  const streamRef = useRef<MediaStream | null>(null);

  // Core state
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // AI state
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any | null>(null);
  
  // App-specific state
  const [conversations, setConversations] = useState<AudioConversation[]>([]);
  const [selectedMode, setSelectedMode] = useState<VoiceMode>(VOICE_MODES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    voiceSpeed: 1,
    autoPlay: true,
    theme: 'system',
    recordingQuality: 'medium',
    maxRecordingTime: 300
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('audioConversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        if (Array.isArray(parsed)) { // Added check for Array
          setConversations(parsed.map((conv: any) => ({
            ...conv,
            timestamp: new Date(conv.timestamp)
          })));
        } else {
          console.error('Error loading conversations: Parsed data from localStorage is not an array.', parsed);
          setConversations([]); // Default to empty array or handle as appropriate
        }
      } catch (error) {
        console.error('Error parsing saved conversations:', error);
        setConversations([]); // Fallback to empty array on parsing error
      }
    }

    const savedSettings = localStorage.getItem('audioAppSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    const savedMode = localStorage.getItem('selectedVoiceMode');
    if (savedMode) {
      try {
        const mode = JSON.parse(savedMode);
        const foundMode = VOICE_MODES.find(m => m.id === mode.id);
        if (foundMode) setSelectedMode(foundMode);
      } catch (error) {
        console.error('Error loading voice mode:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('audioConversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('audioAppSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('selectedVoiceMode', JSON.stringify(selectedMode));
  }, [selectedMode]);

  // Theme handling
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    setRecordingState('processing');
  }, []);

  // Audio recording functions
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: settings.recordingQuality === 'high' ? 48000 : 
                      settings.recordingQuality === 'medium' ? 24000 : 16000
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlobGenerated = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlobGenerated);
        processAudio(audioBlobGenerated);
      };
      
      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingTime(0);
      
      // Start recording timer
      recordingTimerRef.current = window.setInterval(() => { // Ensure window.setInterval for clarity in browser context
        setRecordingTime(prev => {
          if (prev >= settings.maxRecordingTime) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
      setRecordingState('error');
    }
  }, [settings.recordingQuality, settings.maxRecordingTime, stopRecording]); // Added stopRecording to dependency array

  const processAudio = useCallback(async (audioBlobToProcess: Blob) => {
    try {
      setResult(null);
      setError(null);
      
      // Convert audio blob to base64 for processing
      const audioFile = new File([audioBlobToProcess], 'recording.webm', { type: 'audio/webm' });
      setSelectedFile(audioFile);
      
      // Create prompt with context
      const contextPrompt = `${selectedMode.prompt} The user has sent you an audio message. Please respond naturally and conversationally. Language preference: ${settings.language}. Keep the response engaging and match the user's tone.`;
      setPromptText(contextPrompt);
      
      // Trigger AI processing
      if (aiLayerRef.current) {
        aiLayerRef.current.sendToAI(contextPrompt, audioFile);
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again.');
      setRecordingState('error');
    }
  }, [selectedMode, settings.language]);

  const handlePlayResponse = useCallback((response: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = settings.voiceSpeed;
      utterance.volume = isMuted ? 0 : volume;
      utterance.lang = settings.language;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setRecordingState('idle');
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setRecordingState('idle');
        setError('Failed to play audio response.');
      };
      
      speechSynthesis.speak(utterance);
    } else {
      setError('Speech synthesis not supported in this browser.');
      setRecordingState('idle');
    }
  }, [settings.voiceSpeed, settings.language, volume, isMuted]);

  const stopPlayback = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setRecordingState('idle');
  }, []);

  // AI result handler
  useEffect(() => {
    if (result && recordingState === 'processing') {
      // Save conversation
      const newConversation: AudioConversation = {
        id: Date.now().toString(),
        timestamp: new Date(),
        userText: 'Audio message', // This might need to be the transcribed text if available
        aiResponse: result,
        duration: recordingTime,
        mode: selectedMode
      };
      
      setConversations(prev => [newConversation, ...prev]);
      
      // Auto-play if enabled
      if (settings.autoPlay) {
        setRecordingState('playing');
        handlePlayResponse(result);
      } else {
        setRecordingState('idle');
      }
    }
  }, [result, recordingState, recordingTime, selectedMode, settings.autoPlay, handlePlayResponse]);

  // AI error handler
  useEffect(() => {
    if (error && recordingState === 'processing') {
      setRecordingState('error');
    }
  }, [error, recordingState]);

  const clearAllConversations = useCallback(() => {
    setConversations([]);
    localStorage.removeItem('audioConversations');
  }, []);

  const exportConversations = useCallback(() => {
    const csvRows = conversations?.map(conv => 
      `"${conv.timestamp.toISOString()}","${conv.mode.name}","${conv.userText}","${conv.aiResponse.replace(/"/g, '""')}","${conv.duration}s"`
    );
    const csvContent = csvRows ? csvRows.join('\n') : ''; // Each row is just the data, joined by newlines
    
    const header = 'Timestamp,Mode,User Input,AI Response,Duration\n';
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-conversations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [conversations]);

  const filteredConversations = conversations.filter(conv => 
    conv.aiResponse.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.mode.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingStateColor = () => {
    switch (recordingState) {
      case 'recording': return 'text-red-500';
      case 'processing': return 'text-yellow-500';
      case 'playing': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getRecordingStateText = () => {
    switch (recordingState) {
      case 'recording': return 'Recording...';
      case 'processing': return 'Processing with AI...';
      case 'playing': return 'Playing response...';
      case 'error': return 'Error occurred';
      default: return 'Ready to record';
    }
  };

  const renderMainPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700" id="welcome_fallback">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Headphones className="w-8 h-8 text-blue-500" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">VoiceAI</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage('modes')}
                className="btn bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 flex items-center gap-2"
                id="voice-modes-button"
              >
                <div className={`w-3 h-3 rounded-full ${selectedMode.color}`}></div>
                <span className="hidden sm:inline">{selectedMode.name}</span>
              </button>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 md:hidden"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('history')}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                  id="history-button"
                >
                  <History className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage('settings')}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                  id="settings-button"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={logout}
                  className="btn bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setCurrentPage('history'); setIsMenuOpen(false); }}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 justify-start"
                >
                  <History className="w-5 h-5 mr-2" />
                  History
                </button>
                <button
                  onClick={() => { setCurrentPage('settings'); setIsMenuOpen(false); }}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 justify-start"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </button>
                <button
                  onClick={logout}
                  className="btn bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300 justify-start"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-8" id="generation_issue_fallback">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`p-4 rounded-full ${selectedMode.color} text-white`}>
              {selectedMode.icon}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Hello, {currentUser?.first_name || 'User'}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Speak naturally and let AI understand and respond to you. Currently in {selectedMode.name} mode.
          </p>
        </div>

        {/* Recording Interface */}
        <div className="max-w-md mx-auto">
          <div className="card text-center">
            {/* Status Display */}
            <div className="mb-6">
              <div className={`text-lg font-medium ${getRecordingStateColor()}`}>
                {getRecordingStateText()}
              </div>
              {recordingState === 'recording' && (
                <div className="text-2xl font-mono text-gray-900 dark:text-white mt-2">
                  {formatTime(recordingTime)}
                </div>
              )}
              {recordingState === 'recording' && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(recordingTime / settings.maxRecordingTime) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Main Recording Button */}
            <div className="mb-6">
              <button
                onClick={recordingState === 'recording' ? stopRecording : 
                         recordingState === 'playing' ? stopPlayback : startRecording}
                disabled={recordingState === 'processing' || isLoading}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none ${( // Line 390 context
                  recordingState === 'recording' ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-red-900' :
                  recordingState === 'playing' ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 dark:shadow-green-900' :
                  'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900'
                )}
                `}
                id="main-record-button"
              >
                {recordingState === 'recording' ? (
                  <StopCircle className="w-8 h-8 text-white" /> // Changed Stop to StopCircle
                ) : recordingState === 'playing' ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : recordingState === 'processing' || isLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
            </div>

            {/* Audio Controls */}
            {recordingState === 'idle' && result && (
              <div className="mb-4">
                <button
                  onClick={() => handlePlayResponse(result)}
                  className="btn btn-primary flex items-center gap-2 mx-auto"
                  id="replay-button"
                >
                  <Play className="w-4 h-4" />
                  Replay Response
                </button>
              </div>
            )}

            {/* Volume Control */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24"
                disabled={isMuted}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-error mb-4">
                <p>{typeof error === 'string' ? error : 'An error occurred. Please try again.'}</p>
              </div>
            )}

            {/* Latest Response */}
            {result && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Latest Response:</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{result}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <div className="stat-card text-center">
            <div className="stat-title">Total Conversations</div>
            <div className="stat-value">{conversations.length}</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-title">Current Mode</div>
            <div className="stat-value text-lg">{selectedMode.name}</div>
          </div>
          <div className="stat-card text-center">
            <div className="stat-title">Language</div>
            <div className="stat-value text-lg">
              {LANGUAGES.find(l => l.code === settings.language)?.name || 'English'}
            </div>
          </div>
        </div>
      </main>

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(apiResult) => setResult(apiResult)}
        onError={(apiError) => setError(apiError)}
        onLoading={(loadingStatus) => setIsLoading(loadingStatus)}
      />
    </div>
  );

  const renderVoiceModesPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid">
          <div className="flex items-center h-16">
            <button
              onClick={() => setCurrentPage('main')}
              className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 mr-4"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Voice Modes</h1>
          </div>
        </div>
      </header>

      <main className="container-fluid py-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Choose how you want the AI to respond to your voice messages.
          </p>
          
          <div className="grid gap-4">
            {VOICE_MODES?.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedMode(mode);
                  setCurrentPage('main');
                }}
                className={`card text-left transition-all duration-200 hover:shadow-lg ${( // Ensure template literal syntax is robust
                  selectedMode.id === mode.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${mode.color} text-white flex-shrink-0`}>
                    {mode.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {mode.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {mode.description}
                    </p>
                  </div>
                  {selectedMode.id === mode.id && (
                    <div className="text-blue-500">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  const renderHistoryPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid">
          <div className="flex items-center h-16">
            <button
              onClick={() => setCurrentPage('main')}
              className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 mr-4"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Conversation History</h1>
            <div className="ml-auto flex gap-2">
              {conversations.length > 0 && (
                <>
                  <button
                    onClick={exportConversations}
                    className="btn bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearAllConversations}
                    className="btn bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container-fluid py-8">
        <div className="max-w-4xl mx-auto">
          {conversations.length > 0 && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input max-w-md"
              />
            </div>
          )}
          
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {conversations.length === 0 ? 'No conversations yet' : 'No matching conversations'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {conversations.length === 0 
                  ? 'Start your first voice conversation to see it here.'
                  : 'Try adjusting your search terms.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConversations?.map((conversation) => {
                const iconNode = conversation.mode.icon;
                return (
                  <div key={conversation.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${conversation.mode.color} flex items-center justify-center text-white`}>
                          {React.isValidElement(iconNode) ? 
                            React.cloneElement(iconNode as React.ReactElement, { className: 'w-4 h-4' }) :
                            iconNode}{/* Fallback to rendering node if not cloneable */}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {conversation.mode.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {conversation.timestamp.toLocaleDateString()} at {conversation.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatTime(conversation.duration)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Response:</h4>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {conversation.aiResponse}
                      </p>
                    </div>
                    
                    <div className="mt-3">
                      <button
                        onClick={() => handlePlayResponse(conversation.aiResponse)}
                        className="btn btn-sm bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300"
                        disabled={isPlaying}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        {isPlaying ? 'Playing...' : 'Play'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );

  const renderSettingsPage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid">
          <div className="flex items-center h-16">
            <button
              onClick={() => setCurrentPage('main')}
              className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 mr-4"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
        </div>
      </header>

      <main className="container-fluid py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Audio Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Audio Settings
            </h3>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Voice Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.voiceSpeed}
                  onChange={(e) => setSettings({...settings, voiceSpeed: parseFloat(e.target.value)})}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Current: {settings.voiceSpeed}x
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Recording Quality</label>
                <select
                  value={settings.recordingQuality}
                  onChange={(e) => setSettings({...settings, recordingQuality: e.target.value as 'low' | 'medium' | 'high'})}
                  className="input"
                >
                  <option value="low">Low (16kHz)</option>
                  <option value="medium">Medium (24kHz)</option>
                  <option value="high">High (48kHz)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Max Recording Time (seconds)</label>
                <input
                  type="number"
                  min="30"
                  max="600"
                  value={settings.maxRecordingTime}
                  onChange={(e) => setSettings({...settings, maxRecordingTime: parseInt(e.target.value, 10)})}
                  className="input"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="form-label mb-0">Auto-play AI responses</span>
                <button
                  onClick={() => setSettings({...settings, autoPlay: !settings.autoPlay})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${( // Ensure template literal syntax is robust
                    settings.autoPlay ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                  )}
                  `}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${( // Ensure template literal syntax is robust
                    settings.autoPlay ? 'translate-x-6' : 'translate-x-1'
                  )}
                  `} />
                </button>
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language
            </h3>
            
            <div className="form-group">
              <label className="form-label">Preferred Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                className="input"
              >
                {LANGUAGES?.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              {settings.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </h3>
            
            <div className="form-group">
              <label className="form-label">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({...settings, theme: e.target.value as 'light' | 'dark' | 'system'})}
                className="input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          {/* Data Management */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileAudio className="w-5 h-5" />
              Data Management
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={exportConversations}
                disabled={conversations.length === 0}
                className="btn bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300 w-full justify-center disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All Conversations
              </button>
              
              <button
                onClick={clearAllConversations}
                disabled={conversations.length === 0}
                className="btn bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900 dark:hover:bg-red-800 dark:text-red-300 w-full justify-center disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                <span className="text-gray-900 dark:text-white">
                  {currentUser?.first_name} {currentUser?.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="text-gray-900 dark:text-white">{currentUser?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Username:</span>
                <span className="text-gray-900 dark:text-white">{currentUser?.username}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  // Main render
  if (currentPage === 'history') return renderHistoryPage();
  if (currentPage === 'settings') return renderSettingsPage();
  if (currentPage === 'modes') return renderVoiceModesPage();
  
  return (
    <>
      {renderMainPage()}
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 mt-auto">
        <div className="container-fluid text-center text-sm text-gray-600 dark:text-gray-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </>
  );
}

export default App;
