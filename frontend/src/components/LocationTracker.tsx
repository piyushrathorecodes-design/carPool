import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

let socket: any;

interface LocationTrackerProps {
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
}

const LocationTracker: React.FC<LocationTrackerProps> = ({ onLocationUpdate }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState('');
  const watchIdRef = useRef<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    socket = io('http://localhost:5000');
    
    socket.on('user_location_updated', (data: any) => {
      console.log('Location updated:', data);
    });
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socket.disconnect();
    };
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setTracking(true);
    setError('');
    
    // Watch position updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        
        // Send location to backend
        updateLocation(latitude, longitude);
        
        // Notify parent component
        if (onLocationUpdate) {
          onLocationUpdate({ latitude, longitude });
        }
        
        // Emit location update via socket
        socket.emit('location_update', {
          userId: user?.id || 'unknown_user',
          location: { latitude, longitude }
        });
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}`);
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  const updateLocation = async (latitude: number, longitude: number) => {
    try {
      await axios.put('/api/users/location', {
        coordinates: [longitude, latitude]
      });
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Location Tracking</h3>
        <button
          onClick={tracking ? stopTracking : startTracking}
          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white ${
            tracking 
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {tracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">
            {error}
          </div>
        </div>
      )}
      
      {location && (
        <div className="mt-3">
          <p className="text-sm text-gray-500">
            Current Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {tracking ? 'Tracking active' : 'Tracking paused'}
          </p>
        </div>
      )}
      
      {!location && !error && (
        <div className="mt-3">
          <p className="text-sm text-gray-500">
            Click "Start Tracking" to share your location with group members
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;