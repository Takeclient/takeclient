'use client';

// This file contains client-side utilities for Sortable.js

// Load Sortable.js script from CDN
export const loadSortableScript = (): Promise<void> => {
  return new Promise((resolve) => {
    // Check if already loaded
    if (typeof window !== 'undefined' && (window as any).Sortable) {
      resolve();
      return;
    }

    if (document.getElementById('sortable-js')) {
      // Script tag exists but may not be loaded yet
      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && (window as any).Sortable) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.id = 'sortable-js';
    script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js';
    script.async = true;

    script.onload = () => {
      resolve();
    };

    document.body.appendChild(script);
  });
};

// Initialize sortable on an element
export const initializeSortable = async (
  elementId: string, 
  options: Record<string, any> = {}
): Promise<any> => {
  try {
    await loadSortableScript();
    
    // Make sure Sortable is available
    if (typeof window === 'undefined' || !(window as any).Sortable) {
      console.error('Sortable.js not loaded properly');
      return null;
    }
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      return null;
    }
    
    return (window as any).Sortable.create(element, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      ...options
    });
  } catch (error) {
    console.error('Error initializing Sortable:', error);
    return null;
  }
};

// Cleanup sortable instance
export const destroySortable = (instance: any): void => {
  if (instance && typeof instance.destroy === 'function') {
    instance.destroy();
  }
};
