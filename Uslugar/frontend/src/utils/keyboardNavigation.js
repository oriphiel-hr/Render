/**
 * Keyboard Navigation Utilities for Accessibility
 */

/**
 * Handle Enter/Space key press on buttons and other interactive elements
 * @param {Function} handler - Handler function to call
 * @returns {Function} - Event handler
 */
export const handleKeyboardAction = (handler) => {
  return (e) => {
    // Allow Enter or Space to trigger action (standard for buttons)
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler(e);
    }
  };
};

/**
 * Trap focus within a modal/dialog
 * @param {HTMLElement} element - Container element
 */
export const trapFocus = (element) => {
  if (!element) return;

  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTab = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTab);
  firstElement?.focus();

  return () => {
    element.removeEventListener('keydown', handleTab);
  };
};

/**
 * Move focus to element when it becomes visible
 * @param {HTMLElement} element - Element to focus
 */
export const focusOnMount = (element) => {
  if (element) {
    // Small delay to ensure element is rendered
    setTimeout(() => {
      element.focus();
    }, 100);
  }
};

