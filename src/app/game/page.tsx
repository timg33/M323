"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useBalance } from "../context/balanceContext";
import styles from "../styles/game.module.css";

const API_BASE = "https://deckofcardsapi.com/api/deck";

// Functional Programming: Pure function for card value mapping
const getCardValue = (value: string): number => {
  const cardValueMap: Record<string, number> = {
    "ACE": 1,
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
    "JACK": 11,
    "QUEEN": 12,
    "KING": 13,
  };
  return cardValueMap[value] || 0;
};

// Functional Programming: Pure function for probability calculation
const calculateWinProbability = (currentValue: number, isHigherGuess: boolean): number => {
  const totalCards = 13;
  const favorableOutcomes = isHigherGuess 
    ? totalCards - currentValue 
    : currentValue - 1;
  return Math.max(0, Math.round((favorableOutcomes / totalCards) * 100));
};

// Functional Programming: Higher-order function for score calculation
const createScoreCalculator = (basePayout: number) => 
  (probability: number): number => Math.round(basePayout * (100 / Math.max(probability, 1)));

// Functional Programming: Currying for guess validation
const validateGuess = (prevValue: number) => 
  (nextValue: number) => 
    (isHigherGuess: boolean): boolean => 
      isHigherGuess ? nextValue > prevValue : nextValue < prevValue;

// Functional Programming: Pure function for card name formatting
const formatCardName = (card: any): string => 
  `${card.value} of ${card.suit}`;

// Functional Programming: Pure function to create game state
const createInitialGameState = () => ({
  gameStarted: false,
  deckId: null as string | null,
  currentCard: null as any,
  score: 0,
  gameOver: false,
  lastRoundCard: null as any,
  lastRoundCorrect: null as boolean | null,
  gameWon: false,
  loading: false,
  streak: 0,
  totalGames: 0,
  bestScore: 0
});

type GameState = ReturnType<typeof createInitialGameState>;

function GamePage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const { balance, setBalance } = useBalance();

  // Functional Programming: Pure function to update game state
  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameState(prevState => ({ ...prevState, ...updates }));
  }, []);

  // Functional Programming: Higher-order function for API calls
  const createApiCall = (endpoint: string) => async (): Promise<any> => {
    const response = await fetch(endpoint);
    return response.json();
  };

  useEffect(() => {
    setHasMounted(true);
    // Load saved stats
    const savedStats = localStorage.getItem('higherLowerStats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      updateGameState({
        totalGames: stats.totalGames || 0,
        bestScore: stats.bestScore || 0
      });
    }
  }, [updateGameState]);

  // Functional Programming: Pure function to save game statistics
  const saveGameStats = useCallback((finalScore: number) => {
    const stats = {
      totalGames: gameState.totalGames + 1,
      bestScore: Math.max(gameState.bestScore, finalScore),
      lastPlayed: Date.now()
    };
    localStorage.setItem('higherLowerStats', JSON.stringify(stats));
    updateGameState(stats);
  }, [gameState.totalGames, gameState.bestScore, updateGameState]);

  const startNewDeck = useCallback(async () => {
    updateGameState({ loading: true });
    try {
      const deckData = await createApiCall(`${API_BASE}/new/shuffle/?deck_count=1`)();
      const cardData = await createApiCall(`${API_BASE}/${deckData.deck_id}/draw/?count=1`)();
      
      updateGameState({
        deckId: deckData.deck_id,
        currentCard: cardData.cards[0],
        score: 0,
        gameOver: false,
        lastRoundCard: null,
        lastRoundCorrect: null,
        gameWon: false,
        loading: false,
        streak: 0
      });
    } catch (error) {
      console.error('Failed to start new deck:', error);
      updateGameState({ loading: false });
    }
  }, [updateGameState]);

  const startGame = useCallback(async () => {
    if (balance < 100) return;
    setBalance(balance - 100);
    updateGameState({ gameStarted: true });
    await startNewDeck();
  }, [balance, setBalance, updateGameState, startNewDeck]);

  // Functional Programming: Function composition for guess processing
  const processGuess = useCallback(async (isHigherGuess: boolean) => {
    if (!gameState.deckId || !gameState.currentCard) return;

    try {
      const cardData = await createApiCall(`${API_BASE}/${gameState.deckId}/draw/?count=1`)();
      const nextCard = cardData.cards[0];
      
      const currentValue = getCardValue(gameState.currentCard.value);
      const nextValue = getCardValue(nextCard.value);
      const probability = calculateWinProbability(currentValue, isHigherGuess);
      const isCorrect = validateGuess(currentValue)(nextValue)(isHigherGuess);

      updateGameState({
        lastRoundCard: nextCard,
        lastRoundCorrect: isCorrect
      });

      if (isCorrect) {
        const scoreCalculator = createScoreCalculator(10);
        const pointsEarned = scoreCalculator(probability);
        const newScore = gameState.score + pointsEarned;
        const newStreak = gameState.streak + 1;
        
        updateGameState({
          score: newScore,
          currentCard: nextCard,
          streak: newStreak
        });
      } else {
        saveGameStats(gameState.score);
        updateGameState({ gameOver: true });
      }
    } catch (error) {
      console.error('Failed to process guess:', error);
    }
  }, [gameState, updateGameState, saveGameStats]);

  const cashOut = useCallback(() => {
    const finalBalance = balance + gameState.score;
    setBalance(finalBalance);
    saveGameStats(gameState.score);
    updateGameState({ gameWon: true });
    
    // Save to highscores
    const highscores = JSON.parse(localStorage.getItem('highscores') || '[]');
    highscores.push({
      score: gameState.score,
      date: new Date().toISOString(),
      id: Date.now()
    });
    highscores.sort((a: any, b: any) => b.score - a.score);
    localStorage.setItem('highscores', JSON.stringify(highscores.slice(0, 10)));
  }, [balance, setBalance, gameState.score, saveGameStats, updateGameState]);

  if (!hasMounted) return null;

  const currentValue = gameState.currentCard ? getCardValue(gameState.currentCard.value) : null;
  const probabilityHigher = currentValue !== null ? calculateWinProbability(currentValue, true) : 0;
  const probabilityLower = currentValue !== null ? calculateWinProbability(currentValue, false) : 0;

  // Start screen
  if (!gameState.gameStarted) {
    return (
      <div className={styles.container}>
        <h1 className={`${styles.title} neon-text`}>🎲 Higher Lower Casino 🎲</h1>
        
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Games Played</div>
            <div className={styles.statValue}>{gameState.totalGames}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Best Score</div>
            <div className={styles.statValue}>{gameState.bestScore}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Current Balance</div>
            <div className={styles.statValue}>{balance}</div>
          </div>
        </div>

        <div className={styles.controlsContainer}>
          <button 
            onClick={startGame} 
            className={`${styles.button} ${styles.restartButton}`}
            disabled={balance < 100}
          >
            {balance < 100 ? "Insufficient Funds" : "🎰 Start Game (-100)"}
          </button>
        </div>
      </div>
    );
  }

  // Loading screen
  if (gameState.loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Loading...</h1>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  // Game over screen
  if (gameState.gameOver) {
    return (
      <div className={styles.container}>
        <div className={styles.gameOverContainer}>
          <h2 className={styles.gameOverTitle}>Game Over!</h2>
          
          {gameState.lastRoundCard && (
            <div className={styles.cardContainer}>
              <h3>The next card was:</h3>
              <div className={styles.cardWrapper}>
                <img 
                  className={styles.cardImage} 
                  src={gameState.lastRoundCard.image} 
                  alt={formatCardName(gameState.lastRoundCard)} 
                />
              </div>
              <div className={styles.cardName}>{formatCardName(gameState.lastRoundCard)}</div>
            </div>
          )}
          
          <div className={styles.finalScore}>{gameState.score}</div>
          <p>Streak: {gameState.streak} cards</p>
          
          <div className={styles.controlsContainer}>
            <button 
              onClick={startGame} 
              className={`${styles.button} ${styles.restartButton}`}
              disabled={balance < 100}
            >
              {balance < 100 ? "Insufficient Funds" : "🔄 Play Again (-100)"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Victory screen
  if (gameState.gameWon) {
    return (
      <div className={styles.container}>
        <div className={styles.gameWonContainer}>
          <h2 className={styles.gameWonTitle}>🎉 Congratulations! 🎉</h2>
          <p>You successfully cashed out!</p>
          <div className={styles.finalScore}>{gameState.score}</div>
          <p>Streak: {gameState.streak} cards</p>
          
          <div className={styles.controlsContainer}>
            <button 
              onClick={startGame} 
              className={`${styles.button} ${styles.restartButton}`}
              disabled={balance < 100}
            >
              {balance < 100 ? "Insufficient Funds" : "🎰 Play Again (-100)"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className={styles.container}>
      <div className={styles.gameBoard}>
        <h1 className={styles.title}>Higher Lower Casino</h1>
        
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Current Score</div>
            <div className={styles.statValue}>{gameState.score}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Streak</div>
            <div className={styles.statValue}>{gameState.streak}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Balance</div>
            <div className={styles.statValue}>{balance}</div>
          </div>
        </div>

        {gameState.currentCard && (
          <div className={styles.cardContainer}>
            <h3>Current Card:</h3>
            <div className={styles.cardWrapper}>
              <img 
                className={styles.cardImage} 
                src={gameState.currentCard.image} 
                alt={formatCardName(gameState.currentCard)} 
              />
            </div>
            <div className={styles.cardName}>{formatCardName(gameState.currentCard)}</div>
          </div>
        )}

        <div className={styles.probabilityDisplay}>
          <div className={styles.probabilityCard}>
            <div className={styles.probabilityLabel}>Higher Odds</div>
            <div className={styles.probabilityValue}>{probabilityHigher}%</div>
          </div>
          <div className={styles.probabilityCard}>
            <div className={styles.probabilityLabel}>Lower Odds</div>
            <div className={styles.probabilityValue}>{probabilityLower}%</div>
          </div>
        </div>

        <div className={styles.controlsContainer}>
          <button 
            onClick={() => processGuess(true)} 
            className={`${styles.button} ${styles.higherButton}`}
          >
            📈 Higher ({probabilityHigher}%)
          </button>
          <button 
            onClick={() => processGuess(false)} 
            className={`${styles.button} ${styles.lowerButton}`}
          >
            📉 Lower ({probabilityLower}%)
          </button>
          <button 
            onClick={cashOut} 
            className={`${styles.button} ${styles.cashOutButton}`}
          >
            💰 Cash Out ({gameState.score})
          </button>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(GamePage), { ssr: false });
