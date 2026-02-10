// Debounce function to prevent rapid repeated calls
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// Create a set to track which prefetch calls are in flight
const prefetchInFlight = new Set<string>();

// Helper to avoid duplicate prefetch calls
export async function safePrefetch(key: string, fn: () => Promise<void>) {
  if (prefetchInFlight.has(key)) {
    return; // Already prefetching, skip
  }

  prefetchInFlight.add(key);
  try {
    await fn();
  } finally {
    prefetchInFlight.delete(key);
  }
}
