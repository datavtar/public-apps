import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Play, Pause, Download, Settings, MessageCircle, GraduationCap, Lightbulb, User, Volume2, VolumeX, RotateCcw, Trash2, Save, Upload, Eye, EyeOff, Moon, Sun, History, Clock, Zap, Users, Calendar, FileAudio } from 'lucide-react';
import styles from './styles/styles.module.css';

interface AudioSession {
  id: string;
  timestamp: number;
  mode: ConversationMode;
  transcript: string;
  response: string;
  audioUrl?: string;
  duration: number;
}

interface AppSettings {
  apiKey: string;
  autoPlay: boolean;
  saveHistory: boolean;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  speed: number;
  darkMode: boolean;
}

type ConversationMode = 'chat' | 'interview' | 'learning' | 'creative';
type ProcessingState = 'idle' | 'recording' | 'processing' | 'playing' | 'error';

const CONVERSATION_MODES = {
  chat: {
    title: 'General Chat',
    description: 'Natural conversation with AI',
    icon: MessageCircle,
    color: 'bg-blue-500',
    prompt: 'Have a natural, helpful conversation with the user.'
  },
  interview: {
    title: 'Interview Practice',
    description: 'Practice interviews and get feedback',
    icon: Users,
    color: 'bg-purple-500',
    prompt: 'Act as an experienced interviewer. Ask thoughtful questions and provide constructive feedback.'
  },
  learning: {
    title: 'Learning Assistant',
    description: 'Educational discussions and explanations',
    icon: GraduationCap,
    color: 'bg-green-500',
    prompt: 'Act as a knowledgeable teacher. Explain concepts clearly and ask follow-up questions to ensure understanding.'
  },
  creative: {
    title: 'Creative Brainstorming',
    description: 'Generate ideas and creative solutions',
    icon: Lightbulb,
    color: 'bg-orange-500',
    prompt: 'Be creative and imaginative. Help brainstorm ideas and think outside the box.'
  }
};

const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  autoPlay: true,
  saveHistory: true,
  voice: 'alloy',
  speed: 1.0,
  darkMode: false
};

function App() {
  // Core state
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [currentMode, setCurrentMode] = useState<ConversationMode>('chat');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Data state
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<AudioSession[]>([]);
  const [currentSession, setCurrentSession] = useState<AudioSession | null>(null);
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('audioAI_settings');
    
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        
        // Apply dark mode
        if (parsed.darkMode) {
          document.documentElement.classList.add('dark');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    
    const savedSessionsItem = localStorage.getItem('audioAI_sessions');
    if (savedSessionsItem) {
      try {
        const parsedSessions = JSON.parse(savedSessionsItem);
        if (Array.isArray(parsedSessions)) {
          setSessions(parsedSessions);
        } else {
          console.warn('Loaded sessions from localStorage is not an array. Initializing with empty array.');
          setSessions([]);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
        setSessions([]); // Fallback to empty array on parsing error
      }
    } else {
      setSessions([]); // Ensure sessions is an empty array if nothing is in localStorage
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('audioAI_settings', JSON.stringify(newSettings));
    
    // Apply dark mode
    if (newSettings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Save sessions to localStorage
  const saveSessions = useCallback((newSessions: AudioSession[]) => {
    setSessions(newSessions);
    if (settings.saveHistory) {
      localStorage.setItem('audioAI_sessions', JSON.stringify(newSessions));
    }
  }, [settings.saveHistory]);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);
    
    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setError('');
      setProcessingState('recording');
      setRecordingDuration(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start monitoring audio level
      monitorAudioLevel();
      
      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };
      
      mediaRecorderRef.current.start();
      
      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      setError('Failed to access microphone. Please check permissions.');
      setProcessingState('error');
    }
  }, [monitorAudioLevel]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Stop audio monitoring
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Stop recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Stop audio stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      setAudioLevel(0);
      setProcessingState('processing');
    }
  }, []);

  // Process audio with Gemini API
  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      if (!settings.apiKey) {
        throw new Error('API key is required. Please configure it in settings.');
      }
      
      // Convert audio to base64
      const audioBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });
      
      // Simulate transcript extraction (in real implementation, you'd use speech-to-text)
      const mockTranscript = 'User audio input (transcript would be generated here)';
      setTranscript(mockTranscript);
      
      // Get conversation context
      const mode = CONVERSATION_MODES[currentMode];
      const systemPrompt = `${mode.prompt} Respond naturally and conversationally to the user's input.`;
      
      // Call Gemini API (simplified - in real implementation you'd use the actual Live API)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${settings.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser said: "${mockTranscript}"`
            }]
          }]
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
      
      setResponse(aiResponse);
      
      // Convert text to speech
      await convertToSpeech(aiResponse, audioBlob);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Processing failed');
      setProcessingState('error');
    }
  }, [settings.apiKey, currentMode]);

  // Convert text to speech
  const convertToSpeech = useCallback(async (text: string, originalAudio: Blob) => {
    try {
      // In a real implementation, you'd use a proper TTS service
      // For now, we'll use the Web Speech API if available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = settings.speed;
        utterance.voice = speechSynthesis.getVoices().find(voice => 
          voice.name.toLowerCase().includes(settings.voice)
        ) || speechSynthesis.getVoices()[0];
        
        utterance.onstart = () => {
          setProcessingState('playing');
        };
        
        utterance.onend = () => {
          setProcessingState('idle');
          
          // Save session
          if (settings.saveHistory) {
            const session: AudioSession = {
              id: Date.now().toString(),
              timestamp: Date.now(),
              mode: currentMode,
              transcript: transcript,
              response: response,
              duration: recordingDuration
            };
            
            const newSessions = [session, ...(sessions || [])].slice(0, 50); // Keep last 50 sessions
            saveSessions(newSessions);
            setCurrentSession(session);
          }
        };
        
        utterance.onerror = () => {
          setError('Text-to-speech failed');
          setProcessingState('error');
        };
        
        if (settings.autoPlay) {
          speechSynthesis.speak(utterance);
        } else {
          setProcessingState('idle');
        }
      } else {
        setError('Text-to-speech not supported in this browser');
        setProcessingState('error');
      }
    } catch (error) {
      setError('Failed to convert text to speech');
      setProcessingState('error');
    }
  }, [settings.speed, settings.voice, settings.autoPlay, settings.saveHistory, currentMode, transcript, response, recordingDuration, sessions, saveSessions]);

  // Play response audio
  const playResponse = useCallback(() => {
    if (response && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = settings.speed;
      speechSynthesis.speak(utterance);
    }
  }, [response, settings.speed]);

  // Stop audio playback
  const stopAudio = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setProcessingState('idle');
  }, []);

  // Reset current session
  const resetSession = useCallback(() => {
    setTranscript('');
    setResponse('');
    setError('');
    setCurrentSession(null);
    setProcessingState('idle');
    setRecordingDuration(0);
    setAudioLevel(0);
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }, []);

  // Export sessions as CSV
  const exportSessions = useCallback(() => {
    const csv = [
      'Date,Mode,Transcript,Response,Duration',
      ...(sessions || []).map(session => [
        new Date(session.timestamp).toLocaleString(),
        session.mode,
        `"${session.transcript.replace(/"/g, '""')}"`, // Ensure quotes in transcript are escaped
        `"${session.response.replace(/"/g, '""')}"`,   // Ensure quotes in response are escaped
        `${session.duration}s`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-ai-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  // Clear all sessions
  const clearSessions = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all session history?')) {
      setSessions([]);
      localStorage.removeItem('audioAI_sessions');
    }
  }, []);

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSettings(false);
        setShowHistory(false);
      }
      
      if (e.key === ' ' && e.ctrlKey) {
        e.preventDefault();
        if (processingState === 'idle') {
          startRecording();
        } else if (processingState === 'recording') {
          stopRecording();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [processingState, startRecording, stopRecording]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-lg theme-transition">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Audio AI Assistant</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Powered by Gemini Live API</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="btn p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                title="View History"
              >
                <History className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className="btn p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => saveSettings({ ...settings, darkMode: !settings.darkMode })}
                className="btn p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                title="Toggle Theme"
              >
                {settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-wide py-8">
        {/* Mode Selection */}
        <div className="grid-responsive mb-8">
          {Object.entries(CONVERSATION_MODES).map(([key, mode]) => {
            const IconComponent = mode.icon;
            const isActive = currentMode === key;
            
            return (
              <button
                key={key}
                onClick={() => setCurrentMode(key as ConversationMode)}
                className={`card p-6 text-left transition-all duration-300 hover:scale-105 ${
                  isActive 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${mode.color} flex-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{mode.title}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400">{mode.description}</p>
              </button>
            );
          })}
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          {/* Recording Interface */}
          <div className="card-responsive mb-6">
            <div className="text-center">
              {/* Audio Visualizer */}
              <div className="mb-6">
                <div className={`${styles.audioVisualizer} mx-auto`}>
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className={`${styles.audioBar} ${
                        processingState === 'recording' ? styles.active : ''
                      }`}
                      style={{
                        height: processingState === 'recording' 
                          ? `${Math.max(10, audioLevel * 100 + Math.random() * 20)}%`
                          : '10%',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Recording Button */}
              <div className="mb-6">
                <button
                  onClick={processingState === 'recording' ? stopRecording : startRecording}
                  disabled={processingState === 'processing'}
                  className={`w-24 h-24 rounded-full flex-center transition-all duration-300 shadow-lg hover:scale-110 ${
                    processingState === 'recording'
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                      : processingState === 'processing'
                      ? 'bg-yellow-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                  aria-label={processingState === 'recording' ? 'Stop Recording' : 'Start Recording'}
                >
                  {processingState === 'recording' ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : processingState === 'processing' ? (
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              {/* Status */}
              <div className="mb-4">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {processingState === 'idle' && 'Ready to listen'}
                  {processingState === 'recording' && `Recording... ${formatDuration(recordingDuration)}`}
                  {processingState === 'processing' && 'Processing your request...'}
                  {processingState === 'playing' && 'Playing response...'}
                  {processingState === 'error' && 'Error occurred'}
                </p>
                
                {processingState === 'recording' && (
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Click the button or press Ctrl+Space to stop
                  </p>
                )}
              </div>

              {/* Controls */}
              {(response || processingState === 'playing') && (
                <div className="flex-center gap-2">
                  <button
                    onClick={playResponse}
                    className="btn btn-primary"
                    disabled={processingState === 'playing'}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Response
                  </button>
                  
                  {processingState === 'playing' && (
                    <button
                      onClick={stopAudio}
                      className="btn bg-red-500 text-white hover:bg-red-600"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Stop
                    </button>
                  )}
                  
                  <button
                    onClick={resetSession}
                    className="btn bg-gray-500 text-white hover:bg-gray-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-error mb-6">
              <p>{error}</p>
            </div>
          )}

          {/* Transcript and Response */}
          {(transcript || response) && (
            <div className="space-y-4">
              {transcript && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Your Message</h3>
                  </div>
                  <p className="text-gray-700 dark:text-slate-300">{transcript}</p>
                </div>
              )}
              
              {response && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI Response</h3>
                  </div>
                  <p className="text-gray-700 dark:text-slate-300">{response}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* API Key */}
              <div className="form-group">
                <label className="form-label">Google API Key</label>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => saveSettings({ ...settings, apiKey: e.target.value })}
                    className="input flex-1"
                    placeholder="Enter your Google API key"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="btn p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Get your API key from Google AI Studio
                </p>
              </div>

              {/* Voice Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Voice</label>
                  <select
                    value={settings.voice}
                    onChange={(e) => saveSettings({ ...settings, voice: e.target.value as any })}
                    className="input"
                  >
                    <option value="alloy">Alloy</option>
                    <option value="echo">Echo</option>
                    <option value="fable">Fable</option>
                    <option value="onyx">Onyx</option>
                    <option value="nova">Nova</option>
                    <option value="shimmer">Shimmer</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Speed: {settings.speed}x</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.speed}
                    onChange={(e) => saveSettings({ ...settings, speed: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 dark:text-white">Preferences</h3>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.autoPlay}
                    onChange={(e) => saveSettings({ ...settings, autoPlay: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Auto-play responses</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.saveHistory}
                    onChange={(e) => saveSettings({ ...settings, saveHistory: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300">Save conversation history</span>
                </label>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowSettings(false)}
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="modal-backdrop" onClick={() => setShowHistory(false)}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conversation History</h2>
              <div className="flex items-center gap-2">
                {sessions.length > 0 && (
                  <>
                    <button
                      onClick={exportSessions}
                      className="btn btn-sm bg-green-500 text-white hover:bg-green-600"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </button>
                    
                    <button
                      onClick={clearSessions}
                      className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Clear
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <FileAudio className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-slate-400">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => {
                    const mode = CONVERSATION_MODES[session.mode];
                    const IconComponent = mode.icon;
                    
                    return (
                      <div key={session.id} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-6 h-6 rounded ${mode.color} flex-center`}>
                            <IconComponent className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {mode.title}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {new Date(session.timestamp).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-slate-400">
                            {formatDuration(session.duration)}
                          </span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-slate-300">You: </span>
                            <span className="text-gray-600 dark:text-slate-400">{session.transcript}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-slate-300">AI: </span>
                            <span className="text-gray-600 dark:text-slate-400">{session.response}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowHistory(false)}
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-wide">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
