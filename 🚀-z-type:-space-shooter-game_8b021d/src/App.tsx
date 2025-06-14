import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './contexts/authContext';
import { 
  Play, 
  Pause, 
  Settings, 
  Trophy, 
  RotateCcw, 
  Zap, 
  Shield, 
  Target,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  LogOut,
  User,
  Download,
  Trash2,
  Upload
} from 'lucide-react';

// Types and Interfaces
interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface GameObject {
  id: string;
  position: Position;
  velocity: Velocity;
  width: number;
  height: number;
}

interface Player extends GameObject {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  fireRate: number;
  lastFired: number;
  multiShot: boolean;
  rapidFire: boolean;
}

interface Enemy extends GameObject {
  health: number;
  maxHealth: number;
  type: 'basic' | 'fast' | 'heavy' | 'boss';
  points: number;
  lastFired: number;
  fireRate: number;
}

interface Bullet extends GameObject {
  damage: number;
  isPlayerBullet: boolean;
}

interface PowerUp extends GameObject {
  type: 'health' | 'shield' | 'rapidFire' | 'multiShot' | 'scoreMultiplier';
  duration?: number;
}

interface Particle extends GameObject {
  life: number;
  maxLife: number;
  color: string;
}

interface GameStats {
  score: number;
  level: number;
  enemiesKilled: number;
  accuracy: number;
  shotsFired: number;
  shotsHit: number;
}

interface GameData {
  highScores: number[];
  totalGamesPlayed: number;
  totalScore: number;
  settings: GameSettings;
}

interface GameSettings {
  soundEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  controls: 'wasd' | 'arrows';
}

// Custom hook for dark mode
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

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 8;
const ENEMY_BULLET_SPEED = 4;

const App: React.Component = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  
  // Game state
  const [currentScreen, setCurrentScreen] = useState<'menu' | 'game' | 'gameOver' | 'settings' | 'highScores'>('menu');
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver'>('playing');
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    level: 1,
    enemiesKilled: 0,
    accuracy: 0,
    shotsFired: 0,
    shotsHit: 0
  });
  
  // Game objects
  const [player, setPlayer] = useState<Player>({
    id: 'player',
    position: { x: GAME_WIDTH / 2 - 25, y: GAME_HEIGHT - 80 },
    velocity: { x: 0, y: 0 },
    width: 50,
    height: 50,
    health: 100,
    maxHealth: 100,
    shield: 0,
    maxShield: 50,
    fireRate: 200,
    lastFired: 0,
    multiShot: false,
    rapidFire: false
  });
  
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  // Game settings and data
  const [gameData, setGameData] = useState<GameData>({
    highScores: [],
    totalGamesPlayed: 0,
    totalScore: 0,
    settings: {
      soundEnabled: true,
      difficulty: 'normal',
      controls: 'wasd'
    }
  });
  
  // Input handling
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastTimeRef = useRef<number>(0);
  const enemySpawnTimer = useRef<number>(0);
  const powerUpSpawnTimer = useRef<number>(0);
  
  // Load game data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('ztype-game-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setGameData({ ...gameData, ...parsed });
      } catch (error) {
        console.error('Failed to load game data:', error);
      }
    }
  }, []);
  
  // Save game data to localStorage
  const saveGameData = useCallback((data: Partial<GameData>) => {
    const newData = { ...gameData, ...data };
    setGameData(newData);
    localStorage.setItem('ztype-game-data', JSON.stringify(newData));
  }, [gameData]);
  
  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => new Set(prev).add(e.key.toLowerCase()));
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = new Set(prev);
        newKeys.delete(e.key.toLowerCase());
        return newKeys;
      });
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Generate unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  // Collision detection
  const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
    return obj1.position.x < obj2.position.x + obj2.width &&
           obj1.position.x + obj1.width > obj2.position.x &&
           obj1.position.y < obj2.position.y + obj2.height &&
           obj1.position.y + obj1.height > obj2.position.y;
  };
  
  // Create particle effect
  const createParticles = (x: number, y: number, count: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: generateId(),
        position: { x: x + Math.random() * 20 - 10, y: y + Math.random() * 20 - 10 },
        velocity: { 
          x: (Math.random() - 0.5) * 6, 
          y: (Math.random() - 0.5) * 6 
        },
        width: 3,
        height: 3,
        life: 60,
        maxLife: 60,
        color
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };
  
  // Spawn enemy
  const spawnEnemy = () => {
    const types: Enemy['type'][] = ['basic', 'fast', 'heavy'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let enemy: Enemy;
    
    switch (type) {
      case 'fast':
        enemy = {
          id: generateId(),
          position: { x: Math.random() * (GAME_WIDTH - 40), y: -40 },
          velocity: { x: 0, y: 3 },
          width: 30,
          height: 30,
          health: 20,
          maxHealth: 20,
          type,
          points: 15,
          lastFired: 0,
          fireRate: 1000
        };
        break;
      case 'heavy':
        enemy = {
          id: generateId(),
          position: { x: Math.random() * (GAME_WIDTH - 60), y: -60 },
          velocity: { x: 0, y: 1 },
          width: 60,
          height: 60,
          health: 80,
          maxHealth: 80,
          type,
          points: 50,
          lastFired: 0,
          fireRate: 2000
        };
        break;
      default: // basic
        enemy = {
          id: generateId(),
          position: { x: Math.random() * (GAME_WIDTH - 40), y: -40 },
          velocity: { x: 0, y: 2 },
          width: 40,
          height: 40,
          health: 40,
          maxHealth: 40,
          type,
          points: 25,
          lastFired: 0,
          fireRate: 1500
        };
    }
    
    setEnemies(prev => [...prev, enemy]);
  };
  
  // Spawn power-up
  const spawnPowerUp = () => {
    const types: PowerUp['type'][] = ['health', 'shield', 'rapidFire', 'multiShot', 'scoreMultiplier'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const powerUp: PowerUp = {
      id: generateId(),
      position: { x: Math.random() * (GAME_WIDTH - 30), y: -30 },
      velocity: { x: 0, y: 2 },
      width: 30,
      height: 30,
      type,
      duration: type === 'rapidFire' || type === 'multiShot' || type === 'scoreMultiplier' ? 10000 : undefined
    };
    
    setPowerUps(prev => [...prev, powerUp]);
  };
  
  // Fire bullet
  const fireBullet = (isPlayer: boolean, x: number, y: number, vx: number = 0, vy: number = BULLET_SPEED) => {
    const bullet: Bullet = {
      id: generateId(),
      position: { x, y },
      velocity: { x: vx, y: isPlayer ? -vy : vy },
      width: 4,
      height: 10,
      damage: isPlayer ? 20 : 15,
      isPlayerBullet: isPlayer
    };
    
    setBullets(prev => [...prev, bullet]);
    
    if (isPlayer) {
      setGameStats(prev => ({ ...prev, shotsFired: prev.shotsFired + 1 }));
    }
  };
  
  // Update player
  const updatePlayer = (deltaTime: number) => {
    if (gameState !== 'playing') return;
    
    setPlayer(prev => {
      const newPlayer = { ...prev };
      const controls = gameData.settings.controls;
      const speed = PLAYER_SPEED;
      
      // Movement
      if ((controls === 'wasd' && keys.has('a')) || (controls === 'arrows' && keys.has('arrowleft'))) {
        newPlayer.position.x = Math.max(0, newPlayer.position.x - speed);
      }
      if ((controls === 'wasd' && keys.has('d')) || (controls === 'arrows' && keys.has('arrowright'))) {
        newPlayer.position.x = Math.min(GAME_WIDTH - newPlayer.width, newPlayer.position.x + speed);
      }
      if ((controls === 'wasd' && keys.has('w')) || (controls === 'arrows' && keys.has('arrowup'))) {
        newPlayer.position.y = Math.max(0, newPlayer.position.y - speed);
      }
      if ((controls === 'wasd' && keys.has('s')) || (controls === 'arrows' && keys.has('arrowdown'))) {
        newPlayer.position.y = Math.min(GAME_HEIGHT - newPlayer.height, newPlayer.position.y + speed);
      }
      
      // Firing
      const currentTime = Date.now();
      const fireRate = newPlayer.rapidFire ? newPlayer.fireRate / 3 : newPlayer.fireRate;
      
      if (keys.has(' ') && currentTime - newPlayer.lastFired > fireRate) {
        if (newPlayer.multiShot) {
          fireBullet(true, newPlayer.position.x + newPlayer.width / 2 - 2, newPlayer.position.y);
          fireBullet(true, newPlayer.position.x + 5, newPlayer.position.y, -2);
          fireBullet(true, newPlayer.position.x + newPlayer.width - 5, newPlayer.position.y, 2);
        } else {
          fireBullet(true, newPlayer.position.x + newPlayer.width / 2 - 2, newPlayer.position.y);
        }
        newPlayer.lastFired = currentTime;
      }
      
      return newPlayer;
    });
  };
  
  // Update enemies
  const updateEnemies = (deltaTime: number) => {
    if (gameState !== 'playing') return;
    
    setEnemies(prev => {
      return prev.map(enemy => {
        const newEnemy = { ...enemy };
        newEnemy.position.y += newEnemy.velocity.y;
        
        // Enemy firing
        const currentTime = Date.now();
        if (currentTime - newEnemy.lastFired > newEnemy.fireRate && Math.random() < 0.01) {
          fireBullet(false, newEnemy.position.x + newEnemy.width / 2 - 2, newEnemy.position.y + newEnemy.height);
          newEnemy.lastFired = currentTime;
        }
        
        return newEnemy;
      }).filter(enemy => enemy.position.y < GAME_HEIGHT + 100);
    });
  };
  
  // Update bullets
  const updateBullets = () => {
    if (gameState !== 'playing') return;
    
    setBullets(prev => {
      return prev.map(bullet => ({
        ...bullet,
        position: {
          x: bullet.position.x + bullet.velocity.x,
          y: bullet.position.y + bullet.velocity.y
        }
      })).filter(bullet => 
        bullet.position.y > -20 && 
        bullet.position.y < GAME_HEIGHT + 20 &&
        bullet.position.x > -20 &&
        bullet.position.x < GAME_WIDTH + 20
      );
    });
  };
  
  // Update power-ups
  const updatePowerUps = () => {
    if (gameState !== 'playing') return;
    
    setPowerUps(prev => {
      return prev.map(powerUp => ({
        ...powerUp,
        position: {
          x: powerUp.position.x,
          y: powerUp.position.y + powerUp.velocity.y
        }
      })).filter(powerUp => powerUp.position.y < GAME_HEIGHT + 50);
    });
  };
  
  // Update particles
  const updateParticles = () => {
    setParticles(prev => {
      return prev.map(particle => ({
        ...particle,
        position: {
          x: particle.position.x + particle.velocity.x,
          y: particle.position.y + particle.velocity.y
        },
        life: particle.life - 1
      })).filter(particle => particle.life > 0);
    });
  };
  
  // Handle collisions
  const handleCollisions = () => {
    if (gameState !== 'playing') return;
    
    // Bullet-Enemy collisions
    setBullets(prevBullets => {
      const remainingBullets = [...prevBullets];
      
      setEnemies(prevEnemies => {
        const remainingEnemies = [...prevEnemies];
        
        prevBullets.forEach((bullet, bulletIndex) => {
          if (!bullet.isPlayerBullet) return;
          
          prevEnemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(bullet, enemy)) {
              // Damage enemy
              remainingEnemies[enemyIndex] = {
                ...enemy,
                health: enemy.health - bullet.damage
              };
              
              // Remove bullet
              const bulletIdx = remainingBullets.findIndex(b => b.id === bullet.id);
              if (bulletIdx !== -1) {
                remainingBullets.splice(bulletIdx, 1);
              }
              
              // Hit registered
              setGameStats(prev => ({ 
                ...prev, 
                shotsHit: prev.shotsHit + 1,
                accuracy: Math.round((prev.shotsHit + 1) / Math.max(prev.shotsFired, 1) * 100)
              }));
              
              // Create particles
              createParticles(enemy.position.x + enemy.width / 2, enemy.position.y + enemy.height / 2, 5, '#ff6b6b');
              
              // Check if enemy is destroyed
              if (remainingEnemies[enemyIndex]?.health <= 0) {
                setGameStats(prev => ({ 
                  ...prev, 
                  score: prev.score + enemy.points,
                  enemiesKilled: prev.enemiesKilled + 1
                }));
                
                // Create explosion particles
                createParticles(enemy.position.x + enemy.width / 2, enemy.position.y + enemy.height / 2, 15, '#ffd93d');
                
                // Chance to drop power-up
                if (Math.random() < 0.3) {
                  const powerUp: PowerUp = {
                    id: generateId(),
                    position: { x: enemy.position.x, y: enemy.position.y },
                    velocity: { x: 0, y: 2 },
                    width: 25,
                    height: 25,
                    type: ['health', 'shield', 'rapidFire', 'multiShot'][Math.floor(Math.random() * 4)] as PowerUp['type'],
                    duration: 8000
                  };
                  setPowerUps(prev => [...prev, powerUp]);
                }
                
                // Remove enemy
                remainingEnemies.splice(enemyIndex, 1);
              }
            }
          });
        });
        
        return remainingEnemies;
      });
      
      return remainingBullets;
    });
    
    // Enemy bullet-Player collisions
    setBullets(prevBullets => {
      const remainingBullets = [...prevBullets];
      
      prevBullets.forEach((bullet, index) => {
        if (bullet.isPlayerBullet) return;
        
        if (checkCollision(bullet, player)) {
          setPlayer(prev => {
            let damage = bullet.damage;
            let newPlayer = { ...prev };
            
            if (newPlayer.shield > 0) {
              newPlayer.shield = Math.max(0, newPlayer.shield - damage);
              damage = Math.max(0, damage - newPlayer.shield);
            }
            
            if (damage > 0) {
              newPlayer.health = Math.max(0, newPlayer.health - damage);
            }
            
            return newPlayer;
          });
          
          // Remove bullet
          const bulletIdx = remainingBullets.findIndex(b => b.id === bullet.id);
          if (bulletIdx !== -1) {
            remainingBullets.splice(bulletIdx, 1);
          }
          
          // Create hit particles
          createParticles(player.position.x + player.width / 2, player.position.y + player.height / 2, 8, '#ff4757');
        }
      });
      
      return remainingBullets;
    });
    
    // Enemy-Player collisions
    setEnemies(prevEnemies => {
      const remainingEnemies = [...prevEnemies];
      
      prevEnemies.forEach((enemy, index) => {
        if (checkCollision(enemy, player)) {
          setPlayer(prev => {
            let damage = 25;
            let newPlayer = { ...prev };
            
            if (newPlayer.shield > 0) {
              newPlayer.shield = Math.max(0, newPlayer.shield - damage);
              damage = Math.max(0, damage - newPlayer.shield);
            }
            
            if (damage > 0) {
              newPlayer.health = Math.max(0, newPlayer.health - damage);
            }
            
            return newPlayer;
          });
          
          // Create collision particles
          createParticles(enemy.position.x + enemy.width / 2, enemy.position.y + enemy.height / 2, 12, '#ff6348');
          
          // Remove enemy
          remainingEnemies.splice(index, 1);
        }
      });
      
      return remainingEnemies;
    });
    
    // PowerUp-Player collisions
    setPowerUps(prevPowerUps => {
      const remainingPowerUps = [...prevPowerUps];
      
      prevPowerUps.forEach((powerUp, index) => {
        if (checkCollision(powerUp, player)) {
          setPlayer(prev => {
            let newPlayer = { ...prev };
            
            switch (powerUp.type) {
              case 'health':
                newPlayer.health = Math.min(newPlayer.maxHealth, newPlayer.health + 30);
                break;
              case 'shield':
                newPlayer.shield = newPlayer.maxShield;
                break;
              case 'rapidFire':
                newPlayer.rapidFire = true;
                setTimeout(() => {
                  setPlayer(p => ({ ...p, rapidFire: false }));
                }, powerUp.duration || 10000);
                break;
              case 'multiShot':
                newPlayer.multiShot = true;
                setTimeout(() => {
                  setPlayer(p => ({ ...p, multiShot: false }));
                }, powerUp.duration || 10000);
                break;
              case 'scoreMultiplier':
                // Double points for 10 seconds
                break;
            }
            
            return newPlayer;
          });
          
          // Create pickup particles
          createParticles(powerUp.position.x + powerUp.width / 2, powerUp.position.y + powerUp.height / 2, 8, '#6c5ce7');
          
          // Remove power-up
          remainingPowerUps.splice(index, 1);
        }
      });
      
      return remainingPowerUps;
    });
  };
  
  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (currentScreen !== 'game') return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    updateBullets();
    updatePowerUps();
    updateParticles();
    handleCollisions();
    
    // Spawn enemies
    enemySpawnTimer.current += deltaTime;
    const spawnRate = Math.max(1000 - gameStats.level * 50, 500);
    if (enemySpawnTimer.current > spawnRate) {
      spawnEnemy();
      enemySpawnTimer.current = 0;
    }
    
    // Spawn power-ups
    powerUpSpawnTimer.current += deltaTime;
    if (powerUpSpawnTimer.current > 15000) {
      spawnPowerUp();
      powerUpSpawnTimer.current = 0;
    }
    
    // Level progression
    if (gameStats.enemiesKilled > 0 && gameStats.enemiesKilled % 10 === 0) {
      setGameStats(prev => ({ ...prev, level: Math.floor(prev.enemiesKilled / 10) + 1 }));
    }
    
    // Check game over
    if (player.health <= 0) {
      endGame();
      return;
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [currentScreen, gameState, gameStats, player, keys, gameData.settings]);
  
  // Start game loop
  useEffect(() => {
    if (currentScreen === 'game' && gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [currentScreen, gameState, gameLoop]);
  
  // Start new game
  const startNewGame = () => {
    setPlayer({
      id: 'player',
      position: { x: GAME_WIDTH / 2 - 25, y: GAME_HEIGHT - 80 },
      velocity: { x: 0, y: 0 },
      width: 50,
      height: 50,
      health: 100,
      maxHealth: 100,
      shield: 0,
      maxShield: 50,
      fireRate: 200,
      lastFired: 0,
      multiShot: false,
      rapidFire: false
    });
    
    setGameStats({
      score: 0,
      level: 1,
      enemiesKilled: 0,
      accuracy: 0,
      shotsFired: 0,
      shotsHit: 0
    });
    
    setEnemies([]);
    setBullets([]);
    setPowerUps([]);
    setParticles([]);
    setGameState('playing');
    setCurrentScreen('game');
    
    enemySpawnTimer.current = 0;
    powerUpSpawnTimer.current = 0;
  };
  
  // End game
  const endGame = () => {
    setGameState('gameOver');
    setCurrentScreen('gameOver');
    
    const newHighScores = [...gameData.highScores, gameStats.score]
      .sort((a, b) => b - a)
      .slice(0, 10);
    
    saveGameData({
      highScores: newHighScores,
      totalGamesPlayed: gameData.totalGamesPlayed + 1,
      totalScore: gameData.totalScore + gameStats.score
    });
  };
  
  // Toggle pause
  const togglePause = () => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  };
  
  // Export game data
  const exportGameData = () => {
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ztype-game-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Import game data
  const importGameData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setGameData(imported);
        localStorage.setItem('ztype-game-data', JSON.stringify(imported));
      } catch (error) {
        console.error('Failed to import game data:', error);
      }
    };
    reader.readAsText(file);
  };
  
  // Clear all data
  const clearAllData = () => {
    const defaultData: GameData = {
      highScores: [],
      totalGamesPlayed: 0,
      totalScore: 0,
      settings: {
        soundEnabled: true,
        difficulty: 'normal',
        controls: 'wasd'
      }
    };
    setGameData(defaultData);
    localStorage.setItem('ztype-game-data', JSON.stringify(defaultData));
  };
  
  // Render game objects
  const renderGameObject = (obj: GameObject, className: string, children?: React.ReactNode) => (
    <div
      key={obj.id}
      className={className}
      style={{
        position: 'absolute',
        left: obj.position.x,
        top: obj.position.y,
        width: obj.width,
        height: obj.height,
      }}
    >
      {children}
    </div>
  );
  
  // Menu Screen
  const MenuScreen = () => (
    <div id="welcome_fallback" className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="heading-1 text-white mb-4 animate-fade-in">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Z-TYPE
            </span>
          </h1>
          <p className="text-xl text-blue-100 animate-slide-in-up">
            Epic Space Shooter Adventure
          </p>
          <div className="text-blue-200 space-y-2 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            <p>Welcome, Commander {currentUser?.first_name}!</p>
            <p>Defend Earth from the alien invasion</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <button
            id="play-game-btn"
            onClick={startNewGame}
            className="btn btn-primary btn-lg flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Play className="w-5 h-5" />
            Play Game
          </button>
          
          <button
            id="high-scores-btn"
            onClick={() => setCurrentScreen('highScores')}
            className="btn btn-secondary btn-lg flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Trophy className="w-5 h-5" />
            High Scores
          </button>
          
          <button
            id="settings-btn"
            onClick={() => setCurrentScreen('settings')}
            className="btn btn-secondary btn-lg flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
          
          <button
            onClick={logout}
            className="btn btn-secondary btn-lg flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
        
        <div className="text-sm text-blue-300 space-y-1 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p><strong>Controls:</strong> {gameData.settings.controls === 'wasd' ? 'WASD' : 'Arrow Keys'} to move, Space to shoot</p>
          <p><strong>Goal:</strong> Survive as long as possible and achieve the highest score!</p>
        </div>
      </div>
    </div>
  );
  
  // Game Screen
  const GameScreen = () => (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative">
        {/* Game Canvas */}
        <div 
          id="game-canvas"
          className="relative bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-lg overflow-hidden border-2 border-blue-500/30"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Stars background */}
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Player */}
          {renderGameObject(player, 'bg-gradient-to-t from-blue-400 to-cyan-300 rounded-lg shadow-lg relative', (
            <>
              <div className="absolute inset-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded" />
              {player.shield > 0 && (
                <div className="absolute -inset-2 border-2 border-cyan-400 rounded-lg animate-pulse" />
              )}
            </>
          ))}
          
          {/* Enemies */}
          {enemies.map(enemy => 
            renderGameObject(
              enemy, 
              `rounded-lg shadow-lg ${
                enemy.type === 'fast' ? 'bg-gradient-to-t from-red-500 to-orange-400' :
                enemy.type === 'heavy' ? 'bg-gradient-to-t from-purple-600 to-purple-400' :
                'bg-gradient-to-t from-red-600 to-red-400'
              }`,
              <div className="absolute inset-1 bg-gradient-to-t from-red-700 to-red-500 rounded opacity-80" />
            )
          )}
          
          {/* Bullets */}
          {bullets.map(bullet => 
            renderGameObject(
              bullet, 
              `rounded-full shadow-lg ${
                bullet.isPlayerBullet ? 'bg-gradient-to-t from-cyan-400 to-blue-300' : 'bg-gradient-to-t from-red-400 to-orange-400'
              }`
            )
          )}
          
          {/* Power-ups */}
          {powerUps.map(powerUp => 
            renderGameObject(
              powerUp, 
              `rounded-lg shadow-lg animate-pulse ${
                powerUp.type === 'health' ? 'bg-gradient-to-t from-green-500 to-emerald-400' :
                powerUp.type === 'shield' ? 'bg-gradient-to-t from-blue-500 to-cyan-400' :
                powerUp.type === 'rapidFire' ? 'bg-gradient-to-t from-yellow-500 to-orange-400' :
                powerUp.type === 'multiShot' ? 'bg-gradient-to-t from-purple-500 to-pink-400' :
                'bg-gradient-to-t from-indigo-500 to-purple-400'
              }`,
              <div className="absolute inset-1 rounded bg-white/20" />
            )
          )}
          
          {/* Particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: particle.position.x,
                top: particle.position.y,
                width: particle.width,
                height: particle.height,
                backgroundColor: particle.color,
                opacity: particle.life / particle.maxLife
              }}
            />
          ))}
          
          {/* Game Over Overlay */}
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white space-y-4">
                <h2 className="heading-2 text-red-400">Game Over!</h2>
                <p className="text-xl">Final Score: {gameStats.score}</p>
                <button
                  onClick={() => setCurrentScreen('gameOver')}
                  className="btn btn-primary"
                >
                  View Results
                </button>
              </div>
            </div>
          )}
          
          {/* Pause Overlay */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="text-center text-white space-y-4">
                <h2 className="heading-3">Game Paused</h2>
                <button
                  onClick={togglePause}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Game UI */}
        <div className="absolute top-4 left-4 space-y-2">
          {/* Score */}
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-sm opacity-80">Score</div>
            <div className="text-xl font-bold">{gameStats.score.toLocaleString()}</div>
          </div>
          
          {/* Level */}
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-sm opacity-80">Level</div>
            <div className="text-xl font-bold">{gameStats.level}</div>
          </div>
          
          {/* Stats */}
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-sm space-y-1">
            <div>Enemies: {gameStats.enemiesKilled}</div>
            <div>Accuracy: {gameStats.accuracy}%</div>
          </div>
        </div>
        
        {/* Health & Shield */}
        <div className="absolute top-4 right-4 space-y-2">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-sm opacity-80 mb-1">Health</div>
            <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all duration-300"
                style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
              />
            </div>
            <div className="text-xs text-center mt-1">{player.health}/{player.maxHealth}</div>
          </div>
          
          {player.shield > 0 && (
            <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="text-sm opacity-80 mb-1">Shield</div>
              <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${(player.shield / player.maxShield) * 100}%` }}
                />
              </div>
              <div className="text-xs text-center mt-1">{player.shield}/{player.maxShield}</div>
            </div>
          )}
          
          {/* Active Power-ups */}
          <div className="space-y-1">
            {player.rapidFire && (
              <div className="bg-yellow-500/80 text-black px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
                <Zap className="w-4 h-4 inline mr-1" />
                Rapid Fire
              </div>
            )}
            {player.multiShot && (
              <div className="bg-purple-500/80 text-white px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
                <Target className="w-4 h-4 inline mr-1" />
                Multi Shot
              </div>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-4 left-4">
          <button
            id="pause-btn"
            onClick={togglePause}
            className="btn btn-secondary bg-black/60 text-white border-white/20 backdrop-blur-sm"
          >
            {gameState === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="absolute bottom-4 right-4">
          <button
            onClick={() => setCurrentScreen('menu')}
            className="btn btn-secondary bg-black/60 text-white border-white/20 backdrop-blur-sm"
          >
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
  
  // Game Over Screen
  const GameOverScreen = () => (
    <div id="generation_issue_fallback" className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="heading-1 text-white mb-4 animate-fade-in">
            <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
              Mission Complete!
            </span>
          </h1>
          <p className="text-xl text-red-100 animate-slide-in-up">
            Great job, Commander {currentUser?.first_name}!
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6 bg-black/30 p-6 rounded-xl backdrop-blur-sm animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{gameStats.score.toLocaleString()}</div>
            <div className="text-sm text-gray-300">Final Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{gameStats.level}</div>
            <div className="text-sm text-gray-300">Level Reached</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400">{gameStats.enemiesKilled}</div>
            <div className="text-sm text-gray-300">Enemies Defeated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{gameStats.accuracy}%</div>
            <div className="text-sm text-gray-300">Accuracy</div>
          </div>
        </div>
        
        {gameData.highScores.length > 0 && gameStats.score === Math.max(...gameData.highScores) && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-xl animate-bounce">
            <p className="text-yellow-400 font-bold text-lg">🏆 NEW HIGH SCORE! 🏆</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={startNewGame}
            className="btn btn-primary btn-lg flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          
          <button
            onClick={() => setCurrentScreen('highScores')}
            className="btn btn-secondary btn-lg flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Trophy className="w-4 h-4" />
            High Scores
          </button>
          
          <button
            onClick={() => setCurrentScreen('menu')}
            className="btn btn-secondary btn-lg flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
  
  // High Scores Screen
  const HighScoresScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl w-full">
        <div className="space-y-4">
          <h1 className="heading-1 text-white mb-4 animate-fade-in">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Hall of Fame
            </span>
          </h1>
          <p className="text-xl text-yellow-100 animate-slide-in-up">
            Top Commanders
          </p>
        </div>
        
        <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          {gameData.highScores.length > 0 ? (
            <div className="space-y-3">
              {gameData.highScores.map((score, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-white">Commander {currentUser?.first_name}</span>
                  </div>
                  <div className="text-yellow-400 font-bold text-lg">
                    {score.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No scores yet. Be the first to set a record!</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 bg-black/20 p-4 rounded-xl animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{gameData.totalGamesPlayed}</div>
            <div className="text-sm text-gray-300">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{gameData.totalScore.toLocaleString()}</div>
            <div className="text-sm text-gray-300">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {gameData.totalGamesPlayed > 0 ? Math.round(gameData.totalScore / gameData.totalGamesPlayed).toLocaleString() : 0}
            </div>
            <div className="text-sm text-gray-300">Average Score</div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={startNewGame}
            className="btn btn-primary btn-lg flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Play className="w-4 h-4" />
            New Game
          </button>
          
          <button
            onClick={() => setCurrentScreen('menu')}
            className="btn btn-secondary btn-lg flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
  
  // Settings Screen
  const SettingsScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 dark:from-gray-900 dark:via-gray-800 dark:to-black flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-2xl w-full">
        <div className="space-y-4">
          <h1 className="heading-1 text-white mb-4 animate-fade-in">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
          <p className="text-xl text-indigo-100 animate-slide-in-up">
            Customize Your Experience
          </p>
        </div>
        
        <div className="bg-black/30 p-6 rounded-xl backdrop-blur-sm space-y-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Theme Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
            <div className="flex items-center gap-3">
              {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              <span className="text-white font-medium">Theme</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isDark ? 'Dark' : 'Light'}
            </button>
          </div>
          
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
            <div className="flex items-center gap-3">
              {gameData.settings.soundEnabled ? 
                <Volume2 className="w-5 h-5 text-green-400" /> : 
                <VolumeX className="w-5 h-5 text-red-400" />
              }
              <span className="text-white font-medium">Sound Effects</span>
            </div>
            <button
              onClick={() => saveGameData({
                settings: { ...gameData.settings, soundEnabled: !gameData.settings.soundEnabled }
              })}
              className={`btn btn-sm ${
                gameData.settings.soundEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {gameData.settings.soundEnabled ? 'On' : 'Off'}
            </button>
          </div>
          
          {/* Difficulty */}
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-orange-400" />
              <span className="text-white font-medium">Difficulty</span>
            </div>
            <select
              id="difficulty-select"
              value={gameData.settings.difficulty}
              onChange={(e) => saveGameData({
                settings: { ...gameData.settings, difficulty: e.target.value as GameSettings['difficulty'] }
              })}
              className="select bg-gray-800 text-white border-gray-600"
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Controls</span>
            </div>
            <select
              id="controls-select"
              value={gameData.settings.controls}
              onChange={(e) => saveGameData({
                settings: { ...gameData.settings, controls: e.target.value as GameSettings['controls'] }
              })}
              className="select bg-gray-800 text-white border-gray-600"
            >
              <option value="wasd">WASD Keys</option>
              <option value="arrows">Arrow Keys</option>
            </select>
          </div>
          
          {/* Data Management */}
          <div className="border-t border-white/20 pt-6 space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={exportGameData}
                className="btn btn-secondary flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-600/30"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              
              <label className="btn btn-secondary flex items-center justify-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 border-green-600/30 cursor-pointer">
                <Upload className="w-4 h-4" />
                Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={importGameData}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={clearAllData}
                className="btn btn-secondary flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-600/30"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
          
          {/* User Info */}
          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-lg">
              <User className="w-5 h-5 text-indigo-400" />
              <div className="text-left">
                <div className="text-white font-medium">
                  {currentUser?.first_name} {currentUser?.last_name}
                </div>
                <div className="text-gray-300 text-sm">{currentUser?.email}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
          <button
            onClick={startNewGame}
            className="btn btn-primary btn-lg flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Play className="w-4 h-4" />
            Start Game
          </button>
          
          <button
            onClick={() => setCurrentScreen('menu')}
            className="btn btn-secondary btn-lg flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="theme-transition">
      {currentScreen === 'menu' && <MenuScreen />}
      {currentScreen === 'game' && <GameScreen />}
      {currentScreen === 'gameOver' && <GameOverScreen />}
      {currentScreen === 'highScores' && <HighScoresScreen />}
      {currentScreen === 'settings' && <SettingsScreen />}
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 text-center py-2 text-xs text-gray-400 bg-black/20 backdrop-blur-sm">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved
      </footer>
    </div>
  );
};

export default App;