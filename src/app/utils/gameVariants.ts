// Funktionales Programmieren: Spielvarianten-Implementierung mit reinen Funktionen und Funktionskomposition

import { GameVariant, GameState, SpecialAction, RewardCalculator } from '../types/gameTypes';

// Funktionales Programmieren: Reine Funktion für House-Edge-Berechnung
const applyHouseEdge = (baseReward: number, houseEdgePercent: number = 2.5): number => {
  return Math.floor(baseReward * (1 - houseEdgePercent / 100));
};

// Funktionales Programmieren: Reine Funktion zum Hinzufügen von Zufälligkeit zu Belohnungen (±10%)
const addRewardVariance = (baseReward: number): number => {
  const variance = 0.1;
  const randomFactor = 1 + (Math.random() - 0.5) * 2 * variance;
  return Math.floor(baseReward * randomFactor);
};

// Funktionales Programmieren: Höhere Funktion zur Erstellung von Belohnungskalkulatoren
const createRewardCalculator = (
  basePayout: number,
  houseEdge: number,
  bonusMultiplier: (streak: number, multiplier: number) => number = () => 1
): RewardCalculator => {
  return (probability: number, streak: number, multiplier: number): number => {
    const riskReward = Math.floor(basePayout * (100 / Math.max(probability, 1)));
    const bonusReward = riskReward * bonusMultiplier(streak, multiplier);
    const houseAdjustedReward = applyHouseEdge(bonusReward, houseEdge);
    const finalReward = addRewardVariance(houseAdjustedReward);
    
    return Math.max(1, finalReward);
  };
};

// Funktionales Programmieren: Reine Funktion für Streak-Bonus-Berechnung
const calculateStreakBonus = (streak: number): number => {
  if (streak < 3) return 1;
  if (streak < 5) return 1.2;
  if (streak < 8) return 1.5;
  if (streak < 12) return 2.0;
  return 2.5;
};

// Funktionales Programmieren: Reine Funktion für Double-or-Nothing-Berechnung
const doubleOrNothingMultiplier = (streak: number, multiplier: number): number => {
  return multiplier > 1 ? multiplier : 1;
};

// Funktionales Programmieren: Reine Funktion zur unveränderlichen Aktualisierung des Spielzustands
const updateGameState = (currentState: GameState, updates: Partial<GameState>): GameState => {
  return { ...currentState, ...updates };
};

// Funktionales Programmieren: Klassische Variante mit komponierter Belohnungsberechnung
const classicVariant: GameVariant = {
  id: 'classic',
  name: 'Classic Casino',
  description: 'Traditional Higher/Lower with balanced rewards and fair house odds.',
  icon: '🎯',
  entryCost: 100,
  difficulty: 'Easy',
  features: ['Balanced Payouts', 'Fair House Edge', 'Streak Bonuses'],
  
  // Funktionales Programmieren: Verwendung komponierter Belohnungsberechnung mit realistischem 2.5% House Edge
  calculateReward: createRewardCalculator(8, 2.5, calculateStreakBonus),
  
  // Funktionales Programmieren: Reine Funktion zur Verarbeitung von Vermutungen
  processGuess: (gameState: GameState, isCorrect: boolean, probability: number): Partial<GameState> => {
    if (!isCorrect) {
      return { 
        gameOver: true,
        multiplier: 1
      };
    }
    
    const newStreak = gameState.streak + 1;
    const points = classicVariant.calculateReward(probability, newStreak, gameState.multiplier);
    
    let newMultiplier = gameState.multiplier;
    if (newStreak >= 3 && newStreak % 3 === 0) {
      newMultiplier = Math.min(gameState.multiplier + 0.2, 2.5);
    }
    
    return {
      score: gameState.score + points,
      streak: newStreak,
      multiplier: newMultiplier
    };
  }
};

// Funktionales Programmieren: Double-or-Nothing-Variante mit höherem Risiko und Belohnung
const doubleOrNothingVariant: GameVariant = {
  id: 'double-or-nothing',
  name: 'Double or Nothing',
  description: 'Risk everything for double rewards! Cash out or lose it all.',
  icon: '💎',
  entryCost: 200,
  difficulty: 'Hard',
  features: ['Double Rewards', 'All-or-Nothing', 'High Volatility'],
  maxMultiplier: 8,
  
  // Funktionales Programmieren: Verwendung komponierter Belohnungsberechnung mit höherem Basis-Payout
  calculateReward: createRewardCalculator(15, 3.5, doubleOrNothingMultiplier),
  
  // Funktionales Programmieren: Reine Funktion zur Verarbeitung von Vermutungen mit Double-or-Nothing-Logik
  processGuess: (gameState: GameState, isCorrect: boolean, probability: number): Partial<GameState> => {
    if (!isCorrect) {
      return { 
        gameOver: true,
        score: gameState.doubleOrNothingActive ? 0 : gameState.score,
        doubleOrNothingActive: false,
        specialMode: undefined,
        multiplier: 1
      };
    }
    
    const newStreak = gameState.streak + 1;
    const basePoints = doubleOrNothingVariant.calculateReward(probability, newStreak, gameState.multiplier);
    const finalPoints = gameState.doubleOrNothingActive ? basePoints * 2 : basePoints;
    
    let newMultiplier = gameState.multiplier;
    if (newStreak >= 2 && newStreak % 2 === 0) {
      newMultiplier = Math.min(gameState.multiplier + 0.3, 8.0);
    }
    
    return {
      score: gameState.score + finalPoints,
      streak: newStreak,
              doubleOrNothingActive: false,
        specialMode: undefined,
      multiplier: newMultiplier
    };
  },
  
  // Funktionales Programmieren: Reine Funktion für spezielle Aktionen
  getSpecialActions: (gameState: GameState): SpecialAction[] => {
    if (gameState.score === 0) return [];
    
    return [{
      id: 'double-or-nothing',
      name: '💎 Double or Nothing',
      description: `Risk ALL ${gameState.score} points! Win = DOUBLE points + DOUBLE multiplier, Lose = LOSE EVERYTHING!`,
      icon: '💎',
      cost: 0,
      available: !gameState.doubleOrNothingActive,
      execute: (state: GameState) => ({ 
        doubleOrNothingActive: true,
        specialMode: 'double-or-nothing',
        multiplier: Math.min(state.multiplier * 2, 8.0)
      })
    }];
  }
};

// Funktionales Programmieren: Streak-Master-Variante mit Multiplikator-fokussiertem Gameplay
const streakMasterVariant: GameVariant = {
  id: 'streak-master',
  name: 'Streak Master',
  description: 'Build massive win streaks for exponential rewards!',
  icon: '⚡',
  entryCost: 150,
  difficulty: 'Medium',
  features: ['Exponential Multipliers', 'Streak Focus', 'Multiplier Boosts'],
  maxMultiplier: 10,
  
  // Funktionales Programmieren: Spezialisierte Multiplikator-Berechnung für Streak Master
  calculateReward: (probability: number, streak: number, multiplier: number): number => {
    const basePayout = 12;
    const houseEdge = 3;
    
    const exponentialBonus = Math.pow(1.3, Math.min(streak, 15));
    const riskReward = Math.floor(basePayout * (100 / Math.max(probability, 1)));
    const bonusReward = riskReward * exponentialBonus * multiplier;
    const houseAdjustedReward = applyHouseEdge(bonusReward, houseEdge);
    const finalReward = addRewardVariance(houseAdjustedReward);
    
    return Math.max(1, finalReward);
  },
  
  // Funktionales Programmieren: Reine Funktion mit Streak-fokussierter Verarbeitung
  processGuess: (gameState: GameState, isCorrect: boolean, probability: number): Partial<GameState> => {
    if (!isCorrect) {
      return { 
        gameOver: true,
        score: Math.floor(gameState.score * 0.25),
        multiplier: 1
      };
    }
    
    const newStreak = gameState.streak + 1;
    const points = streakMasterVariant.calculateReward(probability, newStreak, gameState.multiplier);
    
    let newMultiplier = Math.min(gameState.multiplier + 0.1, 10.0);
    let newSpecialMode = gameState.specialMode;
    
    // Funktionales Programmieren: Immutable Behandlung der Multiplikator-Boost-Dauer
    if (gameState.specialMode === 'multiplier-boost') {
      const boostRounds = gameState.timeLeft || 3;
      if (boostRounds <= 1) {
        newSpecialMode = undefined;
        newMultiplier = Math.max(1, newMultiplier - 0.5);
      }
    }
    
    return {
      score: gameState.score + points,
      streak: newStreak,
      multiplier: newMultiplier,
      specialMode: newSpecialMode,
      timeLeft: gameState.specialMode === 'multiplier-boost' ? (gameState.timeLeft || 3) - 1 : undefined
    };
  },
  
  // Funktionales Programmieren: Reine Funktion für Streak-fokussierte spezielle Aktionen
  getSpecialActions: (gameState: GameState): SpecialAction[] => {
    // Funktionales Programmieren: Verwendung von Array-Konstruktion für unveränderliche Listen
    const actions: SpecialAction[] = [];
    
    if (gameState.streak >= 5 && gameState.multiplier < 8.0 && gameState.specialMode !== 'multiplier-boost') {
      actions.push({
        id: 'multiplier-boost',
        name: '🚀 Multiplier Boost',
        description: 'Add +0.5x multiplier for the next 3 correct guesses.',
        icon: '🚀',
        cost: 50,
        available: true,
        execute: (state: GameState) => ({ 
          score: state.score - 50,
          multiplier: Math.min(state.multiplier + 0.5, 10),
          specialMode: 'multiplier-boost',
          timeLeft: 3
        })
      });
    }
    
    return actions;
  }
};

// Funktionales Programmieren: Reine Funktion zur Rückgabe aller Spielvarianten
export const getGameVariants = (): GameVariant[] => [
  classicVariant,
  doubleOrNothingVariant,
  streakMasterVariant
];

// Funktionales Programmieren: Reine Funktion zur Suche von Varianten nach ID
export const getVariantById = (id: string): GameVariant | undefined => {
  return getGameVariants().find(variant => variant.id === id);
};

// Funktionales Programmieren: Reine Funktion zur Berechnung der erwarteten Rendite
export const calculateExpectedReturn = (variant: GameVariant, probability: number): number => {
  const reward = variant.calculateReward(probability, 1, 1);
  return reward * (probability / 100) - variant.entryCost;
};

// Funktionales Programmieren: Reine Funktion für schwierigkeitsbasiertes Styling
export const getDifficultyColor = (difficulty: string): string => {
  // Funktionales Programmieren: Verwendung von Objektzuordnung für unveränderliche Mappings
  const colors = {
    'Easy': 'var(--casino-green)',
    'Medium': 'var(--casino-gold)', 
    'Hard': 'var(--casino-red)',
    'Extreme': 'var(--neon-pink)'
  };
  return colors[difficulty as keyof typeof colors] || 'var(--casino-text)';
}; 