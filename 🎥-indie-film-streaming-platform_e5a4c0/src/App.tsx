import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import styles from './styles/styles.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define types for the application
type UserRole = 'subscriber' | 'filmmaker' | 'guest';

interface Movie {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  category: string;
  year: number;
  rating: number;
  filmmaker: string;
  trending: boolean;
  uploadDate: string;
}

interface User { // This is the User data interface
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionDate?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

interface SignInFormData {
  email: string;
  password: string;
}

interface Quote {
  text: string;
  movie: string;
  character: string;
}

interface ModalState {
  isOpen: boolean;
  type: 'signIn' | 'signUp' | 'uploadMovie' | null;
}

interface AnalyticsData {
  month: string;
  subscribers: number;
  filmmakers: number;
  uploads: number;
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
        category: 'Fantasy',
        year: 2023,
        rating: 4.5,
        filmmaker: 'Sarah Johnson',
        trending: true,
        uploadDate: '2023-10-15',
      },
      {
        id: '2',
        title: 'Last Sunrise',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,drama',
        description: 'A powerful drama about family bonds and redemption.',
        category: 'Drama',
        year: 2023,
        rating: 4.8,
        filmmaker: 'Michael Chen',
        trending: true,
        uploadDate: '2023-11-02',
      },
      {
        id: '3',
        title: 'Nebula Rising',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,scifi',
        description: 'In a distant galaxy, a lone astronaut fights for survival.',
        category: 'Sci-Fi',
        year: 2022,
        rating: 4.3,
        filmmaker: 'Alex Rivera',
        trending: true,
        uploadDate: '2022-12-05',
      },
      {
        id: '4',
        title: 'Echoes of Time',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,thriller',
        description: 'A psychological thriller that bends reality and perception.',
        category: 'Thriller',
        year: 2023,
        rating: 4.6,
        filmmaker: 'Elena Petrov',
        trending: false,
        uploadDate: '2023-08-22',
      },
      {
        id: '5',
        title: 'Urban Rhythms',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,documentary',
        description: 'A documentary exploring underground music scenes around the world.',
        category: 'Documentary',
        year: 2022,
        rating: 4.2,
        filmmaker: 'Jamal Wilson',
        trending: false,
        uploadDate: '2022-11-15',
      },
      {
        id: '6',
        title: 'Whispering Shadows',
        imageUrl: 'https://source.unsplash.com/random/300x450?movie,horror',
        description: 'A haunting tale of supernatural forces in a small town.',
        category: 'Horror',
        year: 2023,
        rating: 4.4,
        filmmaker: 'Lena Miyazaki',
        trending: true,
        uploadDate: '2023-10-31',
      },
    ];
  });

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
  const openModal = (type: 'signIn' | 'signUp' | 'uploadMovie') => {
    setModal({ isOpen: true, type });
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null });
    document.body.classList.remove('modal-open');
  };

  // Form handlers
  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value
    }));
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

    const newUser: User = {
      id: Date.now().toString(),
      name: signUpData.name,
      email: signUpData.email,
      role: signUpData.role,
      subscriptionDate: new Date().toISOString()
    };

    // In a real app, we would send this to an API
    // For now, just update local state
    setAuthState({
      isAuthenticated: true,
      user: newUser
    });

    closeModal();
    alert(`Welcome, ${newUser.name}! You've successfully signed up as a ${newUser.role}.`);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we would validate against an API
    // For demo purposes, create a mock user
    const mockUser: User = {
      id: '12345',
      name: 'Demo User',
      email: signInData.email,
      role: 'subscriber',
      subscriptionDate: new Date().toISOString()
    };

    setAuthState({
      isAuthenticated: true,
      user: mockUser
    });

    closeModal();
    alert(`Welcome back, ${mockUser.name}!`);
  };

  const handleSignOut = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    setCurrentSection('home');
  };

  const handleUploadMovie = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newMovie: Movie = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      imageUrl: 'https://source.unsplash.com/random/300x450?movie,' + formData.get('category')?.toString().toLowerCase(),
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      year: parseInt(formData.get('year') as string, 10),
      rating: 0, // New uploads start with no rating
      filmmaker: authState.user?.name || 'Anonymous',
      trending: false,
      uploadDate: new Date().toISOString()
    };
    
    setMovies(prevMovies => [newMovie, ...prevMovies]);
    closeModal();
    alert(`"${newMovie.title}" has been successfully uploaded!`);
  };

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
                <li>
                  <button 
                    onClick={() => setCurrentSection('about')} 
                    className={`hover:text-red-500 transition-colors ${currentSection === 'about' ? 'text-red-500' : ''}`}
                  >
                    About Us
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
              <li>
                <button 
                  onClick={() => setCurrentSection('about')} 
                  className={`block w-full text-left py-2 px-4 hover:bg-gray-800 ${currentSection === 'about' ? 'text-red-500' : ''}`}
                >
                  About Us
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
              <li><button onClick={() => setCurrentSection('about')} className="hover:text-white">About Us</button></li>
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
                      {movie.description}
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
                openModal('uploadMovie');
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
                      {movie.description}
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
        
        {/* Hero section for filmmakers */}
        <div className={styles.filmmakerHero}>
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
          <div className="relative z-10 p-8 md:p-12 text-white max-w-2xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">Share Your Vision With The World</h2>
            <p className="text-lg mb-6">
              FilmHub connects independent filmmakers with audiences worldwide. 
              Upload your films, build your fanbase, and get discovered.
            </p>
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
              Get Started Today
            </button>
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
              <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="subscribers" name="Subscribers" fill="#3B82F6" />
                <Bar dataKey="filmmakers" name="Filmmakers" fill="#EF4444" />
                <Bar dataKey="uploads" name="Film Uploads" fill="#10B981" />
              </BarChart>
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
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="input" 
                  placeholder="Enter your email" 
                  value={signUpData.email}
                  onChange={handleSignUpChange}
                  required
                />
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
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
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
      
      {renderModals()}
      
      {/* Push footer to bottom */}
      <div className="flex-grow"></div>
      
      {renderFooter()}
    </div>
  );
};

export default App;
