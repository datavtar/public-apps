import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Utensils,
  Calendar,
  Clock,
  Menu,
  Smile,
  FileText
} from 'lucide-react';
import styles from './styles/styles.module.css';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
  dietaryRestrictions: string[];
  image: string | null;
  favorite: boolean;
  createdAt: string;
  lastCooked: string | null;
}

interface MealPlan {
  id: string;
  date: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  notes: string;
}

interface NutritionData {
  name: string;
  value: number;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const App: React.FC = () => {
  // State Management
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [currentView, setCurrentView] = useState<'recipes' | 'mealPlanner' | 'dashboard'>('recipes');
  const [isAddingRecipe, setIsAddingRecipe] = useState<boolean>(false);
  const [isEditingRecipe, setIsEditingRecipe] = useState<boolean>(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isAddingMealPlan, setIsAddingMealPlan] = useState<boolean>(false);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDietary, setFilterDietary] = useState<string>('all');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showRecipeDetails, setShowRecipeDetails] = useState<string | null>(null);

  // Initialize with sample data if none exists
  useEffect(() => {
    const storedRecipes = localStorage.getItem('recipes');
    const storedMealPlans = localStorage.getItem('mealPlans');
    const storedDarkMode = localStorage.getItem('darkMode');

    // Set dark mode based on stored preference or system preference
    if (storedDarkMode !== null) {
      setIsDarkMode(storedDarkMode === 'true');
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }

    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    } else {
      // Sample recipes
      const sampleRecipes: Recipe[] = [
        {
          id: '1',
          name: 'Creamy Garlic Pasta',
          description: 'A delicious pasta dish with a creamy garlic sauce.',
          ingredients: [
            { id: '1-1', name: 'Pasta', quantity: '250', unit: 'g' },
            { id: '1-2', name: 'Heavy Cream', quantity: '150', unit: 'ml' },
            { id: '1-3', name: 'Garlic', quantity: '4', unit: 'cloves' },
            { id: '1-4', name: 'Parmesan', quantity: '50', unit: 'g' },
          ],
          instructions: 'Cook pasta. Saute garlic. Add cream. Mix in pasta. Top with parmesan.',
          prepTime: 10,
          cookTime: 20,
          servings: 4,
          category: 'Pasta',
          dietaryRestrictions: ['Vegetarian'],
          image: null,
          favorite: true,
          createdAt: new Date().toISOString(),
          lastCooked: null,
        },
        {
          id: '2',
          name: 'Grilled Chicken Salad',
          description: 'A healthy salad with grilled chicken and fresh vegetables.',
          ingredients: [
            { id: '2-1', name: 'Chicken Breast', quantity: '2', unit: 'pieces' },
            { id: '2-2', name: 'Mixed Greens', quantity: '200', unit: 'g' },
            { id: '2-3', name: 'Cherry Tomatoes', quantity: '10', unit: 'pieces' },
            { id: '2-4', name: 'Olive Oil', quantity: '2', unit: 'tbsp' },
          ],
          instructions: 'Grill chicken. Mix greens and tomatoes. Add chicken. Drizzle with olive oil.',
          prepTime: 15,
          cookTime: 15,
          servings: 2,
          category: 'Salad',
          dietaryRestrictions: ['Gluten-Free'],
          image: null,
          favorite: false,
          createdAt: new Date().toISOString(),
          lastCooked: new Date().toISOString(),
        },
      ];
      setRecipes(sampleRecipes);
      localStorage.setItem('recipes', JSON.stringify(sampleRecipes));
    }

    if (storedMealPlans) {
      setMealPlans(JSON.parse(storedMealPlans));
    } else {
      // Sample meal plan
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const sampleMealPlans: MealPlan[] = [
        {
          id: '1',
          date: today,
          meals: {
            breakfast: [],
            lunch: ['2'],
            dinner: ['1'],
            snacks: [],
          },
          notes: 'Sample meal plan for today',
        },
        {
          id: '2',
          date: tomorrowStr,
          meals: {
            breakfast: [],
            lunch: ['1'],
            dinner: ['2'],
            snacks: [],
          },
          notes: 'Sample meal plan for tomorrow',
        },
      ];
      setMealPlans(sampleMealPlans);
      localStorage.setItem('mealPlans', JSON.stringify(sampleMealPlans));
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Filter recipes based on search term and filters
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || recipe.category === filterCategory;
    const matchesDietary = filterDietary === 'all' || recipe.dietaryRestrictions.includes(filterDietary);
    return matchesSearch && matchesCategory && matchesDietary;
  });

  // Get unique categories and dietary restrictions for filters
  const uniqueCategories = Array.from(new Set(recipes.map(r => r.category)));
  const uniqueDietaryRestrictions = Array.from(new Set(recipes.flatMap(r => r.dietaryRestrictions)));

  // Get the meal plan for the selected date
  const selectedMealPlan = mealPlans.find(plan => plan.date === selectedDate) || {
    id: '',
    date: selectedDate,
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    notes: ''
  };

  // Calculate recipe statistics for dashboard
  const totalRecipes = recipes.length;
  const favoriteRecipes = recipes.filter(r => r.favorite).length;
  const recipesByCategory = (): NutritionData[] => {
    const categoryCounts: { [key: string]: number } = {};
    recipes.forEach(recipe => {
      if (categoryCounts[recipe.category]) {
        categoryCounts[recipe.category]++;
      } else {
        categoryCounts[recipe.category] = 1;
      }
    });
    return Object.keys(categoryCounts).map(key => ({
      name: key,
      value: categoryCounts[key],
    }));
  };

  const recipesByDietary = (): NutritionData[] => {
    const dietaryCounts: { [key: string]: number } = {};
    recipes.flatMap(r => r.dietaryRestrictions).forEach(restriction => {
      if (restriction && dietaryCounts[restriction]) {
        dietaryCounts[restriction]++;
      } else if (restriction) {
        dietaryCounts[restriction] = 1;
      }
    });
    return Object.keys(dietaryCounts).map(key => ({
      name: key,
      value: dietaryCounts[key],
    }));
  };

  // Recipe form handlers
  const handleAddRecipe = () => {
    setCurrentRecipe({
      id: Date.now().toString(),
      name: '',
      description: '',
      ingredients: [],
      instructions: '',
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      category: '',
      dietaryRestrictions: [],
      image: null,
      favorite: false,
      createdAt: new Date().toISOString(),
      lastCooked: null,
    });
    setIsAddingRecipe(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setCurrentRecipe({ ...recipe });
    setIsEditingRecipe(true);
  };

  const handleDeleteRecipe = (id: string) => {
    // Filter out the deleted recipe
    const updatedRecipes = recipes.filter(recipe => recipe.id !== id);
    setRecipes(updatedRecipes);

    // Update meal plans to remove the deleted recipe
    const updatedMealPlans = mealPlans.map(plan => {
      const updatedMeals = {
        breakfast: plan.meals.breakfast.filter(recipeId => recipeId !== id),
        lunch: plan.meals.lunch.filter(recipeId => recipeId !== id),
        dinner: plan.meals.dinner.filter(recipeId => recipeId !== id),
        snacks: plan.meals.snacks.filter(recipeId => recipeId !== id),
      };
      return { ...plan, meals: updatedMeals };
    });
    setMealPlans(updatedMealPlans);
  };

  const handleToggleFavorite = (id: string) => {
    setRecipes(recipes.map(recipe =>
      recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe
    ));
  };

  const handleAddIngredient = () => {
    if (currentRecipe) {
      setCurrentRecipe({
        ...currentRecipe,
        ingredients: [
          ...currentRecipe.ingredients,
          { id: Date.now().toString(), name: '', quantity: '', unit: '' }
        ]
      });
    }
  };

  const handleRemoveIngredient = (id: string) => {
    if (currentRecipe) {
      setCurrentRecipe({
        ...currentRecipe,
        ingredients: currentRecipe.ingredients.filter(ing => ing.id !== id)
      });
    }
  };

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: string) => {
    if (currentRecipe) {
      setCurrentRecipe({
        ...currentRecipe,
        ingredients: currentRecipe.ingredients.map(ing =>
          ing.id === id ? { ...ing, [field]: value } : ing
        )
      });
    }
  };

  const handleSubmitRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRecipe) {
      if (isEditingRecipe) {
        setRecipes(recipes.map(recipe =>
          recipe.id === currentRecipe.id ? currentRecipe : recipe
        ));
        setIsEditingRecipe(false);
      } else {
        setRecipes([...recipes, currentRecipe]);
        setIsAddingRecipe(false);
      }
      setCurrentRecipe(null);
    }
  };

  const handleCancelRecipe = () => {
    setIsAddingRecipe(false);
    setIsEditingRecipe(false);
    setCurrentRecipe(null);
  };

  // Meal Plan handlers
  const handleAddMealPlan = () => {
    const newMealPlan: MealPlan = {
      id: Date.now().toString(),
      date: selectedDate,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
      },
      notes: ''
    };
    setCurrentMealPlan(newMealPlan);
    setIsAddingMealPlan(true);
  };

  const handleAddToMealPlan = (recipeId: string, date: string, mealType: MealType) => {
    const existingPlan = mealPlans.find(plan => plan.date === date);

    if (existingPlan) {
      // Update existing plan
      const updatedPlans = mealPlans.map(plan => {
        if (plan.date === date) {
          const updatedMeals = { ...plan.meals };
          if (!updatedMeals[mealType].includes(recipeId)) {
            updatedMeals[mealType] = [...updatedMeals[mealType], recipeId];
          }
          return { ...plan, meals: updatedMeals };
        }
        return plan;
      });
      setMealPlans(updatedPlans);
    } else {
      // Create new plan
      const newPlan: MealPlan = {
        id: Date.now().toString(),
        date,
        meals: {
          breakfast: mealType === 'breakfast' ? [recipeId] : [],
          lunch: mealType === 'lunch' ? [recipeId] : [],
          dinner: mealType === 'dinner' ? [recipeId] : [],
          snacks: mealType === 'snacks' ? [recipeId] : []
        },
        notes: ''
      };
      setMealPlans([...mealPlans, newPlan]);
    }
  };

  const handleRemoveFromMealPlan = (recipeId: string, date: string, mealType: MealType) => {
    const updatedPlans = mealPlans.map(plan => {
      if (plan.date === date) {
        const updatedMeals = { ...plan.meals };
        updatedMeals[mealType] = updatedMeals[mealType].filter(id => id !== recipeId);
        return { ...plan, meals: updatedMeals };
      }
      return plan;
    });
    setMealPlans(updatedPlans);
  };

  const handleUpdateMealPlanNotes = (date: string, notes: string) => {
    const updatedPlans = mealPlans.map(plan => {
      if (plan.date === date) {
        return { ...plan, notes };
      }
      return plan;
    });
    setMealPlans(updatedPlans);
  };

  const getRecipeById = useCallback((id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  }, [recipes]);

  // Handle escape key press to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isAddingRecipe || isEditingRecipe) {
          handleCancelRecipe();
        }
        if (isAddingMealPlan) {
          setIsAddingMealPlan(false);
          setCurrentMealPlan(null);
        }
        if (showRecipeDetails) {
          setShowRecipeDetails(null);
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isAddingRecipe, isEditingRecipe, isAddingMealPlan, showRecipeDetails]);

  // Accessibility handler for closing modal with outside click
  const handleModalOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      if (isAddingRecipe || isEditingRecipe) {
        handleCancelRecipe();
      }
      if (isAddingMealPlan) {
        setIsAddingMealPlan(false);
        setCurrentMealPlan(null);
      }
      if (showRecipeDetails) {
        setShowRecipeDetails(null);
      }
    }
  };

  // Render Recipe Form
  const renderRecipeForm = () => (
    <div className="modal-backdrop" onClick={handleModalOutsideClick} role="dialog" aria-modal="true" aria-labelledby="recipe-form-title">
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="recipe-form-title" className="text-xl font-semibold">
            {isEditingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
          </h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
            onClick={handleCancelRecipe}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmitRecipe} className="mt-4">
          <div className="form-group">
            <label htmlFor="recipe-name" className="form-label">Recipe Name</label>
            <input
              id="recipe-name"
              type="text"
              className="input"
              value={currentRecipe?.name || ''}
              onChange={e => setCurrentRecipe(currentRecipe ? { ...currentRecipe, name: e.target.value } : null)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="recipe-description" className="form-label">Description</label>
            <textarea
              id="recipe-description"
              className="input"
              rows={3}
              value={currentRecipe?.description || ''}
              onChange={e => setCurrentRecipe(currentRecipe ? { ...currentRecipe, description: e.target.value } : null)}
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Ingredients</label>
            {currentRecipe?.ingredients.map((ingredient, index) => (
              <div key={ingredient.id} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  className="input flex-grow"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={e => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="input w-20"
                  placeholder="Qty"
                  value={ingredient.quantity}
                  onChange={e => handleIngredientChange(ingredient.id, 'quantity', e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="input w-20"
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={e => handleIngredientChange(ingredient.id, 'unit', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn bg-red-500 hover:bg-red-600 text-white p-2"
                  onClick={() => handleRemoveIngredient(ingredient.id)}
                  aria-label="Remove ingredient"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center gap-2"
              onClick={handleAddIngredient}
            >
              <Plus size={16} /> Add Ingredient
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="recipe-instructions" className="form-label">Instructions</label>
            <textarea
              id="recipe-instructions"
              className="input"
              rows={4}
              value={currentRecipe?.instructions || ''}
              onChange={e => setCurrentRecipe(currentRecipe ? { ...currentRecipe, instructions: e.target.value } : null)}
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="recipe-prep-time" className="form-label">Prep Time (minutes)</label>
              <input
                id="recipe-prep-time"
                type="number"
                min="0"
                className="input"
                value={currentRecipe?.prepTime || 0}
                onChange={e => setCurrentRecipe(currentRecipe ? { ...currentRecipe, prepTime: parseInt(e.target.value) || 0 } : null)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipe-cook-time" className="form-label">Cook Time (minutes)</label>
              <input
                id="recipe-cook-time"
                type="number"
                min="0"
                className="input"
                value={currentRecipe?.cookTime || 0}
                onChange={e => setCurrentRecipe(currentRecipe ? { ...currentRecipe, cookTime: parseInt(e.target.value) || 0 } : null)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipe-servings" className="form-label">Servings</label>
              <input
                id="recipe-servings"
                type="number"
                min="1"
                className="input"
                value={currentRecipe?.servings || 1}
                onChange={e => setCurrentRecipe(currentRecipe ? { ...currentRecipe, servings: parseInt(e.target.value) || 1 } : null)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label htmlFor="recipe-category" className="form-label">Category</label>
              <input
                id="recipe-category"
                type="text"
                className="input"
                value={currentRecipe?.category || ''}
                onChange={e => setCurrentRecipe(currentRecipe ? { ...currentRecipe, category: e.target.value } : null)}
                required
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {uniqueCategories.map(category => (
                  <option key={category} value={category} />
                ))}
                {['Pasta', 'Salad', 'Soup', 'Dessert', 'Breakfast', 'Main', 'Side', 'Appetizer', 'Beverage'].map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label htmlFor="recipe-dietary" className="form-label">Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-Carb'].map(restriction => (
                  <label key={restriction} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={currentRecipe?.dietaryRestrictions.includes(restriction) || false}
                      onChange={(e) => {
                        if (currentRecipe) {
                          const updatedRestrictions = e.target.checked
                            ? [...currentRecipe.dietaryRestrictions, restriction]
                            : currentRecipe.dietaryRestrictions.filter(r => r !== restriction);
                          setCurrentRecipe({ ...currentRecipe, dietaryRestrictions: updatedRestrictions });
                        }
                      }}
                    />
                    <span className="text-sm">{restriction}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              onClick={handleCancelRecipe}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {isEditingRecipe ? 'Update' : 'Save'} Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render Recipe Details
  const renderRecipeDetails = () => {
    const recipe = recipes.find(r => r.id === showRecipeDetails);
    if (!recipe) return null;
    
    return (
      <div className="modal-backdrop" onClick={handleModalOutsideClick} role="dialog" aria-modal="true" aria-labelledby="recipe-detail-title">
        <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 id="recipe-detail-title" className="text-2xl font-semibold flex items-center gap-2">
              <Utensils size={24} className="text-primary-600" />
              {recipe.name}
              {recipe.favorite && <Smile size={20} className="text-yellow-500" />}
            </h2>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
              onClick={() => setShowRecipeDetails(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mt-4 space-y-4">
            <p className="italic text-gray-600 dark:text-gray-300">{recipe.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {recipe.dietaryRestrictions.map(restriction => (
                <span key={restriction} className="badge badge-info">{restriction}</span>
              ))}
              <span className="badge badge-success">{recipe.category}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>Prep: {recipe.prepTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>Cook: {recipe.cookTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Utensils size={16} />
                <span>Serves: {recipe.servings}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Ingredients</h3>
              <ul className="list-disc list-inside space-y-1">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="text-gray-700 dark:text-gray-300">
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {recipe.instructions.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-lg font-medium mb-2">Add to Meal Plan</h3>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  className="input"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map(mealType => (
                    <button
                      key={mealType}
                      className="btn bg-primary-500 hover:bg-primary-600 text-white"
                      onClick={() => {
                        handleAddToMealPlan(recipe.id, selectedDate, mealType);
                        setShowRecipeDetails(null);
                      }}
                    >
                      Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                onClick={() => setShowRecipeDetails(null)}
              >
                Close
              </button>
              <button
                className="btn bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                onClick={() => {
                  setShowRecipeDetails(null);
                  handleEditRecipe(recipe);
                }}
              >
                <Edit size={16} /> Edit Recipe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render meal planner day
  const renderMealPlanDay = () => {
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar size={20} />
            {formattedDate}
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map(mealType => (
            <div key={mealType} className="card">
              <h3 className="text-lg font-medium capitalize mb-4">{mealType}</h3>
              
              {selectedMealPlan.meals[mealType].length > 0 ? (
                <ul className="space-y-2">
                  {selectedMealPlan.meals[mealType].map(recipeId => {
                    const recipe = getRecipeById(recipeId);
                    return recipe ? (
                      <li key={recipeId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="flex-1">
                          <span className="font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400" onClick={() => setShowRecipeDetails(recipeId)}>
                            {recipe.name}
                          </span>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {recipe.prepTime + recipe.cookTime} min | {recipe.servings} servings
                          </div>
                        </div>
                        <button 
                          className="text-red-500 hover:text-red-700 p-1"
                          onClick={() => handleRemoveFromMealPlan(recipeId, selectedDate, mealType)}
                          aria-label="Remove from meal plan"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ) : null;
                  })}
                </ul>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic text-center py-4">
                  No recipes planned for {mealType}
                </div>
              )}
              
              <div className="mt-4">
                <button 
                  className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white flex items-center justify-center gap-2 w-full"
                  onClick={() => setCurrentView('recipes')}
                >
                  <Plus size={16} /> Add Recipe to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="text-lg font-medium mb-4">Notes for the Day</h3>
          <textarea
            className="input w-full"
            rows={3}
            value={selectedMealPlan.notes}
            onChange={e => handleUpdateMealPlanNotes(selectedDate, e.target.value)}
            placeholder="Add notes for your meal plan..."
          ></textarea>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                Chef's Recipe Planner
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:static inset-0 md:inset-auto z-40 md:z-0 bg-white dark:bg-gray-800 md:w-48 lg:w-64 shadow-lg md:shadow-none transition-all duration-300 ${styles.sidebar}`}>
          <div className="p-4 h-full flex flex-col">
            <nav className="flex-1">
              <ul className="space-y-2">
                <li>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${currentView === 'recipes' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => {
                      setCurrentView('recipes');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Utensils size={20} />
                    <span>Recipes</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${currentView === 'mealPlanner' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => {
                      setCurrentView('mealPlanner');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Calendar size={20} />
                    <span>Meal Planner</span>
                  </button>
                </li>
                <li>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md flex items-center gap-2 ${currentView === 'dashboard' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    onClick={() => {
                      setCurrentView('dashboard');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FileText size={20} />
                    <span>Dashboard</span>
                  </button>
                </li>
              </ul>
            </nav>
            
            {/* Mobile menu close button */}
            <div className="md:hidden pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
              <button
                className="w-full px-4 py-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center justify-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
                <span>Close Menu</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Recipes View */}
          {currentView === 'recipes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-semibold">My Recipes</h2>
                <button
                  className="btn btn-primary flex items-center justify-center gap-2"
                  onClick={handleAddRecipe}
                >
                  <Plus size={18} />
                  Add New Recipe
                </button>
              </div>

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={18} className="text-gray-400" />
                  </div>
                  <select
                    className="input pl-10 appearance-none"
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={18} className="text-gray-400" />
                  </div>
                  <select
                    className="input pl-10 appearance-none"
                    value={filterDietary}
                    onChange={e => setFilterDietary(e.target.value)}
                  >
                    <option value="all">All Dietary Restrictions</option>
                    {uniqueDietaryRestrictions.map(restriction => (
                      <option key={restriction} value={restriction}>{restriction}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Recipe Cards */}
              {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map(recipe => (
                    <div key={recipe.id} className="card hover:shadow-md transition-shadow">
                      <div className="mb-2 flex items-start justify-between">
                        <h3 
                          className="text-lg font-medium cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 w-5/6"
                          onClick={() => setShowRecipeDetails(recipe.id)}
                        >
                          {recipe.name}
                        </h3>
                        <button 
                          className={`p-1 ${recipe.favorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-500'}`}
                          onClick={() => handleToggleFavorite(recipe.id)}
                          aria-label={recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Smile size={20} />
                        </button>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">  
                        {recipe.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="badge badge-success">{recipe.category}</span>
                        {recipe.dietaryRestrictions.slice(0, 2).map(restriction => (
                          <span key={restriction} className="badge badge-info">{restriction}</span>
                        ))}
                        {recipe.dietaryRestrictions.length > 2 && (
                          <span className="badge badge-info">+{recipe.dietaryRestrictions.length - 2} more</span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Clock size={16} className="mr-1" />
                        <span>{recipe.prepTime + recipe.cookTime} min</span>
                        <span className="mx-2">•</span>
                        <Utensils size={16} className="mr-1" />
                        <span>{recipe.servings} servings</span>
                      </div>
                      
                      <div className="flex justify-between gap-2">
                        <button
                          className="btn bg-blue-500 hover:bg-blue-600 text-white flex-1 flex items-center justify-center gap-1"
                          onClick={() => setShowRecipeDetails(recipe.id)}
                        >
                          <Eye size={16} className="inline" /> View
                        </button>
                        <button
                          className="btn bg-amber-500 hover:bg-amber-600 text-white flex-1 flex items-center justify-center gap-1"
                          onClick={() => {
                            handleAddToMealPlan(recipe.id, selectedDate, 'dinner');
                            setCurrentView('mealPlanner');
                          }}
                        >
                          <Calendar size={16} className="inline" /> Plan
                        </button>
                        <div className="relative group">
                          <button
                            className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white p-2"
                            aria-label="More options"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 hidden group-hover:block">
                            <div className="py-1">
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                onClick={() => handleEditRecipe(recipe)}
                              >
                                <Edit size={16} /> Edit Recipe
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                onClick={() => handleDeleteRecipe(recipe.id)}
                              >
                                <Trash2 size={16} /> Delete Recipe
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No recipes found. Try adjusting your filters or add a new recipe.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Meal Planner View */}
          {currentView === 'mealPlanner' && renderMealPlanDay()}

          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Recipe Dashboard</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="stat-card">
                  <div className="stat-title">Total Recipes</div>
                  <div className="stat-value">{totalRecipes}</div>
                  <div className="stat-desc">All your culinary creations</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Favorite Recipes</div>
                  <div className="stat-value">{favoriteRecipes}</div>
                  <div className="stat-desc">{Math.round((favoriteRecipes / totalRecipes) * 100) || 0}% of total recipes</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Planned Meals</div>
                  <div className="stat-value">
                    {mealPlans.reduce((acc, plan) => {
                      return acc + plan.meals.breakfast.length + plan.meals.lunch.length + 
                        plan.meals.dinner.length + plan.meals.snacks.length;
                    }, 0)}
                  </div>
                  <div className="stat-desc">Across all meal plans</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Recipes by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={recipesByCategory()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {recipesByCategory().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} recipes`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Recipes by Dietary Restriction</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={recipesByDietary()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Recipes" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-sm border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      {(isAddingRecipe || isEditingRecipe) && renderRecipeForm()}
      {showRecipeDetails && renderRecipeDetails()}
    </div>
  );
};

export default App;

function Eye(props: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size} 
      height={props.size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className || ''}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}