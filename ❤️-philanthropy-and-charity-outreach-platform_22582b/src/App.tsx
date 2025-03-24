import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Heart, DollarSign, Users, Briefcase, Menu, X, Sun, Moon, Search, ArrowRight, ExternalLink, Mail, Phone, MapPin, Globe, Check, ChevronDown, ChevronUp, Clock, Calendar, Info } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
type Project = {
 id: number;
 title: string;
 description: string;
 category: string;
 fundingGoal: number;
 fundingRaised: number;
 image: string;
 status: 'active' | 'completed' | 'upcoming';
 beneficiaries: number;
 deadline: string;
};

type Testimonial = {
 id: number;
 name: string;
 role: string;
 content: string;
 avatar: string;
};

type DonationTier = {
 id: number;
 name: string;
 amount: number;
 benefits: string[];
};

type FAQItem = {
 id: number;
 question: string;
 answer: string;
};

type Partner = {
 id: number;
 name: string;
 logo: string;
 website: string;
};

type ContactInfo = {
 email: string;
 phone: string;
 address: string;
 social: {
 twitter: string;
 facebook: string;
 instagram: string;
 linkedin: string;
 };
};

type NewsItem = {
 id: number;
 title: string;
 summary: string;
 date: string;
 image: string;
 link: string;
};

type Stats = {
 projectsCompleted: number;
 fundsRaised: number;
 peopleHelped: number;
 countriesReached: number;
};

const App: React.FC = () => {
 return (
 <Router>
 <div className="min-h-screen flex flex-col dark:bg-gray-900 transition-colors duration-300">
 <AppContent />
 </div>
 </Router>
 );
};

const AppContent: React.FC = () => {
 const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });
 const location = useLocation();

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

 // Close menu when location changes
 useEffect(() => {
 setIsMenuOpen(false);
 }, [location]);

 // Sample projects data
 const projects: Project[] = [
 {
 id: 1,
 title: "Clean Water Initiative",
 description: "Providing clean drinking water to rural communities in need across developing countries.",
 category: "Water & Sanitation",
 fundingGoal: 100000,
 fundingRaised: 75000,
 image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
 status: "active",
 beneficiaries: 5000,
 deadline: "2025-08-15"
 },
 {
 id: 2,
 title: "Education for All",
 description: "Building schools and providing educational resources to underprivileged children worldwide.",
 category: "Education",
 fundingGoal: 250000,
 fundingRaised: 175000,
 image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
 status: "active",
 beneficiaries: 2500,
 deadline: "2025-10-01"
 },
 {
 id: 3,
 title: "Renewable Energy for Villages",
 description: "Installing solar panels in villages without electricity to provide sustainable power.",
 category: "Energy",
 fundingGoal: 150000,
 fundingRaised: 150000,
 image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
 status: "completed",
 beneficiaries: 10000,
 deadline: "2025-05-30"
 },
 {
 id: 4,
 title: "Healthcare Access Program",
 description: "Bringing basic healthcare services to remote communities and providing essential medicines.",
 category: "Healthcare",
 fundingGoal: 200000,
 fundingRaised: 50000,
 image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
 status: "active",
 beneficiaries: 7500,
 deadline: "2025-12-31"
 },
 {
 id: 5,
 title: "Reforestation Project",
 description: "Planting trees and restoring forests in areas affected by deforestation and climate change.",
 category: "Environment",
 fundingGoal: 120000,
 fundingRaised: 20000,
 image: "https://images.unsplash.com/photo-1503785640985-f62e3aeee448?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
 status: "upcoming",
 beneficiaries: 0,
 deadline: "2026-03-21"
 },
 {
 id: 6,
 title: "Women's Empowerment Initiative",
 description: "Supporting women through education, entrepreneurship training, and microloans to start businesses.",
 category: "Social Development",
 fundingGoal: 180000,
 fundingRaised: 90000,
 image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
 status: "active",
 beneficiaries: 1200,
 deadline: "2025-09-30"
 }
 ];

 // Sample testimonials
 const testimonials: Testimonial[] = [
 {
 id: 1,
 name: "Sarah Johnson",
 role: "Village Elder, Kenya",
 content: "The clean water initiative has transformed our community. Our children no longer get sick from contaminated water, and women don't have to walk miles to fetch water anymore.",
 avatar: "https://randomuser.me/api/portraits/women/1.jpg"
 },
 {
 id: 2,
 name: "Michael Chen",
 role: "School Principal, Thailand",
 content: "Thanks to the Education for All program, our school now has a library full of books and computers. Our students have opportunities they never dreamed possible before.",
 avatar: "https://randomuser.me/api/portraits/men/2.jpg"
 },
 {
 id: 3,
 name: "Priya Sharma",
 role: "Small Business Owner, India",
 content: "The microloan I received through the Women's Empowerment Initiative allowed me to start my textile business. I can now provide for my family and even employ other women in my village.",
 avatar: "https://randomuser.me/api/portraits/women/3.jpg"
 }
 ];

 // Sample donation tiers
 const donationTiers: DonationTier[] = [
 {
 id: 1,
 name: "Supporter",
 amount: 50,
 benefits: ["Quarterly newsletter", "Name on donors page"]
 },
 {
 id: 2,
 name: "Advocate",
 amount: 250,
 benefits: ["Quarterly newsletter", "Name on donors page", "Personalized thank you card"]
 },
 {
 id: 3,
 name: "Champion",
 amount: 1000,
 benefits: ["Quarterly newsletter", "Name on donors page", "Personalized thank you card", "Annual impact report", "Invitation to virtual events"]
 },
 {
 id: 4,
 name: "Visionary",
 amount: 5000,
 benefits: ["Quarterly newsletter", "Name on donors page", "Personalized thank you card", "Annual impact report", "Invitation to virtual events", "Field trip opportunity", "Recognition in annual report"]
 }
 ];

 // Sample FAQs
 const faqs: FAQItem[] = [
 {
 id: 1,
 question: "How are projects selected?",
 answer: "Our team conducts thorough research to identify communities in need and projects that will have the most significant impact. We evaluate potential projects based on sustainability, community involvement, and long-term benefits."
 },
 {
 id: 2,
 question: "How much of my donation goes directly to the projects?",
 answer: "We're proud to say that 92% of all donations go directly to funding our projects. The remaining 8% covers essential administrative costs, fundraising, and maintaining our operations to ensure effective project management."
 },
 {
 id: 3,
 question: "Can I specify which project I want my donation to support?",
 answer: "Absolutely! When making a donation, you can select a specific project from our active initiatives. If you don't specify, your donation will be allocated where it's needed most."
 },
 {
 id: 4,
 question: "Are donations tax-deductible?",
 answer: "Yes, donations are tax-deductible in most countries where we operate. We provide donation receipts that can be used for tax purposes. Please consult with your tax advisor for specifics related to your country."
 },
 {
 id: 5,
 question: "How can I get involved beyond donating?",
 answer: "There are many ways to help! You can volunteer your time and skills, become an ambassador to spread awareness, start a fundraising campaign, or partner with us if you represent an organization. Contact us to discuss how you can contribute."
 }
 ];

 // Sample partners
 const partners: Partner[] = [
 {
 id: 1,
 name: "Global Health Alliance",
 logo: "https://placehold.co/200x100/e4e4e7/71717a?text=GHA",
 website: "https://example.com"
 },
 {
 id: 2,
 name: "Education Forward",
 logo: "https://placehold.co/200x100/e4e4e7/71717a?text=EF",
 website: "https://example.com"
 },
 {
 id: 3,
 name: "Clean Earth Initiative",
 logo: "https://placehold.co/200x100/e4e4e7/71717a?text=CEI",
 website: "https://example.com"
 },
 {
 id: 4,
 name: "United Development Fund",
 logo: "https://placehold.co/200x100/e4e4e7/71717a?text=UDF",
 website: "https://example.com"
 },
 {
 id: 5,
 name: "Worldwide Relief",
 logo: "https://placehold.co/200x100/e4e4e7/71717a?text=WR",
 website: "https://example.com"
 }
 ];

 // Contact information
 const contactInfo: ContactInfo = {
 email: "contact@philanthropist.org",
 phone: "+1 (555) 123-4567",
 address: "123 Giving Street, New York, NY 10001, USA",
 social: {
 twitter: "https://twitter.com",
 facebook: "https://facebook.com",
 instagram: "https://instagram.com",
 linkedin: "https://linkedin.com"
 }
 };

 // News & updates
 const news: NewsItem[] = [
 {
 id: 1,
 title: "Clean Water Initiative Reaches 50 New Villages",
 summary: "Our latest clean water project has successfully provided access to clean drinking water to 50 more villages in East Africa.",
 date: "2025-05-15",
 image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
 link: "/news/1"
 },
 {
 id: 2,
 title: "Annual Charity Gala Raises Record $2 Million",
 summary: "This year's fundraising gala exceeded all expectations, raising over $2 million to support our global initiatives.",
 date: "2025-04-22",
 image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
 link: "/news/2"
 },
 {
 id: 3,
 title: "New Partnership Announced with Global Health Alliance",
 summary: "We're excited to announce a new strategic partnership with Global Health Alliance to expand healthcare access in underserved regions.",
 date: "2025-03-10",
 image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
 link: "/news/3"
 }
 ];

 // Impact stats
 const stats: Stats = {
 projectsCompleted: 127,
 fundsRaised: 8500000,
 peopleHelped: 450000,
 countriesReached: 35
 };

 // Format number as currency
 const formatCurrency = (amount: number): string => {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0
 }).format(amount);
 };

 // Format number with commas
 const formatNumber = (num: number): string => {
 return new Intl.NumberFormat('en-US').format(num);
 };

 // Calculate funding progress percentage
 const calculateProgressPercentage = (raised: number, goal: number): number => {
 return Math.min(Math.round((raised / goal) * 100), 100);
 };

 // Donation modal state and handling
 const [showDonationModal, setShowDonationModal] = useState<boolean>(false);
 const [donationAmount, setDonationAmount] = useState<number>(100);
 const [selectedProject, setSelectedProject] = useState<Project | null>(null);
 const [customAmount, setCustomAmount] = useState<string>('');
 const [donationSuccess, setDonationSuccess] = useState<boolean>(false);

 const openDonationModal = (project: Project | null = null) => {
 setSelectedProject(project);
 setShowDonationModal(true);
 setDonationSuccess(false);
 };

 const closeDonationModal = () => {
 setShowDonationModal(false);
 };

 const handleDonationSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 // Simulate donation processing
 setTimeout(() => {
 setDonationSuccess(true);
 // Close modal after showing success message
 setTimeout(() => {
 setShowDonationModal(false);
 setDonationSuccess(false);
 }, 3000);
 }, 1000);
 };

 // Subscribe form state and handling
 const [email, setEmail] = useState<string>('');
 const [subscribeSuccess, setSubscribeSuccess] = useState<boolean>(false);

 const handleSubscribe = (e: React.FormEvent) => {
 e.preventDefault();
 // Simulate subscription processing
 setTimeout(() => {
 setSubscribeSuccess(true);
 setEmail('');
 // Reset success message after a few seconds
 setTimeout(() => {
 setSubscribeSuccess(false);
 }, 3000);
 }, 1000);
 };

 // FAQ accordion state
 const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

 const toggleFAQ = (id: number) => {
 setExpandedFAQ(expandedFAQ === id ? null : id);
 };

 // Format date
 const formatDate = (dateString: string): string => {
 const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
 return new Date(dateString).toLocaleDateString('en-US', options);
 };

 // Project filter state
 const [categoryFilter, setCategoryFilter] = useState<string>('all');
 const [statusFilter, setStatusFilter] = useState<string>('all');
 const [searchQuery, setSearchQuery] = useState<string>('');

 // Filter projects
 const filteredProjects = projects.filter(project => {
 const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
 const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
 const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
 project.description.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesCategory && matchesStatus && matchesSearch;
 });

 // Category options for filter
 const categories = ['all', ...new Set(projects.map(project => project.category))];

 return (
 <>
 {/* Navigation */}
 <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
 <div className="container mx-auto px-4 py-4">
 <nav className="flex justify-between items-center">
 <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center" role="banner" aria-label="Philanthropist Foundation">
 <Heart className="h-7 w-7 mr-2" />
 <span className="hidden sm:inline">Philanthropist Foundation</span>
 <span className="sm:hidden">Foundation</span>
 </Link>

 {/* Desktop Navigation */}
 <div className="hidden md:flex space-x-6 items-center">
 <Link to="/" className="nav-link">Home</Link>
 <Link to="/projects" className="nav-link">Projects</Link>
 <Link to="/about" className="nav-link">About Us</Link>
 <Link to="/contact" className="nav-link">Contact</Link>
 <button 
 onClick={() => openDonationModal()} 
 className="btn btn-primary" 
 aria-label="Donate now"
 >
 Donate Now
 </button>
 <button 
 className="theme-toggle" 
 onClick={() => setIsDarkMode(!isDarkMode)} 
 aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
 >
 {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
 </button>
 </div>

 {/* Mobile Menu Button */}
 <div className="flex items-center space-x-4 md:hidden">
 <button 
 className="theme-toggle" 
 onClick={() => setIsDarkMode(!isDarkMode)} 
 aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
 >
 {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
 </button>
 <button 
 className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" 
 onClick={() => setIsMenuOpen(!isMenuOpen)} 
 aria-label="Toggle menu"
 >
 {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
 </button>
 </div>
 </nav>
 </div>

 {/* Mobile Navigation Dropdown */}
 {isMenuOpen && (
 <div className="md:hidden bg-white dark:bg-gray-800 shadow-md transition-all duration-300" role="navigation">
 <div className="container mx-auto px-4 py-3 space-y-2">
 <Link to="/" className="mobile-nav-link">Home</Link>
 <Link to="/projects" className="mobile-nav-link">Projects</Link>
 <Link to="/about" className="mobile-nav-link">About Us</Link>
 <Link to="/contact" className="mobile-nav-link">Contact</Link>
 <button 
 onClick={() => {
 openDonationModal();
 setIsMenuOpen(false);
 }} 
 className="btn btn-primary w-full mt-3" 
 aria-label="Donate now"
 >
 Donate Now
 </button>
 </div>
 </div>
 )}
 </header>

 {/* Main Content */}
 <main className="flex-grow">
 <Routes>
 <Route path="/" element={<HomePage 
 projects={projects}
 testimonials={testimonials}
 stats={stats}
 formatCurrency={formatCurrency}
 formatNumber={formatNumber}
 calculateProgressPercentage={calculateProgressPercentage}
 openDonationModal={openDonationModal}
 news={news}
 partners={partners}
 handleSubscribe={handleSubscribe}
 email={email}
 setEmail={setEmail}
 subscribeSuccess={subscribeSuccess}
 formatDate={formatDate}
 />} />
 <Route path="/projects" element={<ProjectsPage 
 projects={filteredProjects}
 categories={categories}
 categoryFilter={categoryFilter}
 setCategoryFilter={setCategoryFilter}
 statusFilter={statusFilter}
 setStatusFilter={setStatusFilter}
 searchQuery={searchQuery}
 setSearchQuery={setSearchQuery}
 formatCurrency={formatCurrency}
 calculateProgressPercentage={calculateProgressPercentage}
 openDonationModal={openDonationModal}
 formatDate={formatDate}
 />} />
 <Route path="/about" element={<AboutPage 
 stats={stats}
 formatNumber={formatNumber}
 formatCurrency={formatCurrency}
 donationTiers={donationTiers}
 faqs={faqs}
 expandedFAQ={expandedFAQ}
 toggleFAQ={toggleFAQ}
 />} />
 <Route path="/contact" element={<ContactPage 
 contactInfo={contactInfo}
 />} />
 </Routes>
 </main>

 {/* Footer */}
 <footer className="bg-gray-800 dark:bg-gray-900 text-white py-12 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
 <div>
 <h3 className="text-xl font-bold mb-4 flex items-center">
 <Heart className="h-5 w-5 mr-2" />
 <span>Philanthropist Foundation</span>
 </h3>
 <p className="text-gray-400 mb-4">
 Empowering communities and creating lasting positive change through strategic philanthropy.
 </p>
 <div className="flex space-x-4">
 <a href={contactInfo.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
 </svg>
 </a>
 <a href={contactInfo.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
 </svg>
 </a>
 <a href={contactInfo.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
 </svg>
 </a>
 <a href={contactInfo.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
 </svg>
 </a>
 </div>
 </div>
 <div>
 <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
 <ul className="space-y-2">
 <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
 <li><Link to="/projects" className="text-gray-400 hover:text-white transition-colors">Projects</Link></li>
 <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
 <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
 <li><button onClick={() => openDonationModal()} className="text-gray-400 hover:text-white transition-colors">Donate</button></li>
 </ul>
 </div>
 <div>
 <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
 <ul className="space-y-2">
 <li className="flex items-start">
 <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
 <span className="text-gray-400">{contactInfo.address}</span>
 </li>
 <li className="flex items-center">
 <Phone className="h-5 w-5 mr-2 text-gray-400" />
 <a href={`tel:${contactInfo.phone}`} className="text-gray-400 hover:text-white transition-colors">{contactInfo.phone}</a>
 </li>
 <li className="flex items-center">
 <Mail className="h-5 w-5 mr-2 text-gray-400" />
 <a href={`mailto:${contactInfo.email}`} className="text-gray-400 hover:text-white transition-colors">{contactInfo.email}</a>
 </li>
 <li className="flex items-center">
 <Globe className="h-5 w-5 mr-2 text-gray-400" />
 <a href="https://www.philanthropist.org" className="text-gray-400 hover:text-white transition-colors">www.philanthropist.org</a>
 </li>
 </ul>
 </div>
 <div>
 <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
 <p className="text-gray-400 mb-4">Subscribe to our newsletter for updates on our projects and impact.</p>
 <form onSubmit={handleSubscribe}>
 <div className="flex flex-col sm:flex-row gap-2">
 <input 
 type="email" 
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="Your email address" 
 className="input py-2 px-3 bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:ring-primary-500 focus:border-primary-500"
 required
 />
 <button type="submit" className="btn btn-primary py-2">Subscribe</button>
 </div>
 {subscribeSuccess && (
 <p className="text-green-400 mt-2">Thank you for subscribing!</p>
 )}
 </form>
 </div>
 </div>
 <div className="border-t border-gray-700 mt-10 pt-6 text-sm text-center text-gray-400">
 Copyright © 2025 of Datavtar Private Limited. All rights reserved.
 </div>
 </div>
 </footer>

 {/* Donation Modal */}
 {showDonationModal && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-md mx-auto">
 <div className="modal-header">
 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
 {selectedProject ? `Support ${selectedProject.title}` : "Make a Donation"}
 </h2>
 <button onClick={closeDonationModal} className="text-gray-400 hover:text-gray-500">
 <X size={24} aria-label="Close" />
 </button>
 </div>
 {donationSuccess ? (
 <div className="py-6 text-center">
 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
 <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
 </div>
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Thank You!</h3>
 <p className="text-gray-600 dark:text-gray-300">
 Your donation has been processed successfully. We appreciate your support!
 </p>
 </div>
 ) : (
 <form onSubmit={handleDonationSubmit} className="py-4">
 {selectedProject && (
 <div className="mb-4">
 <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
 Your donation will support:
 </div>
 <div className="flex items-center">
 <img 
 src={selectedProject.image} 
 alt={selectedProject.title} 
 className="h-12 w-12 object-cover rounded mr-3" 
 />
 <div>
 <div className="font-medium text-gray-900 dark:text-white">{selectedProject.title}</div>
 <div className="text-xs text-gray-500 dark:text-gray-400">{selectedProject.category}</div>
 </div>
 </div>
 </div>
 )}
 
 <div className="mb-6">
 <label className="form-label mb-2">Choose Amount</label>
 <div className="grid grid-cols-2 gap-2 mb-3">
 {[50, 100, 250, 500].map((amount) => (
 <button
 key={amount}
 type="button"
 className={`btn ${donationAmount === amount ? 'btn-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}`}
 onClick={() => {
 setDonationAmount(amount);
 setCustomAmount('');
 }}
 >
 {formatCurrency(amount)}
 </button>
 ))}
 </div>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <span className="text-gray-500 dark:text-gray-400">$</span>
 </div>
 <input
 type="text"
 placeholder="Custom Amount"
 value={customAmount}
 onChange={(e) => {
 const value = e.target.value;
 if (value === '' || /^\d+$/.test(value)) {
 setCustomAmount(value);
 if (value !== '') {
 setDonationAmount(parseInt(value, 10));
 }
 }
 }}
 className="input pl-8"
 />
 </div>
 </div>
 
 <div className="space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="fullName">Full Name</label>
 <input id="fullName" type="text" className="input" required />
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="email">Email</label>
 <input id="email" type="email" className="input" required />
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="cardNumber">Card Number</label>
 <input 
 id="cardNumber" 
 type="text" 
 className="input" 
 placeholder="1234 5678 9012 3456" 
 maxLength={19}
 required 
 />
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="expiryDate">Expiry Date</label>
 <input 
 id="expiryDate" 
 type="text" 
 className="input" 
 placeholder="MM/YY" 
 maxLength={5}
 required 
 />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="cvv">CVV</label>
 <input 
 id="cvv" 
 type="text" 
 className="input" 
 placeholder="123" 
 maxLength={4}
 required 
 />
 </div>
 </div>
 </div>
 
 <div className="mt-6">
 <button type="submit" className="btn btn-primary w-full">
 Donate {formatCurrency(donationAmount)}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 )}
 </>
 );
};

// Home Page Component
const HomePage: React.FC<{
 projects: Project[];
 testimonials: Testimonial[];
 stats: Stats;
 formatCurrency: (amount: number) => string;
 formatNumber: (num: number) => string;
 calculateProgressPercentage: (raised: number, goal: number) => number;
 openDonationModal: (project?: Project | null) => void;
 news: NewsItem[];
 partners: Partner[];
 handleSubscribe: (e: React.FormEvent) => void;
 email: string;
 setEmail: React.Dispatch<React.SetStateAction<string>>;
 subscribeSuccess: boolean;
 formatDate: (dateString: string) => string;
}> = ({ 
 projects, 
 testimonials, 
 stats, 
 formatCurrency, 
 formatNumber, 
 calculateProgressPercentage, 
 openDonationModal,
 news,
 partners,
 handleSubscribe,
 email,
 setEmail,
 subscribeSuccess,
 formatDate
}) => {
 return (
 <div>
 {/* Hero Section */}
 <section className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white py-20 md:py-28">
 <div className="container mx-auto px-4">
 <div className="flex flex-col md:flex-row items-center">
 <div className="md:w-1/2 mb-10 md:mb-0">
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
 Empowering Change Through Strategic Philanthropy
 </h1>
 <p className="text-xl md:text-2xl mb-8 opacity-90">
 Join us in creating lasting positive impact for communities around the world.
 </p>
 <div className="flex flex-col sm:flex-row gap-4">
 <button 
 onClick={() => openDonationModal()} 
 className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 hover:text-primary-700"
 >
 Donate Now
 </button>
 <Link 
 to="/projects" 
 className="btn btn-lg bg-primary-700 text-white hover:bg-primary-800 border border-primary-500"
 >
 Explore Projects
 </Link>
 </div>
 </div>
 <div className="md:w-1/2 flex justify-center">
 <img 
 src="https://images.unsplash.com/photo-1469571486292-b53601021a68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" 
 alt="People volunteering together" 
 className="rounded-lg shadow-xl max-w-full h-auto lg:max-w-lg" 
 />
 </div>
 </div>
 </div>
 </section>

 {/* Stats Section */}
 <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
 <div className="stat-card">
 <div className="stat-value">{stats.projectsCompleted}</div>
 <div className="stat-title">Projects Completed</div>
 </div>
 <div className="stat-card">
 <div className="stat-value">{formatCurrency(stats.fundsRaised)}</div>
 <div className="stat-title">Funds Raised</div>
 </div>
 <div className="stat-card">
 <div className="stat-value">{formatNumber(stats.peopleHelped)}</div>
 <div className="stat-title">People Helped</div>
 </div>
 <div className="stat-card">
 <div className="stat-value">{stats.countriesReached}</div>
 <div className="stat-title">Countries Reached</div>
 </div>
 </div>
 </div>
 </section>

 {/* Featured Projects Section */}
 <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="text-center mb-12">
 <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Featured Projects</h2>
 <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
 Support initiatives that are making a real difference in the lives of communities around the world.
 </p>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {projects.slice(0, 3).map((project) => (
 <div key={project.id} className="card hover:shadow-lg transition-shadow duration-300">
 <div className="aspect-w-16 aspect-h-9 mb-4">
 <img 
 src={project.image} 
 alt={project.title} 
 className="object-cover rounded-lg" 
 />
 </div>
 <div className="mb-4">
 <div className="flex justify-between items-center mb-2">
 <span className="badge badge-info">{project.category}</span>
 <span className={`badge ${
 project.status === 'active' ? 'badge-success' :
 project.status === 'completed' ? 'badge-primary' :
 'badge-warning'
 }`}>
 {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
 </span>
 </div>
 <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{project.title}</h3>
 <p className="text-gray-600 dark:text-gray-300 mb-4">
 {project.description.length > 120
 ? `${project.description.substring(0, 120)}...`
 : project.description
 }
 </p>
 </div>
 
 <div className="mb-4">
 <div className="flex justify-between mb-1">
 <span className="text-gray-700 dark:text-gray-300 font-medium">
 {formatCurrency(project.fundingRaised)} raised
 </span>
 <span className="text-gray-700 dark:text-gray-300">
 {calculateProgressPercentage(project.fundingRaised, project.fundingGoal)}%
 </span>
 </div>
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
 <div 
 className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
 style={{ width: `${calculateProgressPercentage(project.fundingRaised, project.fundingGoal)}%` }}
 ></div>
 </div>
 <div className="flex justify-between mt-1 text-sm">
 <span className="text-gray-600 dark:text-gray-400">
 Goal: {formatCurrency(project.fundingGoal)}
 </span>
 <span className="text-gray-600 dark:text-gray-400 flex items-center">
 <Clock size={14} className="mr-1" />
 {formatDate(project.deadline)}
 </span>
 </div>
 </div>
 
 <div className="flex justify-between items-center">
 <button 
 onClick={() => openDonationModal(project)} 
 className="btn btn-primary"
 >
 Support This Project
 </button>
 <Link to="/projects" className="text-primary-600 dark:text-primary-400 hover:underline flex items-center text-sm font-medium">
 <span>Learn more</span>
 <ArrowRight size={16} className="ml-1" />
 </Link>
 </div>
 </div>
 ))}
 </div>
 
 <div className="text-center mt-10">
 <Link to="/projects" className="btn btn-secondary">
 View All Projects
 </Link>
 </div>
 </div>
 </section>

 {/* Mission Section */}
 <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="flex flex-col md:flex-row items-center">
 <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
 <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">Our Mission</h2>
 <div className="prose prose-lg dark:prose-invert max-w-none">
 <p>
 At Philanthropist Foundation, we believe in the power of strategic giving to create lasting positive change in the world. Our mission is to identify, support, and scale impactful initiatives that address critical global challenges.
 </p>
 <p>
 We work closely with communities, NGOs, governments, and private sector partners to develop sustainable solutions that empower people and protect our planet. By combining innovative approaches with rigorous evaluation, we ensure that every dollar contributed creates maximum impact.
 </p>
 <p>
 Join us in our journey to build a more equitable, sustainable, and prosperous world for all.
 </p>
 </div>
 <div className="mt-8">
 <Link to="/about" className="btn btn-primary">
 Learn More About Us
 </Link>
 </div>
 </div>
 <div className="md:w-1/2">
 <div className="grid grid-cols-2 gap-4">
 <img 
 src="https://images.unsplash.com/photo-1607297737160-f5b01a1a3303?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" 
 alt="Children education" 
 className="rounded-lg shadow-md h-48 object-cover w-full" 
 />
 <img 
 src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" 
 alt="Environmental conservation" 
 className="rounded-lg shadow-md h-48 object-cover w-full" 
 />
 <img 
 src="https://images.unsplash.com/photo-1541976844346-f18aeac57b06?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" 
 alt="Healthcare delivery" 
 className="rounded-lg shadow-md h-48 object-cover w-full" 
 />
 <img 
 src="https://images.unsplash.com/photo-1541802645635-11f2286a7482?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" 
 alt="Community development" 
 className="rounded-lg shadow-md h-48 object-cover w-full" 
 />
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Testimonials Section */}
 <section className="py-16 bg-primary-50 dark:bg-primary-900/20 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="text-center mb-12">
 <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Voices of Impact</h2>
 <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
 Hear from the communities and individuals whose lives have been transformed through our work.
 </p>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {testimonials.map((testimonial) => (
 <div key={testimonial.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
 <div className="flex items-center mb-4">
 <img 
 src={testimonial.avatar} 
 alt={testimonial.name} 
 className="w-12 h-12 rounded-full mr-4" 
 />
 <div>
 <h3 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h3>
 <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
 </div>
 </div>
 <svg className="h-8 w-8 text-primary-200 dark:text-primary-700 mb-4" fill="currentColor" viewBox="0 0 32 32">
 <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
 </svg>
 <p className="text-gray-600 dark:text-gray-300 mb-4">{testimonial.content}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Latest News Section */}
 <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="text-center mb-12">
 <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Latest News & Updates</h2>
 <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
 Stay informed about our recent activities, achievements, and upcoming events.
 </p>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {news.map((item) => (
 <div key={item.id} className="card hover:shadow-lg transition-shadow duration-300">
 <div className="aspect-w-16 aspect-h-9 mb-4">
 <img 
 src={item.image} 
 alt={item.title} 
 className="object-cover rounded-lg" 
 />
 </div>
 <div className="mb-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
 <Calendar size={14} className="mr-1" />
 {formatDate(item.date)}
 </div>
 <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{item.title}</h3>
 <p className="text-gray-600 dark:text-gray-300 mb-4">{item.summary}</p>
 <Link to={item.link} className="text-primary-600 dark:text-primary-400 hover:underline flex items-center text-sm font-medium">
 <span>Read more</span>
 <ArrowRight size={16} className="ml-1" />
 </Link>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Partners Section */}
 <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="text-center mb-12">
 <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Our Partners</h2>
 <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
 We collaborate with these organizations to maximize our impact and reach.
 </p>
 </div>
 
 <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
 {partners.map((partner) => (
 <a 
 key={partner.id} 
 href={partner.website} 
 target="_blank" 
 rel="noopener noreferrer" 
 className="flex justify-center transition-opacity hover:opacity-80"
 >
 <img 
 src={partner.logo} 
 alt={partner.name} 
 className="h-16 max-w-full object-contain"
 />
 </a>
 ))}
 </div>
 </div>
 </section>

 {/* CTA Section */}
 <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white">
 <div className="container mx-auto px-4 text-center">
 <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
 <p className="text-lg mb-8 opacity-90 max-w-3xl mx-auto">
 Your contribution, no matter the size, can help us create lasting positive change in communities around the world.
 </p>
 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <button 
 onClick={() => openDonationModal()} 
 className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100 hover:text-primary-700"
 >
 Donate Now
 </button>
 <Link 
 to="/contact" 
 className="btn btn-lg bg-primary-700 text-white hover:bg-primary-800 border border-primary-500"
 >
 Get Involved
 </Link>
 </div>
 </div>
 </section>

 {/* Newsletter Section */}
 <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="max-w-3xl mx-auto text-center">
 <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Stay Updated</h2>
 <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
 Subscribe to our newsletter to receive updates on our projects, events, and impact stories.
 </p>
 <form onSubmit={handleSubscribe}>
 <div className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
 <input 
 type="email" 
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="Your email address" 
 className="input flex-grow" 
 required
 />
 <button type="submit" className="btn btn-primary">
 Subscribe
 </button>
 </div>
 {subscribeSuccess && (
 <p className="text-green-600 dark:text-green-400 mt-4">Thank you for subscribing to our newsletter!</p>
 )}
 </form>
 </div>
 </div>
 </section>
 </div>
 );
};

// Projects Page Component
const ProjectsPage: React.FC<{
 projects: Project[];
 categories: string[];
 categoryFilter: string;
 setCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
 statusFilter: string;
 setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
 searchQuery: string;
 setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
 formatCurrency: (amount: number) => string;
 calculateProgressPercentage: (raised: number, goal: number) => number;
 openDonationModal: (project: Project) => void;
 formatDate: (dateString: string) => string;
}> = ({ 
 projects, 
 categories, 
 categoryFilter, 
 setCategoryFilter, 
 statusFilter, 
 setStatusFilter, 
 searchQuery, 
 setSearchQuery, 
 formatCurrency, 
 calculateProgressPercentage, 
 openDonationModal,
 formatDate
}) => {
 return (
 <div>
 {/* Projects Header */}
 <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white py-16">
 <div className="container mx-auto px-4 text-center">
 <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Projects</h1>
 <p className="text-xl max-w-3xl mx-auto opacity-90">
 Explore our current initiatives and see how your support can make a real difference in communities around the world.
 </p>
 </div>
 </section>

 {/* Filters and Projects */}
 <section className="py-12 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
 <div className="container mx-auto px-4">
 {/* Search and Filters */}
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
 <div className="relative flex-grow">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search className="h-5 w-5 text-gray-400" />
 </div>
 <input 
 type="text"
 placeholder="Search projects..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="input pl-10 w-full"
 aria-label="Search projects"
 />
 </div>

 <div className="flex flex-col sm:flex-row gap-4">
 <div>
 <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Category
 </label>
 <select 
 id="categoryFilter"
 value={categoryFilter}
 onChange={(e) => setCategoryFilter(e.target.value)}
 className="input"
 aria-label="Filter by category"
 >
 {categories.map((category) => (
 <option key={category} value={category}>
 {category === 'all' ? 'All Categories' : category}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
 Status
 </label>
 <select 
 id="statusFilter"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="input"
 aria-label="Filter by status"
 >
 <option value="all">All Statuses</option>
 <option value="active">Active</option>
 <option value="completed">Completed</option>
 <option value="upcoming">Upcoming</option>
 </select>
 </div>
 </div>
 </div>

 <div className="text-sm text-gray-600 dark:text-gray-400">
 Showing {projects.length} {projects.length === 1 ? 'project' : 'projects'}
 {categoryFilter !== 'all' && ` in ${categoryFilter}`}
 {statusFilter !== 'all' && ` with ${statusFilter} status`}
 {searchQuery && ` matching "${searchQuery}"`}
 </div>
 </div>

 {/* Projects Grid */}
 {projects.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {projects.map((project) => (
 <div key={project.id} className="card hover:shadow-lg transition-shadow duration-300">
 <div className="aspect-w-16 aspect-h-9 mb-4">
 <img 
 src={project.image} 
 alt={project.title} 
 className="object-cover rounded-lg" 
 />
 </div>
 <div className="mb-4">
 <div className="flex justify-between items-center mb-2">
 <span className="badge badge-info">{project.category}</span>
 <span className={`badge ${
 project.status === 'active' ? 'badge-success' :
 project.status === 'completed' ? 'badge-primary' :
 'badge-warning'
 }`}>
 {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
 </span>
 </div>
 <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{project.title}</h2>
 <p className="text-gray-600 dark:text-gray-300 mb-4">{project.description}</p>
 </div>
 
 <div className="mb-4">
 <div className="flex justify-between mb-1">
 <span className="text-gray-700 dark:text-gray-300 font-medium">
 {formatCurrency(project.fundingRaised)} raised
 </span>
 <span className="text-gray-700 dark:text-gray-300">
 {calculateProgressPercentage(project.fundingRaised, project.fundingGoal)}%
 </span>
 </div>
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
 <div 
 className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
 style={{ width: `${calculateProgressPercentage(project.fundingRaised, project.fundingGoal)}%` }}
 ></div>
 </div>
 <div className="flex justify-between mt-1 text-sm">
 <span className="text-gray-600 dark:text-gray-400">
 Goal: {formatCurrency(project.fundingGoal)}
 </span>
 <span className="text-gray-600 dark:text-gray-400 flex items-center">
 <Clock size={14} className="mr-1" />
 {formatDate(project.deadline)}
 </span>
 </div>
 </div>
 
 <div className="flex items-center justify-between">
 <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
 <Users size={16} className="mr-1" />
 <span>{project.beneficiaries.toLocaleString()} beneficiaries</span>
 </div>
 
 <button 
 onClick={() => openDonationModal(project)}
 className={`btn ${
 project.status === 'active' ? 'btn-primary' :
 project.status === 'completed' ? 'bg-gray-500 text-white hover:bg-gray-600' :
 'bg-amber-500 text-white hover:bg-amber-600'
 }`}
 disabled={project.status === 'completed'}
 >
 {project.status === 'active' ? 'Support Now' :
 project.status === 'completed' ? 'Completed' :
 'Coming Soon'}
 </button>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
 <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
 <p className="text-gray-600 dark:text-gray-400 mb-4">
 Try adjusting your search criteria or browse all our projects.
 </p>
 <button 
 onClick={() => {
 setSearchQuery('');
 setCategoryFilter('all');
 setStatusFilter('all');
 }}
 className="btn btn-primary"
 >
 Reset Filters
 </button>
 </div>
 )}
 </div>
 </section>
 </div>
 );
};

// About Page Component
const AboutPage: React.FC<{
 stats: Stats;
 formatNumber: (num: number) => string;
 formatCurrency: (amount: number) => string;
 donationTiers: DonationTier[];
 faqs: FAQItem[];
 expandedFAQ: number | null;
 toggleFAQ: (id: number) => void;
}> = ({ 
 stats, 
 formatNumber, 
 formatCurrency,
 donationTiers,
 faqs,
 expandedFAQ,
 toggleFAQ
}) => {
 return (
 <div>
 {/* About Header */}
 <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white py-16">
 <div className="container mx-auto px-4 text-center">
 <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
 <p className="text-xl max-w-3xl mx-auto opacity-90">
 Learn about our mission, vision, and the team behind Philanthropist Foundation.
 </p>
 </div>
 </section>

 {/* Our Story */}
 <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="flex flex-col md:flex-row items-center">
 <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
 <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Our Story</h2>
 <div className="prose prose-lg dark:prose-invert max-w-none">
 <p>
 Philanthropist Foundation was established in 2015 by a group of dedicated individuals who shared a common vision: to create a more equitable world where everyone has access to opportunities for a better life.
 </p>
 <p>
 What began as a small initiative supporting local projects has grown into a global foundation with a presence in over {stats.countriesReached} countries. Throughout our journey, we've remained committed to our core values of transparency, accountability, and community-driven approaches.
 </p>
 <p>
 To date, we've successfully completed {stats.projectsCompleted} projects, raised over {formatCurrency(stats.fundsRaised)}, and positively impacted the lives of more than {formatNumber(stats.peopleHelped)} people worldwide.
 </p>
 <p>
 Our work spans across multiple sectors including education, healthcare, clean water, renewable energy, and environmental conservation – addressing the most pressing challenges facing humanity today.
 </p>
 </div>
 </div>
 <div className="md:w-1/2">
 <img 
 src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" 
 alt="Team working together" 
 className="rounded-lg shadow-xl w-full" 
 />
 </div>
 </div>
 </div>
 </section>

 {/* Mission, Vision, Values */}
 <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Mission, Vision & Values</h2>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <div className="card theme-transition-all">
 <div className="flex justify-center items-center h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6 mx-auto">
 <Briefcase className="h-8 w-8 text-primary-600 dark:text-primary-400" />
 </div>
 <h3 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Our Mission</h3>
 <p className="text-gray-600 dark:text-gray-300 text-center">
 To identify, support, and scale impactful initiatives that address critical global challenges and create lasting positive change in communities worldwide.
 </p>
 </div>
 
 <div className="card theme-transition-all">
 <div className="flex justify-center items-center h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6 mx-auto">
 <Globe className="h-8 w-8 text-primary-600 dark:text-primary-400" />
 </div>
 <h3 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Our Vision</h3>
 <p className="text-gray-600 dark:text-gray-300 text-center">
 A world where all people have the resources, opportunities, and environment they need to thrive and reach their full potential, regardless of where they were born.
 </p>
 </div>
 
 <div className="card theme-transition-all">
 <div className="flex justify-center items-center h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6 mx-auto">
 <Heart className="h-8 w-8 text-primary-600 dark:text-primary-400" />
 </div>
 <h3 className="text-xl font-semibold mb-4 text-center text-gray-900 dark:text-white">Our Values</h3>
 <ul className="space-y-2 text-gray-600 dark:text-gray-300">
 <li className="flex items-start">
 <Check className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" />
 <span><strong>Transparency:</strong> We maintain open communication about our work and finances.</span>
 </li>
 <li className="flex items-start">
 <Check className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" />
 <span><strong>Accountability:</strong> We measure our impact and take responsibility for results.</span>
 </li>
 <li className="flex items-start">
 <Check className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" />
 <span><strong>Community-Driven:</strong> We prioritize local input and leadership.</span>
 </li>
 <li className="flex items-start">
 <Check className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" />
 <span><strong>Innovation:</strong> We seek creative solutions to complex problems.</span>
 </li>
 <li className="flex items-start">
 <Check className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" />
 <span><strong>Sustainability:</strong> We design projects for long-term impact.</span>
 </li>
 </ul>
 </div>
 </div>
 </div>
 </section>

 {/* Our Team */}
 <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Leadership Team</h2>
 <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
 Meet the passionate individuals who guide our foundation's vision and work.
 </p>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
 {/* Team Member 1 */}
 <div className="text-center">
 <div className="mb-4 relative mx-auto w-48 h-48 overflow-hidden rounded-full">
 <img 
 src="https://randomuser.me/api/portraits/women/44.jpg" 
 alt="Sarah Wilson" 
 className="object-cover w-full h-full transition-transform hover:scale-110 duration-300" 
 />
 </div>
 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sarah Wilson</h3>
 <p className="text-primary-600 dark:text-primary-400 mb-2">Chief Executive Officer</p>
 <p className="text-gray-600 dark:text-gray-300 mb-4 px-4">
 Former NGO executive with 15+ years of experience in global development.
 </p>
 <div className="flex justify-center space-x-3">
 <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
 </svg>
 </a>
 <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
 </svg>
 </a>
 </div>
 </div>
 
 {/* Team Member 2 */}
 <div className="text-center">
 <div className="mb-4 relative mx-auto w-48 h-48 overflow-hidden rounded-full">
 <img 
 src="https://randomuser.me/api/portraits/men/32.jpg" 
 alt="Michael Chen" 
 className="object-cover w-full h-full transition-transform hover:scale-110 duration-300" 
 />
 </div>
 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Michael Chen</h3>
 <p className="text-primary-600 dark:text-primary-400 mb-2">Chief Operations Officer</p>
 <p className="text-gray-600 dark:text-gray-300 mb-4 px-4">
 Seasoned operations expert with background in international humanitarian work.
 </p>
 <div className="flex justify-center space-x-3">
 <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
 </svg>
 </a>
 <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
 </svg>
 </a>
 </div>
 </div>
 
 {/* Team Member 3 */}
 <div className="text-center">
 <div className="mb-4 relative mx-auto w-48 h-48 overflow-hidden rounded-full">
 <img 
 src="https://randomuser.me/api/portraits/women/68.jpg" 
 alt="Priya Sharma" 
 className="object-cover w-full h-full transition-transform hover:scale-110 duration-300" 
 />
 </div>
 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Priya Sharma</h3>
 <p className="text-primary-600 dark:text-primary-400 mb-2">Director of Programs</p>
 <p className="text-gray-600 dark:text-gray-300 mb-4 px-4">
 Development specialist focused on sustainable community programs.
 </p>
 <div className="flex justify-center space-x-3">
 <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
 </svg>
 </a>
 <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
 </svg>
 </a>
 </div>
 </div>
 
 {/* Team Member 4 */}
 <div className="text-center">
 <div className="mb-4 relative mx-auto w-48 h-48 overflow-hidden rounded-full">
 <img 
 src="https://randomuser.me/api/portraits/men/75.jpg" 
 alt="James Okonkwo" 
 className="object-cover w-full h-full transition-transform hover:scale-110 duration-300" 
 />
 </div>
 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">James Okonkwo</h3>
 <p className="text-primary-600 dark:text-primary-400 mb-2">Chief Financial Officer</p>
 <p className="text-gray-600 dark:text-gray-300 mb-4 px-4">
 Finance expert with deep experience in nonprofit organizations.
 </p>
 <div className="flex justify-center space-x-3">
 <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
 </svg>
 </a>
 <a href="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
 <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
 </svg>
 </a>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Donation Tiers */}
 <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Ways to Support Our Mission</h2>
 <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
 Choose your level of impact and enjoy special benefits as a thank you for your support.
 </p>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
 {donationTiers.map((tier) => (
 <div key={tier.id} className="card hover:shadow-lg transition-shadow duration-300 flex flex-col">
 <div className="pb-6 mb-6 border-b border-gray-200 dark:border-gray-700">
 <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{tier.name}</h3>
 <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">
 {formatCurrency(tier.amount)}
 </div>
 <p className="text-gray-600 dark:text-gray-300">
 Support our mission with a {tier.name.toLowerCase()} level donation.
 </p>
 </div>
 
 <div className="flex-grow">
 <h4 className="font-medium text-gray-900 dark:text-white mb-3">Benefits:</h4>
 <ul className="space-y-2 mb-6">
 {tier.benefits.map((benefit, index) => (
 <li key={index} className="flex items-start">
 <Check className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2 mt-0.5" />
 <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
 </li>
 ))}
 </ul>
 </div>
 
 <button className="btn btn-primary mt-auto w-full">
 Choose {tier.name}
 </button>
 </div>
 ))}
 </div>
 
 <div className="text-center mt-10 max-w-3xl mx-auto">
 <p className="text-gray-600 dark:text-gray-300 mb-4">
 For larger donations or corporate partnerships, please contact our development team directly.
 </p>
 <Link to="/contact" className="btn btn-secondary">
 Contact Us About Partnerships
 </Link>
 </div>
 </div>
 </section>

 {/* FAQs */}
 <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
 <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
 Find answers to common questions about our work and how you can support us.
 </p>
 </div>
 
 <div className="max-w-3xl mx-auto space-y-4">
 {faqs.map((faq) => (
 <div 
 key={faq.id} 
 className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-300"
 >
 <button 
 className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
 onClick={() => toggleFAQ(faq.id)}
 aria-expanded={expandedFAQ === faq.id}
 >
 <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
 {expandedFAQ === faq.id ? (
 <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
 ) : (
 <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
 )}
 </button>
 
 {expandedFAQ === faq.id && (
 <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
 <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
 </div>
 )}
 </div>
 ))}
 </div>
 
 <div className="text-center mt-10">
 <p className="text-gray-600 dark:text-gray-300 mb-4">
 Still have questions? We're here to help.
 </p>
 <Link to="/contact" className="btn btn-primary">
 Contact Us
 </Link>
 </div>
 </div>
 </section>
 </div>
 );
};

// Contact Page Component
const ContactPage: React.FC<{
 contactInfo: ContactInfo;
}> = ({ contactInfo }) => {
 const [formData, setFormData] = useState({
 name: '',
 email: '',
 subject: '',
 message: ''
 });
 const [formSubmitted, setFormSubmitted] = useState(false);
 
 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setFormData(prevState => ({
 ...prevState,
 [name]: value
 }));
 };
 
 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 // Simulate form submission
 setTimeout(() => {
 setFormSubmitted(true);
 setFormData({
 name: '',
 email: '',
 subject: '',
 message: ''
 });
 // Reset success message after a few seconds
 setTimeout(() => {
 setFormSubmitted(false);
 }, 5000);
 }, 1000);
 };
 
 return (
 <div>
 {/* Contact Header */}
 <section className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white py-16">
 <div className="container mx-auto px-4 text-center">
 <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
 <p className="text-xl max-w-3xl mx-auto opacity-90">
 Have questions or want to get involved? We'd love to hear from you.
 </p>
 </div>
 </section>

 {/* Contact Form and Information */}
 <section className="py-16 bg-white dark:bg-gray-800 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="flex flex-col lg:flex-row gap-12">
 {/* Contact Information */}
 <div className="lg:w-1/3">
 <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Get in Touch</h2>
 
 <div className="space-y-6">
 <div className="flex items-start">
 <div className="flex-shrink-0">
 <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
 </div>
 <div className="ml-4">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Our Address</h3>
 <p className="mt-1 text-gray-600 dark:text-gray-300">{contactInfo.address}</p>
 </div>
 </div>
 
 <div className="flex items-start">
 <div className="flex-shrink-0">
 <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
 </div>
 <div className="ml-4">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Us</h3>
 <p className="mt-1">
 <a href={`mailto:${contactInfo.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">
 {contactInfo.email}
 </a>
 </p>
 </div>
 </div>
 
 <div className="flex items-start">
 <div className="flex-shrink-0">
 <Phone className="h-6 w-6 text-primary-600 dark:text-primary-400" />
 </div>
 <div className="ml-4">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Call Us</h3>
 <p className="mt-1">
 <a href={`tel:${contactInfo.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
 {contactInfo.phone}
 </a>
 </p>
 </div>
 </div>
 </div>
 
 <div className="mt-10">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Follow Us</h3>
 <div className="flex space-x-4">
 <a href={contactInfo.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
 <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
 </svg>
 </a>
 <a href={contactInfo.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
 <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
 </svg>
 </a>
 <a href={contactInfo.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
 <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
 </svg>
 </a>
 <a href={contactInfo.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
 <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
 </svg>
 </a>
 </div>
 </div>
 </div>
 
 {/* Contact Form */}
 <div className="lg:w-2/3">
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
 <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send Us a Message</h2>
 
 {formSubmitted ? (
 <div className="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-md mb-6">
 <div className="flex">
 <div className="flex-shrink-0">
 <Check className="h-5 w-5 text-green-400 dark:text-green-300" />
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium">Message sent successfully!</h3>
 <div className="mt-2 text-sm">
 <p>Thank you for contacting us. We'll get back to you shortly.</p>
 </div>
 </div>
 </div>
 </div>
 ) : null}
 
 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="form-group">
 <label className="form-label" htmlFor="name">Your Name</label>
 <input 
 id="name" 
 name="name" 
 type="text" 
 value={formData.name}
 onChange={handleChange}
 className="input" 
 required 
 />
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="email">Your Email</label>
 <input 
 id="email" 
 name="email" 
 type="email" 
 value={formData.email}
 onChange={handleChange}
 className="input" 
 required 
 />
 </div>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="subject">Subject</label>
 <select 
 id="subject" 
 name="subject" 
 value={formData.subject}
 onChange={handleChange}
 className="input" 
 required
 >
 <option value="">Select a subject</option>
 <option value="General Inquiry">General Inquiry</option>
 <option value="Donation Question">Donation Question</option>
 <option value="Volunteer Opportunities">Volunteer Opportunities</option>
 <option value="Partnership Proposal">Partnership Proposal</option>
 <option value="Media Inquiry">Media Inquiry</option>
 <option value="Other">Other</option>
 </select>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="message">Your Message</label>
 <textarea 
 id="message" 
 name="message" 
 rows={6} 
 value={formData.message}
 onChange={handleChange}
 className="input" 
 required
 ></textarea>
 </div>
 
 <div className="flex items-center">
 <input 
 id="terms" 
 type="checkbox" 
 className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
 required
 />
 <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
 I agree to the <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">privacy policy</a> and consent to being contacted regarding my inquiry.
 </label>
 </div>
 
 <button type="submit" className="btn btn-primary w-full md:w-auto">
 Send Message
 </button>
 </form>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Map Section */}
 <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
 <div className="container mx-auto px-4">
 <div className="text-center mb-10">
 <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Visit Our Office</h2>
 <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
 We're located in the heart of New York City. Feel free to stop by during office hours.
 </p>
 </div>
 
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
 <div className="aspect-w-16 aspect-h-9">
 {/* This would be a real map in a production application */}
 <div className="bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center">
 <div className="text-center">
 <MapPin className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
 <p className="text-gray-700 dark:text-gray-300 font-medium">Interactive Map</p>
 <p className="text-gray-500 dark:text-gray-400 text-sm">(Map would be displayed here)</p>
 </div>
 </div>
 </div>
 <div className="p-6">
 <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
 <div>
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Philanthropist Foundation HQ</h3>
 <p className="text-gray-600 dark:text-gray-300 mt-1">{contactInfo.address}</p>
 </div>
 <div>
 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Office Hours</h3>
 <p className="text-gray-600 dark:text-gray-300 mt-1">Monday - Friday: 9AM - 5PM</p>
 <p className="text-gray-600 dark:text-gray-300">Saturday - Sunday: Closed</p>
 </div>
 <div>
 <a 
 href="https://maps.google.com" 
 target="_blank" 
 rel="noopener noreferrer" 
 className="btn btn-primary flex items-center"
 >
 <ExternalLink size={16} className="mr-2" />
 Get Directions
 </a>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 </div>
 );
};

export default App;
