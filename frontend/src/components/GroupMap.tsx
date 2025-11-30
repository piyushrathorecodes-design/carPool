import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Window {
  google: any;
}

declare const google: any;

interface GroupMapProps {
  groupId: string;
  currentUserLocation?: { latitude: number; longitude: number };
}

interface GroupMember {
  _id: string;
  name: string;
  liveLocation?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

const GroupMap: React.FC<GroupMapProps> = ({ groupId }) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geometry`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  const initMap = () => {
    if (window.google && mapRef.current) {
      // Initialize map centered on Delhi
      const delhiCenter = { lat: 28.6139, lng: 77.2090 };
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: delhiCenter,
      });
      
      // Load group members
      loadGroupMembers();
    }
  };

  const loadGroupMembers = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would fetch group members with their locations
      // For now, we'll simulate with mock data
      const mockMembers: GroupMember[] = [
        {
          _id: '1',
          name: 'You',
          liveLocation: {
            coordinates: [77.2090, 28.6139] // [longitude, latitude]
          }
        },
        {
          _id: '2',
          name: 'Rahul Sharma',
          liveLocation: {
            coordinates: [77.2150, 28.6200]
          }
        },
        {
          _id: '3',
          name: 'Priya Patel',
          liveLocation: {
            coordinates: [77.2000, 28.6100]
          }
        }
      ];
      
      setMembers(mockMembers);
      updateMapMarkers(mockMembers);
    } catch (err) {
      setError('Failed to load group members');
      console.error('Error loading group members:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateMapMarkers = (members: GroupMember[]) => {
    if (!mapInstanceRef.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add markers for each member
    members.forEach(member => {
      if (member.liveLocation) {
        const position = {
          lat: member.liveLocation.coordinates[1],
          lng: member.liveLocation.coordinates[0]
        };
        
        const marker = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: member.name
        });
        
        // Add info window
        // Simple label instead of InfoWindow for now
        const label = member.name;
        
        // No click listener for now
        
        markersRef.current.push(marker);
        
        // Center map on current user
        if (member._id === '1') {
          mapInstanceRef.current.setCenter(position);
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 h-96 flex items-center justify-center">
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Group Location</h3>
        <p className="mt-1 text-sm text-gray-500">Real-time location of group members</p>
      </div>
      <div ref={mapRef} className="h-96 w-full"></div>
      
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs text-gray-600">You</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span className="text-xs text-gray-600">Group Members</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupMap;