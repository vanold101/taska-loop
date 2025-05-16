export interface GroceryCategory {
  id: string;
  name: string;
  keywords?: string[]; // Keywords to help match items to this category
  icon?: string; // Optional: for UI display
}

export const groceryCategories: GroceryCategory[] = [
  { id: 'produce', name: 'Produce', keywords: ['fruit', 'vegetable', 'apple', 'banana', 'orange', 'berry', 'berries', 'grape', 'tomato', 'potato', 'onion', 'carrot', 'broccoli', 'spinach', 'lettuce', 'salad'] },
  { id: 'dairy', name: 'Dairy & Eggs', keywords: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg'] },
  { id: 'meat', name: 'Meat & Seafood', keywords: ['meat', 'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'sausage', 'bacon'] },
  { id: 'bakery', name: 'Bakery & Bread', keywords: ['bread', 'bagel', 'bun', 'croissant', 'muffin', 'cake', 'pie', 'cookie', 'pastry'] },
  { id: 'pantry', name: 'Pantry', keywords: ['pasta', 'rice', 'flour', 'sugar', 'cereal', 'oats', 'canned', 'soup', 'sauce', 'oil', 'vinegar', 'spice', 'condiment', 'jam', 'honey', 'peanut butter', 'nut', 'seed'] },
  { id: 'frozen', name: 'Frozen Foods', keywords: ['frozen', 'ice cream', 'pizza', 'waffle', 'dessert'] },
  { id: 'beverages', name: 'Beverages', keywords: ['water', 'juice', 'soda', 'tea', 'coffee', 'drink', 'beverage'] },
  { id: 'snacks', name: 'Snacks', keywords: ['chip', 'cracker', 'pretzel', 'popcorn', 'candy', 'chocolate', 'bar'] },
  { id: 'household', name: 'Household & Cleaning', keywords: ['paper towel', 'toilet paper', 'soap', 'detergent', 'cleaner', 'trash bag', 'sponge'] },
  { id: 'personal_care', name: 'Personal Care', keywords: ['shampoo', 'conditioner', 'toothpaste', 'deodorant', 'lotion'] },
  { id: 'baby', name: 'Baby Items', keywords: ['diaper', 'formula', 'baby food', 'wipe'] },
  { id: 'pets', name: 'Pet Supplies', keywords: ['pet food', 'cat food', 'dog food', 'litter', 'pet toy'] },
  { id: 'other', name: 'Other', keywords: [] }
];

export const categoriesMap: Record<string, GroceryCategory> = 
  groceryCategories.reduce((acc, category) => ({ ...acc, [category.id]: category }), {});

/**
 * Suggests a category for a given item name based on keywords.
 * @param itemName The name of the item.
 * @returns A suggested CategoryId or 'other' if no specific match.
 */
export function suggestCategoryForItem(itemName: string): string {
  if (!itemName) return 'other';
  const lowerItemName = itemName.toLowerCase();

  for (const category of groceryCategories) {
    if (category.keywords) {
      for (const keyword of category.keywords) {
        if (lowerItemName.includes(keyword)) {
          return category.id;
        }
      }
    }
  }
  return 'other'; // Default category
} 