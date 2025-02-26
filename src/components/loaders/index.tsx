/**
 * Loading Components Export
 * Central export for all loading components
 */

// Import only the components used internally
import { Spinner } from './spinner';

// Re-export all components
export { Spinner } from './spinner';
export {
  Skeleton,
  SkeletonParagraph,
  SkeletonImage
} from './skeleton';

/**
 * Word Loading Component
 *
 * A specialized loading component for word search and exploration
 */
export function WordLoading() {
  return (
    <div className="glass-effect p-6 rounded-xl flex flex-col items-center justify-center space-y-4">
      <div className="flex items-center justify-center">
        <Spinner size="lg" />
      </div>
      <p className="text-muted-foreground text-sm">Exploring linguistic possibilities...</p>
    </div>
  );
}

/**
 * Visual Mnemonic Loading Component
 *
 * A loading component specifically for visual mnemonic generation
 */
export function VisualMnemonicLoading({
  className = '',
  word = 'word'
}: {
  className?: string;
  word?: string;
}) {
  return (
    <div className={`glass-effect rounded-xl flex flex-col items-center justify-center p-4 aspect-square ${className}`}>
      <Spinner size="md" className="mb-3" />
      <p className="text-xs text-muted-foreground text-center">
        Visualizing "{word}"...
      </p>
    </div>
  );
}