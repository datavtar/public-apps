import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Camera, Upload, X, Sun, Moon, BarChart2, Home, User, Calendar, Settings, Info, Edit, Save, ArrowRight, Check, AlertTriangle } from 'lucide-react';
import styles from './styles/styles.module.css';

type FoodEntry = {
 id: string;
 name: string;
 calories: number;
 dateTime: string;
 imageUrl: string;
 benefits: string[];
 risks: string[];
 category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
};

type MedicalCondition = 'diabetes' | 'hypertension' | 'heartDisease' | 'obesity' | 'none';

type UserProfile = {
 name: string;
 age: number;
 weight: number;
 height: number;
 gender: 'male' | 'female' | 'other';
 targetCalories: number;
 medicalConditions: MedicalCondition[];
};

type DietSummary = {
 date: string;
 totalCalories: number;
 targetCalories: number;
 breakdown: {
 breakfast: number;
 lunch: number;
 dinner: number;
 snack: number;
 };
};

type ActiveTab = 'home' | 'insights' | 'profile' | 'history';

const App: React.FC = () => {
 // Theme state
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });

 // App state
 const [activeTab, setActiveTab] = useState<ActiveTab>('home');
 const [showCamera, setShowCamera] = useState<boolean>(false);
 const [capturedImage, setCapturedImage] = useState<string | null>(null);
 const [analyzingFood, setAnalyzingFood] = useState<boolean>(false);
 const [currentFood, setCurrentFood] = useState<FoodEntry | null>(null);
 const [showFoodDetails, setShowFoodDetails] = useState<boolean>(false);
 const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([
 {
 id: '1',
 name: 'Grilled Chicken Salad',
 calories: 320,
 dateTime: '2025-04-02T12:30:00',
 imageUrl: 'https://placehold.co/600x400/9ad6f5/1a365d?text=Chicken+Salad',
 benefits: ['High protein', 'Low carb', 'Rich in vitamins'],
 risks: ['May contain allergens'],
 category: 'lunch'
 },
 {
 id: '2',
 name: 'Avocado Toast',
 calories: 240,
 dateTime: '2025-04-02T08:15:00',
 imageUrl: 'https://placehold.co/600x400/adf7b6/1a365d?text=Avocado+Toast',
 benefits: ['Healthy fats', 'Fiber rich'],
 risks: ['High calorie for diabetics'],
 category: 'breakfast'
 },
 {
 id: '3',
 name: 'Fruit Smoothie',
 calories: 180,
 dateTime: '2025-04-01T16:45:00',
 imageUrl: 'https://placehold.co/600x400/f5c6d7/1a365d?text=Fruit+Smoothie',
 benefits: ['Vitamin C', 'Antioxidants'],
 risks: ['High in natural sugars'],
 category: 'snack'
 }
 ]);
 
 const [userProfile, setUserProfile] = useState<UserProfile>({
 name: 'Alex Johnson',
 age: 32,
 weight: 68,
 height: 170,
 gender: 'female',
 targetCalories: 2000,
 medicalConditions: ['hypertension']
 });

 const videoRef = useRef<HTMLVideoElement>(null);
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const { register, handleSubmit, reset, formState: { errors } } = useForm<{foodName: string, category: 'breakfast' | 'lunch' | 'dinner' | 'snack'}>();

 // Food database for demo purposes
 const foodDatabase: Record<string, {
 calories: number;
 benefits: string[];
 risks: Record<MedicalCondition, string[]>;
 }> = {
 'salad': {
 calories: 150,
 benefits: ['Rich in vitamins', 'High fiber', 'Low calorie'],
 risks: {
 'diabetes': ['Low risk for diabetics'],
 'hypertension': ['Low sodium option - good for hypertension'],
 'heartDisease': ['Heart-healthy option'],
 'obesity': ['Good for weight management'],
 'none': []
 }
 },
 'pizza': {
 calories: 350,
 benefits: ['Contains calcium', 'Can provide protein'],
 risks: {
 'diabetes': ['High carb content can spike blood sugar'],
 'hypertension': ['High sodium content - caution advised'],
 'heartDisease': ['High in saturated fats - limit consumption'],
 'obesity': ['High in calories - consume in moderation'],
 'none': ['High in calories and sodium']
 }
 },
 'fruit': {
 calories: 80,
 benefits: ['Rich in vitamins', 'Natural fiber', 'Antioxidants'],
 risks: {
 'diabetes': ['Contains natural sugars - monitor blood glucose'],
 'hypertension': ['Generally safe for hypertension'],
 'heartDisease': ['Heart-healthy option'],
 'obesity': ['Natural sugars - portion control advised'],
 'none': []
 }
 },
 'burger': {
 calories: 550,
 benefits: ['Contains protein', 'Can provide iron'],
 risks: {
 'diabetes': ['High carb content can spike blood sugar'],
 'hypertension': ['High sodium content - avoid with hypertension'],
 'heartDisease': ['High in saturated fats - avoid with heart issues'],
 'obesity': ['High calorie density - limit for weight management'],
 'none': ['High in calories, fats, and sodium']
 }
 },
 'chicken': {
 calories: 250,
 benefits: ['High in protein', 'Low in fat if skinless', 'Good source of B vitamins'],
 risks: {
 'diabetes': ['Generally safe for diabetics'],
 'hypertension': ['Watch sodium in preparations'],
 'heartDisease': ['Choose lean cuts for heart health'],
 'obesity': ['Good protein source for weight management'],
 'none': []
 }
 }
 };

 // Generate daily diet summaries
 const generateDietSummaries = (): DietSummary[] => {
 const today = new Date();
 const summaries: DietSummary[] = [];
 
 for (let i = 0; i < 7; i++) {
 const date = new Date(today);
 date.setDate(date.getDate() - i);
 const dateString = format(date, 'yyyy-MM-dd');
 
 const dayEntries = foodEntries.filter(entry => 
 entry.dateTime.startsWith(dateString)
 );
 
 const breakfast = dayEntries.filter(e => e.category === 'breakfast')
 .reduce((sum, entry) => sum + entry.calories, 0);
 const lunch = dayEntries.filter(e => e.category === 'lunch')
 .reduce((sum, entry) => sum + entry.calories, 0);
 const dinner = dayEntries.filter(e => e.category === 'dinner')
 .reduce((sum, entry) => sum + entry.calories, 0);
 const snack = dayEntries.filter(e => e.category === 'snack')
 .reduce((sum, entry) => sum + entry.calories, 0);
 
 const totalCalories = breakfast + lunch + dinner + snack;
 
 summaries.push({
 date: dateString,
 totalCalories,
 targetCalories: userProfile.targetCalories,
 breakdown: {
 breakfast,
 lunch,
 dinner,
 snack
 }
 });
 }
 
 return summaries;
 };

 const dietSummaries = generateDietSummaries();

 // Function to start the camera
 const startCamera = () => {
 setShowCamera(true);
 const constraints = {
 video: { facingMode: 'environment' },
 };
 
 navigator.mediaDevices.getUserMedia(constraints)
 .then((stream) => {
 if (videoRef.current) {
 videoRef.current.srcObject = stream;
 }
 })
 .catch((err) => {
 console.error('Error accessing camera:', err);
 });
 };

 // Function to stop the camera
 const stopCamera = () => {
 if (videoRef.current && videoRef.current.srcObject) {
 const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
 tracks.forEach(track => track.stop());
 videoRef.current.srcObject = null;
 }
 setShowCamera(false);
 };

 // Function to capture image from camera
 const captureImage = () => {
 if (canvasRef.current && videoRef.current) {
 const context = canvasRef.current.getContext('2d');
 canvasRef.current.width = videoRef.current.videoWidth;
 canvasRef.current.height = videoRef.current.videoHeight;
 
 if (context) {
 context.drawImage(
 videoRef.current,
 0,
 0,
 canvasRef.current.width,
 canvasRef.current.height
 );
 
 const imageDataUrl = canvasRef.current.toDataURL('image/png');
 setCapturedImage(imageDataUrl);
 stopCamera();
 analyzeFood(imageDataUrl);
 }
 }
 };

 // Function to handle file upload
 const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
 const files = event.target.files;
 if (files && files.length > 0) {
 const file = files[0];
 const reader = new FileReader();
 
 reader.onload = (e) => {
 if (e.target && typeof e.target.result === 'string') {
 setCapturedImage(e.target.result);
 analyzeFood(e.target.result);
 }
 };
 
 reader.readAsDataURL(file);
 }
 };

 // Function to trigger file input click
 const triggerFileInput = () => {
 if (fileInputRef.current) {
 fileInputRef.current.click();
 }
 };

 // Function to "analyze" food (mock function for demo)
 const analyzeFood = (imageUrl: string) => {
 setAnalyzingFood(true);
 
 // Simulate API call delay
 setTimeout(() => {
 // For demo, randomly select a food from the database
 const foodKeys = Object.keys(foodDatabase);
 const randomFood = foodKeys[Math.floor(Math.random() * foodKeys.length)];
 const foodData = foodDatabase[randomFood];
 
 // Extract risks specific to user's medical conditions
 const relevantRisks: string[] = [];
 
 if (userProfile.medicalConditions.includes('none')) {
 relevantRisks.push(...(foodData.risks['none'] || []));
 } else {
 userProfile.medicalConditions.forEach(condition => {
 if (condition !== 'none') {
 relevantRisks.push(...(foodData.risks[condition] || []));
 }
 });
 }
 
 const newFood: FoodEntry = {
 id: Date.now().toString(),
 name: randomFood.charAt(0).toUpperCase() + randomFood.slice(1),
 calories: foodData.calories,
 dateTime: new Date().toISOString(),
 imageUrl: imageUrl,
 benefits: foodData.benefits,
 risks: relevantRisks,
 category: 'snack' // Default category, can be changed by user
 };
 
 setCurrentFood(newFood);
 setAnalyzingFood(false);
 setShowFoodDetails(true);
 }, 2000);
 };

 // Function to save food entry
 const saveFoodEntry = (data: { foodName: string; category: 'breakfast' | 'lunch' | 'dinner' | 'snack' }) => {
 if (currentFood) {
 const updatedFood: FoodEntry = {
 ...currentFood,
 name: data.foodName || currentFood.name,
 category: data.category
 };
 
 setFoodEntries(prev => [updatedFood, ...prev]);
 setCurrentFood(null);
 setCapturedImage(null);
 setShowFoodDetails(false);
 reset();
 }
 };

 // Function to cancel current food entry
 const cancelFoodEntry = () => {
 setCurrentFood(null);
 setCapturedImage(null);
 setShowFoodDetails(false);
 reset();
 };

 // Toggle dark mode
 const toggleDarkMode = () => {
 setIsDarkMode(prev => {
 const newMode = !prev;
 localStorage.setItem('darkMode', JSON.stringify(newMode));
 return newMode;
 });
 };

 return (
 <div className={`app ${isDarkMode ? 'dark' : ''}`}>
 <header className="app-header">
 <div className="logo">NutriTrack</div>
 <button onClick={toggleDarkMode} className="dark-mode-toggle">
 {isDarkMode ? <Sun /> : <Moon />}
 </button>
 </header>

 <nav className="app-nav">
 <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'active' : ''}>
 <Home /> Home
 </button>
 <button onClick={() => setActiveTab('insights')} className={activeTab === 'insights' ? 'active' : ''}>
 <BarChart2 /> Insights
 </button>
 <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>
 <User /> Profile
 </button>
 <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'active' : ''}>
 <Calendar /> History
 </button>
 </nav>

 <main className="app-main">
 {activeTab === 'home' && (
 <div className="home-tab">
 <h2>Welcome to NutriTrack!</h2>
 <p>Track your meals and stay healthy.</p>

 <div className="food-input-section">
 <button onClick={startCamera} disabled={showCamera}>
 <Camera /> Take Photo
 </button>
 <button onClick={triggerFileInput}>
 <Upload /> Upload Image
 </button>
 <input
 type="file"
 accept="image/*"
 onChange={handleFileUpload}
 ref={fileInputRef}
 style={{ display: 'none' }}
 />
 </div>

 {showCamera && (
 <div className="camera-view">
 <video ref={videoRef} autoPlay playsInline />
 <canvas ref={canvasRef} style={{ display: 'none' }} />
 <div className="camera-controls">
 <button onClick={captureImage}>Capture</button>
 <button onClick={stopCamera}>Stop Camera</button>
 </div>
 </div>
 )}

 {analyzingFood && <div className="analyzing-food">Analyzing Food...</div>}

 {capturedImage && !showFoodDetails && (
 <div className="captured-image">
 <img src={capturedImage} alt="Captured Food" />
 </div>
 )}

 {showFoodDetails && currentFood && (
 <div className="food-details">
 <h3>Food Details</h3>
 <img src={currentFood.imageUrl} alt={currentFood.name} />
 <form onSubmit={handleSubmit(saveFoodEntry)} className="food-form">
 <label htmlFor="foodName">Food Name:</label>
 <input type="text" id="foodName" defaultValue={currentFood.name} {...register('foodName')} />

 <label htmlFor="category">Category:</label>
 <select id="category" defaultValue={currentFood.category} {...register('category', { required: true })}>
 <option value="breakfast">Breakfast</option>
 <option value="lunch">Lunch</option>
 <option value="dinner">Dinner</option>
 <option value="snack">Snack</option>
 </select>

 <p>Calories: {currentFood.calories}</p>
 <h4>Benefits:</h4>
 <ul>
 {currentFood.benefits.map((benefit, index) => (
 <li key={index}>{benefit}</li>
 ))}
 </ul>
 <h4>Risks:</h4>
 <ul>
 {currentFood.risks.map((risk, index) => (
 <li key={index} className="risk-item">{risk}</li>
 ))}
 </ul>

 <div className="form-buttons">
 <button type="submit">Save Entry</button>
 <button type="button" onClick={cancelFoodEntry}>Cancel</button>
 </div>
 </form>
 </div>
 )}
 </div>
 )}

 {activeTab === 'insights' && (
 <div className="insights-tab">
 <h2>Diet Insights</h2>
 {dietSummaries.map(summary => (
 <div key={summary.date} className="diet-summary">
 <h3>{format(new Date(summary.date), 'MMMM dd, yyyy')}</h3>
 <p>Total Calories: {summary.totalCalories} / {summary.targetCalories}</p>
 <div className="calorie-breakdown">
 <p>Breakfast: {summary.breakdown.breakfast}</p>
 <p>Lunch: {summary.breakdown.lunch}</p>
 <p>Dinner: {summary.breakdown.dinner}</p>
 <p>Snack: {summary.breakdown.snack}</p>
 </div>
 </div>
 ))}
 </div>
 )}

 {activeTab === 'profile' && (
 <div className="profile-tab">
 <h2>User Profile</h2>
 <p>Name: {userProfile.name}</p>
 <p>Age: {userProfile.age}</p>
 <p>Weight: {userProfile.weight} kg</p>
 <p>Height: {userProfile.height} cm</p>
 <p>Gender: {userProfile.gender}</p>
 <p>Target Calories: {userProfile.targetCalories}</p>
 <h4>Medical Conditions:</h4>
 <ul>
 {userProfile.medicalConditions.map((condition, index) => (
 <li key={index}>{condition}</li>
 ))}
 </ul>
 </div>
 )}

 {activeTab === 'history' && (
 <div className="history-tab">
 <h2>Food History</h2>
 {foodEntries.map(entry => (
 <div key={entry.id} className="food-entry">
 <img src={entry.imageUrl} alt={entry.name} />
 <p>{entry.name}</p>
 <p>Calories: {entry.calories}</p>
 <p>Date: {format(new Date(entry.dateTime), 'MMMM dd, yyyy, hh:mm a')}</p>
 <p>Category: {entry.category}</p>
 </div>
 ))}
 </div>
 )}
 </main>

 <footer className="app-footer">
 <p>&copy; 2024 NutriTrack</p>
 </footer>
 </div>
 );
};

export default App;