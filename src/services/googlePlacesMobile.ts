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
  private apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAB-h4_VucPyVktYcdIW5At9edXaQXRL10';

  async getPlacePredictions(input: string): Promise<PlaceResult[]> {
    if (input.length < 3) {
      return [];
    }

    try {
      // Enhanced search parameters for better store search
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&key=${this.apiKey}&types=establishment&components=country:us&radius=50000&location=40.1451,-83.0753`
      );
      
      const data = await response.json();
      
      if (data.predictions) {
        // Filter and prioritize store results
        const predictions = data.predictions as PlaceResult[];
        
        // Prioritize common store chains
        const storeChains = ['walmart', 'target', 'kroger', 'meijer', 'giant eagle', 'costco', 'home depot', 'lowes', 'cvs', 'walgreens'];
        
        return predictions.sort((a, b) => {
          const aIsStore = storeChains.some(chain => a.description.toLowerCase().includes(chain));
          const bIsStore = storeChains.some(chain => b.description.toLowerCase().includes(chain));
          
          if (aIsStore && !bIsStore) return -1;
          if (!aIsStore && bIsStore) return 1;
          return 0;
        });
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching place predictions:', error);
      // Return enhanced mock data for testing
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
      // Powell area stores
      {
        place_id: '1',
        description: 'Walmart Supercenter, Powell, OH',
        structured_formatting: {
          main_text: 'Walmart Supercenter',
          secondary_text: 'Powell, OH'
        }
      },
      {
        place_id: '2',
        description: 'Giant Eagle, Powell, OH',
        structured_formatting: {
          main_text: 'Giant Eagle',
          secondary_text: 'Powell, OH'
        }
      },
      {
        place_id: '3',
        description: 'Kroger, Powell, OH',
        structured_formatting: {
          main_text: 'Kroger',
          secondary_text: 'Powell, OH'
        }
      },
      // Dublin area stores
      {
        place_id: '4',
        description: 'Target, Dublin, OH',
        structured_formatting: {
          main_text: 'Target',
          secondary_text: 'Dublin, OH'
        }
      },
      {
        place_id: '5',
        description: 'Meijer, Dublin, OH',
        structured_formatting: {
          main_text: 'Meijer',
          secondary_text: 'Dublin, OH'
        }
      },
      // Delaware area stores
      {
        place_id: '6',
        description: 'Kroger, Delaware, OH',
        structured_formatting: {
          main_text: 'Kroger',
          secondary_text: 'Delaware, OH'
        }
      },
      {
        place_id: '7',
        description: 'Walmart Supercenter, Delaware, OH',
        structured_formatting: {
          main_text: 'Walmart Supercenter',
          secondary_text: 'Delaware, OH'
        }
      },
      // Westerville area stores
      {
        place_id: '8',
        description: 'Giant Eagle, Westerville, OH',
        structured_formatting: {
          main_text: 'Giant Eagle',
          secondary_text: 'Westerville, OH'
        }
      },
      {
        place_id: '9',
        description: 'Home Depot, Westerville, OH',
        structured_formatting: {
          main_text: 'Home Depot',
          secondary_text: 'Westerville, OH'
        }
      },
      {
        place_id: '10',
        description: 'Costco Wholesale, Westerville, OH',
        structured_formatting: {
          main_text: 'Costco Wholesale',
          secondary_text: 'Westerville, OH'
        }
      }
    ];

    // Enhanced filtering for better search matches
    const searchTerms = input.toLowerCase().split(' ');
    
    return mockData.filter(item => {
      const description = item.description.toLowerCase();
      const mainText = item.structured_formatting.main_text.toLowerCase();
      const secondaryText = item.structured_formatting.secondary_text.toLowerCase();
      
      // Check if all search terms match either the description, main text, or secondary text
      return searchTerms.every(term => 
        description.includes(term) || 
        mainText.includes(term) || 
        secondaryText.includes(term)
      );
    }).slice(0, 5); // Limit to top 5 results
  }
}

export const googlePlacesMobileService = new GooglePlacesMobileService();
