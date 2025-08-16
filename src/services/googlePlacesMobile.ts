export interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
}

class GooglePlacesMobileService {
  private apiKey = 'AIzaSyAB-h4_VucPyVktYcdIW5At9edXaQXRL10';

  async getPlacePredictions(input: string): Promise<PlaceResult[]> {
    if (input.length < 3) {
      return [];
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&key=${this.apiKey}&types=establishment|geocode&components=country:us`
      );
      
      const data = await response.json();
      
      if (data.predictions) {
        return data.predictions as PlaceResult[];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching place predictions:', error);
      // Return mock data for testing
      return this.getMockPredictions(input);
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.apiKey}&fields=place_id,name,formatted_address,geometry,types`
      );
      
      const data = await response.json();
      
      if (data.result) {
        return data.result as PlaceDetails;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  private getMockPredictions(input: string): PlaceResult[] {
    const mockData = [
      {
        place_id: '1',
        description: 'Walmart Supercenter, Columbus, OH',
        structured_formatting: {
          main_text: 'Walmart Supercenter',
          secondary_text: 'Columbus, OH'
        }
      },
      {
        place_id: '2',
        description: 'Target, Columbus, OH',
        structured_formatting: {
          main_text: 'Target',
          secondary_text: 'Columbus, OH'
        }
      },
      {
        place_id: '3',
        description: 'Kroger, Columbus, OH',
        structured_formatting: {
          main_text: 'Kroger',
          secondary_text: 'Columbus, OH'
        }
      },
      {
        place_id: '4',
        description: 'Costco, Columbus, OH',
        structured_formatting: {
          main_text: 'Costco',
          secondary_text: 'Columbus, OH'
        }
      },
      {
        place_id: '5',
        description: 'Home Depot, Columbus, OH',
        structured_formatting: {
          main_text: 'Home Depot',
          secondary_text: 'Columbus, OH'
        }
      }
    ];

    return mockData.filter(item => 
      item.description.toLowerCase().includes(input.toLowerCase())
    );
  }
}

export const googlePlacesMobileService = new GooglePlacesMobileService();
