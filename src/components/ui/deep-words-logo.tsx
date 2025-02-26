"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DeepWordsLogoProps {
  className?: string;
  showTooltip?: boolean;
}

export function DeepWordsLogo({ className, showTooltip = true }: DeepWordsLogoProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center ${className || ""}`}
      onMouseEnter={() => showTooltip && setIsHovering(true)}
      onMouseLeave={() => showTooltip && setIsHovering(false)}
    >
      {/* Static gradient logo (no image dependencies) */}
      <div className="overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] rounded-xl">
          <div className="bg-background dark:bg-gray-900 rounded-[calc(0.75rem-1px)] px-4 py-2">
            <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Deep Words
            </span>
          </div>
        </div>
      </div>

      {/* Animated tooltip on hover */}
      <AnimatePresence>
        {isHovering && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 p-4 rounded-lg glass-effect z-50 w-64"
          >
            <p className="text-sm font-medium mb-1">Deep Words</p>
            <p className="text-xs text-muted-foreground">
              Explore language through an AI-powered visual lens for deeper understanding.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export a smaller version for the navbar
export function DeepWordsLogoSmall({ className }: { className?: string }) {
  return (
    <div className={`inline-flex items-center ${className || ""}`}>
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] rounded-lg">
        <div className="bg-background dark:bg-gray-900 rounded-[calc(0.5rem-1px)] px-3 py-1">
          <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            DW
          </span>
        </div>
      </div>
    </div>
  );
}