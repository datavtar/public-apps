import React, { useState, useEffect } from 'react';
import { Bell, Bookmark, Calendar, ChevronLeft, ChevronRight, Film, Heart, Home, Info, MessageCircle, Pause, Play, Plus, Search, Settings, Star, User, X } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Movie {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  genre: string[];
  director: string;
  cast: string[];
  rating: number;
  duration: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  views: number;
  likes: number;
  isFeatured: boolean;
  isPremium: boolean;
  price?: number;
  isFavorite?: boolean;
  isWatchlist?: boolean;
}

interface Genre {
  id: string;
  name: string;
  count: number;
}

interface Review {
  id: string;
  movieId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  date: string;
}

interface UserData {
  favorites: string[];
  watchlist: string[];
  watchHistory: string[];
  reviews: Review[];
}

interface MarketplaceItem {
  id: string;
  movieId: string;
  price: number;
  type: 'buy' | 'rent';
  description: string;
}

// App Component
const App: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'watchlist' | 'marketplace' | 'profile'>('home');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showMovieDetails, setShowMovieDetails] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [userData, setUserData] = useState<UserData>({
    favorites: [],
    watchlist: [],
    watchHistory: [],
    reviews: []
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showTrailer, setShowTrailer] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Set Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Initialize Data
  useEffect(() => {
    // Load movies from localStorage or initialize with sample data
    const savedMovies = localStorage.getItem('movies');
    if (savedMovies) {
      setMovies(JSON.parse(savedMovies));
    } else {
      // Sample movie data
      const sampleMovies: Movie[] = [
        {
          id: '1',
          title: 'The Indie Journey',
          description: 'A heartwarming tale of an independent filmmaker struggling to make their first feature film while navigating personal relationships and financial challenges.',
          releaseYear: 2023,
          genre: ['Drama', 'Comedy'],
          director: 'Sarah Johnson',
          cast: ['Michael Lee', 'Emma Roberts', 'David Chen'],
          rating: 4.5,
          duration: '1h 45m',
          posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=300&auto=format&fit=crop',
          bannerUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1080&auto=format&fit=crop',
          trailerUrl: 'https://example.com/trailer1.mp4',
          views: 12500,
          likes: 4200,
          isFeatured: true,
          isPremium: false
        },
        {
          id: '2',
          title: 'Midnight in Mumbai',
          description: 'An atmospheric noir thriller set in the bustling streets of Mumbai, following a detective investigating a series of mysterious disappearances.',
          releaseYear: 2022,
          genre: ['Thriller', 'Mystery'],
          director: 'Raj Patel',
          cast: ['Aishwarya Rao', 'Vikram Singh', 'Priya Sharma'],
          rating: 4.7,
          duration: '2h 10m',
          posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=300&auto=format&fit=crop',
          bannerUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1080&auto=format&fit=crop',
          trailerUrl: 'https://example.com/trailer2.mp4',
          views: 18900,
          likes: 6700,
          isFeatured: true,
          isPremium: true,
          price: 4.99
        },
        {
          id: '3',
          title: 'Echo of the Hills',
          description: 'A documentary exploring the traditional music of a remote mountain community and how they preserve their cultural heritage despite modernization.',
          releaseYear: 2021,
          genre: ['Documentary', 'Music'],
          director: 'Maria Garcia',
          cast: ['Local Musicians', 'Community Elders'],
          rating: 4.3,
          duration: '1h 30m',
          posterUrl: 'https://images.unsplash.com/photo-1551817959-d5f3642e1415?q=80&w=300&auto=format&fit=crop',
          bannerUrl: 'https://images.unsplash.com/photo-1551817959-d5f3642e1415?q=80&w=1080&auto=format&fit=crop',
          trailerUrl: 'https://example.com/trailer3.mp4',
          views: 8700,
          likes: 3200,
          isFeatured: false,
          isPremium: false
        },
        {
          id: '4',
          title: 'Digital Dreams',
          description: 'A sci-fi drama that explores the ethical implications of virtual reality when a programmer creates an AI that becomes self-aware within a virtual world.',
          releaseYear: 2023,
          genre: ['Sci-Fi', 'Drama'],
          director: 'Alex Wong',
          cast: ['Lena Kim', 'Tyler Jackson', 'Maya Patel'],
          rating: 4.6,
          duration: '2h 15m',
          posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=300&auto=format&fit=crop',
          bannerUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1080&auto=format&fit=crop',
          trailerUrl: 'https://example.com/trailer4.mp4',
          views: 15600,
          likes: 5800,
          isFeatured: true,
          isPremium: true,
          price: 5.99
        },
        {
          id: '5',
          title: 'The Last Canvas',
          description: 'A period drama about an unknown painter in 19th century Paris who sacrifices everything for art, only to find recognition after death.',
          releaseYear: 2022,
          genre: ['Drama', 'History'],
          director: 'Jean-Pierre Dubois',
          cast: ['Claire Beaumont', 'Antoine Martin', 'Sophie Laurent'],
          rating: 4.8,
          duration: '2h 20m',
          posterUrl: 'https://images.unsplash.com/photo-1525569304339-36d3138e7e0d?q=80&w=300&auto=format&fit=crop',
          bannerUrl: 'https://images.unsplash.com/photo-1525569304339-36d3138e7e0d?q=80&w=1080&auto=format&fit=crop',
          trailerUrl: 'https://example.com/trailer5.mp4',
          views: 11300,
          likes: 4800,
          isFeatured: false,
          isPremium: true,
          price: 3.99
        },
        {
          id: '6',
          title: 'Urban Rhythms',
          description: 'A vibrant documentary following street dancers from different urban centers around the world as they compete and collaborate.',
          releaseYear: 2021,
          genre: ['Documentary', 'Music'],
          director: 'Marcus Johnson',
          cast: ['Dance Crews', 'Choreographers', 'Street Artists'],
          rating: 4.4,
          duration: '1h 50m',
          posterUrl: 'https://images.unsplash.com/photo-1624988314880-974aef4576b4?q=80&w=300&auto=format&fit=crop',
          bannerUrl: 'https://images.unsplash.com/photo-1624988314880-974aef4576b4?q=80&w=1080&auto=format&fit=crop',
          trailerUrl: 'https://example.com/trailer6.mp4',
          views: 9400,
          likes: 3900,
          isFeatured: false,
          isPremium: false
        }
      ];
      setMovies(sampleMovies);
      localStorage.setItem('movies', JSON.stringify(sampleMovies));
    }

    // Load marketplace items from localStorage or initialize with sample data
    const savedMarketplaceItems = localStorage.getItem('marketplaceItems');
    if (savedMarketplaceItems) {
      setMarketplaceItems(JSON.parse(savedMarketplaceItems));
    } else {
      // Sample marketplace items
      const sampleMarketplaceItems: MarketplaceItem[] = [
        {
          id: 'm1',
          movieId: '2',
          price: 14.99,
          type: 'buy',
          description: 'Own this award-winning thriller forever. Includes director commentary and behind-the-scenes features.'
        },
        {
          id: 'm2',
          movieId: '2',
          price: 4.99,
          type: 'rent',
          description: 'Rent for 48 hours. Stream in HD or 4K on your favorite devices.'
        },
        {
          id: 'm3',
          movieId: '4',
          price: 19.99,
          type: 'buy',
          description: 'Purchase includes exclusive digital artwork and extended scenes not shown in theaters.'
        },
        {
          id: 'm4',
          movieId: '4',
          price: 5.99,
          type: 'rent',
          description: 'Rent for 48 hours with bonus feature: "The Making of Digital Dreams."'
        },
        {
          id: 'm5',
          movieId: '5',
          price: 12.99,
          type: 'buy',
          description: 'Own this historical masterpiece. Includes a digital art book featuring period paintings.'
        },
        {
          id: 'm6',
          movieId: '5',
          price: 3.99,
          type: 'rent',
          description: 'Rent for 48 hours. Includes subtitles in 12 languages.'
        }
      ];
      setMarketplaceItems(sampleMarketplaceItems);
      localStorage.setItem('marketplaceItems', JSON.stringify(sampleMarketplaceItems));
    }

    // Load user data from localStorage or initialize with empty data
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      setUserData(JSON.parse(savedUserData));
    } else {
      // Sample user reviews
      const sampleUserData: UserData = {
        favorites: ['1', '4'],
        watchlist: ['2', '5'],
        watchHistory: ['1', '3', '6'],
        reviews: [
          {
            id: 'r1',
            movieId: '1',
            userId: 'user1',
            username: 'cinephile',
            rating: 4,
            comment: 'A beautiful and authentic portrayal of the indie filmmaking process. The struggles felt real and the characters were relatable.',
            date: '2023-06-15'
          },
          {
            id: 'r2',
            movieId: '3',
            userId: 'user1',
            username: 'cinephile',
            rating: 5,
            comment: 'Breathtaking cinematography and a respectful approach to showcasing the community. The music will stay with you long after watching.',
            date: '2023-05-22'
          },
          {
            id: 'r3',
            movieId: '4',
            userId: 'user1',
            username: 'cinephile',
            rating: 4,
            comment: 'Thought-provoking and visually stunning. The ethical questions raised are more relevant than ever in today\'s tech landscape.',
            date: '2023-07-03'
          }
        ]
      };
      setUserData(sampleUserData);
      localStorage.setItem('userData', JSON.stringify(sampleUserData));
    }
  }, []);

  // Generate genre list and counts from movies
  useEffect(() => {
    if (movies.length > 0) {
      const genreMap = new Map<string, number>();
      
      movies.forEach(movie => {
        movie.genre.forEach(g => {
          const count = genreMap.get(g) || 0;
          genreMap.set(g, count + 1);
        });
      });
      
      const genreList: Genre[] = Array.from(genreMap.entries()).map(([name, count], index) => ({
        id: `genre-${index}`,
        name,
        count
      }));
      
      setGenres(genreList);
    }
  }, [movies]);

  // Apply movie filters
  useEffect(() => {
    let result = [...movies];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(query) || 
        movie.description.toLowerCase().includes(query) ||
        movie.director.toLowerCase().includes(query) ||
        movie.genre.some(g => g.toLowerCase().includes(query)) ||
        movie.cast.some(c => c.toLowerCase().includes(query))
      );
    }
    
    // Apply genre filter
    if (selectedGenre !== 'all') {
      result = result.filter(movie => 
        movie.genre.some(g => g === selectedGenre)
      );
    }
    
    // Add user data (favorites, watchlist)
    result = result.map(movie => ({
      ...movie,
      isFavorite: userData.favorites.includes(movie.id),
      isWatchlist: userData.watchlist.includes(movie.id)
    }));
    
    setFilteredMovies(result);
  }, [movies, searchQuery, selectedGenre, userData]);

  // Toggle favorite status
  const toggleFavorite = (movieId: string) => {
    setUserData(prevUserData => {
      const newUserData = { ...prevUserData };
      if (newUserData.favorites.includes(movieId)) {
        newUserData.favorites = newUserData.favorites.filter(id => id !== movieId);
      } else {
        newUserData.favorites = [...newUserData.favorites, movieId];
      }
      localStorage.setItem('userData', JSON.stringify(newUserData));
      return newUserData;
    });
  };

  // Toggle watchlist status
  const toggleWatchlist = (movieId: string) => {
    setUserData(prevUserData => {
      const newUserData = { ...prevUserData };
      if (newUserData.watchlist.includes(movieId)) {
        newUserData.watchlist = newUserData.watchlist.filter(id => id !== movieId);
      } else {
        newUserData.watchlist = [...newUserData.watchlist, movieId];
      }
      localStorage.setItem('userData', JSON.stringify(newUserData));
      return newUserData;
    });
  };

  // Add to watch history
  const addToWatchHistory = (movieId: string) => {
    setUserData(prevUserData => {
      const newUserData = { ...prevUserData };
      if (!newUserData.watchHistory.includes(movieId)) {
        newUserData.watchHistory = [...newUserData.watchHistory, movieId];
        localStorage.setItem('userData', JSON.stringify(newUserData));
      }
      return newUserData;
    });
  };

  // Submit review
  const submitReview = (movieId: string, rating: number, comment: string) => {
    setUserData(prevUserData => {
      const newUserData = { ...prevUserData };
      const newReview: Review = {
        id: `r${Date.now()}`,
        movieId,
        userId: 'user1', // In a real app, this would be the current user's ID
        username: 'cinephile', // In a real app, this would be the current user's username
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
      };
      newUserData.reviews = [...newUserData.reviews, newReview];
      localStorage.setItem('userData', JSON.stringify(newUserData));
      return newUserData;
    });
  };

  // Play movie
  const playMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsPlaying(true);
    addToWatchHistory(movie.id);
  };

  // Watch Trailer
  const watchTrailer = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowTrailer(true);
  };

  // Get movie by ID
  const getMovieById = (id: string): Movie | undefined => {
    return movies.find(movie => movie.id === id);
  };

  // Get marketplace items for a movie
  const getMarketplaceItemsForMovie = (movieId: string): MarketplaceItem[] => {
    return marketplaceItems.filter(item => item.movieId === movieId);
  };

  // Get reviews for a movie
  const getReviewsForMovie = (movieId: string): Review[] => {
    return userData.reviews.filter(review => review.movieId === movieId);
  };

  // Theme toggle component
  const ThemeToggle: React.FC = () => {
    return (
      <button 
        className="theme-toggle"
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="theme-toggle-thumb"></span>
        <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
      </button>
    );
  };

  // Render Hero Section
  const renderHero = () => {
    const featuredMovie = movies.find(movie => movie.isFeatured) || movies[0];
    if (!featuredMovie) return null;

    return (
      <div className="relative overflow-hidden w-full" style={{ height: '600px' }}>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url(${featuredMovie.bannerUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-12 lg:px-24 max-w-6xl">
          <h1 className="mb-2 text-4xl font-bold text-white">Introducing</h1>
          <div className={styles.animatedTitle}>ABC Talkies</div>
          <h2 className="mb-6 text-2xl text-white">World's First OTT Platform for Your Favorite Movies — Now with a Cinema Marketplace</h2>
          <p className="mb-8 text-lg text-gray-200 max-w-2xl">{featuredMovie.description}</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => playMovie(featuredMovie)}
              className="btn btn-primary flex items-center gap-2"
              aria-label="Play movie"
            >
              <Play size={18} /> Watch Now
            </button>
            <button
              onClick={() => watchTrailer(featuredMovie)}
              className="btn bg-gray-800 text-white hover:bg-gray-700 flex items-center gap-2"
              aria-label="Watch trailer"
            >
              <Film size={18} /> Watch Trailer
            </button>
            <button
              onClick={() => toggleWatchlist(featuredMovie.id)}
              className="btn bg-transparent border border-white text-white hover:bg-white hover:text-black flex items-center gap-2"
              aria-label={userData.watchlist.includes(featuredMovie.id) ? "Remove from watchlist" : "Add to watchlist"}
            >
              {userData.watchlist.includes(featuredMovie.id) ? (
                <>
                  <Bookmark size={18} fill="currentColor" /> In Watchlist
                </>
              ) : (
                <>
                  <Bookmark size={18} /> Add to Watchlist
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Movie Card
  const renderMovieCard = (movie: Movie) => {
    return (
      <div className="card overflow-hidden group" key={movie.id}>
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={movie.posterUrl} 
            alt={movie.title} 
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={() => playMovie(movie)}
              className="btn btn-sm bg-primary-600 text-white hover:bg-primary-700 rounded-full p-2"
              aria-label="Play movie"
            >
              <Play size={18} />
            </button>
            <button
              onClick={() => setSelectedMovie(movie) || setShowMovieDetails(true)}
              className="btn btn-sm bg-gray-700 text-white hover:bg-gray-600 rounded-full p-2"
              aria-label="View details"
            >
              <Info size={18} />
            </button>
            <button
              onClick={() => toggleFavorite(movie.id)}
              className={`btn btn-sm ${movie.isFavorite ? 'bg-red-500' : 'bg-gray-700'} text-white hover:bg-red-600 rounded-full p-2`}
              aria-label={movie.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={18} fill={movie.isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
          {movie.isPremium && (
            <div className="absolute top-2 right-2 badge badge-warning">
              Premium
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{movie.title}</h3>
            <div className="flex items-center">
              <Star size={16} className="text-yellow-500" fill="currentColor" />
              <span className="ml-1 text-sm">{movie.rating}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
            <span>{movie.releaseYear}</span>
            <span>{movie.duration}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genre.map((genre, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                {genre}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => setSelectedMovie(movie) || setShowMovieDetails(true)}
              className="text-primary-600 hover:text-primary-800 text-sm flex items-center gap-1"
              aria-label="View details"
            >
              Details <ChevronRight size={14} />
            </button>
            {movie.isPremium && movie.price && (
              <span className="font-medium">${movie.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Movie Details Modal
  const renderMovieDetailsModal = () => {
    if (!selectedMovie) return null;

    const marketplaceItems = getMarketplaceItemsForMovie(selectedMovie.id);
    const reviews = getReviewsForMovie(selectedMovie.id);
    const isFavorite = userData.favorites.includes(selectedMovie.id);
    const isInWatchlist = userData.watchlist.includes(selectedMovie.id);

    return (
      <div 
        className="modal-backdrop" 
        onClick={() => {
          setShowMovieDetails(false);
          setSelectedMovie(null);
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-title"
      >
        <div 
          className="modal-content max-w-3xl overflow-y-auto" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <img 
              src={selectedMovie.bannerUrl} 
              alt={selectedMovie.title} 
              className="w-full h-64 object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="absolute top-4 right-4">
              <button 
                className="btn btn-sm bg-gray-800 bg-opacity-60 text-white hover:bg-opacity-80 rounded-full p-2"
                onClick={() => {
                  setShowMovieDetails(false);
                  setSelectedMovie(null);
                }}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={() => playMovie(selectedMovie)}
                className="btn btn-sm btn-primary flex items-center gap-2"
                aria-label="Play movie"
              >
                <Play size={16} /> Watch Now
              </button>
              <button
                onClick={() => watchTrailer(selectedMovie)}
                className="btn btn-sm bg-gray-700 text-white hover:bg-gray-600 flex items-center gap-2"
                aria-label="Watch trailer"
              >
                <Film size={16} /> Trailer
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 id="movie-title" className="text-2xl font-bold">{selectedMovie.title}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleFavorite(selectedMovie.id)}
                  className={`btn btn-sm ${isFavorite ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700'} rounded-full p-2`}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => toggleWatchlist(selectedMovie.id)}
                  className={`btn btn-sm ${isInWatchlist ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700'} rounded-full p-2`}
                  aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                >
                  <Bookmark size={16} fill={isInWatchlist ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="flex items-center text-sm">
                <Star size={16} className="text-yellow-500 mr-1" fill="currentColor" />
                {selectedMovie.rating}/5
              </span>
              <span className="flex items-center text-sm">
                <Calendar size={16} className="text-gray-500 mr-1" />
                {selectedMovie.releaseYear}
              </span>
              <span className="flex items-center text-sm">
                <Clock size={16} className="text-gray-500 mr-1" />
                {selectedMovie.duration}
              </span>
              <span className="flex items-center text-sm">
                <Eye size={16} className="text-gray-500 mr-1" />
                {selectedMovie.views.toLocaleString()} views
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-4">
              {selectedMovie.genre.map((genre, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {genre}
                </span>
              ))}
            </div>
            
            <p className="mb-6 text-gray-700 dark:text-gray-300">{selectedMovie.description}</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Cast & Crew</h3>
              <p className="mb-1"><span className="font-medium">Director:</span> {selectedMovie.director}</p>
              <p><span className="font-medium">Cast:</span> {selectedMovie.cast.join(', ')}</p>
            </div>
            
            {marketplaceItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Available on Marketplace</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketplaceItems.map(item => (
                    <div key={item.id} className="border rounded-lg p-4 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.type === 'buy' ? 'Buy' : 'Rent'}</h4>
                        <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                      <button className="btn btn-sm btn-primary w-full">Add to Cart</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Reviews</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b dark:border-gray-700 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <User size={18} className="text-gray-500 mr-2" />
                          <span className="font-medium">{review.username}</span>
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                              fill={i < review.rating ? "currentColor" : "none"}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              )}
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Write a Review</h4>
                <div className="mb-3">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button 
                        key={i}
                        className="text-gray-300 hover:text-yellow-500"
                        aria-label={`Rate ${i + 1} stars`}
                      >
                        <Star size={24} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    className="input w-full h-24" 
                    placeholder="Share your thoughts about this movie..."
                    aria-label="Review comment"
                  ></textarea>
                </div>
                <button className="btn btn-primary">Submit Review</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-6 border-t dark:border-gray-700">
              <h3 className="font-semibold">Similar Movies</h3>
              <a href="#" className="text-primary-600 hover:text-primary-800 flex items-center gap-1">
                View All <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Trailer Modal
  const renderTrailerModal = () => {
    if (!selectedMovie || !showTrailer) return null;

    return (
      <div 
        className="modal-backdrop" 
        onClick={() => setShowTrailer(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Movie trailer"
      >
        <div 
          className="modal-content max-w-4xl" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Trailer: {selectedMovie.title}</h3>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setShowTrailer(false)}
              aria-label="Close trailer"
            >
              <X size={24} />
            </button>
          </div>
          <div className="relative pt-[56.25%] /* 16:9 aspect ratio */">
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              {/* In a real app, this would be a video player */}
              <div className="text-center p-6">
                <Film size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-white mb-4">Trailer would play here in a real application</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowTrailer(false)}
                  aria-label="Close trailer"
                >
                  Close Trailer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Video Player Modal
  const renderVideoPlayerModal = () => {
    if (!selectedMovie || !isPlaying) return null;

    return (
      <div 
        className="modal-backdrop" 
        onClick={() => setIsPlaying(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Video player"
      >
        <div 
          className="modal-content max-w-5xl" 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Now Playing: {selectedMovie.title}</h3>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsPlaying(false)}
              aria-label="Close video"
            >
              <X size={24} />
            </button>
          </div>
          <div className="relative pt-[56.25%] /* 16:9 aspect ratio */">
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {/* In a real app, this would be a video player */}
              <div className="text-center p-6">
                <img 
                  src={selectedMovie.bannerUrl} 
                  alt={selectedMovie.title} 
                  className="w-full h-full object-contain absolute inset-0 opacity-30"
                />
                <div className="relative z-10">
                  <Pause size={48} className="mx-auto mb-4 text-white" />
                  <p className="text-white mb-4">Movie would play here in a real application</p>
                  <div className="flex justify-center gap-4">
                    <button 
                      className="btn btn-primary flex items-center gap-2"
                      onClick={() => setIsPlaying(false)}
                      aria-label="Close video"
                    >
                      <X size={16} /> Close
                    </button>
                    <button 
                      className="btn bg-gray-700 text-white hover:bg-gray-600 flex items-center gap-2"
                      aria-label="Toggle play/pause"
                    >
                      <Pause size={16} /> Pause
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Home Content
  const renderHomeContent = () => {
    return (
      <>
        {renderHero()}

        <div className="container-fluid py-8">
          {/* Featured Movies Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Featured Movies</h2>
              <button className="text-primary-600 hover:text-primary-800 flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMovies
                .filter(movie => movie.isFeatured)
                .slice(0, 5)
                .map(movie => renderMovieCard(movie))}
            </div>
          </div>

          {/* Recently Added Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Recently Added</h2>
              <button className="text-primary-600 hover:text-primary-800 flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMovies
                .sort((a, b) => b.releaseYear - a.releaseYear)
                .slice(0, 5)
                .map(movie => renderMovieCard(movie))}
            </div>
          </div>

          {/* Premium Content Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Premium Content</h2>
              <button className="text-primary-600 hover:text-primary-800 flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredMovies
                .filter(movie => movie.isPremium)
                .slice(0, 5)
                .map(movie => renderMovieCard(movie))}
            </div>
          </div>

          {/* Browse by Genre Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {genres.map(genre => (
                <button 
                  key={genre.id} 
                  className="card p-4 text-center hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setSelectedGenre(genre.name)}
                >
                  <h3 className="font-medium mb-1">{genre.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{genre.count} movies</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  // Render Explore Content
  const renderExploreContent = () => {
    return (
      <div className="container-fluid py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Explore Movies</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                className="input pl-10 w-full sm:w-64"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search for movies"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <select
              className="input"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              aria-label="Filter by genre"
            >
              <option value="all">All Genres</option>
              {genres.map(genre => (
                <option key={genre.id} value={genre.name}>{genre.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">No results found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filter to find what you're looking for.</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMovies.map(movie => renderMovieCard(movie))}
          </div>
        )}
      </div>
    );
  };

  // Render Watchlist Content
  const renderWatchlistContent = () => {
    const watchlistMovies = filteredMovies.filter(movie => movie.isWatchlist);
    
    return (
      <div className="container-fluid py-8">
        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
        
        {watchlistMovies.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium mb-2">Your watchlist is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add movies to your watchlist to find them here later.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setActiveTab('explore')}
            >
              Explore Movies
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {watchlistMovies.map(movie => renderMovieCard(movie))}
          </div>
        )}
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Watch History</h2>
          
          {userData.watchHistory.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">You haven't watched any movies yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies
                .filter(movie => userData.watchHistory.includes(movie.id))
                .map(movie => renderMovieCard(movie))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Marketplace Content
  const renderMarketplaceContent = () => {
    // Group marketplace items by movie
    const movieItemsMap = new Map<string, MarketplaceItem[]>();
    
    marketplaceItems.forEach(item => {
      const items = movieItemsMap.get(item.movieId) || [];
      items.push(item);
      movieItemsMap.set(item.movieId, items);
    });
    
    // Get movies that have marketplace items
    const marketplaceMovies = movies.filter(movie => 
      movieItemsMap.has(movie.id)
    );
    
    // Stats for charts
    const buyItems = marketplaceItems.filter(item => item.type === 'buy');
    const rentItems = marketplaceItems.filter(item => item.type === 'rent');
    const buyTotal = buyItems.reduce((total, item) => total + item.price, 0);
    const rentTotal = rentItems.reduce((total, item) => total + item.price, 0);
    
    const pieData = [
      { name: 'Buy', value: buyItems.length },
      { name: 'Rent', value: rentItems.length },
    ];
    
    const COLORS = ['#0088FE', '#00C49F'];
    
    const barData = [
      { name: 'Buy', price: parseFloat((buyTotal / buyItems.length).toFixed(2)) },
      { name: 'Rent', price: parseFloat((rentTotal / rentItems.length).toFixed(2)) },
    ];

    return (
      <div className="container-fluid py-8">
        <h1 className="text-3xl font-bold mb-8">Cinema Marketplace</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Marketplace Overview</h2>
            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} items`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Average Pricing</h2>
            <div className="flex items-center justify-center h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Avg. Price']} />
                  <Legend />
                  <Bar dataKey="price" fill="#8884d8" name="Average Price" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Available Movies</h2>
        
        {marketplaceMovies.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No movies are currently available in the marketplace.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketplaceMovies.map(movie => {
              const items = movieItemsMap.get(movie.id) || [];
              const buyItem = items.find(item => item.type === 'buy');
              const rentItem = items.find(item => item.type === 'rent');
              
              return (
                <div key={movie.id} className="card overflow-hidden">
                  <div className="relative h-48">
                    <img 
                      src={movie.bannerUrl} 
                      alt={movie.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-white text-xl font-bold">{movie.title}</h3>
                      <div className="flex items-center text-white text-sm">
                        <span className="mr-2">{movie.releaseYear}</span>
                        <span>{movie.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {movie.genre.map((genre, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                          {genre}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{movie.description}</p>
                    
                    <div className="flex flex-col gap-3">
                      {buyItem && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <span className="font-medium">Buy</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Own forever</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">${buyItem.price.toFixed(2)}</span>
                            <button className="btn btn-sm btn-primary">Add to Cart</button>
                          </div>
                        </div>
                      )}
                      
                      {rentItem && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <span className="font-medium">Rent</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">48-hour access</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">${rentItem.price.toFixed(2)}</span>
                            <button className="btn btn-sm btn-primary">Add to Cart</button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="w-full btn bg-gray-100 dark:bg-gray-700 mt-4 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                      onClick={() => {
                        setSelectedMovie(movie);
                        setShowMovieDetails(true);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render Profile Content
  const renderProfileContent = () => {
    const favoriteMovies = filteredMovies.filter(movie => movie.isFavorite);
    const watchHistoryMovies = filteredMovies.filter(movie => userData.watchHistory.includes(movie.id));
    
    // Stats for charts
    const genreCounts: Record<string, number> = {};
    watchHistoryMovies.forEach(movie => {
      movie.genre.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });
    
    const genreData = Object.entries(genreCounts).map(([name, count]) => ({
      name,
      count
    }));
    
    return (
      <div className="container-fluid py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <ThemeToggle />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <div className="flex flex-col items-center p-6">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <User size={48} className="text-primary-600" />
                </div>
                <h2 className="text-xl font-bold mb-1">User Account</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Free Plan</p>
                <button className="btn btn-primary w-full mb-2">Upgrade to Premium</button>
                <button className="btn bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white w-full">Edit Profile</button>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Viewing Activity</h3>
              {watchHistoryMovies.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={genreData}
                      layout="vertical"
                      margin={{ top: 5, right: 5, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" scale="band" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Movies Watched" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No viewing activity yet.</p>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h3 className="text-lg font-bold mb-4">Favorite Movies</h3>
              {favoriteMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favoriteMovies.slice(0, 3).map(movie => (
                    <div key={movie.id} className="flex bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <img 
                        src={movie.posterUrl} 
                        alt={movie.title} 
                        className="w-1/3 object-cover"
                      />
                      <div className="p-3 w-2/3">
                        <h4 className="font-medium mb-1 line-clamp-1">{movie.title}</h4>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <Star size={12} className="text-yellow-500 mr-1" fill="currentColor" />
                          <span>{movie.rating}</span>
                        </div>
                        <button 
                          className="btn btn-sm btn-primary w-full"
                          onClick={() => playMovie(movie)}
                        >
                          Watch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No favorite movies yet.</p>
              )}
            </div>
            
            <div className="card">
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              {userData.reviews.length > 0 || userData.watchHistory.length > 0 ? (
                <div className="divide-y dark:divide-gray-700">
                  {userData.reviews.slice(0, 3).map(review => {
                    const movie = getMovieById(review.movieId);
                    return movie ? (
                      <div key={review.id} className="py-3 flex items-start">
                        <MessageCircle size={18} className="text-primary-500 mr-3 mt-1" />
                        <div>
                          <p className="font-medium">
                            You reviewed <span className="text-primary-600">{movie.title}</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{review.date}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                  
                  {userData.watchHistory.slice(0, 3).map(movieId => {
                    const movie = getMovieById(movieId);
                    return movie ? (
                      <div key={`watch-${movieId}`} className="py-3 flex items-start">
                        <Film size={18} className="text-primary-500 mr-3 mt-1" />
                        <div>
                          <p className="font-medium">
                            You watched <span className="text-primary-600">{movie.title}</span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Recently</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main Render Function
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-fluid">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600 mr-8">ABC Talkies</h1>
              <nav className="hidden md:flex space-x-6">
                <button 
                  className={`text-sm font-medium ${activeTab === 'home' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-500`}
                  onClick={() => setActiveTab('home')}
                  aria-current={activeTab === 'home' ? 'page' : undefined}
                >
                  Home
                </button>
                <button 
                  className={`text-sm font-medium ${activeTab === 'explore' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-500`}
                  onClick={() => setActiveTab('explore')}
                  aria-current={activeTab === 'explore' ? 'page' : undefined}
                >
                  Explore
                </button>
                <button 
                  className={`text-sm font-medium ${activeTab === 'watchlist' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-500`}
                  onClick={() => setActiveTab('watchlist')}
                  aria-current={activeTab === 'watchlist' ? 'page' : undefined}
                >
                  Watchlist
                </button>
                <button 
                  className={`text-sm font-medium ${activeTab === 'marketplace' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-500`}
                  onClick={() => setActiveTab('marketplace')}
                  aria-current={activeTab === 'marketplace' ? 'page' : undefined}
                >
                  Marketplace
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <button 
                className="btn btn-sm bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setActiveTab('profile')}
                aria-label="User profile"
              >
                <User size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex justify-between overflow-x-auto py-2 px-4">
          <button 
            className={`flex flex-col items-center px-4 py-2 ${activeTab === 'home' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveTab('home')}
            aria-current={activeTab === 'home' ? 'page' : undefined}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            className={`flex flex-col items-center px-4 py-2 ${activeTab === 'explore' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveTab('explore')}
            aria-current={activeTab === 'explore' ? 'page' : undefined}
          >
            <Search size={20} />
            <span className="text-xs mt-1">Explore</span>
          </button>
          <button 
            className={`flex flex-col items-center px-4 py-2 ${activeTab === 'watchlist' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveTab('watchlist')}
            aria-current={activeTab === 'watchlist' ? 'page' : undefined}
          >
            <Bookmark size={20} />
            <span className="text-xs mt-1">Watchlist</span>
          </button>
          <button 
            className={`flex flex-col items-center px-4 py-2 ${activeTab === 'marketplace' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveTab('marketplace')}
            aria-current={activeTab === 'marketplace' ? 'page' : undefined}
          >
            <ShoppingCart size={20} />
            <span className="text-xs mt-1">Market</span>
          </button>
          <button 
            className={`flex flex-col items-center px-4 py-2 ${activeTab === 'profile' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'}`}
            onClick={() => setActiveTab('profile')}
            aria-current={activeTab === 'profile' ? 'page' : undefined}
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {activeTab === 'home' && renderHomeContent()}
        {activeTab === 'explore' && renderExploreContent()}
        {activeTab === 'watchlist' && renderWatchlistContent()}
        {activeTab === 'marketplace' && renderMarketplaceContent()}
        {activeTab === 'profile' && renderProfileContent()}
        
        {/* Modals */}
        {showMovieDetails && renderMovieDetailsModal()}
        {showTrailer && renderTrailerModal()}
        {isPlaying && renderVideoPlayerModal()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-bold text-primary-600 mb-2">ABC Talkies</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">World's First OTT Platform for Indie Films</p>
            </div>
            <div className="flex gap-8">
              <div>
                <h3 className="text-sm font-semibold mb-2">Company</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li><a href="#" className="hover:text-primary-600">About Us</a></li>
                  <li><a href="#" className="hover:text-primary-600">Careers</a></li>
                  <li><a href="#" className="hover:text-primary-600">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Support</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li><a href="#" className="hover:text-primary-600">Help Center</a></li>
                  <li><a href="#" className="hover:text-primary-600">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-primary-600">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

interface Clock {
  size: number;
  className: string;
}
const Clock: React.FC<Clock> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

interface Eye {
  size: number;
  className: string;
}
const Eye: React.FC<Eye> = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

interface ShoppingCart {
  size: number;
  className?: string;
}
const ShoppingCart: React.FC<ShoppingCart> = ({ size, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);