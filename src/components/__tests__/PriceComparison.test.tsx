import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PriceComparison from '../PriceComparison';
import { findBestPrices, getShoppingPlan } from '@/services/priceService';

// Mock window.scrollTo to avoid JSDOM errors with framer-motion
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});

// Mock the priceService functions
vi.mock('@/services/priceService', () => ({
  findBestPrices: vi.fn(),
  getShoppingPlan: vi.fn(),
  calculateDistance: vi.fn(),
  findNearbyGroceryStores: vi.fn(),
  findBestPrice: vi.fn(),
}));

// Mock framer-motion to avoid animation issues
vi.mock('framer-motion', () => {
  const actualFramerMotion = vi.importActual('framer-motion');
  return {
    ...actualFramerMotion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
    },
  };
});

describe('PriceComparison Component', () => {
  const mockItems = ['apple', 'milk', 'bread'];
  const mockUserLocation = { lat: 40.0, lng: -83.0 };
  const mockOnStoreDirections = vi.fn();

  // Mock data that the service would return
  const mockPriceResults = [
    {
      item: 'apple',
      bestPrice: {
        price: 0.99,
        unit: 'each',
        store: {
          id: 'aldi1',
          name: 'Aldi',
          address: '123 Test St',
          coordinates: { lat: 40.1, lng: -83.1 },
          items: {},
        },
        savings: {
          amount: 0.30,
          percentage: 23.26,
        }
      },
      otherStores: [
        {
          store: {
            id: 'kroger1',
            name: 'Kroger',
            address: '456 Test Ave',
            coordinates: { lat: 40.2, lng: -83.2 },
            items: {},
          },
          price: 1.29,
          unit: 'each',
        }
      ]
    },
    {
      item: 'milk',
      bestPrice: {
        price: 2.69,
        unit: 'gallon',
        store: {
          id: 'aldi1',
          name: 'Aldi',
          address: '123 Test St',
          coordinates: { lat: 40.1, lng: -83.1 },
          items: {},
        },
        savings: {
          amount: 0.20,
          percentage: 6.91,
        }
      },
      otherStores: [
        {
          store: {
            id: 'kroger1',
            name: 'Kroger',
            address: '456 Test Ave',
            coordinates: { lat: 40.2, lng: -83.2 },
            items: {},
          },
          price: 2.89,
          unit: 'gallon',
        }
      ]
    },
    {
      item: 'bread',
      bestPrice: {
        price: 1.99,
        unit: 'loaf',
        store: {
          id: 'aldi1',
          name: 'Aldi',
          address: '123 Test St',
          coordinates: { lat: 40.1, lng: -83.1 },
          items: {},
        },
        savings: {
          amount: 0.50,
          percentage: 20.08,
        }
      },
      otherStores: [
        {
          store: {
            id: 'kroger1',
            name: 'Kroger',
            address: '456 Test Ave',
            coordinates: { lat: 40.2, lng: -83.2 },
            items: {},
          },
          price: 2.49,
          unit: 'loaf',
        }
      ]
    }
  ];

  const mockShoppingPlan = {
    storeVisits: [
      {
        store: {
          id: 'aldi1',
          name: 'Aldi',
          address: '123 Test St',
          coordinates: { lat: 40.1, lng: -83.1 },
          items: {},
        },
        items: [
          { item: 'apple', price: 0.99, unit: 'each' },
          { item: 'milk', price: 2.69, unit: 'gallon' },
          { item: 'bread', price: 1.99, unit: 'loaf' },
        ],
        totalCost: 5.67,
      }
    ],
    totalSavings: 1.00,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock implementations
    (findBestPrices as any).mockReturnValue(mockPriceResults);
    (getShoppingPlan as any).mockReturnValue(mockShoppingPlan);
    
    // Mock setTimeout to execute immediately
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test 1: Component renders correctly with items
  it('renders the component correctly with items', () => {
    render(
      <PriceComparison 
        items={mockItems} 
        userLocation={mockUserLocation} 
        onStoreDirections={mockOnStoreDirections} 
      />
    );
    
    // Check if find best prices button is present
    expect(screen.getByText('Find Best Prices')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
  
  // Test 2: Component is disabled with no items
  it('disables the button when there are no items', () => {
    render(
      <PriceComparison 
        items={[]} 
        userLocation={mockUserLocation} 
        onStoreDirections={mockOnStoreDirections} 
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('opacity-70');
    expect(button).toHaveClass('cursor-not-allowed');
  });
  
  // Test 3: Finds best prices when button is clicked
  it('finds best prices when button is clicked', () => {
    render(
      <PriceComparison 
        items={mockItems} 
        userLocation={mockUserLocation} 
        onStoreDirections={mockOnStoreDirections} 
      />
    );
    
    // Click the button
    fireEvent.click(screen.getByText('Find Best Prices'));
    
    // Should show loading state 
    expect(screen.getByText('Finding best prices...')).toBeInTheDocument();
    
    // Fast-forward timer to complete the simulated API call
    vi.advanceTimersByTime(2000);
    
    // Check if services were called with correct parameters
    expect(findBestPrices).toHaveBeenCalledWith(mockItems, mockUserLocation);
    expect(getShoppingPlan).toHaveBeenCalledWith(mockPriceResults);
  });
  
  // Test 4: Verifies findBestPrices is called even when it throws an error
  it('calls findBestPrices when handling errors', () => {
    // Mock the service to throw an error
    (findBestPrices as any).mockImplementation(() => {
      throw new Error('Test error');
    });
    
    render(
      <PriceComparison 
        items={mockItems} 
        userLocation={mockUserLocation} 
        onStoreDirections={mockOnStoreDirections} 
      />
    );
    
    // Click the button
    fireEvent.click(screen.getByText('Find Best Prices'));
    
    // Fast-forward timer
    vi.advanceTimersByTime(2000);
    
    // Verify that findBestPrices was called and threw an error
    expect(findBestPrices).toHaveBeenCalled();
    expect(getShoppingPlan).not.toHaveBeenCalled(); // Should not be called after error
  });
}); 