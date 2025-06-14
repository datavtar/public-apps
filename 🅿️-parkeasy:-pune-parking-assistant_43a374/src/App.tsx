import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  MapPin, Search, Car, Clock, CreditCard, Star, Filter, Navigation,
  Settings, User, History, ChevronRight, ChevronLeft, X, Check,
  Shield, Camera, Wifi, Accessibility, Moon, Sun, Download, Upload,
  FileText, Plus, Edit, Trash2, Eye, Phone, Mail, Building, Zap
} from 'lucide-react';

// Types and Interfaces
interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerHour: number;
  totalSpots: number;
  availableSpots: number;
  amenities: string[];
  rating: number;
  reviews: number;
  distance: number;
  type: 'mall' | 'street' | 'private' | 'office' | 'residential';
  security: boolean;
  covered: boolean;
  image: string;
}

interface Booking {
  id: string;
  spotId: string;
  spotName: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalCost: number;
  status: 'active' | 'completed' | 'cancelled';
  vehicleNumber: string;
}

interface SearchFilters {
  maxPrice: number;
  maxDistance: number;
  type: string;
  amenities: string[];
  minRating: number;
}

interface User {
  name: string;
  email: string;
  phone: string;
  vehicleNumbers: string[];
  preferences: {
    preferredAmenities: string[];
    maxWalkingDistance: number;
    budgetRange: [number, number];
  };
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Theme Management
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

  // State Management
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'bookings' | 'profile' | 'settings'>('home');
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userProfile, setUserProfile] = useState<User>({
    name: currentUser?.first_name + ' ' + currentUser?.last_name || '',
    email: currentUser?.email || '',
    phone: '',
    vehicleNumbers: [],
    preferences: {
      preferredAmenities: [],
      maxWalkingDistance: 500,
      budgetRange: [20, 200]
    }
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    maxPrice: 200,
    maxDistance: 5,
    type: 'all',
    amenities: [],
    minRating: 0
  });

  // Booking States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    duration: 2,
    vehicleNumber: ''
  });

  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);
  const [showAiChat, setShowAiChat] = useState(false);

  // Settings States
  const [showSettings, setShowSettings] = useState(false);
  const [appSettings, setAppSettings] = useState({
    language: 'en',
    currency: 'INR',
    notifications: true,
    autoRefresh: true,
    theme: 'system'
  });

  // Initialize Sample Data
  useEffect(() => {
    const initializeData = () => {
      const sampleSpots: ParkingSpot[] = [
        {
          id: '1',
          name: 'Phoenix MarketCity Mall',
          address: 'Viman Nagar, Pune',
          latitude: 18.5679,
          longitude: 73.9143,
          pricePerHour: 30,
          totalSpots: 500,
          availableSpots: 120,
          amenities: ['Security', 'CCTV', 'Covered', 'Wheelchair Access', 'Car Wash'],
          rating: 4.5,
          reviews: 1250,
          distance: 2.3,
          type: 'mall',
          security: true,
          covered: true,
          image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400'
        },
        {
          id: '2',
          name: 'FC Road Street Parking',
          address: 'Fergusson College Road, Pune',
          latitude: 18.5196,
          longitude: 73.8553,
          pricePerHour: 15,
          totalSpots: 200,
          availableSpots: 45,
          amenities: ['Security Guard', 'CCTV'],
          rating: 3.8,
          reviews: 890,
          distance: 1.5,
          type: 'street',
          security: true,
          covered: false,
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'
        },
        {
          id: '3',
          name: 'Koregaon Park Premium Parking',
          address: 'Koregaon Park, Pune',
          latitude: 18.5362,
          longitude: 73.8958,
          pricePerHour: 50,
          totalSpots: 150,
          availableSpots: 78,
          amenities: ['Valet Service', 'Security', 'CCTV', 'Covered', 'EV Charging', 'WiFi'],
          rating: 4.8,
          reviews: 567,
          distance: 3.2,
          type: 'private',
          security: true,
          covered: true,
          image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'
        },
        {
          id: '4',
          name: 'Hinjewadi IT Park',
          address: 'Hinjewadi Phase 1, Pune',
          latitude: 18.5912,
          longitude: 73.7389,
          pricePerHour: 25,
          totalSpots: 800,
          availableSpots: 234,
          amenities: ['24/7 Security', 'CCTV', 'Covered', 'EV Charging'],
          rating: 4.2,
          reviews: 2100,
          distance: 12.5,
          type: 'office',
          security: true,
          covered: true,
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400'
        },
        {
          id: '5',
          name: 'Baner Residential Complex',
          address: 'Baner, Pune',
          latitude: 18.5593,
          longitude: 73.7759,
          pricePerHour: 20,
          totalSpots: 100,
          availableSpots: 32,
          amenities: ['Security', 'CCTV', 'Wheelchair Access'],
          rating: 4.0,
          reviews: 445,
          distance: 8.7,
          type: 'residential',
          security: true,
          covered: false,
          image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400'
        }
      ];

      const savedSpots = localStorage.getItem('parkingSpots');
      if (savedSpots) {
        setParkingSpots(JSON.parse(savedSpots));
      } else {
        setParkingSpots(sampleSpots);
        localStorage.setItem('parkingSpots', JSON.stringify(sampleSpots));
      }

      const savedBookings = localStorage.getItem('bookings');
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }

      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }

      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setAppSettings(JSON.parse(savedSettings));
      }
    };

    initializeData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('parkingSpots', JSON.stringify(parkingSpots));
  }, [parkingSpots]);

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Filter parking spots based on search and filters
  const filteredSpots = parkingSpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         spot.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = spot.pricePerHour <= filters.maxPrice;
    const matchesDistance = spot.distance <= filters.maxDistance;
    const matchesType = filters.type === 'all' || spot.type === filters.type;
    const matchesRating = spot.rating >= filters.minRating;
    const matchesAmenities = filters.amenities.length === 0 || 
                           filters.amenities.every(amenity => spot.amenities.includes(amenity));

    return matchesSearch && matchesPrice && matchesDistance && matchesType && matchesRating && matchesAmenities;
  });

  // Handle AI-powered parking search
  const handleAiSearch = () => {
    if (!aiPrompt.trim()) {
      setAiError("Please describe your parking needs");
      return;
    }

    setAiResult(null);
    setAiError(null);

    const enhancedPrompt = `${aiPrompt}

    Based on the user's parking request, analyze their needs and provide parking recommendations in JSON format with the following structure:
    {
      "analysis": "Brief analysis of user requirements",
      "recommendations": [
        {
          "spotId": "matching spot ID from available spots",
          "reason": "why this spot matches their needs",
          "priority": "high/medium/low"
        }
      ],
      "searchFilters": {
        "maxPrice": number,
        "type": "mall/street/private/office/residential or all",
        "requiredAmenities": ["list of required amenities"]
      }
    }

    Available parking spots in Pune:
    ${JSON.stringify(parkingSpots.map(spot => ({
      id: spot.id,
      name: spot.name,
      address: spot.address,
      pricePerHour: spot.pricePerHour,
      type: spot.type,
      amenities: spot.amenities,
      rating: spot.rating,
      distance: spot.distance,
      availableSpots: spot.availableSpots
    })))}`;

    aiLayerRef.current?.sendToAI(enhancedPrompt);
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    try {
      const aiResponse = JSON.parse(result);
      if (aiResponse.searchFilters) {
        setFilters(prev => ({
          ...prev,
          ...aiResponse.searchFilters,
          amenities: aiResponse.searchFilters.requiredAmenities || []
        }));
      }
      if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
        const recommendedSpotId = aiResponse.recommendations[0].spotId;
        const recommendedSpot = parkingSpots.find(spot => spot.id === recommendedSpotId);
        if (recommendedSpot) {
          setSelectedSpot(recommendedSpot);
        }
      }
      setActiveTab('search');
    } catch (error) {
      // If not JSON, treat as markdown response
      console.log('AI response in markdown format');
    }
  };

  // Handle booking
  const handleBooking = () => {
    if (!selectedSpot || !bookingForm.startTime || !bookingForm.vehicleNumber) {
      alert('Please fill all booking details');
      return;
    }

    const newBooking: Booking = {
      id: Date.now().toString(),
      spotId: selectedSpot.id,
      spotName: selectedSpot.name,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: new Date(new Date(`${bookingForm.date}T${bookingForm.startTime}`).getTime() + bookingForm.duration * 60 * 60 * 1000).toTimeString().slice(0, 5),
      duration: bookingForm.duration,
      totalCost: selectedSpot.pricePerHour * bookingForm.duration,
      status: 'active',
      vehicleNumber: bookingForm.vehicleNumber
    };

    setBookings(prev => [...prev, newBooking]);
    
    // Update available spots
    setParkingSpots(prev => prev.map(spot => 
      spot.id === selectedSpot.id 
        ? { ...spot, availableSpots: spot.availableSpots - 1 }
        : spot
    ));

    setShowBookingModal(false);
    setSelectedSpot(null);
    setActiveTab('bookings');
    
    // Reset booking form
    setBookingForm({
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      duration: 2,
      vehicleNumber: ''
    });
  };

  // Cancel booking
  const cancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      
      // Restore available spot
      setParkingSpots(prev => prev.map(spot => 
        spot.id === booking.spotId 
          ? { ...spot, availableSpots: spot.availableSpots + 1 }
          : spot
      ));
    }
  };

  // Export data
  const exportData = () => {
    const data = {
      bookings,
      userProfile,
      settings: appSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parkeasy-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import data
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.bookings) setBookings(data.bookings);
        if (data.userProfile) setUserProfile(data.userProfile);
        if (data.settings) setAppSettings(data.settings);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  // Clear all data
  const clearAllData = () => {
    const confirmClear = window.confirm ? false : true; // Avoid using window.confirm
    if (confirmClear) {
      setBookings([]);
      setUserProfile({
        name: currentUser?.first_name + ' ' + currentUser?.last_name || '',
        email: currentUser?.email || '',
        phone: '',
        vehicleNumbers: [],
        preferences: {
          preferredAmenities: [],
          maxWalkingDistance: 500,
          budgetRange: [20, 200]
        }
      });
      localStorage.clear();
      alert('All data cleared successfully!');
    }
  };

  // Render Home Tab
  const renderHome = () => (
    <div id="welcome_fallback" className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to ParkEasy</h2>
        <p className="opacity-90 mb-4">Find and book parking spots across Pune with ease</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <Car className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">{parkingSpots.reduce((sum, spot) => sum + spot.availableSpots, 0)}</div>
            <div className="text-xs opacity-75">Available Spots</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-1" />
            <div className="text-sm font-medium">{parkingSpots.length}</div>
            <div className="text-xs opacity-75">Locations</div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          AI Parking Assistant
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Describe your parking needs and let AI find the perfect spot for you!
        </p>
        <div className="space-y-3">
          <textarea
            id="ai-prompt-input"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., I need secure parking near FC Road for 3 hours under ₹100"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <button
            id="ai-search-button"
            onClick={handleAiSearch}
            disabled={aiLoading}
            className="w-full btn btn-primary flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {aiLoading ? 'Searching...' : 'Find Parking with AI'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          id="quick-search-button"
          onClick={() => setActiveTab('search')}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-left hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <Search className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold">Quick Search</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Browse all available parking spots</p>
        </button>

        <button
          id="my-bookings-button"
          onClick={() => setActiveTab('bookings')}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-left hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-6 w-6 text-green-600" />
            <h3 className="font-semibold">My Bookings</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">View and manage your reservations</p>
        </button>
      </div>

      {bookings.filter(b => b.status === 'active').length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Active Bookings</h3>
          <div className="space-y-3">
            {bookings.filter(b => b.status === 'active').slice(0, 2).map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium">{booking.spotName}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {booking.date} • {booking.startTime} - {booking.endTime}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">₹{booking.totalCost}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{booking.vehicleNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Search Tab
  const renderSearch = () => (
    <div id="search-tab" className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by location or parking name..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            id="filter-button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div id="filters-panel" className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Max Price (₹/hour)</label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 dark:text-gray-300">₹{filters.maxPrice}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Distance (km)</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 dark:text-gray-300">{filters.maxDistance} km</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Parking Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="mall">Mall</option>
                  <option value="street">Street</option>
                  <option value="private">Private</option>
                  <option value="office">Office</option>
                  <option value="residential">Residential</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSpots.map(spot => (
          <div key={spot.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative">
              <img
                src={spot.image}
                alt={spot.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-sm font-medium">
                ₹{spot.pricePerHour}/hr
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{spot.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{spot.rating}</span>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {spot.address} • {spot.distance} km
              </p>
              <div className="flex items-center gap-2 mb-3">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  spot.availableSpots > 20 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  spot.availableSpots > 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {spot.availableSpots} spots available
                </div>
                {spot.security && (
                  <div className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium">
                    Secure
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {spot.amenities.slice(0, 3).map(amenity => (
                  <span key={amenity} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    {amenity}
                  </span>
                ))}
                {spot.amenities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                    +{spot.amenities.length - 3} more
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedSpot(spot)}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => {
                    setSelectedSpot(spot);
                    setShowBookingModal(true);
                  }}
                  className="flex-1 btn btn-primary text-sm"
                  disabled={spot.availableSpots === 0}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSpots.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No parking spots found</h3>
          <p className="text-gray-600 dark:text-gray-300">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );

  // Render Bookings Tab
  const renderBookings = () => (
    <div id="bookings-tab" className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === 'active').length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'completed').length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{bookings.filter(b => b.status === 'cancelled').length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Cancelled</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{booking.spotName}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Booking ID: {booking.id}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Date</div>
                  <div className="font-medium">{booking.date}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Time</div>
                  <div className="font-medium">{booking.startTime} - {booking.endTime}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Vehicle</div>
                  <div className="font-medium">{booking.vehicleNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Cost</div>
                  <div className="font-medium text-green-600">₹{booking.totalCost}</div>
                </div>
              </div>
              {booking.status === 'active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="btn btn-error btn-sm"
                  >
                    Cancel Booking
                  </button>
                  <button className="btn btn-secondary btn-sm flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    Navigate
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings yet</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Start by searching for parking spots</p>
            <button
              onClick={() => setActiveTab('search')}
              className="btn btn-primary"
            >
              Find Parking
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render Profile Tab
  const renderProfile = () => (
    <div id="profile-tab" className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{userProfile.name}</h2>
            <p className="opacity-90">{userProfile.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              value={userProfile.phone}
              onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Vehicle Numbers</label>
            <div className="space-y-2">
              {userProfile.vehicleNumbers.map((vehicle, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={vehicle}
                    onChange={(e) => {
                      const newVehicles = [...userProfile.vehicleNumbers];
                      newVehicles[index] = e.target.value;
                      setUserProfile(prev => ({ ...prev, vehicleNumbers: newVehicles }));
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="MH12AB1234"
                  />
                  <button
                    onClick={() => {
                      const newVehicles = userProfile.vehicleNumbers.filter((_, i) => i !== index);
                      setUserProfile(prev => ({ ...prev, vehicleNumbers: newVehicles }));
                    }}
                    className="btn btn-error btn-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setUserProfile(prev => ({ 
                  ...prev, 
                  vehicleNumbers: [...prev.vehicleNumbers, ''] 
                }))}
                className="btn btn-secondary btn-sm flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Parking Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Maximum Walking Distance: {userProfile.preferences.maxWalkingDistance}m
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={userProfile.preferences.maxWalkingDistance}
              onChange={(e) => setUserProfile(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  maxWalkingDistance: parseInt(e.target.value)
                }
              }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Budget Range: ₹{userProfile.preferences.budgetRange[0]} - ₹{userProfile.preferences.budgetRange[1]} per hour
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="10"
                max="100"
                value={userProfile.preferences.budgetRange[0]}
                onChange={(e) => setUserProfile(prev => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    budgetRange: [parseInt(e.target.value), prev.preferences.budgetRange[1]]
                  }
                }))}
                className="flex-1"
              />
              <input
                type="range"
                min="50"
                max="300"
                value={userProfile.preferences.budgetRange[1]}
                onChange={(e) => setUserProfile(prev => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    budgetRange: [prev.preferences.budgetRange[0], parseInt(e.target.value)]
                  }
                }))}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
        <div className="space-y-3">
          <button
            onClick={exportData}
            className="w-full btn btn-secondary flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export My Data
          </button>
          <label className="w-full btn btn-secondary flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
          <button
            onClick={logout}
            className="w-full btn btn-error flex items-center justify-center gap-2"
          >
            <User className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  // Render Settings Tab
  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          App Settings
        </h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Appearance</h3>
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDark ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Language & Region</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={appSettings.language}
                  onChange={(e) => setAppSettings(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  value={appSettings.currency}
                  onChange={(e) => setAppSettings(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Push Notifications</span>
                <button
                  onClick={() => setAppSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    appSettings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      appSettings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>Auto Refresh</span>
                <button
                  onClick={() => setAppSettings(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    appSettings.autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      appSettings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Data Management</h3>
            <div className="space-y-3">
              <button
                onClick={clearAllData}
                className="w-full btn btn-error flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <h3 className="font-medium mb-4">About ParkEasy</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p>Version 1.0.0</p>
          <p>Smart parking solution for Pune city</p>
          <p>Developed with ❤️ for commuters</p>
        </div>
      </div>
    </div>
  );

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ParkEasy</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {currentUser?.first_name}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-6 p-2">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'home', label: 'Home', icon: Building },
              { id: 'search', label: 'Search', icon: Search },
              { id: 'bookings', label: 'Bookings', icon: Clock },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'home' && renderHome()}
          {activeTab === 'search' && renderSearch()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Book Parking Spot</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium mb-2">{selectedSpot.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{selectedSpot.address}</p>
                  <p className="text-lg font-semibold text-blue-600 mt-2">₹{selectedSpot.pricePerHour}/hour</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                  <select
                    value={bookingForm.duration}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={3}>3 hours</option>
                    <option value={4}>4 hours</option>
                    <option value={6}>6 hours</option>
                    <option value={8}>8 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Vehicle Number</label>
                  <select
                    value={bookingForm.vehicleNumber}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select vehicle</option>
                    {userProfile.vehicleNumbers.map(vehicle => (
                      <option key={vehicle} value={vehicle}>{vehicle}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Cost:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{selectedSpot.pricePerHour * bookingForm.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {bookingForm.duration} hours × ₹{selectedSpot.pricePerHour}/hour
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    className="flex-1 btn btn-primary"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spot Details Modal */}
      {selectedSpot && !showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedSpot.image}
                alt={selectedSpot.name}
                className="w-full h-48 object-cover rounded-t-2xl"
              />
              <button
                onClick={() => setSelectedSpot(null)}
                className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{selectedSpot.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedSpot.address}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">₹{selectedSpot.pricePerHour}/hr</div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{selectedSpot.rating}</span>
                    <span className="text-gray-500">({selectedSpot.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedSpot.availableSpots}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Available Spots</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedSpot.distance} km</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Distance</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Amenities</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedSpot.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSpot(null)}
                  className="flex-1 btn btn-secondary"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="flex-1 btn btn-primary"
                  disabled={selectedSpot.availableSpots === 0}
                >
                  Book This Spot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Result Modal */}
      {aiResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AI Parking Recommendations</h3>
                <button
                  onClick={() => setAiResult(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResult}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AILayer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={handleAiResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;