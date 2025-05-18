import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { describe, it, expect } from 'vitest';
import ProductDetails from '../ProductDetails';
import { ScannedItem } from '../BarcodeScannerButton';

describe('ProductDetails Component', () => {
  // Test 1: Basic rendering with minimal data
  it('renders basic product information correctly', () => {
    const minimalProduct: ScannedItem = {
      upc: '1234567890',
      name: 'Test Product',
      brand: 'Test Brand'
    };
    
    render(<ProductDetails product={minimalProduct} />);
    
    // Verify basic information is displayed
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText(/Barcode: 1234567890/)).toBeInTheDocument();
  });
  
  // Test 2: Renders with nutritional data (Nutri-Score)
  it('renders Nutri-Score information when available', () => {
    const productWithNutriScore: ScannedItem = {
      upc: '1234567890',
      name: 'Healthy Product',
      nutriscore: 'a'
    };
    
    render(<ProductDetails product={productWithNutriScore} />);
    
    // Verify Nutri-Score is displayed
    expect(screen.getByText('Nutri-Score')).toBeInTheDocument();
    // Use a more specific query for the score
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             element?.className.includes('rounded-full') && 
             content === 'A';
    })).toBeInTheDocument();
    expect(screen.getByText('Excellent nutritional quality')).toBeInTheDocument();
  });
  
  // Test 3: Renders with environmental data (Eco-Score)
  it('renders Eco-Score information when available', () => {
    const productWithEcoScore: ScannedItem = {
      upc: '1234567890',
      name: 'Eco-Friendly Product',
      ecoscore: 'b'
    };
    
    render(<ProductDetails product={productWithEcoScore} />);
    
    // Verify Eco-Score is displayed
    expect(screen.getByText('Eco-Score')).toBeInTheDocument();
    // Use a more specific query for the score
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             element?.className.includes('rounded-full') && 
             content === 'B';
    })).toBeInTheDocument();
    expect(screen.getByText('Low environmental impact')).toBeInTheDocument();
  });
  
  // Test 4: Renders with NOVA Group data
  it('renders NOVA Group information when available', () => {
    const productWithNovaGroup: ScannedItem = {
      upc: '1234567890',
      name: 'Minimally Processed Product',
      novaGroup: 1
    };
    
    render(<ProductDetails product={productWithNovaGroup} />);
    
    // Verify NOVA Group is displayed
    expect(screen.getByText('NOVA Group')).toBeInTheDocument();
    // Use a more specific query for the score
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && 
             element?.className.includes('rounded-full') && 
             content === '1';
    })).toBeInTheDocument();
    expect(screen.getByText('Unprocessed or minimally processed foods')).toBeInTheDocument();
  });
  
  // Test 5: Renders with all nutritional and environmental data
  it('renders complete product information with all data points', () => {
    const completeProduct: ScannedItem = {
      upc: '1234567890',
      name: 'Complete Product',
      brand: 'Healthy Brand',
      image: 'https://example.com/image.jpg',
      category: 'Healthy Foods',
      ingredients: 'Organic ingredients, No additives',
      quantity: '250g',
      nutriscore: 'a',
      ecoscore: 'a',
      novaGroup: 1,
      stores: 'Whole Foods, Trader Joe\'s'
    };
    
    render(<ProductDetails product={completeProduct} />);
    
    // Verify all information is displayed
    expect(screen.getByText('Complete Product')).toBeInTheDocument();
    expect(screen.getByText('Healthy Brand')).toBeInTheDocument();
    expect(screen.getByText('250g')).toBeInTheDocument();
    expect(screen.getByText(/Found at: Whole Foods, Trader Joe's/)).toBeInTheDocument();
    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('Organic ingredients, No additives')).toBeInTheDocument();
    
    // Check scores - using more specific queries
    expect(screen.getByText('Nutri-Score')).toBeInTheDocument();
    expect(screen.getByText('Very low environmental impact')).toBeInTheDocument();
    expect(screen.getByText('NOVA Group')).toBeInTheDocument();
    expect(screen.getByText('Unprocessed or minimally processed foods')).toBeInTheDocument();
  });
  
  // Test 6: Verify Open Food Facts attribution is always present
  it('always displays the Open Food Facts attribution', () => {
    const minimalProduct: ScannedItem = {
      upc: '1234567890',
      name: 'Simple Product'
    };
    
    render(<ProductDetails product={minimalProduct} />);
    
    // Verify attribution is displayed - using partial text matches
    // The text may be broken up into multiple elements
    expect(screen.getByText(/Product data provided by/)).toBeInTheDocument();
    expect(screen.getByText('Open Food Facts')).toBeInTheDocument();
    expect(screen.getByText(/available under the/)).toBeInTheDocument();
    expect(screen.getByText('Open Database License')).toBeInTheDocument();
  });
}); 