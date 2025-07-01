"use client";

import { useState, useMemo } from 'react';
import { GameVariant } from '../types/gameTypes';
import { getGameVariants } from '../utils/gameVariants';
import styles from '../styles/tutorial.module.css';

// Funktionales Programmieren: Reine Typen für das Tutorial-System
interface TutorialStep {
  id: number;
  title: string;
  content: string;
  visual?: string;
  tip?: string;
}

interface TutorialData {
  variantId: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  strategies: string[];
  warnings: string[];
}

// Funktionales Programmieren: Reine Funktion zur Erstellung von Tutorial-Inhalten
const createTutorialData = (): Record<string, TutorialData> => ({
  'classic': {
    variantId: 'classic',
    title: '🎯 Classic Casino Tutorial',
    description: 'Learn the fundamentals of Higher/Lower with balanced gameplay and fair odds.',
    steps: [
      {
        id: 1,
        title: 'Game Objective',
        content: 'Predict whether the next card will be higher or lower than the current card. Build streaks to maximize your winnings!',
        visual: '🎴',
        tip: 'Remember: Ace = 1, Jack = 11, Queen = 12, King = 13'
      },
      {
        id: 2,
        title: 'Making Your Guess',
        content: 'Look at the current card and decide if the next card will be higher or lower. Click "Higher" or "Lower" to make your guess.',
        visual: '⬆️⬇️',
        tip: 'Consider the probability - if you see a 7, there are more higher cards than lower cards!'
      },
      {
        id: 3,
        title: 'Scoring System',
        content: 'Correct guesses earn points based on difficulty. Harder predictions (like guessing higher on a King) give more points.',
        visual: '💎',
        tip: 'Points = Base × Risk × Streak Bonus × (1 - 2.5% house edge)'
      },
      {
        id: 4,
        title: 'Streak Bonuses',
        content: 'Build winning streaks for bonus multipliers: 3+ = 1.2×, 5+ = 1.5×, 8+ = 2×, 12+ = 2.5×',
        visual: '🔥',
        tip: 'Long streaks are risky but very rewarding!'
      },
      {
        id: 5,
        title: 'Cashing Out',
        content: 'You can cash out anytime to secure your winnings. One wrong guess ends the game and you lose everything.',
        visual: '💰',
        tip: 'Know when to quit - greed is the enemy of profit!'
      }
    ],
    strategies: [
      'Play conservatively with middle cards (6-8) - they have balanced odds',
      'Be aggressive with extreme cards (Ace, 2, Queen, King)',
      'Cash out after good streaks rather than risking everything',
      'Track which cards have appeared to improve your odds'
    ],
    warnings: [
      'One wrong guess ends the game completely',
      'House edge is 2.5% - expect to lose slightly over time',
      'Streaks are exciting but increase your risk exposure'
    ]
  },
  'double-or-nothing': {
    variantId: 'double-or-nothing',
    title: '💎 Double or Nothing Tutorial',
    description: 'High-risk, high-reward gameplay where you can double your winnings or lose everything.',
    steps: [
      {
        id: 1,
        title: 'High Stakes Gaming',
        content: 'This variant has higher entry costs but bigger rewards. Every decision matters more!',
        visual: '💎',
        tip: 'Entry cost is $200 vs $100 for Classic'
      },
      {
        id: 2,
        title: 'Double or Nothing Action',
        content: 'Use the special "Double or Nothing" action to risk all your current points for a chance to double your next win.',
        visual: '🎲',
        tip: 'Only use this when you are confident about your next guess!'
      },
      {
        id: 3,
        title: 'All-or-Nothing Risk',
        content: 'When Double or Nothing is active, a wrong guess loses ALL your points, not just ending the game.',
        visual: '⚠️',
        tip: 'This is the ultimate high-risk, high-reward decision'
      },
      {
        id: 4,
        title: 'Higher Rewards',
        content: 'Base payouts are 15 points (vs 8 in Classic) but house edge is 3.5% to balance the higher volatility.',
        visual: '💰',
        tip: 'Bigger wins but more variance - manage your bankroll!'
      },
      {
        id: 5,
        title: 'Volatility Management',
        content: 'This mode has extreme swings. Set strict limits and stick to them.',
        visual: '📊',
        tip: 'Never bet more than you can afford to lose completely'
      }
    ],
    strategies: [
      'Only use Double or Nothing on high-probability guesses',
      'Set stop-loss limits before you start playing',
      'Cash out more frequently due to higher risk',
      'Avoid this variant if you are risk-averse'
    ],
    warnings: [
      'Double or Nothing can wipe out your entire session profit',
      'Higher house edge (3.5%) means faster bankroll depletion',
      'Emotional decisions are more costly in this variant',
      'Not suitable for conservative players'
    ]
  },
  'streak-master': {
    variantId: 'streak-master',
    title: '⚡ Streak Master Tutorial',
    description: 'Focus on building massive winning streaks with exponential rewards and special streak protection.',
    steps: [
      {
        id: 1,
        title: 'Exponential Growth',
        content: 'Streak bonuses grow exponentially: each win multiplies your reward by 1.3× (capped at 15 streak).',
        visual: '📈',
        tip: 'A 10-streak gives you 13.8× multiplier!'
      },
      {
        id: 2,
        title: 'Streak Shield',
        content: 'After 3+ wins, spend 50 points for Streak Shield. Protects your streak - wrong guesses only end the game.',
        visual: '🛡️',
        tip: 'Insurance for your valuable streaks'
      },
      {
        id: 3,
        title: 'Multiplier Boost',
        content: 'At 5+ streak, spend 100 points to permanently increase your multiplier by 0.5× for this game.',
        visual: '⚡',
        tip: 'Compounds with streak bonuses for massive rewards'
      },
      {
        id: 4,
        title: 'Soft Landing',
        content: 'Unlike other variants, you keep 25% of your score when you lose - softer penalty for streak builders.',
        visual: '🪂',
        tip: 'Less punishing than all-or-nothing gameplay'
      },
      {
        id: 5,
        title: 'Dynamic Multipliers',
        content: 'Your base multiplier increases as your streak grows, reaching up to 3× at long streaks.',
        visual: '🔥',
        tip: 'The longer you survive, the more each win is worth'
      }
    ],
    strategies: [
      'Invest in Streak Shield for valuable long streaks',
      'Use Multiplier Boost when you have a good streak going',
      'Focus on safe plays to build initial streak',
      'The 25% soft landing makes longer attempts viable'
    ],
    warnings: [
      'Special actions cost points - use them wisely',
      '3% house edge still applies to all calculations',
      'Exponential growth creates temptation to over-extend',
      'Special actions can eat into your profits if overused'
    ]
  }
});

// Funktionales Programmieren: Reine Funktion zur Erhaltung von Tutorials nach Varianten-ID
const getTutorialByVariant = (variantId: string): TutorialData | null => {
  const tutorials = createTutorialData();
  return tutorials[variantId] || null;
};

interface TutorialProps {
  variant?: GameVariant;
  onClose: () => void;
  onStartGame?: () => void;
}

export default function Tutorial({ variant, onClose, onStartGame }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'steps' | 'strategies' | 'warnings'>('steps');

  // Funktionales Programmieren: Memoized Tutorial-Daten
  const tutorialData = useMemo(() => {
    if (!variant) return null;
    return getTutorialByVariant(variant.id);
  }, [variant]);

  if (!tutorialData) {
    return (
      <div className={styles.tutorialOverlay}>
        <div className={styles.tutorialModal}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>❌</div>
            <h2>Tutorial Not Available</h2>
            <p>No tutorial found for this game variant.</p>
            <button onClick={onClose} className={styles.closeButton}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Funktionales Programmieren: Reine Funktionen für Navigation
  const nextStep = (): void => {
    if (tutorialData && currentStep < tutorialData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = (): void => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const goToStep = (stepIndex: number): void => {
    setCurrentStep(stepIndex);
  };

  const currentStepData = tutorialData.steps[currentStep];

  return (
    <div className={styles.tutorialOverlay}>
      <div className={styles.tutorialModal}>
        {/* Header */}
        <div className={styles.tutorialHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.tutorialTitle}>{tutorialData.title}</h1>
            <p className={styles.tutorialDescription}>{tutorialData.description}</p>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          {(['steps', 'strategies', 'warnings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`${styles.tabButton} ${selectedTab === tab ? styles.active : ''}`}
            >
              {tab === 'steps' && '📚 Tutorial'}
              {tab === 'strategies' && '🎯 Strategies'}
              {tab === 'warnings' && '⚠️ Warnings'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className={styles.tutorialContent}>
          {selectedTab === 'steps' && (
            <>
              {/* Step Progress */}
              <div className={styles.stepProgress}>
                {tutorialData.steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`${styles.stepDot} ${index === currentStep ? styles.active : ''} ${index < currentStep ? styles.completed : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Current Step */}
              <div className={styles.stepContent}>
                <div className={styles.stepVisual}>
                  <span className={styles.stepIcon}>{currentStepData.visual}</span>
                  <span className={styles.stepNumber}>Step {currentStep + 1}</span>
                </div>
                
                <h3 className={styles.stepTitle}>{currentStepData.title}</h3>
                <p className={styles.stepDescription}>{currentStepData.content}</p>
                
                {currentStepData.tip && (
                  <div className={styles.stepTip}>
                    <span className={styles.tipIcon}>💡</span>
                    <span className={styles.tipText}>{currentStepData.tip}</span>
                  </div>
                )}
              </div>

              {/* Step Navigation */}
              <div className={styles.stepNavigation}>
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={styles.navButton}
                >
                  ← Previous
                </button>
                
                <span className={styles.stepCounter}>
                  {currentStep + 1} of {tutorialData.steps.length}
                </span>
                
                <button
                  onClick={nextStep}
                  disabled={currentStep === tutorialData.steps.length - 1}
                  className={styles.navButton}
                >
                  Next →
                </button>
              </div>
            </>
          )}

          {selectedTab === 'strategies' && (
            <div className={styles.listContent}>
              <h3 className={styles.listTitle}>🎯 Winning Strategies</h3>
              <ul className={styles.strategiesList}>
                {tutorialData.strategies.map((strategy, index) => (
                  <li key={index} className={styles.strategyItem}>
                    <span className={styles.strategyIcon}>💡</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedTab === 'warnings' && (
            <div className={styles.listContent}>
              <h3 className={styles.listTitle}>⚠️ Important Warnings</h3>
              <ul className={styles.warningsList}>
                {tutorialData.warnings.map((warning, index) => (
                  <li key={index} className={styles.warningItem}>
                    <span className={styles.warningIcon}>⚠️</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.tutorialFooter}>
          <button onClick={onClose} className={styles.secondaryButton}>
            Close Tutorial
          </button>
          {onStartGame && (
            <button onClick={onStartGame} className={styles.primaryButton}>
              🎮 Start Playing {variant?.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 