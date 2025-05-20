"use client";

import Link from "next/link";
import styles from "../styles/menu.module.css";
import { usePathname } from "next/navigation";
import { useBalance } from "../context/balanceContext";

export default function Menu() {
  const pathname = usePathname();
  const { balance } = useBalance();

  return (
    <nav className={styles.menu}>
      <div>
        <Link href="/" className={pathname === "/" ? styles.active : ""}>
          Home
        </Link>
        <Link href="/game" className={pathname === "/game" ? styles.active : ""}>
          Game
        </Link>
      </div>
      <p>Balance: {balance}</p>
    </nav>
  );
}
