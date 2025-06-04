'use client';

import { useEffect } from 'react';

export function FontAwesomeSetup() {
  useEffect(() => {
    // Add FontAwesome CSS if not already present
    if (!document.getElementById('fontawesome-css')) {
      const link = document.createElement('link');
      link.id = 'fontawesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.4/css/all.min.css';
      document.head.appendChild(link);
    }
  }, []);

  return null;
}

export default FontAwesomeSetup;
