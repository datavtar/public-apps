import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Play, Pause, RotateCw, Trophy, Clock, Target, Shuffle, Lightbulb, Settings, Download } from 'lucide-react';
import styles from './styles/styles.module.css';

type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  isRed: boolean;
  value: number;
  faceUp: boolean;
}

interface GameState {
  foundations: Card[][];
  tableau: Card[][];
  stock: Card[];
  waste: Card[];
  score: number;
  moves: number;
  time: number;
  isGameWon: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  bestScore: number;
  bestTime: number;
  totalTime: number;
}

interface DragState {
  isDragging: boolean;
  draggedCards: Card[];
  sourceType: 'tableau' | 'waste' | 'foundation' | null;
  sourceIndex: number;
  startIndex: number;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES: Record<Rank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        isRed: suit === 'hearts' || suit === 'diamonds',
        value: RANK_VALUES[rank],
        faceUp: false
      });
    });
  });
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const initializeGame = (difficulty: 'easy' | 'medium' | 'hard'): GameState => {
  const deck = shuffleDeck(createDeck());
  const tableau: Card[][] = [[], [], [], [], [], [], []];
  let deckIndex = 0;

  // Deal cards to tableau
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[deckIndex++];
      if (card) {
        card.faceUp = row === col;
        tableau[col].push(card);
      }
    }
  }

  // Remaining cards go to stock
  const stock = deck.slice(deckIndex);

  return {
    foundations: [[], [], [], []],
    tableau,
    stock,
    waste: [],
    score: 0,
    moves: 0,
    time: 0,
    isGameWon: false,
    difficulty
  };
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('solitaire-game');
    return saved ? JSON.parse(saved) : initializeGame('medium');
  });
  
  const [gameStats, setGameStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('solitaire-stats');
    return saved ? JSON.parse(saved) : {
      gamesPlayed: 0,
      gamesWon: 0,
      bestScore: 0,
      bestTime: 0,
      totalTime: 0
    };
  });

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCards: [],
    sourceType: null,
    sourceIndex: 0,
    startIndex: 0
  });

  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [undoStack, setUndoStack] = useState<GameState[]>([]);
  const [hint, setHint] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('solitaire-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem('solitaire-game', JSON.stringify(gameState));
  }, [gameState]);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('solitaire-stats', JSON.stringify(gameStats));
  }, [gameStats]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('solitaire-dark-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Timer effect
  useEffect(() => {
    if (!isPaused && !gameState.isGameWon) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({ ...prev, time: prev.time + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, gameState.isGameWon]);

  // Check for game win
  useEffect(() => {
    const isWon = gameState.foundations.every(foundation => foundation.length === 13);
    if (isWon && !gameState.isGameWon) {
      setGameState(prev => ({ ...prev, isGameWon: true }));
      setGameStats(prev => ({
        ...prev,
        gamesWon: prev.gamesWon + 1,
        bestScore: Math.max(prev.bestScore, gameState.score),
        bestTime: prev.bestTime === 0 ? gameState.time : Math.min(prev.bestTime, gameState.time),
        totalTime: prev.totalTime + gameState.time
      }));
    }
  }, [gameState.foundations, gameState.isGameWon, gameState.score, gameState.time]);

  const saveGameState = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-9), gameState]);
  }, [gameState]);

  const canMoveToFoundation = (card: Card, foundation: Card[]): boolean => {
    if (foundation.length === 0) {
      return card.rank === 'A';
    }
    const topCard = foundation[foundation.length - 1];
    return topCard && card.suit === topCard.suit && card.value === topCard.value + 1;
  };

  const canMoveToTableau = (cards: Card[], tableau: Card[]): boolean => {
    if (cards.length === 0) return false;
    const movingCard = cards[0];
    
    if (tableau.length === 0) {
      return movingCard.rank === 'K';
    }
    
    const topCard = tableau[tableau.length - 1];
    return topCard && 
           topCard.faceUp && 
           movingCard.isRed !== topCard.isRed && 
           movingCard.value === topCard.value - 1;
  };

  const getValidTableauCards = (tableau: Card[], startIndex: number): Card[] => {
    const cards = tableau.slice(startIndex);
    if (cards.length === 0) return [];
    
    // Check if all cards are face up and form a valid descending sequence
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i]?.faceUp) return [];
      if (i > 0) {
        const current = cards[i];
        const previous = cards[i - 1];
        if (!current || !previous || 
            current.isRed === previous.isRed || 
            current.value !== previous.value - 1) {
          return [];
        }
      }
    }
    return cards;
  };

  const drawFromStock = () => {
    if (gameState.stock.length === 0 && gameState.waste.length > 0) {
      // Reset stock from waste
      saveGameState();
      setGameState(prev => ({
        ...prev,
        stock: [...prev.waste].reverse().map(card => ({ ...card, faceUp: false })),
        waste: [],
        moves: prev.moves + 1
      }));
    } else if (gameState.stock.length > 0) {
      saveGameState();
      const cardsToMove = gameState.difficulty === 'easy' ? 1 : 3;
      const newStock = [...gameState.stock];
      const newWaste = [...gameState.waste];
      
      for (let i = 0; i < cardsToMove && newStock.length > 0; i++) {
        const card = newStock.pop();
        if (card) {
          card.faceUp = true;
          newWaste.push(card);
        }
      }
      
      setGameState(prev => ({
        ...prev,
        stock: newStock,
        waste: newWaste,
        moves: prev.moves + 1
      }));
    }
  };

  const autoMoveToFoundations = () => {
    let moved = false;
    let newState = { ...gameState };
    
    // Check waste pile
    if (newState.waste.length > 0) {
      const topCard = newState.waste[newState.waste.length - 1];
      if (topCard) {
        for (let i = 0; i < 4; i++) {
          if (canMoveToFoundation(topCard, newState.foundations[i])) {
            newState.waste = newState.waste.slice(0, -1);
            newState.foundations[i] = [...newState.foundations[i], topCard];
            newState.score += 10;
            moved = true;
            break;
          }
        }
      }
    }
    
    // Check tableau piles
    for (let col = 0; col < 7; col++) {
      const tableau = newState.tableau[col];
      if (tableau && tableau.length > 0) {
        const topCard = tableau[tableau.length - 1];
        if (topCard?.faceUp) {
          for (let i = 0; i < 4; i++) {
            if (canMoveToFoundation(topCard, newState.foundations[i])) {
              newState.tableau[col] = tableau.slice(0, -1);
              newState.foundations[i] = [...newState.foundations[i], topCard];
              newState.score += 10;
              
              // Flip next card if exists
              const nextCard = newState.tableau[col][newState.tableau[col].length - 1];
              if (nextCard && !nextCard.faceUp) {
                nextCard.faceUp = true;
                newState.score += 5;
              }
              moved = true;
              break;
            }
          }
        }
      }
    }
    
    if (moved) {
      saveGameState();
      setGameState(newState);
      // Recursively check for more auto-moves
      setTimeout(() => autoMoveToFoundations(), 100);
    }
  };

  const handleCardClick = (card: Card, sourceType: 'tableau' | 'waste' | 'foundation', sourceIndex: number, cardIndex?: number) => {
    if (sourceType === 'waste' || (sourceType === 'tableau' && cardIndex === gameState.tableau[sourceIndex]?.length - 1)) {
      // Try to auto-move to foundation
      for (let i = 0; i < 4; i++) {
        if (canMoveToFoundation(card, gameState.foundations[i])) {
          saveGameState();
          let newState = { ...gameState };
          
          if (sourceType === 'waste') {
            newState.waste = newState.waste.slice(0, -1);
          } else {
            newState.tableau[sourceIndex] = newState.tableau[sourceIndex].slice(0, -1);
            // Flip next card if exists
            const nextCard = newState.tableau[sourceIndex][newState.tableau[sourceIndex].length - 1];
            if (nextCard && !nextCard.faceUp) {
              nextCard.faceUp = true;
              newState.score += 5;
            }
          }
          
          newState.foundations[i] = [...newState.foundations[i], card];
          newState.score += 10;
          newState.moves += 1;
          
          setGameState(newState);
          return;
        }
      }
    }
    
    // If card is face down in tableau, flip it
    if (sourceType === 'tableau' && !card.faceUp && cardIndex === gameState.tableau[sourceIndex]?.length - 1) {
      saveGameState();
      setGameState(prev => {
        const newState = { ...prev };
        const tableauCard = newState.tableau[sourceIndex][cardIndex || 0];
        if (tableauCard) {
          tableauCard.faceUp = true;
          newState.score += 5;
          newState.moves += 1;
        }
        return newState;
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, card: Card, sourceType: 'tableau' | 'waste' | 'foundation', sourceIndex: number, cardIndex?: number) => {
    e.dataTransfer.effectAllowed = 'move';
    
    let draggedCards: Card[] = [];
    
    if (sourceType === 'tableau' && cardIndex !== undefined) {
      draggedCards = getValidTableauCards(gameState.tableau[sourceIndex], cardIndex);
    } else if (sourceType === 'waste' && gameState.waste.length > 0) {
      draggedCards = [gameState.waste[gameState.waste.length - 1]].filter(Boolean);
    } else if (sourceType === 'foundation' && gameState.foundations[sourceIndex]?.length > 0) {
      draggedCards = [gameState.foundations[sourceIndex][gameState.foundations[sourceIndex].length - 1]].filter(Boolean);
    }
    
    if (draggedCards.length > 0) {
      setDragState({
        isDragging: true,
        draggedCards,
        sourceType,
        sourceIndex,
        startIndex: cardIndex || 0
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetType: 'tableau' | 'foundation', targetIndex: number) => {
    e.preventDefault();
    
    if (!dragState.isDragging || dragState.draggedCards.length === 0) return;
    
    const { draggedCards, sourceType, sourceIndex, startIndex } = dragState;
    
    // Check if move is valid
    let canMove = false;
    
    if (targetType === 'foundation' && draggedCards.length === 1) {
      canMove = canMoveToFoundation(draggedCards[0], gameState.foundations[targetIndex]);
    } else if (targetType === 'tableau') {
      canMove = canMoveToTableau(draggedCards, gameState.tableau[targetIndex]);
    }
    
    if (canMove && sourceType) {
      saveGameState();
      let newState = { ...gameState };
      
      // Remove cards from source
      if (sourceType === 'tableau') {
        newState.tableau[sourceIndex] = newState.tableau[sourceIndex].slice(0, startIndex);
        // Flip next card if exists
        const nextCard = newState.tableau[sourceIndex][newState.tableau[sourceIndex].length - 1];
        if (nextCard && !nextCard.faceUp) {
          nextCard.faceUp = true;
          newState.score += 5;
        }
      } else if (sourceType === 'waste') {
        newState.waste = newState.waste.slice(0, -1);
      } else if (sourceType === 'foundation') {
        newState.foundations[sourceIndex] = newState.foundations[sourceIndex].slice(0, -1);
      }
      
      // Add cards to target
      if (targetType === 'foundation') {
        newState.foundations[targetIndex] = [...newState.foundations[targetIndex], ...draggedCards];
        newState.score += 10;
      } else {
        newState.tableau[targetIndex] = [...newState.tableau[targetIndex], ...draggedCards];
        if (sourceType === 'foundation') {
          newState.score -= 15; // Penalty for moving from foundation
        }
      }
      
      newState.moves += 1;
      setGameState(newState);
    }
    
    setDragState({
      isDragging: false,
      draggedCards: [],
      sourceType: null,
      sourceIndex: 0,
      startIndex: 0
    });
  };

  const newGame = (difficulty?: 'easy' | 'medium' | 'hard') => {
    const newDifficulty = difficulty || gameState.difficulty;
    setGameStats(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    setGameState(initializeGame(newDifficulty));
    setUndoStack([]);
    setHint('');
    setIsPaused(false);
  };

  const undoMove = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setGameState(previousState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const getHint = () => {
    // Simple hint system - find first valid move
    const hints: string[] = [];
    
    // Check for foundation moves
    if (gameState.waste.length > 0) {
      const topCard = gameState.waste[gameState.waste.length - 1];
      if (topCard) {
        for (let i = 0; i < 4; i++) {
          if (canMoveToFoundation(topCard, gameState.foundations[i])) {
            hints.push(`Move ${topCard.rank} of ${topCard.suit} from waste to foundation`);
          }
        }
      }
    }
    
    // Check tableau to foundation moves
    for (let col = 0; col < 7; col++) {
      const tableau = gameState.tableau[col];
      if (tableau && tableau.length > 0) {
        const topCard = tableau[tableau.length - 1];
        if (topCard?.faceUp) {
          for (let i = 0; i < 4; i++) {
            if (canMoveToFoundation(topCard, gameState.foundations[i])) {
              hints.push(`Move ${topCard.rank} of ${topCard.suit} from column ${col + 1} to foundation`);
            }
          }
        }
      }
    }
    
    // Check tableau to tableau moves
    for (let sourceCol = 0; sourceCol < 7; sourceCol++) {
      const sourceTableau = gameState.tableau[sourceCol];
      if (sourceTableau && sourceTableau.length > 0) {
        for (let cardIndex = 0; cardIndex < sourceTableau.length; cardIndex++) {
          const cards = getValidTableauCards(sourceTableau, cardIndex);
          if (cards.length > 0) {
            for (let targetCol = 0; targetCol < 7; targetCol++) {
              if (sourceCol !== targetCol && canMoveToTableau(cards, gameState.tableau[targetCol])) {
                hints.push(`Move ${cards[0].rank} of ${cards[0].suit} from column ${sourceCol + 1} to column ${targetCol + 1}`);
              }
            }
          }
        }
      }
    }
    
    if (hints.length === 0) {
      if (gameState.stock.length > 0 || gameState.waste.length > 0) {
        hints.push('Draw cards from stock pile');
      } else {
        hints.push('No moves available');
      }
    }
    
    setHint(hints[0] || 'No hints available');
    setTimeout(() => setHint(''), 3000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadStats = () => {
    const statsData = {
      'Games Played': gameStats.gamesPlayed,
      'Games Won': gameStats.gamesWon,
      'Win Rate': gameStats.gamesPlayed > 0 ? `${((gameStats.gamesWon / gameStats.gamesPlayed) * 100).toFixed(1)}%` : '0%',
      'Best Score': gameStats.bestScore,
      'Best Time': gameStats.bestTime > 0 ? formatTime(gameStats.bestTime) : 'N/A',
      'Total Time Played': formatTime(gameStats.totalTime)
    };
    
    const csv = Object.entries(statsData).map(([key, value]) => `"${key}","${value}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'solitaire-stats.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCard = (card: Card | null, isPlaceholder = false, isDragOver = false) => {
    if (!card && !isPlaceholder) return null;
    
    const cardClasses = `
      ${styles.card} 
      ${card?.faceUp ? styles.faceUp : styles.faceDown}
      ${card?.isRed ? styles.red : styles.black}
      ${isDragOver ? styles.dragOver : ''}
      ${isPlaceholder ? styles.placeholder : ''}
    `;
    
    if (isPlaceholder) {
      return <div className={cardClasses} />;
    }
    
    return (
      <div 
        className={cardClasses}
        draggable={card?.faceUp}
      >
        {card?.faceUp ? (
          <>
            <span className={styles.rank}>{card.rank}</span>
            <span className={styles.suit}>{getSuitSymbol(card.suit)}</span>
          </>
        ) : (
          <div className={styles.cardBack} />
        )}
      </div>
    );
  };

  const getSuitSymbol = (suit: Suit): string => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSettings(false);
      setShowStats(false);
    } else if (e.key === 'u' && e.ctrlKey) {
      e.preventDefault();
      undoMove();
    } else if (e.key === 'n' && e.ctrlKey) {
      e.preventDefault();
      newGame();
    } else if (e.key === 'h' && e.ctrlKey) {
      e.preventDefault();
      getHint();
    }
  }, [undoMove]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className={`${styles.gameContainer} ${isDarkMode ? styles.dark : ''}`} ref={gameContainerRef}>
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-slate-800 shadow-md">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">Solitaire</h1>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatTime(gameState.time)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              <span>Score: {gameState.score}</span>
            </div>
            <div className="flex items-center gap-1">
              <RotateCw className="w-4 h-4" />
              <span>Moves: {gameState.moves}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
              aria-label={isPaused ? 'Resume game' : 'Pause game'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            
            <button
              onClick={undoMove}
              disabled={undoStack.length === 0}
              className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600 disabled:opacity-50"
              aria-label="Undo last move"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={getHint}
              className="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600"
              aria-label="Get hint"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowStats(true)}
              className="btn btn-sm bg-purple-500 text-white hover:bg-purple-600"
              aria-label="View statistics"
            >
              <Trophy className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="btn btn-sm bg-gray-600 text-white hover:bg-gray-700"
              aria-label="Open settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hint Display */}
        {hint && (
          <div className="mx-4 mt-2 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span>{hint}</span>
            </div>
          </div>
        )}

        {/* Game Won Message */}
        {gameState.isGameWon && (
          <div className="mx-4 mt-2 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <div>
                <div className="font-bold">Congratulations! You won!</div>
                <div className="text-sm">Score: {gameState.score} | Time: {formatTime(gameState.time)} | Moves: {gameState.moves}</div>
              </div>
            </div>
          </div>
        )}

        {/* Game Board */}
        <main className="flex-1 p-4">
          <div className={styles.gameBoard}>
            {/* Top Row - Stock, Waste, and Foundations */}
            <div className={styles.topRow}>
              {/* Stock Pile */}
              <div 
                className={styles.stockPile}
                onClick={drawFromStock}
                role="button"
                aria-label="Draw cards from stock"
              >
                {gameState.stock.length > 0 ? (
                  <div className={styles.stockStack}>
                    {renderCard({ id: 'stock', suit: 'spades', rank: 'A', isRed: false, value: 1, faceUp: false })}
                    <span className={styles.stockCount}>{gameState.stock.length}</span>
                  </div>
                ) : (
                  <div className={`${styles.emptyPile} ${styles.stockEmpty}`}>
                    <RotateCcw className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Waste Pile */}
              <div className={styles.wastePile}>
                {gameState.waste.length > 0 ? (
                  <div 
                    className={styles.wasteStack}
                    draggable
                    onDragStart={(e) => {
                      const topCard = gameState.waste[gameState.waste.length - 1];
                      if (topCard) {
                        handleDragStart(e, topCard, 'waste', 0);
                      }
                    }}
                    onClick={() => {
                      const topCard = gameState.waste[gameState.waste.length - 1];
                      if (topCard) {
                        handleCardClick(topCard, 'waste', 0);
                      }
                    }}
                  >
                    {gameState.waste.slice(-3).map((card, index) => (
                      <div key={card.id} className={styles.wasteCard} style={{ zIndex: index }}>
                        {renderCard(card)}
                      </div>
                    ))}
                  </div>
                ) : (
                  renderCard(null, true)
                )}
              </div>

              {/* Foundation Piles */}
              <div className={styles.foundations}>
                {gameState.foundations.map((foundation, index) => (
                  <div
                    key={index}
                    className={`${styles.foundationPile} ${styles.dropZone}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'foundation', index)}
                    role="button"
                    aria-label={`Foundation pile ${index + 1}`}
                  >
                    {foundation.length > 0 ? (
                      <div
                        draggable
                        onDragStart={(e) => {
                          const topCard = foundation[foundation.length - 1];
                          if (topCard) {
                            handleDragStart(e, topCard, 'foundation', index);
                          }
                        }}
                      >
                        {renderCard(foundation[foundation.length - 1])}
                      </div>
                    ) : (
                      <div className={`${styles.emptyPile} ${styles.foundationEmpty}`}>
                        <span className="text-gray-400 text-2xl">A</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tableau */}
            <div className={styles.tableau}>
              {gameState.tableau.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className={`${styles.tableauColumn} ${styles.dropZone}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'tableau', colIndex)}
                >
                  {column.length > 0 ? (
                    column.map((card, cardIndex) => (
                      <div
                        key={card.id}
                        className={`${styles.tableauCard} ${cardIndex === column.length - 1 ? styles.topCard : ''}`}
                        style={{ top: `${cardIndex * 20}px` }}
                        draggable={card.faceUp}
                        onDragStart={(e) => card.faceUp && handleDragStart(e, card, 'tableau', colIndex, cardIndex)}
                        onClick={() => handleCardClick(card, 'tableau', colIndex, cardIndex)}
                      >
                        {renderCard(card)}
                      </div>
                    ))
                  ) : (
                    <div className={`${styles.emptyPile} ${styles.tableauEmpty}`}>
                      <span className="text-gray-400 text-2xl">K</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Auto-move button */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={autoMoveToFoundations}
            className="btn bg-green-500 text-white hover:bg-green-600 rounded-full p-3 shadow-lg"
            aria-label="Auto-move cards to foundations"
          >
            <Target className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium">Settings</h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Close settings"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Difficulty</label>
                  <select 
                    value={gameState.difficulty}
                    onChange={(e) => newGame(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="input"
                  >
                    <option value="easy">Easy (Draw 1)</option>
                    <option value="medium">Medium (Draw 3)</option>
                    <option value="hard">Hard (Draw 3, Limited Undo)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="form-label">Dark Mode</span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`theme-toggle ${isDarkMode ? 'bg-green-600' : 'bg-gray-300'}`}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    <span className="theme-toggle-thumb" />
                  </button>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={() => newGame()}
                  className="btn bg-red-500 text-white hover:bg-red-600"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  New Game
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="btn bg-gray-500 text-white hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Modal */}
        {showStats && (
          <div className="modal-backdrop" onClick={() => setShowStats(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Statistics
                </h3>
                <button 
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Close statistics"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <div className="stat-title">Games Played</div>
                  <div className="stat-value">{gameStats.gamesPlayed}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Games Won</div>
                  <div className="stat-value">{gameStats.gamesWon}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Win Rate</div>
                  <div className="stat-value">
                    {gameStats.gamesPlayed > 0 ? `${((gameStats.gamesWon / gameStats.gamesPlayed) * 100).toFixed(1)}%` : '0%'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Best Score</div>
                  <div className="stat-value">{gameStats.bestScore}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Best Time</div>
                  <div className="stat-value">{gameStats.bestTime > 0 ? formatTime(gameStats.bestTime) : 'N/A'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Total Time</div>
                  <div className="stat-value">{formatTime(gameStats.totalTime)}</div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={downloadStats}
                  className="btn bg-blue-500 text-white hover:bg-blue-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </button>
                <button 
                  onClick={() => setShowStats(false)}
                  className="btn bg-gray-500 text-white hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 border-t dark:border-slate-700">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;