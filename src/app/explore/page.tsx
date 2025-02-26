import { Metadata } from "next";
import { WordExploration } from "@/components/word-exploration";
import { SemanticGraphVisualization } from "@/components/semantic-graph-visualization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Explore Words | Deep Wordsmith",
  description: "Explore words, their meanings, etymology, and semantic relationships with Deep Wordsmith.",
};

/**
 * Word Exploration Page
 *
 * This page allows users to explore words, their meanings, etymology,
 * and visualize semantic relationships between words.
 */
export default function ExplorePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Get the word from search params
  const word = typeof searchParams.word === "string" ? searchParams.word : undefined;

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Word Explorer
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover the rich tapestry of language through detailed word exploration and
          interactive semantic visualizations.
        </p>
      </div>

      <div className="mb-8">
        <WordExploration />
      </div>

      {word && (
        <div className="mt-12">
          <Tabs defaultValue="visualization" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="visualization">Semantic Graph</TabsTrigger>
              <TabsTrigger value="details">Word Details</TabsTrigger>
            </TabsList>

            <TabsContent value="visualization" className="mt-6">
              <div className="glass-effect p-4 sm:p-6 rounded-xl">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-primary">
                  Semantic Relationships
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  This visualization shows how "{word}" relates to other words and concepts.
                  Click on nodes to explore connections, or right-click to open that word.
                </p>

                <div className="h-[600px] w-full">
                  <SemanticGraphVisualization word={word} className="h-full w-full" />
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  <p>
                    <strong>Tip:</strong> Scroll to zoom, drag to pan, and click nodes to see details.
                    Right-click a word to explore it in depth.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <div className="glass-effect p-4 sm:p-6 rounded-xl">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-primary">
                  Word Details
                </h2>
                <p className="text-sm text-muted-foreground">
                  Detailed information about "{word}" will be displayed here in future updates.
                  This section will include etymology, usage examples, and historical context.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </main>
  );
}