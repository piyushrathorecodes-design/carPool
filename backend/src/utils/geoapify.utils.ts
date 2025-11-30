import axios from 'axios';
import config from '../config';

// Geoapify API base URL
const GEOAPIFY_BASE_URL = 'https://api.geoapify.com/v1';

/**
 * Calculate route between two points using Geoapify Routing API
 * @param waypoints Array of [longitude, latitude] coordinates
 * @param mode Transport mode (drive, walk, bike, etc.)
 * @returns Route information including distance and duration
 */
export const calculateRoute = async (
  waypoints: [number, number][], 
  mode: string = 'drive'
): Promise<any> => {
  try {
    // Format waypoints for the API
    const waypointStrings = waypoints.map(point => `${point[1]},${point[0]}`).join('|');
    
    // Make request to Geoapify Routing API
    const response = await axios.get(`${GEOAPIFY_BASE_URL}/routing`, {
      params: {
        waypoints: waypointStrings,
        mode: mode,
        apiKey: config.services.geoapify.apiKey
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calculating route with Geoapify:', error);
    throw new Error('Failed to calculate route');
  }
};

/**
 * Calculate straight-line distance between two points using Geoapify
 * @param point1 [longitude, latitude] of first point
 * @param point2 [longitude, latitude] of second point
 * @returns Distance in meters
 */
export const calculateDistance = async (
  point1: [number, number], 
  point2: [number, number]
): Promise<number> => {
  try {
    // For straight-line distance, we can still use the Haversine formula for efficiency
    // But if you want to use Geoapify for this too, here's how:
    
    // Make request to Geoapify Distance Matrix API
    const response = await axios.post(`${GEOAPIFY_BASE_URL}/distance-matrix`, {
      mode: 'drive',
      sources: [[point1[0], point1[1]]],
      targets: [[point2[0], point2[1]]]
    }, {
      params: {
        apiKey: config.services.geoapify.apiKey
      }
    });
    
    // Return distance in meters
    return response.data.sources_to_targets[0][0].distance;
  } catch (error) {
    console.error('Error calculating distance with Geoapify:', error);
    // Fallback to Haversine formula if Geoapify fails
    return calculateDistanceHaversine(point1[1], point1[0], point2[1], point2[0]);
  }
};

/**
 * Calculate straight-line distance between two points using Haversine formula (fallback)
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export const calculateDistanceHaversine = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

export default {
  calculateRoute,
  calculateDistance,
  calculateDistanceHaversine
};