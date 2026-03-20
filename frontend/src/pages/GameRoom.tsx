// import React from "react";
// import { useGameStore, GameStatus } from "../store/useGameStore";
// import GameGrid from "../components/GameGrid";
// import ScoreBoard from "../components/ScoreBoard";
// import GameOverModal from "../components/GameOverModal";
// import { motion } from "framer-motion";
// import { Share2, Info, Users, Clock, Loader2, Bomb } from "lucide-react";
// import { useSocket } from "../context/SocketContext";

// const GameRoom: React.FC = () => {
//   const { roomId, status, bombCount, players, turnPlayerId, playerId } = useGameStore();
//   const { leaveRoom } = useSocket();

//   console.log('GameRoom State:', { roomId, status, turnPlayerId, playerId });

//   const isMyTurn = turnPlayerId === playerId;
//   console.log('Is My Turn?', isMyTurn, 'turnPlayerId:', turnPlayerId, 'playerId:', playerId);
//     if (roomId) {
//       navigator.clipboard.writeText(roomId);
//       alert("Room code copied to clipboard!");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-dark text-white p-4 md:p-8 flex flex-col items-center">
//       <header className="w-full max-w-6xl flex items-center justify-between mb-12 glass p-4 rounded-2xl">
//         <div className="flex items-center gap-4">
//           <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
//             <Bomb className="w-6 h-6 text-primary" />
//           </div>
//           <div>
//             <div className="flex items-center gap-2">
//               <h1 className="text-xl font-black italic uppercase tracking-tighter">
//                 STAKE MINES
//               </h1>
//               <span className="bg-primary/10 px-2 py-0.5 rounded text-[10px] font-bold text-primary uppercase border border-primary/20">
//                 LIVE
//               </span>
//             </div>
//             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
//               Multiplayer Arena
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-6">
//           <div className="hidden md:flex flex-col items-end">
//             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">
//               ARENA CODE
//             </span>
//             <button
//               onClick={copyRoomId}
//               className="flex items-center gap-3 bg-dark-lighter/50 hover:bg-dark-lighter border border-white/5 px-4 py-2 rounded-xl transition-all active:scale-95 group"
//             >
//               <span className="font-mono font-bold text-lg text-primary tracking-widest">
//                 {roomId}
//               </span>
//               <Share2 className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
//             </button>
//           </div>
//           <button
//             onClick={leaveRoom}
//             className="bg-accent-bomb/10 hover:bg-accent-bomb/20 border border-accent-bomb/20 p-3 px-5 rounded-xl transition-all flex items-center gap-2 font-black text-xs text-accent-bomb uppercase tracking-widest"
//           >
//             ABANDON
//           </button>
//         </div>
//       </header>

//       <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
//         <section className="space-y-6">
//           <div className="flex items-center justify-between px-6 py-4 glass rounded-2xl relative overflow-hidden">
//             <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse" />
//                 <Clock className="w-5 h-5 text-primary relative" />
//               </div>
//               <span className="font-black uppercase tracking-[0.15em] text-sm">
//                 {status === GameStatus.WAITING
//                   ? "Awaiting Opponent"
//                   : "Battle in Progress"}
//               </span>
//             </div>
//             <div className="flex items-center gap-3 bg-dark-lighter/50 px-4 py-2 rounded-xl border border-white/5">
//               <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
//                 MINES AT STAKE:
//               </span>
//               <span className="text-accent-bomb font-black text-lg leading-none">
//                 {bombCount || "??"}
//               </span>
//             </div>
//           </div>

//           <div className="relative glass p-2 rounded-[2.5rem] shadow-2xl">
//             {status === GameStatus.WAITING && (
//               <div className="absolute inset-0 bg-dark/40 backdrop-blur-md z-10 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center">
//                 <div className="relative mb-8">
//                   <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
//                   <Users className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
//                 </div>
//                 <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-3">
//                   INVITE CHALLENGER
//                 </h3>
//                 <p className="text-gray-400 max-w-xs mb-8 font-medium">
//                   The arena is ready. Share your code to begin the high-stakes
//                   battle.
//                 </p>
//                 <button
//                   onClick={copyRoomId}
//                   className="bg-primary hover:bg-primary-hover text-dark font-black py-4 px-10 rounded-2xl transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-primary/20"
//                 >
//                   COPY ARENA CODE
//                 </button>
//               </div>
//             )}
//             <div className="bg-dark-lighter/30 rounded-[2rem] p-4 md:p-8">
//               <GameGrid />
//             </div>
//           </div>
//         </section>

//         <aside className="space-y-6 sticky top-8">
//           <div className="glass p-8 rounded-3xl relative overflow-hidden">
//             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
//             <div className="flex items-center justify-between mb-8">
//               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
//                 BATTLE STATS
//               </h3>
//               <div className="flex gap-1">
//                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
//                 <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
//                 <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
//               </div>
//             </div>
//             <ScoreBoard />
//           </div>

//           <div className="glass p-6 rounded-2xl border-white/5">
//             <div className="flex items-center gap-3 text-gray-500 mb-4">
//               <Info className="w-4 h-4" />
//               <span className="text-[10px] font-bold uppercase tracking-widest">
//                 How to play
//               </span>
//             </div>
//             <p className="text-[11px] leading-relaxed text-gray-400 font-medium">
//               Take turns revealing tiles. Gems increase your score, while
//               hitting a <span className="text-accent-bomb font-bold">MINE</span>{" "}
//               ends the battle immediately. The player with the highest score
//               wins.
//             </p>
//           </div>
//         </aside>
//       </main>

//       <GameOverModal />
//     </div>
//   );
// };

// export default GameRoom;

import React from "react";
import { useGameStore, GameStatus } from "../store/useGameStore";
import GameGrid from "../components/GameGrid";
import ScoreBoard from "../components/ScoreBoard";
import GameOverModal from "../components/GameOverModal";
import { Share2, Info, Users, Clock, Bomb } from "lucide-react";
import { useSocket } from "../context/SocketContext";

const GameRoom: React.FC = () => {
  const { roomId, status, bombCount, turnPlayerId, playerId } =
    useGameStore();
  const { leaveRoom } = useSocket();

  console.log("GameRoom State:", { roomId, status, turnPlayerId, playerId });

  const isMyTurn = turnPlayerId === playerId;
  console.log(
    "Is My Turn?",
    isMyTurn,
    "turnPlayerId:",
    turnPlayerId,
    "playerId:",
    playerId,
  );

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      alert("Room code copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white p-4 md:p-8 flex flex-col items-center">
      <header className="w-full max-w-6xl flex items-center justify-between mb-12 glass p-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-xl border border-primary/20">
            <Bomb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black italic uppercase tracking-tighter">
                STAKE MINES
              </h1>
              <span className="bg-primary/10 px-2 py-0.5 rounded text-[10px] font-bold text-primary uppercase border border-primary/20">
                LIVE
              </span>
            </div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Multiplayer Arena
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">
              ARENA CODE
            </span>
            <button
              onClick={copyRoomId}
              className="flex items-center gap-3 bg-dark-lighter/50 hover:bg-dark-lighter border border-white/5 px-4 py-2 rounded-xl transition-all active:scale-95 group"
            >
              <span className="font-mono font-bold text-lg text-primary tracking-widest">
                {roomId}
              </span>
              <Share2 className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
            </button>
          </div>
          <button
            onClick={leaveRoom}
            className="bg-accent-bomb/10 hover:bg-accent-bomb/20 border border-accent-bomb/20 p-3 px-5 rounded-xl transition-all flex items-center gap-2 font-black text-xs text-accent-bomb uppercase tracking-widest"
          >
            ABANDON
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <section className="space-y-6">
          <div className="flex items-center justify-between px-6 py-4 glass rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse" />
                <Clock className="w-5 h-5 text-primary relative" />
              </div>
              <span className="font-black uppercase tracking-[0.15em] text-sm">
                {status === GameStatus.WAITING
                  ? "Awaiting Opponent"
                  : "Battle in Progress"}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-dark-lighter/50 px-4 py-2 rounded-xl border border-white/5">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                MINES AT STAKE:
              </span>
              <span className="text-accent-bomb font-black text-lg leading-none">
                {bombCount || "??"}
              </span>
            </div>
          </div>

          <div className="relative glass p-2 rounded-[2.5rem] shadow-2xl">
            {status === GameStatus.WAITING && (
              <div className="absolute inset-0 bg-dark/40 backdrop-blur-md z-10 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                  <Users className="w-10 h-10 text-primary absolute inset-0 m-auto animate-pulse" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-3">
                  INVITE CHALLENGER
                </h3>
                <p className="text-gray-400 max-w-xs mb-8 font-medium">
                  The arena is ready. Share your code to begin the high-stakes
                  battle.
                </p>
                <button
                  onClick={copyRoomId}
                  className="bg-primary hover:bg-primary-hover text-dark font-black py-4 px-10 rounded-2xl transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                  COPY ARENA CODE
                </button>
              </div>
            )}
            <div className="bg-dark-lighter/30 rounded-[2rem] p-4 md:p-8">
              <GameGrid />
            </div>
          </div>
        </section>

        <aside className="space-y-6 sticky top-8">
          <div className="glass p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                BATTLE STATS
              </h3>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
            </div>
            <ScoreBoard />
          </div>

          <div className="glass p-6 rounded-2xl border-white/5">
            <div className="flex items-center gap-3 text-gray-500 mb-4">
              <Info className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                How to play
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-400 font-medium">
              Take turns revealing tiles. Gems increase your score, while
              hitting a <span className="text-accent-bomb font-bold">MINE</span>{" "}
              ends the battle immediately. The player with the highest score
              wins.
            </p>
          </div>
        </aside>
      </main>

      <GameOverModal />
    </div>
  );
};

export default GameRoom;
