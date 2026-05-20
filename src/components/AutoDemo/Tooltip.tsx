import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ text, position }: { text: string; position: { x: number; y: number } | null }) {
  if (!text || !position) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.9 }}
        className="fixed z-[100] px-4 py-2 bg-[#ffb800] text-[#0a101f] text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(255,184,0,0.4)] pointer-events-none whitespace-nowrap"
        style={{
          left: position.x,
          top: position.y + 24, // slightly below cursor
        }}
      >
        {text}
      </motion.div>
    </AnimatePresence>
  );
}
