import { motion } from "framer-motion";
import { useMemo } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotation: number;
  shape: "circle" | "square" | "star";
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(45 100% 60%)",   // gold
  "hsl(340 80% 60%)",   // pink
  "hsl(200 80% 60%)",   // blue
  "hsl(160 70% 50%)",   // teal
  "hsl(25 90% 55%)",    // orange
];

function generatePieces(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 4,
    size: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    shape: (["circle", "square", "star"] as const)[Math.floor(Math.random() * 3)],
  }));
}

function PieceShape({ piece }: { piece: ConfettiPiece }) {
  if (piece.shape === "star") {
    return (
      <svg width={piece.size * 2} height={piece.size * 2} viewBox="0 0 24 24" fill={piece.color}>
        <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7L2 9.4h7.6z" />
      </svg>
    );
  }

  return (
    <div
      style={{
        width: piece.size,
        height: piece.size,
        backgroundColor: piece.color,
        borderRadius: piece.shape === "circle" ? "50%" : "1px",
      }}
    />
  );
}

export function ConfettiCelebration({ count = 30 }: { count?: number }) {
  const pieces = useMemo(() => generatePieces(count), [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{ left: `${piece.x}%`, top: "-5%" }}
          initial={{ y: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ["0%", "110%"],
            opacity: [0, 1, 1, 0],
            rotate: [0, piece.rotation, piece.rotation * 2],
            x: [0, (Math.random() - 0.5) * 60],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: "easeIn",
          }}
        >
          <PieceShape piece={piece} />
        </motion.div>
      ))}
    </div>
  );
}
