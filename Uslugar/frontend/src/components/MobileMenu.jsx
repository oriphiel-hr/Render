import React, { useState } from 'react';

const MobileMenu = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigacijski izbornik">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu */}
      <div
        className="absolute left-0 top-0 bottom-0 mobile-menu-panel bg-white dark:bg-gray-800 w-[85vw] max-w-sm shadow-xl overflow-y-auto min-h-0"
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">Menu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Zatvori izbornik"
          >
            ×
          </button>
        </div>
        
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
