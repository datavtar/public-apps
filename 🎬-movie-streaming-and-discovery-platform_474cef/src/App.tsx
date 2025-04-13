import React, { useState, useEffect, ReactElement } from 'react';
import { Film, Search, Star, Clock, Plus, User, Menu, Moon, Sun, X, Heart, Edit, Trash2, LogOut, Play, Filter, ChevronDown, UserCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  releaseYear: number;
  director: string;
  cast: string[];
  posterUrl: string;
  trailerUrl: string;
  duration: number; // in minutes
  rating: number;
  reviews: Review[];
  streamUrl: string;
  isNew: boolean;
  isTrending: boolean;
  uploadedBy: string;
  uploadedAt: string;
}

interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  watchlist: string[];
  history: string[];
  preferences: {
    genres: string[];
    favoriteDirectors: string[];
  };
  createdAt: string;
}

type AppTab = 'home' | 'movies' | 'watchlist' | 'profile' | 'admin';
type AdminTab = 'dashboard' | 'movies' | 'users';
type MovieView = 'grid' | 'list';
type ThemeMode = 'light' | 'dark';

const App: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showMovieModal, setShowMovieModal] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [movieView, setMovieView] = useState<MovieView>('grid');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [showStreamModal, setShowStreamModal] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  
  // Form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [movieForm, setMovieForm] = useState<Partial<Movie>>({
    title: '',
    description: '',
    genre: [],
    releaseYear: new Date().getFullYear(),
    director: '',
    cast: [],
    posterUrl: '',
    trailerUrl: '',
    duration: 120,
    streamUrl: '',
    isNew: true,
    isTrending: false
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    // Set theme from localStorage or system preference
    const savedTheme = localStorage.getItem('themeMode') as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setThemeMode(initialTheme);
    
    // Apply theme to document
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load saved data
    const savedMovies = localStorage.getItem('movies');
    const savedUsers = localStorage.getItem('users');
    const savedCurrentUser = localStorage.getItem('currentUser');

    if (savedMovies) setMovies(JSON.parse(savedMovies));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedCurrentUser) {
      setCurrentUser(JSON.parse(savedCurrentUser));
      setIsLoggedIn(true);
    }

    // If no movies exist, initialize with sample data
    if (!savedMovies) {
      const sampleMovies = generateSampleMovies();
      setMovies(sampleMovies);
      localStorage.setItem('movies', JSON.stringify(sampleMovies));
    }

    // If no users exist, initialize with sample data
    if (!savedUsers) {
      const sampleUsers = generateSampleUsers();
      setUsers(sampleUsers);
      localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
  }, []);

  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('movies', JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Update theme mode in localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  // Update filtered movies when search term, movies, or filters change
  useEffect(() => {
    let filtered = [...movies];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.title.toLowerCase().includes(term) ||
        movie.description.toLowerCase().includes(term) ||
        movie.director.toLowerCase().includes(term) ||
        movie.genre.some(g => g.toLowerCase().includes(term)) ||
        movie.cast.some(c => c.toLowerCase().includes(term))
      );
    }
    
    // Apply genre filter
    if (genreFilter && genreFilter !== 'all') {
      filtered = filtered.filter(movie => 
        movie.genre.some(g => g.toLowerCase() === genreFilter.toLowerCase())
      );
    }
    
    // Apply year filter
    if (yearFilter && yearFilter !== 'all') {
      const year = parseInt(yearFilter, 10);
      filtered = filtered.filter(movie => movie.releaseYear === year);
    }
    
    setFilteredMovies(filtered);
  }, [searchTerm, movies, genreFilter, yearFilter]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLoginModal(false);
        setShowRegisterModal(false);
        setShowMovieModal(false);
        setShowReviewModal(false);
        setShowStreamModal(false);
        setShowFilters(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Generate sample data
  const generateSampleMovies = (): Movie[] => {
    return [
      {
        id: '1',
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        releaseYear: 2010,
        director: 'Christopher Nolan',
        cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page'],
        posterUrl: 'https://images.unsplash.com/photo-1507072091877-0ce88d67db2a?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTl8fHxlbnwwfHx8fHw%3D',
        trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
        duration: 148,
        rating: 4.8,
        reviews: [
          {
            id: '101',
            userId: '1',
            username: 'moviebuff',
            rating: 5,
            comment: 'Mind-blowing concept and execution!',
            createdAt: '2022-01-15T08:30:00Z'
          },
          {
            id: '102',
            userId: '2',
            username: 'filmcritic',
            rating: 4.5,
            comment: 'Visually stunning with a complex plot.',
            createdAt: '2022-02-20T14:15:00Z'
          }
        ],
        streamUrl: 'https://example.com/stream/inception',
        isNew: false,
        isTrending: true,
        uploadedBy: 'admin',
        uploadedAt: '2021-12-01T10:00:00Z'
      },
      {
        id: '2',
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        genre: ['Drama'],
        releaseYear: 1994,
        director: 'Frank Darabont',
        cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
        posterUrl: 'https://images.unsplash.com/photo-1611331517345-f5b5c0ab3fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8OXx8fGVufDB8fHx8fA%3D%3D',
        trailerUrl: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
        duration: 142,
        rating: 4.9,
        reviews: [
          {
            id: '103',
            userId: '3',
            username: 'cinephile',
            rating: 5,
            comment: 'One of the greatest films ever made!',
            createdAt: '2022-03-10T19:45:00Z'
          }
        ],
        streamUrl: 'https://example.com/stream/shawshank-redemption',
        isNew: false,
        isTrending: true,
        uploadedBy: 'admin',
        uploadedAt: '2021-11-15T09:30:00Z'
      },
      {
        id: '3',
        title: 'Dune',
        description: 'Feature adaptation of Frank Herbert\'s science fiction novel about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        releaseYear: 2021,
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Rebecca Ferguson', 'Zendaya'],
        posterUrl: 'https://images.unsplash.com/photo-1610487596755-39b23e66146d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D',
        trailerUrl: 'https://www.youtube.com/watch?v=8g18jFHCLXk',
        duration: 155,
        rating: 4.7,
        reviews: [
          {
            id: '104',
            userId: '1',
            username: 'moviebuff',
            rating: 4.5,
            comment: 'Visually stunning adaptation of the classic novel.',
            createdAt: '2022-01-05T16:20:00Z'
          }
        ],
        streamUrl: 'https://example.com/stream/dune',
        isNew: true,
        isTrending: true,
        uploadedBy: 'admin',
        uploadedAt: '2022-01-01T11:15:00Z'
      },
      {
        id: '4',
        title: 'The Godfather',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        genre: ['Crime', 'Drama'],
        releaseYear: 1972,
        director: 'Francis Ford Coppola',
        cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
        posterUrl: 'https://images.unsplash.com/photo-1473893604213-3df9c15611c0?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8N3x8fGVufDB8fHx8fA%3D%3D',
        trailerUrl: 'https://www.youtube.com/watch?v=sY1S34973zA',
        duration: 175,
        rating: 4.9,
        reviews: [
          {
            id: '105',
            userId: '2',
            username: 'filmcritic',
            rating: 5,
            comment: 'A masterpiece of cinema.',
            createdAt: '2022-02-15T11:30:00Z'
          }
        ],
        streamUrl: 'https://example.com/stream/the-godfather',
        isNew: false,
        isTrending: false,
        uploadedBy: 'admin',
        uploadedAt: '2021-10-10T08:45:00Z'
      },
      {
        id: '5',
        title: 'Parasite',
        description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
        genre: ['Drama', 'Thriller', 'Comedy'],
        releaseYear: 2019,
        director: 'Bong Joon Ho',
        cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
        posterUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MTB8fHxlbnwwfHx8fHw%3D',
        trailerUrl: 'https://www.youtube.com/watch?v=5xH0HfJHsaY',
        duration: 132,
        rating: 4.6,
        reviews: [
          {
            id: '106',
            userId: '3',
            username: 'cinephile',
            rating: 4.5,
            comment: 'Brilliant social commentary with unexpected twists.',
            createdAt: '2022-03-01T20:10:00Z'
          }
        ],
        streamUrl: 'https://example.com/stream/parasite',
        isNew: false,
        isTrending: false,
        uploadedBy: 'admin',
        uploadedAt: '2021-09-20T13:00:00Z'
      },
      {
        id: '6',
        title: 'Avengers: Endgame',
        description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. The Avengers assemble once more to undo Thanos\'s actions and restore order to the universe.',
        genre: ['Action', 'Adventure', 'Sci-Fi'],
        releaseYear: 2019,
        director: 'Anthony Russo, Joe Russo',
        cast: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo'],
        posterUrl: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8Nnx8fGVufDB8fHx8fA%3D%3D',
        trailerUrl: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
        duration: 181,
        rating: 4.7,
        reviews: [
          {
            id: '107',
            userId: '1',
            username: 'moviebuff',
            rating: 5,
            comment: 'Epic conclusion to the Infinity Saga!',
            createdAt: '2022-01-20T14:05:00Z'
          }
        ],
        streamUrl: 'https://example.com/stream/avengers-endgame',
        isNew: false,
        isTrending: true,
        uploadedBy: 'admin',
        uploadedAt: '2021-08-15T15:30:00Z'
      }
    ];
  };

  const generateSampleUsers = (): User[] => {
    return [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123', // In a real app, never store plain text passwords
        isAdmin: true,
        watchlist: ['2', '5'],
        history: ['1', '3', '4'],
        preferences: {
          genres: ['Sci-Fi', 'Drama', 'Thriller'],
          favoriteDirectors: ['Christopher Nolan', 'Denis Villeneuve']
        },
        createdAt: '2021-01-01T00:00:00Z'
      },
      {
        id: '2',
        username: 'moviebuff',
        email: 'user1@example.com',
        password: 'password123',
        isAdmin: false,
        watchlist: ['1', '4'],
        history: ['2', '6'],
        preferences: {
          genres: ['Action', 'Adventure', 'Fantasy'],
          favoriteDirectors: ['Francis Ford Coppola', 'Steven Spielberg']
        },
        createdAt: '2021-02-15T15:30:00Z'
      },
      {
        id: '3',
        username: 'filmcritic',
        email: 'user2@example.com',
        password: 'password123',
        isAdmin: false,
        watchlist: ['3', '6'],
        history: ['1', '2', '5'],
        preferences: {
          genres: ['Drama', 'Documentary', 'Horror'],
          favoriteDirectors: ['Martin Scorsese', 'Quentin Tarantino']
        },
        createdAt: '2021-03-20T09:45:00Z'
      }
    ];
  };

  // Login/Register handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = loginForm;
    
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setLoginForm({ email: '', password: '' });
    } else {
      alert('Invalid email or password');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = registerForm;
    
    // Validation
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (users.some(u => u.email === email)) {
      alert('Email already in use');
      return;
    }
    
    if (users.some(u => u.username === username)) {
      alert('Username already taken');
      return;
    }
    
    // Create new user
    const newUser: User = {
      id: (users.length + 1).toString(),
      username,
      email,
      password, // In a real app, this should be hashed
      isAdmin: false,
      watchlist: [],
      history: [],
      preferences: {
        genres: [],
        favoriteDirectors: []
      },
      createdAt: new Date().toISOString()
    };
    
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setShowRegisterModal(false);
    setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setActiveTab('home');
  };

  // Movie management handlers
  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.isAdmin) {
      alert('Only admins can add movies');
      return;
    }
    
    // Create new movie
    const newMovie: Movie = {
      id: (movies.length + 1).toString(),
      title: movieForm.title || '',
      description: movieForm.description || '',
      genre: typeof movieForm.genre === 'string' 
        ? (movieForm.genre as string).split(',').map(g => g.trim())
        : movieForm.genre || [],
      releaseYear: movieForm.releaseYear || new Date().getFullYear(),
      director: movieForm.director || '',
      cast: typeof movieForm.cast === 'string'
        ? (movieForm.cast as string).split(',').map(c => c.trim())
        : movieForm.cast || [],
      posterUrl: movieForm.posterUrl || '',
      trailerUrl: movieForm.trailerUrl || '',
      duration: movieForm.duration || 120,
      rating: 0,
      reviews: [],
      streamUrl: movieForm.streamUrl || '',
      isNew: movieForm.isNew || false,
      isTrending: movieForm.isTrending || false,
      uploadedBy: currentUser.username,
      uploadedAt: new Date().toISOString()
    };
    
    setMovies([...movies, newMovie]);
    setShowMovieModal(false);
    resetMovieForm();
  };

  const handleUpdateMovie = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.isAdmin || !selectedMovie) {
      return;
    }
    
    // Update movie
    const updatedMovies = movies.map(movie => {
      if (movie.id === selectedMovie.id) {
        return {
          ...movie,
          title: movieForm.title || movie.title,
          description: movieForm.description || movie.description,
          genre: typeof movieForm.genre === 'string'
            ? (movieForm.genre as string).split(',').map(g => g.trim())
            : movieForm.genre || movie.genre,
          releaseYear: movieForm.releaseYear || movie.releaseYear,
          director: movieForm.director || movie.director,
          cast: typeof movieForm.cast === 'string'
            ? (movieForm.cast as string).split(',').map(c => c.trim())
            : movieForm.cast || movie.cast,
          posterUrl: movieForm.posterUrl || movie.posterUrl,
          trailerUrl: movieForm.trailerUrl || movie.trailerUrl,
          duration: movieForm.duration || movie.duration,
          streamUrl: movieForm.streamUrl || movie.streamUrl,
          isNew: movieForm.isNew !== undefined ? movieForm.isNew : movie.isNew,
          isTrending: movieForm.isTrending !== undefined ? movieForm.isTrending : movie.isTrending
        };
      }
      return movie;
    });
    
    setMovies(updatedMovies);
    setShowMovieModal(false);
    setSelectedMovie(null);
    resetMovieForm();
  };

  const handleDeleteMovie = (id: string) => {
    if (!currentUser?.isAdmin) {
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this movie?')) {
      setMovies(movies.filter(movie => movie.id !== id));
      
      // Update users' watchlists and history
      const updatedUsers = users.map(user => ({
        ...user,
        watchlist: user.watchlist.filter(movieId => movieId !== id),
        history: user.history.filter(movieId => movieId !== id)
      }));
      
      setUsers(updatedUsers);
      
      // Update current user if logged in
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          watchlist: currentUser.watchlist.filter(movieId => movieId !== id),
          history: currentUser.history.filter(movieId => movieId !== id)
        });
      }
    }
  };

  const handleAddToWatchlist = (movieId: string) => {
    if (!isLoggedIn || !currentUser) {
      setShowLoginModal(true);
      return;
    }
    
    // Check if movie is already in watchlist
    if (currentUser.watchlist.includes(movieId)) {
      // Remove from watchlist
      const updatedWatchlist = currentUser.watchlist.filter(id => id !== movieId);
      const updatedUser = { ...currentUser, watchlist: updatedWatchlist };
      
      setCurrentUser(updatedUser);
      setUsers(users.map(user => user.id === currentUser.id ? updatedUser : user));
    } else {
      // Add to watchlist
      const updatedWatchlist = [...currentUser.watchlist, movieId];
      const updatedUser = { ...currentUser, watchlist: updatedWatchlist };
      
      setCurrentUser(updatedUser);
      setUsers(users.map(user => user.id === currentUser.id ? updatedUser : user));
    }
  };

  const handleWatchMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowStreamModal(true);
    
    if (isLoggedIn && currentUser) {
      // Add to history if not already there
      if (!currentUser.history.includes(movie.id)) {
        const updatedHistory = [...currentUser.history, movie.id];
        const updatedUser = { ...currentUser, history: updatedHistory };
        
        setCurrentUser(updatedUser);
        setUsers(users.map(user => user.id === currentUser.id ? updatedUser : user));
      }
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn || !currentUser || !selectedMovie) {
      return;
    }
    
    // Create new review
    const newReview: Review = {
      id: `${selectedMovie.reviews.length + 1}`,
      userId: currentUser.id,
      username: currentUser.username,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      createdAt: new Date().toISOString()
    };
    
    // Update movie
    const updatedMovies = movies.map(movie => {
      if (movie.id === selectedMovie.id) {
        const updatedReviews = [...movie.reviews, newReview];
        // Calculate new average rating
        const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
        const newRating = Math.round((totalRating / updatedReviews.length) * 10) / 10;
        
        return {
          ...movie,
          reviews: updatedReviews,
          rating: newRating
        };
      }
      return movie;
    });
    
    setMovies(updatedMovies);
    setSelectedMovie(null);
    setShowReviewModal(false);
    setReviewForm({ rating: 5, comment: '' });
  };

  // Helper functions
  const resetMovieForm = () => {
    setMovieForm({
      title: '',
      description: '',
      genre: [],
      releaseYear: new Date().getFullYear(),
      director: '',
      cast: [],
      posterUrl: '',
      trailerUrl: '',
      duration: 120,
      streamUrl: '',
      isNew: true,
      isTrending: false
    });
  };

  const initializeEditMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setMovieForm({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      releaseYear: movie.releaseYear,
      director: movie.director,
      cast: movie.cast,
      posterUrl: movie.posterUrl,
      trailerUrl: movie.trailerUrl,
      duration: movie.duration,
      streamUrl: movie.streamUrl,
      isNew: movie.isNew,
      isTrending: movie.isTrending
    });
    setShowMovieModal(true);
  };

  const isInWatchlist = (movieId: string): boolean => {
    return currentUser ? currentUser.watchlist.includes(movieId) : false;
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  // Get unique genres and years for filters
  const getUniqueGenres = (): string[] => {
    const genreSet = new Set<string>();
    movies.forEach(movie => movie.genre.forEach(genre => genreSet.add(genre)));
    return Array.from(genreSet).sort();
  };

  const getUniqueYears = (): number[] => {
    const yearSet = new Set<number>();
    movies.forEach(movie => yearSet.add(movie.releaseYear));
    return Array.from(yearSet).sort((a, b) => b - a); // Sort descending
  };

  // Calculate statistics for admin dashboard
  const getStatistics = () => {
    // Total movies by genre
    const genreCounts: { name: string; count: number }[] = [];
    const genreMap = new Map<string, number>();
    
    movies.forEach(movie => {
      movie.genre.forEach(genre => {
        genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
      });
    });
    
    genreMap.forEach((count, name) => {
      genreCounts.push({ name, count });
    });
    
    // Ratings distribution
    const ratingGroups = [
      { name: '5 Stars', count: 0 },
      { name: '4 Stars', count: 0 },
      { name: '3 Stars', count: 0 },
      { name: '2 Stars', count: 0 },
      { name: '1 Star', count: 0 }
    ];
    
    movies.forEach(movie => {
      if (movie.rating >= 4.5) ratingGroups[0].count++;
      else if (movie.rating >= 3.5) ratingGroups[1].count++;
      else if (movie.rating >= 2.5) ratingGroups[2].count++;
      else if (movie.rating >= 1.5) ratingGroups[3].count++;
      else ratingGroups[4].count++;
    });
    
    // Most watched movies
    const watchCounts = movies.map(movie => {
      const watchCount = users.reduce((count, user) => {
        return count + (user.history.includes(movie.id) ? 1 : 0);
      }, 0);
      return { name: movie.title, count: watchCount };
    }).sort((a, b) => b.count - a.count).slice(0, 5);
    
    // User activity
    const userActivity = users.map(user => {
      return { name: user.username, watchCount: user.history.length, watchlistCount: user.watchlist.length };
    });
    
    return { genreCounts, ratingGroups, watchCounts, userActivity };
  };

  // Chart data
  const statistics = getStatistics();
  
  const genreChartData = statistics.genreCounts;
  const ratingChartData = statistics.ratingGroups;
  const watchCountChartData = statistics.watchCounts;
  
  const pieColors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57', '#ffc658'];

  // Get recommended movies for user
  const getRecommendedMovies = (): Movie[] => {
    if (!currentUser) return [];
    
    // Step 1: Get user's genre preferences
    const userGenres = new Set(currentUser.preferences.genres);
    
    // Step 2: Add genres from user's watched movies
    const watchedMovies = movies.filter(movie => currentUser.history.includes(movie.id));
    watchedMovies.forEach(movie => movie.genre.forEach(g => userGenres.add(g)));
    
    // Step 3: Filter movies based on genres, exclude already watched
    const recommendations = movies.filter(movie => 
      !currentUser.history.includes(movie.id) && 
      movie.genre.some(genre => userGenres.has(genre))
    );
    
    // Step 4: Sort by rating
    return recommendations.sort((a, b) => b.rating - a.rating).slice(0, 4);
  };

  // Get trending movies
  const getTrendingMovies = (): Movie[] => {
    return movies.filter(movie => movie.isTrending).slice(0, 4);
  };

  // Get new releases
  const getNewReleases = (): Movie[] => {
    return movies.filter(movie => movie.isNew).slice(0, 4);
  };

  // Render movie card
  const renderMovieCard = (movie: Movie): ReactElement => {
    return (
      <div 
        key={movie.id} 
        className="card relative group overflow-hidden bg-white dark:bg-slate-800 shadow-md rounded-lg transition-all hover:shadow-xl"
      >
        {/* Movie poster */}
        <div className="relative aspect-w-2 aspect-h-3 overflow-hidden rounded-t-lg">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button 
                onClick={() => handleWatchMovie(movie)}
                className="btn btn-sm bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-1"
                aria-label={`Watch ${movie.title}`}
              >
                <Play size={16} />
                Watch
              </button>
              <button 
                onClick={() => handleAddToWatchlist(movie.id)}
                className={`btn btn-sm ${isInWatchlist(movie.id) ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white flex items-center gap-1`}
                aria-label={isInWatchlist(movie.id) ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
              >
                {isInWatchlist(movie.id) ? (
                  <>
                    <X size={16} />
                    Remove
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Watchlist
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {movie.isNew && (
              <span className="badge badge-info">New</span>
            )}
            {movie.isTrending && (
              <span className="badge badge-warning">Trending</span>
            )}
          </div>
        </div>
        
        {/* Movie info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 dark:text-white">{movie.title}</h3>
          <div className="flex items-center mb-2">
            <Star className="text-yellow-500" size={16} />
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">{movie.rating.toFixed(1)}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">{movie.releaseYear}</span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-sm text-gray-600 dark:text-gray-300">{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genre.map((genre, index) => (
              <span 
                key={index} 
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{movie.description}</p>
          
          {/* Admin actions */}
          {currentUser?.isAdmin && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button 
                onClick={() => initializeEditMovie(movie)}
                className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
                aria-label={`Edit ${movie.title}`}
              >
                <Edit size={14} />
                Edit
              </button>
              <button 
                onClick={() => handleDeleteMovie(movie.id)}
                className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                aria-label={`Delete ${movie.title}`}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render movie list item
  const renderMovieListItem = (movie: Movie): ReactElement => {
    return (
      <div 
        key={movie.id}
        className="flex p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
      >
        {/* Movie poster thumbnail */}
        <div className="flex-shrink-0 w-16 h-24 sm:w-24 sm:h-36 overflow-hidden rounded">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Movie details */}
        <div className="ml-4 flex-grow">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <h3 className="text-lg font-semibold dark:text-white">{movie.title}</h3>
            <div className="flex items-center mt-1 sm:mt-0">
              <Star className="text-yellow-500" size={16} />
              <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">{movie.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span>{movie.releaseYear}</span>
            <span className="mx-2">•</span>
            <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
            <span className="mx-2">•</span>
            <span>{movie.director}</span>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genre.map((genre, index) => (
              <span 
                key={index} 
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 md:line-clamp-3">
            {movie.description}
          </p>
          
          {/* Badges */}
          <div className="mt-2 flex gap-1">
            {movie.isNew && (
              <span className="badge badge-info">New</span>
            )}
            {movie.isTrending && (
              <span className="badge badge-warning">Trending</span>
            )}
          </div>
          
          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <button 
              onClick={() => handleWatchMovie(movie)}
              className="btn btn-sm bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-1"
              aria-label={`Watch ${movie.title}`}
            >
              <Play size={16} />
              Watch
            </button>
            <button 
              onClick={() => handleAddToWatchlist(movie.id)}
              className={`btn btn-sm ${isInWatchlist(movie.id) ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white flex items-center gap-1`}
              aria-label={isInWatchlist(movie.id) ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
            >
              {isInWatchlist(movie.id) ? (
                <>
                  <X size={16} />
                  Remove
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Watchlist
                </>
              )}
            </button>
            
            {/* Admin actions */}
            {currentUser?.isAdmin && (
              <>
                <button 
                  onClick={() => initializeEditMovie(movie)}
                  className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
                  aria-label={`Edit ${movie.title}`}
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteMovie(movie.id)}
                  className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                  aria-label={`Delete ${movie.title}`}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Screen components
  const renderHomePage = (): ReactElement => {
    const trendingMovies = getTrendingMovies();
    const newReleases = getNewReleases();
    const recommendedMovies = getRecommendedMovies();
    
    return (
      <div className="space-y-8">
        {/* Hero section */}
        <div className={`${styles.heroSection} rounded-xl overflow-hidden relative`}>
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
          <div className="relative z-10 p-6 sm:p-10 flex flex-col h-full justify-end">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Unlimited Movies
            </h1>
            <p className="text-lg text-gray-200 mb-4 max-w-xl">
              Watch anywhere. Cancel anytime. Stream the latest movies and shows from your favorite genres.
            </p>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setActiveTab('movies')}
                className="btn bg-primary-600 hover:bg-primary-700 text-white"
                aria-label="Browse movies"
              >
                Browse Movies
              </button>
              {!isLoggedIn && (
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="btn bg-gray-800 hover:bg-gray-900 text-white"
                  aria-label="Sign up"
                >
                  Sign Up Now
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Trending section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">Trending Now</h2>
            <button 
              onClick={() => setActiveTab('movies')}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              aria-label="View all trending movies"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingMovies.map(movie => renderMovieCard(movie))}
          </div>
        </section>
        
        {/* New releases section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">New Releases</h2>
            <button 
              onClick={() => setActiveTab('movies')}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              aria-label="View all new releases"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {newReleases.map(movie => renderMovieCard(movie))}
          </div>
        </section>
        
        {/* Recommended section - only show if logged in */}
        {isLoggedIn && recommendedMovies.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">Recommended For You</h2>
              <button 
                onClick={() => setActiveTab('movies')}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                aria-label="View all recommended movies"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedMovies.map(movie => renderMovieCard(movie))}
            </div>
          </section>
        )}
      </div>
    );
  };
  
  const renderMoviesPage = (): ReactElement => {
    return (
      <div>
        {/* Search & filter section */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search bar */}
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search movies by title, genre, director..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search movies"
              />
            </div>
            
            {/* Filter toggle button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="btn flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              aria-expanded={showFilters}
              aria-controls="filter-panel"
              aria-label="Toggle filters"
            >
              <Filter size={18} />
              Filters
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
            </button>
            
            {/* View toggle */}
            <div className="flex border border-gray-300 dark:border-slate-600 rounded-md overflow-hidden">
              <button
                onClick={() => setMovieView('grid')}
                className={`px-3 py-2 flex-1 flex justify-center items-center ${movieView === 'grid' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
                aria-label="Grid view"
                aria-pressed={movieView === 'grid'}
              >
                Grid
              </button>
              <button
                onClick={() => setMovieView('list')}
                className={`px-3 py-2 flex-1 flex justify-center items-center ${movieView === 'list' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
                aria-label="List view"
                aria-pressed={movieView === 'list'}
              >
                List
              </button>
            </div>
          </div>
          
          {/* Filters panel */}
          {showFilters && (
            <div id="filter-panel" className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Genre filter */}
              <div>
                <label htmlFor="genre-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Genre
                </label>
                <select
                  id="genre-filter"
                  className="input"
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  aria-label="Filter by genre"
                >
                  <option value="all">All Genres</option>
                  {getUniqueGenres().map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
              
              {/* Year filter */}
              <div>
                <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Release Year
                </label>
                <select
                  id="year-filter"
                  className="input"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  aria-label="Filter by release year"
                >
                  <option value="all">All Years</option>
                  {getUniqueYears().map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Movie display */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No movies found matching your search criteria.
            </p>
          </div>
        ) : movieView === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map(movie => renderMovieCard(movie))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            {filteredMovies.map(movie => renderMovieListItem(movie))}
          </div>
        )}
      </div>
    );
  };
  
  const renderWatchlistPage = (): ReactElement => {
    if (!isLoggedIn) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Your Watchlist</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your watchlist.</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="btn bg-primary-600 hover:bg-primary-700 text-white"
            aria-label="Log in to view watchlist"
          >
            Log In
          </button>
        </div>
      );
    }
    
    const watchlistMovies = movies.filter(movie => currentUser?.watchlist.includes(movie.id));
    
    if (watchlistMovies.length === 0) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Your Watchlist</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your watchlist is empty.</p>
          <button
            onClick={() => setActiveTab('movies')}
            className="btn bg-primary-600 hover:bg-primary-700 text-white"
            aria-label="Browse movies to add to your watchlist"
          >
            Browse Movies
          </button>
        </div>
      );
    }
    
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Your Watchlist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchlistMovies.map(movie => renderMovieCard(movie))}
        </div>
      </div>
    );
  };
  
  const renderProfilePage = (): ReactElement => {
    if (!isLoggedIn) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Your Profile</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your profile.</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="btn bg-primary-600 hover:bg-primary-700 text-white"
            aria-label="Log in to view profile"
          >
            Log In
          </button>
        </div>
      );
    }
    
    const watchHistory = movies.filter(movie => currentUser?.history.includes(movie.id));
    
    return (
      <div className="space-y-8">
        {/* Profile card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User size={48} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-2xl font-bold dark:text-white">{currentUser?.username}</h2>
              <p className="text-gray-600 dark:text-gray-400">{currentUser?.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Member since {new Date(currentUser?.createdAt || '').toLocaleDateString()}
              </p>
              
              {/* User stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <div className="stat-card">
                  <span className="stat-title">Movies Watched</span>
                  <span className="stat-value">{currentUser?.history.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">In Watchlist</span>
                  <span className="stat-value">{currentUser?.watchlist.length}</span>
                </div>
                <div className="stat-card sm:col-span-2 md:col-span-1">
                  <span className="stat-title">Favorite Genres</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {currentUser?.preferences.genres.map((genre, index) => (
                      <span key={index} className="badge badge-info">{genre}</span>
                    )) || <span className="text-sm text-gray-500 dark:text-gray-400">None set</span>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleLogout}
                className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                aria-label="Log out"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
        
        {/* Watch history */}
        <div>
          <h3 className="text-xl font-bold mb-4 dark:text-white">Watch History</h3>
          {watchHistory.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">You haven't watched any movies yet.</p>
              <button
                onClick={() => setActiveTab('movies')}
                className="btn bg-primary-600 hover:bg-primary-700 text-white mt-4"
                aria-label="Browse movies to watch"
              >
                Browse Movies
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {watchHistory.map(movie => renderMovieCard(movie))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderAdminPage = (): ReactElement => {
    if (!currentUser?.isAdmin) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Admin Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => setActiveTab('home')}
            className="btn bg-primary-600 hover:bg-primary-700 text-white"
            aria-label="Return to home page"
          >
            Return to Home
          </button>
        </div>
      );
    }
    
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Admin Dashboard</h2>
        
        {/* Admin tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveAdminTab('dashboard')}
            className={`py-3 px-4 font-medium ${activeAdminTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            aria-label="View dashboard statistics"
            aria-pressed={activeAdminTab === 'dashboard'}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveAdminTab('movies')}
            className={`py-3 px-4 font-medium ${activeAdminTab === 'movies' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            aria-label="Manage movies"
            aria-pressed={activeAdminTab === 'movies'}
          >
            Manage Movies
          </button>
          <button
            onClick={() => setActiveAdminTab('users')}
            className={`py-3 px-4 font-medium ${activeAdminTab === 'users' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            aria-label="Manage users"
            aria-pressed={activeAdminTab === 'users'}
          >
            Manage Users
          </button>
        </div>
        
        {/* Tab content */}
        {activeAdminTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card bg-blue-50 dark:bg-blue-900/20">
                <span className="stat-title">Total Movies</span>
                <span className="stat-value">{movies.length}</span>
              </div>
              <div className="stat-card bg-green-50 dark:bg-green-900/20">
                <span className="stat-title">Total Users</span>
                <span className="stat-value">{users.length}</span>
              </div>
              <div className="stat-card bg-amber-50 dark:bg-amber-900/20">
                <span className="stat-title">New Releases</span>
                <span className="stat-value">{movies.filter(m => m.isNew).length}</span>
              </div>
              <div className="stat-card bg-purple-50 dark:bg-purple-900/20">
                <span className="stat-title">Trending Movies</span>
                <span className="stat-value">{movies.filter(m => m.isTrending).length}</span>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Genre distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Movies by Genre</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={genreChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.5} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#fff',
                          border: 'none',
                          borderRadius: '0.375rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: themeMode === 'dark' ? '#e2e8f0' : '#333'
                        }}
                      />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Rating distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Rating Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ratingChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {ratingChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} movies`, name]}
                        contentStyle={{
                          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#fff',
                          border: 'none',
                          borderRadius: '0.375rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: themeMode === 'dark' ? '#e2e8f0' : '#333'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Most watched movies */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Most Watched Movies</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={watchCountChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.5} />
                      <XAxis type="number" tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={120} />
                      <Tooltip 
                        formatter={(value) => [`${value} views`, 'Views']}
                        contentStyle={{
                          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#fff',
                          border: 'none',
                          borderRadius: '0.375rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: themeMode === 'dark' ? '#e2e8f0' : '#333'
                        }}
                      />
                      <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* User activity */}
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
                <h3 className="text-lg font-medium mb-4 dark:text-white">User Activity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statistics.userActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" strokeOpacity={0.5} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: themeMode === 'dark' ? '#1e293b' : '#fff',
                          border: 'none',
                          borderRadius: '0.375rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          color: themeMode === 'dark' ? '#e2e8f0' : '#333'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="watchCount" name="Movies Watched" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="watchlistCount" name="Watchlist Size" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeAdminTab === 'movies' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium dark:text-white">All Movies</h3>
              <button
                onClick={() => {
                  resetMovieForm();
                  setSelectedMovie(null);
                  setShowMovieModal(true);
                }}
                className="btn bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-1"
                aria-label="Add new movie"
              >
                <Plus size={18} />
                Add Movie
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Title</th>
                    <th className="table-header">Genre</th>
                    <th className="table-header">Year</th>
                    <th className="table-header">Rating</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {movies.map(movie => (
                    <tr key={movie.id}>
                      <td className="table-cell font-medium dark:text-white">{movie.title}</td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {movie.genre.map((g, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded">
                              {g}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="table-cell">{movie.releaseYear}</td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <Star className="text-yellow-500" size={16} />
                          <span className="ml-1">{movie.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-1">
                          {movie.isNew && <span className="badge badge-info">New</span>}
                          {movie.isTrending && <span className="badge badge-warning">Trending</span>}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex gap-2">
                          <button
                            onClick={() => initializeEditMovie(movie)}
                            className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white"
                            aria-label={`Edit ${movie.title}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteMovie(movie.id)}
                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                            aria-label={`Delete ${movie.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeAdminTab === 'users' && (
          <div>
            <h3 className="text-xl font-medium mb-6 dark:text-white">Manage Users</h3>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Username</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Role</th>
                    <th className="table-header">Joined</th>
                    <th className="table-header">Movies Watched</th>
                    <th className="table-header">Watchlist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="table-cell font-medium dark:text-white flex items-center gap-2">
                        {user.isAdmin && <UserCheck size={16} className="text-blue-500" />}
                        {user.username}
                      </td>
                      <td className="table-cell">{user.email}</td>
                      <td className="table-cell">
                        {user.isAdmin ? (
                          <span className="badge badge-success">Admin</span>
                        ) : (
                          <span className="badge badge-info">User</span>
                        )}
                      </td>
                      <td className="table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="table-cell">{user.history.length}</td>
                      <td className="table-cell">{user.watchlist.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen font-sans">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Film className="text-primary-600 dark:text-primary-400" size={28} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">MovieStream</h1>
            </div>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('home')}
                className={`py-2 font-medium ${activeTab === 'home' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                aria-label="Home"
                aria-current={activeTab === 'home' ? 'page' : undefined}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('movies')}
                className={`py-2 font-medium ${activeTab === 'movies' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                aria-label="Movies"
                aria-current={activeTab === 'movies' ? 'page' : undefined}
              >
                Movies
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`py-2 font-medium ${activeTab === 'watchlist' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                aria-label="Watchlist"
                aria-current={activeTab === 'watchlist' ? 'page' : undefined}
              >
                Watchlist
              </button>
              {isLoggedIn && currentUser?.isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`py-2 font-medium ${activeTab === 'admin' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
                  aria-label="Admin"
                  aria-current={activeTab === 'admin' ? 'page' : undefined}
                >
                  Admin
                </button>
              )}
            </nav>
            
            {/* User controls */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700"
                aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {themeMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {/* User menu */}
              {isLoggedIn ? (
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                  aria-label="View profile"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 hidden sm:inline-block">
                    {currentUser?.username}
                  </span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="btn btn-sm bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-slate-700"
                    aria-label="Log in"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="btn btn-sm bg-primary-600 hover:bg-primary-700 text-white"
                    aria-label="Sign up"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700"
                aria-label="Menu"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container-fluid py-6">
        {activeTab === 'home' && renderHomePage()}
        {activeTab === 'movies' && renderMoviesPage()}
        {activeTab === 'watchlist' && renderWatchlistPage()}
        {activeTab === 'profile' && renderProfilePage()}
        {activeTab === 'admin' && renderAdminPage()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-inner py-6">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Film className="text-primary-600 dark:text-primary-400" size={24} />
              <span className="text-lg font-bold text-gray-900 dark:text-white">MovieStream</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Copyright © 2025 of Datavtar Private Limited. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Modals */}
      {/* Login Modal */}
      {showLoginModal && (
        <div 
          className="modal-backdrop" 
          onClick={() => setShowLoginModal(false)}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="login-modal-title" className="text-lg font-medium dark:text-white">Log In</h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label="Close login modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleLogin}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="login-email" className="form-label">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    className="input"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="login-password" className="form-label">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    className="input"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                  }}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
                  aria-label="Switch to sign up"
                >
                  Sign Up
                </button>
                <button
                  type="submit"
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                  aria-label="Log in"
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Register Modal */}
      {showRegisterModal && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowRegisterModal(false)}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="register-modal-title" className="text-lg font-medium dark:text-white">Sign Up</h3>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label="Close sign up modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRegister}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label htmlFor="register-username" className="form-label">Username</label>
                  <input
                    id="register-username"
                    type="text"
                    className="input"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="register-email" className="form-label">Email</label>
                  <input
                    id="register-email"
                    type="email"
                    className="input"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="register-password" className="form-label">Password</label>
                  <input
                    id="register-password"
                    type="password"
                    className="input"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="register-confirm-password" className="form-label">Confirm Password</label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    className="input"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                  }}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
                  aria-label="Switch to log in"
                >
                  Log In
                </button>
                <button
                  type="submit"
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                  aria-label="Sign up"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Movie Form Modal */}
      {showMovieModal && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowMovieModal(false)}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="movie-modal-title" className="text-lg font-medium dark:text-white">
                {selectedMovie ? 'Edit Movie' : 'Add New Movie'}
              </h3>
              <button 
                onClick={() => setShowMovieModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label="Close movie form modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={selectedMovie ? handleUpdateMovie : handleAddMovie}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="form-group sm:col-span-2">
                  <label htmlFor="movie-title" className="form-label">Title</label>
                  <input
                    id="movie-title"
                    type="text"
                    className="input"
                    value={movieForm.title || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group sm:col-span-2">
                  <label htmlFor="movie-description" className="form-label">Description</label>
                  <textarea
                    id="movie-description"
                    className="input"
                    rows={3}
                    value={movieForm.description || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    required
                    aria-required="true"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="movie-genre" className="form-label">Genres (comma separated)</label>
                  <input
                    id="movie-genre"
                    type="text"
                    className="input"
                    value={Array.isArray(movieForm.genre) ? movieForm.genre.join(', ') : movieForm.genre || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="movie-director" className="form-label">Director</label>
                  <input
                    id="movie-director"
                    type="text"
                    className="input"
                    value={movieForm.director || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="movie-cast" className="form-label">Cast (comma separated)</label>
                  <input
                    id="movie-cast"
                    type="text"
                    className="input"
                    value={Array.isArray(movieForm.cast) ? movieForm.cast.join(', ') : movieForm.cast || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="movie-year" className="form-label">Release Year</label>
                  <input
                    id="movie-year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    className="input"
                    value={movieForm.releaseYear || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, releaseYear: parseInt(e.target.value, 10) })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="movie-duration" className="form-label">Duration (minutes)</label>
                  <input
                    id="movie-duration"
                    type="number"
                    min="1"
                    className="input"
                    value={movieForm.duration || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: parseInt(e.target.value, 10) })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group sm:col-span-2">
                  <label htmlFor="movie-poster" className="form-label">Poster URL</label>
                  <input
                    id="movie-poster"
                    type="url"
                    className="input"
                    value={movieForm.posterUrl || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group sm:col-span-2">
                  <label htmlFor="movie-trailer" className="form-label">Trailer URL</label>
                  <input
                    id="movie-trailer"
                    type="url"
                    className="input"
                    value={movieForm.trailerUrl || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group sm:col-span-2">
                  <label htmlFor="movie-stream" className="form-label">Stream URL</label>
                  <input
                    id="movie-stream"
                    type="url"
                    className="input"
                    value={movieForm.streamUrl || ''}
                    onChange={(e) => setMovieForm({ ...movieForm, streamUrl: e.target.value })}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                      checked={movieForm.isNew || false}
                      onChange={(e) => setMovieForm({ ...movieForm, isNew: e.target.checked })}
                      aria-label="Mark as new release"
                    />
                    Mark as New Release
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                      checked={movieForm.isTrending || false}
                      onChange={(e) => setMovieForm({ ...movieForm, isTrending: e.target.checked })}
                      aria-label="Mark as trending"
                    />
                    Mark as Trending
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowMovieModal(false)}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                  aria-label={selectedMovie ? 'Update movie' : 'Add movie'}
                >
                  {selectedMovie ? 'Update Movie' : 'Add Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Review Modal */}
      {showReviewModal && selectedMovie && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowReviewModal(false)}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="review-modal-title" className="text-lg font-medium dark:text-white">Write a Review</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label="Close review modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-400">{selectedMovie.title}</p>
            </div>
            <form onSubmit={handleAddReview}>
              <div className="space-y-4 mt-4">
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                        aria-pressed={star === reviewForm.rating}
                      >
                        <Star size={24} fill={star <= reviewForm.rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="review-comment" className="form-label">Your Review</label>
                  <textarea
                    id="review-comment"
                    className="input"
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    required
                    aria-required="true"
                    placeholder="Share your thoughts about this movie..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn bg-primary-600 hover:bg-primary-700 text-white"
                  aria-label="Submit review"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Stream Modal */}
      {showStreamModal && selectedMovie && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowStreamModal(false)}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="stream-modal-title" className="text-lg font-medium dark:text-white">{selectedMovie.title}</h3>
              <button 
                onClick={() => setShowStreamModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label="Close streaming modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              {/* Video player */}
              <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
                <div className="flex items-center justify-center text-white">
                  <div className="text-center">
                    <Play size={48} className="mx-auto mb-2" />
                    <p>Video player would be here</p>
                    <p className="text-sm text-gray-400 mt-2">Stream URL: {selectedMovie.streamUrl}</p>
                  </div>
                </div>
              </div>
              
              {/* Movie info and reviews */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h4 className="text-lg font-medium mb-2 dark:text-white">About this movie</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedMovie.description}</p>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Director:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200">{selectedMovie.director}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Release Year:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200">{selectedMovie.releaseYear}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                      <span className="ml-2 text-gray-800 dark:text-gray-200">{Math.floor(selectedMovie.duration / 60)}h {selectedMovie.duration % 60}m</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                      <span className="ml-2 flex items-center">
                        <Star className="text-yellow-500" size={16} />
                        <span className="ml-1 text-gray-800 dark:text-gray-200">{selectedMovie.rating.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-medium mt-6 mb-2 dark:text-white">Cast</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMovie.cast.map((actor, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium dark:text-white">Reviews</h4>
                    {isLoggedIn && (
                      <button 
                        onClick={() => setShowReviewModal(true)}
                        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        aria-label="Write a review"
                      >
                        Write a review
                      </button>
                    )}
                  </div>
                  
                  {selectedMovie.reviews.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet.</p>
                  ) : (
                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                      {selectedMovie.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                          <div className="flex justify-between items-start">
                            <span className="font-medium dark:text-white">{review.username}</span>
                            <div className="flex items-center">
                              <Star className="text-yellow-500" size={14} />
                              <span className="ml-1 text-sm">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{review.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => handleAddToWatchlist(selectedMovie.id)}
                className={`btn ${isInWatchlist(selectedMovie.id) ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white flex items-center gap-1`}
                aria-label={isInWatchlist(selectedMovie.id) ? `Remove from watchlist` : `Add to watchlist`}
              >
                {isInWatchlist(selectedMovie.id) ? (
                  <>
                    <X size={16} />
                    Remove from Watchlist
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add to Watchlist
                  </>
                )}
              </button>
              <button
                onClick={() => setShowStreamModal(false)}
                className="btn bg-primary-600 hover:bg-primary-700 text-white"
                aria-label="Close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;