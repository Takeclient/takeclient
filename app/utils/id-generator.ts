let counter = 0;

/**
 * Generates a unique ID that's consistent between server and client rendering
 * to avoid hydration errors. Uses only a counter, no random values or timestamps.
 */
export function generateFieldId(): string {
  counter += 1;
  return `field-${counter}`;
}

/**
 * Generates a unique ID with a prefix
 */
export function generateId(prefix: string = 'id'): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/**
 * Reset counter (useful for testing)
 */
export function resetIdCounter(): void {
  counter = 0;
}

/**
 * Generate a more unique ID by combining counter with a hash of content
 * This is stable but more unique for cases where you need it
 */
export function generateUniqueFieldId(content?: string): string {
  counter += 1;
  if (content) {
    // Simple hash function that's deterministic
    const hash = content.split('').reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
    }, 0);
    return `field-${counter}-${Math.abs(hash)}`;
  }
  return `field-${counter}`;
} 