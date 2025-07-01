import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Menu from "./components/menu";
import { BalanceProvider } from "./context/balanceContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Higher Lower Casino | The Ultimate Card Prediction Game",
  description: "Experience the thrill of Las Vegas from home! Predict card outcomes, calculate odds, and win big in our premium casino card game. Features real-time probability calculations, professional graphics, and competitive leaderboards.",
  keywords: "casino game, card prediction, higher lower, gambling game, probability game, casino cards, leaderboard, casino online",
  authors: [{ name: "Higher Lower Casino" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Higher Lower Casino - Premium Card Prediction Game",
    description: "The ultimate casino card prediction experience with real-time odds and professional graphics",
    type: "website",
    images: [
      {
        url: "/casino-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Higher Lower Casino Game Preview"
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={{ height: '100%', overflow: 'hidden' }}>
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ height: '100%', overflow: 'hidden' }}>
        <BalanceProvider>
          <Menu />
          {children}
        </BalanceProvider>
      </body>
    </html>
  );
}
