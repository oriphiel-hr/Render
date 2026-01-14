import React, { useState, useRef, useEffect } from 'react';

const DropdownMenu = ({ title, icon, children, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${title} - ${isOpen ? 'zatvori' : 'otvori'} izbornik`}
      >
        <span>{icon}</span>
        <span>{title}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-1 min-w-[160px] max-w-[240px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-dropdown"
          role="menu"
          aria-label={`${title} izbornik`}
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
