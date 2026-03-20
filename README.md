# Real-time Multiplayer Mines Game

A real-time, turn-based two-player Mines game inspired by Stake. Built with NestJS, React, Socket.io, and Zustand.

## Features

- **Real-time Multiplayer:** Instant state synchronization via WebSockets.
- **Server Authoritative:** Bomb positions and game logic are handled on the server to prevent cheating.
- **Stake-inspired UI:** Dark, gambling-style interface with animations.
- **Turn-based Gameplay:** Players take turns revealing tiles.
- **Win/Loss Conditions:** Instant loss on bomb hit, win on all gems revealed or opponent's bomb hit.
- **Responsive Design:** Optimized for various screen sizes.

## Tech Stack

- **Backend:** NestJS, Socket.io
- **Frontend:** React (Vite), Zustand, TailwindCSS, Framer Motion
- **Icons:** Lucide React

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Getting Started

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start the Application

You'll need two terminals open.

**Terminal 1: Backend**
```bash
cd backend
npm run start:dev
```

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```

### 3. Play the Game

1. Open the frontend URL (usually `http://localhost:5173`) in two different browser windows or tabs.
2. Enter a name in the first window and click **CREATE ROOM**.
3. Copy the **Room Code** shown in the header.
4. Enter a name and the room code in the second window and click the join icon.
5. The game will automatically start once both players have joined.

## Game Rules

- **Grid:** 5x5 (25 boxes).
- **Bombs:** Randomly placed (1-10 per game).
- **Points:** +100 for every gem revealed.
- **Turns:** Switch after every successful gem reveal.
- **Game Over:**
  - If you hit a bomb, you lose instantly.
  - If all gems are revealed, the player with the highest score wins.
