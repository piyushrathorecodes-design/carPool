// Geoapify API service for route calculations
class GeoapifyService {
  /**
   * Calculate route between multiple waypoints
   * @param waypoints Array of [longitude, latitude] coordinates
   * @param mode Transport mode (drive, walk, bike, etc.)
   * @returns Promise with route data
   */
  async calculateRoute(
    waypoints: [number, number][], 
    mode: string = 'drive'
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        apiKey: '86ddba99f19b4a509f47b4c94c073f80'
      });
      
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?${params.toString()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            waypoints,
            mode
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error calculating route:', error);
      throw new Error(error.message || 'Failed to calculate route');
    }
  }

  /**
   * Get route information between two points
   * @param start [longitude, latitude] of start point
   * @param end [longitude, latitude] of end point
   * @param mode Transport mode (drive, walk, bike, etc.)
   * @returns Promise with route information
   */
  async getRouteInfo(
    start: [number, number], 
    end: [number, number], 
    mode: string = 'drive'
  ): Promise<any> {
    try {
      const waypoints: [number, number][] = [start, end];
      const routeData = await this.calculateRoute(waypoints, mode);
      
      // Extract key information from the route data
      if (routeData && routeData.features && routeData.features.length > 0) {
        const feature = routeData.features[0];
        return {
          distance: feature.properties.distance,
          duration: feature.properties.time,
          distanceFormatted: this.formatDistance(feature.properties.distance),
          durationFormatted: this.formatDuration(feature.properties.time),
          route: feature
        };
      }
      
      throw new Error('No route data found');
    } catch (error) {
      console.error('Error getting route info:', error);
      throw error;
    }
  }

  /**
   * Format distance in meters to human-readable format
   * @param meters Distance in meters
   * @returns Formatted distance string
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  }

  /**
   * Format duration in seconds to human-readable format
   * @param seconds Duration in seconds
   * @returns Formatted duration string
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

// Export singleton instance
export const geoapifyService = new GeoapifyService();

export default geoapifyService;