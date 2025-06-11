import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import { Trophy, RotateCcw, Settings, History, Play, User, Crown, Medal, Target, Zap, X, Circle } from 'lucide-react';

// Types and Interfaces
type Player = 'X' | 'O';
type CellValue = Player | null;
type GameBoard = CellValue[][];
type GameStatus = 'playing' | 'won' | 'draw';

interface GameState {
  board: GameBoard;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[];
}

interface GameResult {
  id: string;
  date: string;
  winner: Player | 'draw';
  playerX: string;
  playerO: string;
  moves: number;
  duration: string;
}

interface PlayerStats {
  name: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
}

interface Settings {
  playerXName: string;
  playerOName: string;
  soundEnabled: boolean;
  animationsEnabled: boolean;
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

// Settings component props
interface RenderSettingsProps {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetAllStats: () => void;
  toggleDarkMode: () => void;
  isDark: boolean;
}

// Render settings tab as a proper component
const RenderSettings: React.FC<RenderSettingsProps> = ({ 
  settings, 
  updateSettings, 
  resetAllStats, 
  toggleDarkMode, 
  isDark 
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSaveSettings = () => {
    updateSettings(localSettings);
  };

  return (
    <div className="space-y-6">
      <h2 className="heading-3">Settings</h2>

      <div className="space-y-6">
        {/* Player Names */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Player Names</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label" htmlFor="playerX">Player X Name</label>
              <input
                id="playerX"
                type="text"
                className="input"
                value={localSettings.playerXName}
                onChange={(e) => setLocalSettings({...localSettings, playerXName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="playerO">Player O Name</label>
              <input
                id="playerO"
                type="text"
                className="input"
                value={localSettings.playerOName}
                onChange={(e) => setLocalSettings({...localSettings, playerOName: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Game Preferences */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Game Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Sound Effects</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Play sounds for game events</div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={(e) => setLocalSettings({...localSettings, soundEnabled: e.target.checked})}
                  className="sr-only"
                />
                <div className={`toggle ${localSettings.soundEnabled ? 'toggle-checked' : ''}`}>
                  <div className="toggle-thumb"></div>
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Animations</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Enable smooth animations</div>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={localSettings.animationsEnabled}
                  onChange={(e) => setLocalSettings({...localSettings, animationsEnabled: e.target.checked})}
                  className="sr-only"
                />
                <div className={`toggle ${localSettings.animationsEnabled ? 'toggle-checked' : ''}`}>
                  <div className="toggle-thumb"></div>
                </div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Toggle dark/light theme</div>
              </div>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={resetAllStats}
              className="btn btn-error w-full"
            >
              Reset All Statistics
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This will clear all game history and statistics. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          className="btn btn-primary w-full"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};


export default function App() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();

  // Game State
  const [gameState, setGameState] = useState<GameState>({
    board: Array(3).fill(null).map(() => Array(3).fill(null)),
    currentPlayer: 'X',
    status: 'playing',
    winner: null,
    winningCells: []
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<'game' | 'history' | 'settings'>('game');
  
  // Game Data
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [playerStats, setPlayerStats] = useState<{ X: PlayerStats; O: PlayerStats }>({
    X: { name: 'Player X', wins: 0, losses: 0, draws: 0, totalGames: 0 },
    O: { name: 'Player O', wins: 0, losses: 0, draws: 0, totalGames: 0 }
  });
  
  // Game Session Data
  const [gameStartTime, setGameStartTime] = useState<Date>(new Date());
  const [moveCount, setMoveCount] = useState(0);
  
  // Settings
  const [settings, setSettings] = useState<Settings>({
    playerXName: 'Player X',
    playerOName: 'Player O',
    soundEnabled: true,
    animationsEnabled: true
  });

  // UI State
  const [showWinModal, setShowWinModal] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ticTacToeHistory');
    const savedStats = localStorage.getItem('ticTacToeStats');
    const savedSettings = localStorage.getItem('ticTacToeSettings');

    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory));
    }
    if (savedStats) {
      setPlayerStats(JSON.parse(savedStats));
    }
    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      setSettings(loadedSettings);
    }
  }, []);

  // Save data to localStorage
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Check for winner
  const checkWinner = (board: GameBoard): { winner: Player | null; winningCells: number[] } => {
    const lines = [
      [[0, 0], [0, 1], [0, 2]], // Top row
      [[1, 0], [1, 1], [1, 2]], // Middle row
      [[2, 0], [2, 1], [2, 2]], // Bottom row
      [[0, 0], [1, 0], [2, 0]], // Left column
      [[0, 1], [1, 1], [2, 1]], // Middle column
      [[0, 2], [1, 2], [2, 2]], // Right column
      [[0, 0], [1, 1], [2, 2]], // Diagonal
      [[0, 2], [1, 1], [2, 0]]  // Anti-diagonal
    ];

    for (let i = 0; i < lines.length; i++) {
      const [[a, b], [c, d], [e, f]] = lines[i];
      if (board[a][b] && board[a][b] === board[c][d] && board[a][b] === board[e][f]) {
        return { 
          winner: board[a][b], 
          winningCells: [a * 3 + b, c * 3 + d, e * 3 + f] 
        };
      }
    }

    return { winner: null, winningCells: [] };
  };

  // Check if board is full
  const isBoardFull = (board: GameBoard): boolean => {
    return board.every(row => row.every(cell => cell !== null));
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameState.board[row][col] !== null || gameState.status !== 'playing') {
      return;
    }

    const newBoard = gameState.board.map(r => [...r]);
    newBoard[row][col] = gameState.currentPlayer;

    const { winner, winningCells } = checkWinner(newBoard);
    const newMoveCount = moveCount + 1;
    setMoveCount(newMoveCount);

    let newStatus: GameStatus = 'playing';
    if (winner) {
      newStatus = 'won';
      setShowWinModal(true);
      // Update stats
      const newStats = { ...playerStats };
      newStats[winner].wins++;
      newStats[winner === 'X' ? 'O' : 'X'].losses++;
      newStats.X.totalGames++;
      newStats.O.totalGames++;
      setPlayerStats(newStats);
      saveToStorage('ticTacToeStats', newStats);

      // Add to history
      const gameResult: GameResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        winner,
        playerX: settings.playerXName,
        playerO: settings.playerOName,
        moves: newMoveCount,
        duration: Math.floor((Date.now() - gameStartTime.getTime()) / 1000).toString() + 's'
      };
      const newHistory = [gameResult, ...gameHistory];
      setGameHistory(newHistory);
      saveToStorage('ticTacToeHistory', newHistory);
    } else if (isBoardFull(newBoard)) {
      newStatus = 'draw';
      setShowWinModal(true);
      // Update stats for draw
      const newStats = { ...playerStats };
      newStats.X.draws++;
      newStats.O.draws++;
      newStats.X.totalGames++;
      newStats.O.totalGames++;
      setPlayerStats(newStats);
      saveToStorage('ticTacToeStats', newStats);

      // Add to history
      const gameResult: GameResult = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        winner: 'draw',
        playerX: settings.playerXName,
        playerO: settings.playerOName,
        moves: newMoveCount,
        duration: Math.floor((Date.now() - gameStartTime.getTime()) / 1000).toString() + 's'
      };
      const newHistory = [gameResult, ...gameHistory];
      setGameHistory(newHistory);
      saveToStorage('ticTacToeHistory', newHistory);
    }

    setGameState({
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'X' ? 'O' : 'X',
      status: newStatus,
      winner,
      winningCells
    });
  };

  // Reset game
  const resetGame = () => {
    setGameState({
      board: Array(3).fill(null).map(() => Array(3).fill(null)),
      currentPlayer: 'X',
      status: 'playing',
      winner: null,
      winningCells: []
    });
    setShowWinModal(false);
    setGameStartTime(new Date());
    setMoveCount(0);
  };

  // Reset all stats
  const resetAllStats = () => {
    const newStats = {
      X: { name: settings.playerXName, wins: 0, losses: 0, draws: 0, totalGames: 0 },
      O: { name: settings.playerOName, wins: 0, losses: 0, draws: 0, totalGames: 0 }
    };
    setPlayerStats(newStats);
    setGameHistory([]);
    saveToStorage('ticTacToeStats', newStats);
    saveToStorage('ticTacToeHistory', []);
  };

  // Update settings
  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveToStorage('ticTacToeSettings', updatedSettings);
    
    // Update player stats names
    if (newSettings.playerXName || newSettings.playerOName) {
      const newStats = { ...playerStats };
      if (newSettings.playerXName) newStats.X.name = newSettings.playerXName;
      if (newSettings.playerOName) newStats.O.name = newSettings.playerOName;
      setPlayerStats(newStats);
      saveToStorage('ticTacToeStats', newStats);
    }
  };

  // Get cell content
  const getCellContent = (row: number, col: number) => {
    const value = gameState.board[row][col];
    if (value === 'X') {
      return <X className="w-8 h-8 text-blue-500" strokeWidth={3} />;
    } else if (value === 'O') {
      return <Circle className="w-8 h-8 text-red-500" strokeWidth={3} />;
    }
    return null;
  };

  // Render game board
  const renderGameBoard = () => (
    <div className="flex flex-col items-center space-y-6">
      {/* Current Player Indicator */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-2">
          {gameState.currentPlayer === 'X' ? 
            <X className="w-6 h-6 text-blue-500" strokeWidth={3} /> : 
            <Circle className="w-6 h-6 text-red-500" strokeWidth={3} />
          }
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {gameState.currentPlayer === 'X' ? settings.playerXName : settings.playerOName}'s Turn
          </span>
        </div>
        <Target className="w-5 h-5 text-purple-500" />
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-3 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        {gameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellIndex = rowIndex * 3 + colIndex;
            const isWinningCell = gameState.winningCells.includes(cellIndex);
            const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;
            
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                onMouseLeave={() => setHoveredCell(null)}
                className={`
                  w-20 h-20 flex items-center justify-center rounded-xl border-2 transition-all duration-200
                  ${isWinningCell 
                    ? 'bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-500' 
                    : 'bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
                  }
                  ${cell === null && gameState.status === 'playing' 
                    ? 'hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-500 cursor-pointer' 
                    : ''
                  }
                  ${isHovered && cell === null && gameState.status === 'playing' 
                    ? 'scale-105 shadow-md' 
                    : ''
                  }
                  ${settings.animationsEnabled ? 'transform' : ''}
                `}
                disabled={cell !== null || gameState.status !== 'playing'}
              >
                {getCellContent(rowIndex, colIndex)}
              </button>
            );
          })
        )}
      </div>

      {/* Game Controls */}
      <div className="flex gap-4">
        <button
          onClick={resetGame}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          New Game
        </button>
      </div>
    </div>
  );

  // Render score board
  const renderScoreBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Player X Stats */}
      <div className="card card-padding bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-3 mb-3">
          <X className="w-6 h-6 text-blue-500" strokeWidth={3} />
          <h3 className="heading-5 text-blue-700 dark:text-blue-300">{settings.playerXName}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{playerStats.X.wins}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{playerStats.X.losses}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Losses</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">{playerStats.X.draws}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Draws</div>
          </div>
        </div>
      </div>

      {/* Player O Stats */}
      <div className="card card-padding bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
        <div className="flex items-center gap-3 mb-3">
          <Circle className="w-6 h-6 text-red-500" strokeWidth={3} />
          <h3 className="heading-5 text-red-700 dark:text-red-300">{settings.playerOName}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{playerStats.O.wins}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{playerStats.O.losses}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Losses</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">{playerStats.O.draws}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Draws</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render win modal
  const renderWinModal = () => {
    if (!showWinModal) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowWinModal(false)}>
        <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
          <div className="modal-body text-center py-8">
            {gameState.winner ? (
              <>
                <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="heading-3 mb-2">Congratulations!</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {gameState.winner === 'X' ? settings.playerXName : settings.playerOName} wins!
                </p>
              </>
            ) : (
              <>
                <Medal className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h2 className="heading-3 mb-2">It's a Draw!</h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Great game, both players!
                </p>
              </>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowWinModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  resetGame();
                  setShowWinModal(false);
                }}
                className="btn btn-primary"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render history tab
  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-3">Game History</h2>
        <span className="badge badge-primary">{gameHistory.length} games</span>
      </div>

      {gameHistory.length === 0 ? (
        <div className="card card-padding text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="heading-5 text-gray-600 dark:text-gray-400 mb-2">No games played yet</h3>
          <p className="text-gray-500 dark:text-gray-500">Start playing to see your game history here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gameHistory.slice(0, 20).map((game) => (
            <div key={game.id} className="card card-padding">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {game.winner === 'X' ? (
                      <X className="w-5 h-5 text-blue-500" strokeWidth={3} />
                    ) : game.winner === 'O' ? (
                      <Circle className="w-5 h-5 text-red-500" strokeWidth={3} />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-400"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {game.winner === 'draw' 
                        ? 'Draw' 
                        : `${game.winner === 'X' ? game.playerX : game.playerO} won`
                      }
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {game.playerX} vs {game.playerO}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(game.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {game.moves} moves • {game.duration}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container container-lg">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="heading-5 text-gray-900 dark:text-white">Tic-Tac-Toe Master</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {currentUser.first_name}!</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container container-lg">
          <div className="flex space-x-8">
            <button
              id="game-tab"
              onClick={() => setActiveTab('game')}
              className={`tab ${activeTab === 'game' ? 'tab-active' : ''}`}
            >
              <Play className="w-4 h-4" />
              Game
            </button>
            <button
              id="history-tab"
              onClick={() => setActiveTab('history')}
              className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              id="settings-tab"
              onClick={() => setActiveTab('settings')}
              className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container container-lg py-8">
        <div id="generation_issue_fallback">
          {activeTab === 'game' && (
            <div className="space-y-8">
              {renderScoreBoard()}
              {renderGameBoard()}
            </div>
          )}

          {activeTab === 'history' && renderHistory()}
          {activeTab === 'settings' && <RenderSettings
            settings={settings}
            updateSettings={updateSettings}
            resetAllStats={resetAllStats}
            toggleDarkMode={toggleDarkMode}
            isDark={isDark}
           />}
        </div>
      </main>

      {/* Win Modal */}
      {renderWinModal()}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 theme-transition">
        <div className="container container-lg py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}