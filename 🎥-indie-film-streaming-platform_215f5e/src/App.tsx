import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon, // Aliased to avoid collision with the User interface
  UserPlus,
  Play,
  Upload,
  Film,
  Menu,
  X,
  Star,
  Award,
  Camera,
  ChevronRight,
  TrendingUp,
  Video,
  Zap,
  Search, // Added Search icon
  Phone, // Added Phone icon for contact number
  MessageCircle, // Added MessageCircle icon for Contact Us
  Trophy, // Added Trophy icon for Big Short Challenge
  Edit, // Added Edit icon for profile editing
  Settings, // Added Settings icon for profile settings
  PieChart, // Added PieChart icon for analytics
  LogOut, // Added LogOut icon for signing out
  ChevronDown, // Added ChevronDown icon for dropdown
  BarChart, // Added BarChart icon for analytics
  Image, // Added Image icon for profile picture
  Save, // Added Save icon for saving changes
  Eye, // Added Eye icon for views
  FileText, // Added FileText icon for movie details
  Check, // Added Check icon for verification
  Mail, // Added Mail icon for email
  Globe, // Added Globe icon for language
  AlertCircle // Added AlertCircle icon for child content warning
} from 'lucide-react';
import styles from './styles/styles.module.css';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Legend, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// Define types for the application
type UserRole = 'subscriber' | 'filmmaker' | 'guest';

interface MovieView {
  date: string;
  count: number;
}

interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  shortDescription?: string; // Added short description field
  language?: string; // Added language field
  childFriendly?: boolean; // Added child-friendly field
  category: string;
  year: number;
  rating: number;
  filmmaker: string;
  filmmakerEmail?: string; // Added email reference for filmmaker
  trending: boolean;
  uploadDate: string;
  views: number; // Added total views count
  viewHistory: MovieView[]; // Added view history for analytics
}

interface UserProfile {
  profilePicture: string;
  bannerImage: string;
  bio: string;
}

interface User { // This is the User data interface
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string; // Added phone field
  subscriptionDate?: string;
  verified?: boolean; // Added verification status
  profile?: UserProfile; // Added profile information
  password?: string; // Simplified for demo (in real app, never store plain passwords)
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  verificationRequired?: boolean; // Added for OTP verification flow
}

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string; // Added phone field
  role: UserRole;
}

interface SignInFormData {
  email: string;
  password: string;
}

interface OTPVerification {
  email: string;
  phone: string;
  emailOTP: string;
  phoneOTP: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface EditProfileFormData {
  name: string;
  bio: string;
  phone: string;
  profilePicture: string;
  bannerImage: string;
}

interface Quote {
  text: string;
  movie: string;
  character: string;
}

interface ModalState {
  isOpen: boolean;
  type: 'signIn' | 'signUp' | 'uploadMovie' | 'otpVerification' | 'editMovie' | 'editProfile' | null;
  data?: any; // For passing data to modals, like movie ID for editing
}

interface AnalyticsData {
  month: string;
  subscribers: number;
  filmmakers: number;
  uploads: number;
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface EditMovieFormData {
  id: string;
  title: string;
  description: string;
  shortDescription?: string; // Added short description field for editing
  language?: string; // Added language field for editing
  childFriendly?: boolean; // Added child-friendly field for editing
  category: string;
  year: number;
}

interface DashboardTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const App: React.FC = () => {
  // State management
  const [currentSection, setCurrentSection] = useState<string>('home');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number>(0);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: null,
  });
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '', // Initialize phone field
    role: 'subscriber',
  });
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: '',
    password: '',
  });
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check if user data exists in localStorage
    const storedAuth = localStorage.getItem('filmhubAuth');
    if (storedAuth) {
      try {
        return JSON.parse(storedAuth);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
      }
    }
    return { isAuthenticated: false, user: null };
  });
  const [movies, setMovies] = useState<Movie[]>(() => {
    const storedMovies = localStorage.getItem('filmhubMovies');
    if (storedMovies) {
      try {
        return JSON.parse(storedMovies);
      } catch (error) {
        console.error('Error parsing stored movies:', error);
        return [];
      }
    }
    // Default sample movies if none in localStorage
    return [
      {
        id: '1',
        title: 'The Enchanted Journey',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,fantasy',
        description: 'A young explorer discovers a hidden world of magic and adventure.',
        shortDescription: 'A magical adventure story.',
        language: 'English',
        childFriendly: true,
        category: 'Fantasy',
        year: 2023,
        rating: 4.5,
        filmmaker: 'Sarah Johnson',
        filmmakerEmail: 'sarah@example.com',
        trending: true,
        uploadDate: '2023-10-15',
        views: 1250,
        viewHistory: generateRandomViewData(30),
      },
      {
        id: '2',
        title: 'Last Sunrise',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,drama',
        description: 'A powerful drama about family bonds and redemption.',
        shortDescription: 'A family drama about redemption.',
        language: 'Spanish',
        childFriendly: false,
        category: 'Drama',
        year: 2023,
        rating: 4.8,
        filmmaker: 'Michael Chen',
        filmmakerEmail: 'michael@example.com',
        trending: true,
        uploadDate: '2023-11-02',
        views: 2340,
        viewHistory: generateRandomViewData(30),
      },
      {
        id: '3',
        title: 'Nebula Rising',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,scifi',
        description: 'In a distant galaxy, a lone astronaut fights for survival.',
        shortDescription: 'Space survival story.',
        language: 'English',
        childFriendly: false,
        category: 'Sci-Fi',
        year: 2022,
        rating: 4.3,
        filmmaker: 'Alex Rivera',
        filmmakerEmail: 'alex@example.com',
        trending: true,
        uploadDate: '2022-12-05',
        views: 1820,
        viewHistory: generateRandomViewData(30),
      },
      {
        id: '4',
        title: 'Echoes of Time',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,thriller',
        description: 'A psychological thriller that bends reality and perception.',
        shortDescription: 'Mind-bending psychological thriller.',
        language: 'French',
        childFriendly: false,
        category: 'Thriller',
        year: 2023,
        rating: 4.6,
        filmmaker: 'Elena Petrov',
        filmmakerEmail: 'elena@example.com',
        trending: false,
        uploadDate: '2023-08-22',
        views: 980,
        viewHistory: generateRandomViewData(30),
      },
      {
        id: '5',
        title: 'Urban Rhythms',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,documentary',
        description: 'A documentary exploring underground music scenes around the world.',
        shortDescription: 'Global underground music documentary.',
        language: 'Multiple',
        childFriendly: true,
        category: 'Documentary',
        year: 2022,
        rating: 4.2,
        filmmaker: 'Jamal Wilson',
        filmmakerEmail: 'jamal@example.com',
        trending: false,
        uploadDate: '2022-11-15',
        views: 750,
        viewHistory: generateRandomViewData(30),
      },
      {
        id: '6',
        title: 'Whispering Shadows',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,horror',
        description: 'A haunting tale of supernatural forces in a small town.',
        shortDescription: 'Supernatural horror in a small town.',
        language: 'Japanese',
        childFriendly: false,
        category: 'Horror',
        year: 2023,
        rating: 4.4,
        filmmaker: 'Lena Miyazaki',
        filmmakerEmail: 'lena@example.com',
        trending: true,
        uploadDate: '2023-10-31',
        views: 1560,
        viewHistory: generateRandomViewData(30),
      },
    ];
  });

  // List of languages for the dropdown
  const languages = [
    'Afrikaans', 'Albanian', 'Amharic', 'Arabic', 'Armenian', 'Azerbaijani',
    'Basque', 'Belarusian', 'Bengali', 'Bosnian', 'Bulgarian', 'Burmese',
    'Catalan', 'Cebuano', 'Chichewa', 'Chinese (Simplified)', 'Chinese (Traditional)',
    'Corsican', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Esperanto',
    'Estonian', 'Filipino', 'Finnish', 'French', 'Frisian', 'Galician', 'Georgian',
    'German', 'Greek', 'Gujarati', 'Haitian Creole', 'Hausa', 'Hawaiian', 'Hebrew',
    'Hindi', 'Hmong', 'Hungarian', 'Icelandic', 'Igbo', 'Indonesian', 'Irish', 'Italian',
    'Japanese', 'Javanese', 'Kannada', 'Kazakh', 'Khmer', 'Korean', 'Kurdish (Kurmanji)',
    'Kyrgyz', 'Lao', 'Latin', 'Latvian', 'Lithuanian', 'Luxembourgish', 'Macedonian',
    'Malagasy', 'Malay', 'Malayalam', 'Maltese', 'Maori', 'Marathi', 'Mongolian',
    'Multiple', 'Nepali', 'Norwegian', 'Pashto', 'Persian', 'Polish', 'Portuguese',
    'Punjabi', 'Romanian', 'Russian', 'Samoan', 'Scottish Gaelic', 'Serbian', 'Sesotho',
    'Shona', 'Sindhi', 'Sinhala', 'Slovak', 'Slovenian', 'Somali', 'Spanish', 'Sundanese',
    'Swahili', 'Swedish', 'Tajik', 'Tamil', 'Telugu', 'Thai', 'Turkish', 'Ukrainian',
    'Urdu', 'Uzbek', 'Vietnamese', 'Welsh', 'Xhosa', 'Yiddish', 'Yoruba', 'Zulu'
  ];

  const [users, setUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('filmhubUsers');
    if (storedUsers) {
      try {
        return JSON.parse(storedUsers);
      } catch (error) {
        console.error('Error parsing stored users:', error);
        return [];
      }
    }
    // Default sample users if none in localStorage
    return [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'filmmaker',
        phone: '555-123-4567',
        subscriptionDate: '2023-01-15',
        verified: true,
        profile: {
          profilePicture: 'https://source.unsplash.com/random/200x200?portrait,woman',
          bannerImage: 'https://source.unsplash.com/random/1200x400?film,production',
          bio: 'Award-winning filmmaker with a passion for fantasy and adventure stories.'
        },
        password: 'password123' // For demo only
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael@example.com',
        role: 'filmmaker',
        phone: '555-987-6543',
        subscriptionDate: '2023-02-20',
        verified: true,
        profile: {
          profilePicture: 'https://source.unsplash.com/random/200x200?portrait,man',
          bannerImage: 'https://source.unsplash.com/random/1200x400?cinematography',
          bio: 'Independent filmmaker specializing in emotional dramas and character studies.'
        },
        password: 'password123' // For demo only
      },
      {
        id: '3',
        name: 'Alex Rivera',
        email: 'alex@example.com',
        role: 'filmmaker',
        phone: '555-456-7890',
        subscriptionDate: '2023-03-10',
        verified: true,
        profile: {
          profilePicture: 'https://source.unsplash.com/random/200x200?portrait,person',
          bannerImage: 'https://source.unsplash.com/random/1200x400?science,fiction',
          bio: 'Sci-fi enthusiast creating visually stunning and thought-provoking films.'
        },
        password: 'password123' // For demo only
      },
      {
        id: '4',
        name: 'Elena Petrov',
        email: 'elena@example.com',
        role: 'filmmaker',
        phone: '555-567-8901',
        subscriptionDate: '2023-04-05',
        verified: true,
        profile: {
          profilePicture: 'https://source.unsplash.com/random/200x200?portrait,woman',
          bannerImage: 'https://source.unsplash.com/random/1200x400?thriller,suspense',
          bio: 'Psychological thriller director focused on creating suspenseful, mind-bending narratives.'
        },
        password: 'password123' // For demo only
      },
      {
        id: '5',
        name: 'Jamal Wilson',
        email: 'jamal@example.com',
        role: 'filmmaker',
        phone: '555-234-5678',
        subscriptionDate: '2023-05-12',
        verified: true,
        profile: {
          profilePicture: 'https://source.unsplash.com/random/200x200?portrait,man',
          bannerImage: 'https://source.unsplash.com/random/1200x400?music,documentary',
          bio: 'Documentary filmmaker passionate about capturing authentic stories from around the world.'
        },
        password: 'password123' // For demo only
      },
      {
        id: '6',
        name: 'Lena Miyazaki',
        email: 'lena@example.com',
        role: 'filmmaker',
        phone: '555-345-6789',
        subscriptionDate: '2023-06-08',
        verified: true,
        profile: {
          profilePicture: 'https://source.unsplash.com/random/200x200?portrait,woman',
          bannerImage: 'https://source.unsplash.com/random/1200x400?horror,dark',
          bio: 'Horror film director with a knack for creating atmospheric and chilling experiences.'
        },
        password: 'password123' // For demo only
      }
    ];
  });

  // Function to generate random view data for the past 30 days
  function generateRandomViewData(days: number): MovieView[] {
    const data: MovieView[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 100) + 5 // Random between 5 and 104
      });
    }
    
    return data;
  }

  // Added for filmmaker dashboard
  const [activeDashboardTab, setActiveDashboardTab] = useState<string>('profile');
  const [editProfileData, setEditProfileData] = useState<EditProfileFormData>({
    name: '',
    bio: '',
    phone: '',
    profilePicture: '',
    bannerImage: ''
  });
  const [editMovieData, setEditMovieData] = useState<EditMovieFormData>({
    id: '',
    title: '',
    description: '',
    shortDescription: '',
    language: '',
    childFriendly: false,
    category: '',
    year: 2023
  });
  const [otpVerification, setOtpVerification] = useState<OTPVerification>({
    email: '',
    phone: '',
    emailOTP: '',
    phoneOTP: '',
    emailVerified: false,
    phoneVerified: false
  });

  // Added contact form state
  const [contactFormData, setContactFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [contactFormSubmitted, setContactFormSubmitted] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const [designConfirmed, setDesignConfirmed] = useState<boolean>(false);

  // Movie quotes for banner
  const [quotes] = useState<Quote[]>([
    {
      text: "Life is like a box of chocolates, you never know what you're gonna get.",
      movie: "Forrest Gump",
      character: "Forrest Gump"
    },
    {
      text: "May the Force be with you.",
      movie: "Star Wars",
      character: "Multiple Characters"
    },
    {
      text: "There's no place like home.",
      movie: "The Wizard of Oz",
      character: "Dorothy Gale"
    },
    {
      text: "I'll be back.",
      movie: "The Terminator",
      character: "The Terminator"
    },
    {
      text: "Here's looking at you, kid.",
      movie: "Casablanca",
      character: "Rick Blaine"
    }
  ]);

  // Sample analytics data
  const analyticsData: AnalyticsData[] = [
    { month: 'Jan', subscribers: 65, filmmakers: 12, uploads: 8 },
    { month: 'Feb', subscribers: 78, filmmakers: 15, uploads: 10 },
    { month: 'Mar', subscribers: 90, filmmakers: 18, uploads: 12 },
    { month: 'Apr', subscribers: 105, filmmakers: 22, uploads: 15 },
    { month: 'May', subscribers: 125, filmmakers: 28, uploads: 20 },
    { month: 'Jun', subscribers: 150, filmmakers: 35, uploads: 25 },
  ];

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('filmhubMovies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('filmhubAuth', JSON.stringify(authState));
  }, [authState]);

  useEffect(() => {
    localStorage.setItem('filmhubUsers', JSON.stringify(users));
  }, [users]);

  // Change quotes in banner every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // Close mobile menu when changing sections
  useEffect(() => {
    setMenuOpen(false);
  }, [currentSection]);

  // Initialize edit profile data when user changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role === 'filmmaker') {
      setEditProfileData({
        name: authState.user.name || '',
        bio: authState.user.profile?.bio || '',
        phone: authState.user.phone || '',
        profilePicture: authState.user.profile?.profilePicture || '',
        bannerImage: authState.user.profile?.bannerImage || ''
      });
    }
  }, [authState.isAuthenticated, authState.user]);

  // Handle dark mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle modal keyboard events
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modal.isOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [modal]);

  // Modal handlers
  const openModal = (type: 'signIn' | 'signUp' | 'uploadMovie' | 'otpVerification' | 'editMovie' | 'editProfile', data?: any) => {
    setModal({ isOpen: true, type, data });
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null });
    document.body.classList.remove('modal-open');
  };

  // Phone number validation
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation: at least 10 digits, allowing for formatting characters
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  // Generate OTP code
  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Form handlers
  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear phone error when user types in the phone field
    if (name === 'phone') {
      setPhoneError('');
    }
  };

  const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignInData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(signUpData.phone)) {
      setPhoneError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    // Check if email already exists
    const existingUser = users.find(user => user.email === signUpData.email);
    if (existingUser) {
      alert('This email is already registered. Please use a different email or sign in.');
      return;
    }

    // Generate OTPs for verification
    const emailOTP = generateOTP();
    const phoneOTP = generateOTP();
    
    // In a real app, we would send OTPs to email and phone
    console.log(`Email OTP: ${emailOTP}, Phone OTP: ${phoneOTP}`);
    
    // Set up verification data
    setOtpVerification({
      email: signUpData.email,
      phone: signUpData.phone,
      emailOTP,
      phoneOTP,
      emailVerified: false,
      phoneVerified: false
    });

    // Switch to OTP verification modal
    closeModal();
    openModal('otpVerification');

    // Show OTP values (for demo purposes only)
    alert(`For demo purposes:\n\nEmail OTP: ${emailOTP}\nPhone OTP: ${phoneOTP}`);
  };

  const handleOTPVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const emailOTPInput = form.elements.namedItem('emailOTP') as HTMLInputElement;
    const phoneOTPInput = form.elements.namedItem('phoneOTP') as HTMLInputElement;

    const emailOTPValue = emailOTPInput?.value;
    const phoneOTPValue = phoneOTPInput?.value;

    // Verify OTPs
    const emailVerified = emailOTPValue === otpVerification.emailOTP;
    const phoneVerified = phoneOTPValue === otpVerification.phoneOTP;

    if (!emailVerified || !phoneVerified) {
      alert('One or more OTP codes are incorrect. Please try again.');
      return;
    }

    // Create new user if verification successful
    const defaultBannerImage = signUpData.role === 'filmmaker' 
      ? 'https://source.unsplash.com/random/1200x400?film,production'
      : '';

    const newUser: User = {
      id: Date.now().toString(),
      name: signUpData.name,
      email: signUpData.email,
      phone: signUpData.phone,
      role: signUpData.role,
      subscriptionDate: new Date().toISOString(),
      verified: true,
      password: signUpData.password, // In a real app, this would be hashed
      profile: {
        profilePicture: 'https://source.unsplash.com/random/200x200?portrait,person',
        bannerImage: defaultBannerImage,
        bio: `Hi, I'm ${signUpData.name}!`
      }
    };

    // Add new user to users array
    setUsers(prevUsers => [...prevUsers, newUser]);

    // Log in the new user
    setAuthState({
      isAuthenticated: true,
      user: newUser
    });

    closeModal();
    
    // If filmmaker, redirect to filmmaker dashboard
    if (newUser.role === 'filmmaker') {
      setCurrentSection('dashboard');
    }
    
    alert(`Welcome, ${newUser.name}! Your account has been verified and created successfully.`);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user exists and credentials match
    const user = users.find(u => u.email === signInData.email && u.password === signInData.password);
    
    if (!user) {
      alert('Invalid email or password. Please try again.');
      return;
    }

    setAuthState({
      isAuthenticated: true,
      user: user
    });

    closeModal();
    
    // If filmmaker, redirect to filmmaker dashboard
    if (user.role === 'filmmaker') {
      setCurrentSection('dashboard');
    }
    
    alert(`Welcome back, ${user.name}!`);
  };

  const handleSignOut = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    setCurrentSection('home');
  };

  const handleEditProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user) return;
    
    // Validate phone number
    if (!validatePhoneNumber(editProfileData.phone)) {
      alert('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    const updatedUser: User = {
      ...authState.user,
      name: editProfileData.name,
      phone: editProfileData.phone,
      profile: {
        profilePicture: editProfileData.profilePicture || authState.user.profile?.profilePicture || '',
        bannerImage: editProfileData.bannerImage || authState.user.profile?.bannerImage || '',
        bio: editProfileData.bio
      }
    };

    // Update user in users array
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === authState.user?.id ? updatedUser : user
      )
    );

    // Update auth state
    setAuthState({
      ...authState,
      user: updatedUser
    });

    closeModal();
    alert('Profile updated successfully!');
  };

  const handleUploadMovie = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (!authState.user) return;

    // Get form values
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const shortDescription = formData.get('shortDescription') as string;
    const language = formData.get('language') as string;
    const childFriendly = formData.get('childFriendly') as string === 'yes';
    const category = formData.get('category') as string;
    const year = parseInt(formData.get('year') as string, 10);

    // Validate short description
    if (shortDescription && shortDescription.length > 100) {
      alert('Short description must be less than 100 characters');
      return;
    }

    const newMovie: Movie = {
      id: Date.now().toString(),
      title,
      imageUrl: 'https://source.unsplash.com/random/300x450?movie,' + category.toLowerCase(),
      description,
      shortDescription,
      language,
      childFriendly,
      category,
      year,
      rating: 0, // New uploads start with no rating
      filmmaker: authState.user.name,
      filmmakerEmail: authState.user.email,
      trending: false,
      uploadDate: new Date().toISOString(),
      views: 0,
      viewHistory: [{
        date: new Date().toISOString().split('T')[0],
        count: 0
      }]
    };
    
    setMovies(prevMovies => [newMovie, ...prevMovies]);
    closeModal();
    alert(`"${newMovie.title}" has been successfully uploaded!`);
  };

  const handleEditMovieChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle special fields
    if (name === 'childFriendly') {
      setEditMovieData(prev => ({
        ...prev,
        childFriendly: value === 'yes'
      }));
    } else {
      setEditMovieData(prev => ({
        ...prev,
        [name]: name === 'year' ? parseInt(value, 10) : value
      }));
    }
  };

  const handleEditMovie = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate short description
    if (editMovieData.shortDescription && editMovieData.shortDescription.length > 100) {
      alert('Short description must be less than 100 characters');
      return;
    }

    setMovies(prevMovies => 
      prevMovies.map(movie => 
        movie.id === editMovieData.id
          ? {
              ...movie,
              title: editMovieData.title,
              description: editMovieData.description,
              shortDescription: editMovieData.shortDescription,
              language: editMovieData.language,
              childFriendly: editMovieData.childFriendly,
              category: editMovieData.category,
              year: editMovieData.year
            }
          : movie
      )
    );

    closeModal();
    alert('Movie details updated successfully!');
  };

  // Initialize edit movie data when opening the edit modal
  const handleOpenEditMovie = (movieId: string) => {
    const movieToEdit = movies.find(movie => movie.id === movieId);
    if (!movieToEdit) return;

    setEditMovieData({
      id: movieToEdit.id,
      title: movieToEdit.title,
      description: movieToEdit.description,
      shortDescription: movieToEdit.shortDescription || '',
      language: movieToEdit.language || '',
      childFriendly: movieToEdit.childFriendly || false,
      category: movieToEdit.category,
      year: movieToEdit.year
    });

    openModal('editMovie');
  };

  // Handle contact form changes
  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle contact form submission
  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would send this to an API
    console.log('Contact form submitted:', contactFormData);
    setContactFormSubmitted(true);
    
    // Reset form after submission
    setTimeout(() => {
      setContactFormSubmitted(false);
      setContactFormData({
        name: '',
        email: '',
        message: ''
      });
    }, 5000);
  };

  // Handle design confirmation
  const handleDesignConfirmation = () => {
    setDesignConfirmed(true);
    setTimeout(() => {
      setDesignConfirmed(false);
    }, 3000);
  };

  // Generate dashboard tabs
  const dashboardTabs: DashboardTab[] = [
    { id: 'profile', label: 'Profile', icon: <UserIcon className="mr-2" /> },
    { id: 'movies', label: 'My Movies', icon: <Film className="mr-2" /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart className="mr-2" /> },
    { id: 'upload', label: 'Upload Movie', icon: <Upload className="mr-2" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="mr-2" /> }
  ];

  // Get filmmaker movies
  const getFilmmakerMovies = (): Movie[] => {
    if (!authState.user) return [];
    return movies.filter(movie => movie.filmmakerEmail === authState.user?.email);
  };

  // Get total views for filmmaker
  const getTotalViews = (): number => {
    const filmmakerMovies = getFilmmakerMovies();
    return filmmakerMovies.reduce((total, movie) => total + movie.views, 0);
  };

  // Get aggregated view data for charts
  const getAggregatedViewData = (): {date: string, views: number}[] => {
    const filmmakerMovies = getFilmmakerMovies();
    const viewsByDate: {[key: string]: number} = {};
    
    // Collect all dates and sum the views
    filmmakerMovies.forEach(movie => {
      movie.viewHistory.forEach(dayData => {
        if (!viewsByDate[dayData.date]) {
          viewsByDate[dayData.date] = 0;
        }
        viewsByDate[dayData.date] += dayData.count;
      });
    });
    
    // Convert to array format for charts
    const result = Object.entries(viewsByDate).map(([date, views]) => ({
      date,
      views
    }));
    
    // Sort by date
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get pie chart data for category distribution
  const getCategoryDistributionData = (): {name: string, value: number}[] => {
    const filmmakerMovies = getFilmmakerMovies();
    const categoryCounts: {[key: string]: number} = {};
    
    // Count movies by category
    filmmakerMovies.forEach(movie => {
      if (!categoryCounts[movie.category]) {
        categoryCounts[movie.category] = 0;
      }
      categoryCounts[movie.category] += 1;
    });
    
    // Convert to array format for charts
    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

  // Render helper functions
  const renderHeader = () => (
    <header className="fixed top-0 w-full bg-black bg-opacity-90 text-white z-50 shadow-md">
      <div className="container-fluid py-4">
        <div className="flex-between">
          <div className="flex items-center">
            <div 
              className="text-2xl font-bold text-red-600 cursor-pointer flex items-center" 
              onClick={() => setCurrentSection('home')}
              role="banner"
            >
              <Film className="mr-2" />
              <span>FilmHub</span>
            </div>
            <nav className="ml-8 hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <button 
                    onClick={() => setCurrentSection('home')} 
                    className={`hover:text-red-500 transition-colors ${currentSection === 'home' ? 'text-red-500' : ''}`}
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentSection('movies')} 
                    className={`hover:text-red-500 transition-colors ${currentSection === 'movies' ? 'text-red-500' : ''}`}
                  >
                    Movies
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentSection('filmmaker')} 
                    className={`hover:text-red-500 transition-colors ${currentSection === 'filmmaker' ? 'text-red-500' : ''}`}
                  >
                    I am a Film Maker
                  </button>
                </li>
                {/* Filmmaker Dashboard (only for logged-in filmmakers) */}
                {authState.isAuthenticated && authState.user?.role === 'filmmaker' && (
                  <li>
                    <button 
                      onClick={() => setCurrentSection('dashboard')} 
                      className={`hover:text-red-500 transition-colors ${currentSection === 'dashboard' ? 'text-red-500' : ''}`}
                    >
                      My Dashboard
                    </button>
                  </li>
                )}
                {/* Big Short Challenge menu item */}
                <li>
                  <button 
                    onClick={() => setCurrentSection('challenge')} 
                    className={`hover:text-red-500 transition-colors ${currentSection === 'challenge' ? 'text-red-500' : ''}`}
                  >
                    Big Short Challenge
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentSection('about')} 
                    className={`hover:text-red-500 transition-colors ${currentSection === 'about' ? 'text-red-500' : ''}`}
                  >
                    About Us
                  </button>
                </li>
                {/* Contact Us menu item */}
                <li>
                  <button 
                    onClick={() => setCurrentSection('contact')} 
                    className={`hover:text-red-500 transition-colors ${currentSection === 'contact' ? 'text-red-500' : ''}`}
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
            </button>
            
            {authState.isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:inline-block text-sm">{authState.user?.name}</span>
                <button 
                  onClick={handleSignOut}
                  className="btn btn-sm bg-transparent border border-white hover:bg-red-600 hover:border-red-600 text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => openModal('signIn')} 
                  className="btn btn-sm bg-transparent hover:bg-white hover:text-black text-white border border-white hidden sm:block"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openModal('signUp')} 
                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white border border-red-600"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </div>
            )}
            
            <button 
              className="md:hidden text-white" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black bg-opacity-95 text-white py-4">
          <nav className="container-fluid">
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={() => setCurrentSection('home')} 
                  className={`block w-full text-left py-2 px-4 hover:bg-gray-800 ${currentSection === 'home' ? 'text-red-500' : ''}`}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentSection('movies')} 
                  className={`block w-full text-left py-2 px-4 hover:bg-gray-800 ${currentSection === 'movies' ? 'text-red-500' : ''}`}
                >
                  Movies
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentSection('filmmaker')} 
                  className={`block w-full text-left py-2 px-4 hover:bg-gray-800 ${currentSection === 'filmmaker' ? 'text-red-500' : ''}`}
                >
                  I am a Film Maker
                </button>
              </li>
              {/* Filmmaker Dashboard in mobile menu */}
              {authState.isAuthenticated && authState.user?.role === 'filmmaker' && (
                <li>
                  <button 
                    onClick={() => setCurrentSection('dashboard')} 
                    className={`block w-full text-left py-2 px-4 hover:bg-gray-800 ${currentSection === 'dashboard' ? 'text-red-500' : ''}`}
                  >
                    My Dashboard
                  </button>
                </li>
              )}
              {/* Added Big Short Challenge to mobile menu */}
              <li>
                <button 
                  onClick={() => setCurrentSection('challenge')} 
                  className={`block w-full text-left py-2 px-4 hover:bg-gray-800 ${currentSection === 'challenge' ? 'text-red-500' : ''}`}
                >
                  Big Short Challenge
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentSection('about')} 
                  className={`block w-full text-left py-2 px-4 hover:bg-gray-800 ${currentSection === 'about' ? 'text-red-500' : ''}`}
                >
                  About Us
                </button>
              </li>
              {/* Added Contact Us to mobile menu */}
              <li>
                <button 
                  onClick={() => setCurrentSection('contact')} 
                  className={`block w-full text-left py-2 px-4 hover:bg-gray-800 ${currentSection === 'contact' ? 'text-red-500' : ''}`}
                >
                  Contact Us
                </button>
              </li>
              {!authState.isAuthenticated && (
                <li>
                  <button 
                    onClick={() => openModal('signIn')} 
                    className="block w-full text-left py-2 px-4 hover:bg-gray-800"
                  >
                    Sign In
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );

  const renderFooter = () => (
    <footer className="bg-black text-white py-8 mt-12">
      <div className="container-fluid">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Film className="mr-2" /> FilmHub
            </h3>
            <p className="text-gray-400">Discover amazing independent films and connect with talented filmmakers worldwide.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => setCurrentSection('home')} className="hover:text-white">Home</button></li>
              <li><button onClick={() => setCurrentSection('movies')} className="hover:text-white">Movies</button></li>
              <li><button onClick={() => setCurrentSection('filmmaker')} className="hover:text-white">Filmmakers</button></li>
              <li><button onClick={() => setCurrentSection('challenge')} className="hover:text-white">Big Short Challenge</button></li>
              <li><button onClick={() => setCurrentSection('about')} className="hover:text-white">About Us</button></li>
              <li><button onClick={() => setCurrentSection('contact')} className="hover:text-white">Contact Us</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <address className="not-italic text-gray-400">
              <p>123 Film Avenue</p>
              <p>Cinema City, FA 90210</p>
              <p className="mt-2">Email: info@filmhub.com</p>
              <p>Phone: (555) 123-4567</p>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );

  const renderHero = () => (
    <div className={styles.hero}>
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      <div className="relative z-10 container-fluid h-full flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">Experience Cinema Like Never Before</h1>
          
          <div className={styles.quoteContainer}>
            <blockquote className="text-xl md:text-2xl italic mb-6 font-light">
              "{quotes[activeQuoteIndex].text}"
              <footer className="mt-2 text-gray-300 text-sm md:text-base">
                — {quotes[activeQuoteIndex].character}, <cite>{quotes[activeQuoteIndex].movie}</cite>
              </footer>
            </blockquote>
          </div>
          
          <p className="text-lg md:text-xl mb-8">Discover outstanding independent films from talented filmmakers around the world.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCurrentSection('movies')} 
              className="btn bg-red-600 hover:bg-red-700 text-white inline-flex items-center"
            >
              <Play className="mr-2" size={20} />
              Explore Films
            </button>
            {!authState.isAuthenticated && (
              <button 
                onClick={() => openModal('signUp')} 
                className="btn bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-filter backdrop-blur-sm text-white border border-white border-opacity-30"
              >
                Join FilmHub
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrendingMovies = () => (
    <section className="py-16 bg-gray-100 dark:bg-gray-900">
      <div className="container-fluid">
        <div className="flex-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center">
            <TrendingUp className="text-red-600 mr-2" /> Trending Films
          </h2>
          <button 
            onClick={() => setCurrentSection('movies')} 
            className="btn-sm bg-transparent text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 font-medium flex items-center"
          >
            View All <ChevronRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {movies.filter(movie => movie.trending).map(movie => (
            <div key={movie.id} className={styles.movieCard}>
              <div className={styles.movieImageContainer}>
                <img 
                  src={movie.imageUrl} 
                  alt={movie.title} 
                  className="rounded-lg shadow-lg object-cover w-full h-full transition-transform duration-300"
                />
                <div className={styles.movieOverlay}>
                  <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                    <h3 className="font-bold text-lg">{movie.title}</h3>
                    <div className="flex items-center text-yellow-400 mt-1">
                      <Star size={16} className="fill-current" />
                      <span className="ml-1">{movie.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 line-clamp-2">
                      {movie.shortDescription || movie.description}
                    </p>
                    <button className="btn-sm bg-red-600 hover:bg-red-700 text-white mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play size={16} className="mr-1" /> Watch Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderFilmmakerPromo = () => (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container-fluid">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Are You a Film Maker?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Join our community of independent filmmakers and showcase your work to a global audience. 
              Get discovered, connect with fans, and share your creative vision with the world.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                { icon: <Award className="text-red-600" />, text: "Gain recognition for your creative work" },
                { icon: <TrendingUp className="text-red-600" />, text: "Reach a wider audience of film enthusiasts" },
                { icon: <Video className="text-red-600" />, text: "Upload and showcase your films easily" },
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-3 mt-1">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={() => setCurrentSection('filmmaker')} 
              className="btn btn-primary bg-red-600 hover:bg-red-700 text-white shadow-md flex items-center"
            >
              <Camera className="mr-2" /> Learn More
            </button>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://source.unsplash.com/random/600x400?filmmaker,camera,director" 
              alt="Filmmaker" 
              className="rounded-lg shadow-xl object-cover w-full h-[400px]"
            />
          </div>
        </div>
      </div>
    </section>
  );

  const renderUploadPromo = () => (
    <section className={`${styles.uploadSection} py-16 text-white`}>
      <div className="container-fluid">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Share Your Film With The World</h2>
          <p className="text-lg mb-8 text-gray-200">
            Ready to showcase your work? Upload your film now and join our community of talented filmmakers.
          </p>
          <button 
            onClick={() => {
              if (authState.isAuthenticated) {
                if (authState.user?.role === 'filmmaker') {
                  openModal('uploadMovie');
                } else {
                  alert('You need a filmmaker account to upload movies. Please create one to continue.');
                }
              } else {
                openModal('signUp');
              }
            }} 
            className="btn bg-white text-red-600 hover:bg-gray-100 shadow-lg flex items-center mx-auto"
          >
            <Upload className="mr-2" /> Upload Your Film
          </button>
        </div>
      </div>
    </section>
  );

  const renderUSP = () => (
    <section className="py-16 bg-gray-100 dark:bg-gray-900">
      <div className="container-fluid">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Why Choose FilmHub?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap size={40} className="text-red-600" />,
              title: "Discover New Films",
              description: "Explore a curated selection of independent films from talented filmmakers around the world."
            },
            {
              icon: <Film size={40} className="text-red-600" />,
              title: "Support Filmmakers",
              description: "Your subscription directly supports independent filmmakers, helping them create more amazing content."
            },
            {
              icon: <Star size={40} className="text-red-600" />,
              title: "High Quality Content",
              description: "Experience cinema in high definition with our quality streaming service, anytime, anywhere."
            }
          ].map((feature, index) => (
            <div key={index} className="card dark:bg-gray-800 text-center p-6 transition-transform hover:scale-105">
              <div className="mx-auto mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderHomeSection = () => (
    <main className="mt-16 pt-8">
      {renderHero()}
      {renderTrendingMovies()}
      {renderFilmmakerPromo()}
      {renderUploadPromo()}
      {renderUSP()}
    </main>
  );

  const renderMoviesSection = () => (
    <main className="mt-16 pt-16 pb-12">
      <div className="container-fluid">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Film className="text-red-600 mr-2" /> Explore Our Film Collection
        </h1>
        
        <div className="flex flex-col md:flex-row mb-8 gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search for films..." 
              className="input pl-10 w-full"
            />
          </div>
          <select className="input md:w-48">
            <option value="">All Categories</option>
            <option value="Drama">Drama</option>
            <option value="Comedy">Comedy</option>
            <option value="Action">Action</option>
            <option value="Documentary">Documentary</option>
            <option value="Horror">Horror</option>
            <option value="Sci-Fi">Sci-Fi</option>
          </select>
          <button className="btn bg-red-600 hover:bg-red-700 text-white">
            Filter
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map(movie => (
            <div key={movie.id} className={styles.movieCard}>
              <div className={styles.movieImageContainer}>
                <img 
                  src={movie.imageUrl} 
                  alt={movie.title} 
                  className="rounded-lg shadow-lg object-cover w-full h-full transition-transform duration-300"
                />
                <div className={styles.movieOverlay}>
                  <div className="absolute inset-0 flex flex-col justify-end p-4 text-white">
                    <h3 className="font-bold text-lg">{movie.title}</h3>
                    <div className="flex items-center text-yellow-400 mt-1">
                      <Star size={16} className="fill-current" />
                      <span className="ml-1">{movie.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm">{movie.year}</span>
                      <span className="text-sm px-2 py-0.5 bg-red-600 rounded-full">{movie.category}</span>
                    </div>
                    <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 line-clamp-2">
                      {movie.shortDescription || movie.description}
                    </p>
                    <button className="btn-sm bg-red-600 hover:bg-red-700 text-white mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play size={16} className="mr-1" /> Watch Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );

  const renderFilmmakerSection = () => (
    <main className="mt-16 pt-16 pb-12">
      <div className="container-fluid">
        <h1 className="text-3xl font-bold mb-4">For Filmmakers</h1>
        
        {/* Updated Hero section for filmmakers with camera-focused banner removed */}
        <div className={styles.filmmakerHero}>
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
          <div className="relative z-10 p-8 md:p-12 text-white max-w-2xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Bring Your Vision To Life</h2>
            <p className="text-lg mb-6">
              Showcase your creativity and talent on the ultimate filmmaker platform. 
              With professional tools, global distribution, and direct audience connection, 
              your cinematic journey begins here.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => {
                  if (!authState.isAuthenticated) {
                    openModal('signUp');
                  } else if (authState.user?.role !== 'filmmaker') {
                    alert('Please create a filmmaker account to upload movies.');
                  } else {
                    openModal('uploadMovie');
                  }
                }} 
                className="btn bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                Start Creating Today
              </button>
              <button
                onClick={handleDesignConfirmation}
                className="btn bg-transparent border border-white hover:bg-white hover:text-red-600 text-white shadow-lg"
              >
                Confirm Design
              </button>
            </div>
            
            {/* Design confirmation message */}
            {designConfirmed && (
              <div className="mt-4 p-3 bg-green-600 bg-opacity-90 rounded-md shadow-lg animate-fade-in">
                <p className="text-white font-medium">Design confirmed! Your new filmmaker banner is ready.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Benefits section */}
        <div className="py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Benefits for Filmmakers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Global Distribution", description: "Reach audiences worldwide without the need for traditional distribution channels." },
              { title: "Retain Creative Control", description: "You maintain full rights to your work while sharing it with our community." },
              { title: "Audience Insights", description: "Get valuable data about who's watching your films and how they're engaging with your content." },
              { title: "Community Feedback", description: "Receive ratings and reviews directly from viewers to help improve your craft." },
              { title: "Filmmaker Profile", description: "Create a professional profile to showcase your portfolio and connect with fans." },
              { title: "Monetization Options", description: "Earn revenue through our subscription model that rewards quality content." }
            ].map((benefit, index) => (
              <div key={index} className="card shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Statistics/Growth section */}
        <div className="py-12 bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Growing Platform for Filmmakers</h2>
          
          <div className="mb-8">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={analyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="subscribers" name="Subscribers" fill="#3B82F6" />
                <Bar dataKey="filmmakers" name="Filmmakers" fill="#EF4444" />
                <Bar dataKey="uploads" name="Film Uploads" fill="#10B981" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="stat-card dark:bg-gray-700">
              <p className="stat-title">Active Subscribers</p>
              <p className="stat-value text-blue-500">10,000+</p>
              <p className="stat-desc">Potential viewers for your films</p>
            </div>
            <div className="stat-card dark:bg-gray-700">
              <p className="stat-title">Filmmaker Community</p>
              <p className="stat-value text-red-500">500+</p>
              <p className="stat-desc">Independent filmmakers</p>
            </div>
            <div className="stat-card dark:bg-gray-700">
              <p className="stat-title">Monthly Views</p>
              <p className="stat-value text-green-500">250,000+</p>
              <p className="stat-desc">Film views every month</p>
            </div>
          </div>
        </div>
        
        {/* FAQ section */}
        <div className="py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {[
              { 
                question: "How do I upload my film?", 
                answer: "Sign up for a filmmaker account, complete your profile, and use our simple upload tool to share your film. You'll be guided through adding details like title, description, genre, and more." 
              },
              { 
                question: "What types of films are accepted?", 
                answer: "We accept shorts, features, documentaries, animation, experimental films, and web series. All genres are welcome, but content must adhere to our community guidelines." 
              },
              { 
                question: "How do filmmakers get paid?", 
                answer: "Filmmakers earn revenue based on viewing time and engagement metrics. Payments are distributed monthly to filmmakers who reach the minimum payout threshold." 
              },
              { 
                question: "Do I retain the rights to my film?", 
                answer: "Yes, you maintain full ownership of your content. By uploading, you grant FilmHub a non-exclusive license to stream your film to our subscribers." 
              },
              { 
                question: "Is there a fee to upload films?", 
                answer: "No, there is no fee to upload your films. We believe in providing a platform where filmmakers can share their work without financial barriers." 
              }
            ].map((faq, index) => (
              <div key={index} className="card shadow-sm">
                <h3 className="text-xl font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );

  const renderAboutSection = () => (
    <main className="mt-16 pt-16 pb-12">
      <div className="container-fluid">
        <h1 className="text-3xl font-bold mb-8">About FilmHub</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              FilmHub was founded in 2023 with a simple mission: to connect independent filmmakers with audiences who appreciate their work.
            </p>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              As a startup, we're passionate about creating a platform that celebrates creative vision and provides an alternative to mainstream film distribution channels. We believe that great stories deserve to be seen, regardless of budget or industry connections.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Our team consists of film enthusiasts, tech innovators, and industry professionals who share a common goal: to revolutionize how independent films reach their audience.
            </p>
          </div>
          <div>
            <img 
              src="https://source.unsplash.com/random/600x400?film,cinema" 
              alt="Film production" 
              className="rounded-lg shadow-xl w-full"
            />
          </div>
        </div>
        
        <div className="card mb-12">
          <h2 className="text-2xl font-semibold mb-4">Company Registration Details</h2>
          <div className="space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>Company Name:</strong> FilmHub Entertainment Pvt. Ltd.</p>
            <p><strong>Registration Number:</strong> FA123456789</p>
            <p><strong>Date of Incorporation:</strong> March 15, 2023</p>
            <p><strong>Registered Address:</strong> 123 Film Avenue, Cinema City, FA 90210</p>
            <p><strong>Contact Email:</strong> info@filmhub.com</p>
            <p><strong>Contact Phone:</strong> (555) 123-4567</p>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-xl font-medium mb-3">Support Filmmakers</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Provide independent filmmakers with a platform to showcase their work and connect with a global audience.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-medium mb-3">Discover New Talent</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help audiences discover talented filmmakers who might otherwise go unnoticed in traditional distribution channels.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-medium mb-3">Foster Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create a vibrant community where film lovers and creators can connect, collaborate, and celebrate the art of cinema.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: "Jessica Chen", role: "Founder & CEO", image: "https://source.unsplash.com/random/300x300?woman,professional" },
              { name: "Michael Rodriguez", role: "Head of Content", image: "https://source.unsplash.com/random/300x300?man,professional" },
              { name: "Aisha Johnson", role: "Chief Technology Officer", image: "https://source.unsplash.com/random/300x300?woman,tech" },
              { name: "David Kim", role: "Marketing Director", image: "https://source.unsplash.com/random/300x300?man,creative" }
            ].map((member, index) => (
              <div key={index} className="card text-center">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-medium">{member.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );

  // Section for Big Short Challenge
  const renderChallengeSection = () => (
    <main className="mt-16 pt-16 pb-12">
      <div className="container-fluid">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <Trophy className="text-red-600 mr-2" /> Big Short Challenge
        </h1>
        
        <div className={styles.challengeHero}>
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
          <div className="relative z-10 p-8 md:p-12 text-white max-w-2xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Create. Compete. Get Discovered.</h2>
            <p className="text-lg mb-6">
              Join our Big Short Challenge - a competition for filmmakers to create innovative short films under 10 minutes.
              Win prizes, gain exposure, and showcase your talent to our global audience.
            </p>
            <button 
              className="btn bg-red-600 hover:bg-red-700 text-white shadow-lg"
              onClick={() => !authState.isAuthenticated && openModal('signUp')}
            >
              Register for the Challenge
            </button>
          </div>
        </div>
        
        <div className="py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Submit Your Short Film", 
                description: "Create a short film under 10 minutes on any topic that inspires you. Submit it through our platform by the deadline."
              },
              { 
                title: "Get Voted by Audience", 
                description: "Your film will be available for viewing and voting by our community of film enthusiasts during the voting period."
              },
              { 
                title: "Win Prizes & Recognition", 
                description: "Top films selected by audience votes and our panel of judges will receive prizes, distribution deals, and industry recognition."
              }
            ].map((step, index) => (
              <div key={index} className="card shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl font-bold text-red-600 mb-4">{index + 1}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="py-12 bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-8 text-center">Challenge Details</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Theme</h3>
              <p className="text-gray-600 dark:text-gray-300">
                "Reimagining Tomorrow" - Create a short film that explores future possibilities, whether through sci-fi, drama, comedy, documentary, or any genre of your choice.
              </p>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Rules & Requirements</h3>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Maximum length: 10 minutes (including credits)</li>
                <li>Open to filmmakers of all experience levels</li>
                <li>All genres welcome</li>
                <li>Must be original work created for this challenge</li>
                <li>Submission deadline: December 1, 2023</li>
                <li>Must adhere to our community guidelines</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="text-xl font-semibold mb-2">Prizes</h3>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-2">
                <li><strong>1st Place:</strong> $5,000 cash prize + distribution deal + featured spotlight on FilmHub</li>
                <li><strong>2nd Place:</strong> $2,500 cash prize + premium account + industry mentor session</li>
                <li><strong>3rd Place:</strong> $1,000 cash prize + premium account</li>
                <li><strong>Audience Choice:</strong> $1,500 cash prize + community spotlight</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to Showcase Your Talent?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Don't miss this opportunity to get your work seen by industry professionals and film enthusiasts worldwide.
          </p>
          <button 
            className="btn bg-red-600 hover:bg-red-700 text-white shadow-lg"
            onClick={() => !authState.isAuthenticated && openModal('signUp')}
          >
            Sign Up & Join the Challenge
          </button>
        </div>
      </div>
    </main>
  );

  // Section for Contact Us
  const renderContactSection = () => (
    <main className="mt-16 pt-16 pb-12">
      <div className="container-fluid">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <MessageCircle className="text-red-600 mr-2" /> Contact Us
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Get In Touch</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Have questions about FilmHub? Want to learn more about our platform or services? 
              We'd love to hear from you! Fill out the form and our team will get back to you as soon as possible.
            </p>
            
            {contactFormSubmitted ? (
              <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>Thank you for your message! We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleContactFormSubmit} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">Your Name</label>
                  <input 
                    type="text" 
                    id="contact-name" 
                    name="name" 
                    className="input" 
                    placeholder="Enter your name" 
                    value={contactFormData.name}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    id="contact-email" 
                    name="email" 
                    className="input" 
                    placeholder="Enter your email" 
                    value={contactFormData.email}
                    onChange={handleContactFormChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">Message</label>
                  <textarea 
                    id="contact-message" 
                    name="message" 
                    className="input" 
                    placeholder="What would you like to tell us?" 
                    rows={5}
                    value={contactFormData.message}
                    onChange={handleContactFormChange}
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            <div className="card mb-6">
              <h3 className="text-xl font-medium mb-4">Headquarters</h3>
              <address className="not-italic space-y-2 text-gray-600 dark:text-gray-300">
                <p>123 Film Avenue</p>
                <p>Cinema City, FA 90210</p>
                <p className="mt-4">Email: info@filmhub.com</p>
                <p>Phone: (555) 123-4567</p>
              </address>
            </div>
            
            <div className="card mb-6">
              <h3 className="text-xl font-medium mb-4">Business Hours</h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-medium mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
                <a href="#" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  // New section for Filmmaker Dashboard
  const renderDashboardSection = () => {
    // Make sure user is authenticated and is a filmmaker
    if (!authState.isAuthenticated || authState.user?.role !== 'filmmaker') {
      // Redirect to home if not allowed
      setTimeout(() => setCurrentSection('home'), 0);
      return <div className="mt-16 pt-16 pb-12 container-fluid">Redirecting...</div>;
    }

    const filmmakerMovies = getFilmmakerMovies();
    const totalViews = getTotalViews();
    const viewData = getAggregatedViewData();
    const categoryData = getCategoryDistributionData();

    return (
      <main className="mt-16 pt-16 pb-12">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 shrink-0">
              <div className="card mb-6">
                <div className="flex flex-col items-center text-center">
                  <img 
                    src={authState.user?.profile?.profilePicture || 'https://source.unsplash.com/random/200x200?portrait,person'} 
                    alt={authState.user?.name || 'Filmmaker'} 
                    className="w-24 h-24 rounded-full object-cover mb-4"
                  />
                  <h2 className="text-xl font-bold">{authState.user?.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{authState.user?.email}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center mb-4">
                    <Phone size={16} className="mr-1" /> {authState.user?.phone}
                  </p>
                  <button 
                    className="btn-sm bg-red-600 hover:bg-red-700 text-white w-full flex items-center justify-center"
                    onClick={() => openModal('editProfile')}
                  >
                    <Edit size={16} className="mr-2" /> Edit Profile
                  </button>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <nav>
                  <ul>
                    {dashboardTabs.map((tab) => (
                      <li key={tab.id}>
                        <button 
                          onClick={() => setActiveDashboardTab(tab.id)}
                          className={`w-full py-3 px-4 text-left flex items-center ${activeDashboardTab === tab.id ? 'bg-red-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        >
                          {tab.icon}
                          <span>{tab.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow">
              {/* Profile Tab */}
              {activeDashboardTab === 'profile' && (
                <div>
                  <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                    <img 
                      src={authState.user?.profile?.bannerImage || 'https://source.unsplash.com/random/1200x400?film,production'} 
                      alt="Profile Banner" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end p-6">
                      <h1 className="text-3xl font-bold text-white">{authState.user?.name}'s Filmmaker Portal</h1>
                    </div>
                  </div>

                  <div className="card mb-6">
                    <h2 className="text-xl font-bold mb-4">Bio</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {authState.user?.profile?.bio || 'No bio available. Click Edit Profile to add your bio.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="stat-card">
                      <div className="stat-title">Total Movies</div>
                      <div className="stat-value text-red-600">{filmmakerMovies.length}</div>
                      <div className="stat-desc">Uploaded films</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Total Views</div>
                      <div className="stat-value text-blue-600">{totalViews.toLocaleString()}</div>
                      <div className="stat-desc">Across all films</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Average Rating</div>
                      <div className="stat-value text-yellow-600">
                        {filmmakerMovies.length > 0 ? 
                          (filmmakerMovies.reduce((sum, movie) => sum + movie.rating, 0) / filmmakerMovies.length).toFixed(1) : 
                          'N/A'}
                      </div>
                      <div className="stat-desc">From viewer ratings</div>
                    </div>
                  </div>

                  <div className="card">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    {filmmakerMovies.length > 0 ? (
                      <div className="space-y-4">
                        {filmmakerMovies.slice(0, 3).map(movie => (
                          <div key={movie.id} className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                            <img 
                              src={movie.imageUrl} 
                              alt={movie.title} 
                              className="w-16 h-24 object-cover rounded mr-4"
                            />
                            <div>
                              <h3 className="font-medium">{movie.title}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded on {new Date(movie.uploadDate).toLocaleDateString()}</p>
                              <div className="flex items-center mt-2 text-sm">
                                <span className="flex items-center mr-4">
                                  <Eye size={14} className="mr-1" /> {movie.views} views
                                </span>
                                <span className="flex items-center">
                                  <Star size={14} className="mr-1 text-yellow-500" /> {movie.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">
                        You haven't uploaded any movies yet. Go to the Upload tab to share your first film!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Movies Tab */}
              {activeDashboardTab === 'movies' && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <h2 className="text-2xl font-bold mb-4 md:mb-0">My Movies</h2>
                    <button 
                      onClick={() => openModal('uploadMovie')}
                      className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
                    >
                      <Upload size={18} className="mr-2" /> Upload New Movie
                    </button>
                  </div>

                  {filmmakerMovies.length > 0 ? (
                    <div className="space-y-6">
                      {filmmakerMovies.map(movie => (
                        <div key={movie.id} className="card flex flex-col md:flex-row md:items-start gap-6">
                          <div className="md:w-1/4 lg:w-1/5">
                            <img 
                              src={movie.imageUrl} 
                              alt={movie.title} 
                              className="w-full h-auto object-cover rounded"
                            />
                          </div>
                          <div className="md:w-3/4 lg:w-4/5">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                              <div>
                                <h3 className="text-xl font-bold">{movie.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                  {movie.category} • {movie.year} • Uploaded on {new Date(movie.uploadDate).toLocaleDateString()}
                                </p>
                                {movie.language && (
                                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center">
                                    <Globe size={14} className="mr-1" /> {movie.language}
                                    {movie.childFriendly !== undefined && (
                                      <span className="ml-3 flex items-center">
                                        {movie.childFriendly ? (
                                          <span className="text-green-500 flex items-center">
                                            <Check size={14} className="mr-1" /> Child Friendly
                                          </span>
                                        ) : (
                                          <span className="text-red-500 flex items-center">
                                            <AlertCircle size={14} className="mr-1" /> Not for Children
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center mt-2 md:mt-0">
                                <button 
                                  className="btn-sm bg-blue-600 hover:bg-blue-700 text-white mr-2 flex items-center"
                                  onClick={() => handleOpenEditMovie(movie.id)}
                                >
                                  <Edit size={14} className="mr-1" /> Edit
                                </button>
                                <button className="btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center">
                                  <Eye size={14} className="mr-1" /> Preview
                                </button>
                              </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-300 mb-2">{movie.description}</p>
                            
                            {movie.shortDescription && (
                              <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                                <strong>Short Description:</strong> {movie.shortDescription}
                              </p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Views</div>
                                <div className="font-bold text-lg">{movie.views.toLocaleString()}</div>
                              </div>
                              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Rating</div>
                                <div className="font-bold text-lg flex items-center justify-center">
                                  <Star size={16} className="text-yellow-500 mr-1" /> {movie.rating.toFixed(1)}
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Last 7 Days</div>
                                <div className="font-bold text-lg">
                                  {movie.viewHistory
                                    .filter(v => new Date(v.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                                    .reduce((acc, v) => acc + v.count, 0)}
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                                <div className="text-gray-500 dark:text-gray-400 text-sm">Today</div>
                                <div className="font-bold text-lg">
                                  {movie.viewHistory
                                    .filter(v => v.date === new Date().toISOString().split('T')[0])
                                    .reduce((acc, v) => acc + v.count, 0)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card text-center p-12">
                      <Film size={48} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">No Movies Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't uploaded any movies yet. Start sharing your creative work!</p>
                      <button 
                        onClick={() => openModal('uploadMovie')}
                        className="btn bg-red-600 hover:bg-red-700 text-white mx-auto flex items-center"
                      >
                        <Upload size={18} className="mr-2" /> Upload Your First Movie
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {activeDashboardTab === 'analytics' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Performance Analytics</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="stat-card">
                      <div className="stat-title">Total Views</div>
                      <div className="stat-value text-blue-600">{totalViews.toLocaleString()}</div>
                      <div className="stat-desc">Across all films</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Average Views/Movie</div>
                      <div className="stat-value text-green-600">
                        {filmmakerMovies.length > 0 ? Math.round(totalViews / filmmakerMovies.length).toLocaleString() : '0'}
                      </div>
                      <div className="stat-desc">Per film</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Total Movies</div>
                      <div className="stat-value text-red-600">{filmmakerMovies.length}</div>
                      <div className="stat-desc">In your catalog</div>
                    </div>
                  </div>

                  <div className="card mb-8">
                    <h3 className="text-xl font-bold mb-4">Views Over Time</h3>
                    <div className="h-80">
                      {viewData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={viewData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <RechartsTooltip />
                            <Area 
                              type="monotone" 
                              dataKey="views" 
                              stroke="#EF4444" 
                              fillOpacity={1} 
                              fill="url(#colorViews)" 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-500 dark:text-gray-400">No view data available yet.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card">
                      <h3 className="text-xl font-bold mb-4">Movie Category Distribution</h3>
                      <div className="h-72">
                        {categoryData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Legend />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-gray-500 dark:text-gray-400">No category data available yet.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="text-xl font-bold mb-4">Top Performing Movies</h3>
                      {filmmakerMovies.length > 0 ? (
                        <div className="space-y-4">
                          {filmmakerMovies
                            .sort((a, b) => b.views - a.views)
                            .slice(0, 5)
                            .map((movie, index) => (
                              <div key={movie.id} className="flex items-center">
                                <div className="w-6 text-center font-bold text-gray-500">{index + 1}</div>
                                <img 
                                  src={movie.imageUrl} 
                                  alt={movie.title} 
                                  className="w-12 h-16 object-cover rounded ml-3 mr-4"
                                />
                                <div className="flex-grow">
                                  <h4 className="font-medium">{movie.title}</h4>
                                  <p className="text-sm text-gray-500">{movie.category} • {movie.year}</p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{movie.views.toLocaleString()}</div>
                                  <div className="text-sm text-gray-500">views</div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">
                          No movies available to analyze.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Tab */}
              {activeDashboardTab === 'upload' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Upload New Movie</h2>
                  
                  <div className="card">
                    <form onSubmit={handleUploadMovie} className="space-y-6">
                      <div className="form-group">
                        <label htmlFor="title" className="form-label">Film Title</label>
                        <input 
                          type="text" 
                          id="title" 
                          name="title" 
                          className="input" 
                          placeholder="Enter film title" 
                          required
                        />
                      </div>
                      
                      {/* NEW: Short Description field */}
                      <div className="form-group">
                        <label htmlFor="shortDescription" className="form-label">
                          Short Description <span className="text-gray-500 text-sm">(Max 100 characters)</span>
                        </label>
                        <input 
                          type="text" 
                          id="shortDescription" 
                          name="shortDescription" 
                          className="input" 
                          placeholder="Brief summary of your film" 
                          maxLength={100}
                        />
                        <p className="text-xs text-gray-500 mt-1">This will appear in movie previews and listings</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label htmlFor="category" className="form-label">Category</label>
                          <select 
                            id="category" 
                            name="category" 
                            className="input" 
                            required
                          >
                            <option value="">Select a category</option>
                            <option value="Drama">Drama</option>
                            <option value="Comedy">Comedy</option>
                            <option value="Action">Action</option>
                            <option value="Documentary">Documentary</option>
                            <option value="Horror">Horror</option>
                            <option value="Sci-Fi">Sci-Fi</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Thriller">Thriller</option>
                            <option value="Animation">Animation</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="year" className="form-label">Release Year</label>
                          <input 
                            type="number" 
                            id="year" 
                            name="year" 
                            className="input" 
                            placeholder="Enter release year" 
                            min="1900"
                            max={new Date().getFullYear()}
                            defaultValue={new Date().getFullYear()}
                            required
                          />
                        </div>
                      </div>
                      
                      {/* NEW: Language dropdown and Child content field */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label htmlFor="language" className="form-label">Language of Film</label>
                          <select 
                            id="language" 
                            name="language" 
                            className="input" 
                            required
                          >
                            <option value="">Select a language</option>
                            {languages.map((lang) => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="childFriendly" className="form-label">Suitable for Children?</label>
                          <select 
                            id="childFriendly" 
                            name="childFriendly" 
                            className="input" 
                            required
                          >
                            <option value="">Select an option</option>
                            <option value="yes">Yes - Appropriate for children</option>
                            <option value="no">No - Contains mature content</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="description" className="form-label">Full Description</label>
                        <textarea 
                          id="description" 
                          name="description" 
                          className="input" 
                          placeholder="Enter detailed film description" 
                          rows={4}
                          required
                        ></textarea>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="filmFile" className="form-label">Upload Film File</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                          <input 
                            type="file" 
                            id="filmFile" 
                            name="filmFile" 
                            className="hidden" 
                            accept="video/mp4,video/x-m4v,video/*"
                          />
                          <label htmlFor="filmFile" className="cursor-pointer flex flex-col items-center justify-center">
                            <Upload className="text-gray-400 w-12 h-12 mb-3" />
                            <p className="font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MP4, MOV, or AVI (max. 8GB)</p>
                          </label>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="thumbnail" className="form-label">Upload Thumbnail</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                          <input 
                            type="file" 
                            id="thumbnail" 
                            name="thumbnail" 
                            className="hidden" 
                            accept="image/jpeg,image/png,image/*"
                          />
                          <label htmlFor="thumbnail" className="cursor-pointer flex flex-col items-center justify-center">
                            <Image className="text-gray-400 w-12 h-12 mb-3" />
                            <p className="font-medium text-gray-700 dark:text-gray-300">Upload film thumbnail</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG or PNG (16:9 ratio recommended)</p>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input 
                          id="termsAgree" 
                          name="termsAgree" 
                          type="checkbox" 
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          required
                        />
                        <label htmlFor="termsAgree" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          I confirm I have all rights to distribute this content and agree to the <a href="#" className="text-red-600 hover:text-red-500">Filmmaker Agreement</a>
                        </label>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button 
                          type="submit" 
                          className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
                        >
                          <Upload size={18} className="mr-2" /> Upload Film
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeDashboardTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Settings</h2>
                  
                  <div className="space-y-8">
                    <div className="card">
                      <h3 className="text-xl font-semibold mb-4">Account Information</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Name</label>
                            <div className="input bg-gray-50 dark:bg-gray-700 p-2">{authState.user?.name}</div>
                          </div>
                          <div>
                            <label className="form-label">Email</label>
                            <div className="input bg-gray-50 dark:bg-gray-700 p-2 flex items-center">
                              {authState.user?.email} 
                              {authState.user?.verified && (
                                <span className="ml-2 text-green-600" title="Verified">
                                  <Check size={16} />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Phone</label>
                            <div className="input bg-gray-50 dark:bg-gray-700 p-2 flex items-center">
                              {authState.user?.phone}
                              {authState.user?.verified && (
                                <span className="ml-2 text-green-600" title="Verified">
                                  <Check size={16} />
                                </span>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="form-label">Account Type</label>
                            <div className="input bg-gray-50 dark:bg-gray-700 p-2 capitalize">{authState.user?.role}</div>
                          </div>
                        </div>
                        <div>
                          <label className="form-label">Member Since</label>
                          <div className="input bg-gray-50 dark:bg-gray-700 p-2">
                            {authState.user?.subscriptionDate ? new Date(authState.user.subscriptionDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button 
                          onClick={() => openModal('editProfile')} 
                          className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                        >
                          <Edit size={18} className="mr-2" /> Edit Profile
                        </button>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="text-xl font-semibold mb-4">Account Actions</h3>
                      <div className="space-y-4">
                        <button className="btn border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white flex items-center">
                          <LogOut size={18} className="mr-2" /> Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  };

  const renderModals = () => (
    <>
      {/* Sign In Modal */}
      {modal.isOpen && modal.type === 'signIn' && (
        <div 
          className="modal-backdrop" 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-modal-title"
        >
          <div 
            className="modal-content max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="signin-modal-title" className="text-xl font-bold flex items-center">
                <UserIcon className="mr-2 text-red-600" /> Sign In
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSignIn} className="space-y-4 mt-4">
              <div className="form-group">
                <label htmlFor="signin-email" className="form-label">Email</label>
                <input 
                  type="email" 
                  id="signin-email" 
                  name="email" 
                  className="input" 
                  placeholder="Enter your email" 
                  value={signInData.email}
                  onChange={handleSignInChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="signin-password" className="form-label">Password</label>
                <input 
                  type="password" 
                  id="signin-password" 
                  name="password" 
                  className="input" 
                  placeholder="Enter your password" 
                  value={signInData.password}
                  onChange={handleSignInChange}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox" 
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-red-600 hover:text-red-500">
                    Forgot your password?
                  </a>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="btn bg-red-600 hover:bg-red-700 text-white w-full"
              >
                Sign In
              </button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <button 
                    type="button" 
                    className="text-red-600 hover:text-red-500 font-medium"
                    onClick={() => {
                      setModal({ isOpen: true, type: 'signUp' });
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Sign Up Modal */}
      {modal.isOpen && modal.type === 'signUp' && (
        <div 
          className="modal-backdrop" 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-modal-title"
        >
          <div 
            className="modal-content max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="signup-modal-title" className="text-xl font-bold flex items-center">
                <UserPlus className="mr-2 text-red-600" /> Sign Up
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSignUp} className="space-y-4 mt-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="input" 
                  placeholder="Enter your full name" 
                  value={signUpData.name}
                  onChange={handleSignUpChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <div className="flex items-center">
                  <Mail className="text-gray-400 absolute ml-3" size={16} />
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="input pl-10" 
                    placeholder="Enter your email" 
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">You'll need to verify this email during signup</p>
              </div>

              {/* Phone Number Field */}
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Contact Number</label>
                <div className="flex items-center">
                  <Phone className="text-gray-400 absolute ml-3" size={16} />
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    className="input pl-10" 
                    placeholder="Enter your phone number" 
                    value={signUpData.phone}
                    onChange={handleSignUpChange}
                    pattern="[0-9\-\+\s\(\)]*"
                    title="Please enter numbers, spaces, and these symbols: + - ( )"
                    required
                  />
                </div>
                {phoneError && <p className="form-error">{phoneError}</p>}
                <p className="text-xs text-gray-500 mt-1">Format: 123-456-7890 or (123) 456-7890</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  className="input" 
                  placeholder="Create a password" 
                  value={signUpData.password}
                  onChange={handleSignUpChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  className="input" 
                  placeholder="Confirm your password" 
                  value={signUpData.confirmPassword}
                  onChange={handleSignUpChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role" className="form-label">I am a:</label>
                <select 
                  id="role" 
                  name="role" 
                  className="input" 
                  value={signUpData.role}
                  onChange={handleSignUpChange}
                  required
                >
                  <option value="subscriber">Film Enthusiast (Subscriber)</option>
                  <option value="filmmaker">Filmmaker</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="terms" 
                  name="terms" 
                  type="checkbox" 
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  I agree to the <a href="#" className="text-red-600 hover:text-red-500">Terms of Service</a> and <a href="#" className="text-red-600 hover:text-red-500">Privacy Policy</a>
                </label>
              </div>
              
              <button 
                type="submit" 
                className="btn bg-red-600 hover:bg-red-700 text-white w-full"
              >
                Create Account
              </button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button 
                    type="button" 
                    className="text-red-600 hover:text-red-500 font-medium"
                    onClick={() => {
                      setModal({ isOpen: true, type: 'signIn' });
                    }}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* OTP Verification Modal */}
      {modal.isOpen && modal.type === 'otpVerification' && (
        <div 
          className="modal-backdrop" 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-modal-title"
        >
          <div 
            className="modal-content max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="otp-modal-title" className="text-xl font-bold flex items-center">
                <Check className="mr-2 text-red-600" /> Verify Your Account
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mt-4 mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                We've sent verification codes to your email and phone. Please enter them below to complete your account setup.
              </p>
            </div>
            
            <form onSubmit={handleOTPVerification} className="space-y-6">
              <div className="form-group">
                <label htmlFor="emailOTP" className="form-label flex items-center">
                  <Mail className="mr-2 text-gray-500" size={16} />
                  Email OTP (sent to {otpVerification.email})
                </label>
                <input 
                  type="text" 
                  id="emailOTP" 
                  name="emailOTP" 
                  className="input text-center text-xl letter-spacing-wide"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneOTP" className="form-label flex items-center">
                  <Phone className="mr-2 text-gray-500" size={16} />
                  Phone OTP (sent to {otpVerification.phone})
                </label>
                <input 
                  type="text" 
                  id="phoneOTP" 
                  name="phoneOTP" 
                  className="input text-center text-xl letter-spacing-wide"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>
              
              <p className="text-sm text-gray-500 italic">
                Note: In a production app, these codes would be sent via email and SMS. For this demo, they are displayed in an alert after clicking Sign Up.
              </p>
              
              <div className="flex justify-between items-center">
                <button 
                  type="button" 
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                  onClick={() => alert('In a real app, new codes would be sent.')}
                >
                  Resend Codes
                </button>
                
                <button 
                  type="submit" 
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                >
                  Verify & Complete Signup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {modal.isOpen && modal.type === 'editProfile' && (
        <div 
          className="modal-backdrop" 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-modal-title"
        >
          <div 
            className="modal-content max-w-xl w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="edit-profile-modal-title" className="text-xl font-bold flex items-center">
                <Edit className="mr-2 text-red-600" /> Edit Profile
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditProfile} className="space-y-6 mt-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="input" 
                  placeholder="Enter your full name" 
                  value={editProfileData.name}
                  onChange={handleEditProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio" className="form-label">Bio / About</label>
                <textarea 
                  id="bio" 
                  name="bio" 
                  className="input" 
                  placeholder="Tell us about yourself and your work" 
                  rows={4}
                  value={editProfileData.bio}
                  onChange={handleEditProfileChange}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Contact Number</label>
                <div className="flex items-center">
                  <Phone className="text-gray-400 absolute ml-3" size={16} />
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    className="input pl-10" 
                    placeholder="Enter your phone number" 
                    value={editProfileData.phone}
                    onChange={handleEditProfileChange}
                    pattern="[0-9\-\+\s\(\)]*"
                    title="Please enter numbers, spaces, and these symbols: + - ( )"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="profilePicture" className="form-label">Profile Picture URL</label>
                <input 
                  type="url" 
                  id="profilePicture" 
                  name="profilePicture" 
                  className="input" 
                  placeholder="https://example.com/your-image.jpg" 
                  value={editProfileData.profilePicture}
                  onChange={handleEditProfileChange}
                />
                <p className="text-sm text-gray-500 mt-1">Leave blank to keep current image</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="bannerImage" className="form-label">Banner Image URL</label>
                <input 
                  type="url" 
                  id="bannerImage" 
                  name="bannerImage" 
                  className="input" 
                  placeholder="https://example.com/your-banner.jpg" 
                  value={editProfileData.bannerImage}
                  onChange={handleEditProfileChange}
                />
                <p className="text-sm text-gray-500 mt-1">Leave blank to keep current image</p>
              </div>
              
              <div className="modal-footer pt-4">
                <button 
                  type="button" 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
                >
                  <Save size={18} className="mr-2" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Movie Modal */}
      {modal.isOpen && modal.type === 'editMovie' && (
        <div 
          className="modal-backdrop" 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-movie-modal-title"
        >
          <div 
            className="modal-content max-w-xl w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="edit-movie-modal-title" className="text-xl font-bold flex items-center">
                <FileText className="mr-2 text-red-600" /> Edit Movie Details
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditMovie} className="space-y-6 mt-4">
              <div className="form-group">
                <label htmlFor="edit-title" className="form-label">Film Title</label>
                <input 
                  type="text" 
                  id="edit-title" 
                  name="title" 
                  className="input" 
                  placeholder="Enter film title" 
                  value={editMovieData.title}
                  onChange={handleEditMovieChange}
                  required
                />
              </div>
              
              {/* NEW: Short Description field for editing */}
              <div className="form-group">
                <label htmlFor="edit-shortDescription" className="form-label">
                  Short Description <span className="text-gray-500 text-sm">(Max 100 characters)</span>
                </label>
                <input 
                  type="text" 
                  id="edit-shortDescription" 
                  name="shortDescription" 
                  className="input" 
                  placeholder="Brief summary of your film" 
                  value={editMovieData.shortDescription}
                  onChange={handleEditMovieChange}
                  maxLength={100}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="edit-category" className="form-label">Category</label>
                  <select 
                    id="edit-category" 
                    name="category" 
                    className="input" 
                    value={editMovieData.category}
                    onChange={handleEditMovieChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Drama">Drama</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Action">Action</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Horror">Horror</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Animation">Animation</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-year" className="form-label">Release Year</label>
                  <input 
                    type="number" 
                    id="edit-year" 
                    name="year" 
                    className="input" 
                    placeholder="Enter release year" 
                    min="1900"
                    max={new Date().getFullYear()}
                    value={editMovieData.year}
                    onChange={handleEditMovieChange}
                    required
                  />
                </div>
              </div>
              
              {/* NEW: Language and Child-friendly fields for editing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="edit-language" className="form-label">Language of Film</label>
                  <select 
                    id="edit-language" 
                    name="language" 
                    className="input" 
                    value={editMovieData.language}
                    onChange={handleEditMovieChange}
                    required
                  >
                    <option value="">Select a language</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-childFriendly" className="form-label">Suitable for Children?</label>
                  <select 
                    id="edit-childFriendly" 
                    name="childFriendly" 
                    className="input" 
                    value={editMovieData.childFriendly ? 'yes' : 'no'}
                    onChange={handleEditMovieChange}
                    required
                  >
                    <option value="yes">Yes - Appropriate for children</option>
                    <option value="no">No - Contains mature content</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-description" className="form-label">Full Description</label>
                <textarea 
                  id="edit-description" 
                  name="description" 
                  className="input" 
                  placeholder="Enter film description" 
                  rows={4}
                  value={editMovieData.description}
                  onChange={handleEditMovieChange}
                  required
                ></textarea>
              </div>
              
              <div className="modal-footer pt-4">
                <button 
                  type="button" 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
                >
                  <Save size={18} className="mr-2" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Upload Movie Modal */}
      {modal.isOpen && modal.type === 'uploadMovie' && (
        <div 
          className="modal-backdrop" 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-modal-title"
        >
          <div 
            className="modal-content max-w-2xl w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="upload-modal-title" className="text-xl font-bold flex items-center">
                <Upload className="mr-2 text-red-600" /> Upload Your Film
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUploadMovie} className="space-y-4 mt-4">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Film Title</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  className="input" 
                  placeholder="Enter film title" 
                  required
                />
              </div>
              
              {/* NEW: Added Short Description field */}
              <div className="form-group">
                <label htmlFor="shortDescription" className="form-label">
                  Short Description <span className="text-gray-500 text-sm">(Max 100 characters)</span>
                </label>
                <input 
                  type="text" 
                  id="shortDescription" 
                  name="shortDescription" 
                  className="input" 
                  placeholder="Brief summary of your film" 
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">Concise summary for listings and previews</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select 
                    id="category" 
                    name="category" 
                    className="input" 
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Drama">Drama</option>
                    <option value="Comedy">Comedy</option>
                    <option value="Action">Action</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Horror">Horror</option>
                    <option value="Sci-Fi">Sci-Fi</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Thriller">Thriller</option>
                    <option value="Animation">Animation</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="year" className="form-label">Release Year</label>
                  <input 
                    type="number" 
                    id="year" 
                    name="year" 
                    className="input" 
                    placeholder="Enter release year" 
                    min="1900"
                    max={new Date().getFullYear()}
                    defaultValue={new Date().getFullYear()}
                    required
                  />
                </div>
              </div>
              
              {/* NEW: Added Language of film and Child content fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="language" className="form-label">Language of Film</label>
                  <select 
                    id="language" 
                    name="language" 
                    className="input" 
                    required
                  >
                    <option value="">Select a language</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="childFriendly" className="form-label">Suitable for Children?</label>
                  <select 
                    id="childFriendly" 
                    name="childFriendly" 
                    className="input" 
                    required
                  >
                    <option value="">Select an option</option>
                    <option value="yes">Yes - Appropriate for children</option>
                    <option value="no">No - Contains mature content</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">Full Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  className="input" 
                  placeholder="Enter film description" 
                  rows={4}
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="filmFile" className="form-label">Upload Film File</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <input 
                    type="file" 
                    id="filmFile" 
                    name="filmFile" 
                    className="hidden" 
                    accept="video/mp4,video/x-m4v,video/*"
                  />
                  <label htmlFor="filmFile" className="cursor-pointer flex flex-col items-center justify-center">
                    <Upload className="text-gray-400 w-12 h-12 mb-3" />
                    <p className="font-medium text-gray-700 dark:text-gray-300">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MP4, MOV, or AVI (max. 8GB)</p>
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="thumbnail" className="form-label">Upload Thumbnail</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <input 
                    type="file" 
                    id="thumbnail" 
                    name="thumbnail" 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/*"
                  />
                  <label htmlFor="thumbnail" className="cursor-pointer flex flex-col items-center justify-center">
                    <Upload className="text-gray-400 w-12 h-12 mb-3" />
                    <p className="font-medium text-gray-700 dark:text-gray-300">Upload film thumbnail</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG or PNG (16:9 ratio recommended)</p>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="termsAgree" 
                  name="termsAgree" 
                  type="checkbox" 
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="termsAgree" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  I confirm I have all rights to distribute this content and agree to the <a href="#" className="text-red-600 hover:text-red-500">Filmmaker Agreement</a>
                </label>
              </div>
              
              <div className="modal-footer pt-4">
                <button 
                  type="button" 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" 
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn bg-red-600 hover:bg-red-700 text-white"
                >
                  Upload Film
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  // Main render function
  return (
    <div className="min-h-screen flex flex-col">
      {renderHeader()}
      
      {currentSection === 'home' && renderHomeSection()}
      {currentSection === 'movies' && renderMoviesSection()}
      {currentSection === 'filmmaker' && renderFilmmakerSection()}
      {currentSection === 'about' && renderAboutSection()}
      {currentSection === 'challenge' && renderChallengeSection()} {/* Challenge section */}
      {currentSection === 'contact' && renderContactSection()} {/* Contact section */}
      {currentSection === 'dashboard' && renderDashboardSection()} {/* New Dashboard section */}
      
      {renderModals()}
      
      {/* Push footer to bottom */}
      <div className="flex-grow"></div>
      
      {renderFooter()}
    </div>
  );
};

export default App;
