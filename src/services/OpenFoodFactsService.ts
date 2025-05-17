import { ScannedItem } from "@/components/BarcodeScannerButton";

// Define an interface for the Open Food Facts API response
interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    image_url?: string;
    image_front_url?: string;
    image_ingredients_url?: string;
    image_nutrition_url?: string;
    categories_tags?: string[];
    categories?: string;
    ingredients_text?: string;
    quantity?: string;
    nutriments?: {
      [key: string]: number;
    };
    nutriscore_grade?: string;
    ecoscore_grade?: string;
    nova_group?: number;
    labels?: string;
    allergens_tags?: string[];
    stores?: string;
    countries?: string;
  };
  status: number;
  status_verbose: string;
}

// App-specific configuration
const APP_NAME = "Taska-Loop";
const APP_VERSION = "1.0";
const APP_CONTACT = "your-contact@email.com"; // Replace with your contact

// Open Food Facts API base URL
const API_BASE_URL = "https://world.openfoodfacts.org/api/v2";

/**
 * Fetches product details from Open Food Facts API using a barcode
 * @param barcode The product barcode (GTIN, EAN, UPC, etc.)
 * @returns Product details or null if not found
 */
export async function fetchProductFromOpenFoodFacts(
  barcode: string
): Promise<Omit<ScannedItem, "upc"> | null> {
  try {
    // Normalize the barcode (remove leading zeros if needed)
    const normalizedBarcode = barcode.replace(/^0+/, "");
    
    // Construct the API URL
    const url = `${API_BASE_URL}/product/${normalizedBarcode}.json`;
    
    // Make the API request with proper User-Agent header
    const response = await fetch(url, {
      headers: {
        "User-Agent": `${APP_NAME}/${APP_VERSION} (${APP_CONTACT})`,
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      return null;
    }

    // Parse the response
    const data: OpenFoodFactsProduct = await response.json();
    
    // Check if the product was found
    if (data.status === 0 || !data.product) {
      console.log("Open Food Facts: Product not found", data);
      return null;
    }

    // Extract relevant product details
    return {
      name: data.product.product_name || "",
      brand: data.product.brands || "",
      image: data.product.image_front_url || data.product.image_url || "",
      // Additional data we could return:
      category: data.product.categories || "",
      ingredients: data.product.ingredients_text || "",
      quantity: data.product.quantity || "",
      nutriscore: data.product.nutriscore_grade || "",
      ecoscore: data.product.ecoscore_grade || "",
      novaGroup: data.product.nova_group,
      stores: data.product.stores || "",
    };
  } catch (error) {
    console.error("Error fetching from Open Food Facts API:", error);
    return null;
  }
}

/**
 * Adds a product to Open Food Facts database
 * Note: This requires authentication, so it's commented out for now
 */
// export async function addProductToOpenFoodFacts(
//   barcode: string,
//   productData: {
//     product_name: string;
//     brands?: string;
//     quantity?: string;
//     categories?: string;
//     // Add more fields as needed
//   }
// ): Promise<boolean> {
//   // Implementation would go here
//   // This would require user authentication with OFF
//   return false;
// }

export default {
  fetchProductFromOpenFoodFacts,
}; 