import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  Truck, Users, Route as RouteIcon, Calendar, Settings as SettingsIcon, Download, Upload, Plus, Edit, Trash2,
  Search, Filter, TrendingUp, TrendingDown, DollarSign, Gauge, MapPin, Clock,
  Wrench, User, Car, Navigation, BarChart3, Eye, FileText, Bell, Home,
  ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, XCircle, Circle,
  Fuel, CreditCard, Target, Award, Moon, Sun, Globe, Database, X, Brain // Added Brain
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

type Vehicle = {
  id: string;
  number: string;
  type: 'truck' | 'van' | 'car' | 'bus';
  model: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  driverId?: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  registrationDate: string;
  insuranceExpiry: string;
  lastMaintenance: string;
  mileage: number;
};

type Driver = {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  experience: number;
  status: 'available' | 'on-trip' | 'off-duty';
  rating: number;
  joiningDate: string;
  licenseExpiry: string;
  address: string;
};

type Route = {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  estimatedTime: number;
  tollCost: number;
  fuelCost: number;
  status: 'active' | 'inactive';
  waypoints: string[];
};

type Trip = {
  id: string;
  vehicleId: string;
  driverId: string;
  routeId: string;
  startDate: string;
  endDate?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  cargo: string;
  cargoWeight: number;
  customerName: string;
  customerPhone: string;
  actualDistance?: number;
  actualFuelCost?: number;
  actualTollCost?: number;
  notes?: string;
};

type Expense = {
  id: string;
  vehicleId: string;
  type: 'fuel' | 'maintenance' | 'toll' | 'insurance' | 'other';
  amount: number;
  date: string;
  description: string;
  receiptUrl?: string;
};

type AppSettings = {
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr' | 'de';
  currency: 'USD' | 'EUR' | 'GBP' | 'INR';
  fuelPrices: {
    petrol: number;
    diesel: number;
  };
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'vehicles' | 'drivers' | 'routes' | 'trips' | 'expenses' | 'settings'>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'en',
    currency: 'USD',
    fuelPrices: { petrol: 4.5, diesel: 4.2 }
  });

  // Modal states
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false); // This state seems unused, but keeping it as it was in original code
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [showClearAllDataConfirmation, setShowClearAllDataConfirmation] = useState(false);


  // Edit states
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // AI states
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [aiFeature, setAiFeature] = useState<'route-optimization' | 'expense-analysis' | 'document-processing'>('route-optimization');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedVehicles = localStorage.getItem('transport-vehicles');
    const savedDrivers = localStorage.getItem('transport-drivers');
    const savedRoutes = localStorage.getItem('transport-routes');
    const savedTrips = localStorage.getItem('transport-trips');
    const savedExpenses = localStorage.getItem('transport-expenses');
    const savedSettings = localStorage.getItem('transport-settings');

    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
    if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
    if (savedTrips) setTrips(JSON.parse(savedTrips));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedSettings) setAppSettings(JSON.parse(savedSettings));

    // Initialize with sample data if empty
    if (!savedVehicles) {
      const sampleVehicles: Vehicle[] = [
        {
          id: '1',
          number: 'TRK-001',
          type: 'truck',
          model: 'Ford F-150',
          capacity: 1500,
          status: 'active',
          driverId: '1',
          fuelType: 'diesel',
          registrationDate: '2023-01-15',
          insuranceExpiry: '2025-01-15',
          lastMaintenance: '2024-11-01',
          mileage: 45000
        },
        {
          id: '2',
          number: 'VAN-002',
          type: 'van',
          model: 'Mercedes Sprinter',
          capacity: 800,
          status: 'maintenance',
          fuelType: 'diesel',
          registrationDate: '2023-03-20',
          insuranceExpiry: '2025-03-20',
          lastMaintenance: '2024-12-01',
          mileage: 32000
        }
      ];
      setVehicles(sampleVehicles);
      localStorage.setItem('transport-vehicles', JSON.stringify(sampleVehicles));
    }

    if (!savedDrivers) {
      const sampleDrivers: Driver[] = [
        {
          id: '1',
          name: 'John Smith',
          licenseNumber: 'DL123456789',
          phone: '+1-555-0123',
          email: 'john.smith@transport.com',
          experience: 8,
          status: 'on-trip',
          rating: 4.8,
          joiningDate: '2022-06-15',
          licenseExpiry: '2026-06-15',
          address: '123 Main St, City, State'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          licenseNumber: 'DL987654321',
          phone: '+1-555-0124',
          email: 'sarah.johnson@transport.com',
          experience: 5,
          status: 'available',
          rating: 4.9,
          joiningDate: '2023-02-10',
          licenseExpiry: '2027-02-10',
          address: '456 Oak Ave, City, State'
        }
      ];
      setDrivers(sampleDrivers);
      localStorage.setItem('transport-drivers', JSON.stringify(sampleDrivers));
    }

    if (!savedRoutes) {
      const sampleRoutes: Route[] = [
        {
          id: '1',
          name: 'City Center to Warehouse',
          startLocation: 'Downtown Plaza',
          endLocation: 'Industrial Warehouse',
          distance: 25.5,
          estimatedTime: 45,
          tollCost: 12.50,
          fuelCost: 15.75,
          status: 'active',
          waypoints: ['Highway 101', 'Industrial Blvd']
        }
      ];
      setRoutes(sampleRoutes);
      localStorage.setItem('transport-routes', JSON.stringify(sampleRoutes));
    }

    if (!savedTrips) {
      const sampleTrips: Trip[] = [
        {
          id: '1',
          vehicleId: '1',
          driverId: '1',
          routeId: '1',
          startDate: '2024-06-04T08:00:00',
          status: 'in-progress',
          cargo: 'Electronics',
          cargoWeight: 500,
          customerName: 'Tech Solutions Inc',
          customerPhone: '+1-555-9999'
        }
      ];
      setTrips(sampleTrips);
      localStorage.setItem('transport-trips', JSON.stringify(sampleTrips));
    }

    if (!savedExpenses) {
      const sampleExpenses: Expense[] = [
        {
          id: '1',
          vehicleId: '1',
          type: 'fuel',
          amount: 125.50,
          date: '2024-06-03',
          description: 'Fuel fill-up before trip'
        },
        {
          id: '2',
          vehicleId: '2',
          type: 'maintenance',
          amount: 350.00,
          date: '2024-06-02',
          description: 'Brake pad replacement'
        }
      ];
      setExpenses(sampleExpenses);
      localStorage.setItem('transport-expenses', JSON.stringify(sampleExpenses));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('transport-vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transport-drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('transport-routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('transport-trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('transport-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('transport-settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // Apply theme
  useEffect(() => {
    if (appSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings.theme]);

  // Helper functions
  const getVehicleByType = (type: string) => vehicles.filter(v => v.type === type).length;
  const getDriversByStatus = (status: string) => drivers.filter(d => d.status === status).length;
  const getTripsByStatus = (status: string) => trips.filter(t => t.status === status).length;
  const getTotalExpenses = (timeframe: 'week' | 'month' | 'year') => {
    const now = new Date();
    const filtered = expenses.filter(e => {
      const expenseDate = new Date(e.date);
      if (timeframe === 'month') {
        return isWithinInterval(expenseDate, { start: startOfMonth(now), end: endOfMonth(now) });
      }
      // Add week/year logic if needed, current implementation only handles month or returns all
      return true; 
    });
    return filtered.reduce((sum, e) => sum + e.amount, 0);
  };

  // CRUD operations
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: Date.now().toString() };
    setVehicles([...vehicles, newVehicle]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const addDriver = (driver: Omit<Driver, 'id'>) => {
    const newDriver = { ...driver, id: Date.now().toString() };
    setDrivers([...drivers, newDriver]);
  };

  const updateDriver = (id: string, updates: Partial<Driver>) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDriver = (id: string) => {
    setDrivers(drivers.filter(d => d.id !== id));
  };

  const addRoute = (route: Omit<Route, 'id'>) => {
    const newRoute = { ...route, id: Date.now().toString() };
    setRoutes([...routes, newRoute]);
  };

  const updateRoute = (id: string, updates: Partial<Route>) => {
    setRoutes(routes.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRoute = (id: string) => {
    setRoutes(routes.filter(r => r.id !== id));
  };

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip = { ...trip, id: Date.now().toString() };
    setTrips([...trips, newTrip]);
  };

  const updateTrip = (id: string, updates: Partial<Trip>) => {
    setTrips(trips.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTrip = (id: string) => {
    setTrips(trips.filter(t => t.id !== id));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: Date.now().toString() };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // AI functions
  const handleAISubmit = () => {
    if (!promptText?.trim() && !selectedFile) {
      setAiError('Please provide a prompt or select a file.');
      return;
    }

    setAiResult(null);
    setAiError(null);

    let finalPrompt = promptText;

    if (aiFeature === 'route-optimization' && !selectedFile) {
      finalPrompt = `Analyze the following transport data and provide route optimization suggestions. Current routes: ${JSON.stringify(routes)}. Current trips: ${JSON.stringify(trips)}. Return JSON with keys "optimizations", "cost_savings", "time_savings", "recommendations".`;
    } else if (aiFeature === 'expense-analysis' && !selectedFile) {
      finalPrompt = `Analyze the following expense data and provide insights. Expenses: ${JSON.stringify(expenses)}. Vehicles: ${JSON.stringify(vehicles)}. Return JSON with keys "total_costs", "cost_breakdown", "trends", "recommendations", "potential_savings".`;
    } else if (aiFeature === 'document-processing' && selectedFile) {
      finalPrompt = 'Process this transport document and extract relevant information. Return JSON with keys "document_type", "extracted_data", "vehicle_info", "amount", "date", "vendor".';
    }

    try {
      if (selectedFile) {
        aiLayerRef.current?.sendToAI(finalPrompt, selectedFile);
      } else {
        aiLayerRef.current?.sendToAI(finalPrompt);
      }
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = (type: 'vehicles' | 'drivers' | 'routes' | 'trips' | 'expenses') => {
    const templates = {
      vehicles: [
        {
          number: 'TRK-001',
          type: 'truck',
          model: 'Ford F-150',
          capacity: 1500,
          status: 'active',
          fuelType: 'diesel',
          registrationDate: '2023-01-15',
          insuranceExpiry: '2025-01-15',
          lastMaintenance: '2024-11-01',
          mileage: 45000
        }
      ],
      drivers: [
        {
          name: 'John Smith',
          licenseNumber: 'DL123456789',
          phone: '+1-555-0123',
          email: 'john.smith@transport.com',
          experience: 8,
          status: 'available',
          rating: 4.8,
          joiningDate: '2022-06-15',
          licenseExpiry: '2026-06-15',
          address: '123 Main St, City, State'
        }
      ],
      routes: [
        {
          name: 'City Center to Warehouse',
          startLocation: 'Downtown Plaza',
          endLocation: 'Industrial Warehouse',
          distance: 25.5,
          estimatedTime: 45,
          tollCost: 12.50,
          fuelCost: 15.75,
          status: 'active',
          waypoints: 'Highway 101;Industrial Blvd'
        }
      ],
      trips: [
        {
          vehicleNumber: 'TRK-001',
          driverName: 'John Smith',
          routeName: 'City Center to Warehouse',
          startDate: '2024-06-04T08:00:00',
          status: 'scheduled',
          cargo: 'Electronics',
          cargoWeight: 500,
          customerName: 'Tech Solutions Inc',
          customerPhone: '+1-555-9999'
        }
      ],
      expenses: [
        {
          vehicleNumber: 'TRK-001',
          type: 'fuel',
          amount: 125.50,
          date: '2024-06-03',
          description: 'Fuel fill-up before trip'
        }
      ]
    };
    
    exportToCSV(templates[type], `${type}_template`);
  };

  const importFromCSV = (file: File, type: 'vehicles' | 'drivers' | 'routes' | 'trips' | 'expenses') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });

        switch (type) {
          case 'vehicles':
            const newVehicles = data.map(v => ({
              ...v,
              id: Date.now().toString() + Math.random(),
              capacity: parseInt(v.capacity) || 0,
              mileage: parseInt(v.mileage) || 0
            }));
            setVehicles([...vehicles, ...newVehicles]);
            break;
          case 'drivers':
            const newDrivers = data.map(d => ({
              ...d,
              id: Date.now().toString() + Math.random(),
              experience: parseInt(d.experience) || 0,
              rating: parseFloat(d.rating) || 0
            }));
            setDrivers([...drivers, ...newDrivers]);
            break;
          // TODO: Implement import for routes and trips with proper data mapping
          case 'expenses':
            const newExpenses = data.map(e => ({
              ...e,
              id: Date.now().toString() + Math.random(),
              vehicleId: vehicles.find(v => v.number === e.vehicleNumber)?.id || '',
              amount: parseFloat(e.amount) || 0
            }));
            setExpenses([...expenses, ...newExpenses]);
            break;
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
      }
    };
    reader.readAsText(file);
  };

  // Dashboard analytics data
  const vehicleTypeData = [
    { name: 'Trucks', value: getVehicleByType('truck'), color: '#3B82F6' },
    { name: 'Vans', value: getVehicleByType('van'), color: '#10B981' },
    { name: 'Cars', value: getVehicleByType('car'), color: '#F59E0B' },
    { name: 'Buses', value: getVehicleByType('bus'), color: '#EF4444' }
  ];

  const monthlyExpenseData = [
    { month: 'Jan', fuel: 2400, maintenance: 800, toll: 400 },
    { month: 'Feb', fuel: 2600, maintenance: 1200, toll: 450 },
    { month: 'Mar', fuel: 2800, maintenance: 600, toll: 500 },
    { month: 'Apr', fuel: 3200, maintenance: 1500, toll: 550 },
    { month: 'May', fuel: 3500, maintenance: 900, toll: 600 },
    { month: 'Jun', fuel: 3800, maintenance: 1100, toll: 650 }
  ];

  const tripStatusData = [
    { name: 'Completed', value: getTripsByStatus('completed'), color: '#10B981' },
    { name: 'In Progress', value: getTripsByStatus('in-progress'), color: '#3B82F6' },
    { name: 'Scheduled', value: getTripsByStatus('scheduled'), color: '#F59E0B' },
    { name: 'Cancelled', value: getTripsByStatus('cancelled'), color: '#EF4444' }
  ];

  const renderDashboard = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Transport Dashboard</h1>
        <button
          onClick={() => setIsAIModalOpen(true)}
          className="btn btn-primary btn-responsive"
          id="ai-assistant-trigger"
        >
          <Brain className="w-4 h-4" />
          AI Assistant
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive">
        <div className="stat-card" id="total-vehicles-stat">
          <div className="flex-between">
            <div>
              <div className="stat-title">Total Vehicles</div>
              <div className="stat-value">{vehicles.length}</div>
              <div className="stat-desc">{getVehicleByType('truck')} trucks active</div>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Active Drivers</div>
              <div className="stat-value">{getDriversByStatus('available') + getDriversByStatus('on-trip')}</div>
              <div className="stat-desc">{getDriversByStatus('on-trip')} on trips</div>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Active Trips</div>
              <div className="stat-value">{getTripsByStatus('in-progress')}</div>
              <div className="stat-desc">{getTripsByStatus('scheduled')} scheduled</div>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <RouteIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Monthly Expenses</div>
              <div className="stat-value">{appSettings.currency} {getTotalExpenses('month').toLocaleString()}</div>
              <div className="stat-desc flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                12% from last month
              </div>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card" id="expense-trends-chart">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Expense Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyExpenseData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="fuel" fill="#3B82F6" name="Fuel" />
              <Bar dataKey="maintenance" fill="#10B981" name="Maintenance" />
              <Bar dataKey="toll" fill="#F59E0B" name="Toll" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Vehicle Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehicleTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {vehicleTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Activities</h3>
        <div className="space-y-3">
          {trips.slice(0, 5).map((trip) => {
            const vehicle = vehicles.find(v => v.id === trip.vehicleId);
            const driver = drivers.find(d => d.id === trip.driverId);
            return (
              <div key={trip.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${(
                  trip.status === 'completed' ? 'bg-green-500' :
                  trip.status === 'in-progress' ? 'bg-blue-500' :
                  trip.status === 'scheduled' ? 'bg-orange-500' : 'bg-red-500'
                )}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {vehicle?.number} - {driver?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {trip.cargo} • {trip.status}
                  </p>
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {format(new Date(trip.startDate), 'MMM dd, HH:mm')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderVehicles = () => (
    <div className="space-y-6" id="generation_issue_fallback">
      <div className="flex-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Vehicle Management</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => downloadTemplate('vehicles')}
            className="btn bg-green-600 text-white hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setIsVehicleModalOpen(true)}
            className="btn btn-primary"
            id="add-vehicle-btn"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <select
          className="input w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Vehicle Cards */}
      <div className="grid-responsive">
        {vehicles
          .filter(vehicle => 
            (filterStatus === 'all' || vehicle.status === filterStatus) &&
            (searchTerm === '' || 
              vehicle.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
              vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
          .map((vehicle) => {
            const driver = drivers.find(d => d.id === vehicle.driverId);
            return (
              <div key={vehicle.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex-between mb-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{vehicle.number}</h3>
                  </div>
                  <span className={`badge ${(
                    vehicle.status === 'active' ? 'badge-success' :
                    vehicle.status === 'maintenance' ? 'badge-warning' : 'badge-error'
                  )}`}>
                    {vehicle.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                  <p><strong>Model:</strong> {vehicle.model}</p>
                  <p><strong>Type:</strong> {vehicle.type}</p>
                  <p><strong>Capacity:</strong> {vehicle.capacity} kg</p>
                  <p><strong>Fuel:</strong> {vehicle.fuelType}</p>
                  <p><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} km</p>
                  {driver && <p><strong>Driver:</strong> {driver.name}</p>}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setEditingVehicle(vehicle);
                      setIsVehicleModalOpen(true);
                    }}
                    className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteVehicle(vehicle.id)} 
                    className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );

  const renderDrivers = () => (
    <div className="space-y-6">
      <div className="flex-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Driver Management</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => downloadTemplate('drivers')}
            className="btn bg-green-600 text-white hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setIsDriverModalOpen(true)}
            className="btn btn-primary"
            id="add-driver-btn"
          >
            <Plus className="w-4 h-4" />
            Add Driver
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <select
          className="input w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="on-trip">On Trip</option>
          <option value="off-duty">Off Duty</option>
        </select>
      </div>

      {/* Driver Cards */}
      <div className="grid-responsive">
        {drivers
          .filter(driver => 
            (filterStatus === 'all' || driver.status === filterStatus) &&
            (searchTerm === '' || 
              driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              driver.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
          .map((driver) => (
            <div key={driver.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex-between mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{driver.name}</h3>
                </div>
                <span className={`badge ${(
                  driver.status === 'available' ? 'badge-success' :
                  driver.status === 'on-trip' ? 'badge-info' : 'badge-warning'
                )}`}>
                  {driver.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <p><strong>License:</strong> {driver.licenseNumber}</p>
                <p><strong>Experience:</strong> {driver.experience} years</p>
                <p><strong>Rating:</strong> ⭐ {driver.rating}/5</p>
                <p><strong>Phone:</strong> {driver.phone}</p>
                <p><strong>Email:</strong> {driver.email}</p>
                <p><strong>License Expiry:</strong> {format(new Date(driver.licenseExpiry), 'MMM dd, yyyy')}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingDriver(driver);
                    setIsDriverModalOpen(true);
                  }}
                  className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteDriver(driver.id)}
                  className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );

  const renderRoutes = () => (
    <div className="space-y-6">
      <div className="flex-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Route Management</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => downloadTemplate('routes')}
            className="btn bg-green-600 text-white hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setIsRouteModalOpen(true)}
            className="btn btn-primary"
            id="add-route-btn"
          >
            <Plus className="w-4 h-4" />
            Add Route
          </button>
        </div>
      </div>

      {/* Route Cards */}
      <div className="grid-responsive">
        {routes.map((route) => (
          <div key={route.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex-between mb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{route.name}</h3>
              </div>
              <span className={`badge ${(
                route.status === 'active' ? 'badge-success' : 'badge-warning'
              )}`}>
                {route.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
              <p><strong>From:</strong> {route.startLocation}</p>
              <p><strong>To:</strong> {route.endLocation}</p>
              <p><strong>Distance:</strong> {route.distance} km</p>
              <p><strong>Est. Time:</strong> {route.estimatedTime} minutes</p>
              <p><strong>Toll Cost:</strong> ${route.tollCost}</p>
              <p><strong>Fuel Cost:</strong> ${route.fuelCost}</p>
              {route.waypoints.length > 0 && (
                <p><strong>Waypoints:</strong> {route.waypoints.join(', ')}</p>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setEditingRoute(route);
                  setIsRouteModalOpen(true);
                }}
                className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                <Edit className="w-3 h-3" />
              </button>
              <button
                onClick={() => deleteRoute(route.id)}
                className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrips = () => (
    <div className="space-y-6">
      <div className="flex-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Trip Management</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => downloadTemplate('trips')}
            className="btn bg-green-600 text-white hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setIsTripModalOpen(true)}
            className="btn btn-primary"
            id="add-trip-btn"
          >
            <Plus className="w-4 h-4" />
            Schedule Trip
          </button>
        </div>
      </div>

      {/* Trip Cards */}
      <div className="space-y-4">
        {trips.map((trip) => {
          const vehicle = vehicles.find(v => v.id === trip.vehicleId);
          const driver = drivers.find(d => d.id === trip.driverId);
          const route = routes.find(r => r.id === trip.routeId);
          
          return (
            <div key={trip.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${(
                    trip.status === 'completed' ? 'bg-green-500' :
                    trip.status === 'in-progress' ? 'bg-blue-500' :
                    trip.status === 'scheduled' ? 'bg-orange-500' : 'bg-red-500'
                  )}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Trip #{trip.id}</h3>
                </div>
                <span className={`badge ${(
                  trip.status === 'completed' ? 'badge-success' :
                  trip.status === 'in-progress' ? 'badge-info' :
                  trip.status === 'scheduled' ? 'badge-warning' : 'badge-error'
                )}`}>
                  {trip.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Vehicle & Driver</h4>
                  <p className="text-gray-600 dark:text-slate-400">Vehicle: {vehicle?.number}</p>
                  <p className="text-gray-600 dark:text-slate-400">Driver: {driver?.name}</p>
                  <p className="text-gray-600 dark:text-slate-400">Phone: {driver?.phone}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Route & Cargo</h4>
                  <p className="text-gray-600 dark:text-slate-400">Route: {route?.name}</p>
                  <p className="text-gray-600 dark:text-slate-400">Cargo: {trip.cargo}</p>
                  <p className="text-gray-600 dark:text-slate-400">Weight: {trip.cargoWeight} kg</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Customer & Schedule</h4>
                  <p className="text-gray-600 dark:text-slate-400">Customer: {trip.customerName}</p>
                  <p className="text-gray-600 dark:text-slate-400">Start: {format(new Date(trip.startDate), 'MMM dd, HH:mm')}</p>
                  {trip.endDate && (
                    <p className="text-gray-600 dark:text-slate-400">End: {format(new Date(trip.endDate), 'MMM dd, HH:mm')}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingTrip(trip);
                    setIsTripModalOpen(true);
                  }}
                  className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteTrip(trip.id)}
                  className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {trip.status === 'scheduled' && (
                  <button
                    onClick={() => updateTrip(trip.id, { status: 'in-progress' })}
                    className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    Start Trip
                  </button>
                )}
                {trip.status === 'in-progress' && (
                  <button
                    onClick={() => updateTrip(trip.id, { status: 'completed', endDate: new Date().toISOString() })}
                    className="btn btn-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
                  >
                    Complete Trip
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="flex-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => downloadTemplate('expenses')}
            className="btn bg-green-600 text-white hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="btn btn-primary"
            id="add-expense-btn"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Expense Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['fuel', 'maintenance', 'toll', 'insurance'].map((type) => {
          const total = expenses.filter(e => e.type === type).reduce((sum, e) => sum + e.amount, 0);
          const iconMap = { fuel: Fuel, maintenance: Wrench, toll: Navigation, insurance: CreditCard };
          const IconComponent = iconMap[type as keyof typeof iconMap] || Circle; // Fallback icon
          return (
            <div key={type} className="stat-card">
              <div className="flex-between">
                <div>
                  <div className="stat-title capitalize">{type}</div>
                  <div className="stat-value">${total.toLocaleString()}</div>
                </div>
                <IconComponent className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expense List */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Vehicle</th>
                <th className="table-header">Type</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Description</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {expenses.map((expense) => {
                const vehicle = vehicles.find(v => v.id === expense.vehicleId);
                return (
                  <tr key={expense.id}>
                    <td className="table-cell">{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                    <td className="table-cell">{vehicle?.number || 'N/A'}</td>
                    <td className="table-cell">
                      <span className={`badge ${(
                        expense.type === 'fuel' ? 'badge-info' :
                        expense.type === 'maintenance' ? 'badge-warning' :
                        expense.type === 'toll' ? 'badge-success' : 'badge-error' // Assuming 'insurance' and 'other' could be 'badge-error' or a default
                      )}`}>
                        {expense.type}
                      </span>
                    </td>
                    <td className="table-cell font-medium">${expense.amount}</td>
                    <td className="table-cell">{expense.description}</td>
                    <td className="table-cell">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingExpense(expense);
                            setIsExpenseModalOpen(true);
                          }}
                          className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6" id="settings-page">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Theme</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAppSettings({...appSettings, theme: 'light'})}
                  className={`p-2 rounded-lg border-2 transition-colors ${(
                    appSettings.theme === 'light' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                      : 'border-gray-200 dark:border-slate-600'
                  )}`}
                >
                  <Sun className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setAppSettings({...appSettings, theme: 'dark'})}
                  className={`p-2 rounded-lg border-2 transition-colors ${(
                    appSettings.theme === 'dark' 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                      : 'border-gray-200 dark:border-slate-600'
                  )}`}
                >
                  <Moon className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div>
              <label className="form-label">Language</label>
              <select
                className="input"
                value={appSettings.language}
                onChange={(e) => setAppSettings({...appSettings, language: e.target.value as any})}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Currency</label>
              <select
                className="input"
                value={appSettings.currency}
                onChange={(e) => setAppSettings({...appSettings, currency: e.target.value as any})}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fuel Prices */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Fuel Prices</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Petrol Price (per liter)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={appSettings.fuelPrices.petrol}
                onChange={(e) => setAppSettings({
                  ...appSettings,
                  fuelPrices: { ...appSettings.fuelPrices, petrol: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
            
            <div>
              <label className="form-label">Diesel Price (per liter)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={appSettings.fuelPrices.diesel}
                onChange={(e) => setAppSettings({
                  ...appSettings,
                  fuelPrices: { ...appSettings.fuelPrices, diesel: parseFloat(e.target.value) || 0 }
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Data Management</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => exportToCSV(vehicles, 'vehicles')}
            className="btn bg-blue-600 text-white hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export Vehicles
          </button>
          <button
            onClick={() => exportToCSV(drivers, 'drivers')}
            className="btn bg-green-600 text-white hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export Drivers
          </button>
          <button
            onClick={() => exportToCSV(trips, 'trips')}
            className="btn bg-purple-600 text-white hover:bg-purple-700"
          >
            <Download className="w-4 h-4" />
            Export Trips
          </button>
          <button
            onClick={() => exportToCSV(expenses, 'expenses')}
            className="btn bg-orange-600 text-white hover:bg-orange-700"
          >
            <Download className="w-4 h-4" />
            Export Expenses
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Import Data</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['vehicles', 'drivers', 'routes', 'trips', 'expenses'] as const).map((type) => (
              <div key={type}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importFromCSV(file, type);
                    e.target.value = ''; // Reset file input
                  }}
                  className="hidden"
                  id={`import-${type}`}
                />
                <label
                  htmlFor={`import-${type}`}
                  className="btn bg-gray-600 text-white hover:bg-gray-700 cursor-pointer inline-flex items-center justify-center gap-2 w-full"
                >
                  <Upload className="w-4 h-4" />
                  Import {type}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
          <button
            onClick={() => {
              setShowClearAllDataConfirmation(true);
            }}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            <Database className="w-4 h-4" />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );

  // Modal components
  const VehicleModal = () => {
    const [formData, setFormData] = useState<Partial<Vehicle>>(
      editingVehicle || {
        number: '',
        type: 'truck',
        model: '',
        capacity: 0,
        status: 'active',
        fuelType: 'diesel',
        registrationDate: '',
        insuranceExpiry: '',
        lastMaintenance: '',
        mileage: 0
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingVehicle) {
        updateVehicle(editingVehicle.id, formData as Vehicle);
      } else {
        addVehicle(formData as Omit<Vehicle, 'id'>);
      }
      setIsVehicleModalOpen(false);
      setEditingVehicle(null);
    };

    return (
      <div className="modal-backdrop" onClick={() => setIsVehicleModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
            </h3>
            <button
              onClick={() => setIsVehicleModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Vehicle Number</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.number || ''}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Type</label>
                <select
                  className="input"
                  value={formData.type || 'truck'}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Vehicle['type']})}
                >
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="car">Car</option>
                  <option value="bus">Bus</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Model</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.model || ''}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Capacity (kg)</label>
                <input
                  type="number"
                  required
                  className="input"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label">Status</label>
                <select
                  className="input"
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Vehicle['status']})}
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Fuel Type</label>
                <select
                  className="input"
                  value={formData.fuelType || 'diesel'}
                  onChange={(e) => setFormData({...formData, fuelType: e.target.value as Vehicle['fuelType']})}
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Registration Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={formData.registrationDate || ''}
                  onChange={(e) => setFormData({...formData, registrationDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Insurance Expiry</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={formData.insuranceExpiry || ''}
                  onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Last Maintenance</label>
                <input
                  type="date"
                  className="input"
                  value={formData.lastMaintenance || ''}
                  onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Mileage (km)</label>
                <input
                  type="number"
                  required
                  className="input"
                  value={formData.mileage || ''}
                  onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsVehicleModalOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingVehicle ? 'Update' : 'Add'} Vehicle
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DriverModal = () => {
    const [formData, setFormData] = useState<Partial<Driver>>(
      editingDriver || {
        name: '',
        licenseNumber: '',
        phone: '',
        email: '',
        experience: 0,
        status: 'available',
        rating: 0,
        joiningDate: '',
        licenseExpiry: '',
        address: ''
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingDriver) {
        updateDriver(editingDriver.id, formData as Driver);
      } else {
        addDriver(formData as Omit<Driver, 'id'>);
      }
      setIsDriverModalOpen(false);
      setEditingDriver(null);
    };

    return (
      <div className="modal-backdrop" onClick={() => setIsDriverModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingDriver ? 'Edit Driver' : 'Add Driver'}
            </h3>
            <button
              onClick={() => setIsDriverModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">License Number</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.licenseNumber || ''}
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  required
                  className="input"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  className="input"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Experience (years)</label>
                <input
                  type="number"
                  required
                  className="input"
                  value={formData.experience || ''}
                  onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label">Status</label>
                <select
                  className="input"
                  value={formData.status || 'available'}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Driver['status']})}
                >
                  <option value="available">Available</option>
                  <option value="on-trip">On Trip</option>
                  <option value="off-duty">Off Duty</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  required
                  className="input"
                  value={formData.rating || ''}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={formData.joiningDate || ''}
                  onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">License Expiry</label>
                <input
                  type="date"
                  required
                  className="input"
                  value={formData.licenseExpiry || ''}
                  onChange={(e) => setFormData({...formData, licenseExpiry: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Address</label>
              <textarea
                className="input"
                rows={3}
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsDriverModalOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingDriver ? 'Update' : 'Add'} Driver
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const RouteModal = () => {
    const [formData, setFormData] = useState<Partial<Route>>(
      editingRoute || {
        name: '',
        startLocation: '',
        endLocation: '',
        distance: 0,
        estimatedTime: 0,
        tollCost: 0,
        fuelCost: 0,
        status: 'active',
        waypoints: []
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingRoute) {
        updateRoute(editingRoute.id, formData as Route);
      } else {
        addRoute(formData as Omit<Route, 'id'>);
      }
      setIsRouteModalOpen(false);
      setEditingRoute(null);
    };

    return (
      <div className="modal-backdrop" onClick={() => setIsRouteModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingRoute ? 'Edit Route' : 'Add Route'}
            </h3>
            <button
              onClick={() => setIsRouteModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className="form-label">Route Name</label>
              <input
                type="text"
                required
                className="input"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Start Location</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.startLocation || ''}
                  onChange={(e) => setFormData({...formData, startLocation: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">End Location</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.endLocation || ''}
                  onChange={(e) => setFormData({...formData, endLocation: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="input"
                  value={formData.distance || ''}
                  onChange={(e) => setFormData({...formData, distance: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label">Estimated Time (minutes)</label>
                <input
                  type="number"
                  required
                  className="input"
                  value={formData.estimatedTime || ''}
                  onChange={(e) => setFormData({...formData, estimatedTime: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label">Toll Cost</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.tollCost || ''}
                  onChange={(e) => setFormData({...formData, tollCost: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label">Fuel Cost</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.fuelCost || ''}
                  onChange={(e) => setFormData({...formData, fuelCost: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Status</label>
              <select
                className="input"
                value={formData.status || 'active'}
                onChange={(e) => setFormData({...formData, status: e.target.value as Route['status']})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Waypoints (comma separated)</label>
              <input
                type="text"
                className="input"
                placeholder="Highway 101, Industrial Blvd"
                value={formData.waypoints?.join(', ') || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  waypoints: e.target.value.split(',').map(w => w.trim()).filter(w => w)
                })}
              />
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsRouteModalOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingRoute ? 'Update' : 'Add'} Route
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TripModal = () => {
    const [formData, setFormData] = useState<Partial<Trip>>(
      editingTrip || {
        vehicleId: '',
        driverId: '',
        routeId: '',
        startDate: '',
        status: 'scheduled',
        cargo: '',
        cargoWeight: 0,
        customerName: '',
        customerPhone: '',
        notes: ''
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingTrip) {
        updateTrip(editingTrip.id, formData as Trip);
      } else {
        addTrip(formData as Omit<Trip, 'id'>);
      }
      setIsTripModalOpen(false);
      setEditingTrip(null);
    };

    return (
      <div className="modal-backdrop" onClick={() => setIsTripModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingTrip ? 'Edit Trip' : 'Schedule Trip'}
            </h3>
            <button
              onClick={() => setIsTripModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Vehicle</label>
                <select
                  className="input"
                  required
                  value={formData.vehicleId || ''}
                  onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.filter(v => v.status === 'active').map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.number} - {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Driver</label>
                <select
                  className="input"
                  required
                  value={formData.driverId || ''}
                  onChange={(e) => setFormData({...formData, driverId: e.target.value})}
                >
                  <option value="">Select Driver</option>
                  {drivers.filter(d => d.status === 'available').map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name} - {driver.licenseNumber}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Route</label>
                <select
                  className="input"
                  required
                  value={formData.routeId || ''}
                  onChange={(e) => setFormData({...formData, routeId: e.target.value})}
                >
                  <option value="">Select Route</option>
                  {routes.filter(r => r.status === 'active').map(route => (
                    <option key={route.id} value={route.id}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Start Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="input"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Cargo</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.cargo || ''}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Cargo Weight (kg)</label>
                <input
                  type="number"
                  required
                  className="input"
                  value={formData.cargoWeight || ''}
                  onChange={(e) => setFormData({...formData, cargoWeight: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label">Customer Phone</label>
                <input
                  type="tel"
                  required
                  className="input"
                  value={formData.customerPhone || ''}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Status</label>
              <select
                className="input"
                value={formData.status || 'scheduled'}
                onChange={(e) => setFormData({...formData, status: e.target.value as Trip['status']})}
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Notes</label>
              <textarea
                className="input"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsTripModalOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingTrip ? 'Update' : 'Schedule'} Trip
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ExpenseModal = () => {
    const [formData, setFormData] = useState<Partial<Expense>>(
      editingExpense || {
        vehicleId: '',
        type: 'fuel',
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        description: ''
      }
    );

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingExpense) {
        updateExpense(editingExpense.id, formData as Expense);
      } else {
        addExpense(formData as Omit<Expense, 'id'>);
      }
      setIsExpenseModalOpen(false);
      setEditingExpense(null);
    };

    return (
      <div className="modal-backdrop" onClick={() => setIsExpenseModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </h3>
            <button
              onClick={() => setIsExpenseModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className="form-label">Vehicle</label>
              <select
                className="input"
                required
                value={formData.vehicleId || ''}
                onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.number} - {vehicle.model}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Type</label>
                <select
                  className="input"
                  value={formData.type || 'fuel'}
                  onChange={(e) => setFormData({...formData, type: e.target.value as Expense['type']})}
                >
                  <option value="fuel">Fuel</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="toll">Toll</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                className="input"
                value={formData.date || ''}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="input"
                rows={3}
                required
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingExpense ? 'Update' : 'Add'} Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AIModal = () => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAIModalOpen(false);
      }
    };

    return (
      <div className="modal-backdrop" onClick={() => setIsAIModalOpen(false)} onKeyDown={handleKeyDown}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Assistant
            </h3>
            <button
              onClick={() => setIsAIModalOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4 p-6">
            <div>
              <label className="form-label">AI Feature</label>
              <select
                className="input"
                value={aiFeature}
                onChange={(e) => setAiFeature(e.target.value as any)}
              >
                <option value="route-optimization">Route Optimization</option>
                <option value="expense-analysis">Expense Analysis</option>
                <option value="document-processing">Document Processing</option>
              </select>
            </div>
            
            {aiFeature === 'document-processing' && (
              <div>
                <label className="form-label">Upload Document</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="input"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            )}
            
            <div>
              <label className="form-label">Additional Instructions (Optional)</label>
              <textarea
                className="input"
                rows={4}
                placeholder={(
                  aiFeature === 'route-optimization' ? 'Ask for specific optimizations...' :
                  aiFeature === 'expense-analysis' ? 'Ask for specific analysis...' :
                  'Describe what information you want to extract...'
                )}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
            </div>
            
            {aiError && (
              <div className="alert alert-error">
                <AlertTriangle className="w-5 h-5" />
                <p>{aiError.toString()}</p>
              </div>
            )}
            
            {aiResult && (
              <div className="alert alert-success">
                <CheckCircle className="w-5 h-5" />
                <div>
                  <h4 className="font-medium">AI Analysis Complete</h4>
                  <pre className="text-sm mt-2 whitespace-pre-wrap">{aiResult}</pre>
                </div>
              </div>
            )}
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsAIModalOpen(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={handleAISubmit}
                disabled={aiLoading}
                className="btn btn-primary disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'routes', label: 'Routes', icon: RouteIcon },
    { id: 'trips', label: 'Trips', icon: Calendar },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard': return renderDashboard();
      case 'vehicles': return renderVehicles();
      case 'drivers': return renderDrivers();
      case 'routes': return renderRoutes();
      case 'trips': return renderTrips();
      case 'expenses': return renderExpenses();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform lg:translate-x-0 no-print">
        <div className="flex items-center justify-center h-16 bg-blue-600 dark:bg-blue-700">
          <div className="flex items-center gap-2 text-white">
            <Truck className="w-8 h-8" />
            <span className="font-bold text-xl">TransportMS</span>
          </div>
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${(
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
                )}`}
                id={`nav-${item.id}`}
              >
                <IconComponent className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="lg:ml-64">
        <div className="container-fluid py-8 px-4 sm:px-6 lg:px-8">
          {renderCurrentPage()}
        </div>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-slate-700 py-4 px-8 text-center text-sm text-gray-600 dark:text-slate-400 no-print">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
      
      {/* Modals */}
      {isVehicleModalOpen && <VehicleModal />}
      {isDriverModalOpen && <DriverModal />}
      {isRouteModalOpen && <RouteModal />}
      {isTripModalOpen && <TripModal />}
      {isExpenseModalOpen && <ExpenseModal />}
      {isAIModalOpen && <AIModal />}

      {showClearAllDataConfirmation && (
        <div className="modal-backdrop" onClick={() => setShowClearAllDataConfirmation(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Action</h3>
              <button
                onClick={() => setShowClearAllDataConfirmation(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Are you sure you want to delete all data? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowClearAllDataConfirmation(false)}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicles([]);
                  setDrivers([]);
                  setRoutes([]);
                  setTrips([]);
                  setExpenses([]);
                  localStorage.clear();
                  setShowClearAllDataConfirmation(false);
                }}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
