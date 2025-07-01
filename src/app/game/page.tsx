"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useBalance } from "../context/balanceContext";
import { GameState, GameVariant, SpecialAction, Card } from "../types/gameTypes";
import { getVariantById, getGameVariants } from "../utils/gameVariants";
import VariantSelector from "../components/VariantSelector";
import Tutorial from "../components/Tutorial";
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

// Functional Programming: Currying for guess validation
const validateGuess = (prevValue: number) => 
  (nextValue: number) => 
    (isHigherGuess: boolean): boolean => 
      isHigherGuess ? nextValue > prevValue : nextValue < prevValue;

// Functional Programming: Pure function for card name formatting
const formatCardName = (card: Card): string => 
  `${card.value} of ${card.suit}`;

// Functional Programming: Pure function to create initial game state
const createInitialGameState = (): GameState => ({
  gameStarted: false,
  deckId: null,
  currentCard: null,
  score: 0,
  gameOver: false,
  lastRoundCard: null,
  lastRoundCorrect: null,
  gameWon: false,
  loading: false,
  streak: 0,
  totalGames: 0,
  bestScore: 0,
  multiplier: 1,
  specialMode: undefined,
  timeLeft: undefined,
  doubleOrNothingActive: false
});

function GamePage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [selectedVariant, setSelectedVariant] = useState<GameVariant | null>(null);
  const [availableActions, setAvailableActions] = useState<SpecialAction[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialVariant, setTutorialVariant] = useState<GameVariant | null>(null);
  const { balance, setBalance } = useBalance();

  // Functional Programming: Pure function to update game state immutably
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
    
    // Auto-select classic variant by default
    const defaultVariant = getVariantById('classic');
    if (defaultVariant) {
      setSelectedVariant(defaultVariant);
    }
  }, [updateGameState]);

  // Functional Programming: Pure function to save game statistics
  const saveGameStats = useCallback((finalScore: number, variantId: string) => {
    const stats = {
      totalGames: gameState.totalGames + 1,
      bestScore: Math.max(gameState.bestScore, finalScore),
      lastPlayed: Date.now(),
      variantPlayed: variantId
    };
    localStorage.setItem('higherLowerStats', JSON.stringify(stats));
    updateGameState(stats);
  }, [gameState.totalGames, gameState.bestScore, updateGameState]);

  // Functional Programming: Effect for updating special actions
  useEffect(() => {
    if (selectedVariant && selectedVariant.getSpecialActions) {
      const actions = selectedVariant.getSpecialActions(gameState);
      setAvailableActions(actions);
    } else {
      setAvailableActions([]);
    }
  }, [selectedVariant, gameState]);

  // Functional Programming: Get all possible special actions for consistent UI
  const getAllPossibleActions = useMemo(() => {
    if (!selectedVariant?.getSpecialActions) return [];
    
    // Create a mock game state to get all possible actions
    const mockState: GameState = {
      ...gameState,
      score: 1000, // High score to ensure all actions appear as available
      streak: 10,
      doubleOrNothingActive: false,
      specialMode: undefined
    };
    
    return selectedVariant.getSpecialActions(mockState);
  }, [selectedVariant, gameState.specialMode]); // Only depend on variant and special mode

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
        streak: 0,
        multiplier: 1,
        specialMode: undefined,
        doubleOrNothingActive: false
      });
    } catch (error) {
      console.error('Failed to start new deck:', error);
      updateGameState({ loading: false });
    }
  }, [updateGameState]);

  const startGame = useCallback(async () => {
    if (!selectedVariant || balance < selectedVariant.entryCost) return;
    
    setBalance(balance - selectedVariant.entryCost);
    updateGameState({ gameStarted: true });
    await startNewDeck();
  }, [balance, setBalance, selectedVariant, updateGameState, startNewDeck]);

  // Functional Programming: Function composition for guess processing using variant logic
  const processGuess = useCallback(async (isHigherGuess: boolean) => {
    if (!gameState.deckId || !gameState.currentCard || !selectedVariant) return;

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

      // Use variant-specific guess processing
      const variantUpdates = selectedVariant.processGuess(gameState, isCorrect, probability);
      
      if (variantUpdates.gameOver) {
        saveGameStats(variantUpdates.score ?? gameState.score, selectedVariant.id);
      } else if (isCorrect) {
        // Update current card for next round
        variantUpdates.currentCard = nextCard;
      }
      
      updateGameState(variantUpdates);
    } catch (error) {
      console.error('Failed to process guess:', error);
    }
  }, [gameState, selectedVariant, updateGameState, saveGameStats]);

  const cashOut = useCallback(() => {
    if (!selectedVariant) return;
    
    const finalBalance = balance + gameState.score;
    setBalance(finalBalance);
    saveGameStats(gameState.score, selectedVariant.id);
    updateGameState({ gameWon: true });
    
    // Save to highscores
    const highscores = JSON.parse(localStorage.getItem('highscores') || '[]');
    const newScore = {
      score: gameState.score,
      date: new Date().toISOString(),
      variant: selectedVariant.name,
      streak: gameState.streak
    };
    highscores.push(newScore);
    highscores.sort((a: any, b: any) => b.score - a.score);
    localStorage.setItem('highscores', JSON.stringify(highscores.slice(0, 100)));
  }, [balance, setBalance, gameState, selectedVariant, saveGameStats, updateGameState]);

  const resetGame = useCallback(async () => {
    if (selectedVariant && balance >= selectedVariant.entryCost) {
      setBalance(balance - selectedVariant.entryCost);
      updateGameState({
        ...createInitialGameState(),
        gameStarted: true
      });
      await startNewDeck();
    }
  }, [updateGameState, selectedVariant, setBalance, balance, startNewDeck]);

  const handleSpecialAction = useCallback((action: SpecialAction) => {
    if (action.cost > gameState.score) return;
    
    const actionResult = action.execute(gameState);
    updateGameState(actionResult);
  }, [gameState, updateGameState]);

  // Tutorial handlers
  const handleTutorial = useCallback((variant: GameVariant) => {
    setTutorialVariant(variant);
    setShowTutorial(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    setTutorialVariant(null);
  }, []);

  const startGameFromTutorial = useCallback(() => {
    if (tutorialVariant) {
      setSelectedVariant(tutorialVariant);
      closeTutorial();
    }
  }, [tutorialVariant, closeTutorial]);

  // Probability calculation for current card
  const currentProbability = gameState.currentCard ? {
    higher: calculateWinProbability(getCardValue(gameState.currentCard.value), true),
    lower: calculateWinProbability(getCardValue(gameState.currentCard.value), false)
  } : { higher: 0, lower: 0 };

  if (!hasMounted) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!gameState.gameStarted) {
    return (
      <>
        <VariantSelector
          onSelectVariant={(variant) => {
            setSelectedVariant(variant);
            startGame();
          }}
          onTutorial={handleTutorial}
        />
        {showTutorial && (
          <Tutorial
            variant={tutorialVariant ? tutorialVariant : undefined}
            onClose={closeTutorial}
            onStartGame={startGameFromTutorial}
          />
        )}
      </>
    );
  }

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameContent}>
        {/* Game Sidebar */}
        <div className={styles.gameSidebar}>


          {/* Special Mode Indicator */}
          {gameState.specialMode && (
            <div className={styles.sidebarSection}>
              <div className={styles.specialModeIndicator}>
                <h4>🔥 Special Mode Active</h4>
                {gameState.specialMode === 'double-or-nothing' && (
                  <p>💎 DOUBLE OR NOTHING: Next guess wins DOUBLE or loses ALL!</p>
                )}
                {gameState.specialMode === 'streak-shield' && (
                  <p>🛡️ STREAK SHIELD: Protected from next wrong guess!</p>
                )}
                {gameState.specialMode === 'multiplier-boost' && (
                  <p>🚀 MULTIPLIER BOOST: +0.5x for {gameState.timeLeft || 0} more guess{(gameState.timeLeft || 0) !== 1 ? 'es' : ''}!</p>
                )}
              </div>
            </div>
          )}

          {/* Game Stats */}
          <div className={styles.sidebarSection}>
            <h3 className={styles.sectionTitle}>📊 Game Stats</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Score</span>
                <span className={styles.statValue}>{gameState.score}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Streak</span>
                <span className={styles.statValue}>{gameState.streak}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Multiplier</span>
                <span 
                  className={`${styles.statValue} ${styles.multiplierValue}`}
                  data-multiplier={Math.floor(gameState.multiplier)}
                >
                  {gameState.multiplier.toFixed(1)}x
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Balance</span>
                <span className={styles.statValue}>{balance}</span>
              </div>
            </div>
          </div>

          {/* Probability Display */}
          {gameState.currentCard && (
            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>🎯 Probabilities</h3>
              <div className={styles.probabilityGrid}>
                <div className={styles.probItem}>
                  <span className={styles.probLabel}>Higher</span>
                  <span className={styles.probValue}>{currentProbability.higher}%</span>
                </div>
                <div className={styles.probItem}>
                  <span className={styles.probLabel}>Lower</span>
                  <span className={styles.probValue}>{currentProbability.lower}%</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Main Game Area */}
        <div className={styles.gameMain}>
          <div className={styles.cardDisplay}>
            {gameState.loading ? (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner}></div>
                <p>Drawing card...</p>
              </div>
            ) : gameState.currentCard ? (
              <div className={styles.cardContainer}>
                <div className={styles.cardWrapper}>
                  <img
                    src={gameState.currentCard.image}
                    alt={formatCardName(gameState.currentCard)}
                    className={styles.cardImage}
                  />
                  <h3 className={styles.cardName}>
                    {formatCardName(gameState.currentCard)}
                  </h3>
                </div>
                
                {gameState.lastRoundCard && (
                  <div className={styles.lastRoundResult}>
                    <div className={`${styles.resultIndicator} ${gameState.lastRoundCorrect ? styles.correct : styles.incorrect}`}>
                      {gameState.lastRoundCorrect ? '✅ Correct!' : '❌ Wrong!'}
                    </div>
                    <div className={styles.lastCard}>
                      <img
                        src={gameState.lastRoundCard.image}
                        alt={formatCardName(gameState.lastRoundCard)}
                        className={styles.lastCardImage}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.noCard}>
                <p>Ready to start!</p>
              </div>
            )}
          </div>

          {(gameState.gameOver || gameState.gameWon) && (
            <div className={styles.gameOverOverlay}>
              <div className={styles.gameOverContent}>
                <h2 className={gameState.gameWon ? styles.gameWonTitle : styles.gameOverTitle}>
                  {gameState.gameWon ? '🎉 Congratulations!' : '💔 Game Over'}
                </h2>
                <div className={styles.finalScore}>
                  Final Score: <span>{gameState.score}</span>
                </div>
                {gameState.streak > 0 && (
                  <div className={styles.finalStreak}>
                    Best Streak: <span>{gameState.streak}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Footer with Action Buttons */}
      <div className={styles.gameFooter}>
        {/* Game Controls */}
        {!gameState.gameOver && !gameState.gameWon && gameState.currentCard && (
          <div className={styles.footerControls}>
            <button
              onClick={() => processGuess(true)}
              className={`${styles.guessButton} ${styles.higherButton}`}
              disabled={gameState.loading}
            >
              ⬆️ Higher
            </button>
            <button
              onClick={() => processGuess(false)}
              className={`${styles.guessButton} ${styles.lowerButton}`}
              disabled={gameState.loading}
            >
              ⬇️ Lower
            </button>
            <button
              onClick={cashOut}
              className={styles.cashOutButton}
              disabled={gameState.score === 0}
            >
              💰 Cash Out ({gameState.score})
            </button>
            
            {/* Special Actions - Always visible */}
            {getAllPossibleActions.map((action) => {
              const availableAction = availableActions.find(a => a.id === action.id);
              const isAvailable = availableAction && availableAction.available && availableAction.cost <= gameState.score;
              
              // Check if this special action is currently active
              const isActive = (
                (action.id === 'double-or-nothing' && gameState.doubleOrNothingActive) ||
                (action.id === 'streak-shield' && gameState.specialMode === 'streak-shield') ||
                (action.id === 'multiplier-boost' && gameState.specialMode === 'multiplier-boost')
              );
              
              return (
                <button
                  key={action.id}
                  onClick={() => isAvailable && !isActive && handleSpecialAction(action)}
                  disabled={!isAvailable || gameState.loading || isActive}
                  className={`${styles.specialAction} ${styles.footerSpecialAction} ${isActive ? styles.active : ''}`}
                  title={isActive ? `ACTIVE: ${action.description}` : action.description}
                >
                  <span className={styles.actionIcon}>{action.icon}</span>
                  <span className={styles.actionName}>
                    {isActive ? `ACTIVE` : action.name.replace(/^[💎🛡️🚀]\s*/, '')}
                  </span>
                  <span className={styles.actionCost}>
                    {isActive ? (action.id === 'multiplier-boost' ? `${gameState.timeLeft || 0} left` : 'ACTIVE') : `(${action.cost})`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Game Over Actions */}
        {(gameState.gameOver || gameState.gameWon) && (
          <div className={styles.footerControls}>
            <button onClick={resetGame} className={styles.restartButton}>
              🔄 Play Again
            </button>
            <button 
              onClick={() => updateGameState({ gameStarted: false })}
              className={styles.changeVariantButton}
            >
              🎰 Change Variant
            </button>
          </div>
        )}
      </div>

      {showTutorial && tutorialVariant && (
        <Tutorial
          variant={tutorialVariant}
          onClose={closeTutorial}
          onStartGame={startGameFromTutorial}
        />
      )}
    </div>
  );
}

export default GamePage;
