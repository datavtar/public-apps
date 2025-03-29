import React, { useState, useEffect, useRef } from 'react';
import { Camera, Smile, X, Upload, Send, Moon, Sun, Info } from 'lucide-react';
import styles from './styles/styles.module.css';

type NutritionData = {
  id: string;
  image: string;
  name: string;
  calories: number;
  ingredients: string[];
  advantages: string[];
  disadvantages: string[];
  dateAdded: string;
};

interface FoodSuggestion {
  id: string;
  name: string;
  calories: number;
  ingredients: string[];
  advantages: string[];
  disadvantages: string[];
  image: string;
}

const App: React.FC = () => {
  // States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzeStatus, setAnalyzeStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [nutritionData, setNutritionData] = useState<NutritionData[]>([]);
  const [currentFood, setCurrentFood] = useState<NutritionData | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<NutritionData | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Food database suggestions
  const foodSuggestions: FoodSuggestion[] = [
    {
      id: '1',
      name: 'Apple',
      calories: 95,
      ingredients: ['Natural sugars', 'Fiber', 'Water'],
      advantages: ['High in fiber', 'Rich in antioxidants', 'Low calorie', 'Promotes heart health'],
      disadvantages: ['Contains natural sugars', 'May cause bloating for some people'],
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNlMDQ0MDAiIC8+PHBhdGggZD0iTTMwLDQwIFE1MCwxMCA3MCw0MCIgc3Ryb2tlPSIjNDQwIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiIC8+PC9zdmc+'
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      calories: 350,
      ingredients: ['Chicken breast', 'Lettuce', 'Tomatoes', 'Cucumber', 'Olive oil'],
      advantages: ['High protein', 'Low carb', 'Rich in vitamins', 'Helps in weight management'],
      disadvantages: ['Dressing might add extra calories', 'Possible pesticides on vegetables if not organic'],
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNjNWU4YjciIC8+PHJlY3QgeD0iMzAiIHk9IjQwIiB3aWR0aD0iNDAiIGhlaWdodD0iMTUiIGZpbGw9IiNlOGQ2YjciIC8+PHBhdGggZD0iTTI1LDM1IFE1MCw2MCA3NSwzNSIgc3Ryb2tlPSIjN2ZiZjdmIiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiIC8+PC9zdmc+'
    },
    {
      id: '3',
      name: 'Burger',
      calories: 550,
      ingredients: ['Beef patty', 'Burger bun', 'Cheese', 'Lettuce', 'Onion', 'Mayo'],
      advantages: ['Good source of protein', 'Contains some vegetables'],
      disadvantages: ['High in calories', 'High in fat', 'High in sodium', 'Processed ingredients'],
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNlOGQ2YjciIC8+PHJlY3QgeD0iMjAiIHk9IjQwIiB3aWR0aD0iNjAiIGhlaWdodD0iMTAiIGZpbGw9IiM3MzRjMDAiIC8+PHJlY3QgeD0iMjAiIHk9IjUwIiB3aWR0aD0iNjAiIGhlaWdodD0iNSIgZmlsbD0iI2JmZjdkZCIgLz48cmVjdCB4PSIyMCIgeT0iNTUiIHdpZHRoPSI2MCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzczNGMwMCIgLz48L3N2Zz4='
    },
    {
      id: '4',
      name: 'Quinoa Bowl',
      calories: 420,
      ingredients: ['Quinoa', 'Avocado', 'Cherry tomatoes', 'Black beans', 'Corn', 'Lime juice'],
      advantages: ['Complete protein source', 'Rich in fiber', 'Low glycemic index', 'Contains healthy fats'],
      disadvantages: ['Relatively high in calories', 'May cause digestive issues for some'],
      image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNmNWYwZTEiIC8+PGNpcmNsZSBjeD0iMzAiIGN5PSI0MCIgcj0iOCIgZmlsbD0iIzdhYjU1YyIgLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQ1IiByPSI4IiBmaWxsPSIjZTg5ZDdkIiAvPjxjaXJjbGUgY3g9IjQ1IiBjeT0iNjAiIHI9IjgiIGZpbGw9IiNlODU0NGQiIC8+PC9zdmc+'
    }
  ];

  // Effects
  useEffect(() => {
    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Load nutrition data from localStorage
    const savedNutritionData = localStorage.getItem('nutritionData');
    if (savedNutritionData) {
      setNutritionData(JSON.parse(savedNutritionData));
    }
  }, []);

  useEffect(() => {
    // Save nutrition data to localStorage whenever it changes
    if (nutritionData.length > 0) {
      localStorage.setItem('nutritionData', JSON.stringify(nutritionData));
    }
  }, [nutritionData]);

  // Camera handling functions
  const startCamera = async () => {
    setIsCameraOpen(true);
    setCapturedImage(null);
    
    try {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check your camera permissions.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          setCapturedImage(e.target.result);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Analyze the food image
  const analyzeFood = () => {
    if (!capturedImage) return;
    
    setAnalyzeStatus('analyzing');
    
    // Simulate API analysis with a timeout
    setTimeout(() => {
      // Select a random food suggestion for demo purposes
      const randomIndex = Math.floor(Math.random() * foodSuggestions.length);
      const suggestion = foodSuggestions[randomIndex];
      
      const newFood: NutritionData = {
        id: Date.now().toString(),
        image: capturedImage,
        name: suggestion.name,
        calories: suggestion.calories,
        ingredients: suggestion.ingredients,
        advantages: suggestion.advantages,
        disadvantages: suggestion.disadvantages,
        dateAdded: new Date().toISOString()
      };
      
      setCurrentFood(newFood);
      setAnalyzeStatus('complete');
      setNutritionData(prev => [newFood, ...prev]);
    }, 1500);
  };

  const resetScan = () => {
    setCapturedImage(null);
    setCurrentFood(null);
    setAnalyzeStatus('idle');
  };

  const viewFoodDetails = (food: NutritionData) => {
    setSelectedHistoryItem(food);
    setShowDetails(true);
  };

  // UI Components
  const renderCamera = () => (
    <div className="relative w-full max-w-md mx-auto">
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full rounded-lg bg-black"
      />
      <button 
        onClick={captureImage}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 btn btn-primary rounded-full w-16 h-16 flex items-center justify-center"
        aria-label="Take photo"
      >
        <Smile className="w-8 h-8" />
      </button>
      <button 
        onClick={stopCamera}
        className="absolute top-4 right-4 btn bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
        aria-label="Close camera"
      >
        <X className="w-6 h-6" />
      </button>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );

  const renderImageUpload = () => (
    <div className="w-full max-w-md mx-auto">
      <div 
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={triggerFileInput}
      >
        {capturedImage ? (
          <img 
            src={capturedImage} 
            alt="Captured food" 
            className="max-h-64 rounded-lg shadow-md" 
          />
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Upload a food image</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Click or drag &amp; drop</p>
          </>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        onChange={handleFileUpload} 
        className="hidden" 
      />
      
      <div className="flex justify-center space-x-4 mt-4">
        {capturedImage && (
          <button 
            onClick={resetScan} 
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            aria-label="Reset scan"
          >
            <X className="w-4 h-4 mr-1" /> Reset
          </button>
        )}
        
        <button 
          onClick={startCamera} 
          className="btn btn-secondary"
          aria-label="Open camera"
        >
          <Camera className="w-4 h-4 mr-1" /> Camera
        </button>
        
        {capturedImage && (
          <button 
            onClick={analyzeFood} 
            className="btn btn-primary"
            disabled={analyzeStatus !== 'idle'}
            aria-label="Analyze food"
          >
            {analyzeStatus === 'analyzing' ? (
              <>
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" /> Analyze
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  const renderAnalysisResults = () => {
    if (!currentFood) return null;
    
    return (
      <div className="w-full max-w-md mx-auto mt-6">
        <div className="card bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          <div className="relative">
            <img 
              src={currentFood.image} 
              alt={currentFood.name}
              className="w-full h-48 object-cover" 
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h2 className="text-white text-xl font-bold">{currentFood.name}</h2>
              <p className="text-white">{currentFood.calories} calories</p>
            </div>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Ingredients:</h3>
              <div className="flex flex-wrap gap-2">
                {currentFood.ingredients.map((ingredient, index) => (
                  <span 
                    key={index} 
                    className="badge badge-info text-xs"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-green-600 dark:text-green-400 mb-2">Advantages:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                  {currentFood.advantages.map((adv, index) => (
                    <li key={index}>{adv}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Disadvantages:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                  {currentFood.disadvantages.map((disadv, index) => (
                    <li key={index}>{disadv}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <button 
              onClick={resetScan}
              className="btn btn-primary w-full mt-4"
              aria-label="Scan new food"
            >
              Scan new food
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryList = () => (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Your Food History</h2>
      
      {nutritionData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No food scans yet. Start by scanning a food item!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {nutritionData.map((item) => (
            <div 
              key={item.id} 
              className="card bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => viewFoodDetails(item)}
            >
              <div className="flex items-center p-3">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-md object-cover mr-3"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.calories} calories</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700">
                  <span className="text-gray-500 dark:text-gray-300">&gt;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetailsModal = () => {
    if (!selectedHistoryItem || !showDetails) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedHistoryItem.name}</h3>
            <button 
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            <img 
              src={selectedHistoryItem.image} 
              alt={selectedHistoryItem.name}
              className="w-full h-48 object-cover rounded-md mb-4" 
            />
            
            <div className="stat-card mb-4">
              <div className="stat-title">Calories</div>
              <div className="stat-value">{selectedHistoryItem.calories}</div>
              <div className="stat-desc">per serving</div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ingredients:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedHistoryItem.ingredients.map((ingredient, index) => (
                  <span 
                    key={index} 
                    className="badge badge-info text-xs"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">Advantages:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                  {selectedHistoryItem.advantages.map((adv, index) => (
                    <li key={index}>{adv}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Disadvantages:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                  {selectedHistoryItem.disadvantages.map((disadv, index) => (
                    <li key={index}>{disadv}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
              Scanned on: {new Date(selectedHistoryItem.dateAdded).toLocaleString()}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button 
              onClick={() => setShowDetails(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              aria-label="Close details"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInfoModal = () => {
    if (!showInfoModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="modal-content bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">About Nutrition Snap</h3>
            <button 
              onClick={() => setShowInfoModal(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close info"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 prose dark:prose-invert max-w-none">
            <p>
              <strong>Nutrition Snap</strong> helps nutrition experts quickly assess food composition by:
            </p>
            
            <ul>
              <li>Taking photos of food or uploading existing images</li>
              <li>Getting immediate calorie estimates</li>
              <li>Viewing detailed ingredient breakdowns</li>
              <li>Understanding the nutritional advantages and disadvantages</li>
              <li>Maintaining a history of previously analyzed foods</li>
            </ul>
            
            <p>
              <strong>Note:</strong> This demo uses simulated food recognition. In a production environment, 
              it would connect to a sophisticated food recognition API with a comprehensive 
              nutrition database.
            </p>
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button 
              onClick={() => setShowInfoModal(false)}
              className="btn btn-primary"
              aria-label="Got it"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white ${styles.appContainer}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-fluid py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Nutrition Snap</h1>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowInfoModal(true)}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="App information"
            >
              <Info className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container-fluid py-6 flex-1">
        {/* Tabs */}
        <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'scan' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('scan')}
            aria-label="Scan tab"
          >
            Scan Food
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'history' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400'}`}
            onClick={() => setActiveTab('history')}
            aria-label="History tab"
          >
            History
          </button>
        </div>
        
        {/* Tab content */}
        <div className="py-4">
          {activeTab === 'scan' ? (
            <div className="space-y-6">
              {isCameraOpen ? (
                renderCamera()
              ) : analyzeStatus === 'complete' && currentFood ? (
                renderAnalysisResults()
              ) : (
                renderImageUpload()
              )}
            </div>
          ) : (
            renderHistoryList()
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
      
      {/* Modals */}
      {renderDetailsModal()}
      {renderInfoModal()}
    </div>
  );
};

export default App;