import React, { useState, useEffect, useRef } from 'react';

export default function AddressAutocomplete({
  value = '',
  onChange = () => {},
  onSelect = () => {},
  placeholder = 'Unesite adresu ili grad...',
  className = '',
  country = 'Hrvatska',
  debounceMs = 300
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Geocode pretraga
  const searchAddress = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + (country ? `, ${country}` : ''))}&limit=5&addressdetails=1`
      );
      const data = await res.json();
      
      const formattedSuggestions = data.map(item => ({
        displayName: item.display_name,
        address: {
          city: item.address?.city || item.address?.town || item.address?.village || item.address?.municipality || '',
          postcode: item.address?.postcode || '',
          country: item.address?.country || '',
          state: item.address?.state || '',
          road: item.address?.road || '',
          houseNumber: item.address?.house_number || '',
        },
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        type: item.type,
        importance: item.importance || 0
      }));

      // Sortiraj po važnosti
      formattedSuggestions.sort((a, b) => b.importance - a.importance);
      
      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Address search error:', err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && query.length >= 2) {
        searchAddress(query);
      } else {
        setSuggestions([]);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Handler za promjenu inputa
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange(newValue);
    if (!newValue) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handler za odabir sugestije
  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.displayName);
    setShowSuggestions(false);
    onChange(suggestion.displayName);
    onSelect({
      address: suggestion.displayName,
      city: suggestion.address.city,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
      postcode: suggestion.address.postcode,
      fullAddress: suggestion.address
    });
  };

  // Handler za klik izvan komponente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Formatiraj prikaz adrese
  const formatSuggestion = (suggestion) => {
    const parts = [];
    if (suggestion.address.road) parts.push(suggestion.address.road);
    if (suggestion.address.houseNumber) parts.push(suggestion.address.houseNumber);
    if (suggestion.address.city) parts.push(suggestion.address.city);
    if (suggestion.address.postcode) parts.push(suggestion.address.postcode);
    
    return parts.length > 0 ? parts.join(', ') : suggestion.displayName;
  };

  return (
    <div className={`address-autocomplete relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">
                {formatSuggestion(suggestion)}
              </div>
              {suggestion.address.city && (
                <div className="text-xs text-gray-500 mt-1">
                  {suggestion.address.city}
                  {suggestion.address.postcode && `, ${suggestion.address.postcode}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          Nema rezultata za "{query}"
        </div>
      )}
    </div>
  );
}

