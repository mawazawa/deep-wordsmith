"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function PiyaLogo({ className }: { className?: string }) {
  const [isHovering, setIsHovering] = useState(false);

  // Acronym: Powerfull Intelligent You Are
  const acronym = {
    P: "Powerfull",
    I: "Intelligent",
    Y: "You",
    A: "Are",
    ai: "Accelerating Insights"
  };

  return (
    <div
      className={cn("relative group", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={() => setIsHovering(true)}
      onTouchEnd={() => setTimeout(() => setIsHovering(false), 3000)}
    >
      <motion.div
        className="flex items-center gap-1"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
      >
        <Image
          src="/piya-logo-v1.png"
          alt="PIYA.ai"
          width={120}
          height={40}
          className="object-contain h-10"
          priority
        />
      </motion.div>

      {isHovering && (
        <motion.div
          className="absolute top-full left-0 mt-2 p-3 rounded-lg glass-effect z-50 text-sm w-72 sm:w-60"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-1 text-left">
            <div className="flex gap-2">
              <span className="font-bold text-purple-500">P</span>
              <span>{acronym.P}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-blue-500">I</span>
              <span>{acronym.I}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-indigo-500">Y</span>
              <span>{acronym.Y}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-violet-500">A</span>
              <span>{acronym.A}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-gray-400 text-xs">.ai</span>
              <span className="text-xs">{acronym.ai}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}