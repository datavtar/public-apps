import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';
import {
 Camera,
 Search,
 Calendar,
 ChevronDown,
 AlertCircle,
 Plus,
 User,
 XCircle,
 Home,
 BarChart,
 FileText,
 Settings,
 Sun,
 Moon,
 ArrowRight,
 X,
 ImageIcon,
 Check,
 Activity,
 CameraOff,
 ArrowLeft,
 Trash,
 Edit,
 Save,
 Eye,
 EyeOff
} from 'lucide-react';

// Types and interfaces
type FoodItem = {
 id: string;
 name: string;
 imageUrl: string;
 calories: number;
 protein: number;
 carbs: number;
 fat: number;
 consumedAt: Date;
 advantages: string[];
 disadvantages: string[];
};

type DietaryRestriction = {
 id: string;
 name: string;
 description: string;
 active: boolean;
};

type UserProfile = {
 name: string;
 dailyCalorieGoal: number;
 dailyProteinGoal: number;
 dailyCarbsGoal: number;
 dailyFatGoal: number;
 dietaryRestrictions: DietaryRestriction[];
};

type LogFormInputs = {
 foodName: string;
 calories: number;
 protein: number;
 carbs: number;
 fat: number;
 notes: string;
};

type Tab = 'home' | 'insights' | 'logs' | 'profile';

const App: React.FC = () => {
 // State management
 const [activeTab, setActiveTab] = useState<Tab>('home');
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });
 const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
 const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
 const [capturedImage, setCapturedImage] = useState<string | null>(null);
 const [analyzingFood, setAnalyzingFood] = useState<boolean>(false);
 const [analysisResults, setAnalysisResults] = useState<FoodItem | null>(null);
 const [foodLogs, setFoodLogs] = useState<FoodItem[]>([]);
 const [selectedDate, setSelectedDate] = useState<Date>(new Date());
 const [showAddModal, setShowAddModal] = useState<boolean>(false);
 const [isShowingPassword, setIsShowingPassword] = useState<boolean>(false);
 const [password, setPassword] = useState<string>('');
 const [isEditMode, setIsEditMode] = useState<boolean>(false);
 const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
 const [searchQuery, setSearchQuery] = useState<string>('');
 
 const cameraRef = useRef<HTMLVideoElement | null>(null);
 const fileInputRef = useRef<HTMLInputElement | null>(null);
 
 const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LogFormInputs>();

 // Mock user profile data
 const [userProfile, setUserProfile] = useState<UserProfile>({
 name: 'John Doe',
 dailyCalorieGoal: 2000,
 dailyProteinGoal: 150,
 dailyCarbsGoal: 200,
 dailyFatGoal: 65,
 dietaryRestrictions: [
 {
 id: '1',
 name: 'Diabetes',
 description: 'Limit sugar and refined carbohydrates',
 active: true
 },
 {
 id: '2',
 name: 'Hypertension',
 description: 'Limit sodium intake',
 active: false
 },
 {
 id: '3',
 name: 'Lactose Intolerance',
 description: 'Avoid dairy products',
 active: true
 },
 ]
 });

 // Mock food database for demonstration
 const mockFoodDatabase: Record<string, FoodItem> = {
 'apple': {
 id: 'apple',
 name: 'Apple',
 imageUrl: '',
 calories: 95,
 protein: 0.5,
 carbs: 25,
 fat: 0.3,
 consumedAt: new Date(),
 advantages: ['Rich in fiber', 'Contains antioxidants', 'Low glycemic index'],
 disadvantages: ['May trigger reactions for diabetes patients due to sugar content']
 },
 'salad': {
 id: 'salad',
 name: 'Salad with Grilled Chicken',
 imageUrl: '',
 calories: 320,
 protein: 28,
 carbs: 12,
 fat: 18,
 consumedAt: new Date(),
 advantages: ['High protein', 'Rich in vitamins', 'Low in carbs'],
 disadvantages: ['Dressing may contain sodium (hypertension)']
 },
 'pizza': {
 id: 'pizza',
 name: 'Pizza Slice',
 imageUrl: '',
 calories: 285,
 protein: 12,
 carbs: 36,
 fat: 10,
 consumedAt: new Date(),
 advantages: ['Contains calcium', 'Provides quick energy'],
 disadvantages: ['High in refined carbs (diabetes)', 'Contains dairy (lactose intolerance)', 'High in sodium (hypertension)']
 },
 'yogurt': {
 id: 'yogurt',
 name: 'Greek Yogurt',
 imageUrl: '',
 calories: 100,
 protein: 17,
 carbs: 6,
 fat: 0.4,
 consumedAt: new Date(),
 advantages: ['High in protein', 'Contains probiotics', 'Rich in calcium'],
 disadvantages: ['Contains dairy (lactose intolerance)']
 },
 'burger': {
 id: 'burger',
 name: 'Hamburger',
 imageUrl: '',
 calories: 450,
 protein: 25,
 carbs: 40,
 fat: 22,
 consumedAt: new Date(),
 advantages: ['Good source of protein'],
 disadvantages: ['High in fat', 'High in sodium (hypertension)', 'Contains refined carbs (diabetes)']
 }
 };
 
 // Initialize foodLogs with mock data
 useEffect(() => {
 const initialLogs: FoodItem[] = [
 {
 ...mockFoodDatabase['apple'],
 id: '1',
 consumedAt: new Date(new Date().setHours(8, 30, 0, 0))
 },
 {
 ...mockFoodDatabase['salad'],
 id: '2',
 consumedAt: new Date(new Date().setHours(12, 45, 0, 0))
 },
 {
 ...mockFoodDatabase['yogurt'],
 id: '3',
 consumedAt: new Date(new Date().setHours(16, 15, 0, 0))
 }
 ];
 setFoodLogs(initialLogs);
 }, []);

 // Dark mode effect
 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);

 // Camera setup/cleanup effect
 useEffect(() => {
 const setupCamera = async () => {
 if (isCameraActive && cameraRef.current) {
 try {
 const stream = await navigator.mediaDevices.getUserMedia({ video: true });
 cameraRef.current.srcObject = stream;
 } catch (err) {
 console.error('Error accessing the camera:', err);
 setIsCameraActive(false);
 }
 } else if (!isCameraActive && cameraRef.current?.srcObject) {
 const stream = cameraRef.current.srcObject as MediaStream;
 const tracks = stream.getTracks();
 tracks.forEach(track => track.stop());
 cameraRef.current.srcObject = null;
 }
 };

 setupCamera();

 return () => {
 if (cameraRef.current?.srcObject) {
 const stream = cameraRef.current.srcObject as MediaStream;
 const tracks = stream.getTracks();
 tracks.forEach(track => track.stop());
 }
 };
 }, [isCameraActive]);

 // Filter food logs by date
 const filteredFoodLogs = foodLogs.filter(log => {
 return (
 log.consumedAt.toDateString() === selectedDate.toDateString() &&
 (searchQuery === '' || log.name.toLowerCase().includes(searchQuery.toLowerCase()))
 );
 });

 // Calculate daily nutrition totals
 const dailyTotals = filteredFoodLogs.reduce(
 (totals, log) => {
 return {
 calories: totals.calories + log.calories,
 protein: totals.protein + log.protein,
 carbs: totals.carbs + log.carbs,
 fat: totals.fat + log.fat,
 };
 },
 { calories: 0, protein: 0, carbs: 0, fat: 0 }
 );

 // Calculate progress percentages
 const caloriePercentage = Math.min(100, Math.round((dailyTotals.calories / userProfile.dailyCalorieGoal) * 100));
 const proteinPercentage = Math.min(100, Math.round((dailyTotals.protein / userProfile.dailyProteinGoal) * 100));
 const carbsPercentage = Math.min(100, Math.round((dailyTotals.carbs / userProfile.dailyCarbsGoal) * 100));
 const fatPercentage = Math.min(100, Math.round((dailyTotals.fat / userProfile.dailyFatGoal) * 100));

 // Capture image from camera
 const captureImage = () => {
 if (cameraRef.current) {
 const canvas = document.createElement('canvas');
 canvas.width = cameraRef.current.videoWidth;
 canvas.height = cameraRef.current.videoHeight;
 canvas.getContext('2d')?.drawImage(cameraRef.current, 0, 0);
 const imageDataUrl = canvas.toDataURL('image/png');
 setCapturedImage(imageDataUrl);
 setIsCameraActive(false);
 analyzeFood(imageDataUrl);
 }
 };

 // Trigger file input click
 const handleUploadClick = () => {
 fileInputRef.current?.click();
 };

 // Handle file upload
 const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onload = () => {
 const imageDataUrl = reader.result as string;
 setCapturedImage(imageDataUrl);
 analyzeFood(imageDataUrl);
 };
 reader.readAsDataURL(file);
 }
 };

 // Mock food analysis
 const analyzeFood = (imageUrl: string) => {
 setAnalyzingFood(true);
 
 // Simulate API call delay
 setTimeout(() => {
 // For demo purposes, randomly select a food item from our mock database
 const foodKeys = Object.keys(mockFoodDatabase);
 const randomFoodKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
 const analyzedFood = {
 ...mockFoodDatabase[randomFoodKey],
 id: Date.now().toString(),
 imageUrl: imageUrl,
 consumedAt: new Date()
 };
 
 setAnalysisResults(analyzedFood);
 setAnalyzingFood(false);
 }, 2000);
 };

 // Save food log
 const saveFood = () => {
 if (analysisResults) {
 setFoodLogs([...foodLogs, analysisResults]);
 resetFoodCapture();
 setActiveTab('logs');
 }
 };

 // Reset food capture state
 const resetFoodCapture = () => {
 setCapturedImage(null);
 setAnalysisResults(null);
 setAnalyzingFood(false);
 };

 // Handle form submission
 const onSubmit: SubmitHandler<LogFormInputs> = (data) => {
 if (isEditMode && editingItem) {
 // Update existing item
 const updatedLogs = foodLogs.map(log => 
 log.id === editingItem.id ? {
 ...log,
 name: data.foodName,
 calories: data.calories,
 protein: data.protein,
 carbs: data.carbs,
 fat: data.fat
 } : log
 );
 setFoodLogs(updatedLogs);
 } else {
 // Add new item
 const newFoodItem: FoodItem = {
 id: Date.now().toString(),
 name: data.foodName,
 imageUrl: '',
 calories: data.calories,
 protein: data.protein,
 carbs: data.carbs,
 fat: data.fat,
 consumedAt: new Date(),
 advantages: [],
 disadvantages: []
 };
 setFoodLogs([...foodLogs, newFoodItem]);
 }
 
 setShowAddModal(false);
 reset();
 setIsEditMode(false);
 setEditingItem(null);
 };

 // Edit food log
 const handleEdit = (item: FoodItem) => {
 setIsEditMode(true);
 setEditingItem(item);
 setValue('foodName', item.name);
 setValue('calories', item.calories);
 setValue('protein', item.protein);
 setValue('carbs', item.carbs);
 setValue('fat', item.fat);
 setValue('notes', '');
 setShowAddModal(true);
 };

 // Delete food log
 const handleDelete = (id: string) => {
 setFoodLogs(foodLogs.filter(item => item.id !== id));
 };

 // Toggle dietary restriction
 const toggleRestriction = (id: string) => {
 const updatedRestrictions = userProfile.dietaryRestrictions.map(restriction => 
 restriction.id === id ? { ...restriction, active: !restriction.active } : restriction
 );
 setUserProfile({ ...userProfile, dietaryRestrictions: updatedRestrictions });
 };

 // Password verification for sensitive operations
 const verifyPassword = () => {
 // Mock password verification
 if (password === '1234') {
 setShowPasswordModal(false);
 setPassword('');
 // Proceed with the operation (in a real app, you'd handle this more securely)
 } else {
 alert('Incorrect password');
 }
 };

 // Generate random recommendations based on user's dietary restrictions
 const generateRecommendations = () => {
 const activeRestrictions = userProfile.dietaryRestrictions
 .filter(r => r.active)
 .map(r => r.name.toLowerCase());
 
 // Filter food items that don't have disadvantages matching active restrictions
 const suitableFoods = Object.values(mockFoodDatabase).filter(food => {
 const foodDisadvantages = food.disadvantages.map(d => d.toLowerCase());
 return !activeRestrictions.some(restriction => 
 foodDisadvantages.some(disadv => disadv.includes(restriction.toLowerCase()))
 );
 });
 
 // Pick up to 3 random suitable foods
 const recommendations: FoodItem[] = [];
 const shuffled = [...suitableFoods].sort(() => 0.5 - Math.random());
 return shuffled.slice(0, 3);
 };

 const recommendations = generateRecommendations();

 return (
 <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 theme-transition-all">
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
 <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">NutriTrack</h1>
 <div className="flex items-center space-x-4">
 <button 
 onClick={() => setIsDarkMode(!isDarkMode)}
 className="btn-sm bg-gray-100 dark:bg-gray-700 rounded-full p-2 text-gray-600 dark:text-gray-200"
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
 </button>
 <div className="hidden md:flex items-center space-x-2">
 <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
 <User size={18} />
 </div>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{userProfile.name}</span>
 </div>
 </div>
 </div>
 </header>

 {/* Main Content */}
 <main className="flex-grow container mx-auto px-4 py-6">
 {capturedImage ? (
 <div className="card max-w-2xl mx-auto">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Food Analysis</h2>
 <button 
 onClick={resetFoodCapture} 
 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
 aria-label="Close analysis"
 >
 <X size={20} />
 </button>
 </div>
 
 <div className="aspect-w-4 aspect-h-3 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
 <img 
 src={capturedImage} 
 alt="Captured food" 
 className="object-cover w-full h-full" 
 />
 </div>
 
 {analyzingFood ? (
 <div className="flex flex-col items-center justify-center py-8">
 <div className={styles.loadingSpinner}></div>
 <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing your food...</p>
 </div>
 ) : (
 analysisResults && (
 <div>
 <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">{analysisResults.name}</h3>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
 <div className="stat-card">
 <div className="stat-title">Calories</div>
 <div className="stat-value">{analysisResults.calories}</div>
 <div className="stat-desc">kcal</div>
 </div>
 <div className="stat-card">
 <div className="stat-title">Protein</div>
 <div className="stat-value">{analysisResults.protein}g</div>
 </div>
 <div className="stat-card">
 <div className="stat-title">Carbs</div>
 <div className="stat-value">{analysisResults.carbs}g</div>
 </div>
 <div className="stat-card">
 <div className="stat-title">Fat</div>
 <div className="stat-value">{analysisResults.fat}g</div>
 </div>
 </div>
 
 <div className="mb-6">
 <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Benefits</h4>
 <ul className="space-y-1">
 {analysisResults.advantages.map((advantage, index) => (
 <li key={index} className="flex items-start">
 <Check size={16} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
 <span className="text-gray-600 dark:text-gray-400">{advantage}</span>
 </li>
 ))}
 </ul>
 </div>
 
 {analysisResults.disadvantages.length > 0 && (
 <div className="mb-6">
 <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Considerations</h4>
 <ul className="space-y-1">
 {analysisResults.disadvantages.map((disadvantage, index) => (
 <li key={index} className="flex items-start">
 <AlertCircle size={16} className="text-amber-500 mr-2 mt-1 flex-shrink-0" />
 <span className="text-gray-600 dark:text-gray-400">{disadvantage}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 
 <div className="flex justify-end space-x-3 mt-6">
 <button 
 onClick={resetFoodCapture}
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
 >
 Cancel
 </button>
 <button 
 onClick={saveFood}
 className="btn btn-primary"
 >
 Save to Log
 </button>
 </div>
 </div>
 )
 )}
 </div>
 ) : isCameraActive ? (
 <div className="card max-w-2xl mx-auto">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Capture Food</h2>
 <button 
 onClick={() => setIsCameraActive(false)} 
 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
 aria-label="Close camera"
 >
 <X size={20} />
 </button>
 </div>
 
 <div className="aspect-w-4 aspect-h-3 bg-gray-900 rounded-lg overflow-hidden mb-4">
 <video 
 ref={cameraRef} 
 autoPlay 
 playsInline 
 className="object-cover w-full h-full" 
 />
 </div>
 
 <div className="flex justify-center">
 <button 
 onClick={captureImage}
 className="btn btn-primary rounded-full w-16 h-16 flex items-center justify-center"
 aria-label="Take photo"
 >
 <Camera size={24} />
 </button>
 </div>
 </div>
 ) : (
 <div>
 {activeTab === 'home' && (
 <div className="space-y-6">
 <div className="card-responsive">
 <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Welcome back, {userProfile.name}!</h2>
 <p className="text-gray-600 dark:text-gray-400 mb-6">Track your meals and get insights about your nutrition intake.</p>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
 <button 
 onClick={() => setIsCameraActive(true)}
 className="btn-responsive bg-primary-500 text-white flex items-center justify-center gap-2"
 >
 <Camera size={18} />
 <span>Capture Food</span>
 </button>
 <button 
 onClick={handleUploadClick}
 className="btn-responsive bg-white border border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 flex items-center justify-center gap-2"
 >
 <ImageIcon size={18} />
 <span>Upload Photo</span>
 </button>
 <input 
 type="file" 
 accept="image/*"
 ref={fileInputRef}
 onChange={handleFileChange}
 className="hidden"
 />
 </div>
 
 <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
 <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Today's Progress</h3>
 
 <div className="space-y-3">
 <div>
 <div className="flex justify-between items-center mb-1">
 <span className="text-sm text-gray-600 dark:text-gray-400">Calories</span>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
 {dailyTotals.calories} / {userProfile.dailyCalorieGoal} kcal
 </span>
 </div>
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
 <div 
 className="bg-primary-500 h-2.5 rounded-full" 
 style={{ width: `${caloriePercentage}%` }}
 ></div>
 </div>
 </div>
 
 <div>
 <div className="flex justify-between items-center mb-1">
 <span className="text-sm text-gray-600 dark:text-gray-400">Protein</span>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
 {dailyTotals.protein} / {userProfile.dailyProteinGoal} g
 </span>
 </div>
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
 <div 
 className="bg-blue-500 h-2.5 rounded-full" 
 style={{ width: `${proteinPercentage}%` }}
 ></div>
 </div>
 </div>
 
 <div>
 <div className="flex justify-between items-center mb-1">
 <span className="text-sm text-gray-600 dark:text-gray-400">Carbs</span>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
 {dailyTotals.carbs} / {userProfile.dailyCarbsGoal} g
 </span>
 </div>
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
 <div 
 className="bg-amber-500 h-2.5 rounded-full" 
 style={{ width: `${carbsPercentage}%` }}
 ></div>
 </div>
 </div>
 
 <div>
 <div className="flex justify-between items-center mb-1">
 <span className="text-sm text-gray-600 dark:text-gray-400">Fat</span>
 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
 {dailyTotals.fat} / {userProfile.dailyFatGoal} g
 </span>
 </div>
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
 <div 
 className="bg-pink-500 h-2.5 rounded-full" 
 style={{ width: `${fatPercentage}%` }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 </div>
 
 <div className="card-responsive">
 <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recommended for You</h3>
 <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Based on your dietary restrictions and goals</p>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
 {recommendations.map((food) => (
 <div key={food.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
 <div className="p-4">
 <h4 className="font-medium text-gray-800 dark:text-white">{food.name}</h4>
 <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
 <span className="font-medium text-gray-800 dark:text-gray-300 mr-1">{food.calories}</span> calories
 </div>
 <div className="mt-3 flex justify-between items-center">
 <div className="space-x-1">
 <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md">{food.protein}g protein</span>
 <span className="inline-block px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded-md">{food.carbs}g carbs</span>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 
 {activeTab === 'insights' && (
 <div className="space-y-6">
 <div className="card-responsive">
 <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Nutrition Insights</h2>
 
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
 <h3 className="font-medium text-gray-800 dark:text-white mb-3">Daily Averages (Last 7 Days)</h3>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="stat-card">
 <div className="stat-title">Calories</div>
 <div className="stat-value">1,850</div>
 <div className="stat-desc">↗︎ 12% from target</div>
 </div>
 <div className="stat-card">
 <div className="stat-title">Protein</div>
 <div className="stat-value">128g</div>
 <div className="stat-desc">↘︎ 14% from target</div>
 </div>
 <div className="stat-card">
 <div className="stat-title">Carbs</div>
 <div className="stat-value">185g</div>
 <div className="stat-desc">↘︎ 8% from target</div>
 </div>
 <div className="stat-card">
 <div className="stat-title">Fat</div>
 <div className="stat-value">62g</div>
 <div className="stat-desc">↗︎ 5% from target</div>
 </div>
 </div>
 </div>
 
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
 <h3 className="font-medium text-gray-800 dark:text-white mb-3">Health Insights</h3>
 
 <div className="space-y-4">
 {userProfile.dietaryRestrictions.filter(r => r.active).map(restriction => (
 <div key={restriction.id} className="alert alert-info">
 <AlertCircle size={18} />
 <div>
 <h4 className="font-medium text-gray-800 dark:text-gray-200">{restriction.name}</h4>
 <p className="text-sm text-gray-600 dark:text-gray-400">{restriction.description}</p>
 </div>
 </div>
 ))}
 
 {userProfile.dietaryRestrictions.filter(r => r.active).length === 0 && (
 <p className="text-gray-600 dark:text-gray-400">No active health conditions. You can add them in your profile settings.</p>
 )}
 </div>
 </div>
 </div>
 
 <div className="card-responsive">
 <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Weekly Trends</h3>
 
 <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
 <div className="text-center">
 <Activity size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-2" />
 <p className="text-gray-600 dark:text-gray-400">Charts and trends will appear here as you log more meals</p>
 </div>
 </div>
 </div>
 </div>
 )}
 
 {activeTab === 'logs' && (
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
 <div>
 <h2 className="text-xl font-bold text-gray-800 dark:text-white">Food Log</h2>
 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
 {format(selectedDate, 'EEEE, MMMM d, yyyy')}
 </p>
 </div>
 
 <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
 <div className="relative">
 <input
 type="date"
 value={format(selectedDate, 'yyyy-MM-dd')}
 onChange={(e) => setSelectedDate(new Date(e.target.value))}
 className="input pr-10"
 />
 <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 </div>
 
 <div className="relative flex-grow sm:flex-grow-0">
 <input
 type="text"
 placeholder="Search logs..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="input pr-10 w-full"
 />
 <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 </div>
 
 <button 
 onClick={() => {
 setIsEditMode(false);
 setEditingItem(null);
 reset();
 setShowAddModal(true);
 }}
 className="btn btn-primary w-full sm:w-auto"
 >
 <Plus size={18} className="mr-1" />
 Add Manually
 </button>
 </div>
 </div>
 
 {filteredFoodLogs.length > 0 ? (
 <div className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm rounded-lg">
 <ul className="divide-y divide-gray-200 dark:divide-gray-700">
 {filteredFoodLogs.map((item) => (
 <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150">
 <div className="flex flex-col sm:flex-row justify-between">
 <div className="flex items-start gap-3">
 {item.imageUrl ? (
 <div className="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
 <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
 </div>
 ) : (
 <div className="w-12 h-12 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
 <ImageIcon size={20} className="text-gray-500 dark:text-gray-400" />
 </div>
 )}
 
 <div>
 <h4 className="font-medium text-gray-800 dark:text-white">{item.name}</h4>
 <p className="text-sm text-gray-500 dark:text-gray-400">
 {format(item.consumedAt, 'h:mm a')} • {item.calories} kcal
 </p>
 <div className="mt-1 flex flex-wrap gap-1">
 <span className="text-xs bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded">
 {item.protein}g protein
 </span>
 <span className="text-xs bg-amber-50 dark:bg-amber-900 text-amber-600 dark:text-amber-300 px-2 py-0.5 rounded">
 {item.carbs}g carbs
 </span>
 <span className="text-xs bg-pink-50 dark:bg-pink-900 text-pink-600 dark:text-pink-300 px-2 py-0.5 rounded">
 {item.fat}g fat
 </span>
 </div>
 </div>
 </div>
 
 <div className="flex mt-3 sm:mt-0 gap-2">
 <button 
 onClick={() => handleEdit(item)}
 className="btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
 aria-label="Edit food item"
 >
 <Edit size={16} />
 </button>
 <button 
 onClick={() => handleDelete(item.id)}
 className="btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
 aria-label="Delete food item"
 >
 <Trash size={16} />
 </button>
 </div>
 </div>
 </li>
 ))}
 </ul>
 </div>
 ) : (
 <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
 <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
 <FileText size={24} className="text-gray-500 dark:text-gray-400" />
 </div>
 <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No food logs for this day</h3>
 <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
 Start tracking your meals by capturing photos or adding them manually.
 </p>
 <div className="mt-6">
 <button 
 onClick={() => setIsCameraActive(true)}
 className="btn btn-primary"
 >
 <Camera size={18} className="mr-2" />
 Capture Food
 </button>
 </div>
 </div>
 )}
 </div>
 )}
 
 {activeTab === 'profile' && (
 <div className="space-y-6">
 <div className="card-responsive">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Profile</h2>
 
 <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
 <Settings size={18} className="mr-2" />
 Edit Profile
 </button>
 </div>
 
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
 <div className="flex flex-col sm:flex-row gap-6">
 <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
 <User size={32} className="text-gray-500 dark:text-gray-400" />
 </div>
 
 <div className="flex-grow text-center sm:text-left">
 <h3 className="text-xl font-bold text-gray-800 dark:text-white">{userProfile.name}</h3>
 <p className="text-gray-600 dark:text-gray-400 mt-1">user@example.com</p>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
 <div>
 <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Goals</h4>
 <ul className="mt-2 space-y-2">
 <li className="flex justify-between">
 <span className="text-gray-600 dark:text-gray-400">Calories:</span>
 <span className="font-medium text-gray-800 dark:text-gray-200">{userProfile.dailyCalorieGoal} kcal</span>
 </li>
 <li className="flex justify-between">
 <span className="text-gray-600 dark:text-gray-400">Protein:</span>
 <span className="font-medium text-gray-800 dark:text-gray-200">{userProfile.dailyProteinGoal}g</span>
 </li>
 <li className="flex justify-between">
 <span className="text-gray-600 dark:text-gray-400">Carbohydrates:</span>
 <span className="font-medium text-gray-800 dark:text-gray-200">{userProfile.dailyCarbsGoal}g</span>
 </li>
 <li className="flex justify-between">
 <span className="text-gray-600 dark:text-gray-400">Fat:</span>
 <span className="font-medium text-gray-800 dark:text-gray-200">{userProfile.dailyFatGoal}g</span>
 </li>
 </ul>
 </div>
 
 <div className="bg-gray-50 dark:bg-gray-750 p-4 rounded-lg">
 <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Quick Stats</h4>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
 <p className="text-xl font-bold text-gray-800 dark:text-white">{foodLogs.length}</p>
 </div>
 <div>
 <p className="text-sm text-gray-600 dark:text-gray-400">Streak</p>
 <p className="text-xl font-bold text-gray-800 dark:text-white">4 days</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
 <h3 className="font-medium text-gray-800 dark:text-white mb-4">Health Conditions & Dietary Restrictions</h3>
 
 <div className="space-y-3">
 {userProfile.dietaryRestrictions.map(restriction => (
 <div 
 key={restriction.id} 
 className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700"
 >
 <div>
 <h4 className="font-medium text-gray-800 dark:text-white">{restriction.name}</h4>
 <p className="text-sm text-gray-600 dark:text-gray-400">{restriction.description}</p>
 </div>
 <label className="relative inline-flex items-center cursor-pointer">
 <input 
 type="checkbox" 
 checked={restriction.active} 
 onChange={() => toggleRestriction(restriction.id)}
 className="sr-only peer"
 />
 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
 </label>
 </div>
 ))}
 
 <button className="mt-3 w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-300 font-medium py-2 rounded-lg transition-colors duration-150">
 <Plus size={16} className="inline-block mr-2" />
 Add New Condition
 </button>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 )}
 </main>

 {/* Bottom Navigation for Mobile */}
 <nav className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0 z-10">
 <div className="flex justify-around">
 <button 
 onClick={() => setActiveTab('home')}
 className={`flex flex-col items-center p-3 w-full ${activeTab === 'home' ? 'text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
 aria-label="Home tab"
 >
 <Home size={20} />
 <span className="text-xs mt-1">Home</span>
 </button>
 <button 
 onClick={() => setActiveTab('insights')}
 className={`flex flex-col items-center p-3 w-full ${activeTab === 'insights' ? 'text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
 aria-label="Insights tab"
 >
 <BarChart size={20} />
 <span className="text-xs mt-1">Insights</span>
 </button>
 <button 
 onClick={() => setActiveTab('logs')}
 className={`flex flex-col items-center p-3 w-full ${activeTab === 'logs' ? 'text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
 aria-label="Logs tab"
 >
 <FileText size={20} />
 <span className="text-xs mt-1">Logs</span>
 </button>
 <button 
 onClick={() => setActiveTab('profile')}
 className={`flex flex-col items-center p-3 w-full ${activeTab === 'profile' ? 'text-primary-500 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
 aria-label="Profile tab"
 >
 <User size={20} />
 <span className="text-xs mt-1">Profile</span>
 </button>
 </div>
 </nav>

 {/* Desktop Navigation Sidebar */}
 <nav className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16 pb-4 px-3">
 <ul className="space-y-2">
 <li>
 <button 
 onClick={() => setActiveTab('home')}
 className={`w-full flex items-center rounded-lg px-4 py-2.5 text-base font-medium ${activeTab === 'home' ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
 aria-label="Home tab"
 >
 <Home size={20} className="mr-3" />
 <span>Home</span>
 </button>
 </li>
 <li>
 <button 
 onClick={() => setActiveTab('insights')}
 className={`w-full flex items-center rounded-lg px-4 py-2.5 text-base font-medium ${activeTab === 'insights' ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
 aria-label="Insights tab"
 >
 <BarChart size={20} className="mr-3" />
 <span>Insights</span>
 </button>
 </li>
 <li>
 <button 
 onClick={() => setActiveTab('logs')}
 className={`w-full flex items-center rounded-lg px-4 py-2.5 text-base font-medium ${activeTab === 'logs' ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
 aria-label="Logs tab"
 >
 <FileText size={20} className="mr-3" />
 <span>Food Log</span>
 </button>
 </li>
 <li>
 <button 
 onClick={() => setActiveTab('profile')}
 className={`w-full flex items-center rounded-lg px-4 py-2.5 text-base font-medium ${activeTab === 'profile' ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
 aria-label="Profile tab"
 >
 <User size={20} className="mr-3" />
 <span>Profile</span>
 </button>
 </li>
 </ul>
 
 <div className="mt-auto">
 <div className="px-4 py-2">
 <div className="flex items-center space-x-2">
 <span className="text-sm text-gray-500 dark:text-gray-400">Light</span>
 <button
 onClick={() => setIsDarkMode(!isDarkMode)}
 className={`${styles.themeToggle} ${isDarkMode ? styles.dark : ''}`}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 <span className={styles.themeToggleThumb}></span>
 <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
 </button>
 <span className="text-sm text-gray-500 dark:text-gray-400">Dark</span>
 </div>
 </div>
 </div>
 </nav>

 {/* Add/Edit Food Modal */}
 {showAddModal && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-md mx-auto">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 {isEditMode ? 'Edit Food Entry' : 'Add Food Manually'}
 </h3>
 <button 
 onClick={() => setShowAddModal(false)}
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 aria-label="Close modal"
 >
 <X size={20} />
 </button>
 </div>
 
 <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
 <div className="space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="foodName">Food Name</label>
 <input 
 id="foodName"
 {...register('foodName', { required: 'Food name is required' })}
 className="input"
 placeholder="e.g., Grilled Chicken Salad"
 />
 {errors.foodName && <p className="form-error">{errors.foodName.message}</p>}
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="calories">Calories</label>
 <input 
 id="calories"
 type="number"
 {...register('calories', { 
 required: 'Required', 
 min: { value: 0, message: 'Must be positive' } 
 })}
 className="input"
 placeholder="kcal"
 />
 {errors.calories && <p className="form-error">{errors.calories.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="protein">Protein (g)</label>
 <input 
 id="protein"
 type="number"
 {...register('protein', { 
 required: 'Required', 
 min: { value: 0, message: 'Must be positive' } 
 })}
 className="input"
 placeholder="grams"
 />
 {errors.protein && <p className="form-error">{errors.protein.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="carbs">Carbs (g)</label>
 <input 
 id="carbs"
 type="number"
 {...register('carbs', { 
 required: 'Required', 
 min: { value: 0, message: 'Must be positive' } 
 })}
 className="input"
 placeholder="grams"
 />
 {errors.carbs && <p className="form-error">{errors.carbs.message}</p>}
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="fat">Fat (g)</label>
 <input 
 id="fat"
 type="number"
 {...register('fat', { 
 required: 'Required', 
 min: { value: 0, message: 'Must be positive' } 
 })}
 className="input"
 placeholder="grams"
 />
 {errors.fat && <p className="form-error">{errors.fat.message}</p>}
 </div>
 </div>
 
 <div className="form-group">
 <label className="form-label" htmlFor="notes">Notes (optional)</label>
 <textarea 
 id="notes"
 {...register('notes')}
 className="input min-h-[80px]"
 placeholder="Any additional information about this meal"
 ></textarea>
 </div>
 </div>
 
 <div className="modal-footer">
 <button 
 type="button"
 onClick={() => setShowAddModal(false)}
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
 >
 Cancel
 </button>
 <button 
 type="submit"
 className="btn btn-primary"
 >
 {isEditMode ? 'Save Changes' : 'Add Food'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Password Verification Modal */}
 {showPasswordModal && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-md mx-auto">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Verify Password</h3>
 <button 
 onClick={() => setShowPasswordModal(false)}
 className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
 aria-label="Close modal"
 >
 <X size={20} />
 </button>
 </div>
 
 <div className="mt-4">
 <p className="text-gray-600 dark:text-gray-400 mb-4">Please enter your password to continue</p>
 
 <div className="form-group">
 <label className="form-label" htmlFor="password">Password</label>
 <div className="relative">
 <input 
 id="password"
 type={isShowingPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="input pr-10"
 />
 <button
 type="button"
 onClick={() => setIsShowingPassword(!isShowingPassword)}
 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
 aria-label={isShowingPassword ? 'Hide password' : 'Show password'}
 >
 {isShowingPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>
 
 <div className="modal-footer">
 <button 
 type="button"
 onClick={() => setShowPasswordModal(false)}
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
 >
 Cancel
 </button>
 <button 
 type="button"
 onClick={verifyPassword}
 className="btn btn-primary"
 >
 Verify
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-600 dark:text-gray-400 md:ml-64 md:pl-4">
 <div className="container mx-auto px-4">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </div>
 </footer>
 </div>
 );
};

export default App;