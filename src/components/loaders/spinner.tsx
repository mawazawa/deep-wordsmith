/**
 * Spinner Component
 *
 * A flexible, size-customizable spinner with the app's glassmorphic design
 */
export function Spinner({
  size = 'md',
  className = '',
}) {
  // Size mapping
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const sizeClass = sizeMap[size as keyof typeof sizeMap] || sizeMap.md;

  return (
    <div
      className={`
        ${sizeClass}
        rounded-full
        border-primary
        border-t-transparent
        animate-spin
        ${className}
      `}
      aria-label="Loading"
      role="status"
    />
  );
}