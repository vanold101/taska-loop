import { fetchProductFromOpenFoodFacts } from '../OpenFoodFactsService';
import { ScannedItem } from '@/components/BarcodeScannerButton';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

describe('OpenFoodFactsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('fetchProductFromOpenFoodFacts', () => {
    // Test case 1: API Connection with proper headers
    it('should make a request with the correct URL and headers', async () => {
      // Setup mock
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          status: 1, 
          product: { product_name: 'Test Product' } 
        }),
      });
      
      // Execute service
      await fetchProductFromOpenFoodFacts('1234567890');
      
      // Verify
      expect(fetch).toHaveBeenCalledWith(
        'https://world.openfoodfacts.org/api/v2/product/1234567890.json',
        {
          headers: {
            'User-Agent': expect.stringContaining('Taska-Loop'),
          },
        }
      );
    });
    
    // Test case 2: Successful product retrieval and data mapping
    it('should parse the response and return product details correctly', async () => {
      // Setup mock with complete product data
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 1,
          product: {
            product_name: 'Test Product',
            brands: 'Test Brand',
            image_front_url: 'https://example.com/image.jpg',
            categories: 'Snacks, Chips',
            ingredients_text: 'Test ingredients',
            quantity: '100g',
            nutriscore_grade: 'a',
            ecoscore_grade: 'b',
            nova_group: 3,
            stores: 'Walmart, Target'
          }
        }),
      });
      
      // Execute service
      const result = await fetchProductFromOpenFoodFacts('1234567890');
      
      // Verify complete data mapping
      expect(result).toEqual({
        name: 'Test Product',
        brand: 'Test Brand',
        image: 'https://example.com/image.jpg',
        category: 'Snacks, Chips',
        ingredients: 'Test ingredients',
        quantity: '100g',
        nutriscore: 'a',
        ecoscore: 'b',
        novaGroup: 3,
        stores: 'Walmart, Target'
      });
    });
    
    // Test case 3: Barcode normalization
    it('should normalize barcodes by removing leading zeros', async () => {
      // Setup mock
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          status: 1, 
          product: { product_name: 'Test Product' } 
        }),
      });
      
      // Execute service with leading zeros
      await fetchProductFromOpenFoodFacts('00001234567890');
      
      // Verify zeros were removed
      expect(fetch).toHaveBeenCalledWith(
        'https://world.openfoodfacts.org/api/v2/product/1234567890.json',
        expect.any(Object)
      );
    });
    
    // Test case 4: Error handling for API failure
    it('should handle API errors gracefully and return null', async () => {
      // Setup mock for API error
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      
      // Execute service
      const result = await fetchProductFromOpenFoodFacts('1234567890');
      
      // Verify null is returned on error
      expect(result).toBeNull();
    });
    
    // Test case 5: When product is not found
    it('should return null when the product is not found', async () => {
      // Setup mock for product not found
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 0 }),
      });
      
      // Execute service
      const result = await fetchProductFromOpenFoodFacts('1234567890');
      
      // Verify null is returned when product not found
      expect(result).toBeNull();
    });
    
    // Test case 6: Handling network failures
    it('should handle network errors and return null', async () => {
      // Setup mock for network error
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      // Execute service
      const result = await fetchProductFromOpenFoodFacts('1234567890');
      
      // Verify null is returned on network error
      expect(result).toBeNull();
    });
    
    // Test case 7: Handling partial data
    it('should handle partial product data correctly', async () => {
      // Setup mock with partial data
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 1,
          product: {
            // Only providing name, missing other fields
            product_name: 'Partial Product',
          }
        }),
      });
      
      // Execute service
      const result = await fetchProductFromOpenFoodFacts('1234567890');
      
      // Verify defaults are used for missing fields
      expect(result).toEqual({
        name: 'Partial Product',
        brand: '',
        image: '',
        category: '',
        ingredients: '',
        quantity: '',
        nutriscore: '',
        ecoscore: '',
        novaGroup: undefined,
        stores: ''
      });
    });
  });
}); 