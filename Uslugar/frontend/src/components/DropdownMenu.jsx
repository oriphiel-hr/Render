import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const DropdownMenu = ({ title, icon, children, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        panelRef.current && !panelRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${title} - ${isOpen ? 'zatvori' : 'otvori'} izbornik`}
      >
        {icon && <span className="text-base">{icon}</span>}
        <span>{title}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && createPortal(
        <div 
          ref={panelRef}
          className="fixed min-w-[200px] max-w-[280px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] py-1"
          role="menu"
          aria-label={`${title} izbornik`}
          style={{
            top: position.top,
            left: position.left
          }}
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
};

export default DropdownMenu;
