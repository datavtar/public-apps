import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Filter, Search, Plus, Edit, Clock, Users, ChevronDown, ChevronUp, Moon, Sun, Download, ArrowLeft, ArrowRight, X, Menu, Save } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces
interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface Instruction {
  id: string;
  step: number;
  description: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  image: string | null;
  favorite: boolean;
  createdAt: string;
  tags: string[];
}

interface MealPlan {
  id: string;
  name: string;
  date: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  notes: string;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

const App: React.FC = () => {
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [currentView, setCurrentView] = useState<'recipes' | 'mealPlans' | 'addRecipe' | 'editRecipe' | 'addMealPlan' | 'editMealPlan' | 'viewRecipe'>('recipes');
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Load data from localStorage on mount
  useEffect(() => {
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    document.documentElement.classList.toggle('dark', savedDarkMode);

    // Load recipes
    const savedRecipes = localStorage.getItem('recipes');
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    } else {
      // Initialize with sample recipes
      setRecipes(sampleRecipes);
    }

    // Load meal plans
    const savedMealPlans = localStorage.getItem('mealPlans');
    if (savedMealPlans) {
      setMealPlans(JSON.parse(savedMealPlans));
    } else {
      // Initialize with sample meal plan
      setMealPlans(sampleMealPlans);
    }
  }, []);

  // Save recipes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  // Save meal plans to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mealPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Generate unique ID
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Filter and sort recipes
  const filteredRecipes = recipes
    .filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(recipe => filterCategory === 'All' || recipe.category === filterCategory || 
                    (filterCategory === 'Favorites' && recipe.favorite))
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  // Available categories from recipes
  const categories = ['All', 'Favorites', ...new Set(recipes.map(recipe => recipe.category))];

  // Handle recipe creation
  const handleAddRecipe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Basic recipe data
    const newRecipe: Recipe = {
      id: generateId(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      servings: parseInt(formData.get('servings') as string) || 1,
      prepTime: parseInt(formData.get('prepTime') as string) || 0,
      cookTime: parseInt(formData.get('cookTime') as string) || 0,
      difficulty: formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard',
      category: formData.get('category') as string,
      ingredients: [],
      instructions: [],
      image: null,
      favorite: false,
      createdAt: new Date().toISOString(),
      tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(tag => tag.trim()) : [],
    };

    // Process ingredients from form
    const ingredientNames = formData.getAll('ingredientName') as string[];
    const ingredientQuantities = formData.getAll('ingredientQuantity') as string[];
    const ingredientUnits = formData.getAll('ingredientUnit') as string[];

    for (let i = 0; i < ingredientNames.length; i++) {
      if (ingredientNames[i].trim()) {
        newRecipe.ingredients.push({
          id: generateId(),
          name: ingredientNames[i].trim(),
          quantity: ingredientQuantities[i] || '1',
          unit: ingredientUnits[i] || '',
        });
      }
    }

    // Process instructions from form
    const instructions = formData.getAll('instruction') as string[];
    for (let i = 0; i < instructions.length; i++) {
      if (instructions[i].trim()) {
        newRecipe.instructions.push({
          id: generateId(),
          step: i + 1,
          description: instructions[i].trim(),
        });
      }
    }

    // Handle image upload
    const imageFile = (formData.get('image') as File);
    if (imageFile && imageFile.size > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedRecipe = { ...newRecipe, image: reader.result as string };
        setRecipes([...recipes, updatedRecipe]);
      };
      reader.readAsDataURL(imageFile);
    } else {
      setRecipes([...recipes, newRecipe]);
    }

    setCurrentView('recipes');
  };

  // Handle recipe update
  const handleUpdateRecipe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentRecipe) return;

    const formData = new FormData(e.currentTarget);

    // Update recipe data
    const updatedRecipe: Recipe = {
      ...currentRecipe,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      servings: parseInt(formData.get('servings') as string) || 1,
      prepTime: parseInt(formData.get('prepTime') as string) || 0,
      cookTime: parseInt(formData.get('cookTime') as string) || 0,
      difficulty: formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard',
      category: formData.get('category') as string,
      tags: formData.get('tags') ? (formData.get('tags') as string).split(',').map(tag => tag.trim()) : [],
      ingredients: [],
      instructions: [],
    };

    // Process ingredients from form
    const ingredientNames = formData.getAll('ingredientName') as string[];
    const ingredientQuantities = formData.getAll('ingredientQuantity') as string[];
    const ingredientUnits = formData.getAll('ingredientUnit') as string[];

    for (let i = 0; i < ingredientNames.length; i++) {
      if (ingredientNames[i].trim()) {
        updatedRecipe.ingredients.push({
          id: generateId(),
          name: ingredientNames[i].trim(),
          quantity: ingredientQuantities[i] || '1',
          unit: ingredientUnits[i] || '',
        });
      }
    }

    // Process instructions from form
    const instructions = formData.getAll('instruction') as string[];
    for (let i = 0; i < instructions.length; i++) {
      if (instructions[i].trim()) {
        updatedRecipe.instructions.push({
          id: generateId(),
          step: i + 1,
          description: instructions[i].trim(),
        });
      }
    }

    // Handle image upload
    const imageFile = (formData.get('image') as File);
    if (imageFile && imageFile.size > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const finalRecipe = { ...updatedRecipe, image: reader.result as string };
        setRecipes(recipes.map(recipe => recipe.id === finalRecipe.id ? finalRecipe : recipe));
      };
      reader.readAsDataURL(imageFile);
    } else {
      setRecipes(recipes.map(recipe => recipe.id === updatedRecipe.id ? updatedRecipe : recipe));
    }

    setCurrentView('recipes');
  };

  // Delete recipe
  const deleteRecipe = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(recipes.filter(recipe => recipe.id !== id));
    }
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === id ? { ...recipe, favorite: !recipe.favorite } : recipe
    ));
  };

  // Handle meal plan creation
  const handleAddMealPlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newMealPlan: MealPlan = {
      id: generateId(),
      name: formData.get('name') as string,
      date: formData.get('date') as string,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      },
      notes: formData.get('notes') as string,
    };

    // The selected recipes for each meal type are stored as comma-separated IDs
    const breakfastIds = (formData.get('breakfast') as string || '').split(',').filter(Boolean);
    const lunchIds = (formData.get('lunch') as string || '').split(',').filter(Boolean);
    const dinnerIds = (formData.get('dinner') as string || '').split(',').filter(Boolean);
    const snacksIds = (formData.get('snacks') as string || '').split(',').filter(Boolean);

    newMealPlan.meals = {
      breakfast: breakfastIds,
      lunch: lunchIds,
      dinner: dinnerIds,
      snacks: snacksIds,
    };

    setMealPlans([...mealPlans, newMealPlan]);
    setCurrentView('mealPlans');
  };

  // Handle meal plan update
  const handleUpdateMealPlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentMealPlan) return;

    const formData = new FormData(e.currentTarget);

    const updatedMealPlan: MealPlan = {
      ...currentMealPlan,
      name: formData.get('name') as string,
      date: formData.get('date') as string,
      notes: formData.get('notes') as string,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      }
    };

    // The selected recipes for each meal type are stored as comma-separated IDs
    const breakfastIds = (formData.get('breakfast') as string || '').split(',').filter(Boolean);
    const lunchIds = (formData.get('lunch') as string || '').split(',').filter(Boolean);
    const dinnerIds = (formData.get('dinner') as string || '').split(',').filter(Boolean);
    const snacksIds = (formData.get('snacks') as string || '').split(',').filter(Boolean);

    updatedMealPlan.meals = {
      breakfast: breakfastIds,
      lunch: lunchIds,
      dinner: dinnerIds,
      snacks: snacksIds,
    };

    setMealPlans(mealPlans.map(plan => plan.id === updatedMealPlan.id ? updatedMealPlan : plan));
    setCurrentView('mealPlans');
  };

  // Delete meal plan
  const deleteMealPlan = (id: string) => {
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      setMealPlans(mealPlans.filter(plan => plan.id !== id));
    }
  };

  // Find recipe by ID
  const getRecipeById = (id: string): Recipe | undefined => {
    return recipes.find(recipe => recipe.id === id);
  };

  // Export recipe as PDF (simplified version just creates a text file)
  const exportRecipe = (recipe: Recipe) => {
    const recipeText = `
      # ${recipe.name}

      ${recipe.description}

      Servings: ${recipe.servings}
      Prep Time: ${recipe.prepTime} minutes
      Cook Time: ${recipe.cookTime} minutes
      Difficulty: ${recipe.difficulty}
      Category: ${recipe.category}

      ## Ingredients
      ${recipe.ingredients.map(ing => `- ${ing.quantity} ${ing.unit} ${ing.name}`).join('\n')}

      ## Instructions
      ${recipe.instructions.map(ins => `${ins.step}. ${ins.description}`).join('\n')}

      Tags: ${recipe.tags.join(', ')}
    `;

    // Create and download a text file
    const blob = new Blob([recipeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export meal plan
  const exportMealPlan = (mealPlan: MealPlan) => {
    let mealPlanText = `
      # ${mealPlan.name}

      Date: ${new Date(mealPlan.date).toLocaleDateString()}

      ## Breakfast
      ${mealPlan.meals.breakfast.map(id => {
        const recipe = getRecipeById(id);
        return recipe ? `- ${recipe.name}` : '';
      }).join('\n')}

      ## Lunch
      ${mealPlan.meals.lunch.map(id => {
        const recipe = getRecipeById(id);
        return recipe ? `- ${recipe.name}` : '';
      }).join('\n')}

      ## Dinner
      ${mealPlan.meals.dinner.map(id => {
        const recipe = getRecipeById(id);
        return recipe ? `- ${recipe.name}` : '';
      }).join('\n')}

      ## Snacks
      ${mealPlan.meals.snacks.map(id => {
        const recipe = getRecipeById(id);
        return recipe ? `- ${recipe.name}` : '';
      }).join('\n')}

      ## Notes
      ${mealPlan.notes}
    `;

    // Create and download a text file
    const blob = new Blob([mealPlanText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mealPlan.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Create a shopping list from meal plan
  const createShoppingList = (mealPlan: MealPlan) => {
    // Collect all recipes in the meal plan
    const recipeIds = [
      ...mealPlan.meals.breakfast,
      ...mealPlan.meals.lunch,
      ...mealPlan.meals.dinner,
      ...mealPlan.meals.snacks
    ];

    // Create a map to aggregate ingredients
    const ingredientMap = new Map<string, { quantity: number; unit: string; }>(); 

    // For each recipe, add its ingredients to the map
    recipeIds.forEach(id => {
      const recipe = getRecipeById(id);
      if (!recipe) return;

      recipe.ingredients.forEach(ingredient => {
        const key = `${ingredient.name}-${ingredient.unit}`;
        const quantity = parseFloat(ingredient.quantity) || 0;

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          if (existing) {
            existing.quantity += quantity;
          }
        } else {
          ingredientMap.set(key, { quantity, unit: ingredient.unit });
        }
      });
    });

    // Convert the map to a list
    let shoppingListText = `
      # Shopping List for ${mealPlan.name}

      Date: ${new Date(mealPlan.date).toLocaleDateString()}

      ## Ingredients
    `;

    // Add each ingredient to the text
    ingredientMap.forEach((value, key) => {
      const name = key.split('-')[0];
      shoppingListText += `- ${value.quantity} ${value.unit} ${name}\n`;
    });

    // Create and download a text file
    const blob = new Blob([shoppingListText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${mealPlan.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download recipe template
  const downloadRecipeTemplate = () => {
    const template = {
      name: 'Recipe Name',
      description: 'A brief description of the recipe',
      servings: 4,
      prepTime: 15,
      cookTime: 30,
      difficulty: 'Medium',
      category: 'Main Course',
      ingredients: [
        { name: 'Ingredient 1', quantity: '1', unit: 'cup' },
        { name: 'Ingredient 2', quantity: '2', unit: 'tbsp' }
      ],
      instructions: [
        { step: 1, description: 'First step of the recipe...' },
        { step: 2, description: 'Second step of the recipe...' }
      ],
      tags: ['quick', 'family-friendly', 'vegetarian']
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipe-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle escape key for closing modals
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentView !== 'recipes' && currentView !== 'mealPlans') {
          setCurrentView('recipes');
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [currentView]);

  // Sample recipes for initialization
  const sampleRecipes: Recipe[] = [
    {
      id: 'recipe-1',
      name: 'Classic Pasta Carbonara',
      description: 'A creamy Italian pasta dish with bacon and cheese.',
      servings: 4,
      prepTime: 10,
      cookTime: 20,
      difficulty: 'Medium',
      category: 'Main Course',
      ingredients: [
        { id: 'ing-1', name: 'Spaghetti', quantity: '400', unit: 'g' },
        { id: 'ing-2', name: 'Bacon', quantity: '200', unit: 'g' },
        { id: 'ing-3', name: 'Eggs', quantity: '3', unit: '' },
        { id: 'ing-4', name: 'Parmesan Cheese', quantity: '50', unit: 'g' },
        { id: 'ing-5', name: 'Black Pepper', quantity: '1', unit: 'tsp' },
        { id: 'ing-6', name: 'Salt', quantity: '1', unit: 'pinch' },
      ],
      instructions: [
        { id: 'step-1', step: 1, description: 'Bring a large pot of salted water to boil and cook pasta until al dente.' },
        { id: 'step-2', step: 2, description: 'Meanwhile, cook bacon in a large skillet until crispy.' },
        { id: 'step-3', step: 3, description: 'In a bowl, whisk together eggs, cheese, and pepper.' },
        { id: 'step-4', step: 4, description: 'Drain pasta and immediately add to the skillet with bacon. Remove from heat.' },
        { id: 'step-5', step: 5, description: 'Quickly pour egg mixture over pasta and stir until creamy and coated.' },
      ],
      image: null,
      favorite: true,
      createdAt: '2023-05-01T12:00:00Z',
      tags: ['italian', 'pasta', 'quick'],
    },
    {
      id: 'recipe-2',
      name: 'Avocado Toast',
      description: 'A simple and nutritious breakfast option.',
      servings: 1,
      prepTime: 5,
      cookTime: 5,
      difficulty: 'Easy',
      category: 'Breakfast',
      ingredients: [
        { id: 'ing-7', name: 'Bread', quantity: '2', unit: 'slices' },
        { id: 'ing-8', name: 'Avocado', quantity: '1', unit: '' },
        { id: 'ing-9', name: 'Lemon Juice', quantity: '1', unit: 'tsp' },
        { id: 'ing-10', name: 'Red Pepper Flakes', quantity: '1/4', unit: 'tsp' },
        { id: 'ing-11', name: 'Salt', quantity: '1', unit: 'pinch' },
      ],
      instructions: [
        { id: 'step-6', step: 1, description: 'Toast bread slices until golden brown.' },
        { id: 'step-7', step: 2, description: 'Mash avocado in a bowl with lemon juice, salt, and red pepper flakes.' },
        { id: 'step-8', step: 3, description: 'Spread avocado mixture on toasted bread.' },
      ],
      image: null,
      favorite: false,
      createdAt: '2023-05-05T08:30:00Z',
      tags: ['breakfast', 'healthy', 'vegetarian'],
    },
    {
      id: 'recipe-3',
      name: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies that are soft and chewy.',
      servings: 24,
      prepTime: 15,
      cookTime: 12,
      difficulty: 'Easy',
      category: 'Dessert',
      ingredients: [
        { id: 'ing-12', name: 'All-Purpose Flour', quantity: '2 1/4', unit: 'cups' },
        { id: 'ing-13', name: 'Baking Soda', quantity: '1', unit: 'tsp' },
        { id: 'ing-14', name: 'Salt', quantity: '1', unit: 'tsp' },
        { id: 'ing-15', name: 'Butter', quantity: '1', unit: 'cup' },
        { id: 'ing-16', name: 'Brown Sugar', quantity: '3/4', unit: 'cup' },
        { id: 'ing-17', name: 'Granulated Sugar', quantity: '3/4', unit: 'cup' },
        { id: 'ing-18', name: 'Vanilla Extract', quantity: '1', unit: 'tsp' },
        { id: 'ing-19', name: 'Eggs', quantity: '2', unit: '' },
        { id: 'ing-20', name: 'Chocolate Chips', quantity: '2', unit: 'cups' },
      ],
      instructions: [
        { id: 'step-9', step: 1, description: 'Preheat oven to 375°F (190°C).' },
        { id: 'step-10', step: 2, description: 'In a small bowl, mix flour, baking soda, and salt.' },
        { id: 'step-11', step: 3, description: 'In a large bowl, cream together butter and sugars until smooth.' },
        { id: 'step-12', step: 4, description: 'Beat in vanilla and eggs one at a time.' },
        { id: 'step-13', step: 5, description: 'Gradually blend in the dry ingredients.' },
        { id: 'step-14', step: 6, description: 'Stir in chocolate chips.' },
        { id: 'step-15', step: 7, description: 'Drop by rounded tablespoons onto ungreased cookie sheets.' },
        { id: 'step-16', step: 8, description: 'Bake for 9 to 11 minutes or until golden brown.' },
        { id: 'step-17', step: 9, description: 'Let stand for 2 minutes before removing to cool on wire racks.' },
      ],
      image: null,
      favorite: true,
      createdAt: '2023-04-15T14:20:00Z',
      tags: ['dessert', 'baking', 'cookies'],
    },
  ];

  // Sample meal plan for initialization
  const sampleMealPlans: MealPlan[] = [
    {
      id: 'plan-1',
      name: 'Weekday Meal Plan',
      date: '2023-06-01',
      meals: {
        breakfast: ['recipe-2'],
        lunch: ['recipe-1'],
        dinner: ['recipe-3'],
        snacks: [],
      },
      notes: 'Keep it simple with easy recipes for a busy week.',
    },
  ];

  // Render functions for different views
  const renderRecipesList = () => (
    <div className="container-fluid py-6">
      <div className="flex-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">My Recipe Collection</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentView('addRecipe')} 
            className="btn btn-primary flex-center gap-2"
            aria-label="Add new recipe"
          >
            <Plus size={18} />
            <span className="responsive-hide">New Recipe</span>
          </button>
          <button 
            onClick={() => setCurrentView('mealPlans')} 
            className="btn bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 flex-center gap-2"
            aria-label="View meal plans"
          >
            <span className="responsive-hide">Meal Plans</span>
          </button>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search recipes"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={18} className="text-gray-400" />
            </div>
            <select
              className="input pl-10 pr-8 appearance-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter by category"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
          
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-center gap-2"
            aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Recipe cards */}
      {filteredRecipes.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">No recipes found. Add your first recipe!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="card hover:shadow-lg transition-shadow">
              {recipe.image && (
                <div className="w-full h-48 mb-4 overflow-hidden rounded-md">
                  <img 
                    src={recipe.image} 
                    alt={recipe.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-between mb-2">
                <h3 className="text-xl font-semibold">{recipe.name}</h3>
                <button 
                  onClick={() => toggleFavorite(recipe.id)}
                  className={`${recipe.favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors`}
                  aria-label={recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={20} fill={recipe.favorite ? 'currentColor' : 'none'} />
                </button>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{recipe.description}</p>
              
              <div className="flex gap-2 mb-3 flex-wrap">
                {recipe.tags.map(tag => (
                  <span key={tag} className="badge badge-info">{tag}</span>
                ))}
              </div>
              
              <div className="flex gap-3 mb-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{recipe.prepTime + recipe.cookTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{recipe.servings}</span>
                </div>
              </div>
              
              <div className="flex-between gap-2">
                <button 
                  onClick={() => {
                    setCurrentRecipe(recipe);
                    setCurrentView('viewRecipe');
                  }}
                  className="btn bg-primary-50 text-primary-700 hover:bg-primary-100 flex-1"
                  aria-label={`View ${recipe.name} recipe details`}
                >
                  View Details
                </button>
                <button 
                  onClick={() => {
                    setCurrentRecipe(recipe);
                    setCurrentView('editRecipe');
                  }}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 p-2"
                  aria-label={`Edit ${recipe.name}`}
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => deleteRecipe(recipe.id)}
                  className="btn bg-red-50 text-red-600 hover:bg-red-100 p-2"
                  aria-label={`Delete ${recipe.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMealPlansList = () => (
    <div className="container-fluid py-6">
      <div className="flex-between mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold">My Meal Plans</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentView('addMealPlan')} 
            className="btn btn-primary flex-center gap-2"
            aria-label="Create new meal plan"
          >
            <Plus size={18} />
            <span className="responsive-hide">New Meal Plan</span>
          </button>
          <button 
            onClick={() => setCurrentView('recipes')} 
            className="btn bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 flex-center gap-2"
            aria-label="View recipes"
          >
            <span className="responsive-hide">Recipes</span>
          </button>
        </div>
      </div>

      {/* Meal plan cards */}
      {mealPlans.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400">No meal plans found. Create your first meal plan!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealPlans.map(plan => (
            <div key={plan.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex-between mb-4">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(plan.date).toLocaleDateString()}
                </div>
              </div>
              
              {/* Meals section */}
              <div className="space-y-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Breakfast</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm pl-2">
                    {plan.meals.breakfast.length === 0 ? (
                      <li className="text-gray-400 dark:text-gray-500">No breakfast recipes</li>
                    ) : (
                      plan.meals.breakfast.map(id => {
                        const recipe = getRecipeById(id);
                        return recipe ? <li key={id}>{recipe.name}</li> : null;
                      })
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Lunch</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm pl-2">
                    {plan.meals.lunch.length === 0 ? (
                      <li className="text-gray-400 dark:text-gray-500">No lunch recipes</li>
                    ) : (
                      plan.meals.lunch.map(id => {
                        const recipe = getRecipeById(id);
                        return recipe ? <li key={id}>{recipe.name}</li> : null;
                      })
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Dinner</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm pl-2">
                    {plan.meals.dinner.length === 0 ? (
                      <li className="text-gray-400 dark:text-gray-500">No dinner recipes</li>
                    ) : (
                      plan.meals.dinner.map(id => {
                        const recipe = getRecipeById(id);
                        return recipe ? <li key={id}>{recipe.name}</li> : null;
                      })
                    )}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Snacks</h4>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm pl-2">
                    {plan.meals.snacks.length === 0 ? (
                      <li className="text-gray-400 dark:text-gray-500">No snack recipes</li>
                    ) : (
                      plan.meals.snacks.map(id => {
                        const recipe = getRecipeById(id);
                        return recipe ? <li key={id}>{recipe.name}</li> : null;
                      })
                    )}
                  </ul>
                </div>
              </div>
              
              {plan.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic">{plan.notes}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setCurrentMealPlan(plan);
                    setCurrentView('editMealPlan');
                  }}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
                  aria-label={`Edit ${plan.name}`}
                >
                  <Edit size={16} className="mr-1" />
                  Edit
                </button>
                <button 
                  onClick={() => exportMealPlan(plan)}
                  className="btn bg-primary-50 text-primary-700 hover:bg-primary-100 flex-1"
                  aria-label={`Export ${plan.name}`}
                >
                  <Download size={16} className="mr-1" />
                  Export
                </button>
                <button 
                  onClick={() => createShoppingList(plan)}
                  className="btn bg-secondary-50 text-secondary-700 hover:bg-secondary-100 flex-1"
                  aria-label={`Create shopping list for ${plan.name}`}
                >
                  <Save size={16} className="mr-1" />
                  Shopping List
                </button>
                <button 
                  onClick={() => deleteMealPlan(plan.id)}
                  className="btn bg-red-50 text-red-600 hover:bg-red-100 p-2"
                  aria-label={`Delete ${plan.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRecipeForm = (isEditing: boolean = false) => {
    const recipe = isEditing ? currentRecipe : null;
    return (
      <div className="container-narrow py-6">
        <div className="flex-between mb-6">
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Recipe' : 'Add New Recipe'}</h1>
          <button 
            onClick={() => setCurrentView('recipes')} 
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-center gap-1"
            aria-label="Cancel and return to recipes"
          >
            <X size={18} />
            <span className="responsive-hide">Cancel</span>
          </button>
        </div>
        
        <div className="card mb-4">
          <form onSubmit={isEditing ? handleUpdateRecipe : handleAddRecipe} className="space-y-6">
            {/* Basic Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Details</h2>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">Recipe Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="input" 
                  defaultValue={recipe?.name || ''}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description" className="form-label">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  className="input h-24" 
                  defaultValue={recipe?.description || ''}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label htmlFor="servings" className="form-label">Servings</label>
                  <input 
                    type="number" 
                    id="servings" 
                    name="servings" 
                    className="input" 
                    min="1" 
                    defaultValue={recipe?.servings || 4}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="prepTime" className="form-label">Prep Time (mins)</label>
                  <input 
                    type="number" 
                    id="prepTime" 
                    name="prepTime" 
                    className="input" 
                    min="0" 
                    defaultValue={recipe?.prepTime || 10}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="cookTime" className="form-label">Cook Time (mins)</label>
                  <input 
                    type="number" 
                    id="cookTime" 
                    name="cookTime" 
                    className="input" 
                    min="0" 
                    defaultValue={recipe?.cookTime || 20}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="difficulty" className="form-label">Difficulty</label>
                  <select 
                    id="difficulty" 
                    name="difficulty" 
                    className="input" 
                    defaultValue={recipe?.difficulty || 'Medium'}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <input 
                    type="text" 
                    id="category" 
                    name="category" 
                    className="input" 
                    list="categories"
                    defaultValue={recipe?.category || ''}
                    placeholder="E.g., Main Course, Dessert, etc."
                  />
                  <datalist id="categories">
                    {[...new Set(recipes.map(r => r.category))].map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="tags" className="form-label">Tags (comma separated)</label>
                <input 
                  type="text" 
                  id="tags" 
                  name="tags" 
                  className="input" 
                  defaultValue={recipe?.tags.join(', ') || ''}
                  placeholder="E.g., vegetarian, spicy, quick"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image" className="form-label">Recipe Image</label>
                <input 
                  type="file" 
                  id="image" 
                  name="image" 
                  accept="image/*"
                  className="input pt-2" 
                />
                {recipe?.image && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-1">Current Image:</p>
                    <img 
                      src={recipe.image} 
                      alt={recipe.name} 
                      className="w-32 h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Ingredients</h2>
              <div id="ingredients" className="space-y-3">
                {/* First row always visible */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="sm:w-2/5">
                    <label htmlFor="ingredientName0" className="form-label">Name *</label>
                    <input 
                      type="text" 
                      id="ingredientName0" 
                      name="ingredientName" 
                      className="input" 
                      defaultValue={recipe?.ingredients[0]?.name || ''}
                      required
                    />
                  </div>
                  <div className="sm:w-1/5">
                    <label htmlFor="ingredientQuantity0" className="form-label">Quantity</label>
                    <input 
                      type="text" 
                      id="ingredientQuantity0" 
                      name="ingredientQuantity" 
                      className="input" 
                      defaultValue={recipe?.ingredients[0]?.quantity || ''}
                    />
                  </div>
                  <div className="sm:w-1/5">
                    <label htmlFor="ingredientUnit0" className="form-label">Unit</label>
                    <input 
                      type="text" 
                      id="ingredientUnit0" 
                      name="ingredientUnit" 
                      className="input" 
                      defaultValue={recipe?.ingredients[0]?.unit || ''}
                      list="units"
                    />
                    <datalist id="units">
                      {['g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'pinch', 'slice', 'piece'].map(unit => (
                        <option key={unit} value={unit} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Dynamic ingredient rows */}
                {recipe ? (
                  // For editing: show all existing ingredients
                  recipe.ingredients.slice(1).map((ing, idx) => (
                    <div key={ing.id} className="flex flex-col sm:flex-row gap-2">
                      <div className="sm:w-2/5">
                        <input 
                          type="text" 
                          id={`ingredientName${idx+1}`}
                          name="ingredientName" 
                          className="input" 
                          defaultValue={ing.name}
                        />
                      </div>
                      <div className="sm:w-1/5">
                        <input 
                          type="text" 
                          id={`ingredientQuantity${idx+1}`}
                          name="ingredientQuantity" 
                          className="input" 
                          defaultValue={ing.quantity}
                        />
                      </div>
                      <div className="sm:w-1/5">
                        <input 
                          type="text" 
                          id={`ingredientUnit${idx+1}`}
                          name="ingredientUnit" 
                          className="input" 
                          defaultValue={ing.unit}
                          list="units"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  // For adding: show 2 more empty rows
                  Array(2).fill(null).map((_, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-2">
                      <div className="sm:w-2/5">
                        <input 
                          type="text" 
                          id={`ingredientName${idx+1}`}
                          name="ingredientName" 
                          className="input" 
                        />
                      </div>
                      <div className="sm:w-1/5">
                        <input 
                          type="text" 
                          id={`ingredientQuantity${idx+1}`}
                          name="ingredientQuantity" 
                          className="input" 
                        />
                      </div>
                      <div className="sm:w-1/5">
                        <input 
                          type="text" 
                          id={`ingredientUnit${idx+1}`}
                          name="ingredientUnit" 
                          className="input" 
                          list="units"
                        />
                      </div>
                    </div>
                  ))
                )}

                {/* Add more ingredients button */}
                <button 
                  type="button"
                  onClick={() => {
                    const container = document.getElementById('ingredients');
                    if (!container) return;
                    
                    const newIndex = container.children.length;
                    const newRow = document.createElement('div');
                    newRow.className = 'flex flex-col sm:flex-row gap-2';
                    newRow.innerHTML = `
                      <div class="sm:w-2/5">
                        <input type="text" id="ingredientName${newIndex}" name="ingredientName" class="input" />
                      </div>
                      <div class="sm:w-1/5">
                        <input type="text" id="ingredientQuantity${newIndex}" name="ingredientQuantity" class="input" />
                      </div>
                      <div class="sm:w-1/5">
                        <input type="text" id="ingredientUnit${newIndex}" name="ingredientUnit" class="input" list="units" />
                      </div>
                    `;
                    container.appendChild(newRow);
                  }}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-center gap-1"
                  aria-label="Add another ingredient"
                >
                  <Plus size={16} />
                  Add Another Ingredient
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Instructions</h2>
              <div id="instructions" className="space-y-3">
                {/* First instruction always visible */}
                <div className="form-group">
                  <label htmlFor="instruction0" className="form-label">Step 1 *</label>
                  <textarea 
                    id="instruction0" 
                    name="instruction" 
                    className="input h-20" 
                    defaultValue={recipe?.instructions[0]?.description || ''}
                    required
                  />
                </div>

                {/* Dynamic instruction rows */}
                {recipe ? (
                  // For editing: show all existing instructions
                  recipe.instructions.slice(1).map((inst, idx) => (
                    <div key={inst.id} className="form-group">
                      <label htmlFor={`instruction${idx+1}`} className="form-label">Step {idx+2}</label>
                      <textarea 
                        id={`instruction${idx+1}`}
                        name="instruction" 
                        className="input h-20" 
                        defaultValue={inst.description}
                      />
                    </div>
                  ))
                ) : (
                  // For adding: show 1 more empty row
                  <div className="form-group">
                    <label htmlFor="instruction1" className="form-label">Step 2</label>
                    <textarea 
                      id="instruction1" 
                      name="instruction" 
                      className="input h-20" 
                    />
                  </div>
                )}

                {/* Add more instructions button */}
                <button 
                  type="button"
                  onClick={() => {
                    const container = document.getElementById('instructions');
                    if (!container) return;
                    
                    const newIndex = container.children.length;
                    const newRow = document.createElement('div');
                    newRow.className = 'form-group';
                    newRow.innerHTML = `
                      <label for="instruction${newIndex}" class="form-label">Step ${newIndex + 1}</label>
                      <textarea id="instruction${newIndex}" name="instruction" class="input h-20"></textarea>
                    `;
                    container.appendChild(newRow);
                  }}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-center gap-1"
                  aria-label="Add another instruction step"
                >
                  <Plus size={16} />
                  Add Another Step
                </button>
              </div>
            </div>

            {/* Template download */}
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={downloadRecipeTemplate}
                className="btn bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm"
                aria-label="Download recipe template"
              >
                <Download size={14} className="mr-1" />
                Download Template
              </button>
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                className="btn btn-primary"
                aria-label={isEditing ? 'Save recipe changes' : 'Add new recipe'}
              >
                {isEditing ? 'Save Changes' : 'Add Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  const renderMealPlanForm = (isEditing: boolean = false) => {
    const mealPlan = isEditing ? currentMealPlan : null;
    
    return (
      <div className="container-narrow py-6">
        <div className="flex-between mb-6">
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Meal Plan' : 'Create Meal Plan'}</h1>
          <button 
            onClick={() => setCurrentView('mealPlans')} 
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-center gap-1"
            aria-label="Cancel and return to meal plans"
          >
            <X size={18} />
            <span className="responsive-hide">Cancel</span>
          </button>
        </div>
        
        <div className="card mb-4">
          <form onSubmit={isEditing ? handleUpdateMealPlan : handleAddMealPlan} className="space-y-6">
            {/* Basic Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Details</h2>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">Meal Plan Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="input" 
                  defaultValue={mealPlan?.name || ''}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date" className="form-label">Date *</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  className="input" 
                  defaultValue={mealPlan?.date || new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea 
                  id="notes" 
                  name="notes" 
                  className="input h-24" 
                  defaultValue={mealPlan?.notes || ''}
                  placeholder="Any additional notes for this meal plan..."
                />
              </div>
            </div>

            {/* Meal Selections */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Meal Selections</h2>
              
              {/* Helper function to render meal type selection */}
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealType[]).map(mealType => {
                const selectedRecipeIds = mealPlan?.meals[mealType] || [];
                
                return (
                  <div key={mealType} className="form-group">
                    <label htmlFor={mealType} className="form-label capitalize">{mealType}</label>
                    <div className="relative">
                      <select 
                        id={`${mealType}-select`}
                        className="input pr-10"
                        multiple
                        size={4}
                        onChange={(e) => {
                          // Get all selected options
                          const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                          
                          // Update the hidden input with comma-separated IDs
                          const hiddenInput = document.getElementById(mealType) as HTMLInputElement;
                          if (hiddenInput) {
                            hiddenInput.value = selectedOptions.join(',');
                          }
                        }}
                        aria-label={`Select recipes for ${mealType}`}
                      >
                        {recipes.map(recipe => (
                          <option 
                            key={recipe.id} 
                            value={recipe.id}
                            selected={selectedRecipeIds.includes(recipe.id)}
                          >
                            {recipe.name}
                          </option>
                        ))}
                      </select>
                      
                      {/* Hidden input to store selected recipe IDs */}
                      <input 
                        type="hidden" 
                        id={mealType} 
                        name={mealType} 
                        defaultValue={selectedRecipeIds.join(',')}
                      />
                      
                      <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple recipes</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                className="btn btn-primary"
                aria-label={isEditing ? 'Save meal plan changes' : 'Create meal plan'}
              >
                {isEditing ? 'Save Changes' : 'Create Meal Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderRecipeDetails = () => {
    if (!currentRecipe) return null;
    
    return (
      <div className="container-narrow py-6">
        <div className="flex-between mb-6">
          <button 
            onClick={() => setCurrentView('recipes')} 
            className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-center gap-1"
            aria-label="Back to recipes"
          >
            <ArrowLeft size={18} />
            <span className="responsive-hide">Back</span>
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setCurrentView('editRecipe');
              }}
              className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-center gap-1"
              aria-label={`Edit ${currentRecipe.name}`}
            >
              <Edit size={18} />
              <span className="responsive-hide">Edit</span>
            </button>
            <button 
              onClick={() => exportRecipe(currentRecipe)}
              className="btn bg-primary-50 text-primary-700 hover:bg-primary-100 flex-center gap-1"
              aria-label={`Export ${currentRecipe.name}`}
            >
              <Download size={18} />
              <span className="responsive-hide">Export</span>
            </button>
          </div>
        </div>
        
        <div className="card mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{currentRecipe.name}</h1>
            <button 
              onClick={() => toggleFavorite(currentRecipe.id)}
              className={`${currentRecipe.favorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors p-1`}
              aria-label={currentRecipe.favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={24} fill={currentRecipe.favorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          {currentRecipe.image && (
            <div className="w-full h-64 mb-6 overflow-hidden rounded-md">
              <img 
                src={currentRecipe.image} 
                alt={currentRecipe.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">{currentRecipe.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {currentRecipe.tags.map(tag => (
              <span key={tag} className="badge badge-info">{tag}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Servings</span>
              <span className="text-xl font-semibold">{currentRecipe.servings}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Prep Time</span>
              <span className="text-xl font-semibold">{currentRecipe.prepTime} min</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Cook Time</span>
              <span className="text-xl font-semibold">{currentRecipe.cookTime} min</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Difficulty</span>
              <span className="text-xl font-semibold">{currentRecipe.difficulty}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Ingredients</h2>
            <ul className="list-none space-y-2">
              {currentRecipe.ingredients.map(ingredient => (
                <li key={ingredient.id} className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900 flex-center mr-3 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary-500"></div>
                  </div>
                  <span className="text-gray-800 dark:text-gray-200">
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <ol className="list-none space-y-4">
              {currentRecipe.instructions.map(instruction => (
                <li key={instruction.id} className="flex">
                  <div className="h-8 w-8 rounded-full bg-primary-500 flex-center text-white font-semibold mr-3 shrink-0">
                    {instruction.step}
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 pt-1">{instruction.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  };

  // Mobile navigation toggle
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className={`min-h-screen theme-transition-all ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-3">
          <div className="flex-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMobileMenu}
                className="md:hidden btn bg-transparent p-2"
                aria-label="Toggle mobile menu"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Chef's Planner</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Desktop navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <button 
                  onClick={() => setCurrentView('recipes')} 
                  className={`text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 ${currentView === 'recipes' || currentView === 'addRecipe' || currentView === 'editRecipe' || currentView === 'viewRecipe' ? 'font-semibold text-primary-600 dark:text-primary-400' : ''}`}
                  aria-label="View recipes"
                >
                  Recipes
                </button>
                <button 
                  onClick={() => setCurrentView('mealPlans')} 
                  className={`text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 ${currentView === 'mealPlans' || currentView === 'addMealPlan' || currentView === 'editMealPlan' ? 'font-semibold text-primary-600 dark:text-primary-400' : ''}`}
                  aria-label="View meal plans"
                >
                  Meal Plans
                </button>
              </nav>
              
              {/* Dark mode toggle */}
              <button 
                onClick={toggleDarkMode} 
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4">
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => {
                  setCurrentView('recipes');
                  setMobileMenuOpen(false);
                }} 
                className={`text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${currentView === 'recipes' || currentView === 'addRecipe' || currentView === 'editRecipe' || currentView === 'viewRecipe' ? 'font-semibold text-primary-600 dark:text-primary-400' : ''}`}
                aria-label="View recipes"
              >
                Recipes
              </button>
              <button 
                onClick={() => {
                  setCurrentView('mealPlans');
                  setMobileMenuOpen(false);
                }} 
                className={`text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${currentView === 'mealPlans' || currentView === 'addMealPlan' || currentView === 'editMealPlan' ? 'font-semibold text-primary-600 dark:text-primary-400' : ''}`}
                aria-label="View meal plans"
              >
                Meal Plans
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="pb-16">
        {currentView === 'recipes' && renderRecipesList()}
        {currentView === 'mealPlans' && renderMealPlansList()}
        {currentView === 'addRecipe' && renderRecipeForm()}
        {currentView === 'editRecipe' && renderRecipeForm(true)}
        {currentView === 'addMealPlan' && renderMealPlanForm()}
        {currentView === 'editMealPlan' && renderMealPlanForm(true)}
        {currentView === 'viewRecipe' && renderRecipeDetails()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400 w-full fixed bottom-0">
        <div className="container-fluid">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;