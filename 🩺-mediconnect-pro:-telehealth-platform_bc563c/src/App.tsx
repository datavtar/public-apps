import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  User, Calendar, Video, FileText, Stethoscope, Settings, 
  Plus, Search, Filter, Download, Upload, Users, 
  Pill, Heart, Activity, Clock, Phone, MessageCircle,
  ChartLine, TrendingUp, Shield, Eye, Moon, Sun,
  Bell, AlertCircle, CheckCircle, XCircle, Edit,
  Trash2, Camera, Mic, MicOff, VideoOff, Monitor,
  Timer, Star, Award, Target, Database, Lock, LogOut, Brain, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types and Interfaces
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  currentMedications: string[];
  vitals: VitalSigns[];
  riskLevel: 'low' | 'medium' | 'high';
  lastConsultation: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
  profileImage?: string;
}

interface VitalSigns {
  id: string;
  patientId: string;
  date: string;
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  oxygenSaturation: number;
  bloodSugar?: number;
  notes: string;
}

interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'audio' | 'chat';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes: string;
  diagnosis: string;
  treatment: string;
  followUp: string;
  prescriptions: string[];
  recordingUrl?: string;
  rating?: number;
  feedback?: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  consultationId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: Medication[];
  instructions: string;
  status: 'active' | 'completed' | 'cancelled';
  refillsRemaining: number;
  pharmacyInfo?: string;
  notes: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
  sideEffects: string[];
  interactions: string[];
  category: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  reason: string;
  notes: string;
  reminder: boolean;
}

interface Settings {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    appointments: boolean;
    prescriptions: boolean;
    emergencies: boolean;
  };
  consultationDefaults: {
    duration: number;
    recordConsultations: boolean;
    requireFollowUp: boolean;
  };
  prescriptionDefaults: {
    pharmacy: string;
    defaultRefills: number;
    requireApproval: boolean;
  };
  security: {
    sessionTimeout: number;
    twoFactorAuth: boolean;
    auditLog: boolean;
  };
}

// Custom hook for dark mode
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

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [settings, setSettings] = useState<Settings>({
    language: 'en',
    timezone: 'UTC',
    theme: 'system',
    notifications: {
      email: true,
      sms: true,
      push: true,
      appointments: true,
      prescriptions: true,
      emergencies: true,
    },
    consultationDefaults: {
      duration: 30,
      recordConsultations: true,
      requireFollowUp: false,
    },
    prescriptionDefaults: {
      pharmacy: 'Central Pharmacy',
      defaultRefills: 2,
      requireApproval: true,
    },
    security: {
      sessionTimeout: 60,
      twoFactorAuth: false,
      auditLog: true,
    },
  });

  // AI Integration State
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Modal and Form States
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Form States
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    emergencyContact: '',
    medicalHistory: [],
    allergies: [],
    currentMedications: [],
    riskLevel: 'low',
    status: 'active'
  });

  const [newConsultation, setNewConsultation] = useState<Partial<Consultation>>({
    patientId: '',
    date: '',
    time: '',
    duration: 30,
    type: 'video',
    reason: '',
    notes: '',
    status: 'scheduled'
  });

  const [newPrescription, setNewPrescription] = useState<Partial<Prescription>>({
    patientId: '',
    consultationId: '',
    medications: [],
    instructions: '',
    refillsRemaining: 2,
    notes: '',
    status: 'active'
  });

  // Video call simulation state
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedPatients = localStorage.getItem('mediconnect_patients');
      const savedConsultations = localStorage.getItem('mediconnect_consultations');
      const savedPrescriptions = localStorage.getItem('mediconnect_prescriptions');
      const savedAppointments = localStorage.getItem('mediconnect_appointments');
      const savedVitals = localStorage.getItem('mediconnect_vitals');
      const savedSettings = localStorage.getItem('mediconnect_settings');

      if (savedPatients) setPatients(JSON.parse(savedPatients));
      if (savedConsultations) setConsultations(JSON.parse(savedConsultations));
      if (savedPrescriptions) setPrescriptions(JSON.parse(savedPrescriptions));
      if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
      if (savedVitals) setVitals(JSON.parse(savedVitals));
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      // Initialize with sample data if none exists
      if (!savedPatients) initializeSampleData();
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      initializeSampleData();
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('mediconnect_patients', JSON.stringify(patients));
    } catch (error) {
      console.error('Error saving patients to localStorage:', error);
    }
  }, [patients]);

  useEffect(() => {
    try {
      localStorage.setItem('mediconnect_consultations', JSON.stringify(consultations));
    } catch (error) {
      console.error('Error saving consultations to localStorage:', error);
    }
  }, [consultations]);

  useEffect(() => {
    try {
      localStorage.setItem('mediconnect_prescriptions', JSON.stringify(prescriptions));
    } catch (error) {
      console.error('Error saving prescriptions to localStorage:', error);
    }
  }, [prescriptions]);

  useEffect(() => {
    try {
      localStorage.setItem('mediconnect_vitals', JSON.stringify(vitals));
    } catch (error) {
      console.error('Error saving vitals to localStorage:', error);
    }
  }, [vitals]);

  useEffect(() => {
    try {
      localStorage.setItem('mediconnect_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }, [settings]);

  // Video call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showVideoCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showVideoCall]);

  const initializeSampleData = () => {
    const samplePatients: Patient[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        dateOfBirth: '1985-03-15',
        gender: 'male',
        address: '123 Main St, City, State 12345',
        emergencyContact: 'Jane Smith - +1-555-0124',
        medicalHistory: ['Hypertension', 'Diabetes Type 2'],
        allergies: ['Penicillin', 'Nuts'],
        currentMedications: ['Metformin 500mg', 'Lisinopril 10mg'],
        vitals: [],
        riskLevel: 'medium',
        lastConsultation: '2025-06-10',
        nextAppointment: '2025-06-15',
        status: 'active'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0125',
        dateOfBirth: '1992-07-22',
        gender: 'female',
        address: '456 Oak Ave, City, State 12345',
        emergencyContact: 'Mike Johnson - +1-555-0126',
        medicalHistory: ['Asthma'],
        allergies: ['Shellfish'],
        currentMedications: ['Albuterol Inhaler'],
        vitals: [],
        riskLevel: 'low',
        lastConsultation: '2025-06-08',
        status: 'active'
      },
      {
        id: '3',
        name: 'Robert Davis',
        email: 'robert.davis@email.com',
        phone: '+1-555-0127',
        dateOfBirth: '1978-11-30',
        gender: 'male',
        address: '789 Pine St, City, State 12345',
        emergencyContact: 'Lisa Davis - +1-555-0128',
        medicalHistory: ['Heart Disease', 'High Cholesterol'],
        allergies: ['Sulfa'],
        currentMedications: ['Atorvastatin 20mg', 'Carvedilol 6.25mg'],
        vitals: [],
        riskLevel: 'high',
        lastConsultation: '2025-06-09',
        nextAppointment: '2025-06-12',
        status: 'active'
      }
    ];

    const sampleVitals: VitalSigns[] = [
      {
        id: '1',
        patientId: '1',
        date: '2025-06-10',
        bloodPressure: '140/90',
        heartRate: 78,
        temperature: 98.6,
        weight: 185,
        height: 72,
        oxygenSaturation: 98,
        bloodSugar: 145,
        notes: 'Slightly elevated BP, continue monitoring'
      },
      {
        id: '2',
        patientId: '2',
        date: '2025-06-08',
        bloodPressure: '115/75',
        heartRate: 68,
        temperature: 98.4,
        weight: 135,
        height: 65,
        oxygenSaturation: 99,
        notes: 'All vitals within normal range'
      },
      {
        id: '3',
        patientId: '3',
        date: '2025-06-09',
        bloodPressure: '160/95',
        heartRate: 85,
        temperature: 98.7,
        weight: 205,
        height: 70,
        oxygenSaturation: 96,
        notes: 'Elevated BP, adjust medication'
      }
    ];

    const sampleConsultations: Consultation[] = [
      {
        id: '1',
        patientId: '1',
        patientName: 'John Smith',
        doctorId: currentUser?.id || 'doc1',
        doctorName: currentUser?.first_name + ' ' + currentUser?.last_name || 'Dr. Johnson',
        date: '2025-06-10',
        time: '10:00',
        duration: 30,
        type: 'video',
        status: 'completed',
        reason: 'Routine Follow-up',
        notes: 'Patient reports feeling well. Blood pressure slightly elevated.',
        diagnosis: 'Hypertension - well controlled',
        treatment: 'Continue current medications, monitor BP',
        followUp: 'Follow up in 2 weeks',
        prescriptions: ['prescription-1'],
        rating: 5
      },
      {
        id: '2',
        patientId: '2',
        patientName: 'Sarah Johnson',
        doctorId: currentUser?.id || 'doc1',
        doctorName: currentUser?.first_name + ' ' + currentUser?.last_name || 'Dr. Johnson',
        date: '2025-06-15',
        time: '14:30',
        duration: 30,
        type: 'video',
        status: 'scheduled',
        reason: 'Asthma Check-up',
        notes: '',
        diagnosis: '',
        treatment: '',
        followUp: '',
        prescriptions: []
      }
    ];

    const samplePrescriptions: Prescription[] = [
      {
        id: 'prescription-1',
        patientId: '1',
        patientName: 'John Smith',
        consultationId: '1',
        doctorId: currentUser?.id || 'doc1',
        doctorName: currentUser?.first_name + ' ' + currentUser?.last_name || 'Dr. Johnson',
        date: '2025-06-10',
        medications: [
          {
            id: 'med-1',
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '30 days',
            quantity: 60,
            instructions: 'Take with meals',
            sideEffects: ['Nausea', 'Diarrhea'],
            interactions: ['Alcohol'],
            category: 'Diabetes'
          }
        ],
        instructions: 'Continue current diabetes management plan',
        status: 'active',
        refillsRemaining: 2,
        pharmacyInfo: 'Central Pharmacy - 555-0100',
        notes: 'Patient tolerating medication well'
      }
    ];

    setPatients(samplePatients);
    setVitals(sampleVitals);
    setConsultations(sampleConsultations);
    setPrescriptions(samplePrescriptions);
  };

  // AI Integration Functions
  const handleAiAnalysis = async (prompt: string, file?: File) => {
    if (!prompt?.trim() && !file) {
      setAiError("Please provide input for AI analysis.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const analyzeSymptoms = () => {
    const prompt = `Analyze the following patient symptoms and provide clinical insights. Return JSON with keys "possible_conditions", "urgency_level", "recommended_tests", "treatment_suggestions", "follow_up_needed". Patient symptoms: ${aiPrompt}`;
    handleAiAnalysis(prompt);
  };

  const analyzePrescriptionInteractions = (medications: string[]) => {
    const prompt = `Check for drug interactions and provide safety assessment. Return JSON with keys "interactions_found", "severity_level", "warnings", "recommendations", "safe_to_prescribe". Medications: ${medications.join(', ')}`;
    handleAiAnalysis(prompt);
  };

  const analyzePatientRisk = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const prompt = `Assess patient risk level based on medical history and current conditions. Return JSON with keys "risk_level", "risk_factors", "preventive_measures", "monitoring_frequency", "urgent_concerns". Patient data: Medical History: ${patient.medicalHistory.join(', ')}, Current Medications: ${patient.currentMedications.join(', ')}, Allergies: ${patient.allergies.join(', ')}`;
    handleAiAnalysis(prompt);
  };

  // Patient Management Functions
  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.email || !newPatient.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const patient: Patient = {
      id: Date.now().toString(),
      name: newPatient.name,
      email: newPatient.email,
      phone: newPatient.phone,
      dateOfBirth: newPatient.dateOfBirth || '',
      gender: newPatient.gender || 'male',
      address: newPatient.address || '',
      emergencyContact: newPatient.emergencyContact || '',
      medicalHistory: newPatient.medicalHistory || [],
      allergies: newPatient.allergies || [],
      currentMedications: newPatient.currentMedications || [],
      vitals: [],
      riskLevel: newPatient.riskLevel || 'low',
      lastConsultation: '',
      status: 'active'
    };

    setPatients([...patients, patient]);
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      emergencyContact: '',
      medicalHistory: [],
      allergies: [],
      currentMedications: [],
      riskLevel: 'low',
      status: 'active'
    });
    setShowPatientModal(false);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setNewPatient(patient);
    setShowPatientModal(true);
  };

  const handleUpdatePatient = () => {
    if (!editingPatient || !newPatient.name || !newPatient.email || !newPatient.phone) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedPatient: Patient = {
      ...editingPatient,
      ...newPatient
    } as Patient;

    setPatients(patients.map(p => p.id === editingPatient.id ? updatedPatient : p));
    setEditingPatient(null);
    setNewPatient({
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: '',
      emergencyContact: '',
      medicalHistory: [],
      allergies: [],
      currentMedications: [],
      riskLevel: 'low',
      status: 'active'
    });
    setShowPatientModal(false);
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter(p => p.id !== patientId));
    // Also remove related data
    setConsultations(consultations.filter(c => c.patientId !== patientId));
    setPrescriptions(prescriptions.filter(p => p.patientId !== patientId));
    setVitals(vitals.filter(v => v.patientId !== patientId));
  };

  // Consultation Management Functions
  const handleAddConsultation = () => {
    if (!newConsultation.patientId || !newConsultation.date || !newConsultation.time || !newConsultation.reason) {
      alert('Please fill in all required fields');
      return;
    }

    const patient = patients.find(p => p.id === newConsultation.patientId);
    if (!patient) {
      alert('Selected patient not found');
      return;
    }

    const consultation: Consultation = {
      id: Date.now().toString(),
      patientId: newConsultation.patientId,
      patientName: patient.name,
      doctorId: currentUser?.id || 'doc1',
      doctorName: currentUser?.first_name + ' ' + currentUser?.last_name || 'Dr. Johnson',
      date: newConsultation.date,
      time: newConsultation.time || '',
      duration: newConsultation.duration || 30,
      type: newConsultation.type || 'video',
      status: 'scheduled',
      reason: newConsultation.reason || '',
      notes: newConsultation.notes || '',
      diagnosis: '',
      treatment: '',
      followUp: '',
      prescriptions: []
    };

    setConsultations([...consultations, consultation]);
    setNewConsultation({
      patientId: '',
      date: '',
      time: '',
      duration: 30,
      type: 'video',
      reason: '',
      notes: '',
      status: 'scheduled'
    });
    setShowConsultationModal(false);
  };

  const handleStartVideoCall = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setShowVideoCall(true);
    setCallDuration(0);
    
    // Update consultation status
    const updatedConsultations = consultations.map(c =>
      c.id === consultation.id ? { ...c, status: 'in-progress' as const } : c
    );
    setConsultations(updatedConsultations);
  };

  const handleEndVideoCall = () => {
    if (selectedConsultation) {
      // Update consultation status
      const updatedConsultations = consultations.map(c =>
        c.id === selectedConsultation.id ? { ...c, status: 'completed' as const } : c
      );
      setConsultations(updatedConsultations);
    }
    
    setShowVideoCall(false);
    setSelectedConsultation(null);
    setCallDuration(0);
    setIsRecording(false);
  };

  // Export Functions
  const exportPatientsCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Date of Birth', 'Gender', 'Risk Level', 'Last Consultation', 'Status'];
    const rows = patients.map(p => [
      p.name,
      p.email,
      p.phone,
      p.dateOfBirth,
      p.gender,
      p.riskLevel,
      p.lastConsultation,
      p.status
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patients.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportConsultationsCSV = () => {
    const headers = ['Patient', 'Doctor', 'Date', 'Time', 'Type', 'Status', 'Reason', 'Diagnosis'];
    const rows = consultations.map(c => [
      c.patientName,
      c.doctorName,
      c.date,
      c.time,
      c.type,
      c.status,
      c.reason,
      c.diagnosis
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consultations.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Utility Functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPatientAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'scheduled':
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled':
      case 'inactive': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'no-show': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Filter functions
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = consultation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
    const matchesDate = !dateFilter || consultation.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const upcomingConsultations = consultations.filter(c => 
    c.status === 'scheduled' && new Date(c.date + 'T' + c.time) > new Date()
  ).slice(0, 5);

  const todayConsultations = consultations.filter(c => 
    c.date === new Date().toISOString().split('T')[0]
  );

  // Dashboard Statistics
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'active').length;
  const highRiskPatients = patients.filter(p => p.riskLevel === 'high').length;
  const todayConsultationsCount = todayConsultations.length;
  const completedConsultations = consultations.filter(c => c.status === 'completed').length;
  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-pulse">
            <Stethoscope className="mx-auto h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading MediConnect Pro...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">MediConnect Pro</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Telemedicine Platform</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Toggle dark mode"
              >
                {isDark ? <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
              </button>
              
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dr. {currentUser.first_name} {currentUser.last_name}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav id="generation_issue_fallback" className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Monitor },
              { id: 'consultations', label: 'Consultations', icon: Video },
              { id: 'patients', label: 'Patients', icon: Users },
              { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="heading-2 text-gray-900 dark:text-white">Dashboard</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Total Patients</p>
                    <p className="stat-value">{totalPatients}</p>
                    <p className="stat-change stat-increase">+{activePatients} active</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Today's Consultations</p>
                    <p className="stat-value">{todayConsultationsCount}</p>
                    <p className="stat-change">{completedConsultations} total completed</p>
                  </div>
                  <Video className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">High Risk Patients</p>
                    <p className="stat-value">{highRiskPatients}</p>
                    <p className="stat-change stat-decrease">Needs attention</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Active Prescriptions</p>
                    <p className="stat-value">{activePrescriptions}</p>
                    <p className="stat-change">Current medications</p>
                  </div>
                  <Pill className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity and Upcoming Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Consultations */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Upcoming Consultations
                  </h3>
                </div>
                <div className="card-body">
                  {upcomingConsultations.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingConsultations.map((consultation) => (
                        <div key={consultation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{consultation.patientName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {consultation.date} at {consultation.time} - {consultation.reason}
                            </p>
                          </div>
                          <button
                            onClick={() => handleStartVideoCall(consultation)}
                            className="btn btn-primary btn-sm"
                          >
                            <Video className="h-4 w-4" />
                            Start
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No upcoming consultations</p>
                  )}
                </div>
              </div>

              {/* High Risk Patients */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                    High Risk Patients
                  </h3>
                </div>
                <div className="card-body">
                  {patients.filter(p => p.riskLevel === 'high').length > 0 ? (
                    <div className="space-y-4">
                      {patients.filter(p => p.riskLevel === 'high').slice(0, 5).map((patient) => (
                        <div key={patient.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {patient.medicalHistory.join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => analyzePatientRisk(patient.id)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Activity className="h-4 w-4" />
                            Analyze
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No high risk patients</p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Assistant Panel */}
            <div className="card">
              <div className="card-header">
                <h3 className="heading-5 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  AI Clinical Assistant
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={analyzeSymptoms}
                    className="btn btn-secondary justify-start"
                    disabled={isAiLoading}
                  >
                    <Stethoscope className="h-4 w-4" />
                    Analyze Symptoms
                  </button>
                  <button
                    onClick={() => analyzePrescriptionInteractions(['Metformin', 'Lisinopril'])}
                    className="btn btn-secondary justify-start"
                    disabled={isAiLoading}
                  >
                    <Pill className="h-4 w-4" />
                    Check Drug Interactions
                  </button>
                  <button
                    onClick={() => analyzePatientRisk('1')}
                    className="btn btn-secondary justify-start"
                    disabled={isAiLoading}
                  >
                    <Shield className="h-4 w-4" />
                    Risk Assessment
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Describe symptoms or clinical question:</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="textarea"
                    rows={3}
                    placeholder="Enter patient symptoms, clinical questions, or upload medical documents for AI analysis..."
                  />
                </div>

                <div className="flex gap-4">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="input"
                    accept=".pdf,.jpg,.jpeg,.png,.txt"
                  />
                  <button
                    onClick={() => handleAiAnalysis(aiPrompt, selectedFile || undefined)}
                    className="btn btn-primary"
                    disabled={isAiLoading || (!aiPrompt.trim() && !selectedFile)}
                  >
                    {isAiLoading ? 'Analyzing...' : 'Analyze with AI'}
                  </button>
                </div>

                {isAiLoading && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    AI is analyzing the clinical data...
                  </div>
                )}

                {aiError && (
                  <div className="alert alert-error">
                    <AlertCircle className="h-4 w-4" />
                    <p>{aiError}</p>
                  </div>
                )}

                {aiResult && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">AI Clinical Insights:</h4>
                    <div className="prose prose-sm dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiResult}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="heading-2 text-gray-900 dark:text-white">Consultations</h2>
              <button
                onClick={() => setShowConsultationModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Schedule Consultation
              </button>
            </div>

            {/* Search and Filters */}
            <div className="card card-padding">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Search consultations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select"
                  >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <button
                    onClick={exportConsultationsCSV}
                    className="btn btn-secondary w-full"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Consultations List */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Patient</th>
                      <th className="table-header-cell">Date & Time</th>
                      <th className="table-header-cell">Type</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Reason</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {filteredConsultations.map((consultation) => (
                      <tr key={consultation.id} className="table-row">
                        <td className="table-cell">
                          <div className="font-medium">{consultation.patientName}</div>
                        </td>
                        <td className="table-cell">
                          <div>{consultation.date}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{consultation.time}</div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            {consultation.type === 'video' && <Video className="h-4 w-4" />}
                            {consultation.type === 'audio' && <Phone className="h-4 w-4" />}
                            {consultation.type === 'chat' && <MessageCircle className="h-4 w-4" />}
                            {consultation.type}
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(consultation.status)}`}>
                            {consultation.status}
                          </span>
                        </td>
                        <td className="table-cell">{consultation.reason}</td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            {consultation.status === 'scheduled' && (
                              <button
                                onClick={() => handleStartVideoCall(consultation)}
                                className="btn btn-primary btn-sm"
                              >
                                <Video className="h-4 w-4" />
                                Start
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingConsultation(consultation);
                                setNewConsultation(consultation);
                                setShowConsultationModal(true);
                              }}
                              className="btn btn-secondary btn-sm"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="heading-2 text-gray-900 dark:text-white">Patients</h2>
              <button
                onClick={() => setShowPatientModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Patient
              </button>
            </div>

            {/* Search and Filters */}
            <div className="card card-padding">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <button
                    onClick={exportPatientsCSV}
                    className="btn btn-secondary w-full"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
                <div className="form-group">
                  <input
                    type="file"
                    accept=".csv"
                    className="input"
                    onChange={(e) => {
                      // Handle CSV import
                      const file = e.target.files?.[0];
                      if (file) {
                        // Implementation for CSV import would go here
                        alert('CSV import functionality - upload patients data');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="card card-padding space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar avatar-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Age {getPatientAge(patient.dateOfBirth)} • {patient.gender}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${getRiskLevelColor(patient.riskLevel)}`}>
                      {patient.riskLevel} risk
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Last: {patient.lastConsultation || 'Never'}
                      </span>
                    </div>
                    {patient.nextAppointment && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-green-400" />
                        <span className="text-green-600 dark:text-green-400">
                          Next: {patient.nextAppointment}
                        </span>
                      </div>
                    )}
                  </div>

                  {patient.medicalHistory.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical History:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.medicalHistory.slice(0, 2).map((condition, index) => (
                          <span key={index} className="badge badge-gray text-xs">
                            {condition}
                          </span>
                        ))}
                        {patient.medicalHistory.length > 2 && (
                          <span className="badge badge-gray text-xs">
                            +{patient.medicalHistory.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSelectedPatient(patient);
                        setNewConsultation({ ...newConsultation, patientId: patient.id });
                        setShowConsultationModal(true);
                      }}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      <Video className="h-4 w-4" />
                      Consult
                    </button>
                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id)}
                      className="btn btn-error btn-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="heading-2 text-gray-900 dark:text-white">Prescriptions</h2>
              <button
                onClick={() => setShowPrescriptionModal(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                New Prescription
              </button>
            </div>

            {/* AI Drug Interaction Checker */}
            <div className="card">
              <div className="card-header">
                <h3 className="heading-5 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  AI Drug Interaction Checker
                </h3>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Enter medications to check for interactions:</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="textarea"
                    rows={2}
                    placeholder="Enter medication names separated by commas (e.g., Metformin, Lisinopril, Aspirin)"
                  />
                </div>
                <button
                  onClick={() => {
                    const medications = aiPrompt.split(',').map(m => m.trim()).filter(m => m);
                    if (medications.length > 0) {
                      analyzePrescriptionInteractions(medications);
                    }
                  }}
                  className="btn btn-primary"
                  disabled={isAiLoading || !aiPrompt.trim()}
                >
                  {isAiLoading ? 'Checking...' : 'Check Interactions'}
                </button>

                {aiResult && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">Interaction Analysis:</h4>
                    <div className="prose prose-sm dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiResult}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prescriptions List */}
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="card">
                  <div className="card-header">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="heading-6">{prescription.patientName}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Prescribed by {prescription.doctorName} on {prescription.date}
                        </p>
                      </div>
                      <span className={`badge ${getStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </div>
                  </div>
                  <div className="card-body space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {prescription.medications.map((medication) => (
                        <div key={medication.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white">{medication.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{medication.dosage}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{medication.frequency}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Duration: {medication.duration}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {medication.quantity}</p>
                          {medication.instructions && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{medication.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    {prescription.instructions && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Instructions:</h4>
                        <p className="text-gray-600 dark:text-gray-400">{prescription.instructions}</p>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Refills remaining: {prescription.refillsRemaining}
                      </div>
                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm">
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button className="btn btn-primary btn-sm">
                          <Download className="h-4 w-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="heading-2 text-gray-900 dark:text-white">Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* General Settings */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5">General Settings</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="select"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="select"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Theme</label>
                    <select
                      value={settings.theme}
                      onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' | 'system' })}
                      className="select"
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5">Notifications</h3>
                </div>
                <div className="card-body space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="form-label mb-0 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <div className={`toggle ${value ? 'toggle-checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              [key]: e.target.checked
                            }
                          })}
                          className="sr-only"
                        />
                        <div className="toggle-thumb"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Settings */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5 flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="form-group">
                    <label className="form-label">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          sessionTimeout: parseInt(e.target.value) || 60
                        }
                      })}
                      className="input"
                      min="15"
                      max="480"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="form-label mb-0">Two-Factor Authentication</label>
                    <div className={`toggle ${settings.security.twoFactorAuth ? 'toggle-checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            twoFactorAuth: e.target.checked
                          }
                        })}
                        className="sr-only"
                      />
                      <div className="toggle-thumb"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="form-label mb-0">Audit Logging</label>
                    <div className={`toggle ${settings.security.auditLog ? 'toggle-checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={settings.security.auditLog}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: {
                            ...settings.security,
                            auditLog: e.target.checked
                          }
                        })}
                        className="sr-only"
                      />
                      <div className="toggle-thumb"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5 flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Management
                  </h3>
                </div>
                <div className="card-body space-y-4">
                  <button
                    onClick={() => {
                      const data = {
                        patients,
                        consultations,
                        prescriptions,
                        vitals,
                        settings
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'mediconnect-backup.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="btn btn-secondary w-full"
                  >
                    <Download className="h-4 w-4" />
                    Export All Data
                  </button>
                  <button
                    onClick={() => {
                      const confirmed = confirm('Are you sure you want to delete all data? This action cannot be undone.');
                      if (confirmed) {
                        localStorage.clear();
                        setPatients([]);
                        setConsultations([]);
                        setPrescriptions([]);
                        setVitals([]);
                        alert('All data has been cleared.');
                      }
                    }}
                    className="btn btn-error w-full"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Video Call Modal */}
      {showVideoCall && selectedConsultation && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-4xl">
            <div className="p-6 bg-gray-900 text-white rounded-t-lg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Video Consultation</h3>
                  <p className="text-gray-300">{selectedConsultation.patientName}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono">{formatTime(callDuration)}</div>
                  {isRecording && (
                    <div className="flex items-center gap-1 text-red-400">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Recording
                    </div>
                  )}
                </div>
              </div>

              {/* Video Area */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                  {isVideoEnabled ? (
                    <div className="text-center">
                      <User className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400">Patient Video</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <VideoOff className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400">Video Off</p>
                    </div>
                  )}
                </div>
                <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                  {isVideoEnabled ? (
                    <div className="text-center">
                      <User className="h-16 w-16 mx-auto mb-2 text-blue-400" />
                      <p className="text-gray-400">Your Video</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <VideoOff className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400">Video Off</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`p-3 rounded-full ${
                    isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                  } transition-colors`}
                >
                  {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  className={`p-3 rounded-full ${
                    isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                  } transition-colors`}
                >
                  {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`p-3 rounded-full ${
                    isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  } transition-colors`}
                >
                  <Camera className="h-5 w-5" />
                </button>
                <button
                  onClick={handleEndVideoCall}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <Phone className="h-5 w-5 transform rotate-[135deg]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Modal */}
      {showPatientModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="heading-5">
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
              </h3>
              <button
                onClick={() => {
                  setShowPatientModal(false);
                  setEditingPatient(null);
                  setNewPatient({
                    name: '',
                    email: '',
                    phone: '',
                    dateOfBirth: '',
                    gender: 'male',
                    address: '',
                    emergencyContact: '',
                    medicalHistory: [],
                    allergies: [],
                    currentMedications: [],
                    riskLevel: 'low',
                    status: 'active'
                  });
                }}
                className="btn btn-ghost btn-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Full Name</label>
                  <input
                    type="text"
                    value={newPatient.name || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Email</label>
                  <input
                    type="email"
                    value={newPatient.email || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Phone</label>
                  <input
                    type="tel"
                    value={newPatient.phone || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    value={newPatient.dateOfBirth || ''}
                    onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    value={newPatient.gender || 'male'}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
                    className="select"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Risk Level</label>
                  <select
                    value={newPatient.riskLevel || 'low'}
                    onChange={(e) => setNewPatient({ ...newPatient, riskLevel: e.target.value as 'low' | 'medium' | 'high' })}
                    className="select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  value={newPatient.address || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="textarea"
                  rows={2}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input
                  type="text"
                  value={newPatient.emergencyContact || ''}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                  className="input"
                  placeholder="Name - Phone"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowPatientModal(false);
                  setEditingPatient(null);
                  setNewPatient({
                    name: '',
                    email: '',
                    phone: '',
                    dateOfBirth: '',
                    gender: 'male',
                    address: '',
                    emergencyContact: '',
                    medicalHistory: [],
                    allergies: [],
                    currentMedications: [],
                    riskLevel: 'low',
                    status: 'active'
                  });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={editingPatient ? handleUpdatePatient : handleAddPatient}
                className="btn btn-primary"
              >
                {editingPatient ? 'Update Patient' : 'Add Patient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {showConsultationModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="heading-5">Schedule Consultation</h3>
              <button
                onClick={() => {
                  setShowConsultationModal(false);
                  setEditingConsultation(null);
                  setNewConsultation({
                    patientId: '',
                    date: '',
                    time: '',
                    duration: 30,
                    type: 'video',
                    reason: '',
                    notes: '',
                    status: 'scheduled'
                  });
                }}
                className="btn btn-ghost btn-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label form-label-required">Patient</label>
                <select
                  value={newConsultation.patientId || ''}
                  onChange={(e) => setNewConsultation({ ...newConsultation, patientId: e.target.value })}
                  className="select"
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - {patient.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Date</label>
                  <input
                    type="date"
                    value={newConsultation.date || ''}
                    onChange={(e) => setNewConsultation({ ...newConsultation, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label form-label-required">Time</label>
                  <input
                    type="time"
                    value={newConsultation.time || ''}
                    onChange={(e) => setNewConsultation({ ...newConsultation, time: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newConsultation.duration || 30}
                    onChange={(e) => setNewConsultation({ ...newConsultation, duration: parseInt(e.target.value) || 30 })}
                    className="input"
                    min="15"
                    max="120"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    value={newConsultation.type || 'video'}
                    onChange={(e) => setNewConsultation({ ...newConsultation, type: e.target.value as 'video' | 'audio' | 'chat' })}
                    className="select"
                  >
                    <option value="video">Video Call</option>
                    <option value="audio">Audio Call</option>
                    <option value="chat">Chat Only</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Reason for Consultation</label>
                <input
                  type="text"
                  value={newConsultation.reason || ''}
                  onChange={(e) => setNewConsultation({ ...newConsultation, reason: e.target.value })}
                  className="input"
                  placeholder="e.g., Routine checkup, Follow-up, Symptom consultation"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  value={newConsultation.notes || ''}
                  onChange={(e) => setNewConsultation({ ...newConsultation, notes: e.target.value })}
                  className="textarea"
                  rows={3}
                  placeholder="Additional notes or preparation instructions"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowConsultationModal(false);
                  setEditingConsultation(null);
                  setNewConsultation({
                    patientId: '',
                    date: '',
                    time: '',
                    duration: 30,
                    type: 'video',
                    reason: '',
                    notes: '',
                    status: 'scheduled'
                  });
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddConsultation}
                className="btn btn-primary"
              >
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;