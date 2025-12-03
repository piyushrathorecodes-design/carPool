import React, { useState, useEffect } from 'react';
import BookWithUberButton from './BookWithUberButton';

interface Location {
  lat: number;
  lng: number;
}

interface GroupUberLinkGeneratorProps {
  groupId: string;
  pickup: Location | null;
  drop: Location | null;
  isAdmin: boolean;
  onSaveLocations: (pickup: Location, drop: Location) => Promise<void>;
}

const GroupUberLinkGenerator: React.FC<GroupUberLinkGeneratorProps> = ({ 
  groupId, 
  pickup, 
  drop,
  isAdmin,
  onSaveLocations
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Generate Uber deep link
  const generateUberLink = (): string => {
    if (!pickup || !drop) return '';
    
    // Uber deep link format
    return `uber://?action=setPickup&pickup[latitude]=${pickup.lat}&pickup[longitude]=${pickup.lng}&dropoff[latitude]=${drop.lat}&dropoff[longitude]=${drop.lng}`;
  };

  // Generate web fallback link
  const generateWebLink = (): string => {
    if (!pickup || !drop) return '';
    
    // Web fallback link
    return `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pickup.lat}&pickup[longitude]=${pickup.lng}&dropoff[latitude]=${drop.lat}&dropoff[longitude]=${drop.lng}`;
  };

  const uberLink = generateUberLink();
  const webLink = generateWebLink();

  const handleSaveLocations = async () => {
    if (!pickup || !drop) {
      setSaveError('Please set both pickup and drop locations');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      await onSaveLocations(pickup, drop);
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving locations:', error);
      setSaveError('Failed to save locations. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset success message when locations change
  useEffect(() => {
    setShowSuccessMessage(false);
  }, [pickup, drop]);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">Uber Ride Link Generator</h3>
      
      {showSuccessMessage && (
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">Success!</span> Uber ride link generated and saved to group.
          </p>
        </div>
      )}
      
      {saveError && (
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800">
            <span className="font-medium">Error:</span> {saveError}
          </p>
        </div>
      )}
      
      {pickup && drop ? (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Uber ride link generated.</span> Tap 'Book with Uber' to continue.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Pickup:</span> 
              <span className="ml-2 text-gray-900">{pickup.lat.toFixed(6)}, {pickup.lng.toFixed(6)}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Drop:</span> 
              <span className="ml-2 text-gray-900">{drop.lat.toFixed(6)}, {drop.lng.toFixed(6)}</span>
            </div>
          </div>
          
          <BookWithUberButton 
            uberLink={uberLink}
            webLink={webLink}
          />
          
          {isAdmin && (
            <button
              onClick={handleSaveLocations}
              disabled={isSaving}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Locations to Group'
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="p-4 text-center bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Locations Set</h3>
          <p className="mt-1 text-sm text-gray-500">
            Set both pickup and drop locations to generate an Uber link.
          </p>
        </div>
      )}
    </div>
  );
};

export default GroupUberLinkGenerator;