import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bomb, Gem } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TileProps {
  index: number;
  value: number | null; // null: hidden, 0: gem, 1: bomb
  revealed: boolean;
  disabled: boolean;
  onClick: () => void;
}

const Tile: React.FC<TileProps> = ({
  value,
  revealed,
  disabled,
  onClick,
}) => {
  return (
    <motion.button
      whileHover={
        !revealed && !disabled
          ? {
              scale: 1.04,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(0, 231, 1, 0.3)",
            }
          : {}
      }
      whileTap={!revealed && !disabled ? { scale: 0.96 } : {}}
      onClick={onClick}
      disabled={revealed || disabled}
      className={cn(
        "relative aspect-square w-full rounded-xl transition-all duration-300 flex items-center justify-center overflow-hidden border-2",
        !revealed && "bg-dark-card border-white/5 cursor-pointer shadow-lg",
        revealed && value === 0 && "bg-primary/10 border-primary/30 shadow-gem",
        revealed &&
          value === 1 &&
          "bg-accent-bomb/10 border-accent-bomb/30 shadow-bomb",
      )}
    >
      <AnimatePresence mode="wait">
        {revealed && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {value === 0 ? (
              <Gem className="w-10 h-10 text-primary gem-glow" />
            ) : (
              <Bomb className="w-10 h-10 text-accent-bomb bomb-explosion" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          {/* Tile texture/pattern */}
          <div className="absolute inset-2 border border-white/5 rounded-lg opacity-20" />
          {disabled && (
            <div className="absolute inset-0 bg-dark/20 backdrop-blur-[1px]" />
          )}
        </>
      )}

      {/* Glow effect on hover */}
      {!revealed && !disabled && (
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
      )}
    </motion.button>
  );
};

export default Tile;
