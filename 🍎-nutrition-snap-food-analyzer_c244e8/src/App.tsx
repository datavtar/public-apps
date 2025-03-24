import React, { useState, useEffect, useRef } from 'react';
import { Camera, Info, X, Upload, RefreshCw, Check, ChevronDown } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript types and interfaces
type NutritionData = {
 name: string;
 calories: number;
 ingredients: string[];
 advantages: string[];
 disadvantages: string[];
 nutritionalValues: {
 protein: number;
 carbs: number;
 fat: number;
 fiber: number;
 };
};

type AppTab = 'camera' | 'history' | 'info';

const App: React.FC = () => {
 // State management
 const [activeTab, setActiveTab] = useState<AppTab>('camera');
 const [capturedImage, setCapturedImage] = useState<string | null>(null);
 const [analyzing, setAnalyzing] = useState<boolean>(false);
 const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
 const [history, setHistory] = useState<{image: string; data: NutritionData}[]>([]);
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });
 const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
 const [error, setError] = useState<string | null>(null);
 const videoRef = useRef<HTMLVideoElement>(null);
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);
 
 // Mock data for demonstration
 const mockFoodDatabase: Record<string, NutritionData> = {
 pizza: {
 name: 'Pizza Slice',
 calories: 285,
 ingredients: ['Flour', 'Cheese', 'Tomato Sauce', 'Olive Oil', 'Toppings'],
 advantages: ['Good source of calcium', 'Contains lycopene from tomatoes', 'Provides energy'],
 disadvantages: ['High in calories', 'High in saturated fat', 'Can be high in sodium'],
 nutritionalValues: {
 protein: 12,
 carbs: 36,
 fat: 10,
 fiber: 2,
 },
 },
 salad: {
 name: 'Garden Salad',
 calories: 125,
 ingredients: ['Lettuce', 'Tomatoes', 'Cucumber', 'Carrot', 'Olive Oil', 'Vinegar'],
 advantages: ['High in fiber', 'Low in calories', 'Rich in vitamins and minerals', 'Hydrating'],
 disadvantages: ['Low protein content', 'Can lack sufficient calories for a meal'],
 nutritionalValues: {
 protein: 3,
 carbs: 8,
 fat: 9,
 fiber: 4,
 },
 },
 burger: {
 name: 'Hamburger',
 calories: 354,
 ingredients: ['Beef Patty', 'Bun', 'Lettuce', 'Tomato', 'Onion', 'Pickle', 'Ketchup', 'Mustard'],
 advantages: ['Good source of protein', 'Contains essential nutrients', 'Energy-dense'],
 disadvantages: ['High in calories', 'High in saturated fat', 'High in sodium', 'Low in fiber'],
 nutritionalValues: {
 protein: 20,
 carbs: 40,
 fat: 17,
 fiber: 1,
 },
 },
 apple: {
 name: 'Apple',
 calories: 95,
 ingredients: ['Apple'],
 advantages: ['High in fiber', 'Contains antioxidants', 'Low calorie', 'Rich in vitamin C'],
 disadvantages: ['Limited protein', 'Natural sugars'],
 nutritionalValues: {
 protein: 0.5,
 carbs: 25,
 fat: 0.3,
 fiber: 4,
 },
 },
 pasta: {
 name: 'Pasta with Tomato Sauce',
 calories: 320,
 ingredients: ['Pasta', 'Tomato Sauce', 'Olive Oil', 'Herbs', 'Parmesan Cheese'],
 advantages: ['Good source of carbohydrates', 'Provides energy', 'Low in fat if sauce is light'],
 disadvantages: ['Can be high in calories with rich sauces', 'Refined carbs if not whole grain'],
 nutritionalValues: {
 protein: 12,
 carbs: 58,
 fat: 6,
 fiber: 3,
 },
 },
 };

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

 // Initialize camera
 const startCamera = async () => {
 try {
 setError(null);
 setIsCameraOpen(true);
 const stream = await navigator.mediaDevices.getUserMedia({ video: true });
 if (videoRef.current) {
 videoRef.current.srcObject = stream;
 }
 } catch (err) {
 setError('Camera access denied. Please check your permissions.');
 console.error('Error accessing camera:', err);
 }
 };

 // Stop camera
 const stopCamera = () => {
 if (videoRef.current && videoRef.current.srcObject) {
 const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
 tracks.forEach(track => track.stop());
 videoRef.current.srcObject = null;
 setIsCameraOpen(false);
 }
 };

 // Clean up on unmount
 useEffect(() => {
 return () => {
 stopCamera();
 };
 }, []);

 // Capture image from camera
 const captureImage = () => {
 if (videoRef.current && canvasRef.current) {
 const context = canvasRef.current.getContext('2d');
 if (context) {
 // Set canvas dimensions to match video
 canvasRef.current.width = videoRef.current.videoWidth;
 canvasRef.current.height = videoRef.current.videoHeight;
 
 // Draw the video frame to the canvas
 context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
 
 // Convert canvas to data URL
 const imageDataUrl = canvasRef.current.toDataURL('image/png');
 setCapturedImage(imageDataUrl);
 stopCamera();
 analyzeImage(imageDataUrl);
 }
 }
 };

 // Handle file upload
 const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
 const files = event.target.files;
 if (files && files.length > 0) {
 const file = files[0];
 const reader = new FileReader();
 
 reader.onload = (e) => {
 if (e.target && typeof e.target.result === 'string') {
 setCapturedImage(e.target.result);
 analyzeImage(e.target.result);
 }
 };
 
 reader.readAsDataURL(file);
 }
 };

 // Trigger file input click
 const triggerFileUpload = () => {
 if (fileInputRef.current) {
 fileInputRef.current.click();
 }
 };

 // Mock analysis function (would be replaced with actual API in production)
 const analyzeImage = (imageUrl: string) => {
 setAnalyzing(true);
 
 // Simulate API call with timeout
 setTimeout(() => {
 // Randomly select one of the mock foods for demonstration
 const foodKeys = Object.keys(mockFoodDatabase);
 const randomFoodKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
 const result = mockFoodDatabase[randomFoodKey];
 
 setNutritionData(result);
 setAnalyzing(false);
 
 // Add to history
 setHistory(prev => [
 { image: imageUrl, data: result },
 ...prev.slice(0, 4) // Keep only the 5 most recent items
 ]);
 }, 2000); // 2 second simulated analysis time
 };

 // Reset the current analysis
 const resetAnalysis = () => {
 setCapturedImage(null);
 setNutritionData(null);
 setError(null);
 };

 // View item from history
 const viewHistoryItem = (item: {image: string; data: NutritionData}) => {
 setCapturedImage(item.image);
 setNutritionData(item.data);
 setActiveTab('camera');
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 shadow-sm">
 <div className="container-fluid py-4 px-4 sm:px-6 flex justify-between items-center">
 <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
 NutriSnap
 </h1>
 <div className="flex items-center space-x-2">
 <span className="text-sm dark:text-slate-300 hidden sm:inline">Light</span>
 <button 
 className={`${styles.themeToggle} ${isDarkMode ? styles.active : ''}`}
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 role="switch"
 aria-checked={isDarkMode}
 >
 <span className={styles.themeToggleThumb}></span>
 </button>
 <span className="text-sm dark:text-slate-300 hidden sm:inline">Dark</span>
 </div>
 </div>
 
 {/* Navigation Tabs */}
 <div className="flex border-b border-gray-200 dark:border-gray-700">
 <button
 className={`flex-1 py-3 text-center ${activeTab === 'camera' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'}`}
 onClick={() => setActiveTab('camera')}
 role="tab"
 aria-selected={activeTab === 'camera'}
 >
 <Camera className="inline mr-1 h-5 w-5" />
 <span className="hidden sm:inline">Camera</span>
 </button>
 <button
 className={`flex-1 py-3 text-center ${activeTab === 'history' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'}`}
 onClick={() => setActiveTab('history')}
 role="tab"
 aria-selected={activeTab === 'history'}
 >
 <Upload className="inline mr-1 h-5 w-5" />
 <span className="hidden sm:inline">History</span>
 </button>
 <button
 className={`flex-1 py-3 text-center ${activeTab === 'info' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'}`}
 onClick={() => setActiveTab('info')}
 role="tab"
 aria-selected={activeTab === 'info'}
 >
 <Info className="inline mr-1 h-5 w-5" />
 <span className="hidden sm:inline">About</span>
 </button>
 </div>
 </header>

 <main className="container-fluid py-6 px-4 sm:px-6 lg:px-8">
 {/* Camera Tab Content */}
 {activeTab === 'camera' && (
 <div className="space-y-6">
 {/* Camera view or captured image */}
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden theme-transition">
 {error && (
 <div className="alert alert-error">
 <X className="h-5 w-5" />
 <p>{error}</p>
 </div>
 )}
 
 {!capturedImage && !isCameraOpen && !error && (
 <div className="p-6 flex flex-col items-center justify-center space-y-4">
 <div className="text-center">
 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
 Take a photo of your food
 </h2>
 <p className="mt-2 text-gray-500 dark:text-gray-400">
 Get instant nutrition information from your meals
 </p>
 </div>
 
 <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
 <button 
 className="btn btn-primary flex items-center justify-center space-x-2"
 onClick={startCamera}
 >
 <Camera className="h-5 w-5" />
 <span>Open Camera</span>
 </button>
 
 <button 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center justify-center space-x-2"
 onClick={triggerFileUpload}
 >
 <Upload className="h-5 w-5" />
 <span>Upload Photo</span>
 </button>
 <input 
 type="file" 
 ref={fileInputRef} 
 accept="image/*" 
 className="hidden" 
 onChange={handleFileUpload} 
 />
 </div>
 </div>
 )}
 
 {isCameraOpen && (
 <div className="relative">
 <video 
 ref={videoRef} 
 className="w-full h-auto" 
 autoPlay 
 playsInline 
 />
 <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center space-x-4 bg-gradient-to-t from-black/50 to-transparent">
 <button 
 className="btn btn-primary rounded-full p-3"
 onClick={captureImage}
 aria-label="Take photo"
 >
 <Camera className="h-6 w-6" />
 </button>
 <button 
 className="btn bg-white text-gray-700 hover:bg-gray-100 rounded-full p-3"
 onClick={stopCamera}
 aria-label="Cancel"
 >
 <X className="h-6 w-6" />
 </button>
 </div>
 </div>
 )}
 
 {capturedImage && (
 <div className="relative">
 <img 
 src={capturedImage} 
 alt="Captured food" 
 className="w-full h-auto" 
 />
 {!nutritionData && !analyzing && (
 <div className="absolute inset-x-0 bottom-0 p-4 flex justify-center space-x-4 bg-gradient-to-t from-black/50 to-transparent">
 <button 
 className="btn btn-primary rounded-full p-3"
 onClick={() => analyzeImage(capturedImage)}
 aria-label="Analyze again"
 >
 <RefreshCw className="h-6 w-6" />
 </button>
 <button 
 className="btn bg-white text-gray-700 hover:bg-gray-100 rounded-full p-3"
 onClick={resetAnalysis}
 aria-label="Cancel"
 >
 <X className="h-6 w-6" />
 </button>
 </div>
 )}
 </div>
 )}
 
 <canvas ref={canvasRef} className="hidden" />
 </div>
 
 {/* Analysis loading */}
 {analyzing && (
 <div className="card">
 <div className="flex flex-col items-center justify-center p-6 space-y-4">
 <div className={styles.spinner}></div>
 <p className="text-gray-500 dark:text-gray-400">Analyzing your food...</p>
 </div>
 </div>
 )}
 
 {/* Nutrition data */}
 {nutritionData && (
 <div className="space-y-6">
 <div className="card">
 <div className="flex items-center justify-between">
 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
 {nutritionData.name}
 </h2>
 <span className="badge badge-primary">{nutritionData.calories} calories</span>
 </div>
 
 <div className="mt-6">
 <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Nutritional Values</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="stat-card">
 <div className="stat-title">Protein</div>
 <div className="stat-value">{nutritionData.nutritionalValues.protein}g</div>
 </div>
 <div className="stat-card">
 <div className="stat-title">Carbs</div>
 <div className="stat-value">{nutritionData.nutritionalValues.carbs}g</div>
 </div>
 <div className="stat-card">
 <div className="stat-title">Fat</div>
 <div className="stat-value">{nutritionData.nutritionalValues.fat}g</div>
 </div>
 <div className="stat-card">
 <div className="stat-title">Fiber</div>
 <div className="stat-value">{nutritionData.nutritionalValues.fiber}g</div>
 </div>
 </div>
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="card">
 <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Ingredients</h3>
 <ul className="space-y-2">
 {nutritionData.ingredients.map((ingredient, index) => (
 <li key={index} className="flex items-center">
 <Check className="h-5 w-5 text-green-500 mr-2" />
 <span className="text-gray-600 dark:text-gray-400">{ingredient}</span>
 </li>
 ))}
 </ul>
 </div>
 
 <div className="space-y-6">
 <div className="card">
 <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
 <span className="text-green-500 mr-2">✓</span> Advantages
 </h3>
 <ul className="space-y-2">
 {nutritionData.advantages.map((advantage, index) => (
 <li key={index} className="text-gray-600 dark:text-gray-400">
 • {advantage}
 </li>
 ))}
 </ul>
 </div>
 
 <div className="card">
 <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
 <span className="text-red-500 mr-2">✗</span> Disadvantages
 </h3>
 <ul className="space-y-2">
 {nutritionData.disadvantages.map((disadvantage, index) => (
 <li key={index} className="text-gray-600 dark:text-gray-400">
 • {disadvantage}
 </li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 
 <div className="flex justify-center mt-6">
 <button 
 className="btn btn-secondary"
 onClick={resetAnalysis}
 >
 Analyze New Food
 </button>
 </div>
 </div>
 )}
 </div>
 )}

 {/* History Tab Content */}
 {activeTab === 'history' && (
 <div className="card">
 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
 Recent Analyses
 </h2>
 
 {history.length === 0 ? (
 <div className="text-center py-8">
 <p className="text-gray-500 dark:text-gray-400">No history yet. Analyze some food to see your history.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {history.map((item, index) => (
 <div 
 key={index} 
 className="card cursor-pointer hover:shadow-md transition-shadow"
 onClick={() => viewHistoryItem(item)}
 role="button"
 tabIndex={0}
 >
 <div className="aspect-w-16 aspect-h-9 mb-4 rounded-md overflow-hidden">
 <img 
 src={item.image} 
 alt={item.data.name} 
 className="object-cover w-full h-full" 
 />
 </div>
 <div className="flex items-center justify-between">
 <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
 {item.data.name}
 </h3>
 <span className="badge badge-primary">{item.data.calories} cal</span>
 </div>
 <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
 Protein: {item.data.nutritionalValues.protein}g • 
 Carbs: {item.data.nutritionalValues.carbs}g
 </p>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* About Tab Content */}
 {activeTab === 'info' && (
 <div className="card">
 <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
 About NutriSnap
 </h2>
 <div className="prose dark:prose-invert max-w-none">
 <p>
 NutriSnap is a powerful tool designed to help you make informed dietary choices. 
 Simply take a picture of your food, and our AI-powered system will analyze it to 
 provide you with detailed nutritional information.
 </p>
 
 <h3>Features</h3>
 <ul>
 <li>Instant nutrition analysis from images</li>
 <li>Detailed breakdown of calories, macronutrients, and ingredients</li>
 <li>Pros and cons of each food item</li>
 <li>History tracking to monitor your diet over time</li>
 </ul>
 
 <h3>How It Works</h3>
 <p>
 Our advanced image recognition technology identifies the food in your photo 
 and matches it against our extensive database of nutritional information. 
 The analysis takes into account portion sizes and preparation methods to 
 give you the most accurate results possible.
 </p>
 
 <h3>Privacy</h3>
 <p>
 Your privacy is important to us. Images are processed securely and are only 
 stored on your device. We do not share your data with third parties without 
 your explicit consent.
 </p>
 
 <h3>Disclaimer</h3>
 <p>
 While we strive for accuracy, NutriSnap is intended for informational purposes 
 only and should not replace professional nutritional advice. The analysis is an 
 estimate and may vary based on specific ingredients and preparation methods.
 </p>
 </div>
 </div>
 )}
 </main>

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 shadow-inner py-6 mt-auto">
 <div className="container-fluid px-4 sm:px-6">
 <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </p>
 </div>
 </footer>
 </div>
 );
};

export default App;