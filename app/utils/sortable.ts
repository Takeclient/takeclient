'use client';

declare global {
  interface Window {
    Sortable: any;
  }
}

// Load Sortable.js script from CDN
export const loadSortableScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if sortable script is already loaded
    if (window.Sortable || document.getElementById('sortable-js')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'sortable-js';
    script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js';
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Sortable.js'));
    
    document.body.appendChild(script);
  });
};

// Initialize sortable on an element
export const initializeSortable = async (elementId: string, options = {}): Promise<any> => {
  try {
    await loadSortableScript();
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      return null;
    }
    
    if (!window.Sortable) {
      console.error('Sortable.js not loaded properly');
      return null;
    }
    
    return new window.Sortable(element, {
      animation: 150,
      ghostClass: 'bg-gray-100',
      ...options
    });
  } catch (error) {
    console.error('Error initializing Sortable:', error);
    return null;
  }
};

export default initializeSortable;
