import React, { useState, useEffect } from 'react';
import {
  Home,
  Building,
  Search,
  User,
  ChevronDown,
  MapPin,
  Bed,
  Bath,
  ArrowLeftRight,
  Plus,
  Edit,
  Trash2,
  Heart,
  Calendar,
  Phone,
  Mail,
  X,
  Moon,
  Sun,
  Filter,
  CreditCard,
  DollarSign,
  UserPlus,
  Camera
} from 'lucide-react';
import { Camera as ReactCameraProCamera } from 'react-camera-pro';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsChart, Pie, Cell, Legend } from 'recharts';
import styles from './styles/styles.module.css';

// Types
type Property = {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  description: string;
  images: string[];
  isFeatured: boolean;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  latitude: number;
  longitude: number;
};

type PropertyType = 'Apartment' | 'House' | 'Condo' | 'Townhouse' | 'Land';

type PropertyStatus = 'For Sale' | 'For Rent' | 'Sold' | 'Pending';

type PropertyFilter = {
  type: PropertyType | '';
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  minBathrooms: number;
  status: PropertyStatus | '';
  searchTerm: string;
};

type Appointment = {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
  status: AppointmentStatus;
  createdAt: string;
};

type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

type Tab = 'properties' | 'appointments' | 'analytics' | 'profile';

type ThemeMode = 'light' | 'dark';

const App: React.FC = () => {
  // States
  const [properties, setProperties] = useState<Property[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isViewPropertyModalOpen, setIsViewPropertyModalOpen] = useState(false);
  const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false);
  const [isScheduleAppointmentModalOpen, setIsScheduleAppointmentModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [filters, setFilters] = useState<PropertyFilter>({
    type: '',
    minPrice: 0,
    maxPrice: 10000000,
    minBedrooms: 0,
    minBathrooms: 0,
    status: '',
    searchTerm: '',
  });
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [cameraInstance, setCameraInstance] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const [newProperty, setNewProperty] = useState<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>({ 
    title: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    price: 0,
    type: 'House',
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    yearBuilt: new Date().getFullYear(),
    description: '',
    images: [],
    isFeatured: false,
    status: 'For Sale',
    isFavorite: false,
    latitude: 40.7128,
    longitude: -74.0060,
  });
  
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id' | 'createdAt' | 'status'>>({ 
    propertyId: '',
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: '',
  });

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedProperties = localStorage.getItem('properties');
    const savedAppointments = localStorage.getItem('appointments');
    const savedThemeMode = localStorage.getItem('themeMode') as ThemeMode | null;
    
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    } else {
      // Initialize with sample data if no saved data
      setProperties(sampleProperties);
    }
    
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    } else {
      setAppointments(sampleAppointments);
    }
    
    if (savedThemeMode) {
      setThemeMode(savedThemeMode);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Toggle dark mode
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFilters(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Filter properties based on current filters
  const filteredProperties = properties.filter(property => {
    const matchesType = !filters.type || property.type === filters.type;
    const matchesPrice = property.price >= filters.minPrice && 
                         (filters.maxPrice === 0 || property.price <= filters.maxPrice);
    const matchesBedrooms = property.bedrooms >= filters.minBedrooms;
    const matchesBathrooms = property.bathrooms >= filters.minBathrooms;
    const matchesStatus = !filters.status || property.status === filters.status;
    const matchesSearch = !filters.searchTerm || 
                         property.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         property.state.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    return matchesType && matchesPrice && matchesBedrooms && matchesBathrooms && matchesStatus && matchesSearch;
  });

  // Property CRUD Operations
  const addProperty = () => {
    const propertyToAdd: Property = {
      id: `property-${Date.now()}`,
      ...newProperty,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProperties(prev => [...prev, propertyToAdd]);
    setIsAddPropertyModalOpen(false);
    setNewProperty({ 
      title: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      price: 0,
      type: 'House',
      bedrooms: 0,
      bathrooms: 0,
      sqft: 0,
      yearBuilt: new Date().getFullYear(),
      description: '',
      images: [],
      isFeatured: false,
      status: 'For Sale',
      isFavorite: false,
      latitude: 40.7128,
      longitude: -74.0060,
    });
  };

  const updateProperty = () => {
    if (!selectedProperty) return;
    
    setProperties(prev => prev.map(property =>
      property.id === selectedProperty.id
        ? {
            ...selectedProperty,
            updatedAt: new Date().toISOString()
          }
        : property
    ));
    setIsEditPropertyModalOpen(false);
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(property => property.id !== id));
    // Also delete associated appointments
    setAppointments(prev => prev.filter(appointment => appointment.propertyId !== id));
  };

  const toggleFavorite = (id: string) => {
    setProperties(prev => prev.map(property =>
      property.id === id
        ? { ...property, isFavorite: !property.isFavorite }
        : property
    ));
  };

  // Appointment Operations
  const addAppointment = () => {
    if (!selectedProperty) return;
    
    const appointmentToAdd: Appointment = {
      id: `appointment-${Date.now()}`,
      ...newAppointment,
      propertyId: selectedProperty.id,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, appointmentToAdd]);
    setIsScheduleAppointmentModalOpen(false);
    setNewAppointment({ 
      propertyId: '',
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      message: '',
    });
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(appointment =>
      appointment.id === id
        ? { ...appointment, status }
        : appointment
    ));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  };

  // Handle form inputs
  const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number' || name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'sqft' || name === 'yearBuilt') {
      setNewProperty(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewProperty(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setNewProperty(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditPropertyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!selectedProperty) return;
    
    const { name, value, type } = e.target;
    
    if (type === 'number' || name === 'price' || name === 'bedrooms' || name === 'bathrooms' || name === 'sqft' || name === 'yearBuilt') {
      setSelectedProperty(prev => prev ? {
        ...prev,
        [name]: Number(value)
      } : null);
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSelectedProperty(prev => prev ? {
        ...prev,
        [name]: checked
      } : null);
    } else {
      setSelectedProperty(prev => prev ? {
        ...prev,
        [name]: value
      } : null);
    }
  };

  const handleAppointmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Camera handling
  const captureImage = () => {
    if (cameraInstance) {
      try {
        const photo = cameraInstance.takePhoto();
        setCapturedImage(photo);
        if (selectedProperty) {
          setSelectedProperty(prev => prev ? {
            ...prev,
            images: [...prev.images, photo]
          } : null);
        } else {
          setNewProperty(prev => ({
            ...prev,
            images: [...prev.images, photo]
          }));
        }
        setIsCameraModalOpen(false);
      } catch (error) {
        console.error("Error capturing image:", error);
      }
    }
  };

  // File upload handling for property images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(images => {
      if (isEditPropertyModalOpen && selectedProperty) {
        setSelectedProperty(prev => prev ? {
          ...prev,
          images: [...prev.images, ...images]
        } : null);
      } else {
        setNewProperty(prev => ({
          ...prev,
          images: [...prev.images, ...images]
        }));
      }
    });
  };

  const removeImage = (index: number) => {
    if (isEditPropertyModalOpen && selectedProperty) {
      setSelectedProperty(prev => prev ? {
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      } : null);
    } else {
      setNewProperty(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  // Analytics data preparation
  const getPropertyTypeDistribution = () => {
    const distribution: Record<PropertyType, number> = {
      'Apartment': 0,
      'House': 0,
      'Condo': 0,
      'Townhouse': 0,
      'Land': 0
    };

    properties.forEach(property => {
      distribution[property.type]++;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getPropertyStatusDistribution = () => {
    const distribution: Record<PropertyStatus, number> = {
      'For Sale': 0,
      'For Rent': 0,
      'Sold': 0,
      'Pending': 0
    };

    properties.forEach(property => {
      distribution[property.status]++;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getAppointmentStatusDistribution = () => {
    const distribution: Record<AppointmentStatus, number> = {
      'Pending': 0,
      'Confirmed': 0,
      'Cancelled': 0,
      'Completed': 0
    };

    appointments.forEach(appointment => {
      distribution[appointment.status]++;
    });

    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };

  const getPriceDistribution = () => {
    const priceRanges = [
      { range: '< $100k', count: 0 },
      { range: '$100k-$200k', count: 0 },
      { range: '$200k-$300k', count: 0 },
      { range: '$300k-$400k', count: 0 },
      { range: '$400k-$500k', count: 0 },
      { range: '> $500k', count: 0 }
    ];

    properties.forEach(property => {
      const price = property.price;
      if (price < 100000) {
        priceRanges[0].count++;
      } else if (price < 200000) {
        priceRanges[1].count++;
      } else if (price < 300000) {
        priceRanges[2].count++;
      } else if (price < 400000) {
        priceRanges[3].count++;
      } else if (price < 500000) {
        priceRanges[4].count++;
      } else {
        priceRanges[5].count++;
      }
    });

    return priceRanges;
  };

  // Utility functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPropertyById = (id: string) => {
    return properties.find(property => property.id === id);
  };

  // Keyboard handler for Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddPropertyModalOpen) setIsAddPropertyModalOpen(false);
        if (isViewPropertyModalOpen) setIsViewPropertyModalOpen(false);
        if (isEditPropertyModalOpen) setIsEditPropertyModalOpen(false);
        if (isScheduleAppointmentModalOpen) setIsScheduleAppointmentModalOpen(false);
        if (isCameraModalOpen) setIsCameraModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddPropertyModalOpen, isViewPropertyModalOpen, isEditPropertyModalOpen, isScheduleAppointmentModalOpen, isCameraModalOpen]);

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

  // Sample data for initial load
  const sampleProperties: Property[] = [
    {
      id: 'property-1',
      title: 'Modern Downtown Apartment',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      price: 450000,
      type: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      yearBuilt: 2015,
      description: 'Beautiful modern apartment in the heart of downtown. Features high ceilings, hardwood floors, and stainless steel appliances.',
      images: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1080&q=80'
      ],
      isFeatured: true,
      status: 'For Sale',
      createdAt: '2023-01-15T12:00:00Z',
      updatedAt: '2023-01-15T12:00:00Z',
      isFavorite: false,
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      id: 'property-2',
      title: 'Suburban Family Home',
      address: '456 Oak Avenue',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94110',
      price: 850000,
      type: 'House',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2500,
      yearBuilt: 2010,
      description: 'Spacious family home in a quiet suburban neighborhood. Includes large backyard, updated kitchen, and finished basement.',
      images: [
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80',
        'https://images.unsplash.com/photo-1592595896551-12b371d546d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
      ],
      isFeatured: true,
      status: 'For Sale',
      createdAt: '2023-02-20T15:30:00Z',
      updatedAt: '2023-02-20T15:30:00Z',
      isFavorite: true,
      latitude: 37.7749,
      longitude: -122.4194
    },
    {
      id: 'property-3',
      title: 'Luxury Waterfront Condo',
      address: '789 Harbor View',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      price: 1200000,
      type: 'Condo',
      bedrooms: 3,
      bathrooms: 3.5,
      sqft: 2200,
      yearBuilt: 2019,
      description: 'Stunning waterfront condo with panoramic views. Features include private balcony, marble countertops, and building amenities.',
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
      ],
      isFeatured: false,
      status: 'For Sale',
      createdAt: '2023-03-10T09:45:00Z',
      updatedAt: '2023-03-10T09:45:00Z',
      isFavorite: false,
      latitude: 25.7617,
      longitude: -80.1918
    },
    {
      id: 'property-4',
      title: 'Downtown Loft',
      address: '101 Industrial Way',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60606',
      price: 375000,
      type: 'Apartment',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 1100,
      yearBuilt: 1998,
      description: 'Converted industrial loft with exposed brick walls and high ceilings. Great downtown location near restaurants and nightlife.',
      images: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80'
      ],
      isFeatured: false,
      status: 'For Rent',
      createdAt: '2023-04-05T14:20:00Z',
      updatedAt: '2023-04-05T14:20:00Z',
      isFavorite: false,
      latitude: 41.8781,
      longitude: -87.6298
    },
    {
      id: 'property-5',
      title: 'Mountain View Cabin',
      address: '222 Forest Road',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      price: 320000,
      type: 'House',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1800,
      yearBuilt: 2005,
      description: 'Cozy cabin with beautiful mountain views. Perfect for nature lovers and those seeking a peaceful retreat.',
      images: [
        'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=782&q=80'
      ],
      isFeatured: true,
      status: 'Pending',
      createdAt: '2023-05-12T11:15:00Z',
      updatedAt: '2023-05-12T11:15:00Z',
      isFavorite: true,
      latitude: 39.7392,
      longitude: -104.9903
    }
  ];

  const sampleAppointments: Appointment[] = [
    {
      id: 'appointment-1',
      propertyId: 'property-1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '212-555-1234',
      date: '2023-06-15',
      time: '10:00',
      message: 'I would like to see this property as soon as possible.',
      status: 'Confirmed',
      createdAt: '2023-06-01T09:30:00Z'
    },
    {
      id: 'appointment-2',
      propertyId: 'property-2',
      name: 'Emily Johnson',
      email: 'emily.j@example.com',
      phone: '415-555-6789',
      date: '2023-06-18',
      time: '14:30',
      message: 'Interested in this home for my family. Looking forward to the tour.',
      status: 'Pending',
      createdAt: '2023-06-02T15:45:00Z'
    },
    {
      id: 'appointment-3',
      propertyId: 'property-3',
      name: 'Robert Williams',
      email: 'robwill@example.com',
      phone: '305-555-4321',
      date: '2023-06-20',
      time: '11:15',
      message: 'Very interested in this condo. Please confirm if the date works.',
      status: 'Cancelled',
      createdAt: '2023-06-03T10:20:00Z'
    },
    {
      id: 'appointment-4',
      propertyId: 'property-4',
      name: 'Sarah Miller',
      email: 'sarah.m@example.com',
      phone: '312-555-8765',
      date: '2023-06-22',
      time: '16:00',
      message: 'Looking for a place downtown and this loft seems perfect.',
      status: 'Completed',
      createdAt: '2023-06-04T13:10:00Z'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10 theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">RealEstate Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="theme-toggle"
                onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                aria-label={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {themeMode === 'light' ? 
                  <Moon className="h-4 w-4 text-gray-700" /> : 
                  <Sun className="h-4 w-4 text-yellow-400" />
                }
                <span className="theme-toggle-thumb"></span>
              </button>
              <div className="hidden md:flex items-center gap-2">
                <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Tabs */}
        <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'properties' ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('properties')}
            aria-label="View properties"
          >
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Properties</span>
            </div>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'appointments' ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('appointments')}
            aria-label="View appointments"
          >
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Appointments</span>
            </div>
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'analytics' ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('analytics')}
            aria-label="View analytics"
          >
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>Analytics</span>
            </div>
          </button>
        </div>

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div className="fade-in">
            {/* Filters */}
            <div className="card mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filter Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="searchTerm">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="searchTerm"
                      name="searchTerm"
                      type="text"
                      className="input pl-10"
                      placeholder="Search properties..."
                      value={filters.searchTerm}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    className="input"
                    value={filters.type}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="minPrice">Min Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="minPrice"
                      name="minPrice"
                      type="number"
                      min="0"
                      step="1000"
                      className="input pl-10"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="maxPrice">Max Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="maxPrice"
                      name="maxPrice"
                      type="number"
                      min="0"
                      step="1000"
                      className="input pl-10"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Bedrooms & Bathrooms</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Bed className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                        name="minBedrooms"
                        className="input pl-10"
                        value={filters.minBedrooms}
                        onChange={handleFilterChange}
                      >
                        <option value="0">Any Beds</option>
                        <option value="1">1+ Beds</option>
                        <option value="2">2+ Beds</option>
                        <option value="3">3+ Beds</option>
                        <option value="4">4+ Beds</option>
                      </select>
                    </div>
                    <div className="relative">
                      <Bath className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <select
                        name="minBathrooms"
                        className="input pl-10"
                        value={filters.minBathrooms}
                        onChange={handleFilterChange}
                      >
                        <option value="0">Any Baths</option>
                        <option value="1">1+ Baths</option>
                        <option value="2">2+ Baths</option>
                        <option value="3">3+ Baths</option>
                        <option value="4">4+ Baths</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  className="btn btn-primary flex items-center gap-1"
                  onClick={() => setIsAddPropertyModalOpen(true)}
                  aria-label="Add new property"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Property</span>
                </button>
                <button
                  className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                  onClick={() => setFilters({
                    type: '',
                    minPrice: 0,
                    maxPrice: 10000000,
                    minBedrooms: 0,
                    minBathrooms: 0,
                    status: '',
                    searchTerm: '',
                  })}
                  aria-label="Reset filters"
                >
                  <Filter className="h-4 w-4" />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>

            {/* Property Cards */}
            {filteredProperties.length === 0 ? (
              <div className="card text-center p-8">
                <p className="text-gray-600 dark:text-gray-400">No properties found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map(property => (
                  <div key={property.id} className="card overflow-hidden">
                    <div className="relative pb-[60%] mb-4 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                      {property.images && property.images.length > 0 ? (
                        <img 
                          src={property.images[0]} 
                          alt={property.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          className="btn-sm bg-white/80 text-gray-700 hover:bg-white rounded-full p-1.5 flex items-center justify-center backdrop-blur-sm"
                          onClick={() => toggleFavorite(property.id)}
                          aria-label={property.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`h-4 w-4 ${property.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className={`badge ${property.status === 'For Sale' ? 'badge-success' : property.status === 'For Rent' ? 'badge-info' : property.status === 'Pending' ? 'badge-warning' : 'badge-error'}`}>
                          {property.status}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{property.title}</h3>
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{property.address}, {property.city}, {property.state}</span>
                    </div>
                    <div className="flex justify-between mb-3">
                      <span className="font-bold text-gray-900 dark:text-white">{formatPrice(property.price)}</span>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5" />
                          <span>{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                          <span>{property.sqft} sqft</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button 
                        className="btn-sm btn-primary"
                        onClick={() => {
                          setSelectedProperty(property);
                          setIsViewPropertyModalOpen(true);
                        }}
                        aria-label={`View details for ${property.title}`}
                      >
                        View
                      </button>
                      <button 
                        className="btn-sm bg-amber-500 text-white hover:bg-amber-600"
                        onClick={() => {
                          setSelectedProperty(property);
                          setIsEditPropertyModalOpen(true);
                        }}
                        aria-label={`Edit ${property.title}`}
                      >
                        <Edit className="h-3.5 w-3.5 inline mr-1" />
                        Edit
                      </button>
                      <button 
                        className="btn-sm bg-red-500 text-white hover:bg-red-600"
                        onClick={() => deleteProperty(property.id)}
                        aria-label={`Delete ${property.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="fade-in">
            <div className="card mb-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Property Appointments</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="table-header px-4 py-3">Property</th>
                      <th className="table-header px-4 py-3">Client</th>
                      <th className="table-header px-4 py-3">Contact</th>
                      <th className="table-header px-4 py-3">Date & Time</th>
                      <th className="table-header px-4 py-3">Status</th>
                      <th className="table-header px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="table-cell text-center text-gray-500 dark:text-gray-400">
                          No appointments found.
                        </td>
                      </tr>
                    ) : (
                      appointments.map(appointment => {
                        const property = getPropertyById(appointment.propertyId);
                        return (
                          <tr key={appointment.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                            <td className="table-cell">
                              {property ? property.title : 'Unknown Property'}
                            </td>
                            <td className="table-cell">
                              {appointment.name}
                            </td>
                            <td className="table-cell">
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3.5 w-3.5 text-gray-500" />
                                  {appointment.email}
                                </span>
                                <span className="flex items-center gap-1 text-sm mt-1">
                                  <Phone className="h-3.5 w-3.5 text-gray-500" />
                                  {appointment.phone}
                                </span>
                              </div>
                            </td>
                            <td className="table-cell">
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                  {appointment.date}
                                </span>
                                <span className="text-sm text-gray-500 mt-1">
                                  {appointment.time}
                                </span>
                              </div>
                            </td>
                            <td className="table-cell">
                              <span className={`badge ${appointment.status === 'Confirmed' ? 'badge-success' : appointment.status === 'Pending' ? 'badge-warning' : appointment.status === 'Cancelled' ? 'badge-error' : 'badge-info'}`}>
                                {appointment.status}
                              </span>
                            </td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <select
                                  className="input input-sm"
                                  value={appointment.status}
                                  onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value as AppointmentStatus)}
                                  aria-label="Update appointment status"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Completed">Completed</option>
                                </select>
                                <button
                                  className="btn-sm bg-red-500 text-white hover:bg-red-600"
                                  onClick={() => deleteAppointment(appointment.id)}
                                  aria-label="Delete appointment"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="stat-card">
                <div className="stat-title">Total Properties</div>
                <div className="stat-value">{properties.length}</div>
                <div className="stat-desc">Properties in inventory</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">For Sale</div>
                <div className="stat-value">{properties.filter(p => p.status === 'For Sale').length}</div>
                <div className="stat-desc">Properties listed for sale</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">For Rent</div>
                <div className="stat-value">{properties.filter(p => p.status === 'For Rent').length}</div>
                <div className="stat-desc">Properties listed for rent</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Property Types</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsChart>
                      <Pie
                        data={getPropertyTypeDistribution()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {getPropertyTypeDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Property Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsChart>
                      <Pie
                        data={getPropertyStatusDistribution()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {getPropertyStatusDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Price Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getPriceDistribution()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appointment Status</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsChart>
                      <Pie
                        data={getAppointmentStatusDistribution()}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {getAppointmentStatusDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Map Overview</h3>
                <div className="h-80">
                  <MapContainer 
                    center={[40.7128, -74.0060]} 
                    zoom={3} 
                    style={{ height: '100%', width: '100%', borderRadius: 'var(--radius-md)' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {properties.map(property => (
                      <Marker
                        key={property.id}
                        position={[property.latitude, property.longitude]}
                      >
                        <Popup>
                          <div>
                            <h3 className="font-medium">{property.title}</h3>
                            <p className="text-sm">{property.address}, {property.city}</p>
                            <p className="text-sm font-bold mt-1">{formatPrice(property.price)}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 py-4 theme-transition">
        <div className="container-fluid">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Add Property Modal */}
      {isAddPropertyModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddPropertyModalOpen(false)}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Add New Property</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsAddPropertyModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="title">Property Title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className="input"
                    value={newProperty.title}
                    onChange={handlePropertyInputChange}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="type">Property Type</label>
                  <select
                    id="type"
                    name="type"
                    className="input"
                    value={newProperty.type}
                    onChange={handlePropertyInputChange}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="input"
                  value={newProperty.address}
                  onChange={handlePropertyInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    className="input"
                    value={newProperty.city}
                    onChange={handlePropertyInputChange}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    className="input"
                    value={newProperty.state}
                    onChange={handlePropertyInputChange}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="zipCode">Zip Code</label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    className="input"
                    value={newProperty.zipCode}
                    onChange={handlePropertyInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="price">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="1000"
                      className="input pl-10"
                      value={newProperty.price}
                      onChange={handlePropertyInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    value={newProperty.status}
                    onChange={handlePropertyInputChange}
                  >
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="bedrooms">Bedrooms</label>
                  <input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    className="input"
                    value={newProperty.bedrooms}
                    onChange={handlePropertyInputChange}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="bathrooms">Bathrooms</label>
                  <input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    className="input"
                    value={newProperty.bathrooms}
                    onChange={handlePropertyInputChange}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="sqft">Square Feet</label>
                  <input
                    id="sqft"
                    name="sqft"
                    type="number"
                    min="0"
                    className="input"
                    value={newProperty.sqft}
                    onChange={handlePropertyInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="yearBuilt">Year Built</label>
                  <input
                    id="yearBuilt"
                    name="yearBuilt"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="input"
                    value={newProperty.yearBuilt}
                    onChange={handlePropertyInputChange}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="isFeatured">Featured Property</label>
                  <div className="flex items-center mt-2">
                    <input
                      id="isFeatured"
                      name="isFeatured"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      checked={newProperty.isFeatured}
                      onChange={handlePropertyInputChange}
                    />
                    <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Mark as featured property
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="latitude">Latitude</label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    className="input"
                    value={newProperty.latitude}
                    onChange={handlePropertyInputChange}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="longitude">Longitude</label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    className="input"
                    value={newProperty.longitude}
                    onChange={handlePropertyInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="input"
                  value={newProperty.description}
                  onChange={handlePropertyInputChange}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label">Property Images</label>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {newProperty.images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img 
                        src={image} 
                        alt={`Property ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-1"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Plus className="h-6 w-6 text-gray-400" />
                    </label>
                    <button
                      className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsCameraModalOpen(true)}
                      aria-label="Take photo"
                    >
                      <Camera className="h-6 w-6 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setIsAddPropertyModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={addProperty}
              >
                Add Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Property Modal */}
      {isViewPropertyModalOpen && selectedProperty && (
        <div className="modal-backdrop" onClick={() => setIsViewPropertyModalOpen(false)}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">{selectedProperty.title}</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsViewPropertyModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="relative mb-6">
                {selectedProperty.images && selectedProperty.images.length > 0 ? (
                  <div className={styles.propertyGallery}>
                    {selectedProperty.images.map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`${selectedProperty.title} - ${index + 1}`}
                        className={`rounded-lg ${styles.galleryImage}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Building className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <button
                    className="btn-sm bg-white/80 text-gray-700 hover:bg-white rounded-full p-1.5 flex items-center justify-center backdrop-blur-sm"
                    onClick={() => toggleFavorite(selectedProperty.id)}
                    aria-label={selectedProperty.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`h-4 w-4 ${selectedProperty.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(selectedProperty.price)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`badge inline-block mt-1 ${selectedProperty.status === 'For Sale' ? 'badge-success' : selectedProperty.status === 'For Rent' ? 'badge-info' : selectedProperty.status === 'Pending' ? 'badge-warning' : 'badge-error'}`}>
                    {selectedProperty.status}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Property Type</span>
                  <span className="text-gray-900 dark:text-white">{selectedProperty.type}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Location</h4>
                <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}</span>
                </div>
                <div className="mt-4 h-64 rounded-lg overflow-hidden">
                  <MapContainer 
                    center={[selectedProperty.latitude, selectedProperty.longitude]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[selectedProperty.latitude, selectedProperty.longitude]}>
                      <Popup>
                        {selectedProperty.address}, {selectedProperty.city}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Bedrooms</span>
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    <span className="text-gray-900 dark:text-white">{selectedProperty.bedrooms}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Bathrooms</span>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    <span className="text-gray-900 dark:text-white">{selectedProperty.bathrooms}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Square Feet</span>
                  <div className="flex items-center gap-1">
                    <ArrowLeftRight className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    <span className="text-gray-900 dark:text-white">{selectedProperty.sqft}</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Year Built</span>
                  <span className="text-gray-900 dark:text-white">{selectedProperty.yearBuilt}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedProperty.description}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Property Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-2">
                    <span className="text-gray-600 dark:text-gray-400">Property ID</span>
                    <span className="text-gray-900 dark:text-white">{selectedProperty.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-2">
                    <span className="text-gray-600 dark:text-gray-400">Property Type</span>
                    <span className="text-gray-900 dark:text-white">{selectedProperty.type}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-2">
                    <span className="text-gray-600 dark:text-gray-400">Year Built</span>
                    <span className="text-gray-900 dark:text-white">{selectedProperty.yearBuilt}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-2">
                    <span className="text-gray-600 dark:text-gray-400">Featured</span>
                    <span className="text-gray-900 dark:text-white">{selectedProperty.isFeatured ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-2">
                    <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                    <span className="text-gray-900 dark:text-white">{formatDate(selectedProperty.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setIsViewPropertyModalOpen(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary flex items-center gap-1"
                onClick={() => {
                  setIsViewPropertyModalOpen(false);
                  setIsScheduleAppointmentModalOpen(true);
                }}
              >
                <UserPlus className="h-4 w-4" />
                <span>Schedule Appointment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {isEditPropertyModalOpen && selectedProperty && (
        <div className="modal-backdrop" onClick={() => setIsEditPropertyModalOpen(false)}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Edit Property</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsEditPropertyModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-title">Property Title</label>
                  <input
                    id="edit-title"
                    name="title"
                    type="text"
                    className="input"
                    value={selectedProperty.title}
                    onChange={handleEditPropertyInputChange}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-type">Property Type</label>
                  <select
                    id="edit-type"
                    name="type"
                    className="input"
                    value={selectedProperty.type}
                    onChange={handleEditPropertyInputChange}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-address">Address</label>
                <input
                  id="edit-address"
                  name="address"
                  type="text"
                  className="input"
                  value={selectedProperty.address}
                  onChange={handleEditPropertyInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-city">City</label>
                  <input
                    id="edit-city"
                    name="city"
                    type="text"
                    className="input"
                    value={selectedProperty.city}
                    onChange={handleEditPropertyInputChange}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-state">State</label>
                  <input
                    id="edit-state"
                    name="state"
                    type="text"
                    className="input"
                    value={selectedProperty.state}
                    onChange={handleEditPropertyInputChange}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-zipCode">Zip Code</label>
                  <input
                    id="edit-zipCode"
                    name="zipCode"
                    type="text"
                    className="input"
                    value={selectedProperty.zipCode}
                    onChange={handleEditPropertyInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-price">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      id="edit-price"
                      name="price"
                      type="number"
                      min="0"
                      step="1000"
                      className="input pl-10"
                      value={selectedProperty.price}
                      onChange={handleEditPropertyInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    className="input"
                    value={selectedProperty.status}
                    onChange={handleEditPropertyInputChange}
                  >
                    <option value="For Sale">For Sale</option>
                    <option value="For Rent">For Rent</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-bedrooms">Bedrooms</label>
                  <input
                    id="edit-bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    className="input"
                    value={selectedProperty.bedrooms}
                    onChange={handleEditPropertyInputChange}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-bathrooms">Bathrooms</label>
                  <input
                    id="edit-bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    className="input"
                    value={selectedProperty.bathrooms}
                    onChange={handleEditPropertyInputChange}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-sqft">Square Feet</label>
                  <input
                    id="edit-sqft"
                    name="sqft"
                    type="number"
                    min="0"
                    className="input"
                    value={selectedProperty.sqft}
                    onChange={handleEditPropertyInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-yearBuilt">Year Built</label>
                  <input
                    id="edit-yearBuilt"
                    name="yearBuilt"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    className="input"
                    value={selectedProperty.yearBuilt}
                    onChange={handleEditPropertyInputChange}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-isFeatured">Featured Property</label>
                  <div className="flex items-center mt-2">
                    <input
                      id="edit-isFeatured"
                      name="isFeatured"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      checked={selectedProperty.isFeatured}
                      onChange={handleEditPropertyInputChange}
                    />
                    <label htmlFor="edit-isFeatured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Mark as featured property
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-latitude">Latitude</label>
                  <input
                    id="edit-latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    className="input"
                    value={selectedProperty.latitude}
                    onChange={handleEditPropertyInputChange}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="edit-longitude">Longitude</label>
                  <input
                    id="edit-longitude"
                    name="longitude"
                    type="number"
                    step="0.000001"
                    className="input"
                    value={selectedProperty.longitude}
                    onChange={handleEditPropertyInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  className="input"
                  value={selectedProperty.description}
                  onChange={handleEditPropertyInputChange}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label">Property Images</label>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {selectedProperty.images.map((image, index) => (
                    <div key={index} className="relative w-24 h-24 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img 
                        src={image} 
                        alt={`Property ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-1"
                        onClick={() => removeImage(index)}
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Plus className="h-6 w-6 text-gray-400" />
                    </label>
                    <button
                      className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded flex items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsCameraModalOpen(true)}
                      aria-label="Take photo"
                    >
                      <Camera className="h-6 w-6 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setIsEditPropertyModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={updateProperty}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {isScheduleAppointmentModalOpen && selectedProperty && (
        <div className="modal-backdrop" onClick={() => setIsScheduleAppointmentModalOpen(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Schedule Appointment</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsScheduleAppointmentModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300">Property: <strong>{selectedProperty.title}</strong></p>
                <p className="text-gray-700 dark:text-gray-300">{selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}</p>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="name">Your Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  value={newAppointment.name}
                  onChange={handleAppointmentInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  value={newAppointment.email}
                  onChange={handleAppointmentInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  value={newAppointment.phone}
                  onChange={handleAppointmentInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    className="input"
                    min={new Date().toISOString().split('T')[0]}
                    value={newAppointment.date}
                    onChange={handleAppointmentInputChange}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label" htmlFor="time">Time</label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    className="input"
                    value={newAppointment.time}
                    onChange={handleAppointmentInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="input"
                  placeholder="Let us know any specific questions or requests..."
                  value={newAppointment.message}
                  onChange={handleAppointmentInputChange}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setIsScheduleAppointmentModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={addAppointment}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsCameraModalOpen(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">Take Photo</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setIsCameraModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div>
              <div className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                <ReactCameraProCamera
                  ref={setCameraInstance}
                  aspectRatio={16/9}
                  errorMessages={{
                    noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
                    permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                    switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
                    canvas: 'Canvas is not supported.',
                  }}
                />
              </div>
              <div className="mt-4 flex justify-center">
                <button 
                  className="btn btn-primary flex items-center gap-1"
                  onClick={captureImage}
                >
                  <Camera className="h-4 w-4" />
                  <span>Capture</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;