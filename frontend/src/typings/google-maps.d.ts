// Type definitions for Google Maps JavaScript API
declare global {
  interface Window {
    google: typeof google;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element | null, opts?: MapOptions);
      }

      interface MapOptions {
        center?: LatLng;
        zoom?: number;
        // Add other options as needed
      }

      class LatLng {
        constructor(lat: number, lng: number);
      }

      class LatLngBounds {
        constructor(sw?: LatLng, ne?: LatLng);
        extend(point: LatLng): void;
      }

      namespace places {
        class Autocomplete {
          constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
          addListener(event: string, handler: Function): void;
          getPlace(): PlaceResult;
        }

        interface AutocompleteOptions {
          bounds?: LatLngBounds;
          componentRestrictions?: ComponentRestrictions;
          types?: string[];
          strictBounds?: boolean;
        }

        interface ComponentRestrictions {
          country: string;
        }

        interface PlaceResult {
          formatted_address?: string;
          geometry?: {
            location?: LatLng;
          };
          // Add other properties as needed
        }
      }
    }
  }
}

export {};