import React, { useEffect, useRef, useState } from 'react';
import { useGameStore, GameStatus } from '../store/useGameStore';
import { useSocket } from '../context/SocketContext';
import { Send, Eraser, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const ScribbleBoard: React.FC = () => {
  const { makeMove, socket } = useSocket();
  const { turnPlayerId, playerId, status, chatHistory, secretWord, wordHint, roundEndTime, players, currentCycle, maxCycles } = useGameStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(3);
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  const lastPos = useRef<{ x: number, y: number } | null>(null);

  const isDrawer = turnPlayerId === playerId;
  const currentDrawer = players.find(p => p.id === turnPlayerId);
  const me = players.find(p => p.id === playerId);
  const hasGuessed = me?.hasGuessed;

  useEffect(() => {
    const updateTimer = () => {
      if (roundEndTime && status === GameStatus.PLAYING) {
        const remaining = Math.max(0, Math.floor((roundEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0 && isDrawer) {
          makeMove(undefined, { type: 'time_up' });
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
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [turnPlayerId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
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
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.closePath();
    };

    socket?.on('scribble_draw', onDraw);
    return () => {
      socket?.off('scribble_draw', onDraw);
    };
  }, [socket]);

  const drawLine = (x0: number, y0: number, x1: number, y1: number, col: string, sz: number, emit = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = col;
    ctx.lineWidth = sz;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.closePath();

    if (!emit) return;

    // Convert to relative coordinates for consistent rendering across different sizes
    const rect = canvas.getBoundingClientRect();
    socket?.emit('scribble_draw', {
      x0: x0 * (canvas.width / rect.width),
      y0: y0 * (canvas.height / rect.height),
      x1: x1 * (canvas.width / rect.width),
      y1: y1 * (canvas.height / rect.height),
      color: col,
      size: sz
    });
  };

  const getPointerPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height)
      };
    } else {
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
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
    drawLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y, color, brushSize, true);
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
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      socket?.emit('scribble_draw', { clear: true });
      makeMove(undefined, { type: 'clear_canvas' });
    }
  };

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || isDrawer || status !== GameStatus.PLAYING || hasGuessed) return;
    makeMove(undefined, { type: 'guess', guess });
    setGuess('');
  };

  const handleStartNextRound = () => {
    makeMove(undefined, { type: 'next_round' });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between glass p-4 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="text-xl font-black italic tracking-widest text-primary uppercase">
            {isDrawer ? secretWord : wordHint}
          </div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {isDrawer ? 'DO NOT DRAW LETTERS' : `Current Drawer: ${currentDrawer?.name || 'Waiting'}`}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            CYCLE {currentCycle}/{maxCycles}
          </div>
          <div className="flex items-center gap-2 bg-dark-lighter/50 px-3 py-1.5 rounded-lg border border-white/5 text-primary">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-black">{timeLeft}s</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 h-[500px]">
        {/* Canvas Area */}
        <div className="flex-1 glass rounded-2xl relative overflow-hidden flex flex-col border border-white/5">
          {status === 'round_ended' && (
            <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-primary mb-2">ROUND OVER</h2>
              <p className="text-lg font-bold text-white mb-6">The word was: <span className="text-accent-bomb">{secretWord}</span></p>
              {isDrawer && (
                <button onClick={handleStartNextRound} className="bg-primary hover:bg-primary-hover text-dark font-black py-3 px-8 rounded-xl transition-all">
                  START NEXT ROUND
                </button>
              )}
              {!isDrawer && <p className="text-xs text-gray-500 font-bold uppercase tracking-widest animate-pulse">Waiting for drawer to start next round...</p>}
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className={`w-full h-full bg-[#1e1e24] ${isDrawer && status === GameStatus.PLAYING ? 'cursor-crosshair' : 'cursor-default'}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onMouseDown}
            onTouchMove={onMouseMove}
            onTouchEnd={onMouseUp}
          />

          {isDrawer && status === GameStatus.PLAYING && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-xl flex items-center gap-3 border border-white/10">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
              <input type="range" min="1" max="20" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="w-24 accent-primary" />
              <button onClick={clearCanvas} className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors">
                <Eraser className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Chat / Guesses */}
        <div className="w-full md:w-80 glass rounded-2xl flex flex-col overflow-hidden border border-white/5">
          <div className="p-4 border-b border-white/5 bg-white/5 text-xs font-black uppercase tracking-widest text-gray-400 flex justify-between items-center">
            <span>Guesses</span>
            {hasGuessed && <span className="text-primary">GUESSED</span>}
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 flex flex-col custom-scrollbar">
            {chatHistory?.map((chat, idx) => (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={idx} className={`p-2 rounded-lg text-sm ${chat.isSystem ? 'bg-primary/20 text-primary font-bold' : 'bg-white/5 text-gray-300'}`}>
                <span className="opacity-50 text-xs mr-2">{chat.sender}:</span>
                {chat.text}
              </motion.div>
            ))}
          </div>
          <form onSubmit={handleGuess} className="p-3 bg-dark-lighter/50 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              placeholder={(isDrawer || hasGuessed || status !== GameStatus.PLAYING) ? "Cannot guess right now..." : "Type your guess here..."}
              disabled={isDrawer || hasGuessed || status !== GameStatus.PLAYING}
              className="flex-1 bg-dark/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button type="submit" disabled={isDrawer || hasGuessed || !guess.trim() || status !== GameStatus.PLAYING} className="bg-primary text-dark p-2 rounded-xl disabled:opacity-50 hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScribbleBoard;
