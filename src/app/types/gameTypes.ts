// Funktionales Programmieren: Reine Typdefinitionen für das Spielvarianten-System

export interface Card {
  code: string;
  image: string;
  images: {
    svg: string;
    png: string;
  };
  suit: string;
  value: string;
}

export interface GameState {
  gameStarted: boolean;
  deckId: string | null;
  currentCard: Card | null;
  score: number;
  gameOver: boolean;
  lastRoundCard: Card | null;
  lastRoundCorrect: boolean | null;
  gameWon: boolean;
  loading: boolean;
  streak: number;
  totalGames: number;
  bestScore: number;
  multiplier: number;
  specialMode?: string;
  timeLeft?: number;
  doubleOrNothingActive?: boolean;
}

export interface GameVariant {
  id: string;
  name: string;
  description: string;
  icon: string;
  entryCost: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Extreme';
  features: string[];
  calculateReward: (probability: number, streak: number, multiplier: number) => number;
  processGuess: (gameState: GameState, isCorrect: boolean, probability: number) => Partial<GameState>;
  getSpecialActions?: (gameState: GameState) => SpecialAction[];
  maxMultiplier?: number;
  hasTimeLimit?: boolean;
  timeLimit?: number;
}

export interface SpecialAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  available: boolean;
  execute: (gameState: GameState) => Partial<GameState>;
}

export interface GameStats {
  gamesPlayed: number;
  totalWinnings: number;
  bestStreak: number;
  averageMultiplier: number;
  favoriteVariant: string;
  timeSpent: number;
}

// Funktionales Programmieren: Reiner Typ für Wahrscheinlichkeitsberechnung
export type ProbabilityCalculator = (currentValue: number, isHigherGuess: boolean) => number;

// Funktionales Programmieren: Reiner Typ für Belohnungsberechnung
export type RewardCalculator = (probability: number, streak: number, multiplier: number) => number;

// Funktionales Programmieren: Reiner Typ für Spielzustand-Updates
export type GameStateUpdater = (currentState: GameState, updates: Partial<GameState>) => GameState;

// Funktionales Programmieren: Reiner Typ für Vermutungsvalidierung
export type GuessValidator = (prevValue: number, nextValue: number, isHigherGuess: boolean) => boolean; 