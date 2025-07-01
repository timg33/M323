import styles from "./styles/page.module.css";
import Link from "next/link";

// Functional Programming: Pure function to get random feature highlight
const getRandomFeature = (): string => {
  const features = [
    "Smart probability calculations",
    "Dynamic scoring system", 
    "Professional card animations",
    "Real-time balance tracking"
  ];
  return features[Math.floor(Math.random() * features.length)];
};

// Functional Programming: Higher-order function for creating feature objects
const createFeature = (title: string, description: string, icon: string) => ({
  title,
  description,
  icon
});

// Functional Programming: Pure function using function composition
const gameFeatures = [
  createFeature(
    "🎯 Smart Betting", 
    "Advanced probability calculations show your odds in real-time, helping you make informed decisions.",
    "🎯"
  ),
  createFeature(
    "💎 Dynamic Scoring", 
    "Earn more points for riskier bets. Low probability wins = higher rewards!",
    "💎"
  ),
  createFeature(
    "🏆 Leaderboards", 
    "Compete with others and track your highest scores on our global leaderboard.",
    "🏆"
  ),
  createFeature(
    "🎨 Casino Experience", 
    "Immersive graphics and animations that bring the casino floor to your screen.",
    "🎨"
  )
];

export default function Home() {
  return (
    <div className={styles.page}>
      <h1 className={`${styles.title} neon-text`}>
        Higher Lower
      </h1>
      
      <p className={styles.subtitle}>
        The Ultimate Card Prediction Casino Game
      </p>
      
      <Link href="/game">
        <button className={`${styles.playButton} pulse`}>
          🎲 Start Playing 🎲
        </button>
      </Link>
      
      <div className={styles.gameInfo}>
        <h3>How to Play</h3>
        <p>
          Welcome to the most thrilling card prediction game! Draw a card, study the odds, 
          and bet on whether the next card will be higher or lower. The riskier your bet, 
          the bigger your potential payout. Will you play it safe or go all-in for the jackpot?
        </p>
        
        <div className={styles.features}>
          {gameFeatures.map((feature, index) => (
            <div key={index} className={`${styles.feature} slide-in`}>
              <h4>{feature.title}</h4>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
