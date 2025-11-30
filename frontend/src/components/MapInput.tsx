import React, { useState, useEffect, useRef } from 'react';

interface MapInputProps {
  onLocationSelect: (location: { address: string; coordinates: [number, number] }) => void;
  placeholder: string;
  defaultValue?: string;
}

const MapInput: React.FC<MapInputProps> = ({ onLocationSelect, placeholder, defaultValue = '' }) => {
  const [address, setAddress] = useState(defaultValue);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle location search with Geoapify using fetch
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoadingSuggestions(true);
      // Using Geoapify's geocoding API with fetch to avoid CORS issues
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=countrycode:in&apiKey=86ddba99f19b4a509f47b4c94c073f80`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error('Error searching locations:', error);
      setMapError('Failed to search locations. Please try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    
    if (value.trim().length > 2) {
      searchLocations(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const location = {
      address: suggestion.properties.formatted,
      coordinates: [
        suggestion.geometry.coordinates[0],
        suggestion.geometry.coordinates[1]
      ] as [number, number]
    };
    
    setAddress(suggestion.properties.formatted);
    setSuggestions([]);
    onLocationSelect(location);
  };

  const handleFocus = () => {
    setShowMap(true);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={address}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      
      {showMap && suggestions.length > 0 && (
        <ul 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loadingSuggestions ? (
            <li className="px-4 py-2 text-gray-500">Searching...</li>
          ) : (
            suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.properties.place_id}-${index}`}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="font-medium">{suggestion.properties.name || suggestion.properties.street}</div>
                <div className="text-sm text-gray-500">{suggestion.properties.formatted}</div>
              </li>
            ))
          )}
        </ul>
      )}
      
      {mapError && (
        <div className="mt-2 text-sm text-red-600">
          {mapError}
        </div>
      )}
    </div>
  );
};

export default MapInput;