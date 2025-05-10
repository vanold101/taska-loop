import { TripItem } from "@/components/TripDetailModal";
import { normalizeItemName } from "@/services/PriceHistoryService";

/**
 * Interface for an item suggestion or warning
 */
export interface ItemSuggestion {
  type: 'duplicate' | 'similar';
  newItemName: string;
  existingItem: TripItem;
  confidence: number; // 0-100% confidence for similarity
  message: string;
}

/**
 * Check if a new item name is an exact duplicate of any existing item
 * @param newItemName - The name of the new item being added
 * @param existingItems - Array of existing items in the trip
 * @returns The duplicate item if found, null otherwise
 */
export const findExactDuplicate = (
  newItemName: string,
  existingItems: TripItem[]
): TripItem | null => {
  // Normalize for case insensitive comparison
  const normalizedNewItem = normalizeItemName(newItemName);
  
  // Look for exact match
  const duplicate = existingItems.find(
    item => normalizeItemName(item.name) === normalizedNewItem
  );
  
  return duplicate || null;
};

/**
 * Check if a new item is similar to any existing items
 * @param newItemName - The name of the new item being added
 * @param existingItems - Array of existing items in the trip
 * @param threshold - Similarity threshold (0-1, default 0.75)
 * @returns Array of similar items with confidence scores
 */
export const findSimilarItems = (
  newItemName: string,
  existingItems: TripItem[],
  threshold: number = 0.75
): { item: TripItem; confidence: number }[] => {
  const normalizedNewItem = normalizeItemName(newItemName);
  const words = normalizedNewItem.split(' ');
  
  // Don't do similarity checks for very short item names
  if (normalizedNewItem.length < 3 || words.length === 0) {
    return [];
  }
  
  const similarItems = existingItems
    .map(item => {
      const normalizedExisting = normalizeItemName(item.name);
      const existingWords = normalizedExisting.split(' ');
      
      // Don't analyze very short item names
      if (normalizedExisting.length < 3 || existingWords.length === 0) {
        return { item, confidence: 0 };
      }
      
      // Check for sub-word matches
      let matchingWordCount = 0;
      
      for (const word of words) {
        if (word.length <= 2) continue; // Skip very short words
        
        if (existingWords.some(existingWord => 
          existingWord.includes(word) || word.includes(existingWord))) {
          matchingWordCount++;
        }
      }
      
      // Calculate word-based similarity
      const wordSimilarity = matchingWordCount / Math.max(words.length, existingWords.length);
      
      // Calculate character-based similarity (Levenshtein distance based)
      const charSimilarity = 1 - levenshteinDistance(normalizedNewItem, normalizedExisting) / 
        Math.max(normalizedNewItem.length, normalizedExisting.length);
      
      // Combine similarities
      const confidence = (wordSimilarity * 0.7) + (charSimilarity * 0.3);
      
      return { item, confidence };
    })
    .filter(result => result.confidence >= threshold)
    .sort((a, b) => b.confidence - a.confidence);
  
  return similarItems;
};

/**
 * Detect potential duplicates or similar items
 * @param newItemName - The name of the new item being added
 * @param existingItems - Array of existing items in the trip
 * @returns A suggestion if a duplicate or similar item is found, null otherwise
 */
export const detectDuplicateOrSimilar = (
  newItemName: string,
  existingItems: TripItem[]
): ItemSuggestion | null => {
  // Check for exact duplicates first
  const exactDuplicate = findExactDuplicate(newItemName, existingItems);
  
  if (exactDuplicate) {
    return {
      type: 'duplicate',
      newItemName,
      existingItem: exactDuplicate,
      confidence: 100, // 100% confidence for exact match
      message: `"${exactDuplicate.name}" is already on your list (${exactDuplicate.quantity}x)`
    };
  }
  
  // Check for similar items
  const similarItems = findSimilarItems(newItemName, existingItems);
  
  if (similarItems.length > 0) {
    const topMatch = similarItems[0];
    const confidencePercent = Math.round(topMatch.confidence * 100);
    
    return {
      type: 'similar',
      newItemName,
      existingItem: topMatch.item,
      confidence: confidencePercent,
      message: `"${newItemName}" might be similar to "${topMatch.item.name}" already on your list (${confidencePercent}% match)`
    };
  }
  
  return null; // No duplicates or similar items found
};

/**
 * Calculate Levenshtein distance between two strings
 * (Helper function for measuring string similarity)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  return track[str2.length][str1.length];
} 