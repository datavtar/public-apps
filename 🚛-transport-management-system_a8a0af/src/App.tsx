import React, { useState, useEffect, useMemo, useCallback, ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { 
  LayoutDashboard, Truck as LucideTruck, UserRound, Package as LucidePackage, Settings, SunMedium, Moon, 
  Plus, Pencil, Trash2, Search as LucideSearch, Filter as LucideFilter, ArrowUp, ArrowDown, ChevronsUpDown, 
  UploadCloud, DownloadCloud, X as LucideX, CalendarDays, MapPin, ChevronDown, ChevronUp, AlertCircle, CheckCircle
} from 'lucide-react';

import styles from './styles/styles.module.css';

// TypeScript Types and Enums
// #region Types and Enums

type VehicleStatus = 'Available' | 'On Trip' | 'Maintenance' | 'Inactive';
type DriverStatus = 'Active' | 'Inactive' | 'On Leave';
type TripStatus = 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';

interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string; // e.g., Truck, Van, Car
  model: string;
  capacity: string; // e.g., "10 Tons", "5 Passengers"
  purchaseDate: string; // ISO date string
  status: VehicleStatus;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  contactPhone: string;
  assignedVehicleId?: string;
  status: DriverStatus;
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  departureTime: string; // ISO date string
  arrivalTime?: string;
  vehicleId: string;
  driverId: string;
  status: TripStatus;
  cargoDetails?: string;
}

type FormDataVehicle = Omit<Vehicle, 'id'>;
type FormDataDriver = Omit<Driver, 'id'>;
type FormDataTrip = Omit<Trip, 'id'>;

interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

interface ModalState<T, U> {
  isOpen: boolean;
  mode: 'add' | 'edit';
  data?: T;
  formData: U;
}

type CurrentView = 'dashboard' | 'vehicles' | 'drivers' | 'trips';

interface AppData {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  theme: 'light' | 'dark';
}

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  vehiclesOnTrip: number;
  totalDrivers: number;
  activeDrivers: number;
  scheduledTrips: number;
  ongoingTrips: number;
  completedTripsToday: number;
}

interface ChartDataItem {
  name: string;
  value: number;
  fill: string;
}

const VEHICLE_TYPES = ['Truck', 'Van', 'Bus', 'Car', 'Motorcycle', 'Other'];
const VEHICLE_STATUSES: VehicleStatus[] = ['Available', 'On Trip', 'Maintenance', 'Inactive'];
const DRIVER_STATUSES: DriverStatus[] = ['Active', 'Inactive', 'On Leave'];
const TRIP_STATUSES: TripStatus[] = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'];

// #endregion Types and Enums

const APP_STORAGE_KEY = 'transportManagementSystemData_v2';

const initialVehicleFormData: FormDataVehicle = {
  registrationNumber: '', type: VEHICLE_TYPES[0], model: '', capacity: '', 
  purchaseDate: new Date().toISOString().split('T')[0], status: VEHICLE_STATUSES[0]
};
const initialDriverFormData: FormDataDriver = {
  name: '', licenseNumber: '', contactPhone: '', status: DRIVER_STATUSES[0], assignedVehicleId: ''
};
const initialTripFormData: FormDataTrip = {
  origin: '', destination: '', departureTime: new Date().toISOString().slice(0, 16), vehicleId: '', 
  driverId: '', status: TRIP_STATUSES[0], cargoDetails: ''
};

const App: React.FC = () => {
  // #region State Variables
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);

  const [vehicleModal, setVehicleModal] = useState<ModalState<Vehicle, FormDataVehicle>>({ isOpen: false, mode: 'add', formData: initialVehicleFormData });
  const [driverModal, setDriverModal] = useState<ModalState<Driver, FormDataDriver>>({ isOpen: false, mode: 'add', formData: initialDriverFormData });
  const [tripModal, setTripModal] = useState<ModalState<Trip, FormDataTrip>>({ isOpen: false, mode: 'add', formData: initialTripFormData });
  
  const [searchTermVehicles, setSearchTermVehicles] = useState('');
  const [filterVehicleStatus, setFilterVehicleStatus] = useState<VehicleStatus | ''>('');
  const [sortConfigVehicles, setSortConfigVehicles] = useState<SortConfig<Vehicle> | null>(null);

  const [searchTermDrivers, setSearchTermDrivers] = useState('');
  const [filterDriverStatus, setFilterDriverStatus] = useState<DriverStatus | ''>('');
  const [sortConfigDrivers, setSortConfigDrivers] = useState<SortConfig<Driver> | null>(null);

  const [searchTermTrips, setSearchTermTrips] = useState('');
  const [filterTripStatus, setFilterTripStatus] = useState<TripStatus | ''>('');
  const [sortConfigTrips, setSortConfigTrips] = useState<SortConfig<Trip> | null>(null);

  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // #endregion State Variables

  // #region Helper Functions
  const generateId = (prefix: string = 'id'): string => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  // #endregion Helper Functions

  // #region LocalStorage and Theme Effect
  useEffect(() => {
    const savedDataString = localStorage.getItem(APP_STORAGE_KEY);
    let loadedData: AppData;
    if (savedDataString) {
      try {
        loadedData = JSON.parse(savedDataString) as AppData;
      } catch (e) {
        console.error("Failed to parse localStorage data:", e);
        loadedData = { vehicles: [], drivers: [], trips: [], theme: 'light' }; // Fallback
      }
    } else {
      // Default initial data if nothing in localStorage
      loadedData = {
        vehicles: [
          { id: generateId('V'), registrationNumber: 'SGX1234A', type: 'Truck', model: 'Volvo FH16', capacity: '20 Tons', purchaseDate: '2022-05-15', status: 'Available' },
          { id: generateId('V'), registrationNumber: 'SGY5678B', type: 'Van', model: 'Mercedes Sprinter', capacity: '3 Tons', purchaseDate: '2023-01-20', status: 'On Trip' },
        ],
        drivers: [
          { id: generateId('D'), name: 'Alice Smith', licenseNumber: 'DL1234567', contactPhone: '91234567', status: 'Active', assignedVehicleId: 'V_162789123_abc123' }, // Example, ensure this ID exists or handle missing
          { id: generateId('D'), name: 'Bob Johnson', licenseNumber: 'DL7654321', contactPhone: '98765432', status: 'Active' },
        ],
        trips: [
          { id: generateId('T'), origin: 'Jurong Port', destination: 'Changi Airport', departureTime: new Date(Date.now() - 86400000).toISOString(), arrivalTime: new Date().toISOString(), vehicleId: 'V_162789123_abc123', driverId: 'D_162789123_def456', status: 'Completed', cargoDetails: 'Electronics' },
        ],
        theme: (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'
      };
    }
    setVehicles(loadedData.vehicles || []);
    setDrivers(loadedData.drivers || []);
    setTrips(loadedData.trips || []);
    setTheme(loadedData.theme || 'light');
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const appData: AppData = { vehicles, drivers, trips, theme };
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appData));
  }, [vehicles, drivers, trips, theme, isInitialized]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  // #endregion LocalStorage and Theme Effect

  // #region Modal Management
  const openModal = <T, U>(setter: React.Dispatch<React.SetStateAction<ModalState<T, U>>>, mode: 'add' | 'edit', initialFormData: U, data?: T) => {
    setter({ isOpen: true, mode, formData: data ? { ...initialFormData, ...data } : initialFormData, data });
    document.body.classList.add('modal-open');
  };

  const closeModal = <T, U>(setter: React.Dispatch<React.SetStateAction<ModalState<T, U>>>) => {
    setter(prev => ({ ...prev, isOpen: false }));
    document.body.classList.remove('modal-open');
  };
  
  useEffect(() => {
    const handleEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (vehicleModal.isOpen) closeModal(setVehicleModal);
        if (driverModal.isOpen) closeModal(setDriverModal);
        if (tripModal.isOpen) closeModal(setTripModal);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [vehicleModal.isOpen, driverModal.isOpen, tripModal.isOpen]);
  // #endregion Modal Management

  // #region Generic Handlers (CRUD, Sort, Filter)
  const handleInputChange = <U,>(setter: React.Dispatch<React.SetStateAction<ModalState<any, U>>>, e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, formData: { ...prev.formData, [name]: value } }));
  };

  const getFilteredAndSortedData = <T extends object>(
    data: T[], 
    searchTerm: string, 
    searchKeys: (keyof T)[], 
    filterKey?: keyof T, 
    filterValue?: string,
    sortConfig?: SortConfig<T> | null
  ): T[] => {
    let filteredData = [...data];

    if (filterValue && filterKey) {
      filteredData = filteredData.filter(item => item[filterKey] === filterValue);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => 
        searchKeys.some(key => 
          String(item[key] ?? '').toLowerCase().includes(lowerSearchTerm)
        )
      );
    }

    if (sortConfig) {
      filteredData.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA === null || valA === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filteredData;
  };
  
  const requestSort = <T extends object>(
    key: keyof T, 
    currentSortConfig: SortConfig<T> | null,
    setSortConfig: React.Dispatch<React.SetStateAction<SortConfig<T> | null>> 
  ) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (currentSortConfig && currentSortConfig.key === key && currentSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = <T extends object>(key: keyof T, sortConfig: SortConfig<T> | null) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };
  // #endregion Generic Handlers

  // #region Vehicle Management
  const filteredVehicles = useMemo(() => 
    getFilteredAndSortedData(
      vehicles,
      searchTermVehicles,
      ['registrationNumber', 'type', 'model'],
      'status',
      filterVehicleStatus,
      sortConfigVehicles
    ),
    [vehicles, searchTermVehicles, filterVehicleStatus, sortConfigVehicles]
  );

  const handleVehicleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = vehicleModal.formData;
    if (!formData.registrationNumber || !formData.type || !formData.model) {
      showNotification('Registration, Type, and Model are required.', 'error');
      return;
    }
    if (vehicleModal.mode === 'add') {
      setVehicles([...vehicles, { ...formData, id: generateId('V') }]);
      showNotification('Vehicle added successfully!', 'success');
    } else if (vehicleModal.data?.id) {
      setVehicles(vehicles.map(v => v.id === vehicleModal.data!.id ? { ...formData, id: vehicleModal.data!.id } : v));
      showNotification('Vehicle updated successfully!', 'success');
    }
    closeModal(setVehicleModal);
  };

  const deleteVehicle = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
      setTrips(prevTrips => prevTrips.map(trip => trip.vehicleId === id ? {...trip, vehicleId: ''} : trip)); // Unassign from trips
      showNotification('Vehicle deleted successfully!', 'success');
    }
  };
  
  const handleVehicleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').slice(1); // Skip header
        const newVehicles: Vehicle[] = [];
        lines.forEach(line => {
          const [registrationNumber, type, model, capacity, purchaseDate, status] = line.split(',');
          if (registrationNumber && type && model) {
            newVehicles.push({
              id: generateId('V'),
              registrationNumber: registrationNumber?.trim(),
              type: type?.trim(),
              model: model?.trim(),
              capacity: capacity?.trim() || '',
              purchaseDate: purchaseDate?.trim() || new Date().toISOString().split('T')[0],
              status: (status?.trim() as VehicleStatus) || 'Available',
            });
          }
        });
        setVehicles(prev => [...prev, ...newVehicles]);
        showNotification(`${newVehicles.length} vehicles imported successfully!`, 'success');
      };
      reader.readAsText(file);
    }
  };

  const downloadVehicleTemplate = () => {
    const template = "registrationNumber,type,model,capacity,purchaseDate(YYYY-MM-DD),status\nXYZ123,Truck,Volvo FH,20 Tons,2023-01-15,Available";
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'vehicle_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // #endregion Vehicle Management

  // #region Driver Management
  const filteredDrivers = useMemo(() =>
    getFilteredAndSortedData(
      drivers,
      searchTermDrivers,
      ['name', 'licenseNumber', 'contactPhone'],
      'status',
      filterDriverStatus,
      sortConfigDrivers
    ),
    [drivers, searchTermDrivers, filterDriverStatus, sortConfigDrivers]
  );

  const handleDriverSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = driverModal.formData;
    if (!formData.name || !formData.licenseNumber || !formData.contactPhone) {
      showNotification('Name, License Number, and Contact Phone are required.', 'error');
      return;
    }
    if (driverModal.mode === 'add') {
      setDrivers([...drivers, { ...formData, id: generateId('D') }]);
      showNotification('Driver added successfully!', 'success');
    } else if (driverModal.data?.id) {
      setDrivers(drivers.map(d => d.id === driverModal.data!.id ? { ...formData, id: driverModal.data!.id } : d));
      showNotification('Driver updated successfully!', 'success');
    }
    closeModal(setDriverModal);
  };

  const deleteDriver = (id: string) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      setDrivers(drivers.filter(d => d.id !== id));
      setTrips(prevTrips => prevTrips.map(trip => trip.driverId === id ? {...trip, driverId: ''} : trip)); // Unassign from trips
      showNotification('Driver deleted successfully!', 'success');
    }
  };
  // #endregion Driver Management

  // #region Trip Management
  const filteredTrips = useMemo(() =>
    getFilteredAndSortedData(
      trips,
      searchTermTrips,
      ['origin', 'destination', 'cargoDetails'],
      'status',
      filterTripStatus,
      sortConfigTrips
    ),
    [trips, searchTermTrips, filterTripStatus, sortConfigTrips]
  );

  const handleTripSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = tripModal.formData;
    if (!formData.origin || !formData.destination || !formData.departureTime || !formData.vehicleId || !formData.driverId) {
      showNotification('Origin, Destination, Departure Time, Vehicle, and Driver are required.', 'error');
      return;
    }
    if (tripModal.mode === 'add') {
      setTrips([...trips, { ...formData, id: generateId('T') }]);
      showNotification('Trip scheduled successfully!', 'success');
    } else if (tripModal.data?.id) {
      setTrips(trips.map(t => t.id === tripModal.data!.id ? { ...formData, id: tripModal.data!.id } : t));
      showNotification('Trip updated successfully!', 'success');
    }
    closeModal(setTripModal);
  };

  const deleteTrip = (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      setTrips(trips.filter(t => t.id !== id));
      showNotification('Trip deleted successfully!', 'success');
    }
  };
  // #endregion Trip Management

  // #region Dashboard Data
  const dashboardStats = useMemo((): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    return {
      totalVehicles: vehicles.length,
      availableVehicles: vehicles.filter(v => v.status === 'Available').length,
      vehiclesOnTrip: vehicles.filter(v => v.status === 'On Trip').length,
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.status === 'Active').length,
      scheduledTrips: trips.filter(t => t.status === 'Scheduled').length,
      ongoingTrips: trips.filter(t => t.status === 'Ongoing').length,
      completedTripsToday: trips.filter(t => t.status === 'Completed' && t.arrivalTime?.startsWith(today)).length,
    };
  }, [vehicles, drivers, trips]);

  const tripStatusChartData = useMemo((): ChartDataItem[] => {
    const counts = trips.reduce((acc, trip) => {
      acc[trip.status] = (acc[trip.status] || 0) + 1;
      return acc;
    }, {} as Record<TripStatus, number>); 
    const colors: Record<TripStatus, string> = {
      Scheduled: '#3b82f6', // blue-500
      Ongoing: '#f59e0b',   // amber-500
      Completed: '#10b981', // emerald-500
      Cancelled: '#ef4444', // red-500
    };
    return (Object.keys(counts) as TripStatus[]).map(status => ({
      name: status,
      value: counts[status],
      fill: colors[status],
    }));
  }, [trips]);

  const vehicleStatusChartData = useMemo((): ChartDataItem[] => {
    const counts = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
      return acc;
    }, {} as Record<VehicleStatus, number>); 
    const colors: Record<VehicleStatus, string> = {
      Available: '#22c55e', // green-500
      'On Trip': '#f97316', // orange-500
      Maintenance: '#eab308',// yellow-500
      Inactive: '#6b7280',   // gray-500
    };
    return (Object.keys(counts) as VehicleStatus[]).map(status => ({
      name: status,
      value: counts[status],
      fill: colors[status],
    }));
  }, [vehicles]);
  // #endregion Dashboard Data

  // #region Render Methods
  const renderSidebar = () => (
    <aside className={`${styles.sidebar} fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 md:translate-x-0 dark:bg-slate-800 dark:border-slate-700 theme-transition`}>
      <div className="h-full px-3 pb-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          {[ {label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard'}, 
             {label: 'Vehicles', icon: LucideTruck, view: 'vehicles'}, 
             {label: 'Drivers', icon: UserRound, view: 'drivers'}, 
             {label: 'Trips', icon: LucidePackage, view: 'trips'} ].map(item => (
            <li key={item.view}>
              <button 
                onClick={() => { setCurrentView(item.view as CurrentView); setShowMobileMenu(false); }}
                className={`flex items-center p-2 rounded-lg w-full text-left theme-transition ${currentView === item.view ? 'bg-primary-100 dark:bg-primary-700 text-primary-600 dark:text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white'}`}
                role="menuitem"
                name={`nav-${item.view}`}
              >
                <item.icon className={`w-5 h-5 theme-transition ${currentView === item.view ? 'text-primary-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                <span className="ml-3">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );

  const renderHeader = () => (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-slate-800 dark:border-slate-700 theme-transition">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-slate-700 dark:focus:ring-slate-600">
              <span className="sr-only">Open sidebar</span>
              <Menu />
            </button>
            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white ml-2 md:ml-0">TransportMS</span>
          </div>
          <div className="flex items-center">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-slate-600" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <Moon className="w-5 h-5 text-gray-500" /> : <SunMedium className="w-5 h-5 text-yellow-400" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderNotification = () => {
    if (!notification) return null;
    const Icon = notification.type === 'success' ? CheckCircle : AlertCircle;
    const bgColor = notification.type === 'success' ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900';
    const textColor = notification.type === 'success' ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200';
    return (
      <div className={`fixed top-20 right-5 p-4 rounded-md shadow-lg ${bgColor} ${textColor} flex items-center gap-2 z-[var(--z-tooltip)] theme-transition`}>
        <Icon className="w-5 h-5" />
        <span>{notification.message}</span>
        <button onClick={() => setNotification(null)} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg hover:bg-opacity-20 hover:bg-current focus:outline-none">
          <LucideX className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderModal = <T, U>(
    modalState: ModalState<T, U>,
    closeHandler: () => void,
    submitHandler: (e: FormEvent<HTMLFormElement>) => void,
    title: string,
    children: React.ReactNode
  ) => {
    if (!modalState.isOpen) return null;
    return (
      <div className="modal-backdrop theme-transition-bg" onClick={closeHandler} role="dialog" aria-modal="true" aria-labelledby={`${title.toLowerCase().replace(' ', '-')}-modal-title`}>
        <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 id={`${title.toLowerCase().replace(' ', '-')}-modal-title`} className="text-lg font-semibold">{modalState.mode === 'add' ? 'Add' : 'Edit'} {title}</h3>
            <button onClick={closeHandler} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 theme-transition" aria-label={`Close ${title} modal`}>
              <LucideX className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={submitHandler} className="mt-4 space-y-4">
            {children}
            <div className="modal-footer">
              <button type="button" onClick={closeHandler} className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 theme-transition">Cancel</button>
              <button type="submit" className="btn btn-primary theme-transition">{modalState.mode === 'add' ? 'Add' : 'Save Changes'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const Menu: React.FC = () => (
    <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
       <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 9.75A.75.75 0 012.75 9h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 9.75z"></path>
    </svg>
  );

  const renderDashboardView = () => (
    <div className="p-4 space-y-6 fade-in">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[ { title: 'Total Vehicles', value: dashboardStats.totalVehicles, icon: LucideTruck },
           { title: 'Available Vehicles', value: dashboardStats.availableVehicles, icon: LucideTruck, className: 'text-green-500' },
           { title: 'Vehicles On Trip', value: dashboardStats.vehiclesOnTrip, icon: LucideTruck, className: 'text-orange-500' },
           { title: 'Total Drivers', value: dashboardStats.totalDrivers, icon: UserRound },
           { title: 'Active Drivers', value: dashboardStats.activeDrivers, icon: UserRound, className: 'text-green-500' },
           { title: 'Scheduled Trips', value: dashboardStats.scheduledTrips, icon: LucidePackage, className: 'text-blue-500' },
           { title: 'Ongoing Trips', value: dashboardStats.ongoingTrips, icon: LucidePackage, className: 'text-amber-500' },
           { title: 'Completed Today', value: dashboardStats.completedTripsToday, icon: CheckCircle, className: 'text-emerald-500' } ].map(stat => (
          <div key={stat.title} className="stat-card theme-transition-all">
            <div className="flex items-center justify-between">
              <p className="stat-title">{stat.title}</p>
              <stat.icon className={`w-6 h-6 ${stat.className || 'text-primary-500 dark:text-primary-400'}`} />
            </div>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card theme-transition-all">
          <h3 className="text-lg font-medium mb-4">Trip Statuses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie data={tripStatusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {tripStatusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        <div className="card theme-transition-all">
          <h3 className="text-lg font-medium mb-4">Vehicle Statuses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleStatusChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
              <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#e2e8f0' : '#1f2937' }} />
              <YAxis tick={{ fill: theme === 'dark' ? '#e2e8f0' : '#1f2937' }} />
              <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', border: `1px solid ${theme === 'dark' ? '#334155' : '#e5e7eb'}`}} itemStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#1f2937' }}/>
              <Legend />
              <Bar dataKey="value" name="Count">
                {vehicleStatusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderVehiclesView = () => (
    <div className="p-4 space-y-4 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Vehicles</h1>
        <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
          <label htmlFor="vehicle-upload" className="btn btn-secondary btn-responsive theme-transition cursor-pointer flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Import
            <input id="vehicle-upload" type="file" accept=".csv" className="hidden" onChange={handleVehicleFileUpload} />
          </label>
          <button onClick={downloadVehicleTemplate} className="btn btn-secondary btn-responsive theme-transition flex items-center gap-2">
            <DownloadCloud className="w-4 h-4" /> Template
          </button>
          <button onClick={() => openModal(setVehicleModal, 'add', initialVehicleFormData)} className="btn btn-primary btn-responsive theme-transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="form-group">
          <label htmlFor="searchVehicles" className="form-label sr-only">Search Vehicles</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LucideSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              id="searchVehicles" 
              className="input pl-10 input-responsive" 
              placeholder="Search by Reg. No, Type, Model..." 
              value={searchTermVehicles} 
              onChange={(e) => setSearchTermVehicles(e.target.value)} 
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="filterVehicleStatus" className="form-label sr-only">Filter by Status</label>
          <select 
            id="filterVehicleStatus" 
            className="input input-responsive"
            value={filterVehicleStatus}
            onChange={(e) => setFilterVehicleStatus(e.target.value as VehicleStatus | '')}
          >
            <option value="">All Statuses</option>
            {VEHICLE_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>
      {/* Table */}
      <div className="table-container theme-transition">
        <table className="table">
          <thead className="table-header">
            <tr>
              {[{key: 'registrationNumber', label: 'Reg. No.'}, {key: 'type', label: 'Type'}, {key: 'model', label: 'Model'}, {key: 'capacity', label: 'Capacity'}, {key: 'purchaseDate', label: 'Purchase Date'}, {key: 'status', label: 'Status'}].map(col => (
                <th key={col.key} scope="col" className="table-cell px-4 py-3">
                  <button onClick={() => requestSort(col.key as keyof Vehicle, sortConfigVehicles, setSortConfigVehicles)} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 w-full">
                    {col.label} {getSortIcon(col.key as keyof Vehicle, sortConfigVehicles)}
                  </button>
                </th>
              ))}
              <th scope="col" className="table-cell px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                <td className="table-cell px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{vehicle.registrationNumber}</td>
                <td className="table-cell px-4 py-3">{vehicle.type}</td>
                <td className="table-cell px-4 py-3">{vehicle.model}</td>
                <td className="table-cell px-4 py-3">{vehicle.capacity}</td>
                <td className="table-cell px-4 py-3">{new Date(vehicle.purchaseDate).toLocaleDateString()}</td>
                <td className="table-cell px-4 py-3"><span className={`badge ${vehicle.status === 'Available' ? 'badge-success' : vehicle.status === 'On Trip' ? 'badge-warning' : vehicle.status === 'Maintenance' ? 'badge-error' : 'badge-info'}`}>{vehicle.status}</span></td>
                <td className="table-cell px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <button onClick={() => openModal(setVehicleModal, 'edit', initialVehicleFormData, vehicle)} className="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 theme-transition" aria-label={`Edit ${vehicle.registrationNumber}`}><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteVehicle(vehicle.id)} className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 theme-transition" aria-label={`Delete ${vehicle.registrationNumber}`}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={7} className="table-cell text-center py-4">No vehicles found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {renderModal(vehicleModal, () => closeModal(setVehicleModal), handleVehicleSubmit, 'Vehicle', (
        <>
          <div className="form-group">
            <label htmlFor="registrationNumber" className="form-label">Registration Number</label>
            <input type="text" id="registrationNumber" name="registrationNumber" value={vehicleModal.formData.registrationNumber} onChange={(e) => handleInputChange(setVehicleModal, e)} className="input" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="type" className="form-label">Type</label>
              <select id="type" name="type" value={vehicleModal.formData.type} onChange={(e) => handleInputChange(setVehicleModal, e)} className="input" required>
                {VEHICLE_TYPES.map(vt => <option key={vt} value={vt}>{vt}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="model" className="form-label">Model</label>
              <input type="text" id="model" name="model" value={vehicleModal.formData.model} onChange={(e) => handleInputChange(setVehicleModal, e)} className="input" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="capacity" className="form-label">Capacity</label>
              <input type="text" id="capacity" name="capacity" value={vehicleModal.formData.capacity} onChange={(e) => handleInputChange(setVehicleModal, e)} className="input" placeholder="e.g., 20 Tons, 5 Passengers" />
            </div>
            <div className="form-group">
              <label htmlFor="purchaseDate" className="form-label">Purchase Date</label>
              <input type="date" id="purchaseDate" name="purchaseDate" value={vehicleModal.formData.purchaseDate.split('T')[0]} onChange={(e) => handleInputChange(setVehicleModal, e)} className="input" required />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="status" className="form-label">Status</label>
            <select id="status" name="status" value={vehicleModal.formData.status} onChange={(e) => handleInputChange(setVehicleModal, e)} className="input" required>
              {VEHICLE_STATUSES.map(vs => <option key={vs} value={vs}>{vs}</option>)}
            </select>
          </div>
        </>
      ))}
    </div>
  );
  
  const renderDriversView = () => (
    <div className="p-4 space-y-4 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Drivers</h1>
        <button onClick={() => openModal(setDriverModal, 'add', initialDriverFormData)} className="btn btn-primary btn-responsive theme-transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="form-group">
          <label htmlFor="searchDrivers" className="form-label sr-only">Search Drivers</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LucideSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              id="searchDrivers" 
              className="input pl-10 input-responsive" 
              placeholder="Search by Name, License..." 
              value={searchTermDrivers} 
              onChange={(e) => setSearchTermDrivers(e.target.value)} 
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="filterDriverStatus" className="form-label sr-only">Filter by Status</label>
          <select 
            id="filterDriverStatus" 
            className="input input-responsive"
            value={filterDriverStatus}
            onChange={(e) => setFilterDriverStatus(e.target.value as DriverStatus | '')}
          >
            <option value="">All Statuses</option>
            {DRIVER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>
      {/* Table */}
      <div className="table-container theme-transition">
        <table className="table">
          <thead className="table-header">
            <tr>
            {[{key: 'name', label: 'Name'}, {key: 'licenseNumber', label: 'License No.'}, {key: 'contactPhone', label: 'Contact'}, {key: 'status', label: 'Status'}, {key: 'assignedVehicleId', label: 'Assigned Vehicle'}].map(col => (
                <th key={col.key} scope="col" className="table-cell px-4 py-3">
                  <button onClick={() => requestSort(col.key as keyof Driver, sortConfigDrivers, setSortConfigDrivers)} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 w-full">
                    {col.label} {getSortIcon(col.key as keyof Driver, sortConfigDrivers)}
                  </button>
                </th>
              ))}
              <th scope="col" className="table-cell px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length > 0 ? filteredDrivers.map((driver) => (
              <tr key={driver.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                <td className="table-cell px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{driver.name}</td>
                <td className="table-cell px-4 py-3">{driver.licenseNumber}</td>
                <td className="table-cell px-4 py-3">{driver.contactPhone}</td>
                <td className="table-cell px-4 py-3"><span className={`badge ${driver.status === 'Active' ? 'badge-success' : driver.status === 'On Leave' ? 'badge-warning' : 'badge-error'}`}>{driver.status}</span></td>
                <td className="table-cell px-4 py-3">{vehicles.find(v => v.id === driver.assignedVehicleId)?.registrationNumber || 'N/A'}</td>
                <td className="table-cell px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <button onClick={() => openModal(setDriverModal, 'edit', initialDriverFormData, driver)} className="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 theme-transition" aria-label={`Edit ${driver.name}`}><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteDriver(driver.id)} className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 theme-transition" aria-label={`Delete ${driver.name}`}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="table-cell text-center py-4">No drivers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {renderModal(driverModal, () => closeModal(setDriverModal), handleDriverSubmit, 'Driver', (
        <>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input type="text" id="name" name="name" value={driverModal.formData.name} onChange={(e) => handleInputChange(setDriverModal, e)} className="input" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="licenseNumber" className="form-label">License Number</label>
              <input type="text" id="licenseNumber" name="licenseNumber" value={driverModal.formData.licenseNumber} onChange={(e) => handleInputChange(setDriverModal, e)} className="input" required />
            </div>
            <div className="form-group">
              <label htmlFor="contactPhone" className="form-label">Contact Phone</label>
              <input type="tel" id="contactPhone" name="contactPhone" value={driverModal.formData.contactPhone} onChange={(e) => handleInputChange(setDriverModal, e)} className="input" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="driverStatus" className="form-label">Status</label>
              <select id="driverStatus" name="status" value={driverModal.formData.status} onChange={(e) => handleInputChange(setDriverModal, e)} className="input" required>
                {DRIVER_STATUSES.map(ds => <option key={ds} value={ds}>{ds}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="assignedVehicleId" className="form-label">Assigned Vehicle (Optional)</label>
              <select id="assignedVehicleId" name="assignedVehicleId" value={driverModal.formData.assignedVehicleId || ''} onChange={(e) => handleInputChange(setDriverModal, e)} className="input">
                <option value="">None</option>
                {vehicles.filter(v => v.status === 'Available' || v.id === driverModal.formData.assignedVehicleId).map(v => <option key={v.id} value={v.id}>{v.registrationNumber} - {v.model}</option>)}
              </select>
            </div>
          </div>
        </>
      ))}
    </div>
  );
  
  const renderTripsView = () => (
    <div className="p-4 space-y-4 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Trips</h1>
        <button onClick={() => openModal(setTripModal, 'add', initialTripFormData)} className="btn btn-primary btn-responsive theme-transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Trip
        </button>
      </div>
      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="form-group">
          <label htmlFor="searchTrips" className="form-label sr-only">Search Trips</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LucideSearch className="w-5 h-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              id="searchTrips" 
              className="input pl-10 input-responsive" 
              placeholder="Search by Origin, Destination, Cargo..." 
              value={searchTermTrips} 
              onChange={(e) => setSearchTermTrips(e.target.value)} 
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="filterTripStatus" className="form-label sr-only">Filter by Status</label>
          <select 
            id="filterTripStatus" 
            className="input input-responsive"
            value={filterTripStatus}
            onChange={(e) => setFilterTripStatus(e.target.value as TripStatus | '')}
          >
            <option value="">All Statuses</option>
            {TRIP_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
      </div>
      {/* Table */}
      <div className="table-container theme-transition">
        <table className="table">
          <thead className="table-header">
            <tr>
              {[{key: 'origin', label: 'Origin'}, {key: 'destination', label: 'Destination'}, {key: 'departureTime', label: 'Departure'}, {key: 'arrivalTime', label: 'Arrival'}, {key: 'vehicleId', label: 'Vehicle'}, {key: 'driverId', label: 'Driver'}, {key: 'status', label: 'Status'}].map(col => (
                <th key={col.key} scope="col" className="table-cell px-4 py-3">
                  <button onClick={() => requestSort(col.key as keyof Trip, sortConfigTrips, setSortConfigTrips)} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 w-full">
                    {col.label} {getSortIcon(col.key as keyof Trip, sortConfigTrips)}
                  </button>
                </th>
              ))}
              <th scope="col" className="table-cell px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrips.length > 0 ? filteredTrips.map((trip) => (
              <tr key={trip.id} className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                <td className="table-cell px-4 py-3 font-medium text-gray-900 dark:text-white"><MapPin className="w-4 h-4 inline mr-1 text-gray-400" />{trip.origin}</td>
                <td className="table-cell px-4 py-3"><MapPin className="w-4 h-4 inline mr-1 text-gray-400" />{trip.destination}</td>
                <td className="table-cell px-4 py-3"><CalendarDays className="w-4 h-4 inline mr-1 text-gray-400" />{new Date(trip.departureTime).toLocaleString()}</td>
                <td className="table-cell px-4 py-3">{trip.arrivalTime ? <><CalendarDays className="w-4 h-4 inline mr-1 text-gray-400" />{new Date(trip.arrivalTime).toLocaleString()}</> : 'N/A'}</td>
                <td className="table-cell px-4 py-3">{vehicles.find(v => v.id === trip.vehicleId)?.registrationNumber || 'N/A'}</td>
                <td className="table-cell px-4 py-3">{drivers.find(d => d.id === trip.driverId)?.name || 'N/A'}</td>
                <td className="table-cell px-4 py-3"><span className={`badge ${trip.status === 'Completed' ? 'badge-success' : trip.status === 'Ongoing' ? 'badge-warning' : trip.status === 'Scheduled' ? 'badge-info' : 'badge-error'}`}>{trip.status}</span></td>
                <td className="table-cell px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <button onClick={() => openModal(setTripModal, 'edit', initialTripFormData, trip)} className="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 theme-transition" aria-label={`Edit trip ${trip.id}`}><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteTrip(trip.id)} className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 theme-transition" aria-label={`Delete trip ${trip.id}`}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="table-cell text-center py-4">No trips found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {renderModal(tripModal, () => closeModal(setTripModal), handleTripSubmit, 'Trip', (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="origin" className="form-label">Origin</label>
              <input type="text" id="origin" name="origin" value={tripModal.formData.origin} onChange={(e) => handleInputChange(setTripModal, e)} className="input" required />
            </div>
            <div className="form-group">
              <label htmlFor="destination" className="form-label">Destination</label>
              <input type="text" id="destination" name="destination" value={tripModal.formData.destination} onChange={(e) => handleInputChange(setTripModal, e)} className="input" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="departureTime" className="form-label">Departure Time</label>
              <input type="datetime-local" id="departureTime" name="departureTime" value={tripModal.formData.departureTime.slice(0,16)} onChange={(e) => handleInputChange(setTripModal, e)} className="input" required />
            </div>
            <div className="form-group">
              <label htmlFor="arrivalTime" className="form-label">Arrival Time (Optional)</label>
              <input type="datetime-local" id="arrivalTime" name="arrivalTime" value={tripModal.formData.arrivalTime?.slice(0,16) || ''} onChange={(e) => handleInputChange(setTripModal, e)} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="vehicleId" className="form-label">Vehicle</label>
              <select id="vehicleId" name="vehicleId" value={tripModal.formData.vehicleId} onChange={(e) => handleInputChange(setTripModal, e)} className="input" required>
                <option value="" disabled>Select Vehicle</option>
                {vehicles.filter(v => v.status === 'Available' || v.id === tripModal.formData.vehicleId).map(v => <option key={v.id} value={v.id}>{v.registrationNumber} ({v.type})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="driverId" className="form-label">Driver</label>
              <select id="driverId" name="driverId" value={tripModal.formData.driverId} onChange={(e) => handleInputChange(setTripModal, e)} className="input" required>
                <option value="" disabled>Select Driver</option>
                {drivers.filter(d => d.status === 'Active' || d.id === tripModal.formData.driverId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="tripStatus" className="form-label">Status</label>
            <select id="tripStatus" name="status" value={tripModal.formData.status} onChange={(e) => handleInputChange(setTripModal, e)} className="input" required>
              {TRIP_STATUSES.map(ts => <option key={ts} value={ts}>{ts}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="cargoDetails" className="form-label">Cargo Details (Optional)</label>
            <textarea id="cargoDetails" name="cargoDetails" value={tripModal.formData.cargoDetails || ''} onChange={(e) => handleInputChange(setTripModal, e)} className="input" rows={3}></textarea>
          </div>
        </>
      ))}
    </div>
  );

  const renderContent = () => {
    if (!isInitialized) {
      return <div className="p-4 text-center">Loading application data...</div>;
    }
    switch (currentView) {
      case 'dashboard': return renderDashboardView();
      case 'vehicles': return renderVehiclesView();
      case 'drivers': return renderDriversView();
      case 'trips': return renderTripsView();
      default: return <div className="p-4">Select a view</div>;
    }
  };
  // #endregion Render Methods

  return (
    <div className={`min-h-screen theme-transition-bg ${theme === 'dark' ? 'dark' : ''}`}>
      {renderHeader()}
      {renderSidebar()}
      {renderNotification()}
      <main className="p-4 md:ml-64 pt-20 theme-transition">
        {renderContent()}
      </main>
      <footer className="md:ml-64 p-4 bg-gray-100 dark:bg-slate-900 text-center text-sm text-gray-600 dark:text-slate-400 theme-transition">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
