import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Home,
  DollarSign,
  Wrench,
  FileText,
  PieChart,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Moon,
  Sun,
  ChevronDown,
  Calendar,
  CheckCircle,
  Download,
  Upload,
  Printer,
  ArrowUpDown,
  MessageCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  // Define TypeScript interfaces
  interface Tenant {
    id: string;
    name: string;
    email: string;
    phone: string;
    creditScore: number;
    income: number;
    status: 'pending' | 'approved' | 'rejected';
    leaseStart?: string;
    leaseEnd?: string;
    property?: string;
    unit?: string;
    rent?: number;
    securityDeposit?: number;
    backgroundCheckComplete: boolean;
    references: TenantReference[];
    applicationDate: string;
    notes: string;
  }

  interface TenantReference {
    id: string;
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }

  interface Property {
    id: string;
    name: string;
    address: string;
    units: number;
    type: 'apartment' | 'house' | 'condo' | 'commercial';
    purchaseDate: string;
    purchasePrice: number;
    currentValue: number;
    image?: string;
  }

  interface Unit {
    id: string;
    propertyId: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    rent: number;
    status: 'vacant' | 'occupied' | 'maintenance';
    tenantId?: string;
  }

  interface Payment {
    id: string;
    tenantId: string;
    propertyId: string;
    unitId: string;
    amount: number;
    date: string;
    type: 'rent' | 'deposit' | 'fee' | 'other';
    status: 'pending' | 'paid' | 'late' | 'partial';
    notes: string;
  }

  interface MaintenanceRequest {
    id: string;
    tenantId: string;
    propertyId: string;
    unitId: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'emergency';
    status: 'open' | 'in-progress' | 'completed' | 'cancelled';
    dateSubmitted: string;
    dateCompleted?: string;
    cost?: number;
    assignedTo?: string;
    notes: string;
    images?: string[];
  }

  interface Expense {
    id: string;
    propertyId: string;
    category: 'maintenance' | 'utilities' | 'taxes' | 'insurance' | 'mortgage' | 'other';
    amount: number;
    date: string;
    description: string;
    receipt?: string;
  }

  interface Tab {
    id: string;
    label: string;
    icon: React.ReactNode;
  }

  // Setup state for dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // State for all data
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // State for modals
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  
  // State for editing
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [currentMaintenance, setCurrentMaintenance] = useState<MaintenanceRequest | null>(null);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  
  // State for filtering
  const [tenantFilter, setTenantFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');
  const [maintenanceFilter, setMaintenanceFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [expenseFilter, setExpenseFilter] = useState('');
  
  // State for status filtering
  const [tenantStatusFilter, setTenantStatusFilter] = useState<string>('all');
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [unitStatusFilter, setUnitStatusFilter] = useState<string>('all');

  // Modal refs for keyboard events
  const tenantModalRef = useRef<HTMLDivElement>(null);
  const propertyModalRef = useRef<HTMLDivElement>(null);
  const unitModalRef = useRef<HTMLDivElement>(null);
  const paymentModalRef = useRef<HTMLDivElement>(null);
  const maintenanceModalRef = useRef<HTMLDivElement>(null);
  const expenseModalRef = useRef<HTMLDivElement>(null);

  // Navigation tabs
  const tabs: Tab[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { id: 'tenants', label: 'Tenants', icon: <User size={18} /> },
    { id: 'properties', label: 'Properties', icon: <Home size={18} /> },
    { id: 'payments', label: 'Payments', icon: <DollarSign size={18} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={18} /> },
    { id: 'expenses', label: 'Expenses', icon: <FileText size={18} /> },
    { id: 'reports', label: 'Reports', icon: <PieChart size={18} /> },
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedTenants = localStorage.getItem('tenants');
    const loadedProperties = localStorage.getItem('properties');
    const loadedUnits = localStorage.getItem('units');
    const loadedPayments = localStorage.getItem('payments');
    const loadedMaintenanceRequests = localStorage.getItem('maintenanceRequests');
    const loadedExpenses = localStorage.getItem('expenses');

    if (loadedTenants) setTenants(JSON.parse(loadedTenants));
    if (loadedProperties) setProperties(JSON.parse(loadedProperties));
    if (loadedUnits) setUnits(JSON.parse(loadedUnits));
    if (loadedPayments) setPayments(JSON.parse(loadedPayments));
    if (loadedMaintenanceRequests) setMaintenanceRequests(JSON.parse(loadedMaintenanceRequests));
    if (loadedExpenses) setExpenses(JSON.parse(loadedExpenses));

    // Initialize with sample data if no data exists
    if (!loadedTenants) {
      const sampleTenants: Tenant[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          creditScore: 720,
          income: 65000,
          status: 'approved',
          leaseStart: '2023-01-01',
          leaseEnd: '2024-01-01',
          property: '1',
          unit: '1-1',
          rent: 1500,
          securityDeposit: 1500,
          backgroundCheckComplete: true,
          references: [
            { id: '1-1', name: 'Jane Smith', relationship: 'Previous Landlord', phone: '555-987-6543', email: 'jane@example.com' }
          ],
          applicationDate: '2022-11-15',
          notes: 'Good tenant, always pays on time.'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '555-234-5678',
          creditScore: 680,
          income: 52000,
          status: 'pending',
          backgroundCheckComplete: false,
          references: [],
          applicationDate: '2023-05-10',
          notes: 'Waiting for background check results.'
        },
      ];
      setTenants(sampleTenants);
      localStorage.setItem('tenants', JSON.stringify(sampleTenants));
    }

    if (!loadedProperties) {
      const sampleProperties: Property[] = [
        {
          id: '1',
          name: 'Sunshine Apartments',
          address: '123 Main St, Anytown, USA',
          units: 4,
          type: 'apartment',
          purchaseDate: '2020-06-15',
          purchasePrice: 450000,
          currentValue: 520000,
          image: 'https://placehold.co/600x400'
        },
        {
          id: '2',
          name: 'Lakeside House',
          address: '456 Lake Rd, Waterfront, USA',
          units: 1,
          type: 'house',
          purchaseDate: '2019-03-20',
          purchasePrice: 320000,
          currentValue: 375000,
          image: 'https://placehold.co/600x400'
        }
      ];
      setProperties(sampleProperties);
      localStorage.setItem('properties', JSON.stringify(sampleProperties));
    }

    if (!loadedUnits) {
      const sampleUnits: Unit[] = [
        {
          id: '1-1',
          propertyId: '1',
          unitNumber: '101',
          bedrooms: 2,
          bathrooms: 1,
          sqft: 850,
          rent: 1500,
          status: 'occupied',
          tenantId: '1'
        },
        {
          id: '1-2',
          propertyId: '1',
          unitNumber: '102',
          bedrooms: 2,
          bathrooms: 1,
          sqft: 850,
          rent: 1500,
          status: 'vacant'
        },
        {
          id: '1-3',
          propertyId: '1',
          unitNumber: '201',
          bedrooms: 1,
          bathrooms: 1,
          sqft: 650,
          rent: 1200,
          status: 'maintenance'
        },
        {
          id: '1-4',
          propertyId: '1',
          unitNumber: '202',
          bedrooms: 3,
          bathrooms: 2,
          sqft: 1100,
          rent: 1900,
          status: 'vacant'
        },
        {
          id: '2-1',
          propertyId: '2',
          unitNumber: 'Main',
          bedrooms: 4,
          bathrooms: 3,
          sqft: 2200,
          rent: 2800,
          status: 'vacant'
        }
      ];
      setUnits(sampleUnits);
      localStorage.setItem('units', JSON.stringify(sampleUnits));
    }

    if (!loadedPayments) {
      const samplePayments: Payment[] = [
        {
          id: '1',
          tenantId: '1',
          propertyId: '1',
          unitId: '1-1',
          amount: 1500,
          date: '2023-05-01',
          type: 'rent',
          status: 'paid',
          notes: 'May rent payment'
        },
        {
          id: '2',
          tenantId: '1',
          propertyId: '1',
          unitId: '1-1',
          amount: 1500,
          date: '2023-06-01',
          type: 'rent',
          status: 'paid',
          notes: 'June rent payment'
        },
        {
          id: '3',
          tenantId: '1',
          propertyId: '1',
          unitId: '1-1',
          amount: 1500,
          date: '2023-07-01',
          type: 'rent',
          status: 'pending',
          notes: 'July rent payment'
        }
      ];
      setPayments(samplePayments);
      localStorage.setItem('payments', JSON.stringify(samplePayments));
    }

    if (!loadedMaintenanceRequests) {
      const sampleMaintenanceRequests: MaintenanceRequest[] = [
        {
          id: '1',
          tenantId: '1',
          propertyId: '1',
          unitId: '1-1',
          title: 'Leaking faucet',
          description: 'The kitchen sink faucet is leaking and needs repair.',
          priority: 'medium',
          status: 'completed',
          dateSubmitted: '2023-05-10',
          dateCompleted: '2023-05-12',
          cost: 85,
          assignedTo: 'Mike the Plumber',
          notes: 'Fixed by replacing the washer.',
          images: []
        },
        {
          id: '2',
          tenantId: '1',
          propertyId: '1',
          unitId: '1-1',
          title: 'AC not cooling',
          description: 'The air conditioner is running but not cooling effectively.',
          priority: 'high',
          status: 'in-progress',
          dateSubmitted: '2023-06-15',
          assignedTo: 'Cool Air Services',
          notes: 'Technician scheduled for tomorrow.',
          images: []
        },
        {
          id: '3',
          tenantId: '',
          propertyId: '1',
          unitId: '1-3',
          title: 'Water damage repair',
          description: 'Repair water damage in bathroom from leak in unit above.',
          priority: 'high',
          status: 'in-progress',
          dateSubmitted: '2023-06-10',
          assignedTo: 'Premier Restoration',
          notes: 'Drying equipment installed, will need drywall repair after.',
          images: []
        }
      ];
      setMaintenanceRequests(sampleMaintenanceRequests);
      localStorage.setItem('maintenanceRequests', JSON.stringify(sampleMaintenanceRequests));
    }

    if (!loadedExpenses) {
      const sampleExpenses: Expense[] = [
        {
          id: '1',
          propertyId: '1',
          category: 'maintenance',
          amount: 85,
          date: '2023-05-12',
          description: 'Faucet repair in unit 101',
        },
        {
          id: '2',
          propertyId: '1',
          category: 'utilities',
          amount: 320,
          date: '2023-06-05',
          description: 'Water and electricity for common areas',
        },
        {
          id: '3',
          propertyId: '1',
          category: 'insurance',
          amount: 1200,
          date: '2023-06-01',
          description: 'Quarterly property insurance payment',
        },
        {
          id: '4',
          propertyId: '2',
          category: 'mortgage',
          amount: 1550,
          date: '2023-06-01',
          description: 'Monthly mortgage payment',
        },
        {
          id: '5',
          propertyId: '2',
          category: 'taxes',
          amount: 2400,
          date: '2023-06-15',
          description: 'Semi-annual property tax payment',
        }
      ];
      setExpenses(sampleExpenses);
      localStorage.setItem('expenses', JSON.stringify(sampleExpenses));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (tenants.length > 0) localStorage.setItem('tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    if (properties.length > 0) localStorage.setItem('properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    if (units.length > 0) localStorage.setItem('units', JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    if (payments.length > 0) localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    if (maintenanceRequests.length > 0) localStorage.setItem('maintenanceRequests', JSON.stringify(maintenanceRequests));
  }, [maintenanceRequests]);

  useEffect(() => {
    if (expenses.length > 0) localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTenantModal(false);
        setShowPropertyModal(false);
        setShowUnitModal(false);
        setShowPaymentModal(false);
        setShowMaintenanceModal(false);
        setShowExpenseModal(false);
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, []);

  // Filtering functions
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(tenantFilter.toLowerCase()) ||
      tenant.email.toLowerCase().includes(tenantFilter.toLowerCase());
    const matchesStatus = tenantStatusFilter === 'all' || tenant.status === tenantStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProperties = properties.filter(property => 
    property.name.toLowerCase().includes(propertyFilter.toLowerCase()) ||
    property.address.toLowerCase().includes(propertyFilter.toLowerCase())
  );

  const filteredUnits = units.filter(unit => {
    const matchesStatus = unitStatusFilter === 'all' || unit.status === unitStatusFilter;
    return matchesStatus;
  });

  const filteredMaintenance = maintenanceRequests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(maintenanceFilter.toLowerCase()) ||
      request.description.toLowerCase().includes(maintenanceFilter.toLowerCase());
    const matchesStatus = maintenanceStatusFilter === 'all' || request.status === maintenanceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter(payment => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    const matchesSearch = tenant && tenant.name.toLowerCase().includes(paymentFilter.toLowerCase());
    const matchesStatus = paymentStatusFilter === 'all' || payment.status === paymentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(expenseFilter.toLowerCase()) ||
    expense.category.toLowerCase().includes(expenseFilter.toLowerCase())
  );

  // Handlers for adding new items
  const handleAddTenant = (data: any) => {
    if (currentTenant) {
      // Update existing tenant
      setTenants(prev => prev.map(tenant => 
        tenant.id === currentTenant.id ? {...data, id: tenant.id} : tenant
      ));
    } else {
      // Add new tenant
      const newTenant: Tenant = {
        ...data,
        id: Date.now().toString(),
        applicationDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'pending',
        backgroundCheckComplete: false,
        references: [],
        notes: data.notes || ''
      };
      setTenants(prev => [...prev, newTenant]);
    }
    setCurrentTenant(null);
    setShowTenantModal(false);
  };

  const handleAddProperty = (data: any) => {
    if (currentProperty) {
      // Update existing property
      setProperties(prev => prev.map(property => 
        property.id === currentProperty.id ? {...data, id: property.id} : property
      ));
    } else {
      // Add new property
      const newProperty: Property = {
        ...data,
        id: Date.now().toString(),
      };
      setProperties(prev => [...prev, newProperty]);
    }
    setCurrentProperty(null);
    setShowPropertyModal(false);
  };

  const handleAddUnit = (data: any) => {
    if (currentUnit) {
      // Update existing unit
      setUnits(prev => prev.map(unit => 
        unit.id === currentUnit.id ? {...data, id: unit.id} : unit
      ));
    } else {
      // Add new unit
      const newUnit: Unit = {
        ...data,
        id: `${data.propertyId}-${Date.now().toString()}`,
      };
      setUnits(prev => [...prev, newUnit]);
    }
    setCurrentUnit(null);
    setShowUnitModal(false);
  };

  const handleAddPayment = (data: any) => {
    if (currentPayment) {
      // Update existing payment
      setPayments(prev => prev.map(payment => 
        payment.id === currentPayment.id ? {...data, id: payment.id} : payment
      ));
    } else {
      // Add new payment
      const newPayment: Payment = {
        ...data,
        id: Date.now().toString(),
      };
      setPayments(prev => [...prev, newPayment]);
    }
    setCurrentPayment(null);
    setShowPaymentModal(false);
  };

  const handleAddMaintenance = (data: any) => {
    if (currentMaintenance) {
      // Update existing maintenance request
      setMaintenanceRequests(prev => prev.map(request => 
        request.id === currentMaintenance.id ? {...data, id: request.id} : request
      ));
    } else {
      // Add new maintenance request
      const newRequest: MaintenanceRequest = {
        ...data,
        id: Date.now().toString(),
        dateSubmitted: format(new Date(), 'yyyy-MM-dd'),
        status: 'open',
        images: data.images || []
      };
      setMaintenanceRequests(prev => [...prev, newRequest]);
    }
    setCurrentMaintenance(null);
    setShowMaintenanceModal(false);
  };

  const handleAddExpense = (data: any) => {
    if (currentExpense) {
      // Update existing expense
      setExpenses(prev => prev.map(expense => 
        expense.id === currentExpense.id ? {...data, id: expense.id} : expense
      ));
    } else {
      // Add new expense
      const newExpense: Expense = {
        ...data,
        id: Date.now().toString(),
      };
      setExpenses(prev => [...prev, newExpense]);
    }
    setCurrentExpense(null);
    setShowExpenseModal(false);
  };

  // Delete handlers
  const handleDeleteTenant = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      setTenants(prev => prev.filter(tenant => tenant.id !== id));
      
      // Also update units if tenant is assigned
      setUnits(prev => prev.map(unit => 
        unit.tenantId === id ? {...unit, tenantId: undefined, status: 'vacant'} : unit
      ));
    }
  };

  const handleDeleteProperty = (id: string) => {
    if (window.confirm('Are you sure you want to delete this property? This will also delete all associated units.')) {
      setProperties(prev => prev.filter(property => property.id !== id));
      setUnits(prev => prev.filter(unit => unit.propertyId !== id));
      
      // Also delete associated payments, maintenance requests, and expenses
      setPayments(prev => prev.filter(payment => payment.propertyId !== id));
      setMaintenanceRequests(prev => prev.filter(request => request.propertyId !== id));
      setExpenses(prev => prev.filter(expense => expense.propertyId !== id));
    }
  };

  const handleDeleteUnit = (id: string) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      setUnits(prev => prev.filter(unit => unit.id !== id));
      
      // Also delete associated payments and maintenance requests
      setPayments(prev => prev.filter(payment => payment.unitId !== id));
      setMaintenanceRequests(prev => prev.filter(request => request.unitId !== id));
    }
  };

  const handleDeletePayment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      setPayments(prev => prev.filter(payment => payment.id !== id));
    }
  };

  const handleDeleteMaintenance = (id: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance request?')) {
      setMaintenanceRequests(prev => prev.filter(request => request.id !== id));
    }
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    }
  };

  // Edit handlers
  const handleEditTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
    setShowTenantModal(true);
  };

  const handleEditProperty = (property: Property) => {
    setCurrentProperty(property);
    setShowPropertyModal(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setCurrentUnit(unit);
    setShowUnitModal(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setCurrentPayment(payment);
    setShowPaymentModal(true);
  };

  const handleEditMaintenance = (maintenance: MaintenanceRequest) => {
    setCurrentMaintenance(maintenance);
    setShowMaintenanceModal(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setShowExpenseModal(true);
  };

  // Status update handlers
  const handleUpdateTenantStatus = (id: string, status: 'pending' | 'approved' | 'rejected') => {
    setTenants(prev => prev.map(tenant => 
      tenant.id === id ? {...tenant, status} : tenant
    ));
  };

  const handleUpdateMaintenanceStatus = (id: string, status: 'open' | 'in-progress' | 'completed' | 'cancelled') => {
    setMaintenanceRequests(prev => prev.map(request => {
      if (request.id === id) {
        const updatedRequest = {...request, status};
        if (status === 'completed' && !request.dateCompleted) {
          updatedRequest.dateCompleted = format(new Date(), 'yyyy-MM-dd');
        }
        return updatedRequest;
      }
      return request;
    }));
  };

  const handleUpdatePaymentStatus = (id: string, status: 'pending' | 'paid' | 'late' | 'partial') => {
    setPayments(prev => prev.map(payment => 
      payment.id === id ? {...payment, status} : payment
    ));
  };

  // Dashboard data calculations
  const totalRentCollected = payments
    .filter(payment => payment.status === 'paid' && payment.type === 'rent')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const pendingRent = payments
    .filter(payment => payment.status === 'pending' && payment.type === 'rent')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalExpenseAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const vacancyRate = units.length > 0 ? 
    (units.filter(unit => unit.status === 'vacant').length / units.length) * 100 : 0;
  
  const maintenanceByStatus = [
    { name: 'Open', value: maintenanceRequests.filter(req => req.status === 'open').length },
    { name: 'In Progress', value: maintenanceRequests.filter(req => req.status === 'in-progress').length },
    { name: 'Completed', value: maintenanceRequests.filter(req => req.status === 'completed').length },
    { name: 'Cancelled', value: maintenanceRequests.filter(req => req.status === 'cancelled').length },
  ];

  const expensesByCategory = [
    { name: 'Maintenance', value: expenses.filter(exp => exp.category === 'maintenance').reduce((sum, exp) => sum + exp.amount, 0) },
    { name: 'Utilities', value: expenses.filter(exp => exp.category === 'utilities').reduce((sum, exp) => sum + exp.amount, 0) },
    { name: 'Taxes', value: expenses.filter(exp => exp.category === 'taxes').reduce((sum, exp) => sum + exp.amount, 0) },
    { name: 'Insurance', value: expenses.filter(exp => exp.category === 'insurance').reduce((sum, exp) => sum + exp.amount, 0) },
    { name: 'Mortgage', value: expenses.filter(exp => exp.category === 'mortgage').reduce((sum, exp) => sum + exp.amount, 0) },
    { name: 'Other', value: expenses.filter(exp => exp.category === 'other').reduce((sum, exp) => sum + exp.amount, 0) },
  ];

  // Unit status data for pie chart
  const unitStatusData = [
    { name: 'Occupied', value: units.filter(unit => unit.status === 'occupied').length },
    { name: 'Vacant', value: units.filter(unit => unit.status === 'vacant').length },
    { name: 'Maintenance', value: units.filter(unit => unit.status === 'maintenance').length },
  ];

  // Monthly rent collection data for bar chart
  const currentYear = new Date().getFullYear();
  const monthlyRentData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const monthName = new Date(currentYear, index).toLocaleString('default', { month: 'short' });
    const paid = payments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        return payment.type === 'rent' && 
               payment.status === 'paid' && 
               paymentDate.getFullYear() === currentYear && 
               paymentDate.getMonth() === index;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const pending = payments
      .filter(payment => {
        const paymentDate = new Date(payment.date);
        return payment.type === 'rent' && 
               payment.status === 'pending' && 
               paymentDate.getFullYear() === currentYear && 
               paymentDate.getMonth() === index;
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    return { month: monthName, paid, pending };
  });

  // Monthly expense data for line chart
  const monthlyExpenseData = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const monthName = new Date(currentYear, index).toLocaleString('default', { month: 'short' });
    const amount = expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getFullYear() === currentYear && 
               expenseDate.getMonth() === index;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return { month: monthName, amount };
  });

  // Form setup
  const { register: registerTenant, handleSubmit: handleSubmitTenant, reset: resetTenantForm, formState: { errors: tenantErrors } } = useForm();
  const { register: registerProperty, handleSubmit: handleSubmitProperty, reset: resetPropertyForm, formState: { errors: propertyErrors } } = useForm();
  const { register: registerUnit, handleSubmit: handleSubmitUnit, reset: resetUnitForm, formState: { errors: unitErrors } } = useForm();
  const { register: registerPayment, handleSubmit: handleSubmitPayment, reset: resetPaymentForm, formState: { errors: paymentErrors } } = useForm();
  const { register: registerMaintenance, handleSubmit: handleSubmitMaintenance, reset: resetMaintenanceForm, formState: { errors: maintenanceErrors } } = useForm();
  const { register: registerExpense, handleSubmit: handleSubmitExpense, reset: resetExpenseForm, formState: { errors: expenseErrors } } = useForm();

  // Form reset on modal open
  useEffect(() => {
    if (showTenantModal) {
      resetTenantForm(currentTenant || {
        name: '',
        email: '',
        phone: '',
        creditScore: '',
        income: '',
        notes: '',
      });
    }
  }, [showTenantModal, currentTenant, resetTenantForm]);

  useEffect(() => {
    if (showPropertyModal) {
      resetPropertyForm(currentProperty || {
        name: '',
        address: '',
        units: '',
        type: 'apartment',
        purchaseDate: '',
        purchasePrice: '',
        currentValue: '',
        image: '',
      });
    }
  }, [showPropertyModal, currentProperty, resetPropertyForm]);

  useEffect(() => {
    if (showUnitModal) {
      resetUnitForm(currentUnit || {
        propertyId: currentProperty?.id || '',
        unitNumber: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        rent: '',
        status: 'vacant',
      });
    }
  }, [showUnitModal, currentUnit, currentProperty, resetUnitForm]);

  useEffect(() => {
    if (showPaymentModal) {
      resetPaymentForm(currentPayment || {
        tenantId: '',
        propertyId: '',
        unitId: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'rent',
        status: 'pending',
        notes: '',
      });
    }
  }, [showPaymentModal, currentPayment, resetPaymentForm]);

  useEffect(() => {
    if (showMaintenanceModal) {
      resetMaintenanceForm(currentMaintenance || {
        tenantId: '',
        propertyId: '',
        unitId: '',
        title: '',
        description: '',
        priority: 'medium',
        notes: '',
      });
    }
  }, [showMaintenanceModal, currentMaintenance, resetMaintenanceForm]);

  useEffect(() => {
    if (showExpenseModal) {
      resetExpenseForm(currentExpense || {
        propertyId: '',
        category: 'maintenance',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
      });
    }
  }, [showExpenseModal, currentExpense, resetExpenseForm]);

  // Find tenant name by ID
  const getTenantName = (id: string) => {
    const tenant = tenants.find(t => t.id === id);
    return tenant ? tenant.name : 'Unknown Tenant';
  };

  // Find property name by ID
  const getPropertyName = (id: string) => {
    const property = properties.find(p => p.id === id);
    return property ? property.name : 'Unknown Property';
  };

  // Find unit number by ID
  const getUnitNumber = (id: string) => {
    const unit = units.find(u => u.id === id);
    return unit ? unit.unitNumber : 'Unknown Unit';
  };

  // Find available units for property
  const getAvailableUnits = (propertyId: string) => {
    return units.filter(unit => unit.propertyId === propertyId);
  };

  // Find occupied units
  const getOccupiedUnits = () => {
    return units.filter(unit => unit.status === 'occupied');
  };

  // Calculate net income
  const calculateNetIncome = () => {
    return totalRentCollected - totalExpenseAmount;
  };

  // Generate the tenant application template
  const generateTenantTemplate = () => {
    const template = {
      personalInfo: {
        firstName: '[First Name]',
        lastName: '[Last Name]',
        email: '[Email]',
        phone: '[Phone]',
        dateOfBirth: '[YYYY-MM-DD]',
        ssn: '[SSN]',
        currentAddress: '[Street, City, State, ZIP]',
        moveInDate: '[YYYY-MM-DD]'
      },
      employment: {
        employer: '[Employer Name]',
        position: '[Position]',
        income: '[Monthly Income]',
        supervisorName: '[Supervisor Name]',
        supervisorPhone: '[Supervisor Phone]',
        startDate: '[YYYY-MM-DD]'
      },
      references: [
        {
          name: '[Reference Name]',
          relationship: '[Relationship]',
          phone: '[Phone]',
          email: '[Email]'
        }
      ],
      rentalHistory: [
        {
          address: '[Previous Address]',
          landlordName: '[Landlord Name]',
          landlordPhone: '[Landlord Phone]',
          monthlyRent: '[Monthly Rent]',
          startDate: '[YYYY-MM-DD]',
          endDate: '[YYYY-MM-DD]',
          reasonForLeaving: '[Reason]'
        }
      ],
      additionalInfo: {
        pets: '[Yes/No, Details]',
        smoker: '[Yes/No]',
        vehicles: '[Number of vehicles and details]',
        criminalHistory: '[Yes/No, Details]',
        evictionHistory: '[Yes/No, Details]',
        bankruptcyHistory: '[Yes/No, Details]'
      },
      authorization: {
        backgroundCheck: '[Yes/No]',
        creditCheck: '[Yes/No]',
        signature: '[Applicant Signature]',
        date: '[YYYY-MM-DD]'
      }
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tenant-application-template.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Download reports
  const downloadReport = (filename: string, data: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const generateIncomeReport = () => {
    const report = {
      reportDate: format(new Date(), 'yyyy-MM-dd'),
      totalIncome: totalRentCollected,
      pendingIncome: pendingRent,
      totalExpenses: totalExpenseAmount,
      netIncome: calculateNetIncome(),
      rentCollectionByMonth: monthlyRentData,
      expensesByCategory: expensesByCategory
    };
    downloadReport('income-report.json', report);
  };

  const generateOccupancyReport = () => {
    const report = {
      reportDate: format(new Date(), 'yyyy-MM-dd'),
      totalUnits: units.length,
      occupiedUnits: units.filter(unit => unit.status === 'occupied').length,
      vacantUnits: units.filter(unit => unit.status === 'vacant').length,
      maintenanceUnits: units.filter(unit => unit.status === 'maintenance').length,
      vacancyRate: vacancyRate,
      unitDetails: units.map(unit => ({
        property: getPropertyName(unit.propertyId),
        unitNumber: unit.unitNumber,
        status: unit.status,
        tenant: unit.tenantId ? getTenantName(unit.tenantId) : 'Vacant',
        rent: unit.rent
      }))
    };
    downloadReport('occupancy-report.json', report);
  };

  const generateMaintenanceReport = () => {
    const report = {
      reportDate: format(new Date(), 'yyyy-MM-dd'),
      totalRequests: maintenanceRequests.length,
      openRequests: maintenanceRequests.filter(req => req.status === 'open').length,
      inProgressRequests: maintenanceRequests.filter(req => req.status === 'in-progress').length,
      completedRequests: maintenanceRequests.filter(req => req.status === 'completed').length,
      cancelledRequests: maintenanceRequests.filter(req => req.status === 'cancelled').length,
      totalMaintenanceCosts: maintenanceRequests
        .filter(req => req.cost !== undefined)
        .reduce((sum, req) => sum + (req.cost || 0), 0),
      requestDetails: maintenanceRequests.map(req => ({
        title: req.title,
        property: getPropertyName(req.propertyId),
        unit: getUnitNumber(req.unitId),
        tenant: req.tenantId ? getTenantName(req.tenantId) : 'N/A',
        priority: req.priority,
        status: req.status,
        dateSubmitted: req.dateSubmitted,
        dateCompleted: req.dateCompleted || 'N/A',
        cost: req.cost || 'N/A'
      }))
    };
    downloadReport('maintenance-report.json', report);
  };

  // Color maps for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];
  const STATUS_COLORS = {
    'open': '#FF8042',
    'in-progress': '#FFBB28',
    'completed': '#00C49F',
    'cancelled': '#A569BD',
    'occupied': '#00C49F',
    'vacant': '#FF8042',
    'maintenance': '#FFBB28',
    'pending': '#FFBB28',
    'paid': '#00C49F',
    'late': '#FF8042',
    'partial': '#5DADE2',
    'approved': '#00C49F',
    'rejected': '#FF8042'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition sticky top-0 z-10">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-2">
              <Home className="text-primary-500" size={24} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Property Manager Pro</h1>
            </div>
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
              {isDarkMode ? <Sun className="ml-6 text-yellow-400" size={16} /> : <Moon className="mr-6 text-slate-600" size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-fluid py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 md:flex-shrink-0 theme-transition">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 theme-transition">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-left ${activeTab === tab.id ? 'bg-primary-50 text-primary-600 dark:bg-slate-700 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-700'}`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="stat-title">Rent Collected</div>
                  <div className="stat-value text-primary-500">${totalRentCollected.toLocaleString()}</div>
                  <div className="stat-desc flex items-center gap-1">
                    <DollarSign size={14} /> Pending: ${pendingRent.toLocaleString()}
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Total Expenses</div>
                  <div className="stat-value text-red-500">${totalExpenseAmount.toLocaleString()}</div>
                  <div className="stat-desc">Across all properties</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Net Income</div>
                  <div className={`stat-value ${calculateNetIncome() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ${calculateNetIncome().toLocaleString()}
                  </div>
                  <div className="stat-desc">After expenses</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Vacancy Rate</div>
                  <div className="stat-value text-amber-500">{vacancyRate.toFixed(1)}%</div>
                  <div className="stat-desc">{units.filter(unit => unit.status === 'vacant').length} vacant units</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rent Collection Chart */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Monthly Rent Collection</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyRentData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="paid" name="Paid" fill="#00C49F" />
                        <Bar dataKey="pending" name="Pending" fill="#FFBB28" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Expense Trend Chart */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Monthly Expenses</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyExpenseData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="amount" name="Expenses" stroke="#FF8042" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Unit Status Chart */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unit Status</h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={unitStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {unitStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Object.values(STATUS_COLORS)[index % Object.values(STATUS_COLORS).length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Expense Categories Chart */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Expense Breakdown</h3>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={expensesByCategory.filter(cat => cat.value > 0)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, value, percent }) => 
                            `${name}: $${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Recent Activity</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Combine recent payments and maintenance requests */}
                      {[...payments, ...maintenanceRequests]
                        .sort((a, b) => new Date(b.date || b.dateSubmitted).getTime() - new Date(a.date || a.dateSubmitted).getTime())
                        .slice(0, 5)
                        .map((item, index) => {
                          // Check if it's a payment or maintenance request
                          const isPayment = 'type' in item;
                          const date = isPayment ? item.date : (item as MaintenanceRequest).dateSubmitted;
                          const type = isPayment ? 'Payment' : 'Maintenance';
                          const description = isPayment 
                            ? `${getTenantName((item as Payment).tenantId)} - ${(item as Payment).type === 'rent' ? 'Rent' : 'Other'}`
                            : (item as MaintenanceRequest).title;
                          const status = item.status;
                          
                          return (
                            <tr key={`${type}-${index}`} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                {format(new Date(date), 'MMM dd, yyyy')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                {type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                                {description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] === '#00C49F' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                  STATUS_COLORS[status] === '#FFBB28' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                  STATUS_COLORS[status] === '#FF8042' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tenants Tab */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex-between flex-col sm:flex-row gap-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tenants</h2>
                  <button className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600 flex items-center gap-1" onClick={() => { setCurrentTenant(null); setShowTenantModal(true); }}>
                    <Plus size={16} />
                    <span>Add Tenant</span>
                  </button>
                  <button className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-1" onClick={generateTenantTemplate}>
                    <Download size={16} />
                    <span>Template</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <input
                      type="text"
                      placeholder="Search tenants..."
                      className="input input-sm pl-9 w-full"
                      value={tenantFilter}
                      onChange={(e) => setTenantFilter(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <select 
                    className="input input-sm" 
                    value={tenantStatusFilter} 
                    onChange={(e) => setTenantStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credit Score</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTenants.length > 0 ? (
                        filteredTenants.map((tenant) => (
                          <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  <User size={20} className="text-gray-500 dark:text-gray-400" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{tenant.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Applied: {format(new Date(tenant.applicationDate), 'MMM d, yyyy')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{tenant.email}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{tenant.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{tenant.creditScore}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">Income: ${tenant.income.toLocaleString()}/yr</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span 
                                className={`${STATUS_COLORS[tenant.status] === '#00C49F' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                  STATUS_COLORS[tenant.status] === '#FFBB28' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'} 
                                  px-2.5 py-0.5 rounded-full text-xs font-medium`}
                              >
                                {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                              </span>
                              {tenant.status === 'pending' && (
                                <div className="mt-1 flex space-x-1">
                                  <button 
                                    className="inline-flex items-center p-1 text-xs text-white bg-green-500 rounded hover:bg-green-600" 
                                    title="Approve Tenant"
                                    onClick={() => handleUpdateTenantStatus(tenant.id, 'approved')}
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button 
                                    className="inline-flex items-center p-1 text-xs text-white bg-red-500 rounded hover:bg-red-600" 
                                    title="Reject Tenant"
                                    onClick={() => handleUpdateTenantStatus(tenant.id, 'rejected')}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {tenant.property ? (
                                <div>
                                  <div className="text-sm text-gray-900 dark:text-white">{getPropertyName(tenant.property)}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Unit: {tenant.unit ? getUnitNumber(tenant.unit) : 'N/A'}</div>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">Not assigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  onClick={() => handleEditTenant(tenant)}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteTenant(tenant.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No tenants found. {tenantFilter && 'Try adjusting your search.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Properties Tab */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              <div className="flex-between flex-col sm:flex-row gap-4">
                <div className="flex gap-2 items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Properties</h2>
                  <button className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600 flex items-center gap-1" onClick={() => { setCurrentProperty(null); setShowPropertyModal(true); }}>
                    <Plus size={16} />
                    <span>Add Property</span>
                  </button>
                </div>
                <div className="relative flex-grow sm:flex-grow-0">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    className="input input-sm pl-9 w-full"
                    value={propertyFilter}
                    onChange={(e) => setPropertyFilter(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => {
                    const propertyUnits = units.filter(unit => unit.propertyId === property.id);
                    const occupiedUnits = propertyUnits.filter(unit => unit.status === 'occupied').length;
                    const vacantUnits = propertyUnits.filter(unit => unit.status === 'vacant').length;
                    const maintenanceUnits = propertyUnits.filter(unit => unit.status === 'maintenance').length;
                    
                    return (
                      <div key={property.id} className="card overflow-hidden">
                        <div className="relative h-40 mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                          {property.image ? (
                            <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                              <Home size={48} />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                            <h3 className="text-lg font-medium text-white">{property.name}</h3>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400">{property.address}</p>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Type:</span>
                            <span className="text-gray-900 dark:text-white capitalize">{property.type}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Purchase:</span>
                            <span className="text-gray-900 dark:text-white">
                              ${property.purchasePrice.toLocaleString()} • {format(new Date(property.purchaseDate), 'MMM yyyy')}
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Current Value:</span>
                            <span className="text-gray-900 dark:text-white">${property.currentValue.toLocaleString()}</span>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500 dark:text-gray-400">Units ({propertyUnits.length}):</span>
                              <button 
                                className="text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
                                onClick={() => { setCurrentProperty(property); setCurrentUnit(null); setShowUnitModal(true); }}
                              >
                                <Plus size={14} />
                                <span>Add Unit</span>
                              </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div className="p-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                                <span className="block font-medium">{occupiedUnits}</span>
                                <span>Occupied</span>
                              </div>
                              <div className="p-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                                <span className="block font-medium">{vacantUnits}</span>
                                <span>Vacant</span>
                              </div>
                              <div className="p-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                                <span className="block font-medium">{maintenanceUnits}</span>
                                <span>Repair</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              className="btn btn-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                              onClick={() => handleEditProperty(property)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                              onClick={() => handleDeleteProperty(property.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                      <Home size={48} className="mb-2" />
                      <p>No properties found. {propertyFilter && 'Try adjusting your search.'}</p>
                      <button 
                        className="mt-4 btn btn-sm bg-primary-500 text-white hover:bg-primary-600"
                        onClick={() => { setCurrentProperty(null); setShowPropertyModal(true); }}
                      >
                        Add Your First Property
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Units Section */}
              {filteredProperties.length > 0 && (
                <div className="mt-8">
                  <div className="flex-between flex-col sm:flex-row gap-4 mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Units</h3>
                    <select 
                      className="input input-sm" 
                      value={unitStatusFilter} 
                      onChange={(e) => setUnitStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="occupied">Occupied</option>
                      <option value="vacant">Vacant</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Property</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tenant</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredUnits.length > 0 ? (
                            filteredUnits.map((unit) => {
                              const property = properties.find(p => p.id === unit.propertyId);
                              const tenant = unit.tenantId ? tenants.find(t => t.id === unit.tenantId) : null;
                              
                              return (
                                <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{property?.name || 'Unknown Property'}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{unit.unitNumber}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">
                                      {unit.bedrooms} bed • {unit.bathrooms} bath • {unit.sqft} sqft
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">${unit.rent.toLocaleString()}/mo</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span 
                                      className={`${unit.status === 'occupied' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                        unit.status === 'vacant' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'} 
                                        px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                    >
                                      {unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {tenant ? (
                                      <div className="text-sm text-gray-900 dark:text-white">{tenant.name}</div>
                                    ) : (
                                      <span className="text-sm text-gray-500 dark:text-gray-400">No tenant</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        onClick={() => handleEditUnit(unit)}
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        onClick={() => handleDeleteUnit(unit.id)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                No units found with the selected filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex-between flex-col sm:flex-row gap-4">
                <div className="flex gap-2 items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payments</h2>
                  <button className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600 flex items-center gap-1" onClick={() => { setCurrentPayment(null); setShowPaymentModal(true); }}>
                    <Plus size={16} />
                    <span>Add Payment</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <input
                      type="text"
                      placeholder="Search tenant..."
                      className="input input-sm pl-9 w-full"
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <select 
                    className="input input-sm" 
                    value={paymentStatusFilter} 
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="late">Late</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tenant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Property/Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPayments.length > 0 ? (
                        filteredPayments.map((payment) => {
                          const tenant = tenants.find(t => t.id === payment.tenantId);
                          return (
                            <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{format(new Date(payment.date), 'MMM d, yyyy')}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{tenant?.name || 'Unknown Tenant'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{getPropertyName(payment.propertyId)}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Unit: {getUnitNumber(payment.unitId)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">${payment.amount.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white capitalize">{payment.type}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span 
                                  className={`${payment.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                    payment.status === 'late' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'} 
                                    px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                >
                                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                </span>
                                
                                {payment.status !== 'paid' && (
                                  <div className="mt-1 flex space-x-1">
                                    <button 
                                      className="inline-flex items-center p-1 text-xs text-white bg-green-500 rounded hover:bg-green-600" 
                                      title="Mark as Paid"
                                      onClick={() => handleUpdatePaymentStatus(payment.id, 'paid')}
                                    >
                                      <Check size={12} />
                                    </button>
                                    {payment.status !== 'late' && (
                                      <button 
                                        className="inline-flex items-center p-1 text-xs text-white bg-red-500 rounded hover:bg-red-600" 
                                        title="Mark as Late"
                                        onClick={() => handleUpdatePaymentStatus(payment.id, 'late')}
                                      >
                                        <X size={12} />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    onClick={() => handleEditPayment(payment)}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() => handleDeletePayment(payment.id)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No payments found. {paymentFilter && 'Try adjusting your search.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex-between flex-col sm:flex-row gap-4">
                <div className="flex gap-2 items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maintenance Requests</h2>
                  <button className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600 flex items-center gap-1" onClick={() => { setCurrentMaintenance(null); setShowMaintenanceModal(true); }}>
                    <Plus size={16} />
                    <span>Add Request</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <input
                      type="text"
                      placeholder="Search requests..."
                      className="input input-sm pl-9 w-full"
                      value={maintenanceFilter}
                      onChange={(e) => setMaintenanceFilter(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <select 
                    className="input input-sm" 
                    value={maintenanceStatusFilter} 
                    onChange={(e) => setMaintenanceStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Request</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Property/Unit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tenant</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assigned To</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredMaintenance.length > 0 ? (
                        filteredMaintenance.map((request) => {
                          const tenant = request.tenantId ? tenants.find(t => t.id === request.tenantId) : null;
                          return (
                            <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{request.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Submitted: {format(new Date(request.dateSubmitted), 'MMM d, yyyy')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{getPropertyName(request.propertyId)}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Unit: {getUnitNumber(request.unitId)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{tenant?.name || 'No tenant'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span 
                                  className={`${request.priority === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                    request.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' : 
                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'} 
                                    px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                >
                                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span 
                                  className={`${request.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                    request.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                    request.status === 'open' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'} 
                                    px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                >
                                  {request.status === 'in-progress' ? 'In Progress' : 
                                    request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                                
                                {request.status !== 'completed' && request.status !== 'cancelled' && (
                                  <div className="mt-1 flex space-x-1">
                                    {request.status === 'open' && (
                                      <button 
                                        className="inline-flex items-center p-1 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600" 
                                        title="Mark as In Progress"
                                        onClick={() => handleUpdateMaintenanceStatus(request.id, 'in-progress')}
                                      >
                                        <ArrowUpDown size={12} />
                                      </button>
                                    )}
                                    <button 
                                      className="inline-flex items-center p-1 text-xs text-white bg-green-500 rounded hover:bg-green-600" 
                                      title="Mark as Completed"
                                      onClick={() => handleUpdateMaintenanceStatus(request.id, 'completed')}
                                    >
                                      <Check size={12} />
                                    </button>
                                    <button 
                                      className="inline-flex items-center p-1 text-xs text-white bg-gray-500 rounded hover:bg-gray-600" 
                                      title="Cancel Request"
                                      onClick={() => handleUpdateMaintenanceStatus(request.id, 'cancelled')}
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{request.assignedTo || 'Not assigned'}</div>
                                {request.cost !== undefined && request.cost > 0 && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Cost: ${request.cost.toLocaleString()}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    onClick={() => handleEditMaintenance(request)}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() => handleDeleteMaintenance(request.id)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No maintenance requests found. {maintenanceFilter && 'Try adjusting your search.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex-between flex-col sm:flex-row gap-4">
                <div className="flex gap-2 items-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expenses</h2>
                  <button className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600 flex items-center gap-1" onClick={() => { setCurrentExpense(null); setShowExpenseModal(true); }}>
                    <Plus size={16} />
                    <span>Add Expense</span>
                  </button>
                </div>
                <div className="relative flex-grow sm:flex-grow-0">
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    className="input input-sm pl-9 w-full"
                    value={expenseFilter}
                    onChange={(e) => setExpenseFilter(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((expense) => {
                          return (
                            <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{format(new Date(expense.date), 'MMM d, yyyy')}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{getPropertyName(expense.propertyId)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span 
                                  className={`${expense.category === 'maintenance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                                    expense.category === 'utilities' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                    expense.category === 'taxes' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                    expense.category === 'insurance' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' : 
                                    expense.category === 'mortgage' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'} 
                                    px-2.5 py-0.5 rounded-full text-xs font-medium`}
                                >
                                  {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{expense.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">${expense.amount.toLocaleString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    onClick={() => handleEditExpense(expense)}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                    onClick={() => handleDeleteExpense(expense.id)}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            No expenses found. {expenseFilter && 'Try adjusting your search.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Income Report</h3>
                    <button 
                      className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600 flex items-center gap-1"
                      onClick={generateIncomeReport}
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">A detailed report of all income, expenses, and net profit across all properties.</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Income:</span>
                      <span className="text-gray-900 dark:text-white font-medium">${totalRentCollected.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Expenses:</span>
                      <span className="text-gray-900 dark:text-white font-medium">${totalExpenseAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Net Income:</span>
                      <span className={`font-medium ${calculateNetIncome() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        ${calculateNetIncome().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Occupancy Report</h3>
                    <button 
                      className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600 flex items-center gap-1"
                      onClick={generateOccupancyReport}
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy rates, vacancy details, and current tenant information for all properties.</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Units:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{units.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Occupied Units:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{units.filter(unit => unit.status === 'occupied').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Vacancy Rate:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{vacancyRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Maintenance Report</h3>
                    <button 
                      className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600 flex items-center gap-1"
                      onClick={generateMaintenanceReport}
                    >
                      <Download size={16} />
                      <span>Download</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Summary of all maintenance requests, costs, and resolution times.</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Open Requests:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{maintenanceRequests.filter(req => req.status === 'open').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">In Progress:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{maintenanceRequests.filter(req => req.status === 'in-progress').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{maintenanceRequests.filter(req => req.status === 'completed').length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">Property Performance</h2>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Income</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expenses</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Net</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Occupancy</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {properties.map((property) => {
                        const propertyUnits = units.filter(unit => unit.propertyId === property.id);
                        const occupiedUnits = propertyUnits.filter(unit => unit.status === 'occupied').length;
                        const occupancyRate = propertyUnits.length > 0 ? (occupiedUnits / propertyUnits.length) * 100 : 0;
                        
                        const propertyIncome = payments
                          .filter(payment => payment.propertyId === property.id && payment.status === 'paid')
                          .reduce((sum, payment) => sum + payment.amount, 0);
                        
                        const propertyExpenses = expenses
                          .filter(expense => expense.propertyId === property.id)
                          .reduce((sum, expense) => sum + expense.amount, 0);
                        
                        const propertyNet = propertyIncome - propertyExpenses;
                        
                        // Calculate annualized ROI
                        const roi = property.purchasePrice > 0 ? 
                          (propertyNet / property.purchasePrice) * 100 : 0;
                        
                        return (
                          <tr key={property.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{property.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{propertyUnits.length} units</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">${propertyIncome.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">${propertyExpenses.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${propertyNet >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                ${propertyNet.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div 
                                  className="bg-primary-500 h-2.5 rounded-full" 
                                  style={{ width: `${occupancyRate}%` }}
                                ></div>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {occupancyRate.toFixed(0)}% ({occupiedUnits}/{propertyUnits.length} units)
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {roi.toFixed(2)}%
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
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 py-4 theme-transition mt-auto">
        <div className="container-fluid">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>

      {/* Add/Edit Tenant Modal */}
      {showTenantModal && (
        <div className="modal-backdrop" onClick={() => setShowTenantModal(false)}>
          <div ref={tenantModalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentTenant ? 'Edit Tenant' : 'Add New Tenant'}
              </h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowTenantModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitTenant(handleAddTenant)}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label htmlFor="tenant-name" className="form-label">Name</label>
                  <input
                    id="tenant-name"
                    type="text"
                    className="input"
                    {...registerTenant('name', { required: 'Name is required' })}
                  />
                  {tenantErrors.name && <p className="form-error">{tenantErrors.name.message as string}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="tenant-email" className="form-label">Email</label>
                  <input
                    id="tenant-email"
                    type="email"
                    className="input"
                    {...registerTenant('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      } 
                    })}
                  />
                  {tenantErrors.email && <p className="form-error">{tenantErrors.email.message as string}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="tenant-phone" className="form-label">Phone</label>
                  <input
                    id="tenant-phone"
                    type="text"
                    className="input"
                    {...registerTenant('phone', { required: 'Phone is required' })}
                  />
                  {tenantErrors.phone && <p className="form-error">{tenantErrors.phone.message as string}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="tenant-credit-score" className="form-label">Credit Score</label>
                    <input
                      id="tenant-credit-score"
                      type="number"
                      className="input"
                      {...registerTenant('creditScore', { 
                        required: 'Credit score is required',
                        min: {
                          value: 300,
                          message: 'Minimum credit score is 300'
                        },
                        max: {
                          value: 850,
                          message: 'Maximum credit score is 850'
                        }
                      })}
                    />
                    {tenantErrors.creditScore && <p className="form-error">{tenantErrors.creditScore.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tenant-income" className="form-label">Annual Income</label>
                    <input
                      id="tenant-income"
                      type="number"
                      className="input"
                      {...registerTenant('income', { required: 'Income is required' })}
                    />
                    {tenantErrors.income && <p className="form-error">{tenantErrors.income.message as string}</p>}
                  </div>
                </div>
                
                {currentTenant?.status === 'approved' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="tenant-lease-start" className="form-label">Lease Start Date</label>
                        <input
                          id="tenant-lease-start"
                          type="date"
                          className="input"
                          {...registerTenant('leaseStart')}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tenant-lease-end" className="form-label">Lease End Date</label>
                        <input
                          id="tenant-lease-end"
                          type="date"
                          className="input"
                          {...registerTenant('leaseEnd')}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="tenant-property" className="form-label">Property</label>
                        <select
                          id="tenant-property"
                          className="input"
                          {...registerTenant('property')}
                        >
                          <option value="">Select Property</option>
                          {properties.map(property => (
                            <option key={property.id} value={property.id}>{property.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tenant-unit" className="form-label">Unit</label>
                        <select
                          id="tenant-unit"
                          className="input"
                          {...registerTenant('unit')}
                        >
                          <option value="">Select Unit</option>
                          {currentTenant?.property && getAvailableUnits(currentTenant.property).map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.unitNumber}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label htmlFor="tenant-rent" className="form-label">Monthly Rent</label>
                        <input
                          id="tenant-rent"
                          type="number"
                          className="input"
                          {...registerTenant('rent')}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="tenant-deposit" className="form-label">Security Deposit</label>
                        <input
                          id="tenant-deposit"
                          type="number"
                          className="input"
                          {...registerTenant('securityDeposit')}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label htmlFor="tenant-notes" className="form-label">Notes</label>
                  <textarea
                    id="tenant-notes"
                    className="input"
                    rows={3}
                    {...registerTenant('notes')}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" onClick={() => setShowTenantModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentTenant ? 'Update Tenant' : 'Add Tenant'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Property Modal */}
      {showPropertyModal && (
        <div className="modal-backdrop" onClick={() => setShowPropertyModal(false)}>
          <div ref={propertyModalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentProperty ? 'Edit Property' : 'Add New Property'}
              </h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowPropertyModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitProperty(handleAddProperty)}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label htmlFor="property-name" className="form-label">Property Name</label>
                  <input
                    id="property-name"
                    type="text"
                    className="input"
                    {...registerProperty('name', { required: 'Property name is required' })}
                  />
                  {propertyErrors.name && <p className="form-error">{propertyErrors.name.message as string}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="property-address" className="form-label">Address</label>
                  <input
                    id="property-address"
                    type="text"
                    className="input"
                    {...registerProperty('address', { required: 'Address is required' })}
                  />
                  {propertyErrors.address && <p className="form-error">{propertyErrors.address.message as string}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="property-type" className="form-label">Property Type</label>
                    <select
                      id="property-type"
                      className="input"
                      {...registerProperty('type', { required: 'Property type is required' })}
                    >
                      <option value="apartment">Apartment</option>
                      <option value="house">House</option>
                      <option value="condo">Condo</option>
                      <option value="commercial">Commercial</option>
                    </select>
                    {propertyErrors.type && <p className="form-error">{propertyErrors.type.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="property-units" className="form-label">Total Units</label>
                    <input
                      id="property-units"
                      type="number"
                      className="input"
                      {...registerProperty('units', { 
                        required: 'Number of units is required',
                        min: {
                          value: 1,
                          message: 'Minimum 1 unit required'
                        } 
                      })}
                    />
                    {propertyErrors.units && <p className="form-error">{propertyErrors.units.message as string}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="property-purchase-date" className="form-label">Purchase Date</label>
                    <input
                      id="property-purchase-date"
                      type="date"
                      className="input"
                      {...registerProperty('purchaseDate', { required: 'Purchase date is required' })}
                    />
                    {propertyErrors.purchaseDate && <p className="form-error">{propertyErrors.purchaseDate.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="property-purchase-price" className="form-label">Purchase Price</label>
                    <input
                      id="property-purchase-price"
                      type="number"
                      className="input"
                      {...registerProperty('purchasePrice', { required: 'Purchase price is required' })}
                    />
                    {propertyErrors.purchasePrice && <p className="form-error">{propertyErrors.purchasePrice.message as string}</p>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="property-current-value" className="form-label">Current Value</label>
                  <input
                    id="property-current-value"
                    type="number"
                    className="input"
                    {...registerProperty('currentValue', { required: 'Current value is required' })}
                  />
                  {propertyErrors.currentValue && <p className="form-error">{propertyErrors.currentValue.message as string}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="property-image" className="form-label">Image URL</label>
                  <input
                    id="property-image"
                    type="text"
                    className="input"
                    placeholder="https://example.com/image.jpg"
                    {...registerProperty('image')}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" onClick={() => setShowPropertyModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentProperty ? 'Update Property' : 'Add Property'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Unit Modal */}
      {showUnitModal && (
        <div className="modal-backdrop" onClick={() => setShowUnitModal(false)}>
          <div ref={unitModalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentUnit ? 'Edit Unit' : `Add New Unit${currentProperty ? ' to ' + currentProperty.name : ''}`}
              </h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowUnitModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitUnit(handleAddUnit)}>
              <div className="mt-4 space-y-4">
                {!currentProperty && (
                  <div className="form-group">
                    <label htmlFor="unit-property" className="form-label">Property</label>
                    <select
                      id="unit-property"
                      className="input"
                      {...registerUnit('propertyId', { required: 'Property is required' })}
                    >
                      <option value="">Select Property</option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>{property.name}</option>
                      ))}
                    </select>
                    {unitErrors.propertyId && <p className="form-error">{unitErrors.propertyId.message as string}</p>}
                  </div>
                )}
                
                {currentProperty && (
                  <input type="hidden" {...registerUnit('propertyId')} value={currentProperty.id} />
                )}
                
                <div className="form-group">
                  <label htmlFor="unit-number" className="form-label">Unit Number</label>
                  <input
                    id="unit-number"
                    type="text"
                    className="input"
                    {...registerUnit('unitNumber', { required: 'Unit number is required' })}
                  />
                  {unitErrors.unitNumber && <p className="form-error">{unitErrors.unitNumber.message as string}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label htmlFor="unit-bedrooms" className="form-label">Bedrooms</label>
                    <input
                      id="unit-bedrooms"
                      type="number"
                      className="input"
                      {...registerUnit('bedrooms', { required: 'Bedrooms is required' })}
                    />
                    {unitErrors.bedrooms && <p className="form-error">{unitErrors.bedrooms.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="unit-bathrooms" className="form-label">Bathrooms</label>
                    <input
                      id="unit-bathrooms"
                      type="number"
                      step="0.5"
                      className="input"
                      {...registerUnit('bathrooms', { required: 'Bathrooms is required' })}
                    />
                    {unitErrors.bathrooms && <p className="form-error">{unitErrors.bathrooms.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="unit-sqft" className="form-label">Square Feet</label>
                    <input
                      id="unit-sqft"
                      type="number"
                      className="input"
                      {...registerUnit('sqft', { required: 'Square footage is required' })}
                    />
                    {unitErrors.sqft && <p className="form-error">{unitErrors.sqft.message as string}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="unit-rent" className="form-label">Monthly Rent</label>
                    <input
                      id="unit-rent"
                      type="number"
                      className="input"
                      {...registerUnit('rent', { required: 'Rent amount is required' })}
                    />
                    {unitErrors.rent && <p className="form-error">{unitErrors.rent.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="unit-status" className="form-label">Status</label>
                    <select
                      id="unit-status"
                      className="input"
                      {...registerUnit('status', { required: 'Status is required' })}
                    >
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    {unitErrors.status && <p className="form-error">{unitErrors.status.message as string}</p>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="unit-tenant" className="form-label">Tenant (if occupied)</label>
                  <select
                    id="unit-tenant"
                    className="input"
                    {...registerUnit('tenantId')}
                  >
                    <option value="">Select Tenant</option>
                    {tenants
                      .filter(tenant => tenant.status === 'approved')
                      .map(tenant => (
                        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" onClick={() => setShowUnitModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentUnit ? 'Update Unit' : 'Add Unit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Payment Modal */}
      {showPaymentModal && (
        <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div ref={paymentModalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentPayment ? 'Edit Payment' : 'Add New Payment'}
              </h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitPayment(handleAddPayment)}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label htmlFor="payment-tenant" className="form-label">Tenant</label>
                  <select
                    id="payment-tenant"
                    className="input"
                    {...registerPayment('tenantId', { required: 'Tenant is required' })}
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </select>
                  {paymentErrors.tenantId && <p className="form-error">{paymentErrors.tenantId.message as string}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="payment-property" className="form-label">Property</label>
                    <select
                      id="payment-property"
                      className="input"
                      {...registerPayment('propertyId', { required: 'Property is required' })}
                    >
                      <option value="">Select Property</option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>{property.name}</option>
                      ))}
                    </select>
                    {paymentErrors.propertyId && <p className="form-error">{paymentErrors.propertyId.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="payment-unit" className="form-label">Unit</label>
                    <select
                      id="payment-unit"
                      className="input"
                      {...registerPayment('unitId', { required: 'Unit is required' })}
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>{getPropertyName(unit.propertyId)} - Unit {unit.unitNumber}</option>
                      ))}
                    </select>
                    {paymentErrors.unitId && <p className="form-error">{paymentErrors.unitId.message as string}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="payment-amount" className="form-label">Amount</label>
                    <input
                      id="payment-amount"
                      type="number"
                      className="input"
                      {...registerPayment('amount', { required: 'Amount is required' })}
                    />
                    {paymentErrors.amount && <p className="form-error">{paymentErrors.amount.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="payment-date" className="form-label">Date</label>
                    <input
                      id="payment-date"
                      type="date"
                      className="input"
                      {...registerPayment('date', { required: 'Date is required' })}
                    />
                    {paymentErrors.date && <p className="form-error">{paymentErrors.date.message as string}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="payment-type" className="form-label">Payment Type</label>
                    <select
                      id="payment-type"
                      className="input"
                      {...registerPayment('type', { required: 'Payment type is required' })}
                    >
                      <option value="rent">Rent</option>
                      <option value="deposit">Security Deposit</option>
                      <option value="fee">Fee</option>
                      <option value="other">Other</option>
                    </select>
                    {paymentErrors.type && <p className="form-error">{paymentErrors.type.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="payment-status" className="form-label">Status</label>
                    <select
                      id="payment-status"
                      className="input"
                      {...registerPayment('status', { required: 'Status is required' })}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="late">Late</option>
                      <option value="partial">Partial</option>
                    </select>
                    {paymentErrors.status && <p className="form-error">{paymentErrors.status.message as string}</p>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="payment-notes" className="form-label">Notes</label>
                  <textarea
                    id="payment-notes"
                    className="input"
                    rows={3}
                    {...registerPayment('notes')}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentPayment ? 'Update Payment' : 'Add Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="modal-backdrop" onClick={() => setShowMaintenanceModal(false)}>
          <div ref={maintenanceModalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentMaintenance ? 'Edit Maintenance Request' : 'Add New Maintenance Request'}
              </h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowMaintenanceModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitMaintenance(handleAddMaintenance)}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label htmlFor="maintenance-title" className="form-label">Title</label>
                  <input
                    id="maintenance-title"
                    type="text"
                    className="input"
                    {...registerMaintenance('title', { required: 'Title is required' })}
                  />
                  {maintenanceErrors.title && <p className="form-error">{maintenanceErrors.title.message as string}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="maintenance-description" className="form-label">Description</label>
                  <textarea
                    id="maintenance-description"
                    className="input"
                    rows={3}
                    {...registerMaintenance('description', { required: 'Description is required' })}
                  ></textarea>
                  {maintenanceErrors.description && <p className="form-error">{maintenanceErrors.description.message as string}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="maintenance-property" className="form-label">Property</label>
                    <select
                      id="maintenance-property"
                      className="input"
                      {...registerMaintenance('propertyId', { required: 'Property is required' })}
                    >
                      <option value="">Select Property</option>
                      {properties.map(property => (
                        <option key={property.id} value={property.id}>{property.name}</option>
                      ))}
                    </select>
                    {maintenanceErrors.propertyId && <p className="form-error">{maintenanceErrors.propertyId.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="maintenance-unit" className="form-label">Unit</label>
                    <select
                      id="maintenance-unit"
                      className="input"
                      {...registerMaintenance('unitId', { required: 'Unit is required' })}
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>{getPropertyName(unit.propertyId)} - Unit {unit.unitNumber}</option>
                      ))}
                    </select>
                    {maintenanceErrors.unitId && <p className="form-error">{maintenanceErrors.unitId.message as string}</p>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="maintenance-tenant" className="form-label">Tenant (if applicable)</label>
                  <select
                    id="maintenance-tenant"
                    className="input"
                    {...registerMaintenance('tenantId')}
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="maintenance-priority" className="form-label">Priority</label>
                    <select
                      id="maintenance-priority"
                      className="input"
                      {...registerMaintenance('priority', { required: 'Priority is required' })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                    {maintenanceErrors.priority && <p className="form-error">{maintenanceErrors.priority.message as string}</p>}
                  </div>
                  
                  {currentMaintenance && (
                    <div className="form-group">
                      <label htmlFor="maintenance-status" className="form-label">Status</label>
                      <select
                        id="maintenance-status"
                        className="input"
                        {...registerMaintenance('status', { required: 'Status is required' })}
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {maintenanceErrors.status && <p className="form-error">{maintenanceErrors.status.message as string}</p>}
                    </div>
                  )}
                </div>
                
                {currentMaintenance && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="maintenance-assigned" className="form-label">Assigned To</label>
                      <input
                        id="maintenance-assigned"
                        type="text"
                        className="input"
                        {...registerMaintenance('assignedTo')}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="maintenance-cost" className="form-label">Cost</label>
                      <input
                        id="maintenance-cost"
                        type="number"
                        className="input"
                        {...registerMaintenance('cost')}
                      />
                    </div>
                    
                    {currentMaintenance.status === 'completed' && (
                      <div className="form-group">
                        <label htmlFor="maintenance-completed" className="form-label">Date Completed</label>
                        <input
                          id="maintenance-completed"
                          type="date"
                          className="input"
                          {...registerMaintenance('dateCompleted')}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="maintenance-notes" className="form-label">Notes</label>
                  <textarea
                    id="maintenance-notes"
                    className="input"
                    rows={3}
                    {...registerMaintenance('notes')}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" onClick={() => setShowMaintenanceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentMaintenance ? 'Update Request' : 'Add Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      {showExpenseModal && (
        <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}>
          <div ref={expenseModalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {currentExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button className="text-gray-400 hover:text-gray-500" onClick={() => setShowExpenseModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitExpense(handleAddExpense)}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label htmlFor="expense-property" className="form-label">Property</label>
                  <select
                    id="expense-property"
                    className="input"
                    {...registerExpense('propertyId', { required: 'Property is required' })}
                  >
                    <option value="">Select Property</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                  {expenseErrors.propertyId && <p className="form-error">{expenseErrors.propertyId.message as string}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="expense-category" className="form-label">Category</label>
                  <select
                    id="expense-category"
                    className="input"
                    {...registerExpense('category', { required: 'Category is required' })}
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="utilities">Utilities</option>
                    <option value="taxes">Taxes</option>
                    <option value="insurance">Insurance</option>
                    <option value="mortgage">Mortgage</option>
                    <option value="other">Other</option>
                  </select>
                  {expenseErrors.category && <p className="form-error">{expenseErrors.category.message as string}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="expense-amount" className="form-label">Amount</label>
                    <input
                      id="expense-amount"
                      type="number"
                      className="input"
                      {...registerExpense('amount', { required: 'Amount is required' })}
                    />
                    {expenseErrors.amount && <p className="form-error">{expenseErrors.amount.message as string}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="expense-date" className="form-label">Date</label>
                    <input
                      id="expense-date"
                      type="date"
                      className="input"
                      {...registerExpense('date', { required: 'Date is required' })}
                    />
                    {expenseErrors.date && <p className="form-error">{expenseErrors.date.message as string}</p>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="expense-description" className="form-label">Description</label>
                  <textarea
                    id="expense-description"
                    className="input"
                    rows={3}
                    {...registerExpense('description', { required: 'Description is required' })}
                  ></textarea>
                  {expenseErrors.description && <p className="form-error">{expenseErrors.description.message as string}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="expense-receipt" className="form-label">Receipt URL (optional)</label>
                  <input
                    id="expense-receipt"
                    type="text"
                    className="input"
                    placeholder="https://example.com/receipt.jpg"
                    {...registerExpense('receipt')}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{currentExpense ? 'Update Expense' : 'Add Expense'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;