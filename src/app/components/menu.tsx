"use client";

import Link from "next/link";
import styles from "../styles/menu.module.css";
import { usePathname } from "next/navigation";
import { useBalance } from "../context/balanceContext";

// Functional Programming: Pure function to format balance display
const formatBalance = (balance: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(balance);
};

// Functional Programming: Higher-order function for creating navigation items
const createNavItem = (href: string, label: string, icon?: string) => ({
  href,
  label,
  icon,
  fullLabel: icon ? `${icon} ${label}` : label
});

// Functional Programming: Pure function using function composition
const navigationItems = [
  createNavItem("/", "Home", "🏠"),
  createNavItem("/game", "Game", "🎮"),
  createNavItem("/highscores", "Leaderboard", "🏆"),
  createNavItem("/wallet", "Wallet", "🏦"),
  createNavItem("/analysis", "Analysis", "📊")
];

export default function Menu() {
  const pathname = usePathname();
  const { balance } = useBalance();

  // Functional Programming: Pure function to determine if link is active
  const isActiveLink = (href: string): boolean => pathname === href;

  return (
    <nav className={styles.menu}>
      <div className={styles.navigation}>
        {navigationItems.map((item, index) => (
          <Link 
            key={index}
            href={item.href} 
            className={`${styles.menuLink} ${isActiveLink(item.href) ? styles.active : ""}`}
          >
            {item.fullLabel}
          </Link>
        ))}
      </div>
      
      <div className={styles.balanceSection}>
        <Link href="/wallet" className={styles.balanceLink}>
          <div className={styles.balance}>
            💰 {formatBalance(balance)}
          </div>
        </Link>
      </div>
    </nav>
  );
}
