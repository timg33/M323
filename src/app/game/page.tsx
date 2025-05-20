"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useBalance } from "../context/balanceContext";
import styles from "../styles/game.module.css";

const API_BASE = "https://deckofcardsapi.com/api/deck";

const getValue = (value: string): number => {
  const cardValues: Record<string, number> = {
    "ACE": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "JACK": 11,
    "QUEEN": 12,
    "KING": 13,
  };
  return cardValues[value] || 0;
};

const calculateProbability = (prevValue: number, higher: boolean): number => {
  const possibleCards = 13;
  const count = higher ? (possibleCards - prevValue) : (prevValue - 1);
  return Math.round((count / possibleCards) * 100);
};

const isGuessCorrect = (prev: number, next: number, guessHigher: boolean): boolean =>
  guessHigher ? next > prev : next < prev;

const calculatePoints = (
  prevValue: number,
  strategy: (v: number, h: boolean) => number,
  higher: boolean
): number => 100 - strategy(prevValue, higher);

const formatCardName = (card: any) => `${card.value} of ${card.suit}`;

function GamePage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [deckId, setDeckId] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastRoundCard, setLastRoundCard] = useState<any>(null);
  const [lastRoundCorrect, setLastRoundCorrect] = useState<boolean | null>(null);
  const [gameWon, setGameWon] = useState(false);
  const [loading, setLoading] = useState(false);

  const { balance, setBalance } = useBalance();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  async function startGame() {
    setLoading(true);
    const deckRes = await fetch(`${API_BASE}/new/shuffle/?deck_count=1`);
    const deckData = await deckRes.json();
    setDeckId(deckData.deck_id);

    const res = await fetch(`${API_BASE}/${deckData.deck_id}/draw/?count=1`);
    const data = await res.json();
    setCurrentCard(data.cards[0]);

    setScore(0);
    setGameOver(false);
    setLastRoundCard(null);
    setLastRoundCorrect(null);
    setGameWon(false);
    setLoading(false);
  }

  async function startNewGame() {
    setBalance(balance - 100);
    await startGame();
  }

  async function guess(higher: boolean, strategy = calculateProbability) {
    if (!deckId || !currentCard) return;

    const res = await fetch(`${API_BASE}/${deckId}/draw/?count=1`);
    const data = await res.json();

    const prevValue = getValue(currentCard.value);
    const nextValue = getValue(data.cards[0].value);
    const correct = isGuessCorrect(prevValue, nextValue, higher);

    setLastRoundCard(data.cards[0]);
    setLastRoundCorrect(correct);

    if (correct) {
      const pointsEarned = calculatePoints(prevValue, strategy, higher);
      setScore((prev) => prev + pointsEarned);
      setCurrentCard(data.cards[0]);
    } else {
      setGameOver(true);
    }
  }

  function cashOut() {
    setBalance(balance + score);
    setGameWon(true);
  }

  const handleStart = async () => {
    setGameStarted(true);
    await startNewGame();
  };

  const currentValue = currentCard ? getValue(currentCard.value) : null;
  const probabilityHigher = currentValue !== null ? calculateProbability(currentValue, true) : 0;
  const probabilityLower = currentValue !== null ? calculateProbability(currentValue, false) : 0;

  if (!gameStarted) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Higher Lower Game</h1>
        <button onClick={handleStart} className={`${styles.button} ${styles.restartButton}`}>
          Start Game (-100)
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Higher Lower Game</h1>
      {loading ? (
        <h2>Loading...</h2>
      ) : gameOver ? (
        <div>
          {lastRoundCard && (
            <div className={styles.cardContainer}>
              <h2>The next card was:</h2>
              <img className={styles.cardImage} src={lastRoundCard.image} alt={lastRoundCard.value} />
              <h2>{formatCardName(lastRoundCard)}</h2>
            </div>
          )}
          <h2 className={styles.score}>Game Over! Final Score: {score}</h2>
          <button onClick={startNewGame} className={`${styles.button} ${styles.restartButton}`}>
            Restart (-100)
          </button>
        </div>
      ) : gameWon ? (
        <div>
          <h2 className={styles.score}>You cashed out!</h2>
          <h3 className={styles.score}>Final Score: {score}</h3>
          <button onClick={startNewGame} className={`${styles.button} ${styles.restartButton}`}>
            Play Again (-100)
          </button>
        </div>
      ) : (
        <div>
          {currentCard && (
            <div className={styles.cardContainer}>
              <img className={styles.cardImage} src={currentCard.image} alt={currentCard.value} />
              <h2>{formatCardName(currentCard)}</h2>
            </div>
          )}
          <h3 className={styles.score}>Score: {score}</h3>
          <button onClick={() => guess(true)} className={`${styles.button} ${styles.higherButton}`}>
            Higher ({probabilityHigher}%)
          </button>
          <button onClick={() => guess(false)} className={`${styles.button} ${styles.lowerButton}`}>
            Lower ({probabilityLower}%)
          </button>
          <button onClick={cashOut} className={`${styles.button} ${styles.cashOutButton}`}>
            Cash Out
          </button>
        </div>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(GamePage), { ssr: false });
