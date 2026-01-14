import React, { useState } from 'react';

export default function PortfolioDisplay({ portfolio }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const items = portfolio?.items || [];

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Nema portfolio radova za prikaz.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div 
            key={item.id} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              setSelectedItem(item);
              setSelectedImageIndex(0);
            }}
          >
            {item.images && item.images.length > 0 && (
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {item.images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    +{item.images.length - 1}
                  </div>
                )}
              </div>
            )}
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{item.description}</p>
              )}
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                {item.category && (
                  <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                    {item.category}
                  </span>
                )}
                {item.date && (
                  <span>📅 {new Date(item.date).toLocaleDateString('hr-HR')}</span>
                )}
                {item.location && (
                  <span>📍 {item.location}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal za prikaz detalja */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedItem.title}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                aria-label="Zatvori"
              >
                ×
              </button>
            </div>

            {/* Images */}
            {selectedItem.images && selectedItem.images.length > 0 && (
              <div className="relative">
                <img 
                  src={selectedItem.images[selectedImageIndex]} 
                  alt={selectedItem.title}
                  className="w-full h-auto max-h-96 object-contain"
                />
                {selectedItem.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => 
                          prev > 0 ? prev - 1 : selectedItem.images.length - 1
                        );
                      }}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded hover:bg-opacity-75"
                      aria-label="Prethodna slika"
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex((prev) => 
                          prev < selectedItem.images.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded hover:bg-opacity-75"
                      aria-label="Sljedeća slika"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                      {selectedImageIndex + 1} / {selectedItem.images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Thumbnails */}
            {selectedItem.images && selectedItem.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto">
                {selectedItem.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                      index === selectedImageIndex 
                        ? 'border-blue-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Slika ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="p-6 space-y-4">
              {selectedItem.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Opis</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedItem.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {selectedItem.category && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Kategorija</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedItem.category}</p>
                  </div>
                )}
                {selectedItem.date && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Datum</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(selectedItem.date).toLocaleDateString('hr-HR')}
                    </p>
                  </div>
                )}
                {selectedItem.location && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Lokacija</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedItem.location}</p>
                  </div>
                )}
                {selectedItem.client && (
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Klijent</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedItem.client}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

