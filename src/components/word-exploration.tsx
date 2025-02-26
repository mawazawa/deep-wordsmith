"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import { SectionalErrorBoundary } from "@/lib/error-handling/error-boundaries";
import { useErrorHandling } from "@/context/error-context";

/**
 * WordExploration component
 *
 * This component allows users to explore words, showing related terminology,
 * etymology, and usage examples in a visual card format.
 */
export function WordExploration() {
  return (
    <SectionalErrorBoundary>
      <WordExplorationContent />
    </SectionalErrorBoundary>
  );
}

/**
 * WordExplorationContent component
 *
 * The actual implementation of the word exploration functionality.
 * Separated from the main component to allow error boundary wrapping.
 */
function WordExplorationContent() {
  // Error handling
  const { captureError } = useErrorHandling();

  // State for input and results
  const [inputWord, setInputWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [wordData, setWordData] = useState<WordData | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWord.trim()) return;

    setIsLoading(true);

    try {
      // Call our API endpoint
      const response = await fetch(`/api/explore-word?word=${encodeURIComponent(inputWord)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      setWordData(data);

      // Log for debugging
      console.log("Fetched word data:", data);
    } catch (error) {
      console.error("Error exploring word:", error);

      // Use our error handling context
      captureError(
        error instanceof Error ? error : new Error(String(error)),
        "WordExplorationContent.handleSubmit"
      );

      toast.error(error instanceof Error ? error.message : "Failed to explore this word. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle copying word data to clipboard
  const handleCopy = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard");

      // Use our error handling context
      captureError(
        error instanceof Error ? error : new Error(String(error)),
        "WordExplorationContent.handleCopy"
      );
    }
  };

  // Handle exporting word data as markdown
  const handleExportMarkdown = () => {
    if (!wordData) return;

    try {
      const markdown = generateMarkdown(wordData);
      navigator.clipboard.writeText(markdown);
      toast.success("Markdown copied to clipboard");
    } catch (error) {
      console.error("Failed to export markdown:", error);
      toast.error("Failed to export markdown");

      // Use our error handling context
      captureError(
        error instanceof Error ? error : new Error(String(error)),
        "WordExplorationContent.handleExportMarkdown"
      );
    }
  };

  // Generate markdown from word data
  const generateMarkdown = (data: WordData): string => {
    let md = `# ${data.word}\n\n`;
    md += `## Core Meaning\n${data.coreMeaning}\n\n`;
    md += `## Etymology\n${data.etymology}\n\n`;
    md += `## Related Words\n`;

    data.relatedWords.forEach((related) => {
      md += `- **${related.word}** (${related.type}): ${related.meaning}\n`;
    });

    md += `\n## Usage Trends\n`;
    md += `Popularity: ${data.usageTrends.popularity}/10\n\n`;
    md += `### Common Contexts\n`;
    data.usageTrends.contexts.forEach((context) => {
      md += `- ${context}\n`;
    });

    return md;
  };

  return (
    <div className="w-full space-y-6 md:space-y-8">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Enter a word to explore..."
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all
                        glass-effect text-base md:text-lg"
              disabled={isLoading}
              aria-label="Word to explore"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={isLoading || !inputWord.trim()}
            className="whitespace-nowrap transition-all py-6 px-6"
          >
            Explore
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center sm:text-left">
          Try words like &quot;eloquent&quot;, &quot;vibrant&quot;, or &quot;serendipity&quot;
        </p>
      </form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {wordData && !isLoading && (
          <motion.div
            key={wordData.word}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 md:space-y-8"
          >
            {/* Word Title */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
                {wordData.word}
              </h1>
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(wordData.word)}
                  className="text-xs"
                >
                  Copy Word
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportMarkdown}
                  className="text-xs"
                >
                  Export to MD
                </Button>
              </div>
            </div>

            {/* Core Meaning */}
            <div className="glass-effect p-4 sm:p-6 rounded-xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-primary">Core Meaning</h2>
              <p className="text-sm sm:text-base text-muted-foreground">{wordData.coreMeaning}</p>
            </div>

            {/* Etymology */}
            <div className="glass-effect p-4 sm:p-6 rounded-xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-primary">Etymology</h2>
              <p className="text-sm sm:text-base text-muted-foreground">{wordData.etymology}</p>
            </div>

            {/* Related Words */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-primary">Related Words</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {wordData.relatedWords.map((related, index) => (
                  <div
                    key={index}
                    className="glass-effect p-3 sm:p-4 rounded-xl cursor-pointer hover:shadow-md transition-all active:scale-95"
                    onClick={() => handleCopy(related.word)}
                  >
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <h3 className="font-medium text-base sm:text-lg">{related.word}</h3>
                      <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                        {related.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">{related.meaning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Trends */}
            <div className="glass-effect p-4 sm:p-6 rounded-xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-primary">Current Usage</h2>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">Popularity</span>
                  <span className="text-xs sm:text-sm font-medium">{wordData.usageTrends.popularity}%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full"
                    style={{ width: `${wordData.usageTrends.popularity}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-medium mb-2">Common Contexts</h3>
                <div className="flex flex-wrap gap-2">
                  {wordData.usageTrends.contexts.map((context, index) => (
                    <span
                      key={index}
                      className="bg-background/50 text-muted-foreground text-xs px-3 py-1 rounded-full"
                    >
                      {context}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Types
interface WordData {
  word: string;
  coreMeaning: string;
  etymology: string;
  relatedWords: {
    word: string;
    type: string;
    meaning: string;
  }[];
  usageTrends: {
    popularity: number;
    contexts: string[];
  };
}