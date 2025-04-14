import React, { useState, useEffect, useCallback } from 'react';
import {
  Sword,
  Shield,
  Dumbbell,
  Heart,
  Trophy,
  ChevronDown,
  X,
  // Rotate3D, // Removed: Not a standard Lucide icon
  // CrosshairIcon, // Removed: Not used, correct name is Crosshair
  PauseCircle,
  PlayCircle,
  Crown,
  Dices,
  Medal,
  Target,
  ArrowUp,
  Info,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css'; // Retained import as requested

type CharacterClass = 'Knight' | 'Archer' | 'Barbarian' | 'Mage';

interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  strength: number;
  speed: number;
  abilities: Ability[];
  equipment: Equipment | null;
  avatar: string;
  isPlayerCharacter: boolean;
}

interface Ability {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'heal' | 'buff' | 'debuff';
  power: number;
  energyCost: number;
  cooldown: number;
  currentCooldown: number;
  description: string;
  icon?: React.ReactNode;
}

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'shield' | 'accessory';
  attackBonus: number;
  defenseBonus: number;
  healthBonus: number;
  description: string;
}

interface Tournament {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rounds: number;
  currentRound: number;
  completed: boolean;
  rewards: {
    gold: number;
    experience: number;
    equipment?: Equipment;
  };
  opponents: Character[];
}

interface BattleState {
  playerCharacter: Character;
  opponent: Character;
  turn: 'player' | 'opponent';
  roundNumber: number;
  log: string[];
  playerEnergy: number;
  opponentEnergy: number;
  isOver: boolean;
  winner: 'player' | 'opponent' | null;
  tournamentId: string | null;
  tournamentRound: number;
}

interface GameState {
  player: {
    name: string;
    characters: Character[];
    gold: number;
    tournamentsCompleted: number;
    tournamentsWon: number;
    currentTournament: string | null;
  };
  tournaments: Tournament[];
  availableEquipment: Equipment[];
  battleState: BattleState | null;
  currentScreen: 'main' | 'tournament' | 'battle' | 'character' | 'equipment' | 'tutorial';
  selectedCharacterId: string | null;
  notifications: string[];
}

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const savedSound = localStorage.getItem('soundEnabled');
    return savedSound ? JSON.parse(savedSound) : true;
  });
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('medievalCombatState');
    if (savedState) {
      return JSON.parse(savedState);
    }

    // Default initial state
    return {
      player: {
        name: 'Player',
        characters: [],
        gold: 100,
        tournamentsCompleted: 0,
        tournamentsWon: 0,
        currentTournament: null
      },
      tournaments: [],
      availableEquipment: [],
      battleState: null,
      currentScreen: 'main',
      selectedCharacterId: null,
      notifications: []
    };
  });

  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    const tutorialShown = localStorage.getItem('tutorialShown');
    return tutorialShown ? false : true;
  });

  const [showAbilityInfo, setShowAbilityInfo] = useState<{ [key: string]: boolean }>({});

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('medievalCombatState', JSON.stringify(gameState));
  }, [gameState]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Initialize game if first time
  useEffect(() => {
    if (gameState.player.characters.length === 0) {
      initializeGame();
    }
  }, []);

  const playSound = useCallback((soundType: 'attack' | 'heal' | 'victory' | 'defeat' | 'button') => {
    if (!soundEnabled) return;

    // In a real implementation, you would play actual sound files here
    console.log(`Playing ${soundType} sound`);
  }, [soundEnabled]);

  const initializeGame = () => {
    // Create starting character
    const startingKnight: Character = {
      id: 'char-1',
      name: 'Sir Galahad',
      class: 'Knight',
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      attack: 15,
      defense: 10,
      strength: 12,
      speed: 8,
      abilities: [
        {
          id: 'ability-1',
          name: 'Sword Slash',
          type: 'attack',
          power: 20,
          energyCost: 10,
          cooldown: 0,
          currentCooldown: 0,
          description: 'A basic sword attack that deals moderate damage.'
        },
        {
          id: 'ability-2',
          name: 'Shield Block',
          type: 'defense',
          power: 15,
          energyCost: 15,
          cooldown: 2,
          currentCooldown: 0,
          description: 'Raises your shield to block incoming attacks for one turn.'
        }
      ],
      equipment: {
        id: 'equip-1',
        name: 'Iron Sword',
        type: 'weapon',
        attackBonus: 5,
        defenseBonus: 0,
        healthBonus: 0,
        description: 'A standard iron sword.'
      },
      avatar: '🧑‍🦱',
      isPlayerCharacter: true
    };

    // Create starting tournaments
    const startingTournaments: Tournament[] = [
      {
        id: 'tournament-1',
        name: 'Village Cup',
        difficulty: 'easy',
        rounds: 3,
        currentRound: 0,
        completed: false,
        rewards: {
          gold: 50,
          experience: 100,
          equipment: {
            id: 'equip-2',
            name: 'Steel Sword',
            type: 'weapon',
            attackBonus: 8,
            defenseBonus: 0,
            healthBonus: 0,
            description: 'A well-crafted steel sword with improved damage.'
          }
        },
        opponents: [
          {
            id: 'enemy-1',
            name: 'Squire Roderick',
            class: 'Knight',
            level: 1,
            experience: 0,
            health: 80,
            maxHealth: 80,
            attack: 12,
            defense: 8,
            strength: 10,
            speed: 7,
            abilities: [
              {
                id: 'enemy-ability-1',
                name: 'Sword Slash',
                type: 'attack',
                power: 15,
                energyCost: 10,
                cooldown: 0,
                currentCooldown: 0,
                description: 'A basic sword attack that deals moderate damage.'
              }
            ],
            equipment: null,
            avatar: '👨',
            isPlayerCharacter: false
          },
          {
            id: 'enemy-2',
            name: 'Apprentice Archer',
            class: 'Archer',
            level: 1,
            experience: 0,
            health: 70,
            maxHealth: 70,
            attack: 14,
            defense: 6,
            strength: 8,
            speed: 12,
            abilities: [
              {
                id: 'enemy-ability-2',
                name: 'Quick Shot',
                type: 'attack',
                power: 18,
                energyCost: 12,
                cooldown: 0,
                currentCooldown: 0,
                description: 'A fast arrow shot that deals moderate damage.'
              }
            ],
            equipment: null,
            avatar: '🏹',
            isPlayerCharacter: false
          },
          {
            id: 'enemy-3',
            name: 'Veteran Swordsman',
            class: 'Knight',
            level: 2,
            experience: 0,
            health: 100,
            maxHealth: 100,
            attack: 16,
            defense: 12,
            strength: 14,
            speed: 9,
            abilities: [
              {
                id: 'enemy-ability-3',
                name: 'Power Strike',
                type: 'attack',
                power: 25,
                energyCost: 15,
                cooldown: 1,
                currentCooldown: 0,
                description: 'A powerful sword strike that deals high damage.'
              },
              {
                id: 'enemy-ability-4',
                name: 'Defensive Stance',
                type: 'defense',
                power: 10,
                energyCost: 10,
                cooldown: 2,
                currentCooldown: 0,
                description: 'Takes a defensive stance to reduce incoming damage.'
              }
            ],
            equipment: null,
            avatar: '⚔️',
            isPlayerCharacter: false
          }
        ]
      },
      {
        id: 'tournament-2',
        name: 'Royal Tournament',
        difficulty: 'medium',
        rounds: 3,
        currentRound: 0,
        completed: false,
        rewards: {
          gold: 100,
          experience: 200,
          equipment: {
            id: 'equip-3',
            name: 'Knight\'s Armor',
            type: 'armor',
            attackBonus: 0,
            defenseBonus: 10,
            healthBonus: 20,
            description: 'Well-crafted plate armor offering excellent protection.'
          }
        },
        opponents: [
          {
            id: 'enemy-4',
            name: 'Royal Guard',
            class: 'Knight',
            level: 3,
            experience: 0,
            health: 120,
            maxHealth: 120,
            attack: 18,
            defense: 15,
            strength: 16,
            speed: 10,
            abilities: [
              {
                id: 'enemy-ability-5',
                name: 'Guard Slam',
                type: 'attack',
                power: 22,
                energyCost: 12,
                cooldown: 1,
                currentCooldown: 0,
                description: 'A powerful shield bash that deals good damage.'
              },
              {
                id: 'enemy-ability-6',
                name: 'Royal Defense',
                type: 'defense',
                power: 18,
                energyCost: 15,
                cooldown: 2,
                currentCooldown: 0,
                description: 'Takes a highly trained defensive stance to significantly reduce damage.'
              }
            ],
            equipment: null,
            avatar: '👑',
            isPlayerCharacter: false
          },
          {
            id: 'enemy-5',
            name: 'Elite Archer',
            class: 'Archer',
            level: 3,
            experience: 0,
            health: 90,
            maxHealth: 90,
            attack: 22,
            defense: 8,
            strength: 12,
            speed: 18,
            abilities: [
              {
                id: 'enemy-ability-7',
                name: 'Precision Shot',
                type: 'attack',
                power: 28,
                energyCost: 15,
                cooldown: 1,
                currentCooldown: 0,
                description: 'A carefully aimed shot that deals high damage.'
              },
              {
                id: 'enemy-ability-8',
                name: 'Quick Dodge',
                type: 'defense',
                power: 14,
                energyCost: 12,
                cooldown: 2,
                currentCooldown: 0,
                description: 'Quickly dodges incoming attacks, reducing damage taken.'
              }
            ],
            equipment: null,
            avatar: '🏹',
            isPlayerCharacter: false
          },
          {
            id: 'enemy-6',
            name: 'Knight Champion',
            class: 'Knight',
            level: 4,
            experience: 0,
            health: 150,
            maxHealth: 150,
            attack: 25,
            defense: 20,
            strength: 22,
            speed: 12,
            abilities: [
              {
                id: 'enemy-ability-9',
                name: 'Champion\'s Strike',
                type: 'attack',
                power: 35,
                energyCost: 20,
                cooldown: 2,
                currentCooldown: 0,
                description: 'A devastating attack from the tournament champion.'
              },
              {
                id: 'enemy-ability-10',
                name: 'Battle Experience',
                type: 'buff',
                power: 10,
                energyCost: 15,
                cooldown: 3,
                currentCooldown: 0,
                description: 'Uses battle experience to increase attack and defense.'
              },
              {
                id: 'enemy-ability-11',
                name: 'Shield Wall',
                type: 'defense',
                power: 25,
                energyCost: 18,
                cooldown: 2,
                currentCooldown: 0,
                description: 'Creates an almost impenetrable defense with shield and armor.'
              }
            ],
            equipment: null,
            avatar: '🛡️',
            isPlayerCharacter: false
          }
        ]
      }
    ];

    // Create starting equipment available for purchase
    const startingEquipment: Equipment[] = [
      {
        id: 'shop-equip-1',
        name: 'Steel Armor',
        type: 'armor',
        attackBonus: 0,
        defenseBonus: 7,
        healthBonus: 15,
        description: 'Sturdy steel armor that provides good protection.'
      },
      {
        id: 'shop-equip-2',
        name: 'Knight\'s Shield',
        type: 'shield',
        attackBonus: 0,
        defenseBonus: 10,
        healthBonus: 5,
        description: 'A well-crafted shield emblazoned with a knight\'s emblem.'
      }
    ];

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        characters: [startingKnight]
      },
      tournaments: startingTournaments,
      availableEquipment: startingEquipment,
      selectedCharacterId: startingKnight.id
    }));
  };

  const getSelectedCharacter = (): Character | undefined => {
    return gameState.player.characters.find(char => char.id === gameState.selectedCharacterId);
  };

  const startTournament = (tournamentId: string) => {
    const selectedCharacter = getSelectedCharacter();
    const tournament = gameState.tournaments.find(t => t.id === tournamentId);

    if (!selectedCharacter || !tournament) return;

    // Reset tournament progress if needed
    const updatedTournament = {
      ...tournament,
      currentRound: 0,
      completed: false
    };

    // Set up battle state for the first opponent
    const opponent = { ...tournament.opponents[0] };
    const initialBattleState: BattleState = {
      playerCharacter: { ...selectedCharacter },
      opponent: opponent,
      turn: 'player',
      roundNumber: 1,
      log: [`Tournament: ${tournament.name}, Round 1 begins!`],
      playerEnergy: 100,
      opponentEnergy: 100,
      isOver: false,
      winner: null,
      tournamentId: tournament.id,
      tournamentRound: 1
    };

    playSound('button');

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        currentTournament: tournamentId
      },
      tournaments: prev.tournaments.map(t => t.id === tournamentId ? updatedTournament : t),
      battleState: initialBattleState,
      currentScreen: 'battle'
    }));
  };

  // Renamed function to avoid conflict with React Hook naming convention
  const handleUseAbility = (abilityId: string) => {
    if (!gameState.battleState || gameState.battleState.turn !== 'player' || gameState.battleState.isOver) return;

    const ability = gameState.battleState.playerCharacter.abilities.find(a => a.id === abilityId);
    if (!ability || ability.currentCooldown > 0 || ability.energyCost > gameState.battleState.playerEnergy) return;

    // Execute the ability logic based on its type
    const battleState = { ...gameState.battleState };
    let logMessage = '';

    switch (ability.type) {
      case 'attack':
        const damage = calculateDamage(ability.power, battleState.playerCharacter.attack, battleState.opponent.defense);
        battleState.opponent.health = Math.max(0, battleState.opponent.health - damage);
        logMessage = `${battleState.playerCharacter.name} used ${ability.name} and dealt ${damage} damage to ${battleState.opponent.name}!`;
        playSound('attack');
        break;

      case 'defense':
        // Apply a temporary defense buff (will be handled in damage calculations)
        battleState.playerCharacter.defense += ability.power;
        logMessage = `${battleState.playerCharacter.name} used ${ability.name} to increase defense by ${ability.power}!`;
        break;

      case 'heal':
        const healAmount = Math.ceil(ability.power);
        battleState.playerCharacter.health = Math.min(battleState.playerCharacter.maxHealth, battleState.playerCharacter.health + healAmount);
        logMessage = `${battleState.playerCharacter.name} used ${ability.name} and recovered ${healAmount} health!`;
        playSound('heal');
        break;

      case 'buff':
        // Apply stat buffs
        battleState.playerCharacter.attack += Math.ceil(ability.power / 2);
        battleState.playerCharacter.strength += Math.ceil(ability.power / 2);
        logMessage = `${battleState.playerCharacter.name} used ${ability.name} to boost combat abilities!`;
        break;

      case 'debuff':
        // Apply stat debuffs to opponent
        battleState.opponent.defense = Math.max(0, battleState.opponent.defense - Math.ceil(ability.power / 2));
        battleState.opponent.attack = Math.max(0, battleState.opponent.attack - Math.ceil(ability.power / 3));
        logMessage = `${battleState.playerCharacter.name} used ${ability.name} to weaken ${battleState.opponent.name}!`;
        break;
    }

    // Update ability cooldown
    const updatedAbilities = battleState.playerCharacter.abilities.map(a => {
      if (a.id === ability.id) {
        return { ...a, currentCooldown: ability.cooldown };
      } else {
        return a;
      }
    });

    battleState.playerCharacter.abilities = updatedAbilities;
    battleState.playerEnergy -= ability.energyCost;
    battleState.log.push(logMessage);

    // Check if battle is over after player's turn
    if (battleState.opponent.health <= 0) {
      battleState.isOver = true;
      battleState.winner = 'player';
      battleState.log.push(`${battleState.opponent.name} has been defeated!`);
      playSound('victory');
    } else {
      // Switch to opponent's turn
      battleState.turn = 'opponent';

      // Schedule opponent's turn with a slight delay for better UX
      setTimeout(() => opponentTurn(), 1500);
    }

    setGameState(prev => ({
      ...prev,
      battleState
    }));
  };

  const calculateDamage = (abilityPower: number, attackerAttack: number, defenderDefense: number): number => {
    // Base damage formula with some randomness
    const baseDamage = abilityPower + (attackerAttack / 2);
    const defense = defenderDefense / 4;
    const finalDamage = Math.max(1, Math.floor(baseDamage - defense + (Math.random() * 5 - 2)));
    return finalDamage;
  };

  const opponentTurn = () => {
    if (!gameState.battleState || gameState.battleState.isOver) return;

    const battleState = { ...gameState.battleState };

    // Select an ability for the opponent to use (simple AI)
    const availableAbilities = battleState.opponent.abilities.filter(
      a => a.currentCooldown === 0 && a.energyCost <= battleState.opponentEnergy
    );

    if (availableAbilities.length === 0) {
      // Skip turn if no abilities are available
      battleState.log.push(`${battleState.opponent.name} has no available abilities and skips a turn.`);
      battleState.opponentEnergy = Math.min(100, battleState.opponentEnergy + 20); // Recover some energy
    } else {
      // Simple AI strategy
      let selectedAbility;

      if (battleState.opponent.health < battleState.opponent.maxHealth * 0.3) {
        // If low health, prioritize healing or defense
        selectedAbility = availableAbilities.find(a => a.type === 'heal') ||
                         availableAbilities.find(a => a.type === 'defense') ||
                         availableAbilities[0];
      } else if (battleState.opponent.health < battleState.opponent.maxHealth * 0.5) {
        // If moderate health, consider defense or buffs
        selectedAbility = availableAbilities.find(a => a.type === 'defense') ||
                         availableAbilities.find(a => a.type === 'buff') ||
                         availableAbilities[0];
      } else {
        // Otherwise prioritize attack or debuff
        selectedAbility = availableAbilities.find(a => a.type === 'attack') ||
                         availableAbilities.find(a => a.type === 'debuff') ||
                         availableAbilities[0];
      }

      // Execute the selected ability
      let logMessage = '';

      switch (selectedAbility.type) {
        case 'attack':
          const damage = calculateDamage(selectedAbility.power, battleState.opponent.attack, battleState.playerCharacter.defense);
          battleState.playerCharacter.health = Math.max(0, battleState.playerCharacter.health - damage);
          logMessage = `${battleState.opponent.name} used ${selectedAbility.name} and dealt ${damage} damage to ${battleState.playerCharacter.name}!`;
          playSound('attack');
          break;

        case 'defense':
          battleState.opponent.defense += selectedAbility.power;
          logMessage = `${battleState.opponent.name} used ${selectedAbility.name} to increase defense by ${selectedAbility.power}!`;
          break;

        case 'heal':
          const healAmount = Math.ceil(selectedAbility.power);
          battleState.opponent.health = Math.min(battleState.opponent.maxHealth, battleState.opponent.health + healAmount);
          logMessage = `${battleState.opponent.name} used ${selectedAbility.name} and recovered ${healAmount} health!`;
          break;

        case 'buff':
          battleState.opponent.attack += Math.ceil(selectedAbility.power / 2);
          battleState.opponent.strength += Math.ceil(selectedAbility.power / 2);
          logMessage = `${battleState.opponent.name} used ${selectedAbility.name} to boost combat abilities!`;
          break;

        case 'debuff':
          battleState.playerCharacter.defense = Math.max(0, battleState.playerCharacter.defense - Math.ceil(selectedAbility.power / 2));
          battleState.playerCharacter.attack = Math.max(0, battleState.playerCharacter.attack - Math.ceil(selectedAbility.power / 3));
          logMessage = `${battleState.opponent.name} used ${selectedAbility.name} to weaken ${battleState.playerCharacter.name}!`;
          break;
      }

      // Update ability cooldown
      const updatedAbilities = battleState.opponent.abilities.map(a => {
        if (a.id === selectedAbility.id) {
          return { ...a, currentCooldown: selectedAbility.cooldown };
        } else {
          return a;
        }
      });

      battleState.opponent.abilities = updatedAbilities;
      battleState.opponentEnergy -= selectedAbility.energyCost;
      battleState.log.push(logMessage);
    }

    // Check if battle is over after opponent's turn
    if (battleState.playerCharacter.health <= 0) {
      battleState.isOver = true;
      battleState.winner = 'opponent';
      battleState.log.push(`${battleState.playerCharacter.name} has been defeated!`);
      playSound('defeat');
    } else {
      // Reduce cooldowns for player abilities
      battleState.playerCharacter.abilities = battleState.playerCharacter.abilities.map(a => ({
        ...a,
        currentCooldown: Math.max(0, a.currentCooldown - 1)
      }));

      // Reduce cooldowns for opponent abilities
      battleState.opponent.abilities = battleState.opponent.abilities.map(a => ({
        ...a,
        currentCooldown: Math.max(0, a.currentCooldown - 1)
      }));

      // Recover energy for next round
      battleState.playerEnergy = Math.min(100, battleState.playerEnergy + 15);
      battleState.opponentEnergy = Math.min(100, battleState.opponentEnergy + 15);

      battleState.turn = 'player';
      battleState.roundNumber += 1;
    }

    setGameState(prev => ({
      ...prev,
      battleState
    }));
  };

  const endBattle = () => {
    if (!gameState.battleState || !gameState.battleState.isOver) return;

    const battleState = gameState.battleState;
    const tournament = gameState.tournaments.find(t => t.id === battleState.tournamentId);

    if (!tournament) return;

    playSound('button');

    if (battleState.winner === 'player') {
      // If player won
      if (battleState.tournamentRound < tournament.rounds) {
        // Move to next round in tournament
        const nextRound = battleState.tournamentRound + 1;
        const nextOpponent = tournament.opponents[nextRound - 1];

        // Set up next round battle
        const nextBattleState: BattleState = {
          playerCharacter: { ...battleState.playerCharacter },
          opponent: { ...nextOpponent },
          turn: 'player',
          roundNumber: 1,
          log: [`Tournament: ${tournament.name}, Round ${nextRound} begins!`],
          playerEnergy: 100,
          opponentEnergy: 100,
          isOver: false,
          winner: null,
          tournamentId: tournament.id,
          tournamentRound: nextRound
        };

        // Partially heal player character between rounds
        nextBattleState.playerCharacter.health = Math.min(
          nextBattleState.playerCharacter.maxHealth,
          nextBattleState.playerCharacter.health + Math.floor(nextBattleState.playerCharacter.maxHealth * 0.3)
        );

        // Reset cooldowns
        nextBattleState.playerCharacter.abilities = nextBattleState.playerCharacter.abilities.map(a => ({
          ...a,
          currentCooldown: 0
        }));

        setGameState(prev => ({
          ...prev,
          tournaments: prev.tournaments.map(t =>
            t.id === tournament.id ? { ...t, currentRound: nextRound } : t
          ),
          battleState: nextBattleState
        }));
      } else {
        // Tournament completed
        const updatedTournament = {
          ...tournament,
          completed: true,
          currentRound: tournament.rounds
        };

        // Get selected character from state to update
        const selectedCharacter = getSelectedCharacter();
        if (!selectedCharacter) return;

        // Award experience to player character
        const experienceGained = tournament.rewards.experience;
        let leveledUp = false;
        let newLevel = selectedCharacter.level;
        let newExperience = selectedCharacter.experience + experienceGained;

        // Simple level up mechanic
        const experienceToNextLevel = selectedCharacter.level * 100;
        if (newExperience >= experienceToNextLevel) {
          newLevel += 1;
          newExperience -= experienceToNextLevel;
          leveledUp = true;
        }

        // Update character stats if leveled up
        const updatedCharacter = { ...selectedCharacter };
        updatedCharacter.experience = newExperience;

        if (leveledUp) {
          updatedCharacter.level = newLevel;
          updatedCharacter.maxHealth += 10;
          updatedCharacter.health = updatedCharacter.maxHealth; // Fully heal on level up
          updatedCharacter.attack += 2;
          updatedCharacter.defense += 2;
          updatedCharacter.strength += 1;
          updatedCharacter.speed += 1;

          // Add a new ability if reaching level 3
          if (newLevel === 3 && !updatedCharacter.abilities.some(a => a.name === 'Healing Potion')) {
            updatedCharacter.abilities.push({
              id: `ability-${Date.now()}`,
              name: 'Healing Potion',
              type: 'heal',
              power: 30,
              energyCost: 25,
              cooldown: 3,
              currentCooldown: 0,
              description: 'Drink a healing potion to restore 30 health.'
            });
          }

          // Add another ability if reaching level 5
          if (newLevel === 5 && !updatedCharacter.abilities.some(a => a.name === 'Knight\'s Fury')) {
            updatedCharacter.abilities.push({
              id: `ability-${Date.now()}`,
              name: 'Knight\'s Fury',
              type: 'attack',
              power: 40,
              energyCost: 35,
              cooldown: 3,
              currentCooldown: 0,
              description: 'A powerful attack that deals massive damage.'
            });
          }
        }

        setGameState(prev => ({
          ...prev,
          player: {
            ...prev.player,
            characters: prev.player.characters.map(c =>
              c.id === updatedCharacter.id ? updatedCharacter : c
            ),
            gold: prev.player.gold + tournament.rewards.gold,
            tournamentsCompleted: prev.player.tournamentsCompleted + 1,
            tournamentsWon: prev.player.tournamentsWon + 1,
            currentTournament: null
          },
          tournaments: prev.tournaments.map(t =>
            t.id === tournament.id ? updatedTournament : t
          ),
          battleState: null,
          currentScreen: 'main',
          notifications: [
            ...prev.notifications,
            `Tournament ${tournament.name} completed! You earned ${tournament.rewards.gold} gold and ${experienceGained} experience!`,
            ...(leveledUp ? [`${updatedCharacter.name} leveled up to level ${newLevel}!`] : []),
            ...(tournament.rewards.equipment ? ['You received new equipment as a reward!'] : [])
          ]
        }));

        // Add tournament reward equipment to available equipment
        if (tournament.rewards.equipment) {
          setGameState(prev => ({
            ...prev,
            availableEquipment: [...prev.availableEquipment, tournament.rewards.equipment as Equipment]
          }));
        }
      }
    } else {
      // Player lost the tournament
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          currentTournament: null
        },
        battleState: null,
        currentScreen: 'main',
        notifications: [
          ...prev.notifications,
          `You were defeated in round ${battleState.tournamentRound} of ${tournament.name}. Better luck next time!`
        ]
      }));
    }
  };

  const equipItem = (equipmentId: string) => {
    const selectedCharacter = getSelectedCharacter();
    if (!selectedCharacter) return;

    const equipment = gameState.availableEquipment.find(e => e.id === equipmentId);
    if (!equipment) return;

    playSound('button');

    // Unequip current equipment if any
    const previousEquipment = selectedCharacter.equipment;

    // Update character stats with new equipment
    const updatedCharacter = { ...selectedCharacter };
    updatedCharacter.equipment = equipment;

    // Adjust stats based on equipment bonuses
    if (previousEquipment) {
      // Remove old bonuses
      updatedCharacter.attack -= previousEquipment.attackBonus;
      updatedCharacter.defense -= previousEquipment.defenseBonus;
      updatedCharacter.maxHealth -= previousEquipment.healthBonus;
      updatedCharacter.health = Math.min(updatedCharacter.health, updatedCharacter.maxHealth);
    }

    // Add new bonuses
    updatedCharacter.attack += equipment.attackBonus;
    updatedCharacter.defense += equipment.defenseBonus;
    updatedCharacter.maxHealth += equipment.healthBonus;
    updatedCharacter.health += equipment.healthBonus; // Healing effect when equipping health items

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        characters: prev.player.characters.map(c =>
          c.id === updatedCharacter.id ? updatedCharacter : c
        )
      },
      availableEquipment: prev.availableEquipment.filter(e => e.id !== equipmentId),
      notifications: [
        ...prev.notifications,
        `${updatedCharacter.name} equipped ${equipment.name}!`
      ]
    }));

    // Add old equipment back to available equipment if there was any
    if (previousEquipment) {
      setGameState(prev => ({
        ...prev,
        availableEquipment: [...prev.availableEquipment, previousEquipment]
      }));
    }
  };

  const dismissNotification = (index: number) => {
    setGameState(prev => ({
      ...prev,
      notifications: prev.notifications.filter((_, i) => i !== index)
    }));
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorialShown', 'true');
  };

  const toggleAbilityInfo = (abilityId: string) => {
    setShowAbilityInfo(prev => ({
      ...prev,
      [abilityId]: !prev[abilityId]
    }));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''} theme-transition-all`}>
      <div className="bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white min-h-screen">
        {/* Header */}
        <header className="bg-gray-200 dark:bg-slate-800 p-4 shadow-md flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Medieval Combat Tournament</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white theme-transition"
              aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white theme-transition"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-narrow py-6">
          {/* Notifications */}
          {gameState.notifications.length > 0 && (
            <div className="mb-6">
              {gameState.notifications.map((notification, index) => (
                <div key={index} className="alert alert-info mb-2 flex justify-between">
                  <span>{notification}</span>
                  <button
                    onClick={() => dismissNotification(index)}
                    className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                    aria-label="Dismiss notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tutorial Modal */}
          {showTutorial && (
            <div className="modal-backdrop" onClick={closeTutorial}>
              <div
                className="modal-content theme-transition-all max-w-2xl"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="tutorial-title"
              >
                <div className="modal-header">
                  <h2 id="tutorial-title" className="text-xl font-bold">Welcome to Medieval Combat Tournament!</h2>
                  <button
                    onClick={closeTutorial}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label="Close tutorial"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-content overflow-y-auto max-h-[60vh] pr-2">
                  <div className="space-y-4">
                    <p>Welcome, brave warrior! This game is a turn-based combat strategy game set in medieval times.</p>

                    <div>
                      <h3 className="text-lg font-bold mb-2">Game Overview:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>You'll control your character in tournament battles against various opponents</li>
                        <li>Combat is turn-based, with you and your opponent taking alternating turns</li>
                        <li>Use your abilities strategically to defeat your opponents</li>
                        <li>Win tournaments to earn gold, experience, and new equipment</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-2">Combat Basics:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Health:</strong> When your health reaches zero, you lose the battle</li>
                        <li><strong>Energy:</strong> Each ability costs energy to use. Energy regenerates between turns</li>
                        <li><strong>Abilities:</strong> Each character has unique abilities with different effects</li>
                        <li><strong>Cooldowns:</strong> Some powerful abilities have cooldowns before they can be used again</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-2">Tips for Victory:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use defensive abilities when you're low on health</li>
                        <li>Save powerful attacks for critical moments</li>
                        <li>Equip your character with the best equipment available</li>
                        <li>Level up your character by winning tournaments to gain new abilities</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button onClick={closeTutorial} className="btn btn-primary">Begin Your Journey</button>
                </div>
              </div>
            </div>
          )}

          {/* Main Screen */}
          {gameState.currentScreen === 'main' && (
            <div className="space-y-6">
              {/* Player Stats */}
              <div className="card theme-transition-all">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold mb-2">{gameState.player.name}</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Gold:</span> {gameState.player.gold}
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Tournaments Won:</span> {gameState.player.tournamentsWon}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, currentScreen: 'character' }))}
                      className="btn btn-primary flex items-center gap-1"
                      aria-label="View character"
                    >
                      <Sword size={16} /> Character
                    </button>
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, currentScreen: 'equipment' }))}
                      className="btn btn-secondary flex items-center gap-1"
                      aria-label="View equipment"
                    >
                      <Shield size={16} /> Equipment
                    </button>
                    <button
                      onClick={() => setShowTutorial(true)}
                      className="btn bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
                      aria-label="View tutorial"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tournament Selection */}
              <div>
                <h2 className="text-xl font-bold mb-3">Available Tournaments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameState.tournaments.map(tournament => (
                    <div
                      key={tournament.id}
                      className={`card ${tournament.completed ? 'bg-gray-100 dark:bg-slate-800/50' : ''} theme-transition-all`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            {tournament.name}
                            {tournament.completed && <Trophy size={16} className="text-yellow-500" />}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Difficulty:
                            <span className={`ml-1 ${tournament.difficulty === 'easy' ? 'text-green-600 dark:text-green-400' : tournament.difficulty === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                              {tournament.difficulty.charAt(0).toUpperCase() + tournament.difficulty.slice(1)}
                            </span>
                          </p>
                          <p className="text-sm mb-3">Rounds: {tournament.rounds}</p>

                          <div className="text-sm mb-4">
                            <p className="font-medium">Rewards:</p>
                            <ul className="pl-4">
                              <li>Gold: {tournament.rewards.gold}</li>
                              <li>Experience: {tournament.rewards.experience}</li>
                              {tournament.rewards.equipment && (
                                <li>Equipment: {tournament.rewards.equipment.name}</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => startTournament(tournament.id)}
                        disabled={tournament.completed}
                        className={`btn w-full ${tournament.completed ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'btn-primary'}`}
                        aria-label={`Start ${tournament.name} tournament`}
                      >
                        {tournament.completed ? 'Completed' : 'Start Tournament'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats Overview */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Combat Statistics</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Tournament Progress</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: gameState.player.tournamentsCompleted },
                            { name: 'Available', value: Math.max(0, gameState.tournaments.length - gameState.player.tournamentsCompleted) }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#4f46e5" />
                          <Cell fill="#94a3b8" />
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Character Stats</h3>
                    {getSelectedCharacter() && (
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={[
                            { name: 'Attack', value: getSelectedCharacter()?.attack || 0 },
                            { name: 'Defense', value: getSelectedCharacter()?.defense || 0 },
                            { name: 'Health', value: getSelectedCharacter()?.maxHealth || 0 },
                            { name: 'Strength', value: getSelectedCharacter()?.strength || 0 },
                            { name: 'Speed', value: getSelectedCharacter()?.speed || 0 }
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#4f46e5" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Character Screen */}
          {gameState.currentScreen === 'character' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Character Management</h2>
                <button
                  onClick={() => setGameState(prev => ({ ...prev, currentScreen: 'main' }))}
                  className="btn btn-secondary"
                  aria-label="Back to main screen"
                >
                  Back
                </button>
              </div>

              {gameState.player.characters.map(character => (
                <div key={character.id} className="card">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/4 flex flex-col items-center justify-center">
                      <div className="text-6xl mb-2">{character.avatar}</div>
                      <h3 className="text-xl font-bold">{character.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{character.class}</p>
                      <div className="mt-2 badge badge-success">
                        Level {character.level}
                      </div>
                    </div>

                    <div className="md:w-3/4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-bold mb-2">Stats</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2">
                              <Heart size={16} className="text-red-500" />
                              <span className="text-gray-600 dark:text-gray-400">Health:</span> {character.health}/{character.maxHealth}
                            </div>
                            <div className="flex items-center gap-2">
                              <Sword size={16} className="text-blue-500" />
                              <span className="text-gray-600 dark:text-gray-400">Attack:</span> {character.attack}
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield size={16} className="text-green-500" />
                              <span className="text-gray-600 dark:text-gray-400">Defense:</span> {character.defense}
                            </div>
                            <div className="flex items-center gap-2">
                              <Dumbbell size={16} className="text-yellow-500" />
                              <span className="text-gray-600 dark:text-gray-400">Strength:</span> {character.strength}
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="font-bold mb-1">Experience</h4>
                            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="absolute h-full bg-blue-500"
                                style={{ width: `${(character.experience / (character.level * 100)) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-sm mt-1">{character.experience} / {character.level * 100} XP to next level</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold mb-2">Equipment</h4>
                          {character.equipment ? (
                            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                              <p className="font-medium">{character.equipment.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{character.equipment.type.charAt(0).toUpperCase() + character.equipment.type.slice(1)}</p>
                              <div className="grid grid-cols-3 gap-1 mt-2 text-sm">
                                {character.equipment.attackBonus > 0 && (
                                  <span className="text-blue-600 dark:text-blue-400">+{character.equipment.attackBonus} ATK</span>
                                )}
                                {character.equipment.defenseBonus > 0 && (
                                  <span className="text-green-600 dark:text-green-400">+{character.equipment.defenseBonus} DEF</span>
                                )}
                                {character.equipment.healthBonus > 0 && (
                                  <span className="text-red-600 dark:text-red-400">+{character.equipment.healthBonus} HP</span>
                                )}
                              </div>
                              <p className="text-sm mt-2">{character.equipment.description}</p>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">No equipment</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold mb-2">Abilities</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {character.abilities.map(ability => (
                            <div
                              key={ability.id}
                              className="relative border border-gray-200 dark:border-gray-700 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800/50 theme-transition"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{ability.name}</p>
                                  <div className="flex flex-wrap gap-2 text-sm mt-1">
                                    <span className={`
                                      badge
                                      ${ability.type === 'attack' ? 'badge-error' : ''}
                                      ${ability.type === 'defense' ? 'badge-info' : ''}
                                      ${ability.type === 'heal' ? 'badge-success' : ''}
                                      ${ability.type === 'buff' ? 'badge-warning' : ''}
                                      ${ability.type === 'debuff' ? 'badge-warning' : ''}
                                    `}>
                                      {ability.type.charAt(0).toUpperCase() + ability.type.slice(1)}
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400">Power: {ability.power}</span>
                                    <span className="text-gray-600 dark:text-gray-400">Energy: {ability.energyCost}</span>
                                    {ability.cooldown > 0 && (
                                      <span className="text-gray-600 dark:text-gray-400">Cooldown: {ability.cooldown}</span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => toggleAbilityInfo(ability.id)}
                                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                  aria-label={showAbilityInfo[ability.id] ? "Hide ability details" : "Show ability details"}
                                >
                                  <Info size={16} />
                                </button>
                              </div>

                              {showAbilityInfo[ability.id] && (
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-sm">
                                  <p>{ability.description}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Equipment Screen */}
          {gameState.currentScreen === 'equipment' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Equipment Management</h2>
                <button
                  onClick={() => setGameState(prev => ({ ...prev, currentScreen: 'main' }))}
                  className="btn btn-secondary"
                  aria-label="Back to main screen"
                >
                  Back
                </button>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold mb-4">Available Equipment</h3>

                {gameState.availableEquipment.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameState.availableEquipment.map(equipment => (
                      <div
                        key={equipment.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-md p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 theme-transition"
                      >
                        <h4 className="font-bold">{equipment.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {equipment.type.charAt(0).toUpperCase() + equipment.type.slice(1)}
                        </p>

                        <div className="flex gap-2 mb-2">
                          {equipment.attackBonus > 0 && (
                            <span className="badge badge-error">+{equipment.attackBonus} ATK</span>
                          )}
                          {equipment.defenseBonus > 0 && (
                            <span className="badge badge-info">+{equipment.defenseBonus} DEF</span>
                          )}
                          {equipment.healthBonus > 0 && (
                            <span className="badge badge-success">+{equipment.healthBonus} HP</span>
                          )}
                        </div>

                        <p className="text-sm mb-4">{equipment.description}</p>

                        <button
                          onClick={() => equipItem(equipment.id)}
                          className="btn btn-primary w-full"
                          aria-label={`Equip ${equipment.name}`}
                        >
                          Equip
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No equipment available. Win tournaments to earn more!</p>
                )}
              </div>
            </div>
          )}

          {/* Battle Screen */}
          {gameState.currentScreen === 'battle' && gameState.battleState && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {gameState.tournaments.find(t => t.id === gameState.battleState?.tournamentId)?.name} -
                    Round {gameState.battleState.tournamentRound}
                  </h2>
                  {gameState.battleState.isOver && (
                    <button
                      onClick={endBattle}
                      className="btn btn-primary"
                      aria-label="End battle"
                    >
                      Continue
                    </button>
                  )}
                </div>

                {/* Battle Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Player Character */}
                  <div className={`p-4 rounded-lg ${gameState.battleState.turn === 'player' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl">{gameState.battleState.playerCharacter.avatar}</div>
                      <div>
                        <h3 className="text-lg font-bold">{gameState.battleState.playerCharacter.name}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Level {gameState.battleState.playerCharacter.level} {gameState.battleState.playerCharacter.class}</div>
                      </div>
                      {gameState.battleState.turn === 'player' && !gameState.battleState.isOver && (
                        <div className="ml-auto animate-pulse">
                          <div className="p-1 px-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-xs font-medium">
                            YOUR TURN
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {/* Health Bar */}
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="flex items-center gap-1">
                            <Heart size={14} className="text-red-500" /> Health
                          </span>
                          <span>{gameState.battleState.playerCharacter.health}/{gameState.battleState.playerCharacter.maxHealth}</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${(gameState.battleState.playerCharacter.health / gameState.battleState.playerCharacter.maxHealth) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Energy Bar */}
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span>Energy</span>
                          <span>{gameState.battleState.playerEnergy}/100</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${gameState.battleState.playerEnergy}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div className="flex items-center gap-1">
                          <Sword size={14} className="text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Attack:</span> {gameState.battleState.playerCharacter.attack}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield size={14} className="text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Defense:</span> {gameState.battleState.playerCharacter.defense}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opponent Character */}
                  <div className={`p-4 rounded-lg ${gameState.battleState.turn === 'opponent' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl">{gameState.battleState.opponent.avatar}</div>
                      <div>
                        <h3 className="text-lg font-bold">{gameState.battleState.opponent.name}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Level {gameState.battleState.opponent.level} {gameState.battleState.opponent.class}</div>
                      </div>
                      {gameState.battleState.turn === 'opponent' && !gameState.battleState.isOver && (
                        <div className="ml-auto animate-pulse">
                          <div className="p-1 px-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md text-xs font-medium">
                            ENEMY TURN
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {/* Health Bar */}
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="flex items-center gap-1">
                            <Heart size={14} className="text-red-500" /> Health
                          </span>
                          <span>{gameState.battleState.opponent.health}/{gameState.battleState.opponent.maxHealth}</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${(gameState.battleState.opponent.health / gameState.battleState.opponent.maxHealth) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Energy Bar */}
                      <div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span>Energy</span>
                          <span>{gameState.battleState.opponentEnergy}/100</span>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${gameState.battleState.opponentEnergy}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div className="flex items-center gap-1">
                          <Sword size={14} className="text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Attack:</span> {gameState.battleState.opponent.attack}
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield size={14} className="text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">Defense:</span> {gameState.battleState.opponent.defense}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Battle Result - shown when battle is over */}
                {gameState.battleState.isOver && (
                  <div className={`mb-6 p-4 rounded-lg text-center ${gameState.battleState.winner === 'player' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700'}`}>
                    <h3 className="text-xl font-bold mb-2">
                      {gameState.battleState.winner === 'player' ? 'Victory!' : 'Defeat!'}
                    </h3>
                    <p>
                      {gameState.battleState.winner === 'player'
                        ? `You have defeated ${gameState.battleState.opponent.name}!`
                        : `You were defeated by ${gameState.battleState.opponent.name}!`}
                    </p>
                    {gameState.battleState.winner === 'player' && (
                      <div className="flex justify-center mt-2">
                        <Trophy size={32} className="text-yellow-500" />
                      </div>
                    )}
                  </div>
                )}

                {/* Battle Log */}
                <div className="mb-4">
                  <h3 className="font-bold mb-2">Battle Log</h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md p-3 max-h-40 overflow-y-auto">
                    <ul className="space-y-1 text-sm">
                      {gameState.battleState.log.map((entry, index) => (
                        <li key={index}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Player Actions */}
                {!gameState.battleState.isOver && gameState.battleState.turn === 'player' && (
                  <div>
                    <h3 className="font-bold mb-2">Your Abilities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {gameState.battleState.playerCharacter.abilities.map(ability => (
                        <button
                          key={ability.id}
                          onClick={() => handleUseAbility(ability.id)} // Updated function call
                          disabled={ability.currentCooldown > 0 || ability.energyCost > gameState.battleState.playerEnergy}
                          className={`p-3 rounded-md text-left transition-colors ${ability.currentCooldown > 0 || ability.energyCost > gameState.battleState.playerEnergy ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : `
                            ${ability.type === 'attack' ? 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800' : ''}
                            ${ability.type === 'defense' ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800' : ''}
                            ${ability.type === 'heal' ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800' : ''}
                            ${ability.type === 'buff' ? 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800' : ''}
                            ${ability.type === 'debuff' ? 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800' : ''}
                          `}`}
                          aria-label={`Use ${ability.name}`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold">{ability.name}</h4>
                            <span className="text-sm">{ability.energyCost} Energy</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-sm">
                            <span className={`
                              badge badge-sm
                              ${ability.type === 'attack' ? 'badge-error' : ''}
                              ${ability.type === 'defense' ? 'badge-info' : ''}
                              ${ability.type === 'heal' ? 'badge-success' : ''}
                              ${ability.type === 'buff' ? 'badge-warning' : ''}
                              ${ability.type === 'debuff' ? 'badge-warning' : ''}
                            `}>
                              {ability.type.charAt(0).toUpperCase() + ability.type.slice(1)}
                            </span>
                            <span>Power: {ability.power}</span>
                          </div>

                          {ability.currentCooldown > 0 && (
                            <div className="bg-gray-200 dark:bg-gray-700 mt-2 rounded-sm h-1.5">
                              <div
                                className="bg-gray-400 dark:bg-gray-500 h-full rounded-sm"
                                style={{ width: `${((ability.cooldown - ability.currentCooldown) / ability.cooldown) * 100}%` }}
                              ></div>
                              <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                                Cooldown: {ability.currentCooldown}
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-200 dark:bg-slate-800 p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
