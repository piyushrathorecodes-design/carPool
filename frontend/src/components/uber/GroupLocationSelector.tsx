import React, { useState } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface GroupLocationSelectorProps {
  onLocationsSelected: (pickup: Location, drop: Location) => void;
  initialPickup?: Location;
  initialDrop?: Location;
}

const GroupLocationSelector: React.FC<GroupLocationSelectorProps> = ({ 
  onLocationsSelected,
  initialPickup,
  initialDrop
}) => {
  const [pickup, setPickup] = useState<Location | null>(initialPickup || null);
  const [drop, setDrop] = useState<Location | null>(initialDrop || null);
  const [isSelectingPickup, setIsSelectingPickup] = useState(false);
  const [isSelectingDrop, setIsSelectingDrop] = useState(false);

  // In a real implementation, you would integrate with a map component
  // For now, we'll simulate location selection
  const handleSetPickup = () => {
    setIsSelectingPickup(true);
    // Simulate getting current location or allowing user to select on map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPickup = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPickup(newPickup);
          setIsSelectingPickup(false);
          
          // If both locations are set, notify parent
          if (drop) {
            onLocationsSelected(newPickup, drop);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback coordinates for demo
          const fallbackPickup = { lat: 28.6139, lng: 77.2090 }; // New Delhi
          setPickup(fallbackPickup);
          setIsSelectingPickup(false);
          
          if (drop) {
            onLocationsSelected(fallbackPickup, drop);
          }
        }
      );
    } else {
      // Fallback coordinates for demo
      const fallbackPickup = { lat: 28.6139, lng: 77.2090 }; // New Delhi
      setPickup(fallbackPickup);
      setIsSelectingPickup(false);
      
      if (drop) {
        onLocationsSelected(fallbackPickup, drop);
      }
    }
  };

  const handleSetDrop = () => {
    setIsSelectingDrop(true);
    // Simulate getting current location or allowing user to select on map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newDrop = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setDrop(newDrop);
          setIsSelectingDrop(false);
          
          // If both locations are set, notify parent
          if (pickup) {
            onLocationsSelected(pickup, newDrop);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback coordinates for demo
          const fallbackDrop = { lat: 28.7041, lng: 77.1025 }; // North Delhi
          setDrop(fallbackDrop);
          setIsSelectingDrop(false);
          
          if (pickup) {
            onLocationsSelected(pickup, fallbackDrop);
          }
        }
      );
    } else {
      // Fallback coordinates for demo
      const fallbackDrop = { lat: 28.7041, lng: 77.1025 }; // North Delhi
      setDrop(fallbackDrop);
      setIsSelectingDrop(false);
      
      if (pickup) {
        onLocationsSelected(pickup, fallbackDrop);
      }
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Set Uber Locations</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleSetPickup}
          disabled={isSelectingPickup}
          className={`px-4 py-3 rounded-lg font-medium transition-colors ${
            pickup 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          } ${isSelectingPickup ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSelectingPickup ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting Location...
            </span>
          ) : pickup ? (
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pickup Set
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Set Pickup
            </span>
          )}
        </button>
        
        <button
          onClick={handleSetDrop}
          disabled={isSelectingDrop}
          className={`px-4 py-3 rounded-lg font-medium transition-colors ${
            drop 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          } ${isSelectingDrop ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSelectingDrop ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting Location...
            </span>
          ) : drop ? (
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Drop Set
            </span>
          ) : (
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Set Drop
            </span>
          )}
        </button>
      </div>
      
      {pickup && drop && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Locations set!</span> Both pickup and drop locations have been selected.
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupLocationSelector;