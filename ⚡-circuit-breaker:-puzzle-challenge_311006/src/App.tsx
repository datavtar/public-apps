import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Home, 
  Play, 
  RotateCw, 
  Trophy, 
  Star, 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  HelpCircle,
  Zap,
  Target,
  Clock,
  Award,
  BarChart3,
  RefreshCw,
  LogOut,
  User,
  Lightbulb
} from 'lucide-react';

// Types and Interfaces
type PieceType = 'empty' | 'straight' | 'corner' | 'cross' | 'source' | 'target' | 'blocker';
type Direction = 'up' | 'right' | 'down' | 'left';

interface GamePiece {
  type: PieceType;
  rotation: number;
  isConnected: boolean;
  hasPower: boolean;
  id: string;
}

interface GameBoard {
  grid: GamePiece[][];
  width: number;
  height: number;
  sources: { x: number; y: number }[];
  targets: { x: number; y: number }[];
}

interface Level {
  id: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme' | 'Impossible';
  timeLimit?: number;
  description: string;
  board: GameBoard;
  par: number;
}

interface GameStats {
  level: number;
  score: number;
  moves: number;
  timeElapsed: number;
  completed: boolean[];
  achievements: string[];
  totalPlayTime: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const App: React.FC = () => {
  // Authentication
  const { currentUser, logout } = useAuth();

  // AI Layer
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Game State
  const [currentTab, setCurrentTab] = useState<'home' | 'game' | 'stats' | 'settings'>('home');
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'completed' | 'failed'>('menu');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [gameBoard, setGameBoard] = useState<GameBoard | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    level: 1,
    score: 0,
    moves: 0,
    timeElapsed: 0,
    completed: [],
    achievements: [],
    totalPlayTime: 0
  });
  const [timer, setTimer] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [selectedPiece, setSelectedPiece] = useState<{ x: number; y: number } | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [gameStartTime, setGameStartTime] = useState<number>(0);

  // Settings
  const [settings, setSettings] = useState({
    soundEnabled: true,
    animationsEnabled: true,
    difficulty: 'normal',
    autoSave: true
  });

  // Initialize achievements
  useEffect(() => {
    const defaultAchievements: Achievement[] = [
      { id: 'first_win', name: 'First Victory', description: 'Complete your first level', icon: '🏆', unlocked: false },
      { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a level in under 30 seconds', icon: '⚡', unlocked: false },
      { id: 'efficient', name: 'Efficient Engineer', description: 'Complete a level in par moves', icon: '🎯', unlocked: false },
      { id: 'persistent', name: 'Persistent Player', description: 'Play for 30 minutes total', icon: '🕒', unlocked: false },
      { id: 'puzzle_master', name: 'Puzzle Master', description: 'Complete 5 levels', icon: '🧩', unlocked: false },
      { id: 'impossible_task', name: 'Impossible Task', description: 'Reach level 8', icon: '💀', unlocked: false }
    ];
    setAchievements(defaultAchievements);
  }, []);

  // Load saved data
  useEffect(() => {
    const savedStats = localStorage.getItem('circuitBreakerStats');
    const savedSettings = localStorage.getItem('circuitBreakerSettings');
    const savedAchievements = localStorage.getItem('circuitBreakerAchievements');
    
    if (savedStats) {
      setGameStats(JSON.parse(savedStats));
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  // Save data when stats change
  useEffect(() => {
    localStorage.setItem('circuitBreakerStats', JSON.stringify(gameStats));
  }, [gameStats]);

  useEffect(() => {
    localStorage.setItem('circuitBreakerSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('circuitBreakerAchievements', JSON.stringify(achievements));
  }, [achievements]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        setGameStats(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1, totalPlayTime: prev.totalPlayTime + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Generate game piece
  const generatePiece = (type: PieceType): GamePiece => ({
    type,
    rotation: Math.floor(Math.random() * 4) * 90,
    isConnected: false,
    hasPower: false,
    id: Math.random().toString(36).substring(7)
  });

  // Generate level based on difficulty
  const generateLevel = (levelNum: number): Level => {
    const difficultyMap = {
      1: { name: 'Getting Started', difficulty: 'Easy' as const, size: 3, sources: 1, targets: 1, par: 5 },
      2: { name: 'Basic Circuit', difficulty: 'Easy' as const, size: 4, sources: 1, targets: 1, par: 8 },
      3: { name: 'Expanding Grid', difficulty: 'Easy' as const, size: 4, sources: 1, targets: 2, par: 12 },
      4: { name: 'Multiple Sources', difficulty: 'Medium' as const, size: 5, sources: 2, targets: 2, par: 15 },
      5: { name: 'Complex Network', difficulty: 'Medium' as const, size: 5, sources: 2, targets: 3, par: 20 },
      6: { name: 'Timed Challenge', difficulty: 'Medium' as const, size: 6, sources: 2, targets: 3, par: 25, timeLimit: 180 },
      7: { name: 'Expert Level', difficulty: 'Hard' as const, size: 6, sources: 3, targets: 4, par: 30, timeLimit: 240 },
      8: { name: 'Nightmare Circuit', difficulty: 'Extreme' as const, size: 7, sources: 3, targets: 5, par: 40, timeLimit: 300 },
      9: { name: 'Impossible Grid', difficulty: 'Impossible' as const, size: 8, sources: 4, targets: 6, par: 50, timeLimit: 360 },
      10: { name: 'Final Challenge', difficulty: 'Impossible' as const, size: 9, sources: 4, targets: 7, par: 60, timeLimit: 420 }
    };

    const config = difficultyMap[levelNum as keyof typeof difficultyMap] || 
                  { name: `Level ${levelNum}`, difficulty: 'Impossible' as const, size: 9, sources: 5, targets: 8, par: 70, timeLimit: 480 };

    const { size, sources: numSources, targets: numTargets } = config;
    const grid: GamePiece[][] = Array(size).fill(null).map(() => 
      Array(size).fill(null).map(() => generatePiece('empty'))
    );

    // Place sources and targets
    const sources: { x: number; y: number }[] = [];
    const targets: { x: number; y: number }[] = [];

    // Place sources randomly
    for (let i = 0; i < numSources; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
      } while (sources.some(s => s.x === x && s.y === y));
      
      sources.push({ x, y });
      grid[y][x] = { ...generatePiece('source'), rotation: 0 };
    }

    // Place targets randomly
    for (let i = 0; i < numTargets; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
      } while (sources.some(s => s.x === x && s.y === y) || targets.some(t => t.x === x && t.y === y));
      
      targets.push({ x, y });
      grid[y][x] = { ...generatePiece('target'), rotation: 0 };
    }

    // Fill with random pieces (more complex for higher levels)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (grid[y][x].type === 'empty') {
          const pieceTypes: PieceType[] = levelNum >= 4 ? 
            ['straight', 'corner', 'cross', 'blocker'] :
            ['straight', 'corner'];
          
          const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
          grid[y][x] = generatePiece(randomType);
        }
      }
    }

    return {
      id: levelNum,
      name: config.name,
      difficulty: config.difficulty,
      timeLimit: config.timeLimit,
      description: `Connect all power sources to targets. Par: ${config.par} moves`,
      board: { grid, width: size, height: size, sources, targets },
      par: config.par
    };
  };

  // Start level
  const startLevel = (levelNum: number) => {
    const level = generateLevel(levelNum);
    setCurrentLevel(levelNum);
    setGameBoard(level.board);
    setGameState('playing');
    setTimer(0);
    setGameStartTime(Date.now());
    setGameStats(prev => ({ ...prev, level: levelNum, moves: 0 }));
  };

  // Rotate piece
  const rotatePiece = (x: number, y: number) => {
    if (!gameBoard || gameState !== 'playing') return;

    const newGrid = [...gameBoard.grid];
    const piece = newGrid[y][x];
    
    if (piece.type === 'source' || piece.type === 'target') return;

    piece.rotation = (piece.rotation + 90) % 360;
    
    setGameBoard({ ...gameBoard, grid: newGrid });
    setGameStats(prev => ({ ...prev, moves: prev.moves + 1 }));
    
    // Check win condition
    setTimeout(() => {
      checkWinCondition();
    }, 100);
  };

  // Check win condition
  const checkWinCondition = () => {
    if (!gameBoard) return;

    // Simple win check - all targets should be connected
    const allTargetsConnected = gameBoard.targets.every(target => {
      const piece = gameBoard.grid[target.y][target.x];
      return piece.isConnected;
    });

    if (allTargetsConnected) {
      setGameState('completed');
      const levelTime = timer;
      const newCompleted = [...gameStats.completed];
      newCompleted[currentLevel - 1] = true;
      
      setGameStats(prev => ({
        ...prev,
        completed: newCompleted,
        score: prev.score + Math.max(1000 - prev.moves * 10 - levelTime, 100)
      }));

      // Check achievements
      checkAchievements(levelTime);
    }
  };

  // Check achievements
  const checkAchievements = (levelTime: number) => {
    const newAchievements = [...achievements];
    let updated = false;

    // First win
    if (!newAchievements.find(a => a.id === 'first_win')?.unlocked) {
      newAchievements.find(a => a.id === 'first_win')!.unlocked = true;
      updated = true;
    }

    // Speed demon
    if (levelTime < 30 && !newAchievements.find(a => a.id === 'speed_demon')?.unlocked) {
      newAchievements.find(a => a.id === 'speed_demon')!.unlocked = true;
      updated = true;
    }

    // Efficient
    const level = generateLevel(currentLevel);
    if (gameStats.moves <= level.par && !newAchievements.find(a => a.id === 'efficient')?.unlocked) {
      newAchievements.find(a => a.id === 'efficient')!.unlocked = true;
      updated = true;
    }

    // Persistent
    if (gameStats.totalPlayTime >= 1800 && !newAchievements.find(a => a.id === 'persistent')?.unlocked) {
      newAchievements.find(a => a.id === 'persistent')!.unlocked = true;
      updated = true;
    }

    // Puzzle master
    const completedCount = gameStats.completed.filter(Boolean).length;
    if (completedCount >= 5 && !newAchievements.find(a => a.id === 'puzzle_master')?.unlocked) {
      newAchievements.find(a => a.id === 'puzzle_master')!.unlocked = true;
      updated = true;
    }

    // Impossible task
    if (currentLevel >= 8 && !newAchievements.find(a => a.id === 'impossible_task')?.unlocked) {
      newAchievements.find(a => a.id === 'impossible_task')!.unlocked = true;
      updated = true;
    }

    if (updated) {
      setAchievements(newAchievements);
    }
  };

  // AI Hint System
  const getAIHint = () => {
    if (!gameBoard || aiLoading) return;

    const boardState = gameBoard.grid.map(row => 
      row.map(piece => ({
        type: piece.type,
        rotation: piece.rotation
      }))
    );

    const prompt = `Analyze this circuit puzzle board state and provide a hint for the next best move. 
    Board: ${JSON.stringify(boardState)}
    Sources: ${JSON.stringify(gameBoard.sources)}
    Targets: ${JSON.stringify(gameBoard.targets)}
    Current moves: ${gameStats.moves}
    
    Return JSON with: {"hint": "description of suggested move", "x": coordinate, "y": coordinate, "action": "rotate/analysis"}`;

    setAiPrompt(prompt);
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError("Failed to get AI hint");
    }
  };

  // Export game data
  const exportGameData = () => {
    const data = {
      stats: gameStats,
      achievements: achievements,
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circuit-breaker-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Import game data
  const importGameData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.stats) setGameStats(data.stats);
        if (data.achievements) setAchievements(data.achievements);
        if (data.settings) setSettings(data.settings);
      } catch (error) {
        console.error('Failed to import data:', error);
      }
    };
    reader.readAsText(file);
  };

  // Clear all data
  const clearAllData = () => {
    localStorage.removeItem('circuitBreakerStats');
    localStorage.removeItem('circuitBreakerSettings');
    localStorage.removeItem('circuitBreakerAchievements');
    
    setGameStats({
      level: 1,
      score: 0,
      moves: 0,
      timeElapsed: 0,
      completed: [],
      achievements: [],
      totalPlayTime: 0
    });
    
    setAchievements(achievements.map(a => ({ ...a, unlocked: false })));
    
    setSettings({
      soundEnabled: true,
      animationsEnabled: true,
      difficulty: 'normal',
      autoSave: true
    });
  };

  // Render game piece
  const renderPiece = (piece: GamePiece, x: number, y: number) => {
    const baseClasses = "w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105";
    const selectedClasses = selectedPiece?.x === x && selectedPiece?.y === y ? "ring-2 ring-blue-500" : "";
    
    let content = null;
    let bgColor = "bg-gray-100";

    switch (piece.type) {
      case 'source':
        content = <Zap className="w-6 h-6 text-yellow-500" />;
        bgColor = "bg-yellow-100";
        break;
      case 'target':
        content = <Target className="w-6 h-6 text-green-500" />;
        bgColor = "bg-green-100";
        break;
      case 'straight':
        content = <div className="w-8 h-1 bg-blue-500 rounded" style={{ transform: `rotate(${piece.rotation}deg)` }} />;
        break;
      case 'corner':
        content = (
          <div className="relative">
            <div className="w-4 h-1 bg-blue-500 rounded absolute top-0 left-0" style={{ transform: `rotate(${piece.rotation}deg)` }} />
            <div className="w-1 h-4 bg-blue-500 rounded absolute top-0 left-0" style={{ transform: `rotate(${piece.rotation + 90}deg)` }} />
          </div>
        );
        break;
      case 'cross':
        content = (
          <>
            <div className="w-8 h-1 bg-blue-500 rounded absolute" />
            <div className="w-1 h-8 bg-blue-500 rounded absolute" />
          </>
        );
        break;
      case 'blocker':
        content = <div className="w-6 h-6 bg-red-500 rounded" />;
        bgColor = "bg-red-100";
        break;
    }

    return (
      <div
        key={`${x}-${y}`}
        className={`${baseClasses} ${bgColor} ${selectedClasses} ${piece.hasPower ? 'ring-2 ring-yellow-400' : ''}`}
        onClick={() => {
          setSelectedPiece({ x, y });
          rotatePiece(x, y);
        }}
      >
        {content}
      </div>
    );
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Circuit Breaker</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Puzzle Challenge Game</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser && (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                    <User className="w-4 h-4" />
                    <span>Welcome, {currentUser.first_name}</span>
                  </div>
                  <button onClick={logout} className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200">
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b">
        <div className="container-fluid">
          <div className="flex gap-1 py-2">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'game', label: 'Play Game', icon: Play },
              { id: 'stats', label: 'Statistics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`${id}-tab`}
                onClick={() => setCurrentTab(id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  currentTab === id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {currentTab === 'home' && (
          <div id="generation_issue_fallback" className="space-y-6">
            {/* Hero Section */}
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Circuit Breaker
              </h2>
              <p className="text-lg text-gray-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                Connect power sources to targets by rotating circuit pieces. Start easy and work your way up to impossible challenges!
              </p>
              <button
                id="start-game-button"
                onClick={() => {
                  setCurrentTab('game');
                  if (gameState === 'menu') {
                    startLevel(gameStats.level || 1);
                  }
                }}
                className="btn btn-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Playing
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="stat-title">Current Level</div>
                <div className="stat-value">{gameStats.level}</div>
                <div className="stat-desc">Best progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Score</div>
                <div className="stat-value">{gameStats.score.toLocaleString()}</div>
                <div className="stat-desc">Points earned</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Levels Completed</div>
                <div className="stat-value">{gameStats.completed.filter(Boolean).length}</div>
                <div className="stat-desc">Out of {gameStats.completed.length || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Play Time</div>
                <div className="stat-value">{formatTime(gameStats.totalPlayTime)}</div>
                <div className="stat-desc">Total time played</div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.slice(0, 6).map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border-2 ${
                      achievement.unlocked
                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div>
                        <div className={`font-medium ${achievement.unlocked ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-600 dark:text-slate-400'}`}>
                          {achievement.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-500">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'game' && (
          <div className="space-y-6">
            {gameState === 'menu' && (
              <div className="card text-center">
                <h2 className="text-2xl font-bold mb-4">Select Level</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  {Array.from({ length: 10 }, (_, i) => {
                    const levelNum = i + 1;
                    const level = generateLevel(levelNum);
                    const isCompleted = gameStats.completed[i];
                    const isLocked = levelNum > (gameStats.level || 1);
                    
                    return (
                      <button
                        key={levelNum}
                        id={`level-${levelNum}-button`}
                        onClick={() => !isLocked && startLevel(levelNum)}
                        disabled={isLocked}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isLocked
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isCompleted
                            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        <div className="text-lg font-bold">Level {levelNum}</div>
                        <div className="text-sm">{level.name}</div>
                        <div className={`text-xs px-2 py-1 rounded mt-2 ${
                          level.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          level.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          level.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                          level.difficulty === 'Extreme' ? 'bg-red-100 text-red-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {level.difficulty}
                        </div>
                        {isCompleted && <Star className="w-4 h-4 text-yellow-500 mx-auto mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {gameState === 'playing' && gameBoard && (
              <div className="space-y-4">
                {/* Game Header */}
                <div className="flex-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold">Level {currentLevel}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(timer)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <RotateCw className="w-4 h-4" />
                      <span>{gameStats.moves} moves</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      id="ai-hint-button"
                      onClick={getAIHint}
                      disabled={aiLoading}
                      className="btn btn-sm bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Lightbulb className="w-4 h-4 mr-1" />
                      )}
                      AI Hint
                    </button>
                    <button
                      onClick={() => setGameState('menu')}
                      className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Back to Menu
                    </button>
                  </div>
                </div>

                {/* Game Board */}
                <div className="card">
                  <div className="flex justify-center">
                    <div 
                      className="grid gap-1 p-4"
                      style={{ 
                        gridTemplateColumns: `repeat(${gameBoard.width}, 1fr)`,
                        maxWidth: '600px'
                      }}
                    >
                      {gameBoard.grid.map((row, y) =>
                        row.map((piece, x) => renderPiece(piece, x, y))
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Hint Display */}
                {aiResult && (
                  <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      AI Hint
                    </h4>
                    <div className="text-purple-700 dark:text-purple-300">
                      {aiResult}
                    </div>
                  </div>
                )}

                {aiError && (
                  <div className="alert alert-error">
                    <p>AI Hint Error: {aiError.toString()}</p>
                  </div>
                )}
              </div>
            )}

            {gameState === 'completed' && (
              <div className="card text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Level Completed!</h2>
                <p className="text-gray-600 dark:text-slate-400 mb-4">
                  You completed Level {currentLevel} in {gameStats.moves} moves and {formatTime(timer)}
                </p>
                <div className="flex-center gap-3">
                  <button
                    onClick={() => {
                      const nextLevel = currentLevel + 1;
                      if (nextLevel <= 10) {
                        startLevel(nextLevel);
                      } else {
                        setGameState('menu');
                      }
                    }}
                    className="btn btn-primary"
                  >
                    {currentLevel < 10 ? 'Next Level' : 'Back to Menu'}
                  </button>
                  <button
                    onClick={() => startLevel(currentLevel)}
                    className="btn bg-gray-500 text-white hover:bg-gray-600"
                  >
                    Replay Level
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentTab === 'stats' && (
          <div id="stats-tab" className="space-y-6">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="stat-title">Highest Level</div>
                <div className="stat-value">{gameStats.level}</div>
                <div className="stat-desc">Best progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Score</div>
                <div className="stat-value">{gameStats.score.toLocaleString()}</div>
                <div className="stat-desc">Points earned</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Moves</div>
                <div className="stat-value">{gameStats.moves}</div>
                <div className="stat-desc">Last session</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Play Time</div>
                <div className="stat-value">{formatTime(gameStats.totalPlayTime)}</div>
                <div className="stat-desc">Total time played</div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Level Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 10 }, (_, i) => {
                  const levelNum = i + 1;
                  const level = generateLevel(levelNum);
                  const isCompleted = gameStats.completed[i];
                  
                  return (
                    <div
                      key={levelNum}
                      className={`p-3 rounded-lg border ${
                        isCompleted
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                          : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex-between">
                        <div>
                          <div className="font-medium">Level {levelNum}: {level.name}</div>
                          <div className="text-sm text-gray-500">{level.difficulty}</div>
                        </div>
                        {isCompleted ? (
                          <Star className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Achievements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 ${
                      achievement.unlocked
                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div>
                        <div className={`font-medium ${achievement.unlocked ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-600 dark:text-slate-400'}`}>
                          {achievement.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-500">
                          {achievement.description}
                        </div>
                        {achievement.unlocked && (
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            ✓ Unlocked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'settings' && (
          <div id="settings-tab" className="space-y-6">
            {/* Game Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Game Settings</h3>
              <div className="space-y-4">
                <div className="flex-between">
                  <div>
                    <div className="font-medium">Sound Effects</div>
                    <div className="text-sm text-gray-500">Enable game sound effects</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex-between">
                  <div>
                    <div className="font-medium">Animations</div>
                    <div className="text-sm text-gray-500">Enable smooth animations</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.animationsEnabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, animationsEnabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex-between">
                  <div>
                    <div className="font-medium">Auto Save</div>
                    <div className="text-sm text-gray-500">Automatically save progress</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="form-label">Difficulty Preference</label>
                  <select
                    value={settings.difficulty}
                    onChange={(e) => setSettings(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="input"
                  >
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Data Management</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={exportGameData}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Game Data
                  </button>
                  
                  <label className="btn bg-gray-500 text-white hover:bg-gray-600 cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Import Game Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={importGameData}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={clearAllData}
                    className="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    This will permanently delete all your game progress, achievements, and settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Game Info */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">About Circuit Breaker</h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
                <p>
                  Circuit Breaker is a challenging puzzle game where you connect power sources to targets by rotating circuit pieces.
                </p>
                <p>
                  The game features 10+ levels with increasing difficulty. Levels 1-3 are designed for learning, 4-6 for moderate challenge, 
                  level 7 becomes significantly harder, and level 8+ are practically impossible to solve without perfect strategy.
                </p>
                <p>
                  Use the AI Hint system to get intelligent suggestions when you're stuck. The AI analyzes your current board state 
                  and suggests optimal moves to help you progress.
                </p>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-xs">
                    Need help? The AI hints are powered by advanced analysis and can guide you through complex puzzles.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t mt-12">
        <div className="container-fluid py-4">
          <div className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;