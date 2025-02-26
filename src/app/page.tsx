"use client";

import { useState, useEffect } from 'react';
import { WordExplorer } from '@/components/WordExplorer';
import { DeepWordsLogo } from '@/components/ui/deep-words-logo';
import { Spinner } from '@/components/loaders/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration and loading states properly
  useEffect(() => {
    // Mark the component as hydrated
    setIsHydrated(true);

    // Set a small delay to ensure proper loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // During SSR, render nothing to avoid hydration mismatches
  if (!isHydrated) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-gray-950">
      {/* Static header - no animations to ensure reliable rendering */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60">
        <div className="container flex h-14 max-w-screen-xl items-center">
          <div className="flex mr-4">
            <div className="flex items-center space-x-2">
              <DeepWordsLogo />
            </div>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium ml-auto">
            <Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">About</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Explore</Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Learn</Link>
            <Link href="#" className="rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-white font-medium text-sm hover:opacity-90 transition-opacity">Sign In</Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="container max-w-screen-xl mx-auto px-4 py-8 md:py-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading Deep Words</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <WordExplorer />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Static footer with no dynamic elements */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-6">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Deep Words. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Powered by AI language models and visual mnemonic technology
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
