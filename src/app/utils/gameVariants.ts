// Functional Programming: Game variants implementation using pure functions and function composition

import { GameVariant, GameState, SpecialAction, RewardCalculator } from '../types/gameTypes';

// Functional Programming: Pure function for house edge calculation
// Realistic casino house edge: 2-4% (vs previous 8-12%)
const applyHouseEdge = (baseReward: number, houseEdgePercent: number = 2.5): number => {
  return Math.floor(baseReward * (1 - houseEdgePercent / 100));
};

// Functional Programming: Pure function for adding randomness to rewards (±10%)
const addRewardVariance = (baseReward: number): number => {
  const variance = 0.1; // 10% variance
  const randomFactor = 1 + (Math.random() - 0.5) * 2 * variance;
  return Math.floor(baseReward * randomFactor);
};

// Functional Programming: Higher-order function for creating reward calculators
const createRewardCalculator = (
  basePayout: number,
  houseEdge: number,
  bonusMultiplier: (streak: number, multiplier: number) => number = () => 1
): RewardCalculator => {
  return (probability: number, streak: number, multiplier: number): number => {
    // Base calculation: lower probability = higher reward
    const riskReward = Math.floor(basePayout * (100 / Math.max(probability, 1)));
    
    // Apply bonus multiplier
    const bonusReward = riskReward * bonusMultiplier(streak, multiplier);
    
    // Apply house edge
    const houseAdjustedReward = applyHouseEdge(bonusReward, houseEdge);
    
    // Add variance for realism
    const finalReward = addRewardVariance(houseAdjustedReward);
    
    return Math.max(1, finalReward); // Minimum 1 point
  };
};

// Functional Programming: Pure function for streak bonus calculation
const calculateStreakBonus = (streak: number): number => {
  if (streak < 3) return 1;
  if (streak < 5) return 1.2;
  if (streak < 8) return 1.5;
  if (streak < 12) return 2.0;
  return 2.5; // Max 2.5x multiplier
};

// Functional Programming: Pure function for double or nothing calculation
const doubleOrNothingMultiplier = (streak: number, multiplier: number): number => {
  return multiplier > 1 ? multiplier : 1;
};

// Functional Programming: Pure function to update game state immutably
const updateGameState = (currentState: GameState, updates: Partial<GameState>): GameState => {
  return { ...currentState, ...updates };
};

// CLASSIC VARIANT - Improved balanced gameplay
const classicVariant: GameVariant = {
  id: 'classic',
  name: 'Classic Casino',
  description: 'Traditional Higher/Lower with balanced rewards and fair house odds.',
  icon: '🎯',
  entryCost: 100,
  difficulty: 'Easy',
  features: ['Balanced Payouts', 'Fair House Edge', 'Streak Bonuses'],
  
  // Functional Programming: Using composed reward calculator with realistic 2.5% house edge
  calculateReward: createRewardCalculator(8, 2.5, calculateStreakBonus),
  
  // Functional Programming: Pure function for processing guesses
  processGuess: (gameState: GameState, isCorrect: boolean, probability: number): Partial<GameState> => {
    if (!isCorrect) {
      return { 
        gameOver: true,
        multiplier: 1 // Reset multiplier on game over
      };
    }
    
    const newStreak = gameState.streak + 1;
    const points = classicVariant.calculateReward(probability, newStreak, gameState.multiplier);
    
    // Classic variant has moderate multiplier growth
    let newMultiplier = gameState.multiplier;
    if (newStreak >= 3 && newStreak % 3 === 0) { // Every 3 streaks
      newMultiplier = Math.min(gameState.multiplier + 0.2, 2.5); // Max 2.5x
    }
    
    return {
      score: gameState.score + points,
      streak: newStreak,
      multiplier: newMultiplier
    };
  }
};

// DOUBLE OR NOTHING VARIANT - High risk, high reward
const doubleOrNothingVariant: GameVariant = {
  id: 'double-or-nothing',
  name: 'Double or Nothing',
  description: 'Risk everything for double rewards! Cash out or lose it all.',
  icon: '💎',
  entryCost: 200,
  difficulty: 'Hard',
  features: ['Double Rewards', 'All-or-Nothing', 'High Volatility'],
  maxMultiplier: 8,
  
  // Functional Programming: Using composed reward calculator with higher base payout, 3.5% house edge for high volatility
  calculateReward: createRewardCalculator(15, 3.5, doubleOrNothingMultiplier),
  
  // Functional Programming: Pure function for processing guesses with double-or-nothing logic
  processGuess: (gameState: GameState, isCorrect: boolean, probability: number): Partial<GameState> => {
    if (!isCorrect) {
      return { 
        gameOver: true,
        score: gameState.doubleOrNothingActive ? 0 : gameState.score, // Lose all if in double mode
        doubleOrNothingActive: false,
        specialMode: undefined, // Clear special mode
        multiplier: 1 // Reset multiplier on game over
      };
    }
    
    const newStreak = gameState.streak + 1;
    const basePoints = doubleOrNothingVariant.calculateReward(probability, newStreak, gameState.multiplier);
    const finalPoints = gameState.doubleOrNothingActive ? basePoints * 2 : basePoints;
    
    // Double or Nothing has aggressive multiplier growth but higher risk
    let newMultiplier = gameState.multiplier;
    if (newStreak >= 2 && newStreak % 2 === 0) { // Every 2 streaks
      newMultiplier = Math.min(gameState.multiplier + 0.3, 4.0); // Max 4x but faster growth
    }
    
    return {
      score: gameState.score + finalPoints,
      streak: newStreak,
      doubleOrNothingActive: false, // Reset after each guess
      specialMode: undefined, // Clear special mode indicator
      multiplier: newMultiplier
    };
  },
  
  // Functional Programming: Pure function for special actions
  getSpecialActions: (gameState: GameState): SpecialAction[] => {
    if (gameState.score === 0) return [];
    
    return [{
      id: 'double-or-nothing',
      name: '💎 Double or Nothing',
      description: `Risk ALL ${gameState.score} points! Win = DOUBLE points, Lose = LOSE EVERYTHING!`,
      icon: '💎',
      cost: 0,
      available: !gameState.doubleOrNothingActive, // Available only when not active
      execute: (state: GameState) => ({ 
        doubleOrNothingActive: true,
        specialMode: 'double-or-nothing' // Add visual indicator
      })
    }];
  }
};

// STREAK MASTER VARIANT - Multiplier-focused gameplay
const streakMasterVariant: GameVariant = {
  id: 'streak-master',
  name: 'Streak Master',
  description: 'Build massive win streaks for exponential rewards!',
  icon: '⚡',
  entryCost: 150,
  difficulty: 'Medium',
  features: ['Exponential Multipliers', 'Streak Focus', 'Bonus Actions'],
  maxMultiplier: 10,
  
  // Functional Programming: Specialized multiplier calculation for streak master
  calculateReward: (probability: number, streak: number, multiplier: number): number => {
    const basePayout = 12;
    const houseEdge = 3; // Realistic 3% house edge
    
    // Exponential streak bonus for Streak Master
    const exponentialBonus = Math.pow(1.3, Math.min(streak, 15)); // Cap at 15 streak
    const riskReward = Math.floor(basePayout * (100 / Math.max(probability, 1)));
    const bonusReward = riskReward * exponentialBonus * multiplier;
    const houseAdjustedReward = applyHouseEdge(bonusReward, houseEdge);
    const finalReward = addRewardVariance(houseAdjustedReward);
    
    return Math.max(1, finalReward);
  },
  
  // Functional Programming: Pure function with streak-focused processing
  processGuess: (gameState: GameState, isCorrect: boolean, probability: number): Partial<GameState> => {
    if (!isCorrect) {
      // Check if streak shield is active - it protects the streak!
      if (gameState.specialMode === 'streak-shield') {
        return { 
          specialMode: undefined, // Remove streak shield after use
          // Keep 75% of score and preserve streak when shield is used
          score: Math.floor(gameState.score * 0.75)
          // streak stays the same, game continues!
        };
      } else {
        return { 
          gameOver: true,
          // Streak Master keeps 25% of score on loss (softer penalty)
          score: Math.floor(gameState.score * 0.25),
          multiplier: 1 // Reset multiplier on game over
        };
      }
    }
    
    const newStreak = gameState.streak + 1;
    const points = streakMasterVariant.calculateReward(probability, newStreak, gameState.multiplier);
    
    // Handle multiplier boost duration
    let newMultiplier = gameState.multiplier;
    let newSpecialMode = gameState.specialMode;
    
    if (gameState.specialMode === 'multiplier-boost') {
      // Decrease boost duration (stored in timeLeft or create a counter)
      const boostRounds = gameState.timeLeft || 3;
      if (boostRounds <= 1) {
        newSpecialMode = undefined; // Boost expires
        newMultiplier = Math.max(1, gameState.multiplier - 0.5); // Remove boost
      }
    } else if (newStreak >= 5) {
      newMultiplier = Math.min(gameState.multiplier + 0.1, 3);
    }
    
    return {
      score: gameState.score + points,
      streak: newStreak,
      multiplier: newMultiplier,
      specialMode: newSpecialMode,
      timeLeft: gameState.specialMode === 'multiplier-boost' ? (gameState.timeLeft || 3) - 1 : undefined
    };
  },
  
  // Functional Programming: Pure function for streak-focused special actions
  getSpecialActions: (gameState: GameState): SpecialAction[] => {
    const actions: SpecialAction[] = [];
    
    // Streak Shield - Protect from losing streak (only if not already active)
    if (gameState.streak >= 3 && gameState.score >= 50 && gameState.specialMode !== 'streak-shield') {
      actions.push({
        id: 'streak-shield',
        name: '🛡️ Streak Shield',
        description: 'Survive one wrong guess without losing your streak! Keeps 75% of score.',
        icon: '🛡️',
        cost: 50,
        available: true,
        execute: (state: GameState) => ({ 
          score: state.score - 50,
          specialMode: 'streak-shield'
        })
      });
    }
    
    // Multiplier Boost (only if not already active)
    if (gameState.streak >= 5 && gameState.multiplier < 2.5 && gameState.specialMode !== 'multiplier-boost') {
      actions.push({
        id: 'multiplier-boost',
        name: '🚀 Multiplier Boost',
        description: 'Add +0.5x multiplier for the next 3 correct guesses.',
        icon: '🚀',
        cost: 100,
        available: true,
        execute: (state: GameState) => ({ 
          score: state.score - 100,
          multiplier: Math.min(state.multiplier + 0.5, 3),
          specialMode: 'multiplier-boost',
          timeLeft: 3
        })
      });
    }
    
    return actions;
  }
};

// Functional Programming: Pure function to get all game variants
export const getGameVariants = (): GameVariant[] => [
  classicVariant,
  doubleOrNothingVariant,
  streakMasterVariant
];

// Functional Programming: Pure function to get variant by ID
export const getVariantById = (id: string): GameVariant | undefined => {
  return getGameVariants().find(variant => variant.id === id);
};

// Functional Programming: Pure function to calculate expected return
export const calculateExpectedReturn = (variant: GameVariant, probability: number): number => {
  const reward = variant.calculateReward(probability, 1, 1);
  return reward * (probability / 100) - variant.entryCost;
};

// Functional Programming: Pure function for difficulty-based styling
export const getDifficultyColor = (difficulty: string): string => {
  const colors = {
    'Easy': 'var(--casino-green)',
    'Medium': 'var(--casino-gold)', 
    'Hard': 'var(--casino-red)',
    'Extreme': 'var(--neon-pink)'
  };
  return colors[difficulty as keyof typeof colors] || 'var(--casino-text)';
}; 