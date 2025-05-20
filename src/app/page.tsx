import styles from "./styles/page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Higher Lower</h1>
      <Link href="/game">
        <button className={styles.playButton}>Play</button>
      </Link>
    </div>
  );
}
