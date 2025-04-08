import React, { useState, useEffect, useRef } from 'react';
import {
  User, Calendar, Plus, Trash2, Edit, Search, Filter, ChevronDown, ChevronUp, Dumbbell,
  Utensils, TrendingUp, ArrowLeft, ArrowRight, Scale, UserRound
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  // Types and Interfaces
  interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: string;
    age: number;
    height: number;
    image?: string;
    startDate: string;
    goals: string;
  }

  interface Measurement {
    id: string;
    clientId: string;
    date: string;
    weight: number;
    bodyFat?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  }

  interface Meal {
    id: string;
    clientId: string;
    date: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    food: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    notes?: string;
  }

  interface Workout {
    id: string;
    clientId: string;
    date: string;
    type: string;
    duration: number;
    exercises: Exercise[];
    notes?: string;
  }

  interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }

  type TabType = 'clients' | 'nutrition' | 'workouts' | 'measurements' | 'dashboard';

  // State
  const [clients, setClients] = useState<Client[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('clients');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState<boolean>(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState<boolean>(false);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [temporaryExercises, setTemporaryExercises] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string; direction: 'ascending' | 'descending'} | null>(null);

  // Refs
  const clientModalRef = useRef<HTMLDivElement>(null);
  const measurementModalRef = useRef<HTMLDivElement>(null);
  const mealModalRef = useRef<HTMLDivElement>(null);
  const workoutModalRef = useRef<HTMLDivElement>(null);

  // Effect for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Load data from localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('clients');
    const savedMeasurements = localStorage.getItem('measurements');
    const savedMeals = localStorage.getItem('meals');
    const savedWorkouts = localStorage.getItem('workouts');

    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedMeasurements) setMeasurements(JSON.parse(savedMeasurements));
    if (savedMeals) setMeals(JSON.parse(savedMeals));
    if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts));

    // Add sample data if none exists
    if (!savedClients) {
      const sampleClients: Client[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '555-1234',
          gender: 'male',
          age: 30,
          height: 180,
          startDate: '2023-01-15',
          goals: 'Lose 10kg and build muscle'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '555-5678',
          gender: 'female',
          age: 28,
          height: 165,
          startDate: '2023-02-20',
          goals: 'Tone up and improve fitness'
        }
      ];
      setClients(sampleClients);
      localStorage.setItem('clients', JSON.stringify(sampleClients));

      // Add sample measurements
      const sampleMeasurements: Measurement[] = [
        {
          id: '1',
          clientId: '1',
          date: '2023-01-15',
          weight: 85,
          bodyFat: 22,
          chest: 105,
          waist: 92,
          hips: 102,
          arms: 35,
          thighs: 60
        },
        {
          id: '2',
          clientId: '1',
          date: '2023-02-15',
          weight: 83,
          bodyFat: 21,
          chest: 104,
          waist: 90,
          hips: 100,
          arms: 36,
          thighs: 59
        },
        {
          id: '3',
          clientId: '2',
          date: '2023-02-20',
          weight: 65,
          bodyFat: 25,
          chest: 88,
          waist: 75,
          hips: 95,
          arms: 28,
          thighs: 55
        },
        {
          id: '4',
          clientId: '2',
          date: '2023-03-20',
          weight: 64,
          bodyFat: 24,
          chest: 87,
          waist: 73,
          hips: 94,
          arms: 29,
          thighs: 54
        }
      ];
      setMeasurements(sampleMeasurements);
      localStorage.setItem('measurements', JSON.stringify(sampleMeasurements));

      // Add sample meals
      const sampleMeals: Meal[] = [
        {
          id: '1',
          clientId: '1',
          date: '2023-02-15',
          mealType: 'breakfast',
          food: 'Oatmeal with banana and honey',
          calories: 450,
          protein: 15,
          carbs: 70,
          fats: 8,
          notes: 'Client enjoyed this meal.'
        },
        {
          id: '2',
          clientId: '1',
          date: '2023-02-15',
          mealType: 'lunch',
          food: 'Grilled chicken salad',
          calories: 520,
          protein: 40,
          carbs: 25,
          fats: 25
        },
        {
          id: '3',
          clientId: '2',
          date: '2023-03-20',
          mealType: 'breakfast',
          food: 'Greek yogurt with berries',
          calories: 320,
          protein: 20,
          carbs: 35,
          fats: 10
        }
      ];
      setMeals(sampleMeals);
      localStorage.setItem('meals', JSON.stringify(sampleMeals));

      // Add sample workouts
      const sampleWorkouts: Workout[] = [
        {
          id: '1',
          clientId: '1',
          date: '2023-02-16',
          type: 'Strength',
          duration: 60,
          exercises: [
            {
              id: '1',
              name: 'Bench Press',
              sets: 3,
              reps: 10,
              weight: 60
            },
            {
              id: '2',
              name: 'Squat',
              sets: 3,
              reps: 12,
              weight: 80
            }
          ],
          notes: 'Good form on all exercises.'
        },
        {
          id: '2',
          clientId: '2',
          date: '2023-03-21',
          type: 'Cardio',
          duration: 45,
          exercises: [
            {
              id: '3',
              name: 'Treadmill',
              sets: 1,
              reps: 1,
              weight: 0
            }
          ],
          notes: 'Maintained target heart rate for 30 minutes.'
        }
      ];
      setWorkouts(sampleWorkouts);
      localStorage.setItem('workouts', JSON.stringify(sampleWorkouts));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('measurements', JSON.stringify(measurements));
  }, [measurements]);

  useEffect(() => {
    localStorage.setItem('meals', JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Modal click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isClientModalOpen && clientModalRef.current && 
          !clientModalRef.current.contains(event.target as Node)) {
        setIsClientModalOpen(false);
        setEditingClient(null);
      }
      if (isMeasurementModalOpen && measurementModalRef.current && 
          !measurementModalRef.current.contains(event.target as Node)) {
        setIsMeasurementModalOpen(false);
        setEditingMeasurement(null);
      }
      if (isMealModalOpen && mealModalRef.current && 
          !mealModalRef.current.contains(event.target as Node)) {
        setIsMealModalOpen(false);
        setEditingMeal(null);
      }
      if (isWorkoutModalOpen && workoutModalRef.current && 
          !workoutModalRef.current.contains(event.target as Node)) {
        setIsWorkoutModalOpen(false);
        setEditingWorkout(null);
        setTemporaryExercises([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isClientModalOpen, isMeasurementModalOpen, isMealModalOpen, isWorkoutModalOpen]);

  // Helper Functions
  const closeAllModals = () => {
    setIsClientModalOpen(false);
    setIsMeasurementModalOpen(false);
    setIsMealModalOpen(false);
    setIsWorkoutModalOpen(false);
    setEditingClient(null);
    setEditingMeasurement(null);
    setEditingMeal(null);
    setEditingWorkout(null);
    setTemporaryExercises([]);
  };

  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
  };

  const getClientNameById = (id: string): string => {
    const client = clients.find(client => client.id === id);
    return client ? client.name : 'Unknown Client';
  };

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const phoneInput = form.elements.namedItem('phone') as HTMLInputElement;
    const genderInput = form.elements.namedItem('gender') as HTMLSelectElement;
    const ageInput = form.elements.namedItem('age') as HTMLInputElement;
    const heightInput = form.elements.namedItem('height') as HTMLInputElement;
    const startDateInput = form.elements.namedItem('startDate') as HTMLInputElement;
    const goalsInput = form.elements.namedItem('goals') as HTMLTextAreaElement;
    const imageInput = form.elements.namedItem('image') as HTMLInputElement;

    const imageFile = imageInput.files ? imageInput.files[0] : null;
    let imageDataUrl = '';

    const processClientData = () => {
      if (editingClient) {
        // Update existing client
        const updatedClient: Client = {
          ...editingClient,
          name: nameInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
          gender: genderInput.value,
          age: Number(ageInput.value),
          height: Number(heightInput.value),
          startDate: startDateInput.value,
          goals: goalsInput.value,
          ...(imageDataUrl ? { image: imageDataUrl } : {})
        };

        setClients(clients.map(client => 
          client.id === editingClient.id ? updatedClient : client
        ));
      } else {
        // Add new client
        const newClient: Client = {
          id: generateId(),
          name: nameInput.value,
          email: emailInput.value,
          phone: phoneInput.value,
          gender: genderInput.value,
          age: Number(ageInput.value),
          height: Number(heightInput.value),
          startDate: startDateInput.value,
          goals: goalsInput.value,
          ...(imageDataUrl ? { image: imageDataUrl } : {})
        };
        
        setClients([...clients, newClient]);
      }
      
      setIsClientModalOpen(false);
      setEditingClient(null);
    };

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        imageDataUrl = reader.result as string;
        processClientData();
      };
      reader.readAsDataURL(imageFile);
    } else {
      processClientData();
    }
  };

  const handleAddMeasurement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const clientIdInput = form.elements.namedItem('clientId') as HTMLSelectElement;
    const dateInput = form.elements.namedItem('date') as HTMLInputElement;
    const weightInput = form.elements.namedItem('weight') as HTMLInputElement;
    const bodyFatInput = form.elements.namedItem('bodyFat') as HTMLInputElement;
    const chestInput = form.elements.namedItem('chest') as HTMLInputElement;
    const waistInput = form.elements.namedItem('waist') as HTMLInputElement;
    const hipsInput = form.elements.namedItem('hips') as HTMLInputElement;
    const armsInput = form.elements.namedItem('arms') as HTMLInputElement;
    const thighsInput = form.elements.namedItem('thighs') as HTMLInputElement;

    if (editingMeasurement) {
      // Update existing measurement
      const updatedMeasurement: Measurement = {
        ...editingMeasurement,
        clientId: clientIdInput.value,
        date: dateInput.value,
        weight: Number(weightInput.value),
        bodyFat: bodyFatInput.value ? Number(bodyFatInput.value) : undefined,
        chest: chestInput.value ? Number(chestInput.value) : undefined,
        waist: waistInput.value ? Number(waistInput.value) : undefined,
        hips: hipsInput.value ? Number(hipsInput.value) : undefined,
        arms: armsInput.value ? Number(armsInput.value) : undefined,
        thighs: thighsInput.value ? Number(thighsInput.value) : undefined,
      };

      setMeasurements(measurements.map(measurement => 
        measurement.id === editingMeasurement.id ? updatedMeasurement : measurement
      ));
    } else {
      // Add new measurement
      const newMeasurement: Measurement = {
        id: generateId(),
        clientId: clientIdInput.value,
        date: dateInput.value,
        weight: Number(weightInput.value),
        bodyFat: bodyFatInput.value ? Number(bodyFatInput.value) : undefined,
        chest: chestInput.value ? Number(chestInput.value) : undefined,
        waist: waistInput.value ? Number(waistInput.value) : undefined,
        hips: hipsInput.value ? Number(hipsInput.value) : undefined,
        arms: armsInput.value ? Number(armsInput.value) : undefined,
        thighs: thighsInput.value ? Number(thighsInput.value) : undefined,
      };
      
      setMeasurements([...measurements, newMeasurement]);
    }
    
    setIsMeasurementModalOpen(false);
    setEditingMeasurement(null);
  };

  const handleAddMeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const clientIdInput = form.elements.namedItem('clientId') as HTMLSelectElement;
    const dateInput = form.elements.namedItem('date') as HTMLInputElement;
    const mealTypeInput = form.elements.namedItem('mealType') as HTMLSelectElement;
    const foodInput = form.elements.namedItem('food') as HTMLInputElement;
    const caloriesInput = form.elements.namedItem('calories') as HTMLInputElement;
    const proteinInput = form.elements.namedItem('protein') as HTMLInputElement;
    const carbsInput = form.elements.namedItem('carbs') as HTMLInputElement;
    const fatsInput = form.elements.namedItem('fats') as HTMLInputElement;
    const notesInput = form.elements.namedItem('notes') as HTMLTextAreaElement;

    if (editingMeal) {
      // Update existing meal
      const updatedMeal: Meal = {
        ...editingMeal,
        clientId: clientIdInput.value,
        date: dateInput.value,
        mealType: mealTypeInput.value as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        food: foodInput.value,
        calories: Number(caloriesInput.value),
        protein: Number(proteinInput.value),
        carbs: Number(carbsInput.value),
        fats: Number(fatsInput.value),
        notes: notesInput.value || undefined
      };

      setMeals(meals.map(meal => 
        meal.id === editingMeal.id ? updatedMeal : meal
      ));
    } else {
      // Add new meal
      const newMeal: Meal = {
        id: generateId(),
        clientId: clientIdInput.value,
        date: dateInput.value,
        mealType: mealTypeInput.value as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        food: foodInput.value,
        calories: Number(caloriesInput.value),
        protein: Number(proteinInput.value),
        carbs: Number(carbsInput.value),
        fats: Number(fatsInput.value),
        notes: notesInput.value || undefined
      };
      
      setMeals([...meals, newMeal]);
    }
    
    setIsMealModalOpen(false);
    setEditingMeal(null);
  };

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: generateId(),
      name: '',
      sets: 0,
      reps: 0,
      weight: 0
    };
    setTemporaryExercises([...temporaryExercises, newExercise]);
  };

  const handleUpdateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updatedExercises = [...temporaryExercises];
    if (field === 'name') {
      updatedExercises[index].name = value as string;
    } else {
      updatedExercises[index][field] = Number(value);
    }
    setTemporaryExercises(updatedExercises);
  };

  const handleRemoveExercise = (index: number) => {
    setTemporaryExercises(temporaryExercises.filter((_, i) => i !== index));
  };

  const handleAddWorkout = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const clientIdInput = form.elements.namedItem('clientId') as HTMLSelectElement;
    const dateInput = form.elements.namedItem('date') as HTMLInputElement;
    const typeInput = form.elements.namedItem('type') as HTMLInputElement;
    const durationInput = form.elements.namedItem('duration') as HTMLInputElement;
    const notesInput = form.elements.namedItem('notes') as HTMLTextAreaElement;

    // Filter out empty exercises
    const validExercises = temporaryExercises.filter(ex => ex.name.trim() !== '');

    if (editingWorkout) {
      // Update existing workout
      const updatedWorkout: Workout = {
        ...editingWorkout,
        clientId: clientIdInput.value,
        date: dateInput.value,
        type: typeInput.value,
        duration: Number(durationInput.value),
        exercises: validExercises,
        notes: notesInput.value || undefined
      };

      setWorkouts(workouts.map(workout => 
        workout.id === editingWorkout.id ? updatedWorkout : workout
      ));
    } else {
      // Add new workout
      const newWorkout: Workout = {
        id: generateId(),
        clientId: clientIdInput.value,
        date: dateInput.value,
        type: typeInput.value,
        duration: Number(durationInput.value),
        exercises: validExercises,
        notes: notesInput.value || undefined
      };
      
      setWorkouts([...workouts, newWorkout]);
    }
    
    setIsWorkoutModalOpen(false);
    setEditingWorkout(null);
    setTemporaryExercises([]);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleEditMeasurement = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    setIsMeasurementModalOpen(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setIsMealModalOpen(true);
  };

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setTemporaryExercises(workout.exercises);
    setIsWorkoutModalOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client? This will also delete all associated records.')) {
      // Delete client
      setClients(clients.filter(client => client.id !== id));
      
      // Delete associated records
      setMeasurements(measurements.filter(measurement => measurement.clientId !== id));
      setMeals(meals.filter(meal => meal.clientId !== id));
      setWorkouts(workouts.filter(workout => workout.clientId !== id));
      
      // If the deleted client was selected, reset the selection
      if (selectedClient === id) {
        setSelectedClient('');
      }
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    if (window.confirm('Are you sure you want to delete this measurement?')) {
      setMeasurements(measurements.filter(measurement => measurement.id !== id));
    }
  };

  const handleDeleteMeal = (id: string) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      setMeals(meals.filter(meal => meal.id !== id));
    }
  };

  const handleDeleteWorkout = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      setWorkouts(workouts.filter(workout => workout.id !== id));
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleChangeMonth = (increment: number) => {
    const [year, month] = dateFilter.split('-').map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + increment);
    const newYear = date.getFullYear();
    const newMonth = date.getMonth() + 1;
    setDateFilter(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
  };

  const filterDataByMonth = <T extends { date: string, clientId: string }>(data: T[], clientId: string): T[] => {
    if (!dateFilter || !clientId) return [];
    
    return data.filter(item => {
      return item.clientId === clientId && item.date.startsWith(dateFilter);
    });
  };

  const filterDataByClient = <T extends { clientId: string }>(data: T[], clientId: string): T[] => {
    if (!clientId) return data;
    return data.filter(item => item.clientId === clientId);
  };

  const getMeasurementChartData = (clientId: string) => {
    const clientMeasurements = measurements
      .filter(m => m.clientId === clientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return clientMeasurements.map(m => ({
      date: formatDate(m.date),
      weight: m.weight,
      bodyFat: m.bodyFat || 0,
      chest: m.chest || 0,
      waist: m.waist || 0,
      hips: m.hips || 0,
      arms: m.arms || 0,
      thighs: m.thighs || 0
    }));
  };

  const getNutritionChartData = (clientId: string) => {
    const clientMeals = meals
      .filter(m => m.clientId === clientId && m.date.startsWith(dateFilter));

    const dailyTotals: Record<string, { calories: number, protein: number, carbs: number, fats: number }> = {};

    clientMeals.forEach(meal => {
      if (!dailyTotals[meal.date]) {
        dailyTotals[meal.date] = { calories: 0, protein: 0, carbs: 0, fats: 0 };
      }
      dailyTotals[meal.date].calories += meal.calories;
      dailyTotals[meal.date].protein += meal.protein;
      dailyTotals[meal.date].carbs += meal.carbs;
      dailyTotals[meal.date].fats += meal.fats;
    });

    return Object.entries(dailyTotals).map(([date, totals]) => ({
      date: formatDate(date),
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getWorkoutStats = (clientId: string) => {
    const clientWorkouts = workouts.filter(w => w.clientId === clientId);
    
    // Total workouts
    const totalWorkouts = clientWorkouts.length;
    
    // Total duration
    const totalDuration = clientWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
    
    // Workout types breakdown
    const typeBreakdown: Record<string, number> = {};
    clientWorkouts.forEach(workout => {
      if (!typeBreakdown[workout.type]) {
        typeBreakdown[workout.type] = 0;
      }
      typeBreakdown[workout.type]++;
    });
    
    return {
      totalWorkouts,
      totalDuration,
      typeBreakdown: Object.entries(typeBreakdown).map(([type, count]) => ({
        type,
        count
      }))
    };
  };

  const sortedClients = () => {
    if (!sortConfig) return clients;

    return [...clients].sort((a, b) => {
      if (a[sortConfig.key as keyof Client] < b[sortConfig.key as keyof Client]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key as keyof Client] > b[sortConfig.key as keyof Client]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredClients = sortedClients().filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render UI
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fitness Trainer Dashboard</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="mr-2 text-sm dark:text-slate-300">Dark</span>
                <button 
                  className="theme-toggle"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="theme-toggle-thumb"></span>
                  <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                </button>
                <span className="ml-2 text-sm dark:text-slate-300">Light</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 shadow-sm mb-6 theme-transition">
        <div className="container-fluid overflow-x-auto">
          <nav className="flex space-x-4 py-2">
            <button
              className={`px-3 py-2 rounded-md font-medium text-sm ${activeTab === 'clients' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white'}`}
              onClick={() => setActiveTab('clients')}
            >
              <div className="flex items-center gap-1">
                <User size={18} />
                <span>Clients</span>
              </div>
            </button>
            <button
              className={`px-3 py-2 rounded-md font-medium text-sm ${activeTab === 'nutrition' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white'}`}
              onClick={() => setActiveTab('nutrition')}
            >
              <div className="flex items-center gap-1">
                <Utensils size={18} />
                <span>Nutrition</span>
              </div>
            </button>
            <button
              className={`px-3 py-2 rounded-md font-medium text-sm ${activeTab === 'workouts' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white'}`}
              onClick={() => setActiveTab('workouts')}
            >
              <div className="flex items-center gap-1">
                <Dumbbell size={18} />
                <span>Workouts</span>
              </div>
            </button>
            <button
              className={`px-3 py-2 rounded-md font-medium text-sm ${activeTab === 'measurements' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white'}`}
              onClick={() => setActiveTab('measurements')}
            >
              <div className="flex items-center gap-1">
                <Scale size={18} />
                <span>Measurements</span>
              </div>
            </button>
            <button
              className={`px-3 py-2 rounded-md font-medium text-sm ${activeTab === 'dashboard' ? 'bg-primary-600 text-white' : 'text-gray-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="flex items-center gap-1">
                <TrendingUp size={18} />
                <span>Dashboard</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-fluid pb-12">
        {/* Client Tab Content */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="flex-between flex-wrap gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary flex items-center gap-1"
                onClick={() => {
                  setEditingClient(null);
                  setIsClientModalOpen(true);
                }}
              >
                <Plus size={18} />
                <span>Add Client</span>
              </button>
            </div>

            {/* Client List */}
            <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg theme-transition">
              <table className="table">
                <thead>
                  <tr>
                    <th 
                      className="table-header py-3 px-6 cursor-pointer"
                      onClick={() => requestSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Name</span>
                        {sortConfig?.key === 'name' && (
                          sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header py-3 px-6">Email</th>
                    <th className="table-header py-3 px-6">Phone</th>
                    <th 
                      className="table-header py-3 px-6 cursor-pointer"
                      onClick={() => requestSort('age')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Age</span>
                        {sortConfig?.key === 'age' && (
                          sortConfig.direction === 'ascending' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="table-header py-3 px-6">Goals</th>
                    <th className="table-header py-3 px-6">Start Date</th>
                    <th className="table-header py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredClients.length > 0 ? filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="table-cell py-4 px-6 font-medium">
                        <div className="flex items-center gap-3">
                          {client.image ? (
                            <img 
                              src={client.image} 
                              alt={client.name} 
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                              <UserRound size={16} className="text-primary-600 dark:text-primary-300" />
                            </div>
                          )}
                          {client.name}
                        </div>
                      </td>
                      <td className="table-cell py-4 px-6">{client.email}</td>
                      <td className="table-cell py-4 px-6">{client.phone}</td>
                      <td className="table-cell py-4 px-6">{client.age}</td>
                      <td className="table-cell py-4 px-6 max-w-md truncate">{client.goals}</td>
                      <td className="table-cell py-4 px-6">{formatDate(client.startDate)}</td>
                      <td className="table-cell py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={() => handleEditClient(client)}
                            aria-label={`Edit ${client.name}`}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteClient(client.id)}
                            aria-label={`Delete ${client.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="table-cell py-4 px-6 text-center text-gray-500 dark:text-slate-400">
                        No clients found. Add your first client to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Measurements Tab Content */}
        {activeTab === 'measurements' && (
          <div className="space-y-6">
            <div className="flex-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <select
                  className="input"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <div className="flex items-center bg-white dark:bg-slate-800 shadow rounded-md p-1 theme-transition">
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                    onClick={() => handleChangeMonth(-1)}
                    aria-label="Previous month"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span className="px-2 font-medium text-gray-700 dark:text-slate-300">
                    {new Date(dateFilter + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                    onClick={() => handleChangeMonth(1)}
                    aria-label="Next month"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <button
                className="btn btn-primary flex items-center gap-1"
                onClick={() => {
                  setEditingMeasurement(null);
                  setIsMeasurementModalOpen(true);
                }}
                disabled={clients.length === 0}
              >
                <Plus size={18} />
                <span>Add Measurement</span>
              </button>
            </div>

            {selectedClient ? (
              <div className="space-y-6">
                {/* Measurements Chart */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md theme-transition">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Measurement Progress - {getClientNameById(selectedClient)}
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getMeasurementChartData(selectedClient)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1f2937', borderColor: isDarkMode ? '#334155' : '#e5e7eb' }} />
                        <Legend />
                        <Line type="monotone" dataKey="weight" stroke="#2563eb" activeDot={{ r: 8 }} name="Weight (kg)" />
                        <Line type="monotone" dataKey="bodyFat" stroke="#f97316" activeDot={{ r: 8 }} name="Body Fat (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Measurements List */}
                <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg theme-transition">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header py-3 px-6">Date</th>
                        <th className="table-header py-3 px-6">Weight (kg)</th>
                        <th className="table-header py-3 px-6">Body Fat (%)</th>
                        <th className="table-header py-3 px-6">Chest (cm)</th>
                        <th className="table-header py-3 px-6">Waist (cm)</th>
                        <th className="table-header py-3 px-6">Hips (cm)</th>
                        <th className="table-header py-3 px-6">Arms (cm)</th>
                        <th className="table-header py-3 px-6">Thighs (cm)</th>
                        <th className="table-header py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {filterDataByClient(measurements, selectedClient)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((measurement) => (
                          <tr key={measurement.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="table-cell py-4 px-6">{formatDate(measurement.date)}</td>
                            <td className="table-cell py-4 px-6">{measurement.weight}</td>
                            <td className="table-cell py-4 px-6">{measurement.bodyFat || '-'}</td>
                            <td className="table-cell py-4 px-6">{measurement.chest || '-'}</td>
                            <td className="table-cell py-4 px-6">{measurement.waist || '-'}</td>
                            <td className="table-cell py-4 px-6">{measurement.hips || '-'}</td>
                            <td className="table-cell py-4 px-6">{measurement.arms || '-'}</td>
                            <td className="table-cell py-4 px-6">{measurement.thighs || '-'}</td>
                            <td className="table-cell py-4 px-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="btn btn-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  onClick={() => handleEditMeasurement(measurement)}
                                  aria-label={`Edit measurement from ${formatDate(measurement.date)}`}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="btn btn-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteMeasurement(measurement.id)}
                                  aria-label={`Delete measurement from ${formatDate(measurement.date)}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {filterDataByClient(measurements, selectedClient).length === 0 && (
                        <tr>
                          <td colSpan={9} className="table-cell py-4 px-6 text-center text-gray-500 dark:text-slate-400">
                            No measurements found for this client. Add measurements to track progress.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center theme-transition">
                <Scale size={48} className="mx-auto text-gray-400 dark:text-slate-500" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Client Selected</h3>
                <p className="mt-2 text-gray-500 dark:text-slate-400">
                  Please select a client to view their measurement data.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Nutrition Tab Content */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6">
            <div className="flex-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <select
                  className="input"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <div className="flex items-center bg-white dark:bg-slate-800 shadow rounded-md p-1 theme-transition">
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                    onClick={() => handleChangeMonth(-1)}
                    aria-label="Previous month"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span className="px-2 font-medium text-gray-700 dark:text-slate-300">
                    {new Date(dateFilter + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                    onClick={() => handleChangeMonth(1)}
                    aria-label="Next month"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <button
                className="btn btn-primary flex items-center gap-1"
                onClick={() => {
                  setEditingMeal(null);
                  setIsMealModalOpen(true);
                }}
                disabled={clients.length === 0}
              >
                <Plus size={18} />
                <span>Add Meal</span>
              </button>
            </div>

            {selectedClient ? (
              <div className="space-y-6">
                {/* Nutrition Chart */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md theme-transition">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Daily Nutrition - {getClientNameById(selectedClient)}
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getNutritionChartData(selectedClient)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1f2937', borderColor: isDarkMode ? '#334155' : '#e5e7eb' }} />
                        <Legend />
                        <Bar dataKey="protein" name="Protein (g)" stackId="a" fill="#0891b2" />
                        <Bar dataKey="carbs" name="Carbs (g)" stackId="a" fill="#d97706" />
                        <Bar dataKey="fats" name="Fats (g)" stackId="a" fill="#84cc16" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Meals List */}
                <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg theme-transition">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header py-3 px-6">Date</th>
                        <th className="table-header py-3 px-6">Meal Type</th>
                        <th className="table-header py-3 px-6">Food</th>
                        <th className="table-header py-3 px-6">Calories</th>
                        <th className="table-header py-3 px-6">Protein (g)</th>
                        <th className="table-header py-3 px-6">Carbs (g)</th>
                        <th className="table-header py-3 px-6">Fats (g)</th>
                        <th className="table-header py-3 px-6">Notes</th>
                        <th className="table-header py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {filterDataByMonth(meals, selectedClient)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((meal) => (
                          <tr key={meal.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="table-cell py-4 px-6">{formatDate(meal.date)}</td>
                            <td className="table-cell py-4 px-6 capitalize">{meal.mealType}</td>
                            <td className="table-cell py-4 px-6">{meal.food}</td>
                            <td className="table-cell py-4 px-6">{meal.calories}</td>
                            <td className="table-cell py-4 px-6">{meal.protein}</td>
                            <td className="table-cell py-4 px-6">{meal.carbs}</td>
                            <td className="table-cell py-4 px-6">{meal.fats}</td>
                            <td className="table-cell py-4 px-6 max-w-md truncate">{meal.notes || '-'}</td>
                            <td className="table-cell py-4 px-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="btn btn-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  onClick={() => handleEditMeal(meal)}
                                  aria-label={`Edit meal from ${formatDate(meal.date)}`}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="btn btn-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteMeal(meal.id)}
                                  aria-label={`Delete meal from ${formatDate(meal.date)}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {filterDataByMonth(meals, selectedClient).length === 0 && (
                        <tr>
                          <td colSpan={9} className="table-cell py-4 px-6 text-center text-gray-500 dark:text-slate-400">
                            No meals found for this client in the selected month. Add meals to track nutrition.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center theme-transition">
                <Utensils size={48} className="mx-auto text-gray-400 dark:text-slate-500" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Client Selected</h3>
                <p className="mt-2 text-gray-500 dark:text-slate-400">
                  Please select a client to view their nutrition data.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Workouts Tab Content */}
        {activeTab === 'workouts' && (
          <div className="space-y-6">
            <div className="flex-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <select
                  className="input"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <div className="flex items-center bg-white dark:bg-slate-800 shadow rounded-md p-1 theme-transition">
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                    onClick={() => handleChangeMonth(-1)}
                    aria-label="Previous month"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span className="px-2 font-medium text-gray-700 dark:text-slate-300">
                    {new Date(dateFilter + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                  </span>
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white"
                    onClick={() => handleChangeMonth(1)}
                    aria-label="Next month"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <button
                className="btn btn-primary flex items-center gap-1"
                onClick={() => {
                  setEditingWorkout(null);
                  setTemporaryExercises([]);
                  setIsWorkoutModalOpen(true);
                }}
                disabled={clients.length === 0}
              >
                <Plus size={18} />
                <span>Add Workout</span>
              </button>
            </div>

            {selectedClient ? (
              <div className="space-y-6">
                {/* Workout Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat-card">
                    <div className="stat-title">Total Workouts</div>
                    <div className="stat-value">{getWorkoutStats(selectedClient).totalWorkouts}</div>
                    <div className="stat-desc">All time</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Total Duration</div>
                    <div className="stat-value">{getWorkoutStats(selectedClient).totalDuration} min</div>
                    <div className="stat-desc">All time</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Workout Types</div>
                    <div className="mt-2">
                      {getWorkoutStats(selectedClient).typeBreakdown.map((item, index) => (
                        <div key={index} className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{item.type}</span>
                          <span className="text-sm text-gray-500 dark:text-slate-400">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workouts List */}
                <div className="overflow-x-auto bg-white dark:bg-slate-800 shadow-md rounded-lg theme-transition">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header py-3 px-6">Date</th>
                        <th className="table-header py-3 px-6">Type</th>
                        <th className="table-header py-3 px-6">Duration (min)</th>
                        <th className="table-header py-3 px-6">Exercises</th>
                        <th className="table-header py-3 px-6">Notes</th>
                        <th className="table-header py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                      {filterDataByMonth(workouts, selectedClient)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((workout) => (
                          <tr key={workout.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                            <td className="table-cell py-4 px-6">{formatDate(workout.date)}</td>
                            <td className="table-cell py-4 px-6">{workout.type}</td>
                            <td className="table-cell py-4 px-6">{workout.duration}</td>
                            <td className="table-cell py-4 px-6">
                              <div className="flex flex-wrap gap-1">
                                {workout.exercises.map((exercise, index) => (
                                  <span key={exercise.id} className="badge badge-info">
                                    {exercise.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="table-cell py-4 px-6 max-w-md truncate">{workout.notes || '-'}</td>
                            <td className="table-cell py-4 px-6 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="btn btn-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  onClick={() => handleEditWorkout(workout)}
                                  aria-label={`Edit workout from ${formatDate(workout.date)}`}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  className="btn btn-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  onClick={() => handleDeleteWorkout(workout.id)}
                                  aria-label={`Delete workout from ${formatDate(workout.date)}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {filterDataByMonth(workouts, selectedClient).length === 0 && (
                        <tr>
                          <td colSpan={6} className="table-cell py-4 px-6 text-center text-gray-500 dark:text-slate-400">
                            No workouts found for this client in the selected month. Add workouts to track progress.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center theme-transition">
                <Dumbbell size={48} className="mx-auto text-gray-400 dark:text-slate-500" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Client Selected</h3>
                <p className="mt-2 text-gray-500 dark:text-slate-400">
                  Please select a client to view their workout data.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <select
                className="input"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {selectedClient ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Client Info */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 theme-transition">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Client Information
                    </h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                      {clients.find(c => c.id === selectedClient)?.image ? (
                        <img 
                          src={clients.find(c => c.id === selectedClient)?.image} 
                          alt={getClientNameById(selectedClient)} 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <UserRound size={36} className="text-primary-600 dark:text-primary-300" />
                        </div>
                      )}
                      <div>
                        <h4 className="text-xl font-medium text-gray-900 dark:text-white">
                          {getClientNameById(selectedClient)}
                        </h4>
                        <p className="text-gray-500 dark:text-slate-400">
                          {clients.find(c => c.id === selectedClient)?.email}
                        </p>
                        <p className="text-gray-500 dark:text-slate-400">
                          Started on {formatDate(clients.find(c => c.id === selectedClient)?.startDate || '')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Age</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {clients.find(c => c.id === selectedClient)?.age} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Gender</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                          {clients.find(c => c.id === selectedClient)?.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Height</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {clients.find(c => c.id === selectedClient)?.height} cm
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Current Weight</p>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                          {measurements
                            .filter(m => m.clientId === selectedClient)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.weight || 'N/A'} kg
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Goals</p>
                      <p className="text-base text-gray-900 dark:text-white">
                        {clients.find(c => c.id === selectedClient)?.goals}
                      </p>
                    </div>
                  </div>

                  {/* Progress Summary */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 theme-transition">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Progress Summary
                    </h3>
                    
                    {measurements.filter(m => m.clientId === selectedClient).length >= 2 ? (
                      <div className="space-y-6">
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getMeasurementChartData(selectedClient)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1f2937', borderColor: isDarkMode ? '#334155' : '#e5e7eb' }} />
                              <Legend />
                              <Line type="monotone" dataKey="weight" stroke="#2563eb" name="Weight (kg)" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div>
                          {(() => {
                            const sortedMeasurements = [...measurements
                              .filter(m => m.clientId === selectedClient)]
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                              
                            if (sortedMeasurements.length >= 2) {
                              const first = sortedMeasurements[0];
                              const last = sortedMeasurements[sortedMeasurements.length - 1];
                              const weightChange = last.weight - first.weight;
                              const weightChangePct = (weightChange / first.weight * 100).toFixed(1);
                              
                              return (
                                <div className="flex-between flex-wrap gap-2">
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Starting Weight</p>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">{first.weight} kg</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Current Weight</p>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">{last.weight} kg</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">Change</p>
                                    <p className={`text-base font-medium ${weightChange < 0 ? 'text-green-600 dark:text-green-400' : weightChange > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                      {weightChange > 0 ? '+' : ''}{weightChange} kg ({weightChangePct}%)
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Scale size={36} className="mx-auto text-gray-400 dark:text-slate-500" />
                        <p className="mt-2 text-gray-500 dark:text-slate-400">
                          Not enough measurement data. Add at least two measurements to see progress.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nutrition and Workout Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 theme-transition">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Nutrition
                    </h3>
                    
                    {meals.filter(m => m.clientId === selectedClient).length > 0 ? (
                      <div className="space-y-4">
                        <div className="h-60">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getNutritionChartData(selectedClient)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1f2937', borderColor: isDarkMode ? '#334155' : '#e5e7eb' }} />
                              <Legend />
                              <Bar dataKey="calories" name="Calories" fill="#ef4444" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="overflow-hidden overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead>
                              <tr>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Date</th>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Meal</th>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Food</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                              {meals
                                .filter(m => m.clientId === selectedClient)
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 3)
                                .map((meal) => (
                                  <tr key={meal.id}>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{formatDate(meal.date)}</td>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 capitalize">{meal.mealType}</td>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{meal.food}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Utensils size={36} className="mx-auto text-gray-400 dark:text-slate-500" />
                        <p className="mt-2 text-gray-500 dark:text-slate-400">
                          No nutrition data available. Add meals to track nutrition.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 theme-transition">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Recent Workouts
                    </h3>
                    
                    {workouts.filter(w => w.clientId === selectedClient).length > 0 ? (
                      <div className="space-y-4">
                        {getWorkoutStats(selectedClient).typeBreakdown.length > 0 && (
                          <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={getWorkoutStats(selectedClient).typeBreakdown}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="type" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#fff', color: isDarkMode ? '#e2e8f0' : '#1f2937', borderColor: isDarkMode ? '#334155' : '#e5e7eb' }} />
                                <Legend />
                                <Bar dataKey="count" name="Workouts" fill="#8b5cf6" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                        
                        <div className="overflow-hidden overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead>
                              <tr>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Date</th>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Type</th>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Duration</th>
                                <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Exercises</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                              {workouts
                                .filter(w => w.clientId === selectedClient)
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 3)
                                .map((workout) => (
                                  <tr key={workout.id}>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{formatDate(workout.date)}</td>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{workout.type}</td>
                                    <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{workout.duration} min</td>
                                    <td className="px-2 py-1 text-sm text-gray-700 dark:text-slate-300">
                                      <div className="flex flex-wrap gap-1">
                                        {workout.exercises.slice(0, 2).map((exercise) => (
                                          <span key={exercise.id} className="badge badge-info">
                                            {exercise.name}
                                          </span>
                                        ))}
                                        {workout.exercises.length > 2 && (
                                          <span className="badge badge-info">+{workout.exercises.length - 2} more</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Dumbbell size={36} className="mx-auto text-gray-400 dark:text-slate-500" />
                        <p className="mt-2 text-gray-500 dark:text-slate-400">
                          No workout data available. Add workouts to track progress.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center theme-transition">
                <User size={48} className="mx-auto text-gray-400 dark:text-slate-500" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No Client Selected</h3>
                <p className="mt-2 text-gray-500 dark:text-slate-400">
                  Please select a client to view their dashboard.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 mt-auto p-4 shadow-inner theme-transition">
        <div className="container-fluid">
          <p className="text-center text-gray-500 dark:text-slate-400 text-sm">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={clientModalRef}
            className="modal-content max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-modal-title"
          >
            <div className="modal-header">
              <h3 id="client-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-white"
                onClick={() => {
                  setIsClientModalOpen(false);
                  setEditingClient(null);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddClient}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Name</label>
                  <input 
                    type="text" 
                    id="name"
                    name="name"
                    className="input"
                    defaultValue={editingClient?.name || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email"
                    className="input"
                    defaultValue={editingClient?.email || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Phone</label>
                  <input 
                    type="text" 
                    id="phone"
                    name="phone"
                    className="input"
                    defaultValue={editingClient?.phone || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gender">Gender</label>
                  <select 
                    id="gender"
                    name="gender"
                    className="input"
                    defaultValue={editingClient?.gender || ''}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="age">Age</label>
                  <input 
                    type="number" 
                    id="age"
                    name="age"
                    className="input"
                    min="1"
                    max="120"
                    defaultValue={editingClient?.age || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="height">Height (cm)</label>
                  <input 
                    type="number" 
                    id="height"
                    name="height"
                    className="input"
                    min="50"
                    max="250"
                    step="0.1"
                    defaultValue={editingClient?.height || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="startDate">Start Date</label>
                  <input 
                    type="date" 
                    id="startDate"
                    name="startDate"
                    className="input"
                    defaultValue={editingClient?.startDate || new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="image">Profile Image</label>
                  <input 
                    type="file" 
                    id="image"
                    name="image"
                    className="input py-1.5"
                    accept="image/*"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="goals">Goals</label>
                <textarea 
                  id="goals"
                  name="goals"
                  className="input"
                  rows={3}
                  defaultValue={editingClient?.goals || ''}
                  required
                ></textarea>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={() => {
                    setIsClientModalOpen(false);
                    setEditingClient(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Measurement Modal */}
      {isMeasurementModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={measurementModalRef}
            className="modal-content max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="measurement-modal-title"
          >
            <div className="modal-header">
              <h3 id="measurement-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {editingMeasurement ? 'Edit Measurement' : 'Add New Measurement'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-white"
                onClick={() => {
                  setIsMeasurementModalOpen(false);
                  setEditingMeasurement(null);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddMeasurement}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="clientId">Client</label>
                  <select 
                    id="clientId"
                    name="clientId"
                    className="input"
                    defaultValue={editingMeasurement?.clientId || selectedClient || ''}
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input 
                    type="date" 
                    id="date"
                    name="date"
                    className="input"
                    defaultValue={editingMeasurement?.date || new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="weight">Weight (kg)</label>
                  <input 
                    type="number" 
                    id="weight"
                    name="weight"
                    className="input"
                    min="1"
                    max="500"
                    step="0.1"
                    defaultValue={editingMeasurement?.weight || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="bodyFat">Body Fat (%)</label>
                  <input 
                    type="number" 
                    id="bodyFat"
                    name="bodyFat"
                    className="input"
                    min="1"
                    max="100"
                    step="0.1"
                    defaultValue={editingMeasurement?.bodyFat || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="chest">Chest (cm)</label>
                  <input 
                    type="number" 
                    id="chest"
                    name="chest"
                    className="input"
                    min="1"
                    max="300"
                    step="0.1"
                    defaultValue={editingMeasurement?.chest || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="waist">Waist (cm)</label>
                  <input 
                    type="number" 
                    id="waist"
                    name="waist"
                    className="input"
                    min="1"
                    max="300"
                    step="0.1"
                    defaultValue={editingMeasurement?.waist || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="hips">Hips (cm)</label>
                  <input 
                    type="number" 
                    id="hips"
                    name="hips"
                    className="input"
                    min="1"
                    max="300"
                    step="0.1"
                    defaultValue={editingMeasurement?.hips || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="arms">Arms (cm)</label>
                  <input 
                    type="number" 
                    id="arms"
                    name="arms"
                    className="input"
                    min="1"
                    max="100"
                    step="0.1"
                    defaultValue={editingMeasurement?.arms || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="thighs">Thighs (cm)</label>
                  <input 
                    type="number" 
                    id="thighs"
                    name="thighs"
                    className="input"
                    min="1"
                    max="200"
                    step="0.1"
                    defaultValue={editingMeasurement?.thighs || ''}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={() => {
                    setIsMeasurementModalOpen(false);
                    setEditingMeasurement(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMeasurement ? 'Update Measurement' : 'Add Measurement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meal Modal */}
      {isMealModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={mealModalRef}
            className="modal-content max-w-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="meal-modal-title"
          >
            <div className="modal-header">
              <h3 id="meal-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {editingMeal ? 'Edit Meal' : 'Add New Meal'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-white"
                onClick={() => {
                  setIsMealModalOpen(false);
                  setEditingMeal(null);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddMeal}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="clientId">Client</label>
                  <select 
                    id="clientId"
                    name="clientId"
                    className="input"
                    defaultValue={editingMeal?.clientId || selectedClient || ''}
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input 
                    type="date" 
                    id="date"
                    name="date"
                    className="input"
                    defaultValue={editingMeal?.date || new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="mealType">Meal Type</label>
                  <select 
                    id="mealType"
                    name="mealType"
                    className="input"
                    defaultValue={editingMeal?.mealType || 'breakfast'}
                    required
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="food">Food</label>
                  <input 
                    type="text" 
                    id="food"
                    name="food"
                    className="input"
                    defaultValue={editingMeal?.food || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="calories">Calories</label>
                  <input 
                    type="number" 
                    id="calories"
                    name="calories"
                    className="input"
                    min="0"
                    max="5000"
                    defaultValue={editingMeal?.calories || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="protein">Protein (g)</label>
                  <input 
                    type="number" 
                    id="protein"
                    name="protein"
                    className="input"
                    min="0"
                    max="500"
                    step="0.1"
                    defaultValue={editingMeal?.protein || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="carbs">Carbs (g)</label>
                  <input 
                    type="number" 
                    id="carbs"
                    name="carbs"
                    className="input"
                    min="0"
                    max="500"
                    step="0.1"
                    defaultValue={editingMeal?.carbs || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="fats">Fats (g)</label>
                  <input 
                    type="number" 
                    id="fats"
                    name="fats"
                    className="input"
                    min="0"
                    max="500"
                    step="0.1"
                    defaultValue={editingMeal?.fats || ''}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea 
                  id="notes"
                  name="notes"
                  className="input"
                  rows={3}
                  defaultValue={editingMeal?.notes || ''}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={() => {
                    setIsMealModalOpen(false);
                    setEditingMeal(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMeal ? 'Update Meal' : 'Add Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workout Modal */}
      {isWorkoutModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={workoutModalRef}
            className="modal-content max-w-3xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="workout-modal-title"
          >
            <div className="modal-header">
              <h3 id="workout-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {editingWorkout ? 'Edit Workout' : 'Add New Workout'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-white"
                onClick={() => {
                  setIsWorkoutModalOpen(false);
                  setEditingWorkout(null);
                  setTemporaryExercises([]);
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddWorkout}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="clientId">Client</label>
                  <select 
                    id="clientId"
                    name="clientId"
                    className="input"
                    defaultValue={editingWorkout?.clientId || selectedClient || ''}
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input 
                    type="date" 
                    id="date"
                    name="date"
                    className="input"
                    defaultValue={editingWorkout?.date || new Date().toISOString().slice(0, 10)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Workout Type</label>
                  <input 
                    type="text" 
                    id="type"
                    name="type"
                    className="input"
                    placeholder="e.g. Strength, Cardio, HIIT, etc."
                    defaultValue={editingWorkout?.type || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="duration">Duration (minutes)</label>
                  <input 
                    type="number" 
                    id="duration"
                    name="duration"
                    className="input"
                    min="1"
                    max="300"
                    defaultValue={editingWorkout?.duration || ''}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label mb-0">Exercises</label>
                  <button 
                    type="button" 
                    className="btn btn-sm bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 flex items-center gap-1"
                    onClick={handleAddExercise}
                  >
                    <Plus size={14} /> Add Exercise
                  </button>
                </div>
                <div className="overflow-x-auto bg-gray-50 dark:bg-slate-900 rounded-md p-2 mb-2">
                  {temporaryExercises.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
                      No exercises added yet. Click 'Add Exercise' to add one.
                    </p>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead>
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Exercise</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Sets</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Reps</th>
                          <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Weight (kg)</th>
                          <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {temporaryExercises.map((exercise, index) => (
                          <tr key={index} className="hover:bg-gray-100 dark:hover:bg-slate-800">
                            <td className="px-2 py-2">
                              <input 
                                type="text" 
                                className="input input-sm w-full"
                                placeholder="Exercise name"
                                value={exercise.name}
                                onChange={(e) => handleUpdateExercise(index, 'name', e.target.value)}
                                required
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input 
                                type="number" 
                                className="input input-sm w-full"
                                min="1"
                                max="100"
                                value={exercise.sets || ''}
                                onChange={(e) => handleUpdateExercise(index, 'sets', e.target.value)}
                                required
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input 
                                type="number" 
                                className="input input-sm w-full"
                                min="1"
                                max="1000"
                                value={exercise.reps || ''}
                                onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                                required
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input 
                                type="number" 
                                className="input input-sm w-full"
                                min="0"
                                max="1000"
                                step="0.5"
                                value={exercise.weight || ''}
                                onChange={(e) => handleUpdateExercise(index, 'weight', e.target.value)}
                                required
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button 
                                type="button"
                                className="btn btn-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => handleRemoveExercise(index)}
                                aria-label="Remove exercise"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea 
                  id="notes"
                  name="notes"
                  className="input"
                  rows={3}
                  defaultValue={editingWorkout?.notes || ''}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={() => {
                    setIsWorkoutModalOpen(false);
                    setEditingWorkout(null);
                    setTemporaryExercises([]);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingWorkout ? 'Update Workout' : 'Add Workout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
