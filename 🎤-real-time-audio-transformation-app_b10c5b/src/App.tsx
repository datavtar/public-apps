import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Settings, Play, Pause, Volume2, VolumeX, Trash2, MessageCircle, Key, Download, Upload } from 'lucide-react';

interface AudioMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  audioUrl?: string;
  timestamp: Date;
  duration?: number;
}

interface AppSettings {
  apiKey: string;
  autoPlay: boolean;
  saveHistory: boolean;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'playing';

const App: React.FC = () => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [messages, setMessages] = useState<AudioMessage[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    apiKey: '',
    autoPlay: true,
    saveHistory: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('audioAppSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings) as AppSettings;
        setSettings(parsed);
        setIsApiKeySet(!!parsed.apiKey);
      }

      const savedMessages = localStorage.getItem('audioAppMessages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages) as AudioMessage[];
        setMessages(parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (err) {
      console.error('Error loading saved data:', err);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      localStorage.setItem('audioAppSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      setIsApiKeySet(!!newSettings.apiKey);
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  }, []);

  // Save messages to localStorage
  const saveMessages = useCallback((newMessages: AudioMessage[]) => {
    try {
      if (settings.saveHistory) {
        localStorage.setItem('audioAppMessages', JSON.stringify(newMessages));
      }
      setMessages(newMessages);
    } catch (err) {
      console.error('Error saving messages:', err);
    }
  }, [settings.saveHistory]);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    setAudioLevel(average / 255);

    if (recordingState === 'recording') {
      requestAnimationFrame(monitorAudioLevel);
    }
  }, [recordingState]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isApiKeySet) {
      setError('Please set your Google API Key in settings first.');
      setShowSettings(true);
      return;
    }

    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Set up audio context for level monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudioWithGemini(audioBlob);
      };
      
      mediaRecorder.start(100);
      setRecordingState('recording');
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start audio level monitoring
      monitorAudioLevel();
      
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  }, [isApiKeySet, monitorAudioLevel]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      setRecordingState('processing');
      setAudioLevel(0);
    }
  }, [recordingState]);

  // Process audio with Gemini Live API (Mock implementation)
  const processAudioWithGemini = useCallback(async (audioBlob: Blob) => {
    try {
      setError('');
      
      // Create audio URL for user message
      const userAudioUrl = URL.createObjectURL(audioBlob);
      
      // Convert audio to text (mock - in real implementation, you'd use Gemini's speech-to-text)
      const userText = 'User audio message';
      
      const userMessage: AudioMessage = {
        id: Date.now().toString(),
        type: 'user',
        text: userText,
        audioUrl: userAudioUrl,
        timestamp: new Date(),
        duration: recordingTime
      };
      
      // Mock API call to Gemini Live API
      // In real implementation, you would:
      // 1. Send audio to Gemini Live API with your API key
      // 2. Receive processed audio response
      // 3. Convert response to audio blob
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay
      
      // Mock AI response
      const aiText = `AI response to your ${recordingTime} second audio message. This is a simulated response from Gemini Live API.`;
      
      // Create mock audio response (text-to-speech would happen here)
      const aiMessage: AudioMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: aiText,
        timestamp: new Date(),
        duration: 3
      };
      
      const newMessages = [...messages, userMessage, aiMessage];
      saveMessages(newMessages);
      
      setRecordingState('idle');
      
      // Auto-play AI response if enabled
      if (settings.autoPlay) {
        // In real implementation, play the AI audio response
        console.log('Auto-playing AI response');
      }
      
    } catch (err) {
      setError('Failed to process audio with Gemini API. Please check your API key and try again.');
      setRecordingState('idle');
      console.error('Gemini API error:', err);
    }
  }, [messages, recordingTime, settings.autoPlay, saveMessages]);

  // Play audio message
  const playAudio = useCallback((message: AudioMessage) => {
    if (!message.audioUrl) return;
    
    const audio = new Audio(message.audioUrl);
    setCurrentPlayingId(message.id);
    
    audio.onended = () => {
      setCurrentPlayingId(null);
    };
    
    audio.onerror = () => {
      setError('Failed to play audio');
      setCurrentPlayingId(null);
    };
    
    audio.play().catch(err => {
      setError('Failed to play audio');
      setCurrentPlayingId(null);
      console.error('Audio play error:', err);
    });
  }, []);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all conversation history?')) {
      setMessages([]);
      localStorage.removeItem('audioAppMessages');
    }
  }, []);

  // Export conversation
  const exportConversation = useCallback(() => {
    const csvContent = [
      ['Timestamp', 'Type', 'Text', 'Duration'],
      ...messages.map(msg => [
        msg.timestamp.toISOString(),
        msg.type,
        msg.text,
        msg.duration?.toString() || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [messages]);

  // Format time
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Handle key press for recording
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !showSettings) {
        e.preventDefault();
        if (recordingState === 'idle') {
          startRecording();
        } else if (recordingState === 'recording') {
          stopRecording();
        }
      }
      if (e.code === 'Escape') {
        setShowSettings(false);
        setError('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [recordingState, showSettings, startRecording, stopRecording]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 theme-transition">
      <div className="container-fluid max-w-4xl">
        {/* Header */}
        <header className="flex-between py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Voice Chat</h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">Powered by Gemini Live API</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isApiKeySet && (
              <span className="badge badge-warning text-xs">API Key Required</span>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="btn p-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg theme-transition"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Recording Interface */}
        <div className="card-responsive text-center mb-8">
          <div className="flex flex-col items-center gap-6">
            {/* Recording Button */}
            <div className="relative">
              <button
                onMouseDown={recordingState === 'idle' ? startRecording : undefined}
                onMouseUp={recordingState === 'recording' ? stopRecording : undefined}
                onTouchStart={recordingState === 'idle' ? startRecording : undefined}
                onTouchEnd={recordingState === 'recording' ? stopRecording : undefined}
                disabled={recordingState === 'processing' || !isApiKeySet}
                className={`
                  w-24 h-24 sm:w-32 sm:h-32 rounded-full flex-center transition-all duration-300 transform
                  ${
                    recordingState === 'recording'
                      ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-lg shadow-red-500/30'
                      : recordingState === 'processing'
                      ? 'bg-yellow-500 animate-pulse'
                      : isApiKeySet
                      ? 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-lg'
                      : 'bg-gray-400 cursor-not-allowed'
                  }
                  text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/50
                `}
                aria-label={recordingState === 'recording' ? 'Stop recording' : 'Start recording'}
              >
                {recordingState === 'recording' ? (
                  <MicOff className="w-8 h-8 sm:w-10 sm:h-10" />
                ) : recordingState === 'processing' ? (
                  <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce" />
                ) : (
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
                )}
              </button>
              
              {/* Audio level indicator */}
              {recordingState === 'recording' && (
                <div className="absolute -inset-4 rounded-full border-4 border-red-500 animate-ping opacity-75" 
                     style={{ transform: `scale(${1 + audioLevel * 0.5})` }} />
              )}
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {
                  recordingState === 'idle' && isApiKeySet
                    ? 'Hold to speak or press Space'
                    : recordingState === 'idle' && !isApiKeySet
                    ? 'Set API Key to start'
                    : recordingState === 'recording'
                    ? `Recording... ${formatTime(recordingTime)}`
                    : recordingState === 'processing'
                    ? 'Processing with Gemini AI...'
                    : 'Ready'
                }
              </p>
              
              {recordingState === 'recording' && (
                <div className="mt-2 w-32 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="h-full bg-red-500 transition-all duration-100"
                    style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conversation History */}
        {messages.length > 0 && (
          <div className="card-responsive">
            <div className="flex-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conversation History</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportConversation}
                  className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                  aria-label="Export conversation"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={clearHistory}
                  className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                  aria-label="Clear history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`
                    flex gap-3 p-4 rounded-lg
                    ${message.type === 'user' 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 ml-8' 
                      : 'bg-gray-50 dark:bg-slate-800 mr-8'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex-center
                    ${message.type === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-600 text-white'
                    }
                  `}>
                    {message.type === 'user' ? (
                      <Mic className="w-4 h-4" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.type === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 dark:text-slate-300 mb-2">{message.text}</p>
                    
                    <div className="flex items-center gap-2">
                      {message.audioUrl && (
                        <button
                          onClick={() => playAudio(message)}
                          disabled={currentPlayingId === message.id}
                          className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          aria-label="Play audio"
                        >
                          {currentPlayingId === message.id ? (
                            <Pause className="w-3 h-3" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                        </button>
                      )}
                      
                      {message.duration && (
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {formatTime(message.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
                  aria-label="Close settings"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* API Key */}
                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Google API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => saveSettings({...settings, apiKey: e.target.value})}
                    placeholder="Enter your Google API Key"
                    className="input"
                  />
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Required for Gemini Live API access. Your key is stored locally.
                  </p>
                </div>
                
                {/* Auto-play */}
                <div className="flex-between">
                  <div>
                    <label className="form-label mb-0">Auto-play AI responses</label>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Automatically play AI audio responses
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoPlay}
                      onChange={(e) => saveSettings({...settings, autoPlay: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
                
                {/* Save History */}
                <div className="flex-between">
                  <div>
                    <label className="form-label mb-0">Save conversation history</label>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Store conversations in browser storage
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.saveHistory}
                      onChange={(e) => saveSettings({...settings, saveHistory: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {messages.length === 0 && (
          <div className="card-responsive bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">How to use:</h3>
            <ul className="space-y-2 text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                Set your Google API Key in settings
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                Hold the microphone button or press Space to record
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                Release to process your audio with Gemini AI
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                Listen to AI responses and continue the conversation
              </li>
            </ul>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;