"use client";

import { useState } from 'react';
import { GameVariant } from '../types/gameTypes';
import { getGameVariants, getDifficultyColor } from '../utils/gameVariants';
import { useBalance } from '../context/balanceContext';
import styles from '../styles/variantSelector.module.css';

interface VariantSelectorProps {
  onSelectVariant: (variant: GameVariant) => void;
  onTutorial?: (variant: GameVariant) => void;
}

// Funktionales Programmieren: Reine Funktion zur Überprüfung ob Variante erschwinglich ist
const canAffordVariant = (balance: number, entryCost: number): boolean => {
  return balance >= entryCost;
};

// Funktionales Programmieren: Reine Funktion zur Formatierung der Feature-Liste
const formatFeatures = (features: string[]): string => {
  return features.join(' • ');
};

// Funktionales Programmieren: Reine Funktion zur Erhaltung von Varianten-Empfehlungen
const getVariantRecommendation = (balance: number, variants: GameVariant[]): GameVariant => {
  const affordableVariants = variants.filter(variant => canAffordVariant(balance, variant.entryCost));
  
  if (affordableVariants.length === 0) return variants[0];
  
  if (balance >= 500) return variants.find(v => v.id === 'double-or-nothing') || variants[0];
  if (balance >= 300) return variants.find(v => v.id === 'streak-master') || variants[0];
  return variants.find(v => v.id === 'classic') || variants[0];
};

// Funktionales Programmieren: Reine Komponente mit unveränderlichen Props
export default function VariantSelector({ onSelectVariant, onTutorial }: VariantSelectorProps) {
  const [hoveredVariant, setHoveredVariant] = useState<string | null>(null);
  const { balance } = useBalance();
  const variants = getGameVariants();
  const recommendedVariant = getVariantRecommendation(balance, variants);

  // Funktionales Programmieren: Reine Funktion zur Behandlung der Varianten-Auswahl
  const handleVariantSelect = (variant: GameVariant) => {
    if (canAffordVariant(balance, variant.entryCost)) {
      onSelectVariant(variant);
    }
  };

  // Funktionales Programmieren: Reine Funktion zur Erhaltung von Karten-Styling
  const getCardStyling = (variant: GameVariant, isHovered: boolean, isAffordable: boolean) => {
    let className = styles.variantCard;
    
    if (isHovered) className += ` ${styles.hovered}`;
    if (!isAffordable) className += ` ${styles.disabled}`;
    if (variant.id === recommendedVariant.id) className += ` ${styles.recommended}`;
    
    return className;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={`${styles.title} neon-text`}>🎰 Choose Your Game Mode 🎰</h2>
        <p className={styles.subtitle}>
          Each variant offers unique mechanics and reward structures
        </p>
      </div>

      <div className={styles.variantsGrid}>
        {variants.map((variant) => {
          const isHovered = hoveredVariant === variant.id;
          const isAffordable = canAffordVariant(balance, variant.entryCost);
          const isRecommended = variant.id === recommendedVariant.id;

          return (
            <div
              key={variant.id}
              className={getCardStyling(variant, isHovered, isAffordable)}
              onMouseEnter={() => setHoveredVariant(variant.id)}
              onMouseLeave={() => setHoveredVariant(null)}
              style={{ 
                '--difficulty-color': getDifficultyColor(variant.difficulty)
              } as React.CSSProperties}
            >
              {isRecommended && (
                <div className={styles.recommendedBadge}>
                  ⭐ RECOMMENDED
                </div>
              )}
              
              <div className={styles.variantHeader}>
                <div className={styles.variantIcon}>{variant.icon}</div>
                <div className={styles.variantInfo}>
                  <h3 className={styles.variantName}>{variant.name}</h3>
                  <div className={styles.difficulty}>
                    <span 
                      className={styles.difficultyBadge}
                      style={{ backgroundColor: getDifficultyColor(variant.difficulty) }}
                    >
                      {variant.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <p className={styles.description}>{variant.description}</p>

              <div className={styles.features}>
                <h4>Features:</h4>
                <p>{formatFeatures(variant.features)}</p>
              </div>

              <div className={styles.costs}>
                <div className={styles.entryCost}>
                  <span className={styles.costLabel}>Entry Cost:</span>
                  <span className={styles.costValue}>
                    {variant.entryCost} coins
                  </span>
                </div>
                
                {variant.maxMultiplier && (
                  <div className={styles.maxMultiplier}>
                    <span className={styles.costLabel}>Max Multiplier:</span>
                    <span className={styles.multiplierValue}>
                      {variant.maxMultiplier}x
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.variantActions}>
                {onTutorial && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTutorial(variant);
                    }}
                    className={styles.tutorialButton}
                  >
                    📚 Tutorial
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVariantSelect(variant);
                  }}
                  className={`${styles.selectButton} ${!isAffordable ? styles.disabled : ''}`}
                  disabled={!isAffordable}
                >
                  {isAffordable ? 'Play Now' : '💰 Insufficient Funds'}
                </button>
              </div>


            </div>
          );
        })}
      </div>



      <div className={styles.balanceInfo}>
        <div className={styles.currentBalance}>
          Current Balance: <span className={styles.balanceAmount}>{balance} coins</span>
        </div>
      </div>
    </div>
  );
} 