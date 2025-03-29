import React, { useState, useEffect, useRef } from 'react';
import styles from './styles/styles.module.css';
import { Camera, Info, X, Upload, RefreshCw, Download, ThumbsUp, ThumbsDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type FoodItem = {
  id: string;
  name: string;
  calories: number;
  ingredients: string[];
  advantages: string[];
  disadvantages: string[];
  imageUrl: string;
  timestamp: number;
};

type Theme = 'light' | 'dark';

const App: React.FC = () => {
  // States
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [activeTab, setActiveTab] = useState<'camera' | 'history' | 'details'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mock food database (for demonstration purposes)
  const mockFoodDB: Record<string, FoodItem> = {
    apple: {
      id: 'apple',
      name: 'Apple',
      calories: 52,
      ingredients: ['Fiber', 'Vitamin C', 'Antioxidants'],
      advantages: ['High in fiber', 'Low in calories', 'Rich in antioxidants'],
      disadvantages: ['May contain pesticides if not organic', 'High in sugar for some diets'],
      imageUrl: '',
      timestamp: Date.now()
    },
    burger: {
      id: 'burger',
      name: 'Hamburger',
      calories: 354,
      ingredients: ['Beef patty', 'Bun', 'Cheese', 'Lettuce', 'Tomato', 'Onion', 'Condiments'],
      advantages: ['Good source of protein', 'Contains vitamins from vegetables'],
      disadvantages: ['High in calories', 'High in saturated fat', 'High in sodium'],
      imageUrl: '',
      timestamp: Date.now()
    },
    salad: {
      id: 'salad',
      name: 'Greek Salad',
      calories: 180,
      ingredients: ['Lettuce', 'Tomato', 'Cucumber', 'Feta cheese', 'Olives', 'Olive oil'],
      advantages: ['Low in calories', 'High in vitamins and minerals', 'Good source of healthy fats'],
      disadvantages: ['Can be high in sodium due to cheese and olives'],
      imageUrl: '',
      timestamp: Date.now()
    },
    pizza: {
      id: 'pizza',
      name: 'Pizza Slice',
      calories: 285,
      ingredients: ['Flour', 'Cheese', 'Tomato sauce', 'Toppings'],
      advantages: ['Contains calcium from cheese', 'Tomato sauce contains lycopene'],
      disadvantages: ['High in carbohydrates', 'High in fat', 'Often high in sodium'],
      imageUrl: '',
      timestamp: Date.now()
    },
    banana: {
      id: 'banana',
      name: 'Banana',
      calories: 105,
      ingredients: ['Natural sugars', 'Fiber', 'Potassium'],
      advantages: ['High in potassium', 'Good source of fiber', 'Natural energy boost'],
      disadvantages: ['High in sugar', 'Can cause blood sugar spikes in some people'],
      imageUrl: '',
      timestamp: Date.now()
    }
  };

  // Effects
  useEffect(() => {
    // Load food items from local storage
    const storedItems = localStorage.getItem('foodItems');
    if (storedItems) {
      setFoodItems(JSON.parse(storedItems));
    }
  }, []);

  useEffect(() => {
    // Save food items to local storage whenever they change
    if (foodItems.length > 0) {
      localStorage.setItem('foodItems', JSON.stringify(foodItems));
    }
  }, [foodItems]);

  useEffect(() => {
    // Handle dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Camera functions
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera. Please make sure you have granted camera permissions.');
      console.error('Error accessing camera:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageUrl = canvas.toDataURL('image/jpeg');
        analyzeFood(imageUrl);
      }
    }
  };

  // Food analysis (mock implementation)
  const analyzeFood = (imageUrl: string) => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Randomly select a food item from our mock database
      const foodKeys = Object.keys(mockFoodDB);
      const randomFood = mockFoodDB[foodKeys[Math.floor(Math.random() * foodKeys.length)]];
      
      // Create a new food item with the captured image
      const newFoodItem: FoodItem = {
        ...randomFood,
        id: `food-${Date.now()}`,
        imageUrl: imageUrl,
        timestamp: Date.now()
      };
      
      // Add the new food item to our state
      setFoodItems(prev => [newFoodItem, ...prev]);
      setSelectedFood(newFoodItem);
      setActiveTab('details');
      setIsLoading(false);
      stopCamera();
    }, 2000);
  };

  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      if (imageUrl) {
        analyzeFood(imageUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const viewFoodDetails = (foodItem: FoodItem) => {
    setSelectedFood(foodItem);
    setActiveTab('details');
  };

  // UI functions and rendering logic
  const renderTab = () => {
    switch (activeTab) {
      case 'camera':
        return renderCameraTab();
      case 'history':
        return renderHistoryTab();
      case 'details':
        return renderDetailsTab();
      default:
        return null;
    }
  };

  const renderCameraTab = () => {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        {error && (
          <div className="alert alert-error mb-4 w-full">
            <p>{error}</p>
          </div>
        )}
        
        <div className={`${styles.cameraContainer} w-full max-w-lg rounded-lg overflow-hidden relative mb-6`}>
          {cameraActive ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
            </>
          ) : (
            <div className="aspect-w-4 aspect-h-3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Camera size={64} className="text-gray-400 dark:text-gray-500" />
              <p className="text-center text-gray-500 dark:text-gray-400 mt-2">
                Camera preview will appear here
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          {cameraActive ? (
            <>
              <button 
                onClick={captureImage}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw size={20} className={styles.spinner} />
                ) : (
                  <Camera size={20} />
                )}
                {isLoading ? 'Analyzing...' : 'Capture'}
              </button>
              <button 
                onClick={stopCamera}
                className="btn bg-gray-500 text-white hover:bg-gray-600 flex-1 flex items-center justify-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={startCamera}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Start Camera
              </button>
              <div className="relative flex-1">
                <input
                  type="file"
                  id="upload-image"
                  accept="image/*"
                  onChange={uploadImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Upload food image"
                />
                <label 
                  htmlFor="upload-image"
                  className="btn bg-gray-500 text-white hover:bg-gray-600 w-full h-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload size={20} />
                  Upload Photo
                </label>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 w-full max-w-lg text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How to use</h3>
          <ol className="text-left text-gray-600 dark:text-gray-300 list-decimal pl-6 space-y-2">
            <li>Tap "Start Camera" to activate your device camera</li>
            <li>Position the food item in the center of the frame</li>
            <li>Tap "Capture" to take a photo and analyze the food</li>
            <li>Alternatively, upload an existing food photo</li>
            <li>View detailed nutrition information and ingredients</li>
          </ol>
        </div>
      </div>
    );
  };

  const renderHistoryTab = () => {
    if (foodItems.length === 0) {
      return (
        <div className="flex flex-col h-full items-center justify-center p-4 text-center">
          <Info size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No food items yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Take a photo or upload an image of food to analyze it</p>
          <button 
            onClick={() => setActiveTab('camera')}
            className="btn btn-primary flex items-center justify-center gap-2"
          >
            <Camera size={20} />
            Get Started
          </button>
        </div>
      );
    }

    return (
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Food History</h2>
        
        {/* Food History Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Calorie Overview</h3>
          <div className="w-full h-64 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={foodItems.slice(0, 5).map(item => ({
                  name: item.name,
                  calories: item.calories
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" fill="#8884d8" name="Calories" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {foodItems.map((foodItem) => (
            <div 
              key={foodItem.id} 
              className="card cursor-pointer hover:shadow-lg theme-transition"
              onClick={() => viewFoodDetails(foodItem)}
            >
              <div className="aspect-w-16 aspect-h-9 mb-2">
                <img 
                  src={foodItem.imageUrl} 
                  alt={foodItem.name} 
                  className="object-cover rounded-t-lg w-full h-full"
                />
              </div>
              <div className="p-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{foodItem.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="badge badge-primary">{foodItem.calories} calories</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(foodItem.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDetailsTab = () => {
    if (!selectedFood) {
      return (
        <div className="flex flex-col h-full items-center justify-center p-4 text-center">
          <Info size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No food selected</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Return to camera or history to select a food item</p>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab('camera')}
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              Camera
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center justify-center gap-2"
            >
              <Info size={20} />
              History
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setActiveTab('history')}
            className="mr-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedFood.name}</h2>
        </div>
        
        <div className="aspect-w-16 aspect-h-9 mb-6">
          <img 
            src={selectedFood.imageUrl} 
            alt={selectedFood.name} 
            className="object-cover rounded-lg w-full h-full"
          />
        </div>
        
        <div className="card mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nutrition Information</h3>
          <div className="stat-card">
            <div className="stat-title">Calories</div>
            <div className="stat-value">{selectedFood.calories}</div>
            <div className="stat-desc">per serving</div>
          </div>
        </div>
        
        <div className="card mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ingredients</h3>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
            {selectedFood.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center mb-2">
              <ThumbsUp size={20} className="text-green-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Advantages</h3>
            </div>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
              {selectedFood.advantages.map((advantage, index) => (
                <li key={index}>{advantage}</li>
              ))}
            </ul>
          </div>
          
          <div className="card">
            <div className="flex items-center mb-2">
              <ThumbsDown size={20} className="text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Disadvantages</h3>
            </div>
            <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
              {selectedFood.disadvantages.map((disadvantage, index) => (
                <li key={index}>{disadvantage}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Recommendations</h3>
          <p className="text-gray-600 dark:text-gray-300">
            {selectedFood.calories > 300 ? 
              "This food is relatively high in calories. Consider having a smaller portion or balancing with lower calorie options for the rest of the day." :
              "This food is relatively low in calories and can be included as part of a balanced diet."}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-gray-100 dark:bg-gray-900 theme-transition-all`}>
      <header className="bg-white dark:bg-gray-800 shadow theme-transition">
        <div className="container-fluid py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">NutritionSnap</h1>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="theme-toggle" 
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle-thumb"></span>
            <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
          </button>
        </div>
      </header>
      
      <main className="container-fluid py-4 flex-1 flex flex-col">
        <div className="flex-1 mb-16">
          {renderTab()}
        </div>
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 theme-transition">
        <div className="flex justify-around">
          <button 
            onClick={() => {
              setActiveTab('camera');
              if (cameraActive) stopCamera();
            }}
            className={`py-4 px-6 flex flex-col items-center justify-center ${activeTab === 'camera' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
            aria-label="Camera"
          >
            <Camera size={24} />
            <span className="text-xs mt-1">Camera</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab('history');
              if (cameraActive) stopCamera();
            }}
            className={`py-4 px-6 flex flex-col items-center justify-center ${activeTab === 'history' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
            aria-label="History"
          >
            <Info size={24} />
            <span className="text-xs mt-1">History</span>
          </button>
        </div>
      </nav>
      
      <footer className="bg-white dark:bg-gray-800 py-4 text-center text-sm text-gray-500 dark:text-gray-400 theme-transition border-t border-gray-200 dark:border-gray-700">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
