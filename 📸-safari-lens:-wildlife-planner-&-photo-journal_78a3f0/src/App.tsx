import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Calendar, Camera, MapPin, Plus, Search, Filter, Download, Upload, 
  Settings, User, LogOut, Eye, Edit, Trash2, Target, Binoculars,
  TreePalm, Sun, Moon, CloudRain, Thermometer, Clock, Tag, Star,
  FileImage, Database, TrendingUp, Map, Compass, Book, Heart,
  ChevronRight, ChevronLeft, X, Check, AlertCircle, Zap, Globe
} from 'lucide-react';

// Types and Interfaces
interface Safari {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  targetWildlife: string[];
  weather: string;
  equipment: string[];
  notes: string;
  budget: number;
  photos: string[];
  createdAt: string;
}

interface Photo {
  id: string;
  safariId: string;
  filename: string;
  url: string;
  species: string;
  location: string;
  captureDate: string;
  cameraSettings: {
    iso: string;
    aperture: string;
    shutterSpeed: string;
    focalLength: string;
  };
  weather: string;
  notes: string;
  rating: number;
  tags: string[];
  aiAnalysis?: {
    species: string;
    confidence: number;
    characteristics: string[];
    habitat: string;
    behavior: string;
  };
}

interface WildlifeSpecies {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  habitat: string;
  behavior: string;
  bestTimeToSpot: string;
  locations: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  imageUrl: string;
}

type TabType = 'dashboard' | 'safaris' | 'photos' | 'wildlife' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [safaris, setSafaris] = useState<Safari[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [wildlifeDatabase, setWildlifeDatabase] = useState<WildlifeSpecies[]>([]);

  // UI State
  const [selectedSafari, setSelectedSafari] = useState<Safari | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showSafariModal, setShowSafariModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);

  // Form State
  const [safariForm, setSafariForm] = useState<Partial<Safari>>({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    targetWildlife: [],
    weather: '',
    equipment: [],
    notes: '',
    budget: 0
  });

  const [photoForm, setPhotoForm] = useState<Partial<Photo>>({
    filename: '',
    species: '',
    location: '',
    captureDate: '',
    cameraSettings: {
      iso: '',
      aperture: '',
      shutterSpeed: '',
      focalLength: ''
    },
    weather: '',
    notes: '',
    rating: 0,
    tags: []
  });

  // Dark Mode Hook
  const useDarkMode = () => {
    const [isDark, setIsDark] = useState(false);
    
    useEffect(() => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
      
      setIsDark(shouldUseDark);
      document.documentElement.classList.toggle('dark', shouldUseDark);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem('theme')) {
          setIsDark(e.matches);
          document.documentElement.classList.toggle('dark', e.matches);
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    
    const toggleDarkMode = () => {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', newIsDark);
    };
    
    return { isDark, toggleDarkMode };
  };

  const { isDark, toggleDarkMode } = useDarkMode();

  // Load data from localStorage
  useEffect(() => {
    const savedSafaris = localStorage.getItem('safari_safaris');
    const savedPhotos = localStorage.getItem('safari_photos');
    const savedWildlife = localStorage.getItem('safari_wildlife');

    if (savedSafaris) {
      setSafaris(JSON.parse(savedSafaris));
    } else {
      // Initialize with sample data
      const sampleSafaris: Safari[] = [
        {
          id: '1',
          name: 'Masai Mara Big Five Safari',
          location: 'Masai Mara, Kenya',
          startDate: '2025-07-15',
          endDate: '2025-07-22',
          status: 'planned',
          targetWildlife: ['Lion', 'Elephant', 'Leopard', 'Buffalo', 'Rhino'],
          weather: 'Dry season, 20-28°C',
          equipment: ['Canon 5D Mark IV', '100-400mm lens', 'Tripod', 'Extra batteries'],
          notes: 'Great migration season. Focus on river crossings.',
          budget: 3500,
          photos: [],
          createdAt: '2025-06-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Serengeti Wildlife Photography',
          location: 'Serengeti, Tanzania',
          startDate: '2025-08-10',
          endDate: '2025-08-17',
          status: 'completed',
          targetWildlife: ['Cheetah', 'Wildebeest', 'Zebra', 'Giraffe'],
          weather: 'Dry season, excellent visibility',
          equipment: ['Sony A7R IV', '70-200mm lens', 'Drone'],
          notes: 'Captured amazing migration footage.',
          budget: 4200,
          photos: ['photo1', 'photo2'],
          createdAt: '2025-06-10T08:00:00Z'
        }
      ];
      setSafaris(sampleSafaris);
      localStorage.setItem('safari_safaris', JSON.stringify(sampleSafaris));
    }

    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    } else {
      // Initialize with sample photos
      const samplePhotos: Photo[] = [
        {
          id: 'photo1',
          safariId: '2',
          filename: 'cheetah_hunt.jpg',
          url: '/api/placeholder/400/300',
          species: 'Cheetah',
          location: 'Serengeti Plains',
          captureDate: '2025-08-12T15:30:00Z',
          cameraSettings: {
            iso: '800',
            aperture: 'f/5.6',
            shutterSpeed: '1/1000s',
            focalLength: '200mm'
          },
          weather: 'Sunny, clear',
          notes: 'Incredible hunting sequence captured',
          rating: 5,
          tags: ['action', 'predator', 'hunt'],
          aiAnalysis: {
            species: 'Acinonyx jubatus',
            confidence: 95,
            characteristics: ['spotted coat', 'lean build', 'long legs'],
            habitat: 'Open grasslands',
            behavior: 'Hunting behavior observed'
          }
        }
      ];
      setPhotos(samplePhotos);
      localStorage.setItem('safari_photos', JSON.stringify(samplePhotos));
    }

    if (savedWildlife) {
      setWildlifeDatabase(JSON.parse(savedWildlife));
    } else {
      // Initialize wildlife database
      const wildlifeData: WildlifeSpecies[] = [
        {
          id: 'w1',
          name: 'African Lion',
          scientificName: 'Panthera leo',
          category: 'Big Cat',
          habitat: 'Savanna, grasslands',
          behavior: 'Social, pride-based hunting',
          bestTimeToSpot: 'Early morning, late afternoon',
          locations: ['Masai Mara', 'Serengeti', 'Kruger'],
          difficulty: 'Medium',
          description: 'The king of the jungle, actually prefers open savanna.',
          imageUrl: '/api/placeholder/300/200'
        },
        {
          id: 'w2',
          name: 'African Elephant',
          scientificName: 'Loxodonta africana',
          category: 'Pachyderm',
          habitat: 'Savanna, forests',
          behavior: 'Highly intelligent, family groups',
          bestTimeToSpot: 'Near water sources',
          locations: ['Amboseli', 'Chobe', 'Tarangire'],
          difficulty: 'Easy',
          description: 'Largest land mammal with complex social structures.',
          imageUrl: '/api/placeholder/300/200'
        }
      ];
      setWildlifeDatabase(wildlifeData);
      localStorage.setItem('safari_wildlife', JSON.stringify(wildlifeData));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('safari_safaris', JSON.stringify(safaris));
  }, [safaris]);

  useEffect(() => {
    localStorage.setItem('safari_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('safari_wildlife', JSON.stringify(wildlifeDatabase));
  }, [wildlifeDatabase]);

  // Safari Management Functions
  const createSafari = () => {
    const newSafari: Safari = {
      id: Date.now().toString(),
      name: safariForm.name || '',
      location: safariForm.location || '',
      startDate: safariForm.startDate || '',
      endDate: safariForm.endDate || '',
      status: 'planned',
      targetWildlife: safariForm.targetWildlife || [],
      weather: safariForm.weather || '',
      equipment: safariForm.equipment || [],
      notes: safariForm.notes || '',
      budget: safariForm.budget || 0,
      photos: [],
      createdAt: new Date().toISOString()
    };

    setSafaris(prev => [...prev, newSafari]);
    setShowSafariModal(false);
    resetSafariForm();
  };

  const updateSafari = () => {
    if (!selectedSafari) return;

    setSafaris(prev => prev.map(safari => 
      safari.id === selectedSafari.id ? { ...safari, ...safariForm } : safari
    ));
    setShowSafariModal(false);
    setSelectedSafari(null);
    resetSafariForm();
  };

  const deleteSafari = (safariId: string) => {
    setSafaris(prev => prev.filter(safari => safari.id !== safariId));
    setPhotos(prev => prev.filter(photo => photo.safariId !== safariId));
  };

  const resetSafariForm = () => {
    setSafariForm({
      name: '',
      location: '',
      startDate: '',
      endDate: '',
      targetWildlife: [],
      weather: '',
      equipment: [],
      notes: '',
      budget: 0
    });
    setSelectedSafari(null);
  };

  // Photo Management Functions
  const addPhoto = () => {
    if (!photoForm.safariId) return;

    const newPhoto: Photo = {
      id: Date.now().toString(),
      safariId: photoForm.safariId,
      filename: photoForm.filename || '',
      url: selectedFile ? URL.createObjectURL(selectedFile) : '',
      species: photoForm.species || '',
      location: photoForm.location || '',
      captureDate: photoForm.captureDate || new Date().toISOString(),
      cameraSettings: photoForm.cameraSettings || {
        iso: '',
        aperture: '',
        shutterSpeed: '',
        focalLength: ''
      },
      weather: photoForm.weather || '',
      notes: photoForm.notes || '',
      rating: photoForm.rating || 0,
      tags: photoForm.tags || []
    };

    setPhotos(prev => [...prev, newPhoto]);
    
    // Update safari photos list
    setSafaris(prev => prev.map(safari => 
      safari.id === photoForm.safariId 
        ? { ...safari, photos: [...safari.photos, newPhoto.id] }
        : safari
    ));

    setShowPhotoModal(false);
    resetPhotoForm();
  };

  const deletePhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      setSafaris(prev => prev.map(safari => 
        safari.id === photo.safariId 
          ? { ...safari, photos: safari.photos.filter(id => id !== photoId) }
          : safari
      ));
    }
  };

  const resetPhotoForm = () => {
    setPhotoForm({
      filename: '',
      species: '',
      location: '',
      captureDate: '',
      cameraSettings: {
        iso: '',
        aperture: '',
        shutterSpeed: '',
        focalLength: ''
      },
      weather: '',
      notes: '',
      rating: 0,
      tags: []
    });
    setSelectedPhoto(null);
    setSelectedFile(null);
  };

  // AI Functions
  const analyzePhotoWithAI = (file: File) => {
    const prompt = `Analyze this wildlife photograph and extract information in JSON format with the following fields:
    {
      "species": "Common name of the animal",
      "scientific_name": "Scientific name",
      "confidence": "Confidence percentage as number",
      "characteristics": ["list", "of", "visible", "characteristics"],
      "habitat": "Typical habitat description",
      "behavior": "Observed behavior description",
      "photography_tips": "Tips for photographing this species",
      "best_time": "Best time to spot this animal",
      "conservation_status": "Conservation status if known"
    }`;

    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(prompt, file);
  };

  const processAIResult = (result: string) => {
    try {
      const data = JSON.parse(result);
      if (selectedPhoto) {
        const updatedPhoto = {
          ...selectedPhoto,
          species: data.species || selectedPhoto.species,
          aiAnalysis: {
            species: data.scientific_name || data.species,
            confidence: data.confidence || 0,
            characteristics: data.characteristics || [],
            habitat: data.habitat || '',
            behavior: data.behavior || ''
          }
        };

        setPhotos(prev => prev.map(photo => 
          photo.id === selectedPhoto.id ? updatedPhoto : photo
        ));
        setSelectedPhoto(updatedPhoto);
      }
    } catch (error) {
      console.error('Failed to parse AI result:', error);
    }
  };

  // Utility Functions
  const getFilteredSafaris = () => {
    return safaris.filter(safari => {
      const matchesSearch = safari.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           safari.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || safari.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const getFilteredPhotos = () => {
    return photos.filter(photo => {
      const matchesSearch = photo.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           photo.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  };

  const exportData = () => {
    const dataToExport = {
      safaris,
      photos: photos.map(photo => ({ ...photo, url: undefined })), // Remove URLs for export
      wildlifeDatabase,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safari-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.safaris) setSafaris(data.safaris);
        if (data.photos) setPhotos(data.photos);
        if (data.wildlifeDatabase) setWildlifeDatabase(data.wildlifeDatabase);
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    setSafaris([]);
    setPhotos([]);
    setWildlifeDatabase([]);
    localStorage.removeItem('safari_safaris');
    localStorage.removeItem('safari_photos');
    localStorage.removeItem('safari_wildlife');
  };

  // Handle escape key for modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSafariModal(false);
        setShowPhotoModal(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle AI result
  useEffect(() => {
    if (aiResult) {
      processAIResult(aiResult);
    }
  }, [aiResult]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Binoculars className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Safari Planner
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Please log in to access your wildlife photography companion
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-green-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-amber-500 rounded-xl">
                <Binoculars className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-amber-600 bg-clip-text text-transparent">
                  Safari Planner
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Wildlife Photography Companion</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <User className="w-4 h-4" />
                <span>Welcome, {currentUser.first_name}</span>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={logout}
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 mt-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { key: 'safaris', label: 'Safaris', icon: Map },
              { key: 'photos', label: 'Photos', icon: Camera },
              { key: 'wildlife', label: 'Wildlife DB', icon: Database },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                id={`${key}-tab`}
                onClick={() => setActiveTab(key as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key
                    ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div id="generation_issue_fallback">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center">
                <h2 className="heading-2 text-gray-900 dark:text-white mb-2">
                  Welcome to your Safari Dashboard
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Plan your next wildlife adventure and manage your photography collection
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Safaris</p>
                      <p className="text-3xl font-bold">{safaris.length}</p>
                    </div>
                    <Map className="w-12 h-12 text-green-200" />
                  </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Photos Captured</p>
                      <p className="text-3xl font-bold">{photos.length}</p>
                    </div>
                    <Camera className="w-12 h-12 text-blue-200" />
                  </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100">Species Documented</p>
                      <p className="text-3xl font-bold">{new Set(photos.map(p => p.species)).size}</p>
                    </div>
                    <Target className="w-12 h-12 text-amber-200" />
                  </div>
                </div>

                <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Active Safaris</p>
                      <p className="text-3xl font-bold">{safaris.filter(s => s.status === 'active').length}</p>
                    </div>
                    <TreePalm className="w-12 h-12 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Safaris */}
                <div className="card card-padding">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="heading-5">Upcoming Safaris</h3>
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="space-y-4">
                    {safaris.filter(s => s.status === 'planned').slice(0, 3).map((safari) => (
                      <div key={safari.id} className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="w-2 h-12 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{safari.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {safari.location}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {new Date(safari.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                    {safaris.filter(s => s.status === 'planned').length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No upcoming safaris planned</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Photos */}
                <div className="card card-padding">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="heading-5">Recent Photos</h3>
                    <Camera className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {photos.slice(0, 6).map((photo) => (
                      <div
                        key={photo.id}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setActiveTab('photos');
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs font-medium">{photo.species}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Safaris Tab */}
          {activeTab === 'safaris' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h2 className="heading-3 text-gray-900 dark:text-white">Safari Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Plan and manage your wildlife photography expeditions</p>
                </div>
                <button
                  onClick={() => setShowSafariModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Safari
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search safaris..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="select"
                >
                  <option value="all">All Status</option>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Safaris Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredSafaris().map((safari) => (
                  <div key={safari.id} className="card card-hover">
                    <div className="card-header">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="heading-6 text-gray-900 dark:text-white">{safari.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {safari.location}
                          </p>
                        </div>
                        <span className={`badge ${
                          safari.status === 'planned' ? 'badge-primary' :
                          safari.status === 'active' ? 'badge-warning' : 'badge-success'
                        }`}>
                          {safari.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(safari.startDate).toLocaleDateString()} - {new Date(safari.endDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Target className="w-4 h-4" />
                          <span>{safari.targetWildlife.length} target species</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Camera className="w-4 h-4" />
                          <span>{safari.photos?.length || 0} photos</span>
                        </div>

                        {safari.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {safari.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedSafari(safari);
                            setSafariForm(safari);
                            setShowSafariModal(true);
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSafari(safari.id)}
                          className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {getFilteredSafaris().length === 0 && (
                <div className="text-center py-12">
                  <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No safaris found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Start planning your first safari adventure!'}
                  </p>
                  {!searchTerm && filterStatus === 'all' && (
                    <button
                      onClick={() => setShowSafariModal(true)}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Safari
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h2 className="heading-3 text-gray-900 dark:text-white">Photo Gallery</h2>
                  <p className="text-gray-600 dark:text-gray-400">Organize and analyze your wildlife photography</p>
                </div>
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Photo
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by species, location, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredPhotos().map((photo) => (
                  <div key={photo.id} className="card card-hover">
                    <div className="relative aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < photo.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{photo.species}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {photo.location}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(photo.captureDate).toLocaleDateString()}
                        </p>
                        
                        {photo.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {photo.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="badge badge-gray text-xs">
                                {tag}
                              </span>
                            ))}
                            {photo.tags.length > 3 && (
                              <span className="badge badge-gray text-xs">
                                +{photo.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {photo.aiAnalysis && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                              <Zap className="w-3 h-3" />
                              <span>AI Analysis: {photo.aiAnalysis.confidence}% confidence</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="card-footer">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedPhoto(photo)}
                          className="btn btn-ghost btn-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePhoto(photo.id)}
                          className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {getFilteredPhotos().length === 0 && (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No photos found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Start building your wildlife photography collection!'}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowPhotoModal(true)}
                      className="btn btn-primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Photo
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Wildlife Database Tab */}
          {activeTab === 'wildlife' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <h2 className="heading-3 text-gray-900 dark:text-white">Wildlife Database</h2>
                  <p className="text-gray-600 dark:text-gray-400">Comprehensive information about wildlife species</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search wildlife species..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>

              {/* Wildlife Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wildlifeDatabase
                  .filter(species => 
                    species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    species.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    species.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((species) => (
                  <div key={species.id} className="card card-hover">
                    <div className="relative aspect-video bg-gradient-to-br from-green-200 to-amber-200 dark:from-green-900 dark:to-amber-900 rounded-t-lg overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TreePalm className="w-12 h-12 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`badge ${
                          species.difficulty === 'Easy' ? 'badge-success' :
                          species.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
                        }`}>
                          {species.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <div className="space-y-3">
                        <div>
                          <h3 className="heading-6 text-gray-900 dark:text-white">{species.name}</h3>
                          <p className="text-sm italic text-gray-600 dark:text-gray-400">{species.scientificName}</p>
                          <span className="badge badge-primary text-xs mt-1">{species.category}</span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400">{species.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <Globe className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-700 dark:text-gray-300">Habitat:</p>
                              <p className="text-gray-600 dark:text-gray-400">{species.habitat}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-700 dark:text-gray-300">Best Time:</p>
                              <p className="text-gray-600 dark:text-gray-400">{species.bestTimeToSpot}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {wildlifeDatabase
                .filter(species => 
                  species.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  species.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  species.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .length === 0 && (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No species found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="heading-3 text-gray-900 dark:text-white">Settings</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your app preferences and data</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appearance Settings */}
                <div className="card card-padding">
                  <h3 className="heading-5 text-gray-900 dark:text-white mb-4">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark themes</p>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={`toggle ${isDark ? 'toggle-checked' : ''}`}
                        aria-label="Toggle dark mode"
                      >
                        <div className="toggle-thumb"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Management */}
                <div className="card card-padding">
                  <h3 className="heading-5 text-gray-900 dark:text-white mb-4">Data Management</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-2">Export Data</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Download all your safari and photo data</p>
                      <button onClick={exportData} className="btn btn-secondary btn-sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </button>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-2">Import Data</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Import previously exported data</p>
                      <label className="btn btn-secondary btn-sm cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Import Data
                        <input
                          type="file"
                          accept=".json"
                          onChange={importData}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-2">Clear All Data</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Remove all safaris, photos, and settings</p>
                      <button
                        onClick={clearAllData}
                        className="btn btn-error btn-sm"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* App Statistics */}
                <div className="card card-padding lg:col-span-2">
                  <h3 className="heading-5 text-gray-900 dark:text-white mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{safaris.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Safaris</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{photos.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Photos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">{new Set(photos.map(p => p.species)).size}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Species</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{wildlifeDatabase.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Database Entries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Safari Modal */}
      {showSafariModal && (
        <div className="modal-backdrop" onClick={() => setShowSafariModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5 text-gray-900 dark:text-white">
                {selectedSafari ? 'Edit Safari' : 'Create New Safari'}
              </h3>
              <button
                onClick={() => setShowSafariModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="modal-body">
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Safari Name</label>
                    <input
                      type="text"
                      value={safariForm.name || ''}
                      onChange={(e) => setSafariForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      placeholder="e.g., Masai Mara Adventure"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      value={safariForm.location || ''}
                      onChange={(e) => setSafariForm(prev => ({ ...prev, location: e.target.value }))}
                      className="input"
                      placeholder="e.g., Masai Mara, Kenya"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={safariForm.startDate || ''}
                      onChange={(e) => setSafariForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      value={safariForm.endDate || ''}
                      onChange={(e) => setSafariForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Target Wildlife (comma-separated)</label>
                  <input
                    type="text"
                    value={safariForm.targetWildlife?.join(', ') || ''}
                    onChange={(e) => setSafariForm(prev => ({ 
                      ...prev, 
                      targetWildlife: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    className="input"
                    placeholder="e.g., Lion, Elephant, Cheetah"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Weather Conditions</label>
                  <input
                    type="text"
                    value={safariForm.weather || ''}
                    onChange={(e) => setSafariForm(prev => ({ ...prev, weather: e.target.value }))}
                    className="input"
                    placeholder="e.g., Dry season, 20-28°C"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Equipment (comma-separated)</label>
                  <input
                    type="text"
                    value={safariForm.equipment?.join(', ') || ''}
                    onChange={(e) => setSafariForm(prev => ({ 
                      ...prev, 
                      equipment: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    className="input"
                    placeholder="e.g., Canon 5D, 100-400mm lens, Tripod"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Budget (USD)</label>
                  <input
                    type="number"
                    value={safariForm.budget || ''}
                    onChange={(e) => setSafariForm(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="input"
                    placeholder="0"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={safariForm.notes || ''}
                    onChange={(e) => setSafariForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="textarea"
                    rows={3}
                    placeholder="Additional notes about this safari..."
                  />
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowSafariModal(false);
                  resetSafariForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={selectedSafari ? updateSafari : createSafari}
                className="btn btn-primary"
                disabled={!safariForm.name || !safariForm.location}
              >
                {selectedSafari ? 'Update Safari' : 'Create Safari'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="modal-backdrop" onClick={() => setShowPhotoModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5 text-gray-900 dark:text-white">Add New Photo</h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="modal-body">
              <form className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Upload Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setPhotoForm(prev => ({ ...prev, filename: file.name }));
                      }
                    }}
                    className="input"
                  />
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={() => selectedFile && analyzePhotoWithAI(selectedFile)}
                        disabled={isAiLoading}
                        className="btn btn-primary btn-xs ml-auto"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {isAiLoading ? 'Analyzing...' : 'AI Analyze'}
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Safari</label>
                  <select
                    value={photoForm.safariId || ''}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, safariId: e.target.value }))}
                    className="select"
                  >
                    <option value="">Select a safari</option>
                    {safaris.map(safari => (
                      <option key={safari.id} value={safari.id}>{safari.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Species</label>
                    <input
                      type="text"
                      value={photoForm.species || ''}
                      onChange={(e) => setPhotoForm(prev => ({ ...prev, species: e.target.value }))}
                      className="input"
                      placeholder="e.g., African Lion"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      value={photoForm.location || ''}
                      onChange={(e) => setPhotoForm(prev => ({ ...prev, location: e.target.value }))}
                      className="input"
                      placeholder="e.g., Masai Mara Plains"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Capture Date & Time</label>
                  <input
                    type="datetime-local"
                    value={photoForm.captureDate ? new Date(photoForm.captureDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, captureDate: new Date(e.target.value).toISOString() }))}
                    className="input"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="form-group">
                    <label className="form-label">ISO</label>
                    <input
                      type="text"
                      value={photoForm.cameraSettings?.iso || ''}
                      onChange={(e) => setPhotoForm(prev => ({ 
                        ...prev, 
                        cameraSettings: { ...prev.cameraSettings, iso: e.target.value }
                      }))}
                      className="input"
                      placeholder="800"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Aperture</label>
                    <input
                      type="text"
                      value={photoForm.cameraSettings?.aperture || ''}
                      onChange={(e) => setPhotoForm(prev => ({ 
                        ...prev, 
                        cameraSettings: { ...prev.cameraSettings, aperture: e.target.value }
                      }))}
                      className="input"
                      placeholder="f/5.6"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Shutter Speed</label>
                    <input
                      type="text"
                      value={photoForm.cameraSettings?.shutterSpeed || ''}
                      onChange={(e) => setPhotoForm(prev => ({ 
                        ...prev, 
                        cameraSettings: { ...prev.cameraSettings, shutterSpeed: e.target.value }
                      }))}
                      className="input"
                      placeholder="1/1000s"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Focal Length</label>
                    <input
                      type="text"
                      value={photoForm.cameraSettings?.focalLength || ''}
                      onChange={(e) => setPhotoForm(prev => ({ 
                        ...prev, 
                        cameraSettings: { ...prev.cameraSettings, focalLength: e.target.value }
                      }))}
                      className="input"
                      placeholder="200mm"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPhotoForm(prev => ({ ...prev, rating: i + 1 }))}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            i < (photoForm.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={photoForm.tags?.join(', ') || ''}
                    onChange={(e) => setPhotoForm(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    className="input"
                    placeholder="e.g., action, hunting, predator"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={photoForm.notes || ''}
                    onChange={(e) => setPhotoForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="textarea"
                    rows={3}
                    placeholder="Notes about this photo..."
                  />
                </div>

                {/* AI Analysis Results */}
                {aiResult && (
                  <div className="form-group">
                    <label className="form-label">AI Analysis Result</label>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {aiResult}
                      </pre>
                    </div>
                  </div>
                )}

                {aiError && (
                  <div className="alert alert-error">
                    <AlertCircle className="w-4 h-4" />
                    <span>AI Analysis failed: {aiError.message || 'Unknown error'}</span>
                  </div>
                )}
              </form>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowPhotoModal(false);
                  resetPhotoForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addPhoto}
                className="btn btn-primary"
                disabled={!photoForm.safariId || !photoForm.species}
              >
                Add Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && activeTab === 'photos' && (
        <div className="modal-backdrop" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5 text-gray-900 dark:text-white">{selectedPhoto.species}</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Photo */}
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < selectedPhoto.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedPhoto.captureDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Details */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{selectedPhoto.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(selectedPhoto.captureDate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Camera Settings</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>ISO: {selectedPhoto.cameraSettings.iso}</div>
                      <div>Aperture: {selectedPhoto.cameraSettings.aperture}</div>
                      <div>Shutter: {selectedPhoto.cameraSettings.shutterSpeed}</div>
                      <div>Focal: {selectedPhoto.cameraSettings.focalLength}</div>
                    </div>
                  </div>
                  
                  {selectedPhoto.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedPhoto.tags.map((tag) => (
                          <span key={tag} className="badge badge-gray">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedPhoto.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPhoto.notes}</p>
                    </div>
                  )}
                  
                  {selectedPhoto.aiAnalysis && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        AI Analysis
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Species: </span>
                          <span>{selectedPhoto.aiAnalysis.species}</span>
                          <span className="ml-2 badge badge-success text-xs">
                            {selectedPhoto.aiAnalysis.confidence}% confidence
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Habitat: </span>
                          <span>{selectedPhoto.aiAnalysis.habitat}</span>
                        </div>
                        <div>
                          <span className="font-medium">Behavior: </span>
                          <span>{selectedPhoto.aiAnalysis.behavior}</span>
                        </div>
                        {selectedPhoto.aiAnalysis.characteristics.length > 0 && (
                          <div>
                            <span className="font-medium">Characteristics: </span>
                            <span>{selectedPhoto.aiAnalysis.characteristics.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-green-200 dark:border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;