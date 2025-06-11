import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Search, 
  Heart, 
  Clock, 
  Users, 
  ChefHat, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Settings, 
  Trash2, 
  Star, 
  Camera, 
  ShoppingCart, 
  Calendar, 
  BookOpen, 
  Utensils, 
  Pizza, 
  Coffee, 
  Wine,
  Moon,
  Sun,
  LogOut,
  FileText,
  Tag,
  Edit,
  X,
  Check,
  ArrowLeft
} from 'lucide-react';

// Types and Interfaces
interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  image: string;
  rating: number;
  isFavorite: boolean;
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MealPlan {
  id: string;
  name: string;
  date: string;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
    snack?: Recipe;
  };
}

interface ShoppingItem {
  id: string;
  ingredient: string;
  quantity: string;
  isChecked: boolean;
  recipeId: string;
  recipeName: string;
}

interface AppSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  defaultServings: number;
  dietaryRestrictions: string[];
  favoriteCategories: string[];
}

// Dark mode hook
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

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState('browse');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    theme: 'system',
    defaultServings: 4,
    dietaryRestrictions: [],
    favoriteCategories: []
  });

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [maxCookTime, setMaxCookTime] = useState<number | null>(null);

  // UI State
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showMealPlan, setShowMealPlan] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // AI State
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Form State
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    ingredients: [''],
    instructions: [''],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'Easy',
    category: 'Main Course',
    tags: [],
    image: '/api/placeholder/400/300',
    rating: 0,
    isFavorite: false
  });

  // Sample Data
  const sampleRecipes: Recipe[] = [
    {
      id: '1',
      title: 'Classic Spaghetti Carbonara',
      description: 'Creamy Italian pasta dish with eggs, cheese, and pancetta',
      ingredients: ['400g spaghetti', '200g pancetta', '4 large eggs', '100g Pecorino Romano', 'Black pepper', 'Salt'],
      instructions: ['Boil pasta in salted water', 'Cook pancetta until crispy', 'Whisk eggs with cheese', 'Combine hot pasta with pancetta', 'Add egg mixture off heat', 'Toss quickly and serve'],
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: 'Medium',
      category: 'Italian',
      tags: ['pasta', 'italian', 'quick'],
      image: '/api/placeholder/400/300',
      rating: 4.8,
      isFavorite: false,
      nutritionInfo: { calories: 520, protein: 22, carbs: 65, fat: 18 }
    },
    {
      id: '2',
      title: 'Grilled Chicken Salad',
      description: 'Fresh and healthy salad with grilled chicken breast',
      ingredients: ['2 chicken breasts', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Red onion', 'Olive oil', 'Lemon juice'],
      instructions: ['Season and grill chicken', 'Slice chicken thinly', 'Mix salad ingredients', 'Add chicken on top', 'Drizzle with dressing'],
      prepTime: 15,
      cookTime: 15,
      servings: 2,
      difficulty: 'Easy',
      category: 'Salads',
      tags: ['healthy', 'protein', 'low-carb'],
      image: '/api/placeholder/400/300',
      rating: 4.5,
      isFavorite: true,
      nutritionInfo: { calories: 280, protein: 35, carbs: 8, fat: 12 }
    },
    {
      id: '3',
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies',
      ingredients: ['2 cups flour', '1 tsp baking soda', '1 cup butter', '3/4 cup brown sugar', '1/2 cup white sugar', '2 eggs', '2 cups chocolate chips'],
      instructions: ['Preheat oven to 375°F', 'Mix dry ingredients', 'Cream butter and sugars', 'Add eggs', 'Combine wet and dry', 'Fold in chocolate chips', 'Bake 9-11 minutes'],
      prepTime: 20,
      cookTime: 11,
      servings: 24,
      difficulty: 'Easy',
      category: 'Desserts',
      tags: ['cookies', 'dessert', 'baking'],
      image: '/api/placeholder/400/300',
      rating: 4.9,
      isFavorite: false,
      nutritionInfo: { calories: 180, protein: 2, carbs: 25, fat: 8 }
    }
  ];

  const categories = ['All', 'Italian', 'Asian', 'Mexican', 'American', 'Mediterranean', 'Indian', 'French', 'Salads', 'Desserts', 'Appetizers', 'Main Course', 'Breakfast'];

  // Load data from localStorage
  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes');
    const savedMealPlans = localStorage.getItem('mealPlans');
    const savedShoppingList = localStorage.getItem('shoppingList');
    const savedSettings = localStorage.getItem('appSettings');

    if (savedRecipes) {
      const parsedRecipes = JSON.parse(savedRecipes);
      setRecipes(parsedRecipes);
      setFilteredRecipes(parsedRecipes);
    } else {
      setRecipes(sampleRecipes);
      setFilteredRecipes(sampleRecipes);
    }

    if (savedMealPlans) {
      setMealPlans(JSON.parse(savedMealPlans));
    }

    if (savedShoppingList) {
      setShoppingList(JSON.parse(savedShoppingList));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // Filter recipes
  useEffect(() => {
    let filtered = recipes;

    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(recipe => recipe.category === selectedCategory);
    }

    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    if (maxCookTime) {
      filtered = filtered.filter(recipe => recipe.cookTime <= maxCookTime);
    }

    setFilteredRecipes(filtered);
  }, [recipes, searchQuery, selectedCategory, selectedDifficulty, maxCookTime]);

  // Recipe Management Functions
  const addRecipe = (recipe: Partial<Recipe>) => {
    const newRecipeData: Recipe = {
      id: Date.now().toString(),
      title: recipe.title || '',
      description: recipe.description || '',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      prepTime: recipe.prepTime || 15,
      cookTime: recipe.cookTime || 30,
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || 'Easy',
      category: recipe.category || 'Main Course',
      tags: recipe.tags || [],
      image: recipe.image || '/api/placeholder/400/300',
      rating: recipe.rating || 0,
      isFavorite: false,
      nutritionInfo: recipe.nutritionInfo
    };
    setRecipes(prev => [...prev, newRecipeData]);
    setShowAddRecipe(false);
    setNewRecipe({
      title: '',
      description: '',
      ingredients: [''],
      instructions: [''],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      difficulty: 'Easy',
      category: 'Main Course',
      tags: [],
      image: '/api/placeholder/400/300',
      rating: 0,
      isFavorite: false
    });
  };

  const toggleFavorite = (recipeId: string) => {
    setRecipes(prev => prev.map(recipe =>
      recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
    ));
  };

  const deleteRecipe = (recipeId: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
    if (selectedRecipe?.id === recipeId) {
      setSelectedRecipe(null);
    }
  };

  // Shopping List Functions
  const addToShoppingList = (recipe: Recipe) => {
    const newItems: ShoppingItem[] = recipe.ingredients.map(ingredient => ({
      id: `${recipe.id}-${Date.now()}-${Math.random()}`,
      ingredient,
      quantity: '1',
      isChecked: false,
      recipeId: recipe.id,
      recipeName: recipe.title
    }));
    setShoppingList(prev => [...prev, ...newItems]);
  };

  const toggleShoppingItem = (itemId: string) => {
    setShoppingList(prev => prev.map(item =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const removeFromShoppingList = (itemId: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  };

  // AI Functions
  const handleAnalyzeRecipeImage = () => {
    if (!selectedFile) {
      setAiError("Please select an image to analyze.");
      return;
    }

    const prompt = "Analyze this food image and extract recipe information. Return JSON with keys: 'title', 'description', 'ingredients' (array), 'instructions' (array), 'prepTime', 'cookTime', 'servings', 'difficulty', 'category', 'tags' (array), 'nutritionInfo' (object with calories, protein, carbs, fat)";
    
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt, selectedFile);
    } catch (error) {
      setAiError("Failed to analyze image");
    }
  };

  const handleGetCookingTips = (recipe: Recipe) => {
    const prompt = `Provide cooking tips and ingredient substitutions for ${recipe.title}. Include: cooking techniques, common mistakes to avoid, ingredient substitutions, and serving suggestions.`;
    
    setAiResult(null);
    setAiError(null);
    setShowAiModal(true);
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError("Failed to get cooking tips");
    }
  };

  // Import/Export Functions
  const exportData = () => {
    const data = {
      recipes,
      mealPlans,
      shoppingList,
      settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipe-finder-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: "Sample Recipe",
        description: "Recipe description",
        ingredients: "ingredient1;ingredient2;ingredient3",
        instructions: "step1;step2;step3",
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        difficulty: "Easy",
        category: "Main Course",
        tags: "tag1;tag2"
      }
    ];
    
    const headers = Object.keys(template[0]).join(',');
    const rows = template.map(recipe => Object.values(recipe).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipe-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          if (data.recipes) setRecipes(prev => [...prev, ...data.recipes]);
          if (data.mealPlans) setMealPlans(prev => [...prev, ...data.mealPlans]);
          if (data.shoppingList) setShoppingList(prev => [...prev, ...data.shoppingList]);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          const importedRecipes = lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = line.split(',');
            return {
              id: `imported-${Date.now()}-${index}`,
              title: values[0] || '',
              description: values[1] || '',
              ingredients: values[2]?.split(';') || [],
              instructions: values[3]?.split(';') || [],
              prepTime: parseInt(values[4]) || 15,
              cookTime: parseInt(values[5]) || 30,
              servings: parseInt(values[6]) || 4,
              difficulty: (values[7] as Recipe['difficulty']) || 'Easy',
              category: values[8] || 'Main Course',
              tags: values[9]?.split(';') || [],
              image: '/api/placeholder/400/300',
              rating: 0,
              isFavorite: false
            };
          });
          setRecipes(prev => [...prev, ...importedRecipes]);
        }
        setShowImportModal(false);
      } catch (error) {
        console.error('Import failed:', error);
      }
    };
    reader.readAsText(file);
  };

  // AI Result Handler
  useEffect(() => {
    if (aiResult && showAddRecipe) {
      try {
        const parsedResult = JSON.parse(aiResult);
        setNewRecipe(prev => ({
          ...prev,
          title: parsedResult.title || prev.title,
          description: parsedResult.description || prev.description,
          ingredients: parsedResult.ingredients || prev.ingredients,
          instructions: parsedResult.instructions || prev.instructions,
          prepTime: parsedResult.prepTime || prev.prepTime,
          cookTime: parsedResult.cookTime || prev.cookTime,
          servings: parsedResult.servings || prev.servings,
          difficulty: parsedResult.difficulty || prev.difficulty,
          category: parsedResult.category || prev.category,
          tags: parsedResult.tags || prev.tags,
          nutritionInfo: parsedResult.nutritionInfo || prev.nutritionInfo
        }));
        setAiResult(null);
      } catch (error) {
        console.error('Failed to parse AI result:', error);
      }
    }
  }, [aiResult, showAddRecipe]);

  const clearAllData = () => {
    setRecipes([]);
    setMealPlans([]);
    setShoppingList([]);
    localStorage.removeItem('recipes');
    localStorage.removeItem('mealPlans');
    localStorage.removeItem('shoppingList');
  };

  if (!currentUser) {
    return (
      <div id="welcome_fallback" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recipe Finder Pro</h1>
          <p className="text-gray-600 dark:text-gray-300">Please log in to access your recipes</p>
        </div>
      </div>
    );
  }

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container container-lg">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <h1 id="app-title" className="text-2xl font-bold text-gray-900 dark:text-white">Recipe Finder Pro</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {currentUser.first_name}</span>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container container-lg">
          <div className="flex space-x-8">
            {[
              { id: 'browse', label: 'Browse Recipes', icon: BookOpen },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'meal-plans', label: 'Meal Plans', icon: Calendar },
              { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`${id}-tab`}
                onClick={() => setActiveTab(id)}
                className={`tab ${activeTab === id ? 'tab-active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container container-lg py-8">
        {/* Browse Recipes Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div id="search-section" className="card card-padding">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search recipes, ingredients, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="select"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="select"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium">Max Cook Time:</label>
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={maxCookTime || ''}
                    onChange={(e) => setMaxCookTime(e.target.value ? parseInt(e.target.value) : null)}
                    className="input input-sm w-24"
                  />
                </div>
                <button
                  id="add-recipe-btn"
                  onClick={() => setShowAddRecipe(true)}
                  className="btn btn-primary btn-sm ml-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Recipe
                </button>
              </div>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map(recipe => (
                <div key={recipe.id} className="card card-hover group cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
                  <div className="relative">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                        recipe.isFavorite 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-white/80 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <span className={`badge ${
                        recipe.difficulty === 'Easy' ? 'badge-success' :
                        recipe.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="heading-5 mb-2">{recipe.title}</h3>
                    <p className="text-caption mb-3 line-clamp-2">{recipe.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.prepTime + recipe.cookTime}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.servings}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        {recipe.rating}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {recipe.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="badge badge-gray text-xs">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="heading-4 text-gray-500 mb-2">No recipes found</h3>
                <p className="text-gray-400">Try adjusting your search criteria or add a new recipe</p>
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="heading-3">Your Favorite Recipes</h2>
              <span className="badge badge-primary">{recipes.filter(r => r.isFavorite).length} favorites</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.filter(recipe => recipe.isFavorite).map(recipe => (
                <div key={recipe.id} className="card card-hover group cursor-pointer" onClick={() => setSelectedRecipe(recipe)}>
                  <div className="relative">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-3 right-3">
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="heading-5 mb-2">{recipe.title}</h3>
                    <p className="text-caption mb-3">{recipe.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.prepTime + recipe.cookTime}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.servings}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        {recipe.rating}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {recipes.filter(r => r.isFavorite).length === 0 && (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="heading-4 text-gray-500 mb-2">No favorite recipes yet</h3>
                <p className="text-gray-400">Start adding recipes to your favorites!</p>
              </div>
            )}
          </div>
        )}

        {/* Meal Plans Tab */}
        {activeTab === 'meal-plans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="heading-3">Meal Plans</h2>
              <button
                onClick={() => setShowMealPlan(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Create Meal Plan
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mealPlans.map(plan => (
                <div key={plan.id} className="card card-padding">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="heading-5">{plan.name}</h3>
                    <span className="text-sm text-gray-500">{plan.date}</span>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(plan.meals).map(([mealType, recipe]) => (
                      recipe && (
                        <div key={mealType} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <Utensils className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{mealType}</p>
                            <p className="font-medium">{recipe.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {recipe.prepTime + recipe.cookTime}m
                              <Users className="w-3 h-3 ml-2" />
                              {recipe.servings}
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {mealPlans.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="heading-4 text-gray-500 mb-2">No meal plans yet</h3>
                <p className="text-gray-400">Create your first meal plan to get organized!</p>
              </div>
            )}
          </div>
        )}

        {/* Shopping List Tab */}
        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="heading-3">Shopping List</h2>
              <div className="flex items-center gap-2">
                <span className="badge badge-primary">{shoppingList.filter(item => !item.isChecked).length} items</span>
                <button
                  onClick={() => setShoppingList([])}
                  className="btn btn-secondary btn-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>
            <div className="card card-padding">
              {shoppingList.length > 0 ? (
                <div className="space-y-3">
                  {shoppingList.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        checked={item.isChecked}
                        onChange={() => toggleShoppingItem(item.id)}
                        className="checkbox"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${item.isChecked ? 'line-through text-gray-500' : ''}`}>
                          {item.ingredient}
                        </p>
                        <p className="text-sm text-gray-500">From {item.recipeName}</p>
                      </div>
                      <button
                        onClick={() => removeFromShoppingList(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="heading-4 text-gray-500 mb-2">Shopping list is empty</h3>
                  <p className="text-gray-400">Add ingredients from your favorite recipes!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="heading-3">Settings</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Default Servings</label>
                    <input
                      type="number"
                      value={settings.defaultServings}
                      onChange={(e) => setSettings(prev => ({ ...prev, defaultServings: parseInt(e.target.value) || 4 }))}
                      className="input"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="select"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="it">Italian</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Data Management</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="btn btn-secondary w-full justify-start"
                  >
                    <Upload className="w-4 h-4" />
                    Import Recipes
                  </button>
                  <button
                    onClick={downloadTemplate}
                    className="btn btn-secondary w-full justify-start"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                  <button
                    onClick={exportData}
                    className="btn btn-secondary w-full justify-start"
                  >
                    <Download className="w-4 h-4" />
                    Export All Data
                  </button>
                  <button
                    onClick={clearAllData}
                    className="btn btn-error w-full justify-start"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="modal-backdrop" onClick={() => setSelectedRecipe(null)}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-4">{selectedRecipe.title}</h3>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <p className="text-body mb-4">{selectedRecipe.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Total Time</p>
                        <p className="text-sm text-gray-500">{selectedRecipe.prepTime + selectedRecipe.cookTime} minutes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Servings</p>
                        <p className="text-sm text-gray-500">{selectedRecipe.servings} people</p>
                      </div>
                    </div>
                  </div>
                  {selectedRecipe.nutritionInfo && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Nutrition (per serving)</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Calories: {selectedRecipe.nutritionInfo.calories}</div>
                        <div>Protein: {selectedRecipe.nutritionInfo.protein}g</div>
                        <div>Carbs: {selectedRecipe.nutritionInfo.carbs}g</div>
                        <div>Fat: {selectedRecipe.nutritionInfo.fat}g</div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="mb-6">
                    <h4 className="heading-5 mb-3">Ingredients</h4>
                    <ul className="space-y-2">
                      {selectedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="heading-5 mb-3">Instructions</h4>
                    <ol className="space-y-3">
                      {selectedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="w-6 h-6 bg-orange-500 text-white text-sm rounded-full flex items-center justify-center font-medium flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-body">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => handleGetCookingTips(selectedRecipe)}
                className="btn btn-secondary"
              >
                <ChefHat className="w-4 h-4" />
                Get Cooking Tips
              </button>
              <button
                onClick={() => addToShoppingList(selectedRecipe)}
                className="btn btn-secondary"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Shopping List
              </button>
              <button
                onClick={() => toggleFavorite(selectedRecipe.id)}
                className={`btn ${selectedRecipe.isFavorite ? 'btn-error' : 'btn-primary'}`}
              >
                <Heart className={`w-4 h-4 ${selectedRecipe.isFavorite ? 'fill-current' : ''}`} />
                {selectedRecipe.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipe Modal */}
      {showAddRecipe && (
        <div className="modal-backdrop" onClick={() => setShowAddRecipe(false)}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-4">Add New Recipe</h3>
              <button
                onClick={() => setShowAddRecipe(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label form-label-required">Recipe Title</label>
                    <input
                      type="text"
                      value={newRecipe.title}
                      onChange={(e) => setNewRecipe(prev => ({ ...prev, title: e.target.value }))}
                      className="input"
                      placeholder="Enter recipe title"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={newRecipe.description}
                      onChange={(e) => setNewRecipe(prev => ({ ...prev, description: e.target.value }))}
                      className="textarea"
                      placeholder="Brief description of the recipe"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label">Prep Time (min)</label>
                      <input
                        type="number"
                        value={newRecipe.prepTime}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, prepTime: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Cook Time (min)</label>
                      <input
                        type="number"
                        value={newRecipe.cookTime}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, cookTime: parseInt(e.target.value) || 0 }))}
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Servings</label>
                      <input
                        type="number"
                        value={newRecipe.servings}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Difficulty</label>
                      <select
                        value={newRecipe.difficulty}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, difficulty: e.target.value as Recipe['difficulty'] }))}
                        className="select"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        value={newRecipe.category}
                        onChange={(e) => setNewRecipe(prev => ({ ...prev, category: e.target.value }))}
                        className="select"
                      >
                        {categories.filter(cat => cat !== 'All').map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">AI Recipe Analysis</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="input"
                      />
                      <button
                        onClick={handleAnalyzeRecipeImage}
                        disabled={!selectedFile || isAiLoading}
                        className="btn btn-secondary w-full"
                      >
                        <Camera className="w-4 h-4" />
                        {isAiLoading ? 'Analyzing...' : 'Analyze Recipe Image'}
                      </button>
                      {aiError && (
                        <p className="form-error">{aiError}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Ingredients</label>
                    {newRecipe.ingredients?.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => {
                            const updatedIngredients = [...(newRecipe.ingredients || [])];
                            updatedIngredients[index] = e.target.value;
                            setNewRecipe(prev => ({ ...prev, ingredients: updatedIngredients }));
                          }}
                          className="input flex-1"
                          placeholder="Enter ingredient"
                        />
                        <button
                          onClick={() => {
                            const updatedIngredients = newRecipe.ingredients?.filter((_, i) => i !== index);
                            setNewRecipe(prev => ({ ...prev, ingredients: updatedIngredients }));
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setNewRecipe(prev => ({ 
                        ...prev, 
                        ingredients: [...(prev.ingredients || []), ''] 
                      }))}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Ingredient
                    </button>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Instructions</label>
                    {newRecipe.instructions?.map((instruction, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <textarea
                          value={instruction}
                          onChange={(e) => {
                            const updatedInstructions = [...(newRecipe.instructions || [])];
                            updatedInstructions[index] = e.target.value;
                            setNewRecipe(prev => ({ ...prev, instructions: updatedInstructions }));
                          }}
                          className="textarea flex-1"
                          placeholder={`Step ${index + 1}`}
                          rows={2}
                        />
                        <button
                          onClick={() => {
                            const updatedInstructions = newRecipe.instructions?.filter((_, i) => i !== index);
                            setNewRecipe(prev => ({ ...prev, instructions: updatedInstructions }));
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setNewRecipe(prev => ({ 
                        ...prev, 
                        instructions: [...(prev.instructions || []), ''] 
                      }))}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Step
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowAddRecipe(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => addRecipe(newRecipe)}
                disabled={!newRecipe.title?.trim()}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Tips Modal */}
      {showAiModal && (
        <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-4">AI Cooking Assistant</h3>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              {isAiLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
                  <span className="ml-3">Getting cooking tips...</span>
                </div>
              )}
              {aiError && (
                <div className="alert alert-error">
                  <p>Failed to get cooking tips. Please try again.</p>
                </div>
              )}
              {aiResult && (
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiResult}
                  </ReactMarkdown>
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> AI suggestions are for guidance only. Please use your culinary judgment and consider food safety practices.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-4">Import Recipes</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <div className="space-y-4">
                <p className="text-body">Upload a CSV or JSON file to import recipes.</p>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleImport}
                  className="input"
                />
                <div className="alert alert-info">
                  <p>For CSV files, download the template first to see the required format.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
        <div className="container container-lg text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;