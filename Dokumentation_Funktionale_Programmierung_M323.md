# Dokumentation: Funktionale Programmierung im Higher-Lower Casino Spiel
**Modul M323 - Funktional programmieren**  
**Projekt: Higher-Lower Gambling Game mit Casino-Funktionen**  
**Entwickler: Tim Gossweiler (Einzelarbeit)**  
**Datum: 01.07.2025**

---

## 1.1 Kompetenznachweis - Angewandte Funktionale Programmierung

### Deklarierte Kompetenzstufe
Als Einzelentwickler befinde ich mich nach der Umsetzung dieses Projekts auf **Stufe 2-3** der Kompetenzmatrix, da ich alle grundlegenden und fortgeschrittenen Konzepte der funktionalen Programmierung erfolgreich implementiert habe.

### Erreichte Kompetenzen nach Kompetenzmatrix

#### **Stufe 1 - Grundlegende Konzepte**

**AF1/AG1/AE1 - Immutable Values:**
- ✅ **Vollständig erreicht**: Implementierung von unveränderlichen Datenstrukturen und Zustandsmanagement
- ✅ **Praktische Anwendung**: Verwendung des Spread-Operators für unveränderliche Updates
- ✅ **Vergleich zu anderen Paradigmen**: Klare Abgrenzung zu mutativen Objekten

**BG1/BF1/BE1 - Imperative vs. Deklarative Programmierung:**
- ✅ **Vollständig erreicht**: Transformation von imperativen Anforderungen in deklarative Lösungen
- ✅ **Praktische Umsetzung**: Fokus auf "Was" statt "Wie" bei der Problemlösung
- ✅ **Design-Transfer**: Erfolgreiche Übertragung imperativer Designs in funktionale Ansätze

**BG2/BF2/BE2 - Functional Design:**
- ✅ **Vollständig erreicht**: Anwendung aller Elemente des Functional Designs
- ✅ **Praktische Implementierung**: Immutable data types, composable operators, constructors
- ✅ **Design-Entwicklung**: Eigenes Functional Design für komplexe Spiellogik

#### **Stufe 2 - Fortgeschrittene Anwendung**

**C1F/C1E/C1G - Algorithmische Zerlegung:**
- ✅ **Vollständig erreicht**: Aufteilen komplexer Algorithmen in funktionale Teilstücke
- ✅ **Praktische Umsetzung**: Modulare Spiellogik mit zusammenhängenden Funktionen

**C2F/C2E/C2G - Higher-Order Functions:**
- ✅ **Vollständig erreicht**: Extensive Verwendung von Higher-Order Functions
- ✅ **Objektbehandlung**: Funktionen als First-Class Citizens behandelt
- ✅ **Komplexe Problemlösung**: Sauberer und effizienter Code durch HOFs

**C3F/C3E/C3G - Lambda-Ausdrücke:**
- ✅ **Vollständig erreicht**: Verwendung von Arrow Functions für alle Operationen
- ✅ **Mehrere Argumente**: Komplexe Lambda-Ausdrücke mit mehreren Parametern
- ✅ **Programmfluss-Steuerung**: Sortierung und Filterung durch Lambda-Ausdrücke

**C4F/C4E/C4G - Map, Filter, Reduce:**
- ✅ **Vollständig erreicht**: Einzelne und kombinierte Anwendung aller drei Funktionen
- ✅ **Komplexe Datenverarbeitung**: Aggregation und Transformation von Spielerdaten
- ✅ **Fortgeschrittene Manipulationen**: Mehrstufige Datenverarbeitungspipelines

#### **Stufe 3-4 - Optimierung und Refactoring**

**DE1/DF1/DG1 - Refactoring-Techniken:**
- ✅ **Erreicht**: Anwendung von Refactoring-Techniken für bessere Lesbarkeit
- ✅ **Code-Optimierung**: Verbesserung bestehender funktionaler Strukturen
- ✅ **Auswirkungsanalyse**: Sicherstellung der Funktionalität nach Refactoring

**DG2/DF2/DE2 - Performance-Optimierung:**
- ✅ **Erreicht**: Implementierung effizienter Algorithmen und Datenstrukturen
- ✅ **Optimierungsmaßnahmen**: Verwendung von Memoization und Pure Functions für Performance

---

## 1.2 Reflexion - Einsatz der Funktionalen Programmierung

### Angewendete Prinzipien der Funktionalen Programmierung

#### **1. Pure Functions (Reine Funktionen)**

**Implementierung:**
Durch das Projekt hindurch habe ich konsequent reine Funktionen implementiert, die bei gleichen Eingaben immer dieselben Ausgaben produzieren und keine Seiteneffekte haben.

**Beispiel aus dem Code:**

```typescript
// Reine Funktion für Kartenwert-Zuordnung
const getCardValue = (value: string): number => {
  const cardValueMap: Record<string, number> = {
    "ACE": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, 
    "8": 8, "9": 9, "10": 10, "JACK": 11, "QUEEN": 12, "KING": 13,
  };
  return cardValueMap[value] || 0;
};

// Reine Funktion für Wahrscheinlichkeitsberechnung
const calculateWinProbability = (currentValue: number, isHigherGuess: boolean): number => {
  const totalCards = 13;
  const favorableOutcomes = isHigherGuess 
    ? totalCards - currentValue 
    : currentValue - 1;
  return Math.max(0, Math.round((favorableOutcomes / totalCards) * 100));
};
```

**Nutzen:** Diese Funktionen sind vollständig vorhersagbar, testbar und können ohne Kontext verwendet werden, was die Wartbarkeit erheblich verbessert.

#### **2. Immutable Values (Unveränderliche Werte)**

**Implementierung:**
Alle Zustandsänderungen werden durch die Erstellung neuer Objekte anstatt der Mutation bestehender Objekte durchgeführt.

**Beispiel aus dem Code:**

```typescript
// Unveränderliche Aktualisierung des Spielzustands
const updateGameState = useCallback((updates: Partial<GameState>) => {
  setGameState(prevState => ({ ...prevState, ...updates }));
}, []);

// Reine Funktion zur unveränderlichen Belohnungsberechnung
const applyHouseEdge = (baseReward: number, houseEdgePercent: number = 2.5): number => {
  return Math.floor(baseReward * (1 - houseEdgePercent / 100));
};
```

**Nutzen:** Verhindert unbeabsichtigte Seiteneffekte und macht den Datenfluss nachvollziehbar. Debugging wird erheblich vereinfacht.

#### **3. Higher-Order Functions (Funktionen höherer Ordnung)**

**Implementierung:**
Extensive Verwendung von Funktionen, die andere Funktionen als Parameter nehmen oder zurückgeben.

**Beispiel aus dem Code:**

```typescript
// Higher-Order Function für Sortierfunktionen
const createSorter = <T,>(key: keyof T, direction: 'asc' | 'desc' = 'desc') => 
  (a: T, b: T): number => {
    const aVal = a[key];
    const bVal = b[key];
    const modifier = direction === 'desc' ? -1 : 1;
    
    if (aVal < bVal) return modifier;
    if (aVal > bVal) return -modifier;
    return 0;
  };

// Higher-Order Function für Belohnungskalkulatoren
const createRewardCalculator = (
  basePayout: number,
  houseEdge: number,
  bonusMultiplier: (streak: number, multiplier: number) => number = () => 1
): RewardCalculator => {
  return (probability: number, streak: number, multiplier: number): number => {
    const riskReward = Math.floor(basePayout * (100 / Math.max(probability, 1)));
    const bonusReward = riskReward * bonusMultiplier(streak, multiplier);
    const houseAdjustedReward = applyHouseEdge(bonusReward, houseEdge);
    return Math.max(1, addRewardVariance(houseAdjustedReward));
  };
};
```

**Nutzen:** Ermöglicht hochgradig wiederverwendbaren und konfigurierbaren Code. Verschiedene Spielvarianten können mit derselben Grundlogik implementiert werden.

#### **4. Function Composition (Funktionskomposition)**

**Implementierung:**
Kombination einfacher Funktionen zu komplexeren Operationen.

**Beispiel aus dem Code:**

```typescript
// Funktionskomposition für Datenverarbeitung
const getFilteredAndSortedScores = (): HighscoreEntry[] => {
  const sorter = createSorter<HighscoreEntry>('score', 'desc');
  return filterScoresByDate(highscores, filter)
    .sort(sorter)
    .slice(0, 10);
};

// Currying für Vermutungsvalidierung
const validateGuess = (prevValue: number) => 
  (nextValue: number) => 
    (isHigherGuess: boolean): boolean => 
      isHigherGuess ? nextValue > prevValue : nextValue < prevValue;
```

**Nutzen:** Erlaubt es, komplexe Logik aus einfachen, testbaren Bausteinen aufzubauen.

#### **5. Map, Filter, Reduce Operations**

**Implementierung:**
Verwendung funktionaler Array-Methoden für Datenverarbeitung.

**Beispiel aus dem Code:**

```typescript
// Map-Operation für Datenverarbeitung
const processedScores = scores.map((score: any, index: number) => ({
  id: score.id || Date.now() + index,
  score: score.score || 0,
  date: score.date || new Date().toISOString(),
  playerName: score.playerName || `Player ${index + 1}`
}));

// Filter-Operation für Datumsfilterung
const filterScoresByDate = (scores: HighscoreEntry[], filterType: string): HighscoreEntry[] => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return scores.filter(score => {
    const scoreDate = new Date(score.date);
    switch (filterType) {
      case 'today': return scoreDate >= todayStart;
      case 'week': return scoreDate >= weekStart;
      default: return true;
    }
  });
};

// Reduce-Operation für Statistikberechnung
const getStatistics = () => {
  const scores = highscores.map(h => h.score);
  return {
    totalGames: scores.length,
    highestScore: Math.max(...scores, 0),
    averageScore: scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
      : 0,
    totalPlayers: new Set(highscores.map(h => h.playerName)).size
  };
};
```

**Nutzen:** Deklarative Datenverarbeitung, die klar ausdrückt, was gemacht werden soll, ohne sich um die Details der Implementierung zu kümmern.

### Herausforderungen und Vorteile

#### **Herausforderungen:**

1. **Lernkurve:** Die Umstellung von imperativer zu funktionaler Denkweise erforderte anfangs bewusste Anstrengung
2. **Performance-Überlegungen:** Bei der Erstellung vieler unveränderlicher Objekte musste auf Performance geachtet werden
3. **Debugging:** Das Verfolgen von Datenflüssen durch funktionale Transformationen war zunächst ungewohnt
4. **State Management:** Die Verwaltung komplexer Spielzustände ohne Mutation erforderte durchdachte Architekturen

#### **Vorteile:**

1. **Vorhersagbarkeit:** Pure Functions machen den Code vollständig vorhersagbar und testbar
2. **Wartbarkeit:** Unveränderliche Datenstrukturen reduzieren Bugs drastisch
3. **Wiederverwendbarkeit:** Higher-Order Functions ermöglichen hochgradig modularen Code
4. **Parallelisierbarkeit:** Funktionale Ansätze sind inherent thread-safe
5. **Code-Qualität:** Deklarative Programmierung macht Code selbst-dokumentierend

### Konkrete Beispiele aus dem Projekt

#### **Beispiel 1: Sortierfunktion für Highscores**

**Problem:** Highscores müssen nach verschiedenen Kriterien (Score, Datum) sortiert werden können.

**Funktionale Lösung:**
```typescript
const createSorter = <T,>(key: keyof T, direction: 'asc' | 'desc' = 'desc') => 
  (a: T, b: T): number => {
    const aVal = a[key];
    const bVal = b[key];
    const modifier = direction === 'desc' ? -1 : 1;
    
    if (aVal < bVal) return modifier;
    if (aVal > bVal) return -modifier;
    return 0;
  };

// Verwendung:
const scoreSorter = createSorter<HighscoreEntry>('score', 'desc');
const sortedScores = highscores.sort(scoreSorter);
```

**Warum diese Lösung:** Die Higher-Order Function `createSorter` erstellt wiederverwendbare Sortierfunktionen für beliebige Objekttypen und Eigenschaften. Dies eliminiert Code-Duplikation und macht die Sortierlogik hochgradig konfigurierbar.

#### **Beispiel 2: Filterfunktion für Zeiträume**

**Problem:** Highscores müssen nach verschiedenen Zeiträumen (heute, diese Woche, alle Zeit) gefiltert werden.

**Funktionale Lösung:**
```typescript
const filterScoresByDate = (scores: HighscoreEntry[], filterType: string): HighscoreEntry[] => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return scores.filter(score => {
    const scoreDate = new Date(score.date);
    switch (filterType) {
      case 'today': return scoreDate >= todayStart;
      case 'week': return scoreDate >= weekStart;
      default: return true;
    }
  });
};
```

**Warum diese Lösung:** Die pure Funktion nimmt unveränderliche Eingaben und gibt neue Arrays zurück, ohne die ursprünglichen Daten zu modifizieren. Die Filterlogik ist klar verständlich und testbar.

#### **Beispiel 3: Belohnungssystem mit Function Composition**

**Problem:** Verschiedene Spielvarianten benötigen unterschiedliche Belohnungsberechnungen mit House Edge, Boni und Zufälligkeit.

**Funktionale Lösung:**
```typescript
const createRewardCalculator = (
  basePayout: number,
  houseEdge: number,
  bonusMultiplier: (streak: number, multiplier: number) => number = () => 1
): RewardCalculator => {
  return (probability: number, streak: number, multiplier: number): number => {
    const riskReward = Math.floor(basePayout * (100 / Math.max(probability, 1)));
    const bonusReward = riskReward * bonusMultiplier(streak, multiplier);
    const houseAdjustedReward = applyHouseEdge(bonusReward, houseEdge);
    const finalReward = addRewardVariance(houseAdjustedReward);
    
    return Math.max(1, finalReward);
  };
};

// Verwendung für verschiedene Varianten:
const classicCalculator = createRewardCalculator(8, 2.5, calculateStreakBonus);
const doubleOrNothingCalculator = createRewardCalculator(15, 3.5, doubleOrNothingMultiplier);
```

**Warum diese Lösung:** Function Composition ermöglicht es, komplexe Belohnungslogik aus einfachen, testbaren Funktionen zusammenzusetzen. Jede Spielvariante kann ihre eigene Belohnungsberechnung haben, während die Grundlogik wiederverwendet wird.

### Verbesserung der Codequalität durch Funktionale Programmierung

#### **Lambda-Ausdrücke und Lesbarkeit:**

**Vorher (imperativ):**
```javascript
function processScores(scores) {
  let processedScores = [];
  for (let i = 0; i < scores.length; i++) {
    let score = scores[i];
    if (score.score > 0) {
      processedScores.push({
        id: score.id || Date.now() + i,
        score: score.score,
        formatted: formatScore(score.score)
      });
    }
  }
  return processedScores;
}
```

**Nachher (funktional):**
```typescript
const processScores = (scores: any[]): ProcessedScore[] =>
  scores
    .filter(score => score.score > 0)
    .map((score, index) => ({
      id: score.id || Date.now() + index,
      score: score.score,
      formatted: formatScore(score.score)
    }));
```

**Verbesserungen:**
- **Lesbarkeit:** Die funktionale Version ist selbst-dokumentierend und zeigt klar die Transformation
- **Kürze:** Weniger Boilerplate-Code
- **Sicherheit:** Keine manuellen Schleifenvariablen, die zu Fehlern führen können
- **Testbarkeit:** Jeder Schritt kann isoliert getestet werden

#### **Higher-Order Functions für Wiederverwendbarkeit:**

Die Verwendung von Higher-Order Functions hat die Codequalität dramatisch verbessert:

1. **DRY-Prinzip:** Keine Code-Duplikation mehr bei ähnlichen Operationen
2. **Konfigurierbarkeit:** Funktionen können für verschiedene Anwendungsfälle angepasst werden
3. **Modularity:** Klare Trennung von Geschäftslogik und Implementierungsdetails
4. **Testbarkeit:** Einzelne Funktionsbausteine können isoliert getestet werden

### Fazit

Die konsequente Anwendung funktionaler Programmierkonzepte in diesem Higher-Lower Casino Spiel hat zu einem hochqualitativen, wartbaren und erweiterbaren Codebase geführt. Die Investition in die Lernkurve hat sich durch die deutlich verbesserte Code-Qualität, Testbarkeit und Entwicklungsgeschwindigkeit ausgezahlt.

Das Projekt demonstriert erfolgreich alle Aspekte der Kompetenzmatrix und zeigt, wie funktionale Programmierung in einem realen, komplexen Projekt angewendet werden kann, um sowohl technische als auch geschäftliche Anforderungen zu erfüllen.

---

**Projektumfang:** Ca. 2000 Zeilen TypeScript/React Code mit vollständiger funktionaler Architektur  
**Entwicklungszeit:** 4 Wochen  
**Technologie-Stack:** Next.js, TypeScript, React Hooks, funktionale Programmierkonzepte  
**Repository:** Private Entwicklung mit Git-Versionierung 