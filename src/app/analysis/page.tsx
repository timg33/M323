"use client";

import { useState, useMemo, useEffect } from 'react';
import { useBalance } from '../context/balanceContext';
import styles from '../styles/analysis.module.css';

// Funktionales Programmieren: Reine Typen für Analyse
interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

interface ProfitLossData {
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  totalTransactions: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  biggestWin: number;
  biggestLoss: number;
  profitFactor: number;
}

interface GameVariantStats {
  variant: string;
  played: number;
  totalWagered: number;
  totalWon: number;
  netProfit: number;
  winRate: number;
  avgSession: number;
}

// Funktionales Programmieren: Reine Funktion zur Erstellung von Datumsbereichen
const createDateRanges = (): DateRange[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

  return [
    { start: today, end: now, label: 'Today' },
    { start: yesterday, end: today, label: 'Yesterday' },
    { start: weekAgo, end: now, label: 'Last 7 Days' },
    { start: monthAgo, end: now, label: 'Last 30 Days' },
    { start: yearAgo, end: now, label: 'Last Year' },
    { start: new Date(0), end: now, label: 'All Time' }
  ];
};

// Funktionales Programmieren: Reine Funktion zum Filtern von Transaktionen nach Datumsbereich
const filterTransactionsByDateRange = (transactions: any[], range: DateRange) => {
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    return transactionDate >= range.start && transactionDate <= range.end;
  });
};

// Funktionales Programmieren: Reine Funktion zur Berechnung von Gewinn/Verlust-Metriken
const calculateProfitLoss = (transactions: any[]): ProfitLossData => {
  const gameTransactions = transactions.filter(t => 
    t.type === 'game-win' || t.type === 'game-loss'
  );

  const wins = gameTransactions.filter(t => t.type === 'game-win');
  const losses = gameTransactions.filter(t => t.type === 'game-loss');

  const totalProfit = wins.reduce((sum, t) => sum + t.amount, 0);
  const totalLoss = losses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netProfit = totalProfit - totalLoss;

  const winRate = gameTransactions.length > 0 ? (wins.length / gameTransactions.length) * 100 : 0;
  const averageWin = wins.length > 0 ? totalProfit / wins.length : 0;
  const averageLoss = losses.length > 0 ? totalLoss / losses.length : 0;

  const biggestWin = wins.length > 0 ? Math.max(...wins.map(t => t.amount)) : 0;
  const biggestLoss = losses.length > 0 ? Math.max(...losses.map(t => Math.abs(t.amount))) : 0;

  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

  return {
    totalProfit,
    totalLoss,
    netProfit,
    totalTransactions: gameTransactions.length,
    winRate,
    averageWin,
    averageLoss,
    biggestWin,
    biggestLoss,
    profitFactor
  };
};

// Funktionales Programmieren: Reine Funktion zur Analyse von Spielvarianten
const analyzeGameVariants = (transactions: any[]): GameVariantStats[] => {
  const variantMap = new Map<string, {
    entryCosts: number[];
    wins: number[];
    losses: number[];
  }>();

  transactions.forEach(transaction => {
    if (transaction.type === 'entry-fee' || transaction.type === 'game-win' || transaction.type === 'game-loss') {
      const variant = transaction.description?.includes('Classic') ? 'Classic Casino' :
                     transaction.description?.includes('Double') ? 'Double or Nothing' :
                     transaction.description?.includes('Streak') ? 'Streak Master' : 'Unknown';
      
      if (!variantMap.has(variant)) {
        variantMap.set(variant, { entryCosts: [], wins: [], losses: [] });
      }

      const data = variantMap.get(variant)!;
      
      if (transaction.type === 'entry-fee') {
        data.entryCosts.push(Math.abs(transaction.amount));
      } else if (transaction.type === 'game-win') {
        data.wins.push(transaction.amount);
      } else if (transaction.type === 'game-loss') {
        data.losses.push(Math.abs(transaction.amount));
      }
    }
  });

  return Array.from(variantMap.entries()).map(([variant, data]) => {
    const totalWagered = data.entryCosts.reduce((sum, cost) => sum + cost, 0);
    const totalWon = data.wins.reduce((sum, win) => sum + win, 0);
    const totalLost = data.losses.reduce((sum, loss) => sum + loss, 0);
    const played = data.entryCosts.length;
    const totalGames = data.wins.length + data.losses.length;
    const winRate = totalGames > 0 ? (data.wins.length / totalGames) * 100 : 0;
    const netProfit = totalWon - totalWagered;
    const avgSession = played > 0 ? netProfit / played : 0;

    return {
      variant,
      played,
      totalWagered,
      totalWon,
      netProfit,
      winRate,
      avgSession
    };
  }).filter(stats => stats.played > 0);
};

// Funktionales Programmieren: Reine Funktion zur Währungsformatierung
const formatCurrency = (amount: number): string => {
  const sign = amount >= 0 ? '+' : '-';
  const absAmount = Math.abs(amount);
  return `${sign}$${absAmount.toLocaleString()}`;
};

// Funktionales Programmieren: Reine Funktion zur Prozentformatierung
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Funktionales Programmieren: Reine Funktion zur Erhaltung von Gewinn-Farben
const getProfitColor = (amount: number): string => {
  if (amount > 0) return 'var(--casino-green)';
  if (amount < 0) return 'var(--casino-red)';
  return 'var(--casino-silver)';
};

export default function AnalysisPage() {
  const [selectedRange, setSelectedRange] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const { transactions, balance } = useBalance();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Funktionales Programmieren: Memoized Berechnungen
  const dateRanges = useMemo(() => createDateRanges(), []);
  
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByDateRange(transactions, dateRanges[selectedRange]);
  }, [transactions, dateRanges, selectedRange]);

  const profitLossData = useMemo(() => {
    return calculateProfitLoss(filteredTransactions);
  }, [filteredTransactions]);

  const variantStats = useMemo(() => {
    return analyzeGameVariants(filteredTransactions);
  }, [filteredTransactions]);

  const recentTransactions = useMemo(() => {
    return transactions
      .slice(0, 10)
      .map(transaction => ({
        ...transaction,
        timestamp: new Date(transaction.timestamp)
      }));
  }, [transactions]);

  if (!hasMounted) {
    return <div className={styles.loading}>Loading analysis...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>💰 Profit & Loss Analysis 💰</h1>
        <p className={styles.subtitle}>Comprehensive financial performance tracking</p>
      </div>

      <div className={styles.dateRangeSelector}>
        {dateRanges.map((range, index) => (
          <button
            key={index}
            onClick={() => setSelectedRange(index)}
            className={`${styles.rangeButton} ${selectedRange === index ? styles.active : ''}`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>📈</span>
            <h3>Net Profit</h3>
          </div>
          <div 
            className={styles.metricValue}
            style={{ color: getProfitColor(profitLossData.netProfit) }}
          >
            {formatCurrency(profitLossData.netProfit)}
          </div>
          <div className={styles.metricSubtext}>
            Total: {profitLossData.totalTransactions} games
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>🎯</span>
            <h3>Win Rate</h3>
          </div>
          <div className={styles.metricValue}>
            {formatPercentage(profitLossData.winRate)}
          </div>
          <div className={styles.metricSubtext}>
            Success ratio
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>🏆</span>
            <h3>Biggest Win</h3>
          </div>
          <div 
            className={styles.metricValue}
            style={{ color: 'var(--casino-green)' }}
          >
            {formatCurrency(profitLossData.biggestWin)}
          </div>
          <div className={styles.metricSubtext}>
            Single best result
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricIcon}>📊</span>
            <h3>Profit Factor</h3>
          </div>
          <div 
            className={styles.metricValue}
            style={{ color: getProfitColor(profitLossData.profitFactor - 1) }}
          >
            {profitLossData.profitFactor === Infinity ? '∞' : profitLossData.profitFactor.toFixed(2)}
          </div>
          <div className={styles.metricSubtext}>
            Profit / Loss ratio
          </div>
        </div>
      </div>

      {variantStats.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🎰 Game Variant Performance</h2>
          <div className={styles.variantGrid}>
            {variantStats.map(variant => (
              <div key={variant.variant} className={styles.variantCard}>
                <h3 className={styles.variantName}>{variant.variant}</h3>
                <div className={styles.variantStats}>
                  <div className={styles.variantStat}>
                    <span className={styles.statLabel}>Games Played</span>
                    <span className={styles.statValue}>{variant.played}</span>
                  </div>
                  <div className={styles.variantStat}>
                    <span className={styles.statLabel}>Net Profit</span>
                    <span 
                      className={styles.statValue}
                      style={{ color: getProfitColor(variant.netProfit) }}
                    >
                      {formatCurrency(variant.netProfit)}
                    </span>
                  </div>
                  <div className={styles.variantStat}>
                    <span className={styles.statLabel}>Win Rate</span>
                    <span className={styles.statValue}>
                      {formatPercentage(variant.winRate)}
                    </span>
                  </div>
                  <div className={styles.variantStat}>
                    <span className={styles.statLabel}>Avg Session</span>
                    <span 
                      className={styles.statValue}
                      style={{ color: getProfitColor(variant.avgSession) }}
                    >
                      {formatCurrency(variant.avgSession)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 