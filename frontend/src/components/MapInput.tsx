import React, { useState, useEffect, useRef } from 'react';

interface Window {
  google: any;
}

declare const google: any;

interface MapInputProps {
  onLocationSelect: (location: { address: string; coordinates: [number, number] }) => void;
  placeholder: string;
  defaultValue?: string;
}

const MapInput: React.FC<MapInputProps> = ({ onLocationSelect, placeholder, defaultValue = '' }) => {
  const [address, setAddress] = useState(defaultValue);
  const [showMap, setShowMap] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = () => {
        setMapLoaded(true);
        initAutocomplete();
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
      initAutocomplete();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const initAutocomplete = () => {
    if (window.google && mapRef.current) {
      const input = document.getElementById('location-input') as HTMLInputElement;
      if (input) {
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(28.4, 76.8), // Southwest corner of Delhi
          new google.maps.LatLng(28.8, 77.3)  // Northeast corner of Delhi
        );
        
        autocompleteRef.current = new google.maps.places.Autocomplete(input, {
          types: ['geocode'],
          componentRestrictions: { country: 'IN' }, // Restrict to India
          bounds: bounds,
          strictBounds: true
        });

        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current!.getPlace();
          if (place.geometry && place.formatted_address) {
            const location = {
              address: place.formatted_address,
              coordinates: [
                place.geometry.location!.lng(),
                place.geometry.location!.lat()
              ] as [number, number]
            };
            setAddress(place.formatted_address);
            onLocationSelect(location);
          }
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleFocus = () => {
    setShowMap(true);
  };

  return (
    <div className="relative">
      <input
        id="location-input"
        type="text"
        value={address}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
      
      {showMap && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
          <div 
            ref={mapRef} 
            className="h-64 w-full rounded-b-md"
            style={{ display: mapLoaded ? 'block' : 'none' }}
          />
          {!mapLoaded && (
            <div className="h-64 flex items-center justify-center">
              <p>Loading map...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapInput;