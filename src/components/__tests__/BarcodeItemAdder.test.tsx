import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import BarcodeItemAdder from '../BarcodeItemAdder';
import { TripItem } from '../TripDetailModal';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ScannedItem } from '../BarcodeScannerButton';

// Define types for mock component props
interface ScannerButtonProps {
  onItemScanned: (item: ScannedItem) => void;
  buttonText?: string;
}

interface ProductDetailsProps {
  product: ScannedItem;
}

interface DrawerProps {
  children: React.ReactNode;
  open?: boolean;
}

interface DrawerChildProps {
  children: React.ReactNode;
}

// Mock the BarcodeScannerButton component
vi.mock('../BarcodeScannerButton', () => ({
  __esModule: true,
  default: ({ onItemScanned, buttonText }: ScannerButtonProps) => (
    <button 
      data-testid="barcode-scanner-button" 
      onClick={() => onItemScanned({
        upc: '1234567890',
        name: 'Mocked Product',
        brand: 'Mocked Brand',
        image: 'https://example.com/image.jpg',
        category: 'Snacks',
        nutriscore: 'a'
      })}
    >
      {buttonText}
    </button>
  )
}));

// Mock the ProductDetails component
vi.mock('../ProductDetails', () => ({
  __esModule: true,
  default: ({ product }: ProductDetailsProps) => (
    <div data-testid="product-details">
      <div>Name: {product.name}</div>
      <div>Brand: {product.brand}</div>
      <div>Barcode: {product.upc}</div>
    </div>
  )
}));

// Mock drawer components
vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({ children, open }: DrawerProps) => open ? <div data-testid="drawer">{children}</div> : null,
  DrawerContent: ({ children }: DrawerChildProps) => <div data-testid="drawer-content">{children}</div>,
  DrawerHeader: ({ children }: DrawerChildProps) => <div data-testid="drawer-header">{children}</div>,
  DrawerTitle: ({ children }: DrawerChildProps) => <div data-testid="drawer-title">{children}</div>,
  DrawerDescription: ({ children }: DrawerChildProps) => <div data-testid="drawer-description">{children}</div>,
  DrawerFooter: ({ children }: DrawerChildProps) => <div data-testid="drawer-footer">{children}</div>,
  DrawerClose: ({ children }: DrawerChildProps) => <div data-testid="drawer-close">{children}</div>,
}));

describe('BarcodeItemAdder Component', () => {
  const mockOnAddItem = vi.fn();
  const mockTripId = 'trip-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  // Test 1: Check if component renders correctly
  it('renders the component with scanner button', () => {
    render(<BarcodeItemAdder tripId={mockTripId} onAddItem={mockOnAddItem} />);
    
    // Verify scanner button is rendered
    expect(screen.getByTestId('barcode-scanner-button')).toBeInTheDocument();
    expect(screen.getByText('Scan & Add Item')).toBeInTheDocument();
    
    // Drawer should not be open initially
    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });
  
  // Test 2: Test opening drawer when a product is scanned
  it('opens drawer with product details when item is scanned', async () => {
    render(<BarcodeItemAdder tripId={mockTripId} onAddItem={mockOnAddItem} />);
    
    // Click the scanner button to simulate a scan
    fireEvent.click(screen.getByTestId('barcode-scanner-button'));
    
    // Drawer should open with product details
    await waitFor(() => {
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
      expect(screen.getByTestId('product-details')).toBeInTheDocument();
      expect(screen.getByText('Name: Mocked Product')).toBeInTheDocument();
      expect(screen.getByText('Brand: Mocked Brand')).toBeInTheDocument();
    });
  });
  
  // Test 3: Test adding item to trip
  it('adds item to trip when Add to Trip button is clicked', async () => {
    render(<BarcodeItemAdder tripId={mockTripId} onAddItem={mockOnAddItem} />);
    
    // Click the scanner button to simulate a scan
    fireEvent.click(screen.getByTestId('barcode-scanner-button'));
    
    // Wait for drawer to open
    await waitFor(() => {
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });
    
    // Click the Add to Trip button
    fireEvent.click(screen.getByText('Add to Trip'));
    
    // Verify onAddItem was called with correct data
    expect(mockOnAddItem).toHaveBeenCalledTimes(1);
    expect(mockOnAddItem).toHaveBeenCalledWith(mockTripId, expect.objectContaining({
      name: 'Mocked Product',
      quantity: 1,
      category: 'Snacks',
      checked: false
    }));
    
    // Drawer should close after adding
    await waitFor(() => {
      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
    });
  });
  
  // Test 4: Test quantity adjustment
  it('adjusts quantity when +/- buttons are clicked', async () => {
    render(<BarcodeItemAdder tripId={mockTripId} onAddItem={mockOnAddItem} />);
    
    // Click the scanner button to simulate a scan
    fireEvent.click(screen.getByTestId('barcode-scanner-button'));
    
    // Wait for drawer to open
    await waitFor(() => {
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });
    
    // Initial quantity should be 1
    const quantityInput = screen.getByRole('spinbutton', { name: /quantity/i });
    expect(quantityInput).toHaveValue(1);
    
    // Click the + button twice
    const incrementButton = screen.getByText('+');
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    expect(quantityInput).toHaveValue(3);
    
    // Click the - button once
    const decrementButton = screen.getByText('-');
    fireEvent.click(decrementButton);
    expect(quantityInput).toHaveValue(2);
    
    // Add item with adjusted quantity
    fireEvent.click(screen.getByText('Add to Trip'));
    
    // Verify onAddItem was called with adjusted quantity
    expect(mockOnAddItem).toHaveBeenCalledWith(mockTripId, expect.objectContaining({
      quantity: 2
    }));
  });
  
  // Test 5: Test price input
  it('adds price when entered', async () => {
    render(<BarcodeItemAdder tripId={mockTripId} onAddItem={mockOnAddItem} />);
    
    // Click the scanner button to simulate a scan
    fireEvent.click(screen.getByTestId('barcode-scanner-button'));
    
    // Wait for drawer to open
    await waitFor(() => {
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });
    
    // Enter a price
    const priceInput = screen.getByRole('spinbutton', { name: /price/i });
    fireEvent.change(priceInput, { target: { value: '4.99' } });
    
    // Add item with price
    fireEvent.click(screen.getByText('Add to Trip'));
    
    // Verify onAddItem was called with price
    expect(mockOnAddItem).toHaveBeenCalledWith(mockTripId, expect.objectContaining({
      price: 4.99
    }));
  });
  
  // Test 6: Test cancel button
  it('closes drawer without adding item when Cancel is clicked', async () => {
    render(<BarcodeItemAdder tripId={mockTripId} onAddItem={mockOnAddItem} />);
    
    // Click the scanner button to simulate a scan
    fireEvent.click(screen.getByTestId('barcode-scanner-button'));
    
    // Wait for drawer to open
    await waitFor(() => {
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
    });
    
    // Click the Cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Drawer should close
    await waitFor(() => {
      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
    });
    
    // onAddItem should not have been called
    expect(mockOnAddItem).not.toHaveBeenCalled();
  });
}); 