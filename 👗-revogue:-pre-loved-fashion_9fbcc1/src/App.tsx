import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';
import {
    LayoutDashboard, Tag, PlusCircle, Settings, Trash2, Edit, Search, Sun, Moon, Sparkles, X, Upload, Download, ArrowUp, ArrowDown, ShoppingCart, DollarSign, Package, BarChart3, AlertTriangle, CheckCircle, FileDown, ExternalLink, Menu
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';

// --- TYPE DEFINITIONS --- //
type ListingStatus = 'Available' | 'Sold';
type Condition = 'New with Tags' | 'Like New' | 'Good' | 'Fair';
type Category = 'Tops' | 'Bottoms' | 'Dresses' | 'Outerwear' | 'Shoes' | 'Accessories' | 'Other';

interface Listing {
    id: string;
    title: string;
    description: string;
    price: number;
    category: Category;
    condition: Condition;
    size: string;
    imageUrl: string | null;
    status: ListingStatus;
    dateAdded: string;
}

interface SortConfig {
    key: keyof Listing;
    direction: 'ascending' | 'descending';
}

type View = 'dashboard' | 'listings' | 'settings';

interface AIResponse {
    title?: string;
    description?: string;
    category?: Category;
    color?: string;
    tags?: string[];
}

// --- MOCK DATA & HELPERS --- //
const initialListings: Listing[] = [
    { id: '1', title: 'Vintage Denim Jacket', description: 'Classic 80s denim jacket, slightly faded.', price: 45.00, category: 'Outerwear', condition: 'Good', size: 'M', imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=300', status: 'Available', dateAdded: '2025-06-10' },
    { id: '2', title: 'Silk Floral Blouse', description: 'Lightweight silk blouse with a vibrant floral pattern.', price: 30.00, category: 'Tops', condition: 'Like New', size: 'S', imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6d5f96503?q=80&w=300', status: 'Available', dateAdded: '2025-06-05' },
    { id: '3', title: 'High-Waisted Trousers', description: 'Beige high-waisted trousers, perfect for office wear.', price: 25.00, category: 'Bottoms', condition: 'Good', size: '8', imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=300', status: 'Sold', dateAdded: '2025-05-20' },
    { id: '4', title: 'Leather Ankle Boots', description: 'Barely worn black leather boots.', price: 75.00, category: 'Shoes', condition: 'Like New', size: '7.5', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=300', status: 'Available', dateAdded: '2025-06-12' },
    { id: '5', title: 'Striped Summer Dress', description: 'Comfortable cotton dress for warm weather.', price: 35.00, category: 'Dresses', condition: 'New with Tags', size: 'L', imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=300', status: 'Available', dateAdded: '2025-06-01' },
];

const CATEGORIES: Category[] = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Other'];
const CONDITIONS: Condition[] = ['New with Tags', 'Like New', 'Good', 'Fair'];
const SIZES: string[] = ['XS', 'S', 'M', 'L', 'XL', 'OS'];

// --- CUSTOM HOOKS --- //
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

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(error);
        }
    }, [key, state]);

    return [state, setState];
};


// --- MAIN APP COMPONENT --- //
function App() {
    const { currentUser, logout } = useAuth();
    const { isDark, toggleDarkMode } = useDarkMode();
    const [activeView, setActiveView] = usePersistentState<View>('revogue-activeView', 'dashboard');
    const [listings, setListings] = usePersistentState<Listing[]>('revogue-listings', initialListings);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingListing, setEditingListing] = useState<Listing | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Listing | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<ListingStatus | 'All'>('All');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'dateAdded', direction: 'descending' });

    const aiLayerRef = useRef<AILayerHandle>(null);
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<any | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openAddItemModal = () => {
        setEditingListing(null);
        setAiResult(null);
        setAiError(null);
        setUploadedImage(null);
        setIsModalOpen(true);
    };

    const openEditItemModal = (listing: Listing) => {
        setEditingListing(listing);
        setAiResult(null);
        setAiError(null);
        setUploadedImage(listing.imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingListing(null);
        setAiResult(null);
        setUploadedImage(null);
    };

    const handleFormSubmit = (formData: Omit<Listing, 'id' | 'dateAdded'>) => {
        if (editingListing) {
            setListings(listings.map(l => l.id === editingListing.id ? { ...editingListing, ...formData } : l));
        } else {
            const newListing: Listing = {
                id: new Date().toISOString(),
                ...formData,
                dateAdded: new Date().toISOString().split('T')[0],
            };
            setListings([newListing, ...listings]);
        }
        closeModal();
    };
    
    const handleDeleteListing = (listingId: string) => {
        setListings(listings.filter(l => l.id !== listingId));
        setShowDeleteConfirm(null);
    };

    const requestSort = (key: keyof Listing) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedListings = React.useMemo(() => {
        let sortableItems = [...listings];

        if (filterStatus !== 'All') {
            sortableItems = sortableItems.filter(listing => listing.status === filterStatus);
        }

        if (searchTerm) {
            sortableItems = sortableItems.filter(listing =>
                listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                listing.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [listings, searchTerm, filterStatus, sortConfig]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setAiResult(null);
                setAiError(null);
                const prompt = `Analyze this clothing image. Extract the item type, color, style, and suggest a title, a compelling description, and a category from the following options: ${CATEGORIES.join(', ')}. Return the result as a valid JSON object with keys: "title", "description", "category".`;
                aiLayerRef.current?.sendToAI(prompt, file);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const exportDataToCSV = () => {
        const headers = "ID,Title,Description,Price,Category,Condition,Size,Image URL,Status,Date Added\n";
        const csvContent = "data:text/csv;charset=utf-8," + headers + listings.map(l =>
            `"${l.id}","${l.title.replace(/"/g, '""')}","${l.description.replace(/"/g, '""')}","${l.price}","${l.category}","${l.condition}","${l.size}","${l.imageUrl || ''}","${l.status}","${l.dateAdded}"`
        ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "revogue_listings.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const deleteAllData = () => {
        if (window.confirm("Are you sure you want to delete ALL your listings? This action cannot be undone.")) {
             setListings([]);
        }
    }

    const salesData = React.useMemo(() => {
        const soldItems = listings.filter(l => l.status === 'Sold');
        const salesByMonth: { [key: string]: { revenue: number, count: number } } = {};

        soldItems.forEach(item => {
            const month = new Date(item.dateAdded).toLocaleString('default', { month: 'short', year: '2-digit' });
            if (!salesByMonth[month]) {
                salesByMonth[month] = { revenue: 0, count: 0 };
            }
            salesByMonth[month].revenue += item.price;
            salesByMonth[month].count++;
        });

        // Ensure we have some data points for the chart, even if zero
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date('2025-06-13');
            d.setMonth(d.getMonth() - i);
            last6Months.push(d.toLocaleString('default', { month: 'short', year: '2-digit' }));
        }

        return last6Months.map(month => ({
            name: month,
            Revenue: salesByMonth[month]?.revenue || 0,
            ItemsSold: salesByMonth[month]?.count || 0,
        }));
    }, [listings]);

    const stats = {
        totalListings: listings.length,
        itemsSold: listings.filter(l => l.status === 'Sold').length,
        totalRevenue: listings.filter(l => l.status === 'Sold').reduce((acc, curr) => acc + curr.price, 0),
        activeListings: listings.filter(l => l.status === 'Available').length,
    };

    const NavLink = ({ view, icon, label }: { view: View, icon: React.ElementType, label: string }) => (
        <button
            id={`${view}-nav`}
            onClick={() => setActiveView(view)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${activeView === view ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            {React.createElement(icon, { className: 'h-5 w-5' })}
            <span className="font-medium">{label}</span>
        </button>
    );

    const StatCard = ({ title, value, icon, change }: { title: string, value: string | number, icon: React.ElementType, change?: string }) => (
        <div className="card card-padding bg-white dark:bg-gray-800 flex-1 min-w-[200px]">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                {React.createElement(icon, { className: 'h-6 w-6 text-gray-400 dark:text-gray-500' })}
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{value}</p>
            {change && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{change}</p>}
        </div>
    );
    
    // --- VIEWS / SUB-COMPONENTS --- //

    const DashboardView = () => (
        <div id="dashboard-view" className="space-y-6 animate-fade-in">
            <h1 className="heading-2 text-gray-800 dark:text-white">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon={DollarSign} change="All time" />
                <StatCard title="Items Sold" value={stats.itemsSold} icon={ShoppingCart} change={`${listings.length > 0 ? ((stats.itemsSold / listings.length) * 100).toFixed(0) : 0}% sell-through rate`} />
                <StatCard title="Active Listings" value={stats.activeListings} icon={Package} change={`${stats.totalListings} total items`} />
                <StatCard title="Top Category" value={listings.length > 0 ? listings.reduce((a,b,i,arr)=> (arr.filter(v=>v.category===a.category).length>=arr.filter(v=>v.category===b.category).length?a:b), listings[0]).category : 'N/A'} icon={Tag} />
            </div>

            <div className="card bg-white dark:bg-gray-800 p-4 sm:p-6">
                 <h2 className="heading-5 mb-4 text-gray-800 dark:text-white">Monthly Sales Performance</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} />
                            <YAxis tick={{ fill: 'var(--color-text-secondary)' }} fontSize={12} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                cursor={{ fill: 'var(--color-bg-tertiary)' }}
                                contentStyle={{
                                    backgroundColor: 'var(--color-bg-primary)',
                                    borderColor: 'var(--color-border-primary)',
                                    borderRadius: 'var(--radius-lg)'
                                }}
                            />
                            <Legend iconSize={10} />
                            <Bar dataKey="Revenue" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card bg-white dark:bg-gray-800">
                <div className="card-header flex-between">
                    <h2 className="heading-5 text-gray-800 dark:text-white">Recently Added</h2>
                    <button onClick={() => setActiveView('listings')} className="btn btn-secondary btn-sm">View All</button>
                </div>
                <div className="table-container rounded-b-lg">
                    <table className="table">
                         <tbody className="table-body">
                             {listings.slice(0, 3).map(listing => (
                                 <tr key={listing.id} className="table-row">
                                     <td className="table-cell flex items-center gap-4">
                                         <img src={listing.imageUrl || `https://via.placeholder.com/40x40/eff6ff/1d4ed8?text=${listing.title.charAt(0)}`} alt={listing.title} className="w-10 h-10 rounded-md object-cover"/>
                                         <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{listing.title}</p>
                                            <p className="text-xs text-gray-500">{listing.category}</p>
                                         </div>
                                     </td>
                                     <td className="table-cell">${listing.price.toFixed(2)}</td>
                                     <td className="table-cell">
                                        <span className={`badge ${listing.status === 'Sold' ? 'badge-error' : 'badge-success'}`}>{listing.status}</span>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const ListingsView = () => (
        <div id="listings-view" className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="heading-2 text-gray-800 dark:text-white">My Listings</h1>
                <button id="add-item-button" onClick={openAddItemModal} className="btn btn-primary w-full md:w-auto">
                    <PlusCircle className="w-4 h-4" />
                    <span>Add New Item</span>
                </button>
            </div>
            <div className="card p-4 bg-white dark:bg-gray-800">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="search-bar"
                            type="text"
                            placeholder="Search by title or description..."
                            className="input pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as ListingStatus | 'All')}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Sold">Sold</option>
                    </select>
                </div>
            </div>

            <div id="listings-table" className="table-container">
                <table className="table">
                    <thead className="table-header">
                        <tr>
                            <th className="table-header-cell">Item</th>
                            <th className="table-header-cell cursor-pointer" onClick={() => requestSort('price')}>
                                <div className="flex items-center gap-1">Price {sortConfig?.key === 'price' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
                            </th>
                            <th className="table-header-cell">Status</th>
                            <th className="table-header-cell cursor-pointer" onClick={() => requestSort('dateAdded')}>
                                <div className="flex items-center gap-1">Date Added {sortConfig?.key === 'dateAdded' && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
                            </th>
                            <th className="table-header-cell">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="table-body">
                        {filteredAndSortedListings.length > 0 ? filteredAndSortedListings.map(listing => (
                            <tr key={listing.id} className="table-row">
                                <td className="table-cell">
                                    <div className="flex items-center gap-4">
                                        <img src={listing.imageUrl || `https://via.placeholder.com/64x64/eff6ff/1d4ed8?text=${listing.title.charAt(0)}`} alt={listing.title} className="w-16 h-16 rounded-lg object-cover" />
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{listing.title}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{listing.category} - {listing.size}</p>
                                            <p className="text-xs text-gray-500">{listing.condition}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="table-cell font-medium">${listing.price.toFixed(2)}</td>
                                <td className="table-cell">
                                    <span className={`badge ${listing.status === 'Sold' ? 'badge-error' : 'badge-success'}`}>{listing.status}</span>
                                </td>
                                <td className="table-cell">{new Date(listing.dateAdded).toLocaleDateString()}</td>
                                <td className="table-cell">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEditItemModal(listing)} className="btn btn-ghost btn-xs p-2">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setShowDeleteConfirm(listing)} className="btn btn-ghost btn-xs p-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/50">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr className="table-row"><td colSpan={5} className="text-center py-12 text-gray-500">No listings found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const SettingsView = () => (
        <div id="settings-view" className="space-y-8 animate-fade-in">
            <h1 className="heading-2 text-gray-800 dark:text-white">Settings</h1>

            <div className="card bg-white dark:bg-gray-800">
                <div className="card-header"><h2 className="heading-5">Account</h2></div>
                <div className="card-body space-y-4">
                    <p><strong>Name:</strong> {currentUser?.first_name} {currentUser?.last_name}</p>
                    <p><strong>Email:</strong> {currentUser?.email}</p>
                    <button onClick={() => logout()} className="btn btn-secondary">Logout</button>
                </div>
            </div>

            <div className="card bg-white dark:bg-gray-800">
                <div className="card-header"><h2 className="heading-5">Appearance</h2></div>
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <label htmlFor="dark-mode-toggle" className="form-label">Dark Mode</label>
                        <button id="theme-toggle" onClick={toggleDarkMode} className={`toggle ${isDark ? 'toggle-checked' : ''}`}>
                            <span className="toggle-thumb"></span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="card bg-white dark:bg-gray-800">
                <div className="card-header"><h2 className="heading-5">Data Management</h2></div>
                <div className="card-body space-y-4">
                    <div>
                        <h3 className="form-label font-semibold">Export Data</h3>
                        <p className="form-help mb-2">Download all your listings as a CSV file.</p>
                        <button id="export-data-button" onClick={exportDataToCSV} className="btn btn-secondary"><Download className="w-4 h-4" />Export Listings</button>
                    </div>
                    <div className="border-t border-error-200 dark:border-error-800 my-4"></div>
                    <div>
                        <h3 className="form-label font-semibold text-error-600 dark:text-error-400">Danger Zone</h3>
                        <p className="form-help mb-2">Permanently delete all of your data. This action is irreversible.</p>
                        <button onClick={deleteAllData} className="btn btn-error"><AlertTriangle className="w-4 h-4" />Delete All Data</button>
                    </div>
                </div>
            </div>
        </div>
    );
    
    // --- MODALS --- //
    
    const AddEditItemModal = () => {
        const [formData, setFormData] = useState<Omit<Listing, 'id' | 'dateAdded'>>({
            title: '', description: '', price: 0, category: 'Tops', condition: 'Good', size: 'M', imageUrl: null, status: 'Available'
        });
        
        const aiParsedResult = React.useMemo(() => {
            if (!aiResult) return null;
            try {
                // The AI result is a stringified JSON, so we parse it
                const parsed = JSON.parse(aiResult);
                return parsed as AIResponse;
            } catch (e) {
                console.error("Failed to parse AI result:", e);
                setAiError("AI returned an unexpected format. Please fill the fields manually.");
                return null;
            }
        }, [aiResult]);

        useEffect(() => {
            if (editingListing) {
                setFormData(editingListing);
                setUploadedImage(editingListing.imageUrl);
            } else {
                 setFormData({ title: '', description: '', price: 0, category: 'Tops', condition: 'Good', size: 'M', imageUrl: null, status: 'Available' });
                 setUploadedImage(null);
            }
        }, [editingListing]);

        useEffect(() => {
            if (aiParsedResult) {
                setFormData(prev => ({
                    ...prev,
                    title: aiParsedResult.title || prev.title,
                    description: aiParsedResult.description || prev.description,
                    category: CATEGORIES.includes(aiParsedResult.category as Category) ? aiParsedResult.category as Category : prev.category,
                }));
            }
        }, [aiParsedResult]);
        
        useEffect(() => {
             setFormData(prev => ({...prev, imageUrl: uploadedImage}));
        }, [uploadedImage]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            handleFormSubmit(formData);
        };

        const handleFileClick = () => {
            fileInputRef.current?.click();
        };

        return (
            <div className="modal-backdrop" onClick={closeModal}>
                <div className="modal-content w-full max-w-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header">
                            <h3 className="heading-5">{editingListing ? 'Edit Item' : 'Add New Item'}</h3>
                            <button type="button" onClick={closeModal} className="btn btn-ghost p-2"><X /></button>
                        </div>
                        <div className="modal-body space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="form-label">Item Image</label>
                                    <div
                                        id="add-item-image-upload"
                                        className={`${styles.imageUploadArea} ${isDark ? styles.dark : ''}`}
                                        onClick={handleFileClick}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                        {uploadedImage ? (
                                            <img src={uploadedImage} alt="Uploaded item" className="w-full h-full object-cover rounded-lg"/>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-center p-4">
                                                <Upload className="w-10 h-10 text-gray-400 mb-2"/>
                                                <p className="font-semibold text-gray-600 dark:text-gray-300">Click to upload image</p>
                                                <p className="text-xs text-gray-500">and let AI fill in the details!</p>
                                            </div>
                                        )}
                                        {aiLoading && <div className={styles.loaderOverlay}><div className={styles.spinner}></div></div>}
                                    </div>
                                    {aiError && <p className="form-error">{aiError.toString()}</p>}
                                </div>
                                <div className="space-y-4">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="title">Title</label>
                                        <input id="title" name="title" type="text" className="input" value={formData.title} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="description">Description</label>
                                        <textarea id="description" name="description" className="textarea" rows={4} value={formData.description} onChange={handleChange} required></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            {aiResult && !aiError && (
                                <div className="alert alert-info">
                                    <Sparkles className="w-5 h-5 text-info-700 dark:text-info-200 mt-1" />
                                    <div>
                                        <h4 className="font-bold">AI Suggestions Applied!</h4>
                                        <p className="text-sm">We've populated some fields based on your image. Please review and adjust as needed.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="form-group">
                                    <label className="form-label" htmlFor="price">Price ($)</label>
                                    <input id="price" name="price" type="number" step="0.01" className="input" value={formData.price} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="category">Category</label>
                                    <select id="category" name="category" className="select" value={formData.category} onChange={handleChange}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="condition">Condition</label>
                                    <select id="condition" name="condition" className="select" value={formData.condition} onChange={handleChange}>
                                        {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                 <div className="form-group">
                                    <label className="form-label" htmlFor="size">Size</label>
                                    <input id="size" name="size" type="text" className="input" value={formData.size} onChange={handleChange} required />
                                </div>
                            </div>
                              <div className="form-group">
                                    <label className="form-label" htmlFor="status">Status</label>
                                    <select id="status" name="status" className="select" value={formData.status} onChange={handleChange}>
                                        <option value="Available">Available</option>
                                        <option value="Sold">Sold</option>
                                    </select>
                                </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={aiLoading}>{editingListing ? 'Save Changes' : 'Add Item'}</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const DeleteConfirmModal = () => {
        if (!showDeleteConfirm) return null;
        return (
            <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
                <div className="modal-content max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
                    <div className="modal-body text-center">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-error-100 sm:mx-0 sm:h-10 sm:w-10">
                             <AlertTriangle className="h-6 w-6 text-error-600" aria-hidden="true" />
                        </div>
                        <h3 className="heading-5 mt-4" id="modal-title">Delete Listing</h3>
                        <p className="text-body mt-2">Are you sure you want to delete "{showDeleteConfirm.title}"? This action cannot be undone.</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={() => setShowDeleteConfirm(null)} className="btn btn-secondary">Cancel</button>
                        <button type="button" onClick={() => handleDeleteListing(showDeleteConfirm.id)} className="btn btn-error">Delete</button>
                    </div>
                </div>
            </div>
        );
    }
    
    // --- MAIN RENDER --- //
    return (
        <div id="welcome_fallback" className={`flex h-screen bg-gray-50 dark:bg-gray-900 font-sans theme-transition ${isDark ? 'dark' : ''}`}>
             <AILayer
                ref={aiLayerRef}
                prompt=""
                onResult={setAiResult}
                onError={setAiError}
                onLoading={setAiLoading}
            />

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700 px-4">
                    <Sparkles className="h-8 w-8 text-primary-500" />
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white ml-2">ReVogue</h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <NavLink view="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavLink view="listings" icon={Tag} label="My Listings" />
                    <NavLink view="settings" icon={Settings} label="Settings" />
                </nav>
                 <div className="absolute bottom-4 left-4 right-4">
                    <div className="card p-3 bg-gray-100 dark:bg-gray-700/50 text-center">
                        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Upgrade to Pro</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-3">Unlock unlimited listings and advanced analytics.</p>
                        <button className="btn btn-primary btn-sm w-full">
                            <span>Upgrade Now</span>
                            <ExternalLink className="w-3 h-3"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-500 dark:text-gray-400">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-4">
                            <button id="generation_issue_fallback" onClick={toggleDarkMode} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="avatar avatar-sm bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 font-bold">
                                    {currentUser?.first_name.charAt(0)}{currentUser?.last_name.charAt(0)}
                                </div>
                                <div className="text-sm hidden md:block">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{currentUser?.first_name} {currentUser?.last_name}</p>
                                    <p className="text-gray-500 dark:text-gray-400">{currentUser?.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {activeView === 'dashboard' && <DashboardView />}
                    {activeView === 'listings' && <ListingsView />}
                    {activeView === 'settings' && <SettingsView />}
                </main>
            </div>
            {isModalOpen && <AddEditItemModal />}
            {showDeleteConfirm && <DeleteConfirmModal />}
            <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </footer>
        </div>
    );
}

export default App;