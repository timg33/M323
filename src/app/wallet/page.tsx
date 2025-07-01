"use client";

import { useState, useMemo } from 'react';
import { useBalance } from '../context/balanceContext';
import styles from '../styles/wallet.module.css';

// Funktionales Programmieren: Reine Typen für Wallet-Operationen
interface WalletAction {
  id: string;
  name: string;
  icon: string;
  description: string;
  action: (amount: number) => boolean | void;
}

// Funktionales Programmieren: Reine Funktion zur Währungsformatierung
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Funktionales Programmieren: Reine Funktion zur Datumsformatierung
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Funktionales Programmieren: Reine Funktion zur Erhaltung von Transaktions-Icons
const getTransactionIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'cash-in': '💰',
    'cash-out': '💸',
    'game-win': '🎊',
    'game-loss': '💔',
    'entry-fee': '🎫'
  };
  return iconMap[type] || '💳';
};

// Funktionales Programmieren: Reine Funktion zur Erhaltung von Transaktions-Farben
const getTransactionColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    'cash-in': 'var(--casino-gold)',
    'cash-out': 'var(--casino-red)',
    'game-win': 'var(--casino-green)',
    'game-loss': 'var(--casino-red)',
    'entry-fee': 'var(--casino-blue)'
  };
  return colorMap[type] || 'var(--casino-silver)';
};

// Funktionales Programmieren: Reine Funktion zur Erstellung von Schnellbeträgen
const createQuickAmounts = (): number[] => [100, 500, 1000, 2500, 5000, 10000];

export default function WalletPage() {
  const { balance, cashIn, cashOut, transactions, getTransactionHistory } = useBalance();
  const [amount, setAmount] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'today'>('all');
  const [showSuccess, setShowSuccess] = useState<string>('');

  // Funktionales Programmieren: Memoized Wallet-Aktionen
  const walletActions: WalletAction[] = useMemo(() => [
    {
      id: 'cash-in',
      name: 'Cash In',
      icon: '💰',
      description: 'Add money to your casino account',
      action: (amount: number) => {
        cashIn(amount);
        setShowSuccess(`Successfully added ${formatCurrency(amount)} to your account!`);
        setTimeout(() => setShowSuccess(''), 3000);
      }
    },
    {
      id: 'cash-out',
      name: 'Cash Out',
      icon: '💸',
      description: 'Withdraw money from your casino account',
      action: (amount: number) => {
        const success = cashOut(amount);
        if (success) {
          setShowSuccess(`Successfully withdrew ${formatCurrency(amount)} from your account!`);
          setTimeout(() => setShowSuccess(''), 3000);
          return true;
        } else {
          setShowSuccess('Insufficient funds for withdrawal!');
          setTimeout(() => setShowSuccess(''), 3000);
          return false;
        }
      }
    }
  ], [cashIn, cashOut]);

  // Funktionales Programmieren: Memoized gefilterte Transaktionen
  const filteredTransactions = useMemo(() => {
    switch (selectedPeriod) {
      case 'today':
        return getTransactionHistory(1);
      case 'week':
        return getTransactionHistory(7);
      default:
        return transactions;
    }
  }, [transactions, selectedPeriod, getTransactionHistory]);

  // Funktionales Programmieren: Reine Funktion zur Behandlung von Betragseingaben
  const handleAmountChange = (value: string): void => {
    const numValue = value.replace(/[^0-9]/g, '');
    setAmount(numValue);
  };

  // Funktionales Programmieren: Reine Funktion zur Ausführung von Wallet-Aktionen
  const executeAction = (action: WalletAction): void => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setShowSuccess('Please enter a valid amount!');
      setTimeout(() => setShowSuccess(''), 3000);
      return;
    }

    action.action(numAmount);
    setAmount('');
  };

  // Funktionales Programmieren: Reine Funktion zum Setzen von Schnellbeträgen
  const setQuickAmount = (quickAmount: number): void => {
    setAmount(quickAmount.toString());
  };

  return (
    <div className={styles.walletContainer}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            <span className={styles.titleIcon}>🏦</span>
            Casino Wallet
          </h1>
          <p className={styles.subtitle}>Manage your casino bankroll with professional tools</p>
        </div>
        
        <div className={styles.balanceCard}>
          <div className={styles.balanceLabel}>Current Balance</div>
          <div className={styles.balanceAmount}>{formatCurrency(balance)}</div>
          <div className={styles.balanceSubtext}>Available for gaming</div>
        </div>
      </div>

      {showSuccess && (
        <div className={`${styles.notification} ${showSuccess.includes('Insufficient') ? styles.error : styles.success}`}>
          {showSuccess}
        </div>
      )}

      <div className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>💳 Wallet Operations</h2>
        
        <div className={styles.amountInput}>
          <label className={styles.inputLabel}>Amount ($)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="Enter amount..."
            className={styles.amountField}
          />
        </div>

        <div className={styles.quickAmounts}>
          <span className={styles.quickLabel}>Quick amounts:</span>
          {createQuickAmounts().map(quickAmount => (
            <button
              key={quickAmount}
              onClick={() => setQuickAmount(quickAmount)}
              className={styles.quickAmount}
            >
              {formatCurrency(quickAmount)}
            </button>
          ))}
        </div>

        <div className={styles.actionButtons}>
          {walletActions.map(action => (
            <button
              key={action.id}
              onClick={() => executeAction(action)}
              className={`${styles.actionButton} ${styles[action.id]}`}
              disabled={!amount || parseInt(amount, 10) <= 0}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <div className={styles.actionContent}>
                <div className={styles.actionName}>{action.name}</div>
                <div className={styles.actionDescription}>{action.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <h2 className={styles.sectionTitle}>📊 Transaction History</h2>
          <div className={styles.periodSelector}>
            {(['all', 'week', 'today'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`${styles.periodButton} ${selectedPeriod === period ? styles.active : ''}`}
              >
                {period === 'all' ? 'All Time' : period === 'week' ? 'This Week' : 'Today'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.transactionsList}>
          {filteredTransactions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📝</div>
              <div className={styles.emptyTitle}>No transactions yet</div>
              <div className={styles.emptyDescription}>Your transaction history will appear here</div>
            </div>
          ) : (
            filteredTransactions.map(transaction => (
              <div key={transaction.id} className={styles.transactionItem}>
                <div 
                  className={styles.transactionIcon}
                  style={{ color: getTransactionColor(transaction.type) }}
                >
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className={styles.transactionDetails}>
                  <div className={styles.transactionDescription}>{transaction.description}</div>
                  <div className={styles.transactionDate}>{formatDate(transaction.timestamp)}</div>
                </div>
                <div 
                  className={`${styles.transactionAmount} ${
                    transaction.type === 'cash-in' || transaction.type === 'game-win' 
                      ? styles.positive 
                      : styles.negative
                  }`}
                >
                  {transaction.type === 'cash-in' || transaction.type === 'game-win' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 