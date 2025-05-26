import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'react-camera-pro';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Camera as CameraIcon, Upload, Trash2, Plus, Calendar, TrendingUp, Target, AlertTriangle, CheckCircle, Clock, Activity, Heart, Zap, Shield, User, Settings, Download as DownloadIcon, X } from 'lucide-react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  advantages: string[];
  disadvantages: string[];
  recommendations: string[];
  timestamp: Date;
  imageData?: string;
}

interface HealthCondition {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
}

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

interface DailyStats {
  date: string;
  consumed: DailyGoals;
  goals: DailyGoals;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

const defaultGoals: DailyGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  fiber: 25,
  sugar: 50,
  sodium: 2300
};

const commonHealthConditions = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'High Cholesterol', 
  'Obesity', 'Kidney Disease', 'Celiac Disease', 'Lactose Intolerance',
  'Food Allergies', 'GERD', 'IBS', 'Arthritis'
];

function App() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'log' | 'insights'>('camera');
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>(defaultGoals);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<any>(null);
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const cameraRef = useRef<any>(null);
  const aiLayerRef = useRef<AILayerHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedFoodItems = localStorage.getItem('foodItems');
    const savedHealthConditions = localStorage.getItem('healthConditions');
    const savedDailyGoals = localStorage.getItem('dailyGoals');
    
    if (savedFoodItems) {
      try {
        const parsedItems = JSON.parse(savedFoodItems);
        setFoodItems(parsedItems.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error('Error parsing saved food items:', error);
      }
    }
    
    if (savedHealthConditions) {
      try {
        setHealthConditions(JSON.parse(savedHealthConditions));
      } catch (error) {
        console.error('Error parsing saved health conditions:', error);
      }
    }
    
    if (savedDailyGoals) {
      try {
        setDailyGoals(JSON.parse(savedDailyGoals));
      } catch (error) {
        console.error('Error parsing saved daily goals:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('foodItems', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('healthConditions', JSON.stringify(healthConditions));
  }, [healthConditions]);

  useEffect(() => {
    localStorage.setItem('dailyGoals', JSON.stringify(dailyGoals));
  }, [dailyGoals]);

  const capturePhoto = () => {
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.takePhoto();
      setPreviewImage(imageSrc);
      setShowCamera(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = () => {
    if (!previewImage && !selectedFile) {
      setAnalysisError('Please capture or upload a food image first.');
      return;
    }

    const healthConditionsText = healthConditions.length > 0 
      ? `User has the following health conditions: ${healthConditions.map(c => `${c.name} (${c.severity})`).join(', ')}. `
      : '';

    const prompt = `Analyze this food image and provide detailed nutritional information. ${healthConditionsText}Return a JSON object with the following structure: {
      "foods": [
        {
          "name": "food name",
          "calories": number,
          "protein": number (grams),
          "carbs": number (grams),
          "fat": number (grams),
          "fiber": number (grams),
          "sugar": number (grams),
          "sodium": number (mg),
          "advantages": ["health benefit 1", "health benefit 2"],
          "disadvantages": ["potential concern 1", "potential concern 2"],
          "recommendations": ["specific advice based on health conditions"]
        }
      ]
    }`;

    setAnalysisResult(null);
    setAnalysisError(null);
    
    try {
      if (selectedFile) {
        aiLayerRef.current?.sendToAI(prompt, selectedFile);
      } else {
        // Convert base64 to file for AI analysis
        fetch(previewImage!)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'captured_food.jpg', { type: 'image/jpeg' });
            aiLayerRef.current?.sendToAI(prompt, file);
          })
          .catch(error => {
            setAnalysisError('Failed to process captured image');
          });
      }
    } catch (error) {
      setAnalysisError('Failed to analyze food image');
    }
  };

  const processFoodAnalysis = (result: string) => {
    try {
      const parsedResult = JSON.parse(result);
      if (parsedResult.foods && Array.isArray(parsedResult.foods)) {
        const newFoodItems: FoodItem[] = parsedResult.foods.map((food: any) => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: food.name || 'Unknown Food',
          calories: food.calories || 0,
          protein: food.protein || 0,
          carbs: food.carbs || 0,
          fat: food.fat || 0,
          fiber: food.fiber || 0,
          sugar: food.sugar || 0,
          sodium: food.sodium || 0,
          advantages: food.advantages || [],
          disadvantages: food.disadvantages || [],
          recommendations: food.recommendations || [],
          timestamp: new Date(),
          imageData: previewImage || undefined
        }));
        
        setFoodItems(prev => [...prev, ...newFoodItems]);
        setPreviewImage(null);
        setSelectedFile(null);
        setActiveTab('log');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setAnalysisError('Invalid analysis result format');
      }
    } catch (error) {
      setAnalysisError('Failed to parse analysis result');
    }
  };

  const addHealthCondition = (conditionName: string, severity: 'mild' | 'moderate' | 'severe') => {
    const newCondition: HealthCondition = {
      id: Date.now().toString(),
      name: conditionName,
      severity
    };
    setHealthConditions(prev => [...prev, newCondition]);
  };

  const removeHealthCondition = (id: string) => {
    setHealthConditions(prev => prev.filter(c => c.id !== id));
  };

  const removeFoodItem = (id: string) => {
    setFoodItems(prev => prev.filter(item => item.id !== id));
  };

  const getTodayStats = (): DailyStats => {
    const today = new Date().toDateString();
    const todayItems = foodItems.filter(item => 
      item.timestamp.toDateString() === today
    );
    
    const consumed = todayItems.reduce((acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
      fiber: acc.fiber + item.fiber,
      sugar: acc.sugar + item.sugar,
      sodium: acc.sodium + item.sodium
    }), {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
    });
    
    return {
      date: today,
      consumed,
      goals: dailyGoals
    };
  };

  const getWeeklyData = () => {
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const dayItems = foodItems.filter(item => 
        item.timestamp.toDateString() === dateStr
      );
      
      const totalCalories = dayItems.reduce((sum, item) => sum + item.calories, 0);
      
      weekData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        calories: totalCalories,
        goal: dailyGoals.calories
      });
    }
    return weekData;
  };

  const exportData = () => {
    const csvData = [
      ['Date', 'Food Name', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Fiber (g)', 'Sugar (g)', 'Sodium (mg)'],
      ...foodItems.map(item => [
        item.timestamp.toLocaleDateString(),
        item.name,
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
        item.fiber,
        item.sugar,
        item.sodium
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food_log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const todayStats = getTodayStats();
  const weeklyData = getWeeklyData();
  
  const macroData = [
    { name: 'Protein', value: todayStats.consumed.protein, goal: todayStats.goals.protein, color: '#3B82F6' },
    { name: 'Carbs', value: todayStats.consumed.carbs, goal: todayStats.goals.carbs, color: '#10B981' },
    { name: 'Fat', value: todayStats.consumed.fat, goal: todayStats.goals.fat, color: '#F59E0B' }
  ];

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Activity className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">NutriScan</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">AI-Powered Food Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser && (
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
                  Welcome, {currentUser.first_name}
                </span>
              )}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-slate-400" />
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Logout"
              >
                <User className="h-5 w-5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition sticky top-0 z-40">
        <div className="container-fluid">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'camera', label: 'Camera', icon: CameraIcon },
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'log', label: 'Food Log', icon: Clock },
              { id: 'insights', label: 'Insights', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`nav-${id}`}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-6" id="generation_issue_fallback">
        {/* Camera Tab */}
        {activeTab === 'camera' && (
          <div className="space-y-6">
            <div className="card text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Capture Food Image</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">Take a photo of your food to get instant nutritional analysis</p>
              
              {!showCamera && !previewImage && (
                <button
                  id="open-camera"
                  onClick={() => setShowCamera(true)}
                  className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
                >
                  <CameraIcon className="h-5 w-5" />
                  Open Camera
                </button>
              )}
              
              {showCamera && (
                <div className={`${styles.cameraContainer} mx-auto mb-4`}>
                  <Camera ref={cameraRef} aspectRatio={4/3} />
                  <div className="flex gap-4 mt-4 justify-center">
                    <button
                      onClick={capturePhoto}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <CameraIcon className="h-4 w-4" />
                      Capture
                    </button>
                    <button
                      onClick={() => setShowCamera(false)}
                      className="btn bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {previewImage && (
                <div className="space-y-4">
                  <img
                    src={previewImage}
                    alt="Captured food"
                    className="mx-auto rounded-lg shadow-md max-w-md w-full"
                  />
                  <div className="flex gap-4 justify-center">
                    <button
                      id="analyze-food"
                      onClick={analyzeFood}
                      disabled={isAnalyzing}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Food'}
                    </button>
                    <button
                      onClick={() => {
                        setPreviewImage(null);
                        setAnalysisResult(null);
                        setAnalysisError(null);
                      }}
                      className="btn bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {analysisError && (
              <div className="alert alert-error">
                <AlertTriangle className="h-5 w-5" />
                <p>{typeof analysisError === 'string' ? analysisError : 'An error occurred during analysis'}</p>
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="card text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Food Image</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">Upload a photo from your device for nutritional analysis</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {!previewImage && (
                <button
                  id="upload-image"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary btn-lg flex items-center gap-2 mx-auto"
                >
                  <Upload className="h-5 w-5" />
                  Upload Image
                </button>
              )}
              
              {previewImage && (
                <div className="space-y-4">
                  <img
                    src={previewImage}
                    alt="Uploaded food"
                    className="mx-auto rounded-lg shadow-md max-w-md w-full"
                  />
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={analyzeFood}
                      disabled={isAnalyzing}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Food'}
                    </button>
                    <button
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedFile(null);
                        setAnalysisResult(null);
                        setAnalysisError(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="btn bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {analysisError && (
              <div className="alert alert-error">
                <AlertTriangle className="h-5 w-5" />
                <p>{typeof analysisError === 'string' ? analysisError : 'An error occurred during analysis'}</p>
              </div>
            )}
          </div>
        )}

        {/* Food Log Tab */}
        {activeTab === 'log' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Food Log</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddCondition(true)}
                  className="btn btn-sm bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Health Condition
                </button>
                <button
                  onClick={exportData}
                  className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                >
                  <DownloadIcon className="h-4 w-4 mr-1" />
                  Export CSV
                </button>
              </div>
            </div>
            
            {/* Health Conditions */}
            {healthConditions.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Health Conditions</h3>
                <div className="flex flex-wrap gap-2">
                  {healthConditions.map(condition => (
                    <div
                      key={condition.id}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        condition.severity === 'severe'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : condition.severity === 'moderate'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      <span>{condition.name} ({condition.severity})</span>
                      <button
                        onClick={() => removeHealthCondition(condition.id)}
                        className="text-current hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Food Items */}
            <div className="space-y-4">
              {foodItems.length === 0 ? (
                <div className="card text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No food logged yet</h3>
                  <p className="text-gray-500 dark:text-slate-400">Start by capturing or uploading a food image</p>
                </div>
              ) : (
                foodItems.slice().reverse().map(item => (
                  <div key={item.id} className="card">
                    <div className="flex gap-4">
                      {item.imageData && (
                        <img
                          src={item.imageData}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 dark:text-slate-400">
                              {item.timestamp.toLocaleString()}
                            </span>
                            <button
                              onClick={() => removeFoodItem(item.id)}
                              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{item.calories}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">Calories</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{item.protein}g</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">Protein</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{item.carbs}g</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">Carbs</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{item.fat}g</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">Fat</div>
                          </div>
                        </div>
                        
                        {item.advantages.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Benefits
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                              {item.advantages.map((advantage, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-green-500 mt-0.5">•</span>
                                  {advantage}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {item.disadvantages.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Concerns
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                              {item.disadvantages.map((disadvantage, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-red-500 mt-0.5">•</span>
                                  {disadvantage}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {item.recommendations.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              Recommendations
                            </h4>
                            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
                              {item.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-0.5">•</span>
                                  {recommendation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daily Insights</h2>
            
            {/* Today's Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="stat-title">Calories Today</div>
                <div className="stat-value">{todayStats.consumed.calories}</div>
                <div className="stat-desc">
                  Goal: {todayStats.goals.calories} 
                  ({todayStats.goals.calories > 0 ? Math.round((todayStats.consumed.calories / todayStats.goals.calories) * 100) : 0}%)
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Protein</div>
                <div className="stat-value">{todayStats.consumed.protein}g</div>
                <div className="stat-desc">
                  Goal: {todayStats.goals.protein}g
                  ({todayStats.goals.protein > 0 ? Math.round((todayStats.consumed.protein / todayStats.goals.protein) * 100) : 0}%)
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Carbs</div>
                <div className="stat-value">{todayStats.consumed.carbs}g</div>
                <div className="stat-desc">
                  Goal: {todayStats.goals.carbs}g
                  ({todayStats.goals.carbs > 0 ? Math.round((todayStats.consumed.carbs / todayStats.goals.carbs) * 100) : 0}%)
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Fat</div>
                <div className="stat-value">{todayStats.consumed.fat}g</div>
                <div className="stat-desc">
                  Goal: {todayStats.goals.fat}g
                  ({todayStats.goals.fat > 0 ? Math.round((todayStats.consumed.fat / todayStats.goals.fat) * 100) : 0}%)
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Calories */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Calorie Intake</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-text-base)',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="calories" fill="#3B82F6" name="Consumed" />
                    <Bar dataKey="goal" fill="#E5E7EB" name="Goal" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Macro Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Macros</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}g`}
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-text-base)',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Progress Bars */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Today's Progress</h3>
              <div className="space-y-4">
                {macroData.map(macro => {
                  const percentage = macro.goal > 0 ? Math.min((macro.value / macro.goal) * 100, 100) : 0;
                  return (
                    <div key={macro.name}>
                      <div className="flex-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{macro.name}</span>
                        <span className="text-sm text-gray-500 dark:text-slate-400">
                          {macro.value}g / {macro.goal}g
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: macro.color 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Health Condition Modal */}
      {showAddCondition && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowAddCondition(false)}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Health Condition</h3>
              <button 
                onClick={() => setShowAddCondition(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {commonHealthConditions.map(condition => (
                <div key={condition} className="space-y-2">
                  <div className="font-medium text-gray-700 dark:text-slate-300">{condition}</div>
                  <div className="flex gap-2">
                    {['mild', 'moderate', 'severe'].map(severity => (
                      <button
                        key={severity}
                        onClick={() => {
                          addHealthCondition(condition, severity as any);
                          setShowAddCondition(false);
                        }}
                        className={`px-3 py-1 rounded text-sm ${
                          severity === 'severe'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                            : severity === 'moderate'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {severity}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="modal-content max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Daily Goals</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="mt-4 space-y-4">
              {Object.entries(dailyGoals).map(([key, value]) => (
                <div key={key} className="form-group">
                  <label className="form-label capitalize">
                    {key} {key === 'calories' ? '' : key === 'sodium' ? '(mg)' : '(g)'}
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setDailyGoals(prev => ({
                      ...prev,
                      [key]: parseFloat(e.target.value) || 0
                    }))}
                    className="input"
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowSettings(false)}
                className="btn btn-primary"
              >
                Save Goals
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={''}
        onResult={processFoodAnalysis}
        onError={(error) => setAnalysisError(error)}
        onLoading={(loading) => setIsAnalyzing(loading)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12 theme-transition">
        <div className="container-fluid py-4">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
