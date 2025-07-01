"use client";

import Link from "next/link";
import styles from "../styles/menu.module.css";
import { usePathname } from "next/navigation";
import { useBalance } from "../context/balanceContext";

// Funktionales Programmieren: Reine Funktion zur Formatierung der Guthaben-Anzeige
const formatBalance = (balance: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(balance);
};

// Funktionales Programmieren: Höhere Funktion zur Erstellung von Navigationselementen
const createNavItem = (href: string, label: string, icon?: string) => ({
  href,
  label,
  icon,
  fullLabel: icon ? `${icon} ${label}` : label
});

// Funktionales Programmieren: Reine Funktion mit Funktionskomposition
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

  // Funktionales Programmieren: Reine Funktion zur Bestimmung ob Link aktiv ist
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
