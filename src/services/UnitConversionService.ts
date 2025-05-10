// Define unit types
export type UnitType = 'weight' | 'volume' | 'length' | 'quantity' | 'package';

// Define unit systems
export type UnitSystem = 'metric' | 'imperial' | 'universal';

// Define unit definition with conversion factors
export interface UnitDefinition {
  id: string;
  name: string;
  abbreviation: string;
  type: UnitType;
  system: UnitSystem;
  // Conversion factor to base unit (e.g., 1 kg = 1000g, so factor for kg is 1000)
  conversionFactor: number;
  // Common food items that typically use this unit
  commonItems?: string[];
}

// Define base units for each type
const baseUnits: Record<UnitType, string> = {
  weight: 'g',    // gram is base unit for weight
  volume: 'ml',   // milliliter is base unit for volume
  length: 'cm',   // centimeter is base unit for length
  quantity: 'ea', // each/unit is base unit for quantity
  package: 'pkg'  // package is its own unit
};

// Define all available units
export const units: UnitDefinition[] = [
  // Weight units
  {
    id: 'g',
    name: 'Gram',
    abbreviation: 'g',
    type: 'weight',
    system: 'metric',
    conversionFactor: 1,
    commonItems: ['spices', 'flour', 'sugar']
  },
  {
    id: 'kg',
    name: 'Kilogram',
    abbreviation: 'kg',
    type: 'weight',
    system: 'metric',
    conversionFactor: 1000,
    commonItems: ['potatoes', 'rice', 'onions']
  },
  {
    id: 'oz',
    name: 'Ounce',
    abbreviation: 'oz',
    type: 'weight',
    system: 'imperial',
    conversionFactor: 28.35, // 1 oz = 28.35g
    commonItems: ['meat', 'cheese']
  },
  {
    id: 'lb',
    name: 'Pound',
    abbreviation: 'lb',
    type: 'weight',
    system: 'imperial',
    conversionFactor: 453.59, // 1 lb = 453.59g
    commonItems: ['meat', 'fruits', 'vegetables']
  },
  
  // Volume units
  {
    id: 'ml',
    name: 'Milliliter',
    abbreviation: 'ml',
    type: 'volume',
    system: 'metric',
    conversionFactor: 1,
    commonItems: ['sauce', 'oil']
  },
  {
    id: 'l',
    name: 'Liter',
    abbreviation: 'L',
    type: 'volume',
    system: 'metric',
    conversionFactor: 1000,
    commonItems: ['milk', 'juice', 'water']
  },
  {
    id: 'floz',
    name: 'Fluid Ounce',
    abbreviation: 'fl oz',
    type: 'volume',
    system: 'imperial',
    conversionFactor: 29.57, // 1 fl oz = 29.57ml
    commonItems: ['beverages']
  },
  {
    id: 'cup',
    name: 'Cup',
    abbreviation: 'cup',
    type: 'volume',
    system: 'imperial',
    conversionFactor: 236.59, // 1 cup = 236.59ml
    commonItems: ['flour', 'sugar', 'rice']
  },
  {
    id: 'pt',
    name: 'Pint',
    abbreviation: 'pt',
    type: 'volume',
    system: 'imperial',
    conversionFactor: 473.18, // 1 pint = 473.18ml
    commonItems: ['berries', 'ice cream']
  },
  {
    id: 'qt',
    name: 'Quart',
    abbreviation: 'qt',
    type: 'volume',
    system: 'imperial',
    conversionFactor: 946.35, // 1 quart = 946.35ml
    commonItems: ['milk']
  },
  {
    id: 'gal',
    name: 'Gallon',
    abbreviation: 'gal',
    type: 'volume',
    system: 'imperial',
    conversionFactor: 3785.41, // 1 gallon = 3785.41ml
    commonItems: ['milk', 'water']
  },
  
  // Quantity units
  {
    id: 'ea',
    name: 'Each',
    abbreviation: 'ea',
    type: 'quantity',
    system: 'universal',
    conversionFactor: 1,
    commonItems: ['eggs', 'fruit', 'canned goods']
  },
  {
    id: 'dozen',
    name: 'Dozen',
    abbreviation: 'doz',
    type: 'quantity',
    system: 'universal',
    conversionFactor: 12, // 1 dozen = 12 items
    commonItems: ['eggs', 'pastries', 'donuts']
  },
  
  // Package units
  {
    id: 'pkg',
    name: 'Package',
    abbreviation: 'pkg',
    type: 'package',
    system: 'universal',
    conversionFactor: 1,
    commonItems: ['pasta', 'bacon', 'cheese']
  },
  {
    id: 'box',
    name: 'Box',
    abbreviation: 'box',
    type: 'package',
    system: 'universal',
    conversionFactor: 1,
    commonItems: ['cereal', 'crackers']
  },
  {
    id: 'can',
    name: 'Can',
    abbreviation: 'can',
    type: 'package',
    system: 'universal',
    conversionFactor: 1,
    commonItems: ['soup', 'beans', 'tomatoes']
  },
  {
    id: 'bottle',
    name: 'Bottle',
    abbreviation: 'btl',
    type: 'package',
    system: 'universal',
    conversionFactor: 1,
    commonItems: ['soda', 'wine', 'oils']
  }
];

// Map of unit IDs to UnitDefinitions for quick lookup
export const unitsMap: Record<string, UnitDefinition> = 
  units.reduce((acc, unit) => ({ ...acc, [unit.id]: unit }), {});

/**
 * Convert a value from one unit to another
 * @param value - The value to convert
 * @param fromUnitId - The source unit ID
 * @param toUnitId - The target unit ID
 * @returns The converted value, or null if conversion is not possible
 */
export const convertUnit = (
  value: number,
  fromUnitId: string,
  toUnitId: string
): number | null => {
  const fromUnit = unitsMap[fromUnitId];
  const toUnit = unitsMap[toUnitId];
  
  if (!fromUnit || !toUnit) {
    return null;
  }
  
  // Can only convert between same types
  if (fromUnit.type !== toUnit.type) {
    return null;
  }
  
  // Convert to base unit, then to target unit
  const baseValue = value * fromUnit.conversionFactor;
  return baseValue / toUnit.conversionFactor;
};

/**
 * Get units by type
 * @param unitType - The type of units to get
 * @returns An array of unit definitions of the specified type
 */
export const getUnitsByType = (unitType: UnitType): UnitDefinition[] => {
  return units.filter(unit => unit.type === unitType);
};

/**
 * Get units commonly used for a specific item
 * @param itemName - The name of the item
 * @returns An array of units commonly used for the item
 */
export const getUnitsForItem = (itemName: string): UnitDefinition[] => {
  const normalizedName = itemName.toLowerCase().trim();
  
  return units.filter(unit => 
    unit.commonItems?.some(item => 
      normalizedName.includes(item) || item.includes(normalizedName)
    )
  );
};

/**
 * Guess the most appropriate unit for an item by name
 * @param itemName - The name of the item
 * @returns The most likely unit, defaulting to 'ea' if no match
 */
export const guessUnitForItem = (itemName: string): UnitDefinition => {
  const suggestions = getUnitsForItem(itemName);
  
  if (suggestions.length === 0) {
    return unitsMap['ea']; // Default to 'each' if no specific unit found
  }
  
  // If multiple suggestions, prefer quantity > weight > volume > package
  const priorityOrder: UnitType[] = ['quantity', 'weight', 'volume', 'package'];
  
  for (const type of priorityOrder) {
    const typeMatch = suggestions.find(unit => unit.type === type);
    if (typeMatch) {
      return typeMatch;
    }
  }
  
  return suggestions[0];
};

/**
 * Format a value with its unit
 * @param value - The numeric value
 * @param unitId - The unit ID
 * @returns Formatted string (e.g., "2 kg")
 */
export const formatValueWithUnit = (value: number, unitId: string): string => {
  const unit = unitsMap[unitId];
  
  if (!unit) {
    return `${value}`;
  }
  
  return `${value} ${unit.abbreviation}`;
}; 