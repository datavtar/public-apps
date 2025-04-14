import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Heart, Zap, Trophy, ArrowRight, Target, RotateCcw, Settings, Info, X, Crown, Dices, RefreshCcw } from 'lucide-react';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  // Types
  type CharacterClass = 'knight' | 'archer' | 'mage';
  type AttackType = 'slash' | 'pierce' | 'magic';
  type DefenseType = 'heavy' | 'medium' | 'light';

  // Game state interfaces
  interface Character {
    id: string;
    name: string;
    class: CharacterClass;
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
    skills: Skill[];
    attackType: AttackType;
    defenseType: DefenseType;
    level: number;
    experience: number;
    imageUrl: string;
  }

  interface Skill {
    id: string;
    name: string;
    description: string;
    damage: number;
    energyCost: number;
    cooldown: number;
    currentCooldown: number;
    type: AttackType;
  }

  interface Player {
    id: string;
    name: string;
    characters: Character[];
    activeCharacterIndex: number;
    gold: number;
    tournamentProgress: number;
    tournamentWins: number;
    energy: number;
    maxEnergy: number;
  }

  interface Enemy extends Character {
    difficulty: number;
  }

  interface Tournament {
    id: string;
    name: string;
    description: string;
    enemies: Enemy[];
    progress: number;
    completed: boolean;
    rewards: { gold: number; experience: number };
  }

  interface CombatAction {
    type: 'attack' | 'skill' | 'defend';
    character: Character | Enemy;
    target: Character | Enemy;
    skill?: Skill;
    damage?: number;
    isCritical?: boolean;
  }

  interface CombatLog {
    action: CombatAction;
    message: string;
    timestamp: number;
  }

  interface GameState {
    player: Player;
    currentEnemy: Enemy | null;
    gamePhase: 'menu' | 'preparation' | 'combat' | 'results' | 'tournament' | 'shop' | 'characterSelect' | 'tutorial';
    combatTurn: 'player' | 'enemy';
    combatLogs: CombatLog[];
    tournaments: Tournament[];
    activeTournamentId: string | null;
    showSettings: boolean;
    darkMode: boolean;
  }

  // Initial game data
  const initialSkills: Record<CharacterClass, Skill[]> = {
    knight: [
      {
        id: 'shield_bash',
        name: 'Shield Bash',
        description: 'A powerful bash with your shield that stuns the enemy.',
        damage: 15,
        energyCost: 20,
        cooldown: 2,
        currentCooldown: 0,
        type: 'slash'
      },
      {
        id: 'heavy_swing',
        name: 'Heavy Swing',
        description: 'A devastating swing of your sword.',
        damage: 25,
        energyCost: 30,
        cooldown: 3,
        currentCooldown: 0,
        type: 'slash'
      }
    ],
    archer: [
      {
        id: 'precise_shot',
        name: 'Precise Shot',
        description: 'A carefully aimed shot that always hits vital points.',
        damage: 20,
        energyCost: 25,
        cooldown: 2,
        currentCooldown: 0,
        type: 'pierce'
      },
      {
        id: 'barrage',
        name: 'Arrow Barrage',
        description: 'Fire multiple arrows at once.',
        damage: 30,
        energyCost: 35,
        cooldown: 3,
        currentCooldown: 0,
        type: 'pierce'
      }
    ],
    mage: [
      {
        id: 'fireball',
        name: 'Fireball',
        description: 'Conjure a ball of fire that explodes on impact.',
        damage: 25,
        energyCost: 30,
        cooldown: 2,
        currentCooldown: 0,
        type: 'magic'
      },
      {
        id: 'ice_lance',
        name: 'Ice Lance',
        description: 'A piercing lance of ice that slows the enemy.',
        damage: 20,
        energyCost: 25,
        cooldown: 3,
        currentCooldown: 0,
        type: 'magic'
      }
    ]
  };

  // Create initial characters
  const createCharacter = (name: string, characterClass: CharacterClass): Character => {
    const baseStats = {
      knight: { health: 150, attack: 25, defense: 20, speed: 10 },
      archer: { health: 100, attack: 30, defense: 10, speed: 25 },
      mage: { health: 80, attack: 40, defense: 5, speed: 15 }
    };
    
    const attackTypes = {
      knight: 'slash' as AttackType,
      archer: 'pierce' as AttackType,
      mage: 'magic' as AttackType
    };
    
    const defenseTypes = {
      knight: 'heavy' as DefenseType,
      archer: 'medium' as DefenseType,
      mage: 'light' as DefenseType
    };
    
    const stats = baseStats[characterClass];
    
    const characterImages = {
      knight: '/knight.png',
      archer: '/archer.png',
      mage: '/mage.png'
    };
    
    return {
      id: Date.now().toString(),
      name,
      class: characterClass,
      health: stats.health,
      maxHealth: stats.health,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      skills: [...initialSkills[characterClass]],
      attackType: attackTypes[characterClass],
      defenseType: defenseTypes[characterClass],
      level: 1,
      experience: 0,
      imageUrl: characterImages[characterClass]
    };
  };

  // Create tournaments
  const createTournaments = (): Tournament[] => {
    return [
      {
        id: 'local_fair',
        name: 'Local Fair Tournament',
        description: 'A small tournament held during the local fair. Perfect for beginners.',
        enemies: [
          createEnemy('Trainee Knight', 'knight', 1, 1),
          createEnemy('Novice Archer', 'archer', 1, 1),
          createEnemy('Apprentice Mage', 'mage', 1, 1)
        ],
        progress: 0,
        completed: false,
        rewards: { gold: 100, experience: 50 }
      },
      {
        id: 'regional_contest',
        name: 'Regional Contest',
        description: 'A tournament that attracts fighters from neighboring areas.',
        enemies: [
          createEnemy('Veteran Knight', 'knight', 2, 2),
          createEnemy('Skilled Archer', 'archer', 2, 2),
          createEnemy('Adept Mage', 'mage', 2, 2),
          createEnemy('Regional Champion', 'knight', 3, 2)
        ],
        progress: 0,
        completed: false,
        rewards: { gold: 250, experience: 125 }
      },
      {
        id: 'royal_championship',
        name: 'Royal Championship',
        description: 'The prestigious tournament held by the king himself.',
        enemies: [
          createEnemy('Royal Knight', 'knight', 3, 3),
          createEnemy('King\'s Archer', 'archer', 3, 3),
          createEnemy('Court Mage', 'mage', 3, 3),
          createEnemy('Champion of the Realm', 'knight', 4, 3)
        ],
        progress: 0,
        completed: false,
        rewards: { gold: 500, experience: 250 }
      }
    ];
  };

  // Create enemies
  const createEnemy = (name: string, characterClass: CharacterClass, level: number, difficulty: number): Enemy => {
    const character = createCharacter(name, characterClass);
    const enemy: Enemy = {
      ...character,
      level: level,
      health: Math.floor(character.health * (1 + (level - 1) * 0.2)),
      maxHealth: Math.floor(character.health * (1 + (level - 1) * 0.2)),
      attack: Math.floor(character.attack * (1 + (level - 1) * 0.2)),
      defense: Math.floor(character.defense * (1 + (level - 1) * 0.2)),
      difficulty
    };
    return enemy;
  };

  // Initialize the game state
  const initialGameState: GameState = {
    player: {
      id: 'player1',
      name: 'Player',
      characters: [
        createCharacter('Sir Galahad', 'knight'),
        createCharacter('Robin the Sharp', 'archer'),
        createCharacter('Merlin the Wise', 'mage')
      ],
      activeCharacterIndex: 0,
      gold: 100,
      tournamentProgress: 0,
      tournamentWins: 0,
      energy: 100,
      maxEnergy: 100
    },
    currentEnemy: null,
    gamePhase: 'menu',
    combatTurn: 'player',
    combatLogs: [],
    tournaments: createTournaments(),
    activeTournamentId: null,
    showSettings: false,
    darkMode: false
  };

  // Load saved game state from localStorage or use initial state
  const loadGameState = (): GameState => {
    const savedState = localStorage.getItem('medieval_tournament_game_state');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Error parsing saved game state:', e);
        return initialGameState;
      }
    }
    return initialGameState;
  };

  // Game state
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [actionAnimation, setActionAnimation] = useState<string>('');
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  
  // Refs for animation and battle log
  const battleLogRef = useRef<HTMLDivElement>(null);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('medieval_tournament_game_state', JSON.stringify(gameState));
  }, [gameState]);

  // Set dark mode
  useEffect(() => {
    if (gameState.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [gameState.darkMode]);

  // Scroll to bottom of battle log whenever new log is added
  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [gameState.combatLogs]);

  // Game mechanics helpers
  const calculateDamage = (attacker: Character | Enemy, defender: Character | Enemy, skill?: Skill): { damage: number; isCritical: boolean } => {
    const baseAttack = skill ? skill.damage : attacker.attack;
    let damage = Math.max(1, baseAttack - defender.defense / 2);
    
    // Type effectiveness
    const effectiveness = getTypeEffectiveness(skill?.type || attacker.attackType, defender.defenseType);
    damage = Math.floor(damage * effectiveness);
    
    // Critical hit (10% chance)
    const isCritical = Math.random() < 0.1;
    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }
    
    return { damage, isCritical };
  };

  const getTypeEffectiveness = (attackType: AttackType, defenseType: DefenseType): number => {
    // Type effectiveness matrix
    const effectiveness: Record<AttackType, Record<DefenseType, number>> = {
      slash: { heavy: 0.8, medium: 1.2, light: 1 },
      pierce: { heavy: 1.2, medium: 0.8, light: 1 },
      magic: { heavy: 1, medium: 1, light: 0.8 }
    };
    
    return effectiveness[attackType][defenseType];
  };

  const isDefending = useRef<boolean>(false);

  // Game actions
  const startTournament = (tournamentId: string) => {
    const tournament = gameState.tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    setGameState(prev => ({
      ...prev,
      gamePhase: 'tournament',
      activeTournamentId: tournamentId,
      currentEnemy: null
    }));
  };

  const startCombat = () => {
    if (!gameState.activeTournamentId) return;
    
    const tournament = gameState.tournaments.find(t => t.id === gameState.activeTournamentId);
    if (!tournament) return;
    
    const nextEnemy = tournament.enemies[tournament.progress];
    if (!nextEnemy) return;
    
    // Reset cooldowns
    const updatedPlayer = { ...gameState.player };
    updatedPlayer.characters.forEach(char => {
      char.skills.forEach(skill => {
        skill.currentCooldown = 0;
      });
    });
    
    setGameState(prev => ({
      ...prev,
      gamePhase: 'combat',
      currentEnemy: { ...nextEnemy, health: nextEnemy.maxHealth },
      combatTurn: 'player',
      combatLogs: [{
        action: {
          type: 'attack',
          character: updatedPlayer.characters[updatedPlayer.activeCharacterIndex],
          target: nextEnemy
        },
        message: `Combat begins! ${updatedPlayer.characters[updatedPlayer.activeCharacterIndex].name} faces ${nextEnemy.name}!`, // Fixed template literal
        timestamp: Date.now()
      }],
      player: updatedPlayer
    }));
  };

  const performAttack = () => {
    if (!gameState.currentEnemy || gameState.combatTurn !== 'player') return;
    
    const playerCharacter = gameState.player.characters[gameState.player.activeCharacterIndex];
    const enemy = gameState.currentEnemy;
    
    const { damage, isCritical } = calculateDamage(playerCharacter, enemy);
    const updatedEnemy = { ...enemy, health: Math.max(0, enemy.health - damage) };
    
    const action: CombatAction = {
      type: 'attack',
      character: playerCharacter,
      target: enemy,
      damage,
      isCritical
    };
    
    const message = isCritical
      ? `CRITICAL HIT! ${playerCharacter.name} attacks ${enemy.name} for ${damage} damage!` // Fixed template literal
      : `${playerCharacter.name} attacks ${enemy.name} for ${damage} damage!`; // Fixed template literal
    
    setActionAnimation('attack');
    
    setGameState(prev => ({
      ...prev,
      currentEnemy: updatedEnemy,
      combatTurn: updatedEnemy.health <= 0 ? 'player' : 'enemy',
      combatLogs: [...prev.combatLogs, { action, message, timestamp: Date.now() }]
    }));
    
    // Clear animation after a delay
    setTimeout(() => setActionAnimation(''), 500);
    
    // Handle enemy death
    if (updatedEnemy.health <= 0) {
      setTimeout(() => endCombat('victory'), 1000);
      return;
    }
    
    // Enemy turn
    setTimeout(() => {
      // Check gamePhase to prevent enemy turn if combat ended early
      setGameState(currentGameState => {
        if (currentGameState.gamePhase === 'combat' && currentGameState.combatTurn === 'enemy') {
          handleEnemyTurn();
        }
        return currentGameState; // Important: return the current state if no update is needed
      });
    }, 1000);
  };

  // Renamed function to avoid ESLint conflict
  const activateSkill = (skillId: string) => {
    if (!gameState.currentEnemy || gameState.combatTurn !== 'player') return;
    
    const playerCharacter = gameState.player.characters[gameState.player.activeCharacterIndex];
    const skill = playerCharacter.skills.find(s => s.id === skillId);
    
    if (!skill || skill.currentCooldown > 0 || gameState.player.energy < skill.energyCost) return;
    
    const enemy = gameState.currentEnemy;
    const { damage, isCritical } = calculateDamage(playerCharacter, enemy, skill);
    const updatedEnemy = { ...enemy, health: Math.max(0, enemy.health - damage) };
    
    // Update player character skills cooldown
    const updatedPlayerCharacters = [...gameState.player.characters];
    const updatedCharacter = { ...playerCharacter };
    updatedCharacter.skills = updatedCharacter.skills.map(s => {
      if (s.id === skillId) {
        return { ...s, currentCooldown: s.cooldown };
      }
      return s;
    });
    updatedPlayerCharacters[gameState.player.activeCharacterIndex] = updatedCharacter;
    
    const updatedPlayer = {
      ...gameState.player,
      characters: updatedPlayerCharacters,
      energy: gameState.player.energy - skill.energyCost
    };
    
    const action: CombatAction = {
      type: 'skill',
      character: playerCharacter,
      target: enemy,
      skill,
      damage,
      isCritical
    };
    
    const message = isCritical
      ? `CRITICAL HIT! ${playerCharacter.name} uses ${skill.name} on ${enemy.name} for ${damage} damage!` // Fixed template literal
      : `${playerCharacter.name} uses ${skill.name} on ${enemy.name} for ${damage} damage!`; // Fixed template literal
    
    setActionAnimation('skill');
    
    setGameState(prev => ({
      ...prev,
      player: updatedPlayer,
      currentEnemy: updatedEnemy,
      combatTurn: updatedEnemy.health <= 0 ? 'player' : 'enemy',
      combatLogs: [...prev.combatLogs, { action, message, timestamp: Date.now() }]
    }));
    
    // Clear animation after a delay
    setTimeout(() => setActionAnimation(''), 500);
    
    // Handle enemy death
    if (updatedEnemy.health <= 0) {
      setTimeout(() => endCombat('victory'), 1000);
      return;
    }
    
    // Enemy turn
    setTimeout(() => {
        // Check gamePhase to prevent enemy turn if combat ended early
        setGameState(currentGameState => {
          if (currentGameState.gamePhase === 'combat' && currentGameState.combatTurn === 'enemy') {
            handleEnemyTurn();
          }
          return currentGameState; // Important: return the current state if no update is needed
        });
    }, 1000);
  };

  const defend = () => {
    if (!gameState.currentEnemy || gameState.combatTurn !== 'player') return;
    
    const playerCharacter = gameState.player.characters[gameState.player.activeCharacterIndex];
    
    isDefending.current = true;
    
    const action: CombatAction = {
      type: 'defend',
      character: playerCharacter,
      target: playerCharacter
    };
    
    const message = `${playerCharacter.name} takes a defensive stance, reducing incoming damage!`; // Fixed template literal
    
    setActionAnimation('defend');
    
    setGameState(prev => ({
      ...prev,
      combatTurn: 'enemy',
      combatLogs: [...prev.combatLogs, { action, message, timestamp: Date.now() }]
    }));
    
    // Clear animation after a delay
    setTimeout(() => setActionAnimation(''), 500);
    
    // Enemy turn
    setTimeout(() => {
      handleEnemyTurn();
    }, 1000);
  };

  const handleEnemyTurn = () => {
    // Ensure combat is still active and it's enemy turn
    if (!gameState.currentEnemy || gameState.gamePhase !== 'combat') return;
    
    const enemy = gameState.currentEnemy;
    const playerCharacter = gameState.player.characters[gameState.player.activeCharacterIndex];
    
    // Simple AI: 70% chance to attack, 30% chance to use a skill if available
    const canUseSkill = enemy.skills.some(s => s.currentCooldown === 0);
    const action = canUseSkill && Math.random() > 0.7 ? 'skill' : 'attack'; // Corrected condition
    
    if (action === 'skill') {
      // Filter skills that are not on cooldown
      const availableSkills = enemy.skills.filter(s => s.currentCooldown === 0);
      const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      
      // Calculate damage with defense bonus if player is defending
      const defenseMultiplier = isDefending.current ? 0.5 : 1; // Apply defense as multiplier
      let { damage, isCritical } = calculateDamage(enemy, playerCharacter, skill);
      damage = Math.floor(damage * defenseMultiplier);
      
      // Update enemy skills cooldown
      const updatedEnemySkills = enemy.skills.map(s => {
        if (s.id === skill.id) {
          return { ...s, currentCooldown: s.cooldown };
        }
        return s;
      });
      const updatedEnemy = { ...enemy, skills: updatedEnemySkills };
      
      // Update player character health
      const updatedPlayerCharacters = [...gameState.player.characters];
      const updatedHealth = Math.max(0, playerCharacter.health - damage);
      const updatedCharacter = { ...playerCharacter, health: updatedHealth };
      updatedPlayerCharacters[gameState.player.activeCharacterIndex] = updatedCharacter;
      
      const updatedPlayer = {
        ...gameState.player,
        characters: updatedPlayerCharacters
      };
      
      const combatAction: CombatAction = {
        type: 'skill',
        character: enemy,
        target: playerCharacter,
        skill,
        damage,
        isCritical
      };
      
      const defenseMessage = isDefending.current ? ' (Reduced by defense stance)' : '';
      const message = isCritical
        ? `CRITICAL HIT! ${enemy.name} uses ${skill.name} on ${playerCharacter.name} for ${damage} damage${defenseMessage}!` // Fixed template literal
        : `${enemy.name} uses ${skill.name} on ${playerCharacter.name} for ${damage} damage${defenseMessage}!`; // Fixed template literal
      
      setActionAnimation('enemy-skill');
      
      setGameState(prev => ({
        ...prev,
        player: updatedPlayer,
        currentEnemy: updatedEnemy,
        combatTurn: 'player',
        combatLogs: [...prev.combatLogs, { action: combatAction, message, timestamp: Date.now() }]
      }));
      
      // Reset defending status after the attack resolves
      isDefending.current = false;
      
      // Clear animation after a delay
      setTimeout(() => setActionAnimation(''), 500);
      
      // Check if player is defeated
      if (updatedHealth <= 0) {
        setTimeout(() => endCombat('defeat'), 1000);
      } else {
         // Reduce cooldowns for player skills only if player is not defeated
         setTimeout(() => updateCooldowns(), 500);
      }
      
    } else {
      // Regular attack
      // Calculate damage with defense bonus if player is defending
      const defenseMultiplier = isDefending.current ? 0.5 : 1; // Apply defense as multiplier
      let { damage, isCritical } = calculateDamage(enemy, playerCharacter);
      damage = Math.floor(damage * defenseMultiplier);
      
      // Update player character health
      const updatedPlayerCharacters = [...gameState.player.characters];
      const updatedHealth = Math.max(0, playerCharacter.health - damage);
      const updatedCharacter = { ...playerCharacter, health: updatedHealth };
      updatedPlayerCharacters[gameState.player.activeCharacterIndex] = updatedCharacter;
      
      const updatedPlayer = {
        ...gameState.player,
        characters: updatedPlayerCharacters
      };
      
      const combatAction: CombatAction = {
        type: 'attack',
        character: enemy,
        target: playerCharacter,
        damage,
        isCritical
      };
      
      const defenseMessage = isDefending.current ? ' (Reduced by defense stance)' : '';
      const message = isCritical
        ? `CRITICAL HIT! ${enemy.name} attacks ${playerCharacter.name} for ${damage} damage${defenseMessage}!` // Fixed template literal
        : `${enemy.name} attacks ${playerCharacter.name} for ${damage} damage${defenseMessage}!`; // Fixed template literal
      
      setActionAnimation('enemy-attack');
      
      setGameState(prev => ({
        ...prev,
        player: updatedPlayer,
        combatTurn: 'player',
        combatLogs: [...prev.combatLogs, { action: combatAction, message, timestamp: Date.now() }]
      }));
      
      // Reset defending status after the attack resolves
      isDefending.current = false;
      
      // Clear animation after a delay
      setTimeout(() => setActionAnimation(''), 500);
      
      // Check if player is defeated
      if (updatedHealth <= 0) {
        setTimeout(() => endCombat('defeat'), 1000);
      } else {
          // Reduce cooldowns for player skills only if player is not defeated
          setTimeout(() => updateCooldowns(), 500);
      }
    }
  };

  const updateCooldowns = () => {
    // Check if still in combat phase before updating
    if (gameState.gamePhase !== 'combat') return;

    setGameState(prev => {
      const updatedPlayerCharacters = [...prev.player.characters];
      const activeCharIndex = prev.player.activeCharacterIndex;
      const activeCharacter = { ...updatedPlayerCharacters[activeCharIndex] };
      
      activeCharacter.skills = activeCharacter.skills.map(skill => {
        if (skill.currentCooldown > 0) {
          return { ...skill, currentCooldown: Math.max(0, skill.currentCooldown - 1) };
        }
        return skill;
      });
      
      updatedPlayerCharacters[activeCharIndex] = activeCharacter;
      
      const updatedPlayer = {
        ...prev.player,
        characters: updatedPlayerCharacters,
        // Regenerate some energy each turn
        energy: Math.min(prev.player.maxEnergy, prev.player.energy + 10)
      };
      
      let updatedEnemy = prev.currentEnemy;
      if (updatedEnemy) {
        updatedEnemy = { ...updatedEnemy }; // Create a new object
        updatedEnemy.skills = updatedEnemy.skills.map(skill => {
          if (skill.currentCooldown > 0) {
            return { ...skill, currentCooldown: Math.max(0, skill.currentCooldown - 1) };
          }
          return skill;
        });
      }
      
      return {
        ...prev,
        player: updatedPlayer,
        currentEnemy: updatedEnemy
      };
    });
  };

  const endCombat = (result: 'victory' | 'defeat') => {
    if (!gameState.activeTournamentId || !gameState.currentEnemy || gameState.gamePhase !== 'combat') return; // Prevent running if not in combat
    
    const tournament = gameState.tournaments.find(t => t.id === gameState.activeTournamentId);
    if (!tournament) return;

    const playerCharIndex = gameState.player.activeCharacterIndex;
    const playerCharacter = gameState.player.characters[playerCharIndex];
    const currentEnemy = gameState.currentEnemy; // Capture current enemy before state update
    
    if (result === 'victory') {
      // Update tournament progress
      const updatedTournaments = gameState.tournaments.map(t => {
        if (t.id === gameState.activeTournamentId) {
          const updatedProgress = t.progress + 1;
          const completed = updatedProgress >= t.enemies.length;
          
          return {
            ...t,
            progress: updatedProgress,
            completed
          };
        }
        return t;
      });
      
      // Award experience to the active character
      const updatedPlayerCharacters = [...gameState.player.characters];
      const activeCharacter = updatedPlayerCharacters[playerCharIndex];
      const experienceGained = 20 * currentEnemy.level;
      
      let updatedCharacter = { ...activeCharacter, experience: activeCharacter.experience + experienceGained };
      
      // Check for level up
      const experienceNeeded = updatedCharacter.level * 100;
      if (updatedCharacter.experience >= experienceNeeded) {
        updatedCharacter = {
          ...updatedCharacter,
          level: updatedCharacter.level + 1,
          experience: updatedCharacter.experience - experienceNeeded,
          attack: Math.floor(updatedCharacter.attack * 1.1),
          defense: Math.floor(updatedCharacter.defense * 1.1),
          maxHealth: Math.floor(updatedCharacter.maxHealth * 1.1),
          health: Math.floor(updatedCharacter.maxHealth * 1.1) // Heal on level up
        };
        // Add log for level up?
      }
      
      updatedPlayerCharacters[playerCharIndex] = updatedCharacter;
      
      const currentTournamentState = updatedTournaments.find(t => t.id === gameState.activeTournamentId) || tournament; // Use updated state
      const isTournamentCompleted = currentTournamentState.completed;
      
      const updatedPlayer = {
        ...gameState.player,
        characters: updatedPlayerCharacters,
        // Award gold and additional experience if tournament is completed
        gold: isTournamentCompleted
          ? gameState.player.gold + currentTournamentState.rewards.gold
          : gameState.player.gold,
        tournamentWins: isTournamentCompleted
          ? gameState.player.tournamentWins + 1
          : gameState.player.tournamentWins
      };
      
      setGameState(prev => ({
        ...prev,
        player: updatedPlayer,
        tournaments: updatedTournaments,
        gamePhase: 'results', // Transition to results phase
        combatLogs: [
          ...prev.combatLogs,
          {
            action: {
              type: 'attack', // Simplified action for log
              character: playerCharacter,
              target: currentEnemy
            },
            message: `Victory! ${playerCharacter.name} defeats ${currentEnemy.name}!`, // Fixed template literal
            timestamp: Date.now()
          }
        ]
        // currentEnemy is implicitly handled by gamePhase change, but can be set to null here if needed
      }));
    } else { // Defeat
      // Handle defeat
      setGameState(prev => ({
        ...prev,
        gamePhase: 'results', // Transition to results phase
        combatLogs: [
          ...prev.combatLogs,
          {
            action: {
              type: 'attack', // Simplified action for log
              character: currentEnemy,
              target: playerCharacter
            },
            message: `Defeat! ${playerCharacter.name} has been defeated by ${currentEnemy.name}!`, // Fixed template literal
            timestamp: Date.now()
          }
        ]
      }));
    }
  };

  const continueAfterResults = () => {
    if (!gameState.activeTournamentId) {
        // If somehow called without active tournament, go to menu
        setGameState(prev => ({ ...prev, gamePhase: 'menu', activeTournamentId: null, currentEnemy: null }));
        return;
    }
    
    const tournament = gameState.tournaments.find(t => t.id === gameState.activeTournamentId);
    if (!tournament) { 
        // Should not happen if activeTournamentId is set, but good practice
        setGameState(prev => ({ ...prev, gamePhase: 'menu', activeTournamentId: null, currentEnemy: null }));
        return;
    }
    
    // Heal character partially after combat
    const updatedPlayerCharacters = [...gameState.player.characters];
    const activeCharIndex = gameState.player.activeCharacterIndex;
    const activeCharacter = updatedPlayerCharacters[activeCharIndex];
    const healAmount = Math.floor(activeCharacter.maxHealth * 0.3); // Heal 30% of max health
    
    updatedPlayerCharacters[activeCharIndex] = {
      ...activeCharacter,
      health: Math.min(activeCharacter.maxHealth, activeCharacter.health + healAmount)
    };
    
    const updatedPlayer = {
      ...gameState.player,
      characters: updatedPlayerCharacters,
      energy: Math.min(gameState.player.maxEnergy, gameState.player.energy + 20) // Regenerate some energy
    };
    
    // Check if tournament is completed or if there are more enemies
    if (tournament.completed) { // Check the completed flag
      // Tournament is completed
      setGameState(prev => ({
        ...prev,
        player: updatedPlayer,
        gamePhase: 'menu',
        activeTournamentId: null,
        currentEnemy: null // Clear enemy
      }));
    } else {
      // Continue to next enemy preparation screen
      setGameState(prev => ({
        ...prev,
        player: updatedPlayer,
        gamePhase: 'tournament', // Back to tournament screen to start next battle
        currentEnemy: null // Clear enemy before next battle starts
      }));
    }
  };

  const changeActiveCharacter = (index: number) => {
    if (index < 0 || index >= gameState.player.characters.length) return;
    
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        activeCharacterIndex: index
      }
    }));
  };

  const resetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? All progress will be lost.')) {
      localStorage.removeItem('medieval_tournament_game_state');
      setGameState(initialGameState);
    }
  };

  const toggleDarkMode = () => {
    setGameState(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };

  const toggleSettings = () => {
    setGameState(prev => ({
      ...prev,
      showSettings: !prev.showSettings
    }));
  };

  // Game UI Components
  const renderMainMenu = () => (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex justify-center items-center gap-2">
          <Crown className="text-yellow-500" />
          Medieval Tournament
          <Crown className="text-yellow-500" />
        </h1>
        <p className="text-lg dark:text-slate-300">Prove your worth in battle and claim victory!</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-slate-100">
            <Trophy /> Your Progress
          </h2>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-slate-300">Tournament Wins:</span>
            <span className="font-bold text-gray-800 dark:text-slate-100">{gameState.player.tournamentWins}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-slate-300">Gold:</span>
            <span className="font-bold text-yellow-600 dark:text-yellow-400">{gameState.player.gold}</span>
          </div>
          <div className="mt-4">
            <button 
              className="btn btn-primary w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              onClick={() => setShowTutorial(true)}
              role="button"
              name="tutorial"
            >
              <Info size={18} /> Tutorial
            </button>
          </div>
        </div>
        
        <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-slate-100">
            <Sword /> Active Character
          </h2>
          <div className="flex flex-col items-center mb-4">
            <div className={`${styles.characterIcon} ${styles[gameState.player.characters[gameState.player.activeCharacterIndex].class]}`}></div>
            <h3 className="text-lg font-semibold mt-2 text-gray-800 dark:text-slate-100">{gameState.player.characters[gameState.player.activeCharacterIndex].name}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 capitalize">{gameState.player.characters[gameState.player.activeCharacterIndex].class} - Level {gameState.player.characters[gameState.player.activeCharacterIndex].level}</p>
          </div>
          <button 
            className="btn btn-primary w-full mt-2 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'characterSelect' }))}
            role="button"
            name="change-character"
          >
            <RefreshCcw size={18} /> Change Character
          </button>
        </div>
      </div>
      
      <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-slate-100">
          <Trophy /> Available Tournaments
        </h2>
        <div className="grid gap-4">
          {gameState.tournaments.map(tournament => (
            <div key={tournament.id} className="border p-4 rounded-lg dark:border-slate-700 hover:shadow-md transition-shadow bg-gray-50 dark:bg-slate-700/50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-slate-100">
                  {tournament.completed && <Trophy className="text-yellow-500 dark:text-yellow-400" size={18} />}
                  {tournament.name}
                </h3>
                <span className="badge badge-info bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tournament.progress}/{tournament.enemies.length} Battles</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 my-2">{tournament.description}</p>
              <div className="flex justify-between items-center mt-3">
                <div className="text-sm text-gray-800 dark:text-slate-100">
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">{tournament.rewards.gold} Gold</span> reward
                </div>
                <button 
                  className={`btn btn-primary flex items-center gap-2 ${tournament.completed ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded text-sm transition duration-300`}
                  onClick={() => startTournament(tournament.id)}
                  disabled={tournament.completed}
                  role="button"
                  name={`enter-tournament-${tournament.id}`}
                >
                  {tournament.completed ? 'Completed' : 'Enter'} {!tournament.completed && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCharacterSelect = () => (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Select Your Character</h2>
          <button 
            className="btn bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'menu' }))}
            role="button"
            name="back-to-menu"
          >
            Back to Menu
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gameState.player.characters.map((character, index) => (
            <div 
              key={character.id} 
              className={`card border-2 transition-all cursor-pointer p-4 rounded-lg shadow-sm bg-gray-50 dark:bg-slate-700/50 ${index === gameState.player.activeCharacterIndex ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400' : 'border-gray-200 dark:border-slate-700'}`}
              onClick={() => changeActiveCharacter(index)}
              role="button"
              aria-selected={index === gameState.player.activeCharacterIndex}
              name={`select-character-${character.class}`}
            >
              <div className="flex flex-col items-center">
                <div className={`${styles.characterIconLarge} ${styles[character.class]}`}></div>
                <h3 className="text-lg font-bold mt-3 text-gray-800 dark:text-slate-100">{character.name}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 capitalize">{character.class} - Level {character.level}</p>
                
                <div className="w-full mt-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-slate-300">
                      <Heart size={16} className="text-red-500" /> Health
                    </span>
                    <span className="font-medium text-gray-800 dark:text-slate-100">{character.maxHealth}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-slate-300">
                      <Sword size={16} className="text-blue-500" /> Attack
                    </span>
                    <span className="font-medium text-gray-800 dark:text-slate-100">{character.attack}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-slate-300">
                      <Shield size={16} className="text-green-500" /> Defense
                    </span>
                    <span className="font-medium text-gray-800 dark:text-slate-100">{character.defense}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1 text-gray-600 dark:text-slate-300">
                      <Zap size={16} className="text-yellow-500" /> Speed
                    </span>
                    <span className="font-medium text-gray-800 dark:text-slate-100">{character.speed}</span>
                  </div>
                </div>
                
                {index === gameState.player.activeCharacterIndex && (
                  <div className="mt-4 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 p-2 rounded text-center font-semibold w-full">
                    Currently Selected
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'menu' }))}
            role="button"
            name="confirm-selection"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );

  const renderTournament = () => {
    if (!gameState.activeTournamentId) return null;
    
    const tournament = gameState.tournaments.find(t => t.id === gameState.activeTournamentId);
    if (!tournament) return null;
    
    // Handle case where progress might be out of bounds (e.g., after winning final battle)
    if (tournament.progress >= tournament.enemies.length) {
        // Optionally render a 'Tournament Complete' message or redirect
        // For now, let's prevent rendering the 'Next Battle' if complete
        return (
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-4">{tournament.name}</h2>
                    <p className="text-lg text-green-600 dark:text-green-400 font-semibold mb-4">Tournament Complete!</p>
                    <button 
                        className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                        onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'menu', activeTournamentId: null }))}
                        role="button"
                        name="back-to-menu"
                    >
                        Back to Menu
                    </button>
                </div>
            </div>
        );
    }
    
    const nextEnemy = tournament.enemies[tournament.progress];
    const playerCharacter = gameState.player.characters[gameState.player.activeCharacterIndex];
    
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{tournament.name}</h2>
            <button 
              className="btn bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-white font-bold py-2 px-4 rounded transition duration-300 text-sm"
              onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'menu', activeTournamentId: null }))}
              role="button"
              name="exit-tournament"
            >
              Exit Tournament
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-slate-100">Tournament Progress</h3>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(tournament.progress / tournament.enemies.length) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-300 mt-1 text-right">
              Battle {tournament.progress + 1} of {tournament.enemies.length}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-100">Next Battle</h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-4 border rounded-lg dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
              <div className="flex flex-col items-center text-center">
                <div className={`${styles.characterIconMedium} ${styles[playerCharacter.class]}`}></div>
                <h4 className="font-medium mt-2 text-gray-800 dark:text-slate-100">{playerCharacter.name}</h4>
                <p className="text-sm text-gray-600 dark:text-slate-300 capitalize">
                  Level {playerCharacter.level} {playerCharacter.class}
                </p>
              </div>
              
              <div className="text-xl font-bold text-gray-500 dark:text-slate-400 my-2 sm:my-0">
                VS
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className={`${styles.characterIconMedium} ${styles[nextEnemy.class]}`}></div>
                <h4 className="font-medium mt-2 text-gray-800 dark:text-slate-100">{nextEnemy.name}</h4>
                <p className="text-sm text-gray-600 dark:text-slate-300 capitalize">
                  Level {nextEnemy.level} {nextEnemy.class}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2 text-gray-800 dark:text-slate-100">Character Status</h4>
              <div className="flex items-center gap-2 mb-1">
                <Heart size={16} className="text-red-500 flex-shrink-0" />
                <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(playerCharacter.health / playerCharacter.maxHealth) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-slate-300 min-w-[60px] text-right">
                  {playerCharacter.health}/{playerCharacter.maxHealth}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-blue-500 flex-shrink-0" />
                <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(gameState.player.energy / gameState.player.maxEnergy) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-slate-300 min-w-[60px] text-right">
                  {gameState.player.energy}/{gameState.player.maxEnergy}
                </span>
              </div>
            </div>
            
            <button 
              className={`btn btn-primary flex items-center justify-center gap-2 ${playerCharacter.health <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded transition duration-300 w-full sm:w-auto`}
              onClick={startCombat}
              disabled={playerCharacter.health <= 0}
              role="button"
              name="start-battle"
            >
              <Sword size={18} /> {playerCharacter.health <= 0 ? 'Cannot Battle' : 'Start Battle'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCombat = () => {
    if (!gameState.currentEnemy || gameState.gamePhase !== 'combat') return null;
    
    const playerCharacter = gameState.player.characters[gameState.player.activeCharacterIndex];
    
    return (
      <div className="container mx-auto p-4 max-w-5xl">
        <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
              Battle: {playerCharacter.name} vs {gameState.currentEnemy.name}
            </h2>
          </div>
          
          {/* Battle Arena */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6 items-center">
            {/* Player Character */}
            <div className="md:col-span-2 order-2 md:order-1 text-center">
              <div className="flex flex-col items-center">
                <div className={`${styles.combatCharacter} ${styles[playerCharacter.class]} ${actionAnimation === 'attack' || actionAnimation === 'skill' ? styles.attackAnimation : ''} ${actionAnimation === 'defend' ? styles.defendAnimation : ''} mb-2`}></div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">{playerCharacter.name}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 capitalize">
                  Level {playerCharacter.level} {playerCharacter.class}
                </p>
                
                <div className="w-full max-w-xs mx-auto mt-3 space-y-2">
                  {/* Health Bar */}
                  <div className="flex items-center gap-2 text-sm">
                    <Heart size={16} className="text-red-500 flex-shrink-0" />
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(playerCharacter.health / playerCharacter.maxHealth) * 100}%` }}
                        title={`Health: ${playerCharacter.health}/${playerCharacter.maxHealth}`}
                      ></div>
                    </div>
                    <span className="text-gray-600 dark:text-slate-300 min-w-[60px] text-right">
                      {playerCharacter.health}/{playerCharacter.maxHealth}
                    </span>
                  </div>
                  {/* Energy Bar */}
                  <div className="flex items-center gap-2 text-sm">
                    <Zap size={16} className="text-blue-500 flex-shrink-0" />
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(gameState.player.energy / gameState.player.maxEnergy) * 100}%` }}
                         title={`Energy: ${gameState.player.energy}/${gameState.player.maxEnergy}`}
                      ></div>
                    </div>
                    <span className="text-gray-600 dark:text-slate-300 min-w-[60px] text-right">
                      {gameState.player.energy}/{gameState.player.maxEnergy}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Battle Status */}
            <div className="md:col-span-1 flex flex-col items-center justify-center order-1 md:order-2 text-center">
                <div className="text-2xl font-bold text-gray-500 dark:text-slate-400 mb-2">VS</div>
                <div className={`badge font-semibold px-3 py-1 rounded-full text-sm ${gameState.combatTurn === 'player' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'} mb-2`}>
                  {gameState.combatTurn === 'player' ? 'Your Turn' : 'Enemy Turn'}
                </div>
                {isDefending.current && (
                  <div className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold px-3 py-1 rounded-full text-sm mt-2">
                    Defending
                  </div>
                )}
            </div>
            
            {/* Enemy Character */}
            <div className="md:col-span-2 order-3 text-center">
              <div className="flex flex-col items-center">
                <div className={`${styles.combatCharacter} ${styles[gameState.currentEnemy.class]} ${actionAnimation === 'enemy-attack' || actionAnimation === 'enemy-skill' ? styles.attackAnimation : ''} mb-2`}></div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">{gameState.currentEnemy.name}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 capitalize">
                  Level {gameState.currentEnemy.level} {gameState.currentEnemy.class}
                </p>
                
                <div className="w-full max-w-xs mx-auto mt-3 space-y-2">
                  {/* Enemy Health Bar */}
                   <div className="flex items-center gap-2 text-sm">
                    <Heart size={16} className="text-red-500 flex-shrink-0" />
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(gameState.currentEnemy.health / gameState.currentEnemy.maxHealth) * 100}%` }}
                         title={`Health: ${gameState.currentEnemy.health}/${gameState.currentEnemy.maxHealth}`}
                      ></div>
                    </div>
                    <span className="text-gray-600 dark:text-slate-300 min-w-[60px] text-right">
                      {gameState.currentEnemy.health}/{gameState.currentEnemy.maxHealth}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Battle Controls & Log */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {/* Actions/Skills */}
            <div className="md:col-span-2">
              {gameState.combatTurn === 'player' ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-slate-100">Actions</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button 
                        className="btn btn-primary flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                        onClick={performAttack}
                        role="button"
                        name="attack"
                        disabled={actionAnimation !== ''} // Disable during animation
                      >
                        <Sword size={18} /> Attack
                      </button>
                      <button 
                        className="btn bg-green-600 hover:bg-green-700 text-white flex justify-center items-center gap-2 font-bold py-2 px-4 rounded transition duration-300"
                        onClick={defend}
                        role="button"
                        name="defend"
                        disabled={actionAnimation !== ''} // Disable during animation
                      >
                        <Shield size={18} /> Defend
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-slate-100">Skills</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {playerCharacter.skills.map(skill => {
                          const isDisabled = skill.currentCooldown > 0 || gameState.player.energy < skill.energyCost || actionAnimation !== '';
                          return (
                              <button 
                                key={skill.id} 
                                className={`btn flex flex-col justify-center items-center p-3 rounded-lg transition duration-300 text-sm ${isDisabled ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed opacity-70' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                onClick={() => activateSkill(skill.id)} // Use renamed function
                                disabled={isDisabled}
                                role="button"
                                name={`skill-${skill.id}`}
                                title={`${skill.description} - Cost: ${skill.energyCost} Energy`}
                              >
                                <div className="flex items-center gap-2 font-semibold">
                                  <Target size={16} />
                                  <span>{skill.name}</span>
                                </div>
                                <div className="flex justify-center items-center gap-2 text-xs mt-1 w-full">
                                  <span>{skill.energyCost} <Zap size={12} className="inline-block"/></span>
                                  {skill.currentCooldown > 0 && (
                                      <span className="text-red-300">(CD: {skill.currentCooldown})</span>
                                  )}
                                </div>
                              </button>
                          );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-full min-h-[150px]">
                  <div className="text-lg font-semibold text-gray-600 dark:text-slate-300 animate-pulse flex items-center gap-2">
                    <RotateCcw size={18} className="animate-spin"/> Enemy is taking their turn...
                  </div>
                </div>
              )}
            </div>
            
            {/* Battle Log */}
            <div className="md:col-span-1">
              <div className="h-60 overflow-y-auto border rounded-lg p-3 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-slate-600 scrollbar-track-gray-100 dark:scrollbar-track-slate-800" ref={battleLogRef}>
                <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-gray-50 dark:bg-slate-700/50 pb-1 text-gray-800 dark:text-slate-100">Battle Log</h3>
                <div className="space-y-2">
                  {gameState.combatLogs.map((log, index) => (
                    <div key={index} className="text-sm border-b pb-1 mb-1 dark:border-slate-600 text-gray-700 dark:text-slate-300 last:border-b-0">
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    );
  };

  const renderResults = () => {
    // Added check for gamePhase to ensure results are only rendered then
    if (gameState.gamePhase !== 'results' || !gameState.activeTournamentId || !gameState.currentEnemy) return null;
    
    const tournament = gameState.tournaments.find(t => t.id === gameState.activeTournamentId);
    if (!tournament) return null;
    
    const playerCharacter = gameState.player.characters[gameState.player.activeCharacterIndex];
    // Determine victory based on enemy health *at the time results are shown*
    // It's safer to pass the result explicitly or check the last log message
    const lastLog = gameState.combatLogs[gameState.combatLogs.length - 1];
    const isVictory = lastLog?.message.startsWith('Victory!'); 
    const isTournamentComplete = tournament.completed; // Use the completed flag from the tournament state
    
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
          <div className="text-center mb-6">
            <h2 className={`text-3xl font-bold mb-2 ${isVictory ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isVictory ? 'Victory!' : 'Defeat!'}
            </h2>
            {isVictory && isTournamentComplete && (
              <div className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 flex justify-center items-center gap-2 mt-2">
                <Trophy /> Tournament Complete! <Trophy />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-slate-100">Battle Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-slate-300">Opponent:</span>
                  <span className="font-medium text-gray-800 dark:text-slate-100">{gameState.currentEnemy.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-slate-300">Result:</span>
                  <span className={`font-medium ${isVictory ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isVictory ? 'Victory' : 'Defeat'}
                  </span>
                </div>
                {isVictory && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-300">Tournament Progress:</span>
                    <span className="font-medium text-gray-800 dark:text-slate-100">{tournament.progress}/{tournament.enemies.length}</span>
                  </div>
                )}
              </div>
            </div>
            
            {isVictory && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-slate-100">Rewards</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-slate-300">Experience Gained:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">+{20 * gameState.currentEnemy.level} XP</span>
                  </div>
                  {isTournamentComplete && tournament.rewards.gold > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-300">Tournament Gold:</span>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">+{tournament.rewards.gold} Gold</span>
                    </div>
                  )}
                   {isTournamentComplete && tournament.rewards.experience > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-slate-300">Tournament XP Bonus:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">+{tournament.rewards.experience} XP</span>
                    </div>
                  )}
                </div>
                
                {/* Character Progress Bar */}
                <div className="mt-4">
                  <h4 className="font-medium mb-1 text-sm text-gray-800 dark:text-slate-100">Character Level Progress</h4>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-1 overflow-hidden">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (playerCharacter.experience / (playerCharacter.level * 100)) * 100)}%` }} // Cap width at 100%
                       title={`${playerCharacter.experience} / ${playerCharacter.level * 100} XP`}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-300 text-right">
                    {playerCharacter.experience} / {playerCharacter.level * 100} XP to Level {playerCharacter.level + 1}
                  </div>
                   {/* Show if leveled up */} 
                  {lastLog?.message.includes('leveled up') && (
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-2">Leveled Up to Level {playerCharacter.level}!</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {!isVictory && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-1">Defeat Consequences</h3>
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Your character was defeated. You will return to the main menu. You keep any experience gained, but forfeit progress in this tournament attempt.
              </p>
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <button 
              className="btn btn-primary w-48 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              onClick={continueAfterResults}
              role="button"
              name="continue"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTutorial = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-slate-600 scrollbar-track-gray-100 dark:scrollbar-track-slate-900">
        <div className="flex justify-between items-start mb-4 sticky top-0 bg-white dark:bg-slate-800 pb-2 border-b dark:border-slate-700 z-10">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Game Tutorial</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            onClick={() => setShowTutorial(false)}
            role="button"
            name="close-tutorial"
            aria-label="Close tutorial"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-slate-100">
              <Trophy /> The Goal
            </h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm">
              Compete in medieval tournaments, defeat opponents, and become the champion of the realm. Win tournaments to gain gold and experience for your characters.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-slate-100">
              <Sword /> Combat
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-2 text-sm">
              Combat is turn-based. When it's your turn, you can choose to Attack, Defend, or use a Skill:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-slate-300 text-sm pl-4">
              <li><span className="font-medium">Attack:</span> A basic attack dealing damage based on your Attack stat minus half the enemy's Defense.</li>
              <li><span className="font-medium">Defend:</span> Take a defensive stance, reducing damage from the next enemy attack by 50%.</li>
              <li><span className="font-medium">Skills:</span> Special abilities that cost Energy, often deal more damage, may have special effects, and have cooldown periods.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-slate-100">
              <Shield /> Character Classes & Stats
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-2 text-sm">
              Each class has different base stats and starting skills:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-slate-300 text-sm pl-4">
              <li><span className="font-medium">Knight:</span> High Health & Defense. Uses Slash attacks. Wears Heavy armor.</li>
              <li><span className="font-medium">Archer:</span> High Speed & Attack. Uses Pierce attacks. Wears Medium armor.</li>
              <li><span className="font-medium">Mage:</span> High Attack, low Health & Defense. Uses Magic attacks. Wears Light armor.</li>
              <li><span className="font-medium">Leveling Up:</span> Gain experience from battles. Reaching enough XP increases Level, stats, and fully heals the character.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-slate-100">
              <Zap /> Energy & Cooldowns
            </h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm">
              Energy is required to use skills. It regenerates by 10 points after your turn and by 20 points after each battle. Skills go on cooldown for a number of turns after being used.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-slate-100">
              <Dices /> Type Effectiveness
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-2 text-sm">
              Attack types interact with defense types:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-slate-300 text-sm pl-4">
              <li><span className="font-medium">Slash (Knight):</span> +20% damage vs Medium armor (Archer), -20% damage vs Heavy armor (Knight).</li>
              <li><span className="font-medium">Pierce (Archer):</span> +20% damage vs Heavy armor (Knight), -20% damage vs Medium armor (Archer).</li>
              <li><span className="font-medium">Magic (Mage):</span> -20% damage vs Light armor (Mage). Normal damage vs Heavy/Medium.</li>
            </ul>
             <p className="text-gray-600 dark:text-slate-300 mt-2 text-sm">
               A critical hit (10% chance) increases damage by 50%.
             </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-slate-100">
              <Trophy /> Tournament Progression
            </h3>
            <p className="text-gray-600 dark:text-slate-300 text-sm">
              Win all battles in a tournament to complete it and earn gold/XP rewards. Completed tournaments can be replayed. After each battle (win or lose), your character heals 30% of their max health.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center sticky bottom-0 bg-white dark:bg-slate-800 pt-2 border-t dark:border-slate-700">
          <button 
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
            onClick={() => setShowTutorial(false)}
            role="button"
            name="start-playing"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Settings</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            onClick={toggleSettings}
            role="button"
            name="close-settings"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-slate-300">Dark Mode</span>
            <button 
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${gameState.darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                onClick={toggleDarkMode}
                role="switch"
                aria-checked={gameState.darkMode}
                name="toggle-theme"
                aria-label={gameState.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="sr-only">Toggle Dark Mode</span>
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${gameState.darkMode ? 'translate-x-6' : 'translate-x-1'}`}
                />
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t dark:border-slate-700">
            <button 
              className="btn btn-primary w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              onClick={() => { toggleSettings(); setShowTutorial(true); }}
              role="button"
              name="view-tutorial"
            >
              <Info size={18} /> View Tutorial
            </button>
            
            <button 
              className="btn bg-red-600 hover:bg-red-700 text-white w-full flex justify-center items-center gap-2 font-bold py-2 px-4 rounded transition duration-300"
              onClick={resetGame}
              role="button"
              name="reset-game"
            >
              <RotateCcw size={18} /> Reset Game Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors duration-300 font-sans ${gameState.darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm transition-colors duration-300 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Shield /> Medieval Tournament
          </h1>
          
          <div className="flex items-center gap-3">
            {/* Home Button (only outside menu) */} 
            {gameState.gamePhase !== 'menu' && (
              <button 
                className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white font-semibold py-1 px-3 rounded transition duration-300 text-xs"
                onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'menu', activeTournamentId: null, currentEnemy: null }))} // Ensure reset state
                role="button"
                name="home"
              >
                Home
              </button>
            )}
            {/* Settings Button */} 
            <button 
              className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white font-semibold p-2 rounded-full transition duration-300"
              onClick={toggleSettings}
              role="button"
              name="settings"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */} 
      <main className="pb-20 pt-6"> {/* Added padding-bottom for footer */} 
        {/* Conditional Rendering based on gamePhase */} 
        {gameState.gamePhase === 'menu' && renderMainMenu()}
        {gameState.gamePhase === 'characterSelect' && renderCharacterSelect()}
        {gameState.gamePhase === 'tournament' && renderTournament()}
        {gameState.gamePhase === 'combat' && renderCombat()}
        {gameState.gamePhase === 'results' && renderResults()}
      </main>
      
      {/* Footer */} 
      <footer className="bg-white dark:bg-slate-800 shadow-inner py-4 fixed bottom-0 left-0 w-full transition-colors duration-300 border-t dark:border-slate-700 z-30">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500 dark:text-slate-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
      
      {/* Modals Layer */} 
      {showTutorial && renderTutorial()}
      {gameState.showSettings && renderSettings()}
      
      {/* Global Styles (like Tailwind base/components/utilities) should be imported in index.css or similar */} 
      <style jsx global>{`
        /* Basic button styling (can be replaced/augmented by Tailwind classes) */
        .btn {
          /* base styles */
        }
        .btn-primary {
         /* primary styles */
        }
        /* Add other base styles if needed */
        .card { 
          /* base card styles if needed beyond Tailwind */
        } 
        .badge { 
           /* base badge styles */
        }
         /* Custom scrollbar for Webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px; 
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent; 
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5); /* Default gray-400 */
          border-radius: 20px;
          border: 3px solid transparent; 
          background-clip: content-box; 
        }
        .dark .scrollbar-thumb-slate-600::-webkit-scrollbar-thumb {
           background-color: #475569; /* slate-600 */
        }
         /* Basic CSS for theme toggle if not using a library */
        .theme-toggle {
            /* Style your toggle switch here */
        }
        .theme-toggle-thumb {
            /* Style the moving part */
        }
      `}</style>
    </div>
  );
};

export default App;
