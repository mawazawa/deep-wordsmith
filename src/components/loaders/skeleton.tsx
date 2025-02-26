import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'glass';
}

/**
 * Skeleton Component
 *
 * A skeleton loader component for placeholder UI
 * Uses glassmorphic design language to match the app's aesthetic
 */
export function Skeleton({
  className,
  variant = 'default'
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        variant === 'glass'
          ? "glass-effect bg-transparent"
          : "bg-muted/40",
        className
      )}
      aria-busy="true"
      aria-hidden="true"
    />
  );
}

interface SkeletonParagraphProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
  variant?: 'default' | 'glass';
}

/**
 * Paragraph Skeleton
 *
 * Creates multiple line skeletons to represent a paragraph of text
 */
export function SkeletonParagraph({
  lines = 3,
  className = '',
  lineClassName = '',
  variant = 'default'
}: SkeletonParagraphProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            // Vary the widths to make it look more natural
            i === lines - 1 ? "w-3/4" : "w-full",
            lineClassName
          )}
          variant={variant}
        />
      ))}
    </div>
  );
}

interface SkeletonImageProps {
  className?: string;
  aspectRatio?: string;
}

/**
 * Image Skeleton
 *
 * A specialized skeleton for image placeholders
 */
export function SkeletonImage({
  className = '',
  aspectRatio = 'aspect-square'
}: SkeletonImageProps) {
  return (
    <div className={`relative ${aspectRatio} ${className}`}>
      <Skeleton className="absolute inset-0" variant="glass" />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-muted-foreground/30"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );
}