import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';
import {
 Home,
 User,
 LogIn,
 Heart,
 Search,
 MessageCircle,
 Users,
 Settings,
 LogOut,
 Mail,
 Phone,
 Calendar,
 MapPin,
 Bookmark,
 Filter,
 ChevronLeft,
 ChevronRight,
 Edit,
 X,
 Menu,
 AlignJustify,
 Sun,
 Moon,
 Image,
 Camera
} from 'lucide-react';

interface UserProfile {
 id: string;
 name: string;
 age: number;
 gender: 'Male' | 'Female' | 'Other';
 location: string;
 bio: string;
 occupation: string;
 education: string;
 religion: string;
 caste: string;
 maritalStatus: string;
 height: string;
 interests: string[];
 profilePicture: string;
 images: string[];
 createdAt: Date;
 isVerified: boolean;
 isPremium: boolean;
}

interface Match {
 id: string;
 userId: string;
 matchedUserId: string;
 status: 'pending' | 'accepted' | 'rejected';
 createdAt: Date;
}

interface Conversation {
 id: string;
 participants: string[];
 lastMessage: Message;
 updatedAt: Date;
}

interface Message {
 id: string;
 conversationId: string;
 senderId: string;
 content: string;
 createdAt: Date;
 isRead: boolean;
}

interface LoginFormInputs {
 email: string;
 password: string;
}

interface RegisterFormInputs {
 name: string;
 email: string;
 phone: string;
 password: string;
 confirmPassword: string;
 gender: 'Male' | 'Female' | 'Other';
 dateOfBirth: string;
}

interface ProfileFormInputs {
 name: string;
 age: number;
 gender: 'Male' | 'Female' | 'Other';
 location: string;
 bio: string;
 occupation: string;
 education: string;
 religion: string;
 caste: string;
 maritalStatus: string;
 height: string;
 interests: string[];
}

interface SearchFilters {
 minAge: number;
 maxAge: number;
 gender: 'Male' | 'Female' | 'Any';
 location: string;
 religion: string;
 caste: string;
 maritalStatus: string;
 minHeight: string;
 maxHeight: string;
}

const App: React.FC = () => {
 return (
 <Router>
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col theme-transition">
 <Routes>
 <Route path="/" element={<HomePage />} />
 <Route path="/login" element={<LoginPage />} />
 <Route path="/register" element={<RegisterPage />} />
 <Route path="/dashboard" element={<Dashboard />} />
 <Route path="/profile/:id" element={<ProfilePage />} />
 <Route path="/profile/edit" element={<EditProfilePage />} />
 <Route path="/matches" element={<MatchesPage />} />
 <Route path="/messages" element={<MessagesPage />} />
 <Route path="/messages/:id" element={<ConversationPage />} />
 <Route path="/search" element={<SearchPage />} />
 <Route path="/settings" element={<SettingsPage />} />
 </Routes>
 <Footer />
 </div>
 </Router>
 );
};

const ThemeToggle: React.FC = () => {
 const [isDarkMode, setIsDarkMode] = useState(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
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

 return (
 <button 
 className="theme-toggle flex items-center justify-center p-2 rounded-full bg-gray-200 dark:bg-gray-700 theme-transition"
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 role="switch"
 aria-checked={isDarkMode}
 >
 {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
 <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
 </button>
 );
};

const HomePage: React.FC = () => {
 const navigate = useNavigate();

 const features = [
 { title: 'Find Your Perfect Match', description: 'Our smart matching algorithm helps you find compatible partners from our community.', icon: <Heart className="h-8 w-8 text-primary-500" /> },
 { title: 'Verified Profiles', description: 'All profiles are verified to ensure a safe and authentic experience.', icon: <User className="h-8 w-8 text-primary-500" /> },
 { title: 'Private Messaging', description: 'Connect with potential matches through our secure messaging system.', icon: <MessageCircle className="h-8 w-8 text-primary-500" /> },
 { title: 'Community Focus', description: 'Designed specifically for our community values and traditions.', icon: <Users className="h-8 w-8 text-primary-500" /> },
 ];

 return (
 <div className="flex flex-col min-h-screen">
 <header className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
 <div className="container mx-auto py-4 px-4 flex justify-between items-center">
 <div className="flex items-center">
 <Heart className="h-8 w-8 text-primary-500 mr-2" />
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white theme-transition">Community Matrimony</h1>
 </div>
 <div className="flex items-center space-x-4">
 <ThemeToggle />
 <Link to="/login" className="btn btn-primary">Login</Link>
 <Link to="/register" className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 theme-transition">Register</Link>
 </div>
 </div>
 </header>

 <main className="flex-grow">
 <section className="py-16 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 theme-transition">
 <div className="container mx-auto px-4">
 <div className="flex flex-col md:flex-row items-center justify-between">
 <div className="md:w-1/2 mb-10 md:mb-0">
 <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 theme-transition">Find Your Perfect Life Partner</h2>
 <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 theme-transition">Join our community-focused matrimony platform designed to help you find a compatible life partner who shares your values and traditions.</p>
 <div className="flex flex-col sm:flex-row gap-4">
 <button 
 onClick={() => navigate('/register')}
 className="btn btn-primary btn-lg"
 role="button"
 >Get Started</button>
 <button 
 onClick={() => navigate('/login')}
 className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 btn-lg theme-transition"
 role="button"
 >I Already Have an Account</button>
 </div>
 </div>
 <div className="md:w-1/2">
 <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden shadow-2xl">
 <img 
 src="https://images.unsplash.com/photo-1529634597503-139d3726fed5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
 alt="Happy couple celebrating their marriage" 
 className="object-cover h-full w-full"
 />
 </div>
 </div>
 </div>
 </div>
 </section>

 <section className="py-16 bg-white dark:bg-gray-800 theme-transition">
 <div className="container mx-auto px-4">
 <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 theme-transition">Why Choose Our Matrimony Platform?</h2>
 <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
 {features.map((feature, index) => (
 <div key={index} className="card hover:shadow-lg transition-shadow theme-transition">
 <div className="flex items-center justify-center mb-4">
 {feature.icon}
 </div>
 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center theme-transition">{feature.title}</h3>
 <p className="text-gray-600 dark:text-gray-300 text-center theme-transition">{feature.description}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section className="py-16 bg-gray-50 dark:bg-gray-900 theme-transition">
 <div className="container mx-auto px-4">
 <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 theme-transition">Success Stories</h2>
 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
 {[
 { name: 'Priya & Rahul', date: '2 years ago', story: 'We met through Community Matrimony and instantly connected. After 6 months of getting to know each other, we got married and couldn\'t be happier!', image: 'https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
 { name: 'Anjali & Vikram', date: '1 year ago', story: 'Thanks to the detailed profiles, we found each other based on our common interests and values. We\'re celebrating our first anniversary next month!', image: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
 { name: 'Meera & Ajay', date: '6 months ago', story: 'The community focus of this platform helped us find someone who understands our traditions. Our families are just as happy as we are!', image: 'https://images.unsplash.com/photo-1519741347686-c1e331c20a2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
 ].map((story, index) => (
 <div key={index} className="card hover:shadow-lg transition-shadow overflow-hidden theme-transition">
 <div className="aspect-w-3 aspect-h-2 mb-4">
 <img src={story.image} alt={story.name} className="object-cover rounded-lg" />
 </div>
 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 theme-transition">{story.name}</h3>
 <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 theme-transition">{story.date}</p>
 <p className="text-gray-600 dark:text-gray-300 theme-transition">"{story.story}"</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 <section className="py-16 bg-primary-50 dark:bg-gray-800 theme-transition">
 <div className="container mx-auto px-4 text-center">
 <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-6 theme-transition">Ready to Find Your Life Partner?</h2>
 <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 theme-transition">Join our community and start your journey towards a meaningful relationship today.</p>
 <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg">Register Now</button>
 </div>
 </section>
 </main>
 <Footer />
 </div>
 );
};

const LoginPage: React.FC = () => {
 return (
 <div>
 <h1>Login Page</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const RegisterPage: React.FC = () => {
 return (
 <div>
 <h1>Register Page</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const Dashboard: React.FC = () => {
 return (
 <div>
 <h1>Dashboard</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const ProfilePage: React.FC = () => {
 return (
 <div>
 <h1>Profile Page</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const EditProfilePage: React.FC = () => {
 return (
 <div>
 <h1>Edit Profile Page</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const MatchesPage: React.FC = () => {
 return (
 <div>
 <h1>Matches Page</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const MessagesPage: React.FC = () => {
 return (
 <div>
 <h1>Messages Page</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const ConversationPage: React.FC = () => {
 return (
 <div>
 <h1>Conversation Page</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const SearchPage: React.FC = () => {
 return (
 <div>
 <h1>Search Page</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const SettingsPage: React.FC = () => {
 return (
 <div>
 <h1>Settings Page</h1>
 <Link to="/">Go to Home</Link>
 </div>
 );
};

const Footer: React.FC = () => {
 return (
 <footer className="bg-white dark:bg-gray-800 shadow-inner theme-transition">
 <div className="container mx-auto py-4 px-4 flex justify-center items-center">
 <p className="text-gray-500 dark:text-gray-400 text-sm theme-transition">&copy; {new Date().getFullYear()} Community Matrimony. All rights reserved.</p>
 </div>
 </footer>
 );
};

export default App;