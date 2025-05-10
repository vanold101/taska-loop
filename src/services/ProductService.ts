// Mock product database with barcodes
interface Product {
  barcode: string;
  name: string;
  defaultPrice?: number;
  defaultCategory?: string;
  unit?: string; // Unit ID (e.g., 'kg', 'lb', 'ea')
  imageUrl?: string;
}

// Mock products - in a real app, this would be from an API or database
const mockProducts: Product[] = [
  { 
    barcode: "0123456789012", 
    name: "Organic Milk", 
    defaultPrice: 3.99,
    defaultCategory: "Dairy",
    unit: "gal"
  },
  { 
    barcode: "5901234123457", 
    name: "Whole Wheat Bread", 
    defaultPrice: 2.49,
    defaultCategory: "Bakery",
    unit: "ea"
  },
  { 
    barcode: "9780201379624", 
    name: "Organic Bananas", 
    defaultPrice: 1.99,
    defaultCategory: "Produce",
    unit: "lb"
  },
  { 
    barcode: "4006381333931", 
    name: "Extra Virgin Olive Oil", 
    defaultPrice: 8.99,
    defaultCategory: "Oils & Vinegars",
    unit: "floz"
  },
  { 
    barcode: "8410154011417", 
    name: "Cereal", 
    defaultPrice: 4.29,
    defaultCategory: "Breakfast",
    unit: "box"
  },
  { 
    barcode: "3800020430781", 
    name: "Pasta Sauce", 
    defaultPrice: 3.49,
    defaultCategory: "Canned Goods",
    unit: "can"
  },
  { 
    barcode: "7622210100221", 
    name: "Chocolate Bar", 
    defaultPrice: 2.25,
    defaultCategory: "Snacks",
    unit: "ea"
  },
  { 
    barcode: "5449000000996", 
    name: "Coca-Cola", 
    defaultPrice: 1.79,
    defaultCategory: "Beverages",
    unit: "bottle"
  },
  { 
    barcode: "8000500310427", 
    name: "Nutella", 
    defaultPrice: 4.99,
    defaultCategory: "Spreads",
    unit: "jar"
  }
];

/**
 * Look up a product by its barcode
 * @param barcode The barcode to search for
 * @returns The product if found, null otherwise
 */
export const findProductByBarcode = (barcode: string): Product | null => {
  const product = mockProducts.find(p => p.barcode === barcode);
  return product || null;
};

/**
 * Save a new product to the database
 * In a real app, this would save to a server or database
 * @param product The product to save
 */
export const saveProduct = (product: Product): void => {
  // This is a mock implementation
  const existingIndex = mockProducts.findIndex(p => p.barcode === product.barcode);
  if (existingIndex >= 0) {
    mockProducts[existingIndex] = product;
  } else {
    mockProducts.push(product);
  }
  // In a real app, we would save to local storage, IndexedDB, or a server
  console.log("Product saved:", product);
};

/**
 * Get all products
 * @returns All products in the database
 */
export const getAllProducts = (): Product[] => {
  return [...mockProducts];
};

export type { Product }; 