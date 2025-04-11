import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Plus, Search, Filter, Edit, Trash2, Eye, 
  Moon, Sun, ArrowDown, ArrowUp, Check, Download, UserPlus, Users, 
  Sofa, Laptop, Coffee, DollarSign, ChartBar, Tag, Calendar, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: 'basic' | 'premium' | 'corporate';
  dateJoined: string;
  status: 'active' | 'inactive' | 'pending';
  paymentStatus: 'paid' | 'unpaid' | 'overdue';
  paymentHistory: Payment[];
  notes?: string;
}

interface Desk {
  id: string;
  name: string;
  type: 'hot-desk' | 'dedicated' | 'private-office';
  capacity: number;
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
  status: 'available' | 'occupied' | 'maintenance';
  amenities: string[];
}

interface Booking {
  id: string;
  memberId: string;
  deskId: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  totalPrice: number;
  notes?: string;
}

interface Payment {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  type: 'membership' | 'booking' | 'additional';
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

interface Amenity {
  id: string;
  name: string;
  type: 'furniture' | 'technology' | 'food' | 'service';
  pricePerUse: number;
  available: boolean;
}

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  [key: string]: string[];
}

const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Current tab state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Entities state
  const [members, setMembers] = useState<Member[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  
  // Ref for modal to handle outside clicks and escape key
  const modalRef = useRef<HTMLDivElement>(null);

  // Tabs configuration
  const tabs: Tab[] = [
    { id: 'dashboard', name: 'Dashboard', icon: <ChartBar size={18} /> },
    { id: 'members', name: 'Members', icon: <Users size={18} /> },
    { id: 'desks', name: 'Desks', icon: <Sofa size={18} /> },
    { id: 'bookings', name: 'Bookings', icon: <Calendar size={18} /> },
    { id: 'payments', name: 'Payments', icon: <DollarSign size={18} /> },
    { id: 'amenities', name: 'Amenities', icon: <Coffee size={18} /> },
  ];

  // Initialize demo data on first load
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const storedMembers = localStorage.getItem('members');
        const storedDesks = localStorage.getItem('desks');
        const storedBookings = localStorage.getItem('bookings');
        const storedPayments = localStorage.getItem('payments');
        const storedAmenities = localStorage.getItem('amenities');

        if (storedMembers) setMembers(JSON.parse(storedMembers));
        if (storedDesks) setDesks(JSON.parse(storedDesks));
        if (storedBookings) setBookings(JSON.parse(storedBookings));
        if (storedPayments) setPayments(JSON.parse(storedPayments));
        if (storedAmenities) setAmenities(JSON.parse(storedAmenities));

        // If no data exists, load demo data
        if (!storedMembers) loadDemoData();
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        loadDemoData();
      }
    };

    loadFromLocalStorage();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (members.length > 0) localStorage.setItem('members', JSON.stringify(members));
    if (desks.length > 0) localStorage.setItem('desks', JSON.stringify(desks));
    if (bookings.length > 0) localStorage.setItem('bookings', JSON.stringify(bookings));
    if (payments.length > 0) localStorage.setItem('payments', JSON.stringify(payments));
    if (amenities.length > 0) localStorage.setItem('amenities', JSON.stringify(amenities));
  }, [members, desks, bookings, payments, amenities]);

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

  // Handle outside clicks for modal
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
        setIsFilterModalOpen(false);
      }
    };

    if (isModalOpen || isFilterModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscKey);
      document.body.classList.add('modal-open');
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscKey);
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen, isFilterModalOpen]);

  // Load demo data function
  const loadDemoData = () => {
    // Sample members
    const demoMembers: Member[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        membershipType: 'premium',
        dateJoined: '2023-01-15',
        status: 'active',
        paymentStatus: 'paid',
        paymentHistory: []
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        membershipType: 'basic',
        dateJoined: '2023-02-20',
        status: 'active',
        paymentStatus: 'paid',
        paymentHistory: []
      },
      {
        id: '3',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        membershipType: 'corporate',
        dateJoined: '2023-03-10',
        status: 'inactive',
        paymentStatus: 'overdue',
        paymentHistory: []
      }
    ];

    // Sample desks
    const demoDesks: Desk[] = [
      {
        id: '1',
        name: 'Desk A1',
        type: 'hot-desk',
        capacity: 1,
        pricePerHour: 5,
        pricePerDay: 30,
        pricePerMonth: 500,
        status: 'available',
        amenities: ['power-outlet', 'monitor']
      },
      {
        id: '2',
        name: 'Office B1',
        type: 'private-office',
        capacity: 4,
        pricePerHour: 20,
        pricePerDay: 120,
        pricePerMonth: 2000,
        status: 'occupied',
        amenities: ['power-outlet', 'monitor', 'whiteboard', 'projector']
      },
      {
        id: '3',
        name: 'Desk C2',
        type: 'dedicated',
        capacity: 1,
        pricePerHour: 8,
        pricePerDay: 50,
        pricePerMonth: 800,
        status: 'available',
        amenities: ['power-outlet', 'ergonomic-chair']
      }
    ];

    // Sample payments
    const demoPayments: Payment[] = [
      {
        id: '1',
        memberId: '1',
        amount: 500,
        date: '2023-01-15',
        type: 'membership',
        status: 'completed',
        reference: 'INV-2023-001'
      },
      {
        id: '2',
        memberId: '2',
        amount: 300,
        date: '2023-02-20',
        type: 'membership',
        status: 'completed',
        reference: 'INV-2023-002'
      },
      {
        id: '3',
        memberId: '1',
        amount: 50,
        date: '2023-02-01',
        type: 'booking',
        status: 'completed',
        reference: 'BOOK-2023-001'
      }
    ];

    // Sample bookings
    const demoBookings: Booking[] = [
      {
        id: '1',
        memberId: '1',
        deskId: '1',
        startTime: '2023-04-15T09:00:00',
        endTime: '2023-04-15T17:00:00',
        status: 'confirmed',
        totalPrice: 30
      },
      {
        id: '2',
        memberId: '2',
        deskId: '3',
        startTime: '2023-04-16T10:00:00',
        endTime: '2023-04-16T16:00:00',
        status: 'confirmed',
        totalPrice: 50
      },
      {
        id: '3',
        memberId: '3',
        deskId: '2',
        startTime: '2023-04-20T09:00:00',
        endTime: '2023-04-20T18:00:00',
        status: 'pending',
        totalPrice: 120
      }
    ];

    // Sample amenities
    const demoAmenities: Amenity[] = [
      {
        id: '1',
        name: 'Ergonomic Chair',
        type: 'furniture',
        pricePerUse: 5,
        available: true
      },
      {
        id: '2',
        name: 'External Monitor',
        type: 'technology',
        pricePerUse: 10,
        available: true
      },
      {
        id: '3',
        name: 'Coffee Service',
        type: 'food',
        pricePerUse: 3,
        available: true
      },
      {
        id: '4',
        name: 'Meeting Room Facilitation',
        type: 'service',
        pricePerUse: 20,
        available: true
      }
    ];

    // Update payment history for members
    const membersWithPaymentHistory = demoMembers.map(member => {
      const memberPayments = demoPayments.filter(payment => payment.memberId === member.id);
      return {
        ...member,
        paymentHistory: memberPayments
      };
    });

    // Save to state
    setMembers(membersWithPaymentHistory);
    setDesks(demoDesks);
    setBookings(demoBookings);
    setPayments(demoPayments);
    setAmenities(demoAmenities);

    // Save to localStorage
    localStorage.setItem('members', JSON.stringify(membersWithPaymentHistory));
    localStorage.setItem('desks', JSON.stringify(demoDesks));
    localStorage.setItem('bookings', JSON.stringify(demoBookings));
    localStorage.setItem('payments', JSON.stringify(demoPayments));
    localStorage.setItem('amenities', JSON.stringify(demoAmenities));
  };

  // Modal handling functions
  const openModal = (type: string, item: any = null) => {
    setModalType(type);
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setCurrentItem(null);
  };

  // Handle entity operations
  const handleAddMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newMember: Member = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      membershipType: formData.get('membershipType') as 'basic' | 'premium' | 'corporate',
      dateJoined: formData.get('dateJoined') as string,
      status: formData.get('status') as 'active' | 'inactive' | 'pending',
      paymentStatus: formData.get('paymentStatus') as 'paid' | 'unpaid' | 'overdue',
      paymentHistory: [],
      notes: formData.get('notes') as string || undefined
    };
    
    setMembers([...members, newMember]);
    closeModal();
  };

  const handleUpdateMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentItem) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const updatedMember: Member = {
      ...currentItem,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      membershipType: formData.get('membershipType') as 'basic' | 'premium' | 'corporate',
      status: formData.get('status') as 'active' | 'inactive' | 'pending',
      paymentStatus: formData.get('paymentStatus') as 'paid' | 'unpaid' | 'overdue',
      notes: formData.get('notes') as string || undefined
    };
    
    setMembers(members.map(member => 
      member.id === currentItem.id ? updatedMember : member
    ));
    closeModal();
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
    // Delete related bookings and payments
    setBookings(bookings.filter(booking => booking.memberId !== id));
    setPayments(payments.filter(payment => payment.memberId !== id));
    closeModal();
  };

  const handleAddDesk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const amenitiesArray = formData.get('amenities') ? 
      (formData.get('amenities') as string).split(',').map(item => item.trim()) : [];
    
    const newDesk: Desk = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as 'hot-desk' | 'dedicated' | 'private-office',
      capacity: parseInt(formData.get('capacity') as string),
      pricePerHour: parseFloat(formData.get('pricePerHour') as string),
      pricePerDay: parseFloat(formData.get('pricePerDay') as string),
      pricePerMonth: parseFloat(formData.get('pricePerMonth') as string),
      status: formData.get('status') as 'available' | 'occupied' | 'maintenance',
      amenities: amenitiesArray
    };
    
    setDesks([...desks, newDesk]);
    closeModal();
  };

  const handleUpdateDesk = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentItem) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const amenitiesArray = formData.get('amenities') ? 
      (formData.get('amenities') as string).split(',').map(item => item.trim()) : [];
    
    const updatedDesk: Desk = {
      ...currentItem,
      name: formData.get('name') as string,
      type: formData.get('type') as 'hot-desk' | 'dedicated' | 'private-office',
      capacity: parseInt(formData.get('capacity') as string),
      pricePerHour: parseFloat(formData.get('pricePerHour') as string),
      pricePerDay: parseFloat(formData.get('pricePerDay') as string),
      pricePerMonth: parseFloat(formData.get('pricePerMonth') as string),
      status: formData.get('status') as 'available' | 'occupied' | 'maintenance',
      amenities: amenitiesArray
    };
    
    setDesks(desks.map(desk => 
      desk.id === currentItem.id ? updatedDesk : desk
    ));
    closeModal();
  };

  const handleDeleteDesk = (id: string) => {
    setDesks(desks.filter(desk => desk.id !== id));
    // Delete related bookings
    setBookings(bookings.filter(booking => booking.deskId !== id));
    closeModal();
  };

  const handleAddBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const memberId = formData.get('memberId') as string;
    const deskId = formData.get('deskId') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    
    // Calculate price based on desk rates and booking duration
    const selectedDesk = desks.find(desk => desk.id === deskId);
    if (!selectedDesk) return;
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    let totalPrice = 0;
    if (durationHours <= 8) {
      totalPrice = selectedDesk.pricePerHour * durationHours;
    } else if (durationHours <= 24) {
      totalPrice = selectedDesk.pricePerDay;
    } else {
      const days = Math.ceil(durationHours / 24);
      totalPrice = selectedDesk.pricePerDay * days;
    }
    
    const newBooking: Booking = {
      id: Date.now().toString(),
      memberId,
      deskId,
      startTime,
      endTime,
      status: 'confirmed',
      totalPrice,
      notes: formData.get('notes') as string || undefined
    };
    
    setBookings([...bookings, newBooking]);
    
    // Create payment record for the booking
    const newPayment: Payment = {
      id: Date.now().toString() + '-payment',
      memberId,
      amount: totalPrice,
      date: new Date().toISOString().split('T')[0],
      type: 'booking',
      status: 'pending',
      reference: `BOOK-${newBooking.id}`
    };
    
    setPayments([...payments, newPayment]);
    
    // Update member's payment history
    setMembers(members.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          paymentHistory: [...member.paymentHistory, newPayment]
        };
      }
      return member;
    }));
    
    closeModal();
  };

  const handleUpdateBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentItem) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const updatedBooking: Booking = {
      ...currentItem,
      status: formData.get('status') as 'confirmed' | 'cancelled' | 'completed' | 'pending',
      notes: formData.get('notes') as string || undefined
    };
    
    setBookings(bookings.map(booking => 
      booking.id === currentItem.id ? updatedBooking : booking
    ));
    closeModal();
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter(booking => booking.id !== id));
    // Delete related payment
    setPayments(payments.filter(payment => payment.reference !== `BOOK-${id}`));
    closeModal();
  };

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const memberId = formData.get('memberId') as string;
    
    const newPayment: Payment = {
      id: Date.now().toString(),
      memberId,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      type: formData.get('type') as 'membership' | 'booking' | 'additional',
      status: formData.get('status') as 'completed' | 'pending' | 'failed',
      reference: formData.get('reference') as string || undefined
    };
    
    setPayments([...payments, newPayment]);
    
    // Update member's payment history
    setMembers(members.map(member => {
      if (member.id === memberId) {
        // Update payment status based on all payments
        let newPaymentStatus: 'paid' | 'unpaid' | 'overdue' = 'paid';
        
        // Check if there are any pending payments
        const hasPendingPayments = [...member.paymentHistory, newPayment].some(
          p => p.status === 'pending' || p.status === 'failed'
        );
        
        if (hasPendingPayments) {
          newPaymentStatus = 'unpaid';
        }
        
        return {
          ...member,
          paymentStatus: newPaymentStatus,
          paymentHistory: [...member.paymentHistory, newPayment]
        };
      }
      return member;
    }));
    
    closeModal();
  };

  const handleUpdatePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentItem) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const updatedPayment: Payment = {
      ...currentItem,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
      status: formData.get('status') as 'completed' | 'pending' | 'failed',
      reference: formData.get('reference') as string || undefined
    };
    
    setPayments(payments.map(payment => 
      payment.id === currentItem.id ? updatedPayment : payment
    ));
    
    // Update member's payment history
    const memberId = updatedPayment.memberId;
    setMembers(members.map(member => {
      if (member.id === memberId) {
        const updatedHistory = member.paymentHistory.map(p => 
          p.id === updatedPayment.id ? updatedPayment : p
        );
        
        // Calculate payment status
        let newPaymentStatus: 'paid' | 'unpaid' | 'overdue' = 'paid';
        const hasPendingPayments = updatedHistory.some(
          p => p.status === 'pending' || p.status === 'failed'
        );
        
        if (hasPendingPayments) {
          newPaymentStatus = 'unpaid';
        }
        
        return {
          ...member,
          paymentStatus: newPaymentStatus,
          paymentHistory: updatedHistory
        };
      }
      return member;
    }));
    
    closeModal();
  };

  const handleDeletePayment = (id: string) => {
    const paymentToDelete = payments.find(payment => payment.id === id);
    if (!paymentToDelete) return;
    
    setPayments(payments.filter(payment => payment.id !== id));
    
    // Update member's payment history
    const memberId = paymentToDelete.memberId;
    setMembers(members.map(member => {
      if (member.id === memberId) {
        const updatedHistory = member.paymentHistory.filter(p => p.id !== id);
        
        // Calculate payment status
        let newPaymentStatus: 'paid' | 'unpaid' | 'overdue' = 'paid';
        const hasPendingPayments = updatedHistory.some(
          p => p.status === 'pending' || p.status === 'failed'
        );
        
        if (hasPendingPayments) {
          newPaymentStatus = 'unpaid';
        }
        
        return {
          ...member,
          paymentStatus: newPaymentStatus,
          paymentHistory: updatedHistory
        };
      }
      return member;
    }));
    
    closeModal();
  };

  const handleAddAmenity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newAmenity: Amenity = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as 'furniture' | 'technology' | 'food' | 'service',
      pricePerUse: parseFloat(formData.get('pricePerUse') as string),
      available: formData.get('available') === 'true'
    };
    
    setAmenities([...amenities, newAmenity]);
    closeModal();
  };

  const handleUpdateAmenity = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentItem) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const updatedAmenity: Amenity = {
      ...currentItem,
      name: formData.get('name') as string,
      type: formData.get('type') as 'furniture' | 'technology' | 'food' | 'service',
      pricePerUse: parseFloat(formData.get('pricePerUse') as string),
      available: formData.get('available') === 'true'
    };
    
    setAmenities(amenities.map(amenity => 
      amenity.id === currentItem.id ? updatedAmenity : amenity
    ));
    closeModal();
  };

  const handleDeleteAmenity = (id: string) => {
    setAmenities(amenities.filter(amenity => amenity.id !== id));
    closeModal();
  };

  // Search & Filter functions
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterConfig(prevConfig => {
      const updatedConfig = { ...prevConfig };
      
      if (!updatedConfig[key]) {
        updatedConfig[key] = [value];
      } else if (updatedConfig[key].includes(value)) {
        updatedConfig[key] = updatedConfig[key].filter(v => v !== value);
        if (updatedConfig[key].length === 0) {
          delete updatedConfig[key];
        }
      } else {
        updatedConfig[key].push(value);
      }
      
      return updatedConfig;
    });
  };

  const handleClearFilters = () => {
    setFilterConfig({});
    setIsFilterModalOpen(false);
  };

  // Filter data based on search term and filter config
  const filterData = (data: any[]) => {
    // First apply search term
    let filteredData = data;
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      filteredData = data.filter(item => {
        return Object.values(item).some(val => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return false;
          return String(val).toLowerCase().includes(lowercasedSearch);
        });
      });
    }
    
    // Then apply filters
    if (Object.keys(filterConfig).length > 0) {
      filteredData = filteredData.filter(item => {
        return Object.entries(filterConfig).every(([key, values]) => {
          if (!item[key]) return false;
          return values.includes(item[key]);
        });
      });
    }
    
    // Finally sort the data
    if (sortConfig) {
      filteredData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredData;
  };

  // Export functionality
  const handleExportData = () => {
    let dataToExport;
    
    switch (activeTab) {
      case 'members':
        dataToExport = members;
        break;
      case 'desks':
        dataToExport = desks;
        break;
      case 'bookings':
        dataToExport = bookings;
        break;
      case 'payments':
        dataToExport = payments;
        break;
      case 'amenities':
        dataToExport = amenities;
        break;
      default:
        dataToExport = {};
    }
    
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // Template download
  const handleDownloadTemplate = () => {
    let template;
    
    switch (activeTab) {
      case 'members':
        template = {
          name: 'John Doe',
          email: 'john@example.com',
          membershipType: 'basic',
          dateJoined: '2023-01-01',
          status: 'active',
          paymentStatus: 'paid',
          notes: 'Optional notes'
        };
        break;
      case 'desks':
        template = {
          name: 'Desk A1',
          type: 'hot-desk',
          capacity: 1,
          pricePerHour: 5,
          pricePerDay: 30,
          pricePerMonth: 500,
          status: 'available',
          amenities: ['power-outlet', 'monitor']
        };
        break;
      case 'bookings':
        template = {
          memberId: 'member-id',
          deskId: 'desk-id',
          startTime: '2023-04-15T09:00:00',
          endTime: '2023-04-15T17:00:00',
          notes: 'Optional notes'
        };
        break;
      case 'payments':
        template = {
          memberId: 'member-id',
          amount: 100,
          date: '2023-04-15',
          type: 'membership',
          status: 'completed',
          reference: 'INV-2023-001'
        };
        break;
      case 'amenities':
        template = {
          name: 'Ergonomic Chair',
          type: 'furniture',
          pricePerUse: 5,
          available: true
        };
        break;
      default:
        template = {};
    }
    
    const jsonString = JSON.stringify(template, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_template.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // Helper functions for rendering
  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id);
    return member ? member.name : 'Unknown';
  };

  const getDeskName = (id: string) => {
    const desk = desks.find(d => d.id === id);
    return desk ? desk.name : 'Unknown';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    } catch (error) {
      return dateTimeString;
    }
  };

  // Prepare data for dashboard charts
  const prepareBookingsChartData = () => {
    const bookingsByDeskType: any = {};
    bookings.forEach(booking => {
      const desk = desks.find(d => d.id === booking.deskId);
      if (desk) {
        if (!bookingsByDeskType[desk.type]) {
          bookingsByDeskType[desk.type] = 0;
        }
        bookingsByDeskType[desk.type]++;
      }
    });

    return Object.keys(bookingsByDeskType).map(type => ({
      name: type,
      bookings: bookingsByDeskType[type]
    }));
  };

  const prepareRevenueChartData = () => {
    // Get all unique months from payments
    const months: { [key: string]: number } = {};
    payments.forEach(payment => {
      const date = new Date(payment.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!months[monthYear]) {
        months[monthYear] = 0;
      }
      
      if (payment.status === 'completed') {
        months[monthYear] += payment.amount;
      }
    });

    return Object.entries(months).map(([month, amount]) => ({
      month,
      revenue: amount
    }));
  };

  // Filtered data based on active tab
  const getFilteredData = () => {
    switch (activeTab) {
      case 'members':
        return filterData(members);
      case 'desks':
        return filterData(desks);
      case 'bookings':
        return filterData(bookings);
      case 'payments':
        return filterData(payments);
      case 'amenities':
        return filterData(amenities);
      default:
        return [];
    }
  };

  // Render main content based on active tab
  const renderContent = () => {
    const filteredData = getFilteredData();

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card">
                <div className="stat-title">Total Members</div>
                <div className="stat-value">{members.length}</div>
                <div className="stat-desc">
                  <span className={members.filter(m => m.status === 'active').length > members.length / 2 ? 'text-green-500' : 'text-red-500'}>
                    {members.filter(m => m.status === 'active').length} active
                  </span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Available Desks</div>
                <div className="stat-value">{desks.filter(d => d.status === 'available').length}</div>
                <div className="stat-desc">
                  <span className="text-gray-500">out of {desks.length} total</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Monthly Revenue</div>
                <div className="stat-value">
                  ${payments
                    .filter(p => {
                      const date = new Date(p.date);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && 
                             date.getFullYear() === now.getFullYear() &&
                             p.status === 'completed';
                    })
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toFixed(2)}
                </div>
                <div className="stat-desc">Current month</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Bookings by Desk Type</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareBookingsChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="bookings" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareRevenueChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Recent Bookings</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Member</th>
                      <th className="table-header">Desk</th>
                      <th className="table-header">Start Time</th>
                      <th className="table-header">End Time</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {bookings.slice(0, 5).map(booking => (
                      <tr key={booking.id}>
                        <td className="table-cell">{getMemberName(booking.memberId)}</td>
                        <td className="table-cell">{getDeskName(booking.deskId)}</td>
                        <td className="table-cell">{formatDateTime(booking.startTime)}</td>
                        <td className="table-cell">{formatDateTime(booking.endTime)}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            booking.status === 'confirmed' ? 'badge-success' :
                            booking.status === 'cancelled' ? 'badge-error' :
                            booking.status === 'pending' ? 'badge-warning' :
                            'badge-info'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'members':
        return (
          <div>
            <div className="flex-between mb-4">
              <div className="flex items-center space-x-2">
                <button 
                  className="btn btn-primary flex items-center gap-1" 
                  onClick={() => openModal('addMember')}
                  aria-label="Add member"
                >
                  <Plus size={16} />
                  <span>Add Member</span>
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700 flex items-center gap-1" 
                  onClick={handleDownloadTemplate}
                  aria-label="Download template"
                >
                  <Download size={16} />
                  <span>Template</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={handleSearch}
                    aria-label="Search members"
                  />
                </div>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={() => setIsFilterModalOpen(true)}
                  aria-label="Filter"
                >
                  <Filter size={16} />
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={handleExportData}
                  aria-label="Export data"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        <span>Name</span>
                        {sortConfig?.key === 'name' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3">Email</th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('membershipType')}>
                      <div className="flex items-center">
                        <span>Membership</span>
                        {sortConfig?.key === 'membershipType' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('dateJoined')}>
                      <div className="flex items-center">
                        <span>Date Joined</span>
                        {sortConfig?.key === 'dateJoined' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center">
                        <span>Status</span>
                        {sortConfig?.key === 'status' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('paymentStatus')}>
                      <div className="flex items-center">
                        <span>Payment</span>
                        {sortConfig?.key === 'paymentStatus' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredData.map((member: Member) => (
                    <tr key={member.id}>
                      <td className="table-cell px-6 py-4">{member.name}</td>
                      <td className="table-cell px-6 py-4">{member.email}</td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${
                          member.membershipType === 'premium' ? 'badge-success' :
                          member.membershipType === 'corporate' ? 'badge-info' :
                          'badge-warning'
                        }`}>
                          {member.membershipType}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">{formatDate(member.dateJoined)}</td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${
                          member.status === 'active' ? 'badge-success' :
                          member.status === 'inactive' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${
                          member.paymentStatus === 'paid' ? 'badge-success' :
                          member.paymentStatus === 'overdue' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {member.paymentStatus}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            className="btn-sm bg-blue-500 text-white rounded p-1 hover:bg-blue-600"
                            onClick={() => openModal('viewMember', member)}
                            aria-label="View member details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="btn-sm bg-amber-500 text-white rounded p-1 hover:bg-amber-600"
                            onClick={() => openModal('editMember', member)}
                            aria-label="Edit member"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-sm bg-red-500 text-white rounded p-1 hover:bg-red-600"
                            onClick={() => openModal('deleteMember', member)}
                            aria-label="Delete member"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 text-center text-gray-500 dark:text-slate-400">
                  No members found
                </div>
              )}
            </div>
          </div>
        );
        
      case 'desks':
        return (
          <div>
            <div className="flex-between mb-4">
              <div className="flex items-center space-x-2">
                <button 
                  className="btn btn-primary flex items-center gap-1" 
                  onClick={() => openModal('addDesk')}
                  aria-label="Add desk"
                >
                  <Plus size={16} />
                  <span>Add Desk</span>
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700 flex items-center gap-1" 
                  onClick={handleDownloadTemplate}
                  aria-label="Download template"
                >
                  <Download size={16} />
                  <span>Template</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search desks..."
                    value={searchTerm}
                    onChange={handleSearch}
                    aria-label="Search desks"
                  />
                </div>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={() => setIsFilterModalOpen(true)}
                  aria-label="Filter"
                >
                  <Filter size={16} />
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={handleExportData}
                  aria-label="Export data"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        <span>Name</span>
                        {sortConfig?.key === 'name' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('type')}>
                      <div className="flex items-center">
                        <span>Type</span>
                        {sortConfig?.key === 'type' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('capacity')}>
                      <div className="flex items-center">
                        <span>Capacity</span>
                        {sortConfig?.key === 'capacity' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('pricePerDay')}>
                      <div className="flex items-center">
                        <span>Price/Day</span>
                        {sortConfig?.key === 'pricePerDay' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center">
                        <span>Status</span>
                        {sortConfig?.key === 'status' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredData.map((desk: Desk) => (
                    <tr key={desk.id}>
                      <td className="table-cell px-6 py-4">{desk.name}</td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${
                          desk.type === 'private-office' ? 'badge-info' :
                          desk.type === 'dedicated' ? 'badge-success' :
                          'badge-warning'
                        }`}>
                          {desk.type}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">{desk.capacity}</td>
                      <td className="table-cell px-6 py-4">${desk.pricePerDay}</td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${
                          desk.status === 'available' ? 'badge-success' :
                          desk.status === 'occupied' ? 'badge-warning' :
                          'badge-error'
                        }`}>
                          {desk.status}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            className="btn-sm bg-blue-500 text-white rounded p-1 hover:bg-blue-600"
                            onClick={() => openModal('viewDesk', desk)}
                            aria-label="View desk details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="btn-sm bg-amber-500 text-white rounded p-1 hover:bg-amber-600"
                            onClick={() => openModal('editDesk', desk)}
                            aria-label="Edit desk"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-sm bg-red-500 text-white rounded p-1 hover:bg-red-600"
                            onClick={() => openModal('deleteDesk', desk)}
                            aria-label="Delete desk"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 text-center text-gray-500 dark:text-slate-400">
                  No desks found
                </div>
              )}
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div>
            <div className="flex-between mb-4">
              <div className="flex items-center space-x-2">
                <button 
                  className="btn btn-primary flex items-center gap-1" 
                  onClick={() => openModal('addBooking')}
                  aria-label="Add booking"
                >
                  <Plus size={16} />
                  <span>Add Booking</span>
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700 flex items-center gap-1" 
                  onClick={handleDownloadTemplate}
                  aria-label="Download template"
                >
                  <Download size={16} />
                  <span>Template</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={handleSearch}
                    aria-label="Search bookings"
                  />
                </div>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={() => setIsFilterModalOpen(true)}
                  aria-label="Filter"
                >
                  <Filter size={16} />
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={handleExportData}
                  aria-label="Export data"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3">Member</th>
                    <th className="table-header px-6 py-3">Desk</th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('startTime')}>
                      <div className="flex items-center">
                        <span>Start Time</span>
                        {sortConfig?.key === 'startTime' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('endTime')}>
                      <div className="flex items-center">
                        <span>End Time</span>
                        {sortConfig?.key === 'endTime' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center">
                        <span>Status</span>
                        {sortConfig?.key === 'status' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('totalPrice')}>
                      <div className="flex items-center">
                        <span>Price</span>
                        {sortConfig?.key === 'totalPrice' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredData.map((booking: Booking) => (
                    <tr key={booking.id}>
                      <td className="table-cell px-6 py-4">{getMemberName(booking.memberId)}</td>
                      <td className="table-cell px-6 py-4">{getDeskName(booking.deskId)}</td>
                      <td className="table-cell px-6 py-4">{formatDateTime(booking.startTime)}</td>
                      <td className="table-cell px-6 py-4">{formatDateTime(booking.endTime)}</td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${
                          booking.status === 'confirmed' ? 'badge-success' :
                          booking.status === 'cancelled' ? 'badge-error' :
                          booking.status === 'completed' ? 'badge-info' :
                          'badge-warning'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">${booking.totalPrice}</td>
                      <td className="table-cell px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            className="btn-sm bg-blue-500 text-white rounded p-1 hover:bg-blue-600"
                            onClick={() => openModal('viewBooking', booking)}
                            aria-label="View booking details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            className="btn-sm bg-amber-500 text-white rounded p-1 hover:bg-amber-600"
                            onClick={() => openModal('editBooking', booking)}
                            aria-label="Edit booking"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-sm bg-red-500 text-white rounded p-1 hover:bg-red-600"
                            onClick={() => openModal('deleteBooking', booking)}
                            aria-label="Delete booking"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 text-center text-gray-500 dark:text-slate-400">
                  No bookings found
                </div>
              )}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div>
            <div className="flex-between mb-4">
              <div className="flex items-center space-x-2">
                <button 
                  className="btn btn-primary flex items-center gap-1" 
                  onClick={() => openModal('addPayment')}
                  aria-label="Add payment"
                >
                  <Plus size={16} />
                  <span>Add Payment</span>
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700 flex items-center gap-1" 
                  onClick={handleDownloadTemplate}
                  aria-label="Download template"
                >
                  <Download size={16} />
                  <span>Template</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={handleSearch}
                    aria-label="Search payments"
                  />
                </div>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={() => setIsFilterModalOpen(true)}
                  aria-label="Filter"
                >
                  <Filter size={16} />
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={handleExportData}
                  aria-label="Export data"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3">Member</th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('date')}>
                      <div className="flex items-center">
                        <span>Date</span>
                        {sortConfig?.key === 'date' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('amount')}>
                      <div className="flex items-center">
                        <span>Amount</span>
                        {sortConfig?.key === 'amount' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('type')}>
                      <div className="flex items-center">
                        <span>Type</span>
                        {sortConfig?.key === 'type' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('status')}>
                      <div className="flex items-center">
                        <span>Status</span>
                        {sortConfig?.key === 'status' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3">Reference</th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredData.map((payment: Payment) => (
                    <tr key={payment.id}>
                      <td className="table-cell px-6 py-4">{getMemberName(payment.memberId)}</td>
                      <td className="table-cell px-6 py-4">{formatDate(payment.date)}</td>
                      <td className="table-cell px-6 py-4">${payment.amount}</td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${
                          payment.type === 'membership' ? 'badge-info' :
                          payment.type === 'booking' ? 'badge-success' :
                          'badge-warning'
                        }`}>
                          {payment.type}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${
                          payment.status === 'completed' ? 'badge-success' :
                          payment.status === 'pending' ? 'badge-warning' :
                          'badge-error'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">{payment.reference || 'N/A'}</td>
                      <td className="table-cell px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            className="btn-sm bg-amber-500 text-white rounded p-1 hover:bg-amber-600"
                            onClick={() => openModal('editPayment', payment)}
                            aria-label="Edit payment"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-sm bg-red-500 text-white rounded p-1 hover:bg-red-600"
                            onClick={() => openModal('deletePayment', payment)}
                            aria-label="Delete payment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 text-center text-gray-500 dark:text-slate-400">
                  No payments found
                </div>
              )}
            </div>
          </div>
        );

      case 'amenities':
        return (
          <div>
            <div className="flex-between mb-4">
              <div className="flex items-center space-x-2">
                <button 
                  className="btn btn-primary flex items-center gap-1" 
                  onClick={() => openModal('addAmenity')}
                  aria-label="Add amenity"
                >
                  <Plus size={16} />
                  <span>Add Amenity</span>
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700 flex items-center gap-1" 
                  onClick={handleDownloadTemplate}
                  aria-label="Download template"
                >
                  <Download size={16} />
                  <span>Template</span>
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search amenities..."
                    value={searchTerm}
                    onChange={handleSearch}
                    aria-label="Search amenities"
                  />
                </div>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={() => setIsFilterModalOpen(true)}
                  aria-label="Filter"
                >
                  <Filter size={16} />
                </button>
                <button 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700" 
                  onClick={handleExportData}
                  aria-label="Export data"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
            
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                      <div className="flex items-center">
                        <span>Name</span>
                        {sortConfig?.key === 'name' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('type')}>
                      <div className="flex items-center">
                        <span>Type</span>
                        {sortConfig?.key === 'type' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('pricePerUse')}>
                      <div className="flex items-center">
                        <span>Price</span>
                        {sortConfig?.key === 'pricePerUse' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('available')}>
                      <div className="flex items-center">
                        <span>Available</span>
                        {sortConfig?.key === 'available' && (
                          sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredData.map((amenity: Amenity) => (
                    <tr key={amenity.id}>
                      <td className="table-cell px-6 py-4">{amenity.name}</td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${
                          amenity.type === 'technology' ? 'badge-info' :
                          amenity.type === 'furniture' ? 'badge-success' :
                          amenity.type === 'food' ? 'badge-warning' :
                          'badge-error'
                        }`}>
                          {amenity.type}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">${amenity.pricePerUse}</td>
                      <td className="table-cell px-6 py-4">
                        <span className={`badge ${amenity.available ? 'badge-success' : 'badge-error'}`}>
                          {amenity.available ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            className="btn-sm bg-amber-500 text-white rounded p-1 hover:bg-amber-600"
                            onClick={() => openModal('editAmenity', amenity)}
                            aria-label="Edit amenity"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-sm bg-red-500 text-white rounded p-1 hover:bg-red-600"
                            onClick={() => openModal('deleteAmenity', amenity)}
                            aria-label="Delete amenity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 text-center text-gray-500 dark:text-slate-400">
                  No amenities found
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  // Render filter modal based on active tab
  const renderFilterModal = () => {
    if (!isFilterModalOpen) return null;

    let filterOptions: { key: string; label: string; options: { value: string; label: string }[] }[] = [];
    
    switch (activeTab) {
      case 'members':
        filterOptions = [
          {
            key: 'membershipType',
            label: 'Membership Type',
            options: [
              { value: 'basic', label: 'Basic' },
              { value: 'premium', label: 'Premium' },
              { value: 'corporate', label: 'Corporate' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending', label: 'Pending' }
            ]
          },
          {
            key: 'paymentStatus',
            label: 'Payment Status',
            options: [
              { value: 'paid', label: 'Paid' },
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'overdue', label: 'Overdue' }
            ]
          }
        ];
        break;
      case 'desks':
        filterOptions = [
          {
            key: 'type',
            label: 'Type',
            options: [
              { value: 'hot-desk', label: 'Hot Desk' },
              { value: 'dedicated', label: 'Dedicated' },
              { value: 'private-office', label: 'Private Office' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'available', label: 'Available' },
              { value: 'occupied', label: 'Occupied' },
              { value: 'maintenance', label: 'Maintenance' }
            ]
          }
        ];
        break;
      case 'bookings':
        filterOptions = [
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' }
            ]
          }
        ];
        break;
      case 'payments':
        filterOptions = [
          {
            key: 'type',
            label: 'Type',
            options: [
              { value: 'membership', label: 'Membership' },
              { value: 'booking', label: 'Booking' },
              { value: 'additional', label: 'Additional' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' }
            ]
          }
        ];
        break;
      case 'amenities':
        filterOptions = [
          {
            key: 'type',
            label: 'Type',
            options: [
              { value: 'furniture', label: 'Furniture' },
              { value: 'technology', label: 'Technology' },
              { value: 'food', label: 'Food' },
              { value: 'service', label: 'Service' }
            ]
          },
          {
            key: 'available',
            label: 'Availability',
            options: [
              { value: 'true', label: 'Available' },
              { value: 'false', label: 'Not Available' }
            ]
          }
        ];
        break;
      default:
        break;
    }

    return (
      <div className="modal-backdrop" onClick={() => setIsFilterModalOpen(false)}>
        <div 
          className="modal-content w-full max-w-md" 
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
        >
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter {activeTab}</h3>
            <button 
              className="text-gray-400 hover:text-gray-500" 
              onClick={() => setIsFilterModalOpen(false)}
              aria-label="Close filter modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-4 space-y-4">
            {filterOptions.map(filterGroup => (
              <div key={filterGroup.key} className="space-y-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">{filterGroup.label}</h4>
                <div className="space-y-1">
                  {filterGroup.options.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={filterConfig[filterGroup.key]?.includes(option.value) || false}
                        onChange={() => handleFilterChange(filterGroup.key, option.value)}
                        className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="modal-footer">
            <button 
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
              onClick={handleClearFilters}
              aria-label="Clear filters"
            >
              Clear Filters
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => setIsFilterModalOpen(false)}
              aria-label="Apply filters"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render modal content based on modalType
  const renderModal = () => {
    if (!isModalOpen) return null;

    switch (modalType) {
      case 'addMember':
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Member</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddMember}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input id="name" name="name" type="text" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="membershipType">Membership Type</label>
                    <select id="membershipType" name="membershipType" className="input" required>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="dateJoined">Date Joined</label>
                    <input 
                      id="dateJoined" 
                      name="dateJoined" 
                      type="date" 
                      className="input" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select id="status" name="status" className="input" required>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="paymentStatus">Payment Status</label>
                    <select id="paymentStatus" name="paymentStatus" className="input" required>
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">Notes</label>
                    <textarea id="notes" name="notes" className="input" rows={3}></textarea>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'editMember':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Member</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateMember}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      className="input" 
                      defaultValue={currentItem.name} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input 
                      id="email" 
                      name="email" 
                      type="email" 
                      className="input" 
                      defaultValue={currentItem.email} 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="membershipType">Membership Type</label>
                    <select 
                      id="membershipType" 
                      name="membershipType" 
                      className="input" 
                      defaultValue={currentItem.membershipType}
                      required
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select 
                      id="status" 
                      name="status" 
                      className="input" 
                      defaultValue={currentItem.status}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="paymentStatus">Payment Status</label>
                    <select 
                      id="paymentStatus" 
                      name="paymentStatus" 
                      className="input" 
                      defaultValue={currentItem.paymentStatus}
                      required
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">Notes</label>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      className="input" 
                      rows={3}
                      defaultValue={currentItem.notes}
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'deleteMember':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Member</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-500 dark:text-slate-400">
                  Are you sure you want to delete {currentItem.name}? This action cannot be undone.
                </p>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleDeleteMember(currentItem.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );

      case 'viewMember':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content max-w-2xl" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Member Details</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Name</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{currentItem.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Email</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{currentItem.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Membership Type</h4>
                    <p className="mt-1">
                      <span className={`badge ${
                        currentItem.membershipType === 'premium' ? 'badge-success' :
                        currentItem.membershipType === 'corporate' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {currentItem.membershipType}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Date Joined</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDate(currentItem.dateJoined)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Status</h4>
                    <p className="mt-1">
                      <span className={`badge ${
                        currentItem.status === 'active' ? 'badge-success' :
                        currentItem.status === 'inactive' ? 'badge-error' :
                        'badge-warning'
                      }`}>
                        {currentItem.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Payment Status</h4>
                    <p className="mt-1">
                      <span className={`badge ${
                        currentItem.paymentStatus === 'paid' ? 'badge-success' :
                        currentItem.paymentStatus === 'overdue' ? 'badge-error' :
                        'badge-warning'
                      }`}>
                        {currentItem.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>
                
                {currentItem.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Notes</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{currentItem.notes}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Payment History</h4>
                  {currentItem.paymentHistory && currentItem.paymentHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="table-header">Date</th>
                            <th className="table-header">Amount</th>
                            <th className="table-header">Type</th>
                            <th className="table-header">Status</th>
                            <th className="table-header">Reference</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                          {currentItem.paymentHistory.map((payment: Payment) => (
                            <tr key={payment.id}>
                              <td className="table-cell">{formatDate(payment.date)}</td>
                              <td className="table-cell">${payment.amount}</td>
                              <td className="table-cell">
                                <span className={`badge ${
                                  payment.type === 'membership' ? 'badge-info' :
                                  payment.type === 'booking' ? 'badge-success' :
                                  'badge-warning'
                                }`}>
                                  {payment.type}
                                </span>
                              </td>
                              <td className="table-cell">
                                <span className={`badge ${
                                  payment.status === 'completed' ? 'badge-success' :
                                  payment.status === 'pending' ? 'badge-warning' :
                                  'badge-error'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="table-cell">{payment.reference || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-slate-400">No payment history available</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Recent Bookings</h4>
                  {bookings.filter(b => b.memberId === currentItem.id).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="table-header">Desk</th>
                            <th className="table-header">Start Time</th>
                            <th className="table-header">End Time</th>
                            <th className="table-header">Status</th>
                            <th className="table-header">Price</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                          {bookings
                            .filter(b => b.memberId === currentItem.id)
                            .slice(0, 5)
                            .map(booking => (
                              <tr key={booking.id}>
                                <td className="table-cell">{getDeskName(booking.deskId)}</td>
                                <td className="table-cell">{formatDateTime(booking.startTime)}</td>
                                <td className="table-cell">{formatDateTime(booking.endTime)}</td>
                                <td className="table-cell">
                                  <span className={`badge ${
                                    booking.status === 'confirmed' ? 'badge-success' :
                                    booking.status === 'cancelled' ? 'badge-error' :
                                    booking.status === 'completed' ? 'badge-info' :
                                    'badge-warning'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                                <td className="table-cell">${booking.totalPrice}</td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-slate-400">No booking history available</p>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  onClick={closeModal}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    closeModal();
                    openModal('editMember', currentItem);
                  }}
                >
                  Edit Member
                </button>
              </div>
            </div>
          </div>
        );

      case 'addDesk':
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Desk</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddDesk}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input id="name" name="name" type="text" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="type">Type</label>
                    <select id="type" name="type" className="input" required>
                      <option value="hot-desk">Hot Desk</option>
                      <option value="dedicated">Dedicated</option>
                      <option value="private-office">Private Office</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="capacity">Capacity</label>
                    <input id="capacity" name="capacity" type="number" min="1" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="pricePerHour">Price Per Hour</label>
                    <input id="pricePerHour" name="pricePerHour" type="number" min="0" step="0.01" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="pricePerDay">Price Per Day</label>
                    <input id="pricePerDay" name="pricePerDay" type="number" min="0" step="0.01" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="pricePerMonth">Price Per Month</label>
                    <input id="pricePerMonth" name="pricePerMonth" type="number" min="0" step="0.01" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select id="status" name="status" className="input" required>
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="amenities">Amenities (comma separated)</label>
                    <input id="amenities" name="amenities" type="text" className="input" placeholder="power-outlet, monitor, etc." />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Desk
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'editDesk':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Desk</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateDesk}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      className="input" 
                      defaultValue={currentItem.name}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="type">Type</label>
                    <select 
                      id="type" 
                      name="type" 
                      className="input" 
                      defaultValue={currentItem.type}
                      required
                    >
                      <option value="hot-desk">Hot Desk</option>
                      <option value="dedicated">Dedicated</option>
                      <option value="private-office">Private Office</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="capacity">Capacity</label>
                    <input 
                      id="capacity" 
                      name="capacity" 
                      type="number" 
                      min="1" 
                      className="input" 
                      defaultValue={currentItem.capacity}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="pricePerHour">Price Per Hour</label>
                    <input 
                      id="pricePerHour" 
                      name="pricePerHour" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      className="input" 
                      defaultValue={currentItem.pricePerHour}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="pricePerDay">Price Per Day</label>
                    <input 
                      id="pricePerDay" 
                      name="pricePerDay" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      className="input" 
                      defaultValue={currentItem.pricePerDay}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="pricePerMonth">Price Per Month</label>
                    <input 
                      id="pricePerMonth" 
                      name="pricePerMonth" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      className="input" 
                      defaultValue={currentItem.pricePerMonth}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select 
                      id="status" 
                      name="status" 
                      className="input" 
                      defaultValue={currentItem.status}
                      required
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="amenities">Amenities (comma separated)</label>
                    <input 
                      id="amenities" 
                      name="amenities" 
                      type="text" 
                      className="input" 
                      defaultValue={currentItem.amenities.join(', ')}
                      placeholder="power-outlet, monitor, etc." 
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Desk
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'deleteDesk':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Desk</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-500 dark:text-slate-400">
                  Are you sure you want to delete {currentItem.name}? This action cannot be undone.
                </p>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleDeleteDesk(currentItem.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );

      case 'viewDesk':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Desk Details</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Name</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{currentItem.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Type</h4>
                    <p className="mt-1">
                      <span className={`badge ${
                        currentItem.type === 'private-office' ? 'badge-info' :
                        currentItem.type === 'dedicated' ? 'badge-success' :
                        'badge-warning'
                      }`}>
                        {currentItem.type}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Capacity</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{currentItem.capacity}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Status</h4>
                    <p className="mt-1">
                      <span className={`badge ${
                        currentItem.status === 'available' ? 'badge-success' :
                        currentItem.status === 'occupied' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {currentItem.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Price Per Hour</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">${currentItem.pricePerHour}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Price Per Day</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">${currentItem.pricePerDay}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Price Per Month</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">${currentItem.pricePerMonth}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Amenities</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {currentItem.amenities.map((amenity: string, index: number) => (
                        <span key={index} className="badge badge-info">{amenity}</span>
                      ))}
                      {currentItem.amenities.length === 0 && (
                        <p className="text-gray-500 dark:text-slate-400">No amenities available</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2">Upcoming Bookings</h4>
                  {bookings.filter(b => b.deskId === currentItem.id).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="table-header">Member</th>
                            <th className="table-header">Start Time</th>
                            <th className="table-header">End Time</th>
                            <th className="table-header">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                          {bookings
                            .filter(b => b.deskId === currentItem.id)
                            .slice(0, 5)
                            .map(booking => (
                              <tr key={booking.id}>
                                <td className="table-cell">{getMemberName(booking.memberId)}</td>
                                <td className="table-cell">{formatDateTime(booking.startTime)}</td>
                                <td className="table-cell">{formatDateTime(booking.endTime)}</td>
                                <td className="table-cell">
                                  <span className={`badge ${
                                    booking.status === 'confirmed' ? 'badge-success' :
                                    booking.status === 'cancelled' ? 'badge-error' :
                                    booking.status === 'completed' ? 'badge-info' :
                                    'badge-warning'
                                  }`}>
                                    {booking.status}
                                  </span>
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-slate-400">No upcoming bookings</p>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  onClick={closeModal}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    closeModal();
                    openModal('editDesk', currentItem);
                  }}
                >
                  Edit Desk
                </button>
              </div>
            </div>
          </div>
        );

      case 'addBooking':
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Booking</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddBooking}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="memberId">Member</label>
                    <select id="memberId" name="memberId" className="input" required>
                      <option value="">Select a member</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="deskId">Desk</label>
                    <select id="deskId" name="deskId" className="input" required>
                      <option value="">Select a desk</option>
                      {desks
                        .filter(desk => desk.status === 'available')
                        .map(desk => (
                          <option key={desk.id} value={desk.id}>{desk.name} - {desk.type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="startTime">Start Time</label>
                    <input id="startTime" name="startTime" type="datetime-local" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="endTime">End Time</label>
                    <input id="endTime" name="endTime" type="datetime-local" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">Notes</label>
                    <textarea id="notes" name="notes" className="input" rows={3}></textarea>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'editBooking':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Booking</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateBooking}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label">Member</label>
                    <p className="text-gray-700 dark:text-slate-300">{getMemberName(currentItem.memberId)}</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Desk</label>
                    <p className="text-gray-700 dark:text-slate-300">{getDeskName(currentItem.deskId)}</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <p className="text-gray-700 dark:text-slate-300">{formatDateTime(currentItem.startTime)}</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">End Time</label>
                    <p className="text-gray-700 dark:text-slate-300">{formatDateTime(currentItem.endTime)}</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select 
                      id="status" 
                      name="status" 
                      className="input" 
                      defaultValue={currentItem.status}
                      required
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <p className="text-gray-700 dark:text-slate-300">${currentItem.totalPrice}</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="notes">Notes</label>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      className="input" 
                      rows={3}
                      defaultValue={currentItem.notes}
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'deleteBooking':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Booking</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-500 dark:text-slate-400">
                  Are you sure you want to delete the booking for {getMemberName(currentItem.memberId)} on {formatDateTime(currentItem.startTime)}? This action cannot be undone.
                </p>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleDeleteBooking(currentItem.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );

      case 'viewBooking':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Booking Details</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Member</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{getMemberName(currentItem.memberId)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Desk</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{getDeskName(currentItem.deskId)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Start Time</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDateTime(currentItem.startTime)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">End Time</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{formatDateTime(currentItem.endTime)}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Status</h4>
                    <p className="mt-1">
                      <span className={`badge ${
                        currentItem.status === 'confirmed' ? 'badge-success' :
                        currentItem.status === 'cancelled' ? 'badge-error' :
                        currentItem.status === 'completed' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {currentItem.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Price</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">${currentItem.totalPrice}</p>
                  </div>
                </div>
                
                {currentItem.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400">Notes</h4>
                    <p className="mt-1 text-gray-900 dark:text-white">{currentItem.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  onClick={closeModal}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    closeModal();
                    openModal('editBooking', currentItem);
                  }}
                >
                  Edit Booking
                </button>
              </div>
            </div>
          </div>
        );

      case 'addPayment':
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Payment</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddPayment}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="memberId">Member</label>
                    <select id="memberId" name="memberId" className="input" required>
                      <option value="">Select a member</option>
                      {members.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="amount">Amount</label>
                    <input id="amount" name="amount" type="number" min="0" step="0.01" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="date">Date</label>
                    <input 
                      id="date" 
                      name="date" 
                      type="date" 
                      className="input" 
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="type">Type</label>
                    <select id="type" name="type" className="input" required>
                      <option value="membership">Membership</option>
                      <option value="booking">Booking</option>
                      <option value="additional">Additional</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select id="status" name="status" className="input" required>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="reference">Reference</label>
                    <input id="reference" name="reference" type="text" className="input" />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'editPayment':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Payment</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdatePayment}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label">Member</label>
                    <p className="text-gray-700 dark:text-slate-300">{getMemberName(currentItem.memberId)}</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="amount">Amount</label>
                    <input 
                      id="amount" 
                      name="amount" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      className="input" 
                      defaultValue={currentItem.amount}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="date">Date</label>
                    <input 
                      id="date" 
                      name="date" 
                      type="date" 
                      className="input" 
                      defaultValue={currentItem.date}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <p className="text-gray-700 dark:text-slate-300">{currentItem.type}</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select 
                      id="status" 
                      name="status" 
                      className="input" 
                      defaultValue={currentItem.status}
                      required
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="reference">Reference</label>
                    <input 
                      id="reference" 
                      name="reference" 
                      type="text" 
                      className="input" 
                      defaultValue={currentItem.reference || ''}
                    />
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'deletePayment':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Payment</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-500 dark:text-slate-400">
                  Are you sure you want to delete the payment of ${currentItem.amount} made on {formatDate(currentItem.date)}? This action cannot be undone.
                </p>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleDeletePayment(currentItem.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );

      case 'addAmenity':
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Amenity</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddAmenity}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input id="name" name="name" type="text" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="type">Type</label>
                    <select id="type" name="type" className="input" required>
                      <option value="furniture">Furniture</option>
                      <option value="technology">Technology</option>
                      <option value="food">Food</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="pricePerUse">Price Per Use</label>
                    <input id="pricePerUse" name="pricePerUse" type="number" min="0" step="0.01" className="input" required />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="available">Available</label>
                    <select id="available" name="available" className="input" required>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Amenity
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'editAmenity':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Amenity</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateAmenity}>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input 
                      id="name" 
                      name="name" 
                      type="text" 
                      className="input" 
                      defaultValue={currentItem.name}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="type">Type</label>
                    <select 
                      id="type" 
                      name="type" 
                      className="input" 
                      defaultValue={currentItem.type}
                      required
                    >
                      <option value="furniture">Furniture</option>
                      <option value="technology">Technology</option>
                      <option value="food">Food</option>
                      <option value="service">Service</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="pricePerUse">Price Per Use</label>
                    <input 
                      id="pricePerUse" 
                      name="pricePerUse" 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      className="input" 
                      defaultValue={currentItem.pricePerUse}
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="available">Available</label>
                    <select 
                      id="available" 
                      name="available" 
                      className="input" 
                      defaultValue={currentItem.available.toString()}
                      required
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Amenity
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case 'deleteAmenity':
        if (!currentItem) return null;
        return (
          <div className="modal-backdrop">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Amenity</h3>
                <button 
                  className="text-gray-400 hover:text-gray-500" 
                  onClick={closeModal}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-500 dark:text-slate-400">
                  Are you sure you want to delete {currentItem.name}? This action cannot be undone.
                </p>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn bg-red-600 text-white hover:bg-red-700"
                  onClick={() => handleDeleteAmenity(currentItem.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow dark:bg-slate-800 theme-transition">
        <div className="container-fluid py-4 flex-between">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <Sofa className="mr-2" size={24} /> CoWork Space Manager
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="absolute inset-0 flex items-center justify-center">
                {isDarkMode ? <Sun className="h-4 w-4 text-gray-400" /> : <Moon className="h-4 w-4 text-gray-600" />}
              </span>
              <span className="theme-toggle-thumb"></span>
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline-block">
              Admin
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 theme-transition-all overflow-hidden">
        {/* Sidebar for desktop */}
        <aside 
          className={`bg-gray-100 dark:bg-slate-900 w-64 flex-shrink-0 hidden md:block theme-transition transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:static absolute inset-y-0 left-0 z-[50]`}
        >
          <nav className="p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`w-full flex items-center space-x-2 px-4 py-3 rounded-md transition-colors ${activeTab === tab.id ? 'bg-primary-100 text-primary-600 dark:bg-slate-700 dark:text-white' : 'hover:bg-gray-200 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                  setSortConfig(null);
                  setFilterConfig({});
                  setIsMobileMenuOpen(false);
                }}
                aria-label={`View ${tab.name}`}
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[40]"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          ></div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-slate-950 theme-transition">
          <div className="container-wide pb-12">
            {renderContent()}
          </div>
          
          {/* Render modals outside of the content area */}
          {renderModal()}
          {renderFilterModal()}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 py-4 shadow-inner theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;