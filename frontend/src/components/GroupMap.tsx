import React, { useState, useEffect, useRef } from 'react';

interface GroupMember {
  _id: string;
  name: string;
  liveLocation?: {
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface GroupMapProps {
  groupId?: string;
  groupData?: any; // Add groupData prop
}

const GroupMap: React.FC<GroupMapProps> = ({ groupId, groupData }) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [error, setError] = useState('');
  const [mapData, setMapData] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Load group members and create map
  useEffect(() => {
    // Don't load if groupId is empty or invalid
    if (groupId && groupId !== 'create') {
      loadGroupMembers();
    } else if (groupData) {
      // Use provided groupData instead of fetching
      const membersWithLocations = groupData.members
        .filter((member: any) => member && member.user) // Add safety check
        .map((member: any) => ({
          _id: member.user._id || member.user.id || member.userId, // Handle different ID formats
          name: member.user.name || 'Unknown User',
          liveLocation: member.user.liveLocation
        }))
        .filter((member: GroupMember) => member.liveLocation);
      
      setMembers(membersWithLocations);
      createMap(membersWithLocations);
    }
  }, [groupId, groupData]);

  const loadGroupMembers = async () => {
    try {
      setLoading(true);
      
      // Validate groupId before making request
      if (!groupId || groupId === 'create') {
        setError('Invalid group ID');
        setLoading(false);
        return;
      }
      
      // If we already have groupData, use it instead of fetching
      if (groupData) {
        const membersWithLocations = groupData.members
          .filter((member: any) => member && member.user) // Add safety check
          .map((member: any) => ({
            _id: member.user._id || member.user.id || member.userId, // Handle different ID formats
            name: member.user.name || 'Unknown User',
            liveLocation: member.user.liveLocation
          }))
          .filter((member: GroupMember) => member.liveLocation);
        
        setMembers(membersWithLocations);
        createMap(membersWithLocations);
        setLoading(false);
        return;
      }
      
      // This part should not be reached if we're properly passing groupData
      setError('Group data not available');
      setLoading(false);
    } catch (err) {
      setError('Failed to load group members');
      console.error('Error loading group members:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMap = async (members: GroupMember[]) => {
    if (!mapRef.current) return;
    
    try {
      // Find the bounds of all locations
      if (members.length > 0) {
        const coordinates = members.map(member => member.liveLocation!.coordinates);
        const lons = coordinates.map(coord => coord[0]);
        const lats = coordinates.map(coord => coord[1]);
        
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        
        // Create a static map URL using Geoapify
        const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
        const width = mapRef.current.clientWidth;
        const height = 384; // 384px height (h-96)
        
        const mapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-bright&bbox=${bbox}&width=${width}&height=${height}&apiKey=86ddba99f19b4a509f47b4c94c073f80`;
        
        setMapData({
          url: mapUrl,
          members: members
        });
      }
    } catch (err) {
      setError('Failed to create map');
      console.error('Error creating map:', err);
    }
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
      
      {mapData ? (
        <div className="relative">
          <img 
            src={mapData.url} 
            alt="Group locations map" 
            className="w-full h-96 object-cover"
            onError={() => {
              setError('Failed to load map image');
              console.error('Map image failed to load');
            }}
          />
          
          {/* Member markers would be positioned here if we had a more complex implementation */}
          <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded p-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Group Members</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-96 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">No location data available</p>
        </div>
      )}
      
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {/* Member list */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Group Members</h4>
        <ul className="space-y-1">
          {members.map((member) => (
            <li key={member._id} className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              <span>{member.name}</span>
              {member.liveLocation && (
                <span className="ml-2 text-xs text-gray-500">
                  ({member.liveLocation.coordinates[1].toFixed(4)}, {member.liveLocation.coordinates[0].toFixed(4)})
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupMap;