import React, { useEffect, useRef, useState } from "react";
import { useGameStore, GameStatus } from "../store/useGameStore";
import { useSocket } from "../context/SocketContext";
import {
  Send,
  Eraser,
  Clock,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

const ScribbleBoard: React.FC = () => {
  const { makeMove, socket } = useSocket();
  const {
    turnPlayerId,
    playerId,
    status,
    chatHistory,
    secretWord,
    wordHint,
    roundEndTime,
    players,
    currentCycle,
    maxCycles,
  } = useGameStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [guess, setGuess] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [activeTool, setActiveTool] = useState<"pen" | "eraser">("pen");

  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const isDrawer = turnPlayerId === playerId;
  const currentDrawer = players.find((p) => p.id === turnPlayerId);
  const me = players.find((p) => p.id === playerId);
  const hasGuessed = me?.hasGuessed;

  const colors = [
    "#000000",
    "#4B5563",
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
    "#ffffff",
  ];

  // useEffect(() => {
  //   const updateTimer = () => {
  //     if (roundEndTime && status === GameStatus.PLAYING) {
  //       const remaining = Math.max(0, Math.floor((roundEndTime - Date.now()) / 1000));
  //       setTimeLeft(remaining);
  //       if (remaining === 0 && isDrawer) {
  //         makeMove(undefined, { type: 'time_up' });
  //       }
  //     }
  //   };
  //   updateTimer();
  //   const interval = setInterval(updateTimer, 1000);
  //   return () => clearInterval(interval);
  // }, [roundEndTime, status, isDrawer, makeMove]);

  const hasSentTimeUpRef = useRef(false);

  useEffect(() => {
    // reset guard when a new round starts (based on roundEndTime)
    hasSentTimeUpRef.current = false;
  }, [roundEndTime]);

  useEffect(() => {
    const updateTimer = () => {
      if (roundEndTime && status === GameStatus.PLAYING) {
        const remaining = Math.max(
          0,
          Math.floor((roundEndTime - Date.now()) / 1000),
        );

        setTimeLeft(remaining);

        if (remaining === 0 && isDrawer && !hasSentTimeUpRef.current) {
          hasSentTimeUpRef.current = true; // ✅ prevent duplicates
          makeMove(undefined, { type: "time_up" });
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [roundEndTime, status, isDrawer, makeMove]);

  // Clear canvas when round changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [turnPlayerId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const onDraw = (data: any) => {
      if (data.clear) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.beginPath();
      ctx.moveTo(data.x0, data.y0);
      ctx.lineTo(data.x1, data.y1);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.closePath();
    };

    socket?.on("scribble_draw", onDraw);
    return () => {
      socket?.off("scribble_draw", onDraw);
    };
  }, [socket]);

  const drawLine = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    col: string,
    sz: number,
    emit = true,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = col;
    ctx.lineWidth = sz;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.closePath();

    if (!emit) return;

    socket?.emit("scribble_draw", {
      x0,
      y0,
      x1,
      y1,
      color: col,
      size: sz,
    });
  };

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height),
      };
    } else {
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    }
  };

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer || status !== GameStatus.PLAYING) return;
    setIsDrawing(true);
    lastPos.current = getPointerPos(e);
  };

  const onMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isDrawer || !lastPos.current) return;
    const pos = getPointerPos(e);
    const drawColor = activeTool === "eraser" ? "#ffffff" : color;
    drawLine(
      lastPos.current.x,
      lastPos.current.y,
      pos.x,
      pos.y,
      drawColor,
      brushSize,
      true,
    );
    lastPos.current = pos;
  };

  const onMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      socket?.emit("scribble_draw", { clear: true });
      makeMove(undefined, { type: "clear_canvas" });
    }
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !guess.trim() ||
      isDrawer ||
      status !== GameStatus.PLAYING ||
      hasGuessed
    )
      return;
    makeMove(undefined, { type: "guess", guess: guess.trim() });
    setGuess("");
  };

  const handleStartNextRound = () => {
    makeMove(undefined, { type: "next_round" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              {isDrawer ? "YOUR SECRET WORD" : "GUESS THE WORD"}
            </span>
            {hasGuessed && (
              <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-0.5 rounded uppercase border border-primary/20 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Correct
              </span>
            )}
          </div>
          <div className="text-4xl font-black italic tracking-tighter text-white uppercase flex gap-2">
            {isDrawer
              ? secretWord
              : wordHint?.split(" ").map((char, i) => (
                  <span
                    key={i}
                    className={
                      char === "_"
                        ? "border-b-4 border-primary/40 min-w-[24px] text-center"
                        : ""
                    }
                  >
                    {char === "_" ? "" : char}
                  </span>
                ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
              CURRENT DRAWER
            </div>
            <div className="text-sm font-black text-white uppercase">
              {isDrawer ? "You" : currentDrawer?.name}
            </div>
          </div>

          <div className="h-12 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex flex-col items-end">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
              CYCLE {currentCycle}/{maxCycles}
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-colors ${
                timeLeft <= 10
                  ? "border-red-500/50 bg-red-500/10 text-red-500"
                  : "border-primary/30 bg-primary/10 text-primary"
              }`}
            >
              <Clock
                className={`w-5 h-5 ${timeLeft <= 10 ? "animate-pulse" : ""}`}
              />
              <span className="font-mono font-black text-xl">{timeLeft}s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 h-[650px]">
        {/* Main Canvas Area */}
        <div className="relative group bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-white/5">
          {status === "round_ended" && (
            <div className="absolute inset-0 bg-dark/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass p-12 rounded-[3rem] border-primary/30 shadow-primary/20"
              >
                <h2 className="text-5xl font-black italic uppercase tracking-tighter text-primary mb-4">
                  ROUND OVER
                </h2>
                <p className="text-xl font-bold text-gray-400 mb-2 uppercase tracking-widest">
                  The word was
                </p>
                <p className="text-4xl font-black text-white mb-10 bg-white/5 py-4 px-8 rounded-2xl border border-white/10 uppercase tracking-[0.2em]">
                  {secretWord}
                </p>
                {isDrawer && (
                  <button
                    onClick={handleStartNextRound}
                    className="bg-primary hover:bg-primary-hover text-dark font-black py-5 px-12 rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary/30 uppercase tracking-widest text-lg"
                  >
                    NEXT ROUND
                  </button>
                )}
                {!isDrawer && (
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] animate-pulse">
                    Waiting for drawer...
                  </p>
                )}
              </motion.div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={1000}
            height={750}
            className={`w-full h-full bg-white transition-opacity ${isDrawer && status === GameStatus.PLAYING ? "cursor-crosshair" : "cursor-default"}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onMouseDown}
            onTouchMove={onMouseMove}
            onTouchEnd={onMouseUp}
          />

          {/* Drawer Tools Overlay */}
          {isDrawer && status === GameStatus.PLAYING && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-in slide-in-from-bottom duration-500">
              <div className="glass p-3 rounded-[2rem] flex items-center gap-4 border-white/10 shadow-2xl">
                {/* Tools */}
                <div className="flex bg-dark/40 p-1.5 rounded-2xl gap-1 border border-white/5">
                  <button
                    onClick={() => setActiveTool("pen")}
                    className={`p-3 rounded-xl transition-all ${activeTool === "pen" ? "bg-primary text-dark shadow-lg" : "text-gray-400 hover:bg-white/5"}`}
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveTool("eraser")}
                    className={`p-3 rounded-xl transition-all ${activeTool === "eraser" ? "bg-primary text-dark shadow-lg" : "text-gray-400 hover:bg-white/5"}`}
                  >
                    <Eraser className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-10 w-[1px] bg-white/10" />

                {/* Colors */}
                <div className="flex gap-2 p-1.5 overflow-x-auto max-w-[200px] no-scrollbar">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setColor(c);
                        setActiveTool("pen");
                      }}
                      className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-90 ${color === c && activeTool === "pen" ? "border-primary scale-110" : "border-white/10"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <div className="h-10 w-[1px] bg-white/10" />

                {/* Brush Size */}
                <div className="flex items-center gap-3 px-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-24 accent-primary"
                  />
                  <div className="w-5 h-5 rounded-full bg-gray-400" />
                </div>

                <div className="h-10 w-[1px] bg-white/10" />

                <button
                  onClick={clearCanvas}
                  className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/20 group"
                >
                  <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
              <div className="bg-dark/80 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-white/5 shadow-xl">
                Drawing Tool Active:{" "}
                <span className="text-primary">{activeTool.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat / Guesses Section */}
        <div className="flex flex-col bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg border border-primary/20">
                <Send className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">
                  LIVE FEED
                </h3>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                  Submit your guesses
                </p>
              </div>
            </div>
            {hasGuessed && (
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-dark/20">
            {chatHistory?.map((chat, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={idx}
                className={`flex flex-col gap-1 ${chat.isSystem ? "items-center my-4" : "items-start"}`}
              >
                {chat.isSystem ? (
                  <div
                    className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      chat.correct
                        ? "bg-primary/20 text-primary border-primary/30 shadow-lg shadow-primary/10"
                        : "bg-white/5 text-gray-500 border-white/10"
                    }`}
                  >
                    {chat.sender} {chat.text}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 max-w-[90%]">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">
                      {chat.sender}
                    </span>
                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10 text-sm font-medium text-gray-300 shadow-sm">
                      {chat.text}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <form
            onSubmit={handleGuess}
            className="p-6 bg-white/5 border-t border-white/10 flex gap-3"
          >
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder={
                isDrawer || hasGuessed || status !== GameStatus.PLAYING
                  ? "WAITING..."
                  : "TYPE GUESS..."
              }
              disabled={isDrawer || hasGuessed || status !== GameStatus.PLAYING}
              className="flex-1 bg-dark/50 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all font-bold placeholder:text-gray-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={
                isDrawer ||
                hasGuessed ||
                !guess.trim() ||
                status !== GameStatus.PLAYING
              }
              className="bg-primary hover:bg-primary-hover text-dark p-4 rounded-2xl disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScribbleBoard;
