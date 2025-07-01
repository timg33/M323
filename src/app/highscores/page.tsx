"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/highscores.module.css";

// Functional Programming: Type definition for highscore entry
interface HighscoreEntry {
  id: number;
  score: number;
  date: string;
  playerName?: string;
}

// Functional Programming: Pure function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Functional Programming: Pure function to format score with commas
const formatScore = (score: number): string => {
  return new Intl.NumberFormat('en-US').format(score);
};

// Functional Programming: Higher-order function for sorting
const createSorter = <T>(key: keyof T, direction: 'asc' | 'desc' = 'desc') => 
  (a: T, b: T): number => {
    const aVal = a[key];
    const bVal = b[key];
    const modifier = direction === 'desc' ? -1 : 1;
    
    if (aVal < bVal) return modifier;
    if (aVal > bVal) return -modifier;
    return 0;
  };

// Functional Programming: Pure function to get medal emoji
const getMedalEmoji = (position: number): string => {
  const medals: Record<number, string> = {
    1: "🥇",
    2: "🥈", 
    3: "🥉"
  };
  return medals[position] || "🏅";
};

// Functional Programming: Pure function to get default highscores
const getDefaultHighscores = (): HighscoreEntry[] => [
  { id: 1, score: 2500, date: new Date().toISOString(), playerName: "Casino Master" },
  { id: 2, score: 1800, date: new Date().toISOString(), playerName: "Lucky Seven" },
  { id: 3, score: 1200, date: new Date().toISOString(), playerName: "Card Shark" },
  { id: 4, score: 950, date: new Date().toISOString(), playerName: "High Roller" },
  { id: 5, score: 750, date: new Date().toISOString(), playerName: "Ace Player" }
];

export default function HighscoresPage() {
  const [highscores, setHighscores] = useState<HighscoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  // Functional Programming: Effect for loading highscores
  useEffect(() => {
    const loadHighscores = () => {
      try {
        const savedScores = localStorage.getItem('highscores');
        const scores = savedScores ? JSON.parse(savedScores) : getDefaultHighscores();
        
        // Functional Programming: Using map to ensure all entries have required properties
        const processedScores = scores.map((score: any, index: number) => ({
          id: score.id || Date.now() + index,
          score: score.score || 0,
          date: score.date || new Date().toISOString(),
          playerName: score.playerName || `Player ${index + 1}`
        }));
        
        setHighscores(processedScores);
      } catch (error) {
        console.error('Failed to load highscores:', error);
        setHighscores(getDefaultHighscores());
      } finally {
        setLoading(false);
      }
    };

    loadHighscores();
  }, []);

  // Functional Programming: Pure function to filter scores by date
  const filterScoresByDate = (scores: HighscoreEntry[], filterType: string): HighscoreEntry[] => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return scores.filter(score => {
      const scoreDate = new Date(score.date);
      switch (filterType) {
        case 'today':
          return scoreDate >= todayStart;
        case 'week':
          return scoreDate >= weekStart;
        default:
          return true;
      }
    });
  };

  // Functional Programming: Using function composition for data processing
  const getFilteredAndSortedScores = (): HighscoreEntry[] => {
    const sorter = createSorter<HighscoreEntry>('score', 'desc');
    return filterScoresByDate(highscores, filter)
      .sort(sorter)
      .slice(0, 10); // Top 10 only
  };

  // Functional Programming: Pure function to get statistics
  const getStatistics = () => {
    const scores = highscores.map(h => h.score);
    return {
      totalGames: scores.length,
      highestScore: Math.max(...scores, 0),
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      totalPlayers: new Set(highscores.map(h => h.playerName)).size
    };
  };

  const clearHighscores = () => {
    if (confirm('Are you sure you want to clear all highscores? This cannot be undone.')) {
      localStorage.removeItem('highscores');
      setHighscores(getDefaultHighscores());
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Loading Leaderboard...</h1>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  const filteredScores = getFilteredAndSortedScores();
  const stats = getStatistics();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={`${styles.title} neon-text`}>🏆 Casino Leaderboard 🏆</h1>
        <p className={styles.subtitle}>Hall of Fame - Top Players</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎮</div>
          <div className={styles.statValue}>{stats.totalGames}</div>
          <div className={styles.statLabel}>Total Games</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👑</div>
          <div className={styles.statValue}>{formatScore(stats.highestScore)}</div>
          <div className={styles.statLabel}>Highest Score</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statValue}>{formatScore(stats.averageScore)}</div>
          <div className={styles.statLabel}>Average Score</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statValue}>{stats.totalPlayers}</div>
          <div className={styles.statLabel}>Total Players</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filterButtons}>
          {(['all', 'week', 'today'] as const).map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`${styles.filterButton} ${filter === filterType ? styles.active : ''}`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
        
        <button onClick={clearHighscores} className={styles.clearButton}>
          🗑️ Clear All
        </button>
      </div>

      <div className={styles.leaderboard}>
        {filteredScores.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>No scores found</h3>
            <p>Be the first to set a highscore!</p>
            <Link href="/game" className={styles.playButton}>
              🎰 Play Now
            </Link>
          </div>
        ) : (
          <div className={styles.scoresList}>
            {filteredScores.map((score, index) => (
              <div key={score.id} className={`${styles.scoreEntry} ${index < 3 ? styles.topThree : ''}`}>
                <div className={styles.rank}>
                  <span className={styles.medal}>{getMedalEmoji(index + 1)}</span>
                  <span className={styles.position}>#{index + 1}</span>
                </div>
                
                <div className={styles.playerInfo}>
                  <div className={styles.playerName}>
                    {score.playerName || `Player ${index + 1}`}
                  </div>
                  <div className={styles.scoreDate}>
                    {formatDate(score.date)}
                  </div>
                </div>
                
                <div className={styles.scoreValue}>
                  {formatScore(score.score)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Link href="/game" className={styles.playAgainButton}>
          🎲 Play Game
        </Link>
        <Link href="/" className={styles.homeButton}>
          🏠 Home
        </Link>
      </div>
    </div>
  );
} 