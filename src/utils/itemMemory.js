/**
 * itemMemory utilities for smart auto-completion, fuzzy matching, and frequency tracking.
 */

// Basic Levenshtein distance for fuzzy matching
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion, deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Normalizes text: lowercase, trims, and removes special characters.
 */
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0B80-\u0BFF\u0D00-\u0D7F]/g, '') // Keep English, Tamil, and Malayalam characters
    .replace(/\s+/g, ' '); // Compress whitespace
}

/**
 * Finds the best match for spoken text in the memory DB using exact, partial, and fuzzy matching.
 * @param {string} spokenName - The recognized item name
 * @param {Object} memoryDB - Dictionary of { [normalizedKey]: { name, frequency } }
 * @returns {string} - The corrected name, or the original if no good match
 */
export function findBestMatch(spokenName, memoryDB) {
  const normalizedInput = normalizeText(spokenName);
  if (!normalizedInput || Object.keys(memoryDB).length === 0) return spokenName;

  let bestMatch = null;
  let highestScore = -1; // Higher is better
  let highestFreq = -1;

  for (const [key, data] of Object.entries(memoryDB)) {
    // 1. Exact Match
    if (key === normalizedInput) {
      return data.name;
    }

    // 2. Partial / Fuzzy Match
    // Calculate a similarity score (0 to 1)
    const distance = levenshteinDistance(normalizedInput, key);
    const maxLength = Math.max(normalizedInput.length, key.length);
    const similarity = maxLength === 0 ? 0 : 1 - distance / maxLength;

    // Consider it a match if similarity is > 0.7 (approx. 1-2 typos allowed depending on length)
    // Or if one string strongly contains the other
    const isSubstring = key.includes(normalizedInput) || normalizedInput.includes(key);
    
    // Weight similarity heavily, but give a small boost to frequency for tie-breakers
    let score = similarity;
    if (isSubstring) score += 0.1; // Small boost for partial exact match

    if (score > 0.65) {
      if (score > highestScore || (score === highestScore && data.frequency > highestFreq)) {
        highestScore = score;
        highestFreq = data.frequency;
        bestMatch = data.name;
      }
    }
  }

  return bestMatch || spokenName;
}

/**
 * Updates the memory DB with a new item or increments frequency.
 */
export function updateMemory(memoryDB, itemName) {
  const normalizedKey = normalizeText(itemName);
  if (!normalizedKey) return memoryDB;

  const currentData = memoryDB[normalizedKey] || { name: itemName, frequency: 0 };
  
  return {
    ...memoryDB,
    [normalizedKey]: {
      ...currentData,
      // If the new string is capitalized nicely, we might want to update the display name,
      // but usually we keep the first recorded casing, or update it if it's strictly better.
      name: currentData.frequency === 0 ? itemName : currentData.name,
      frequency: currentData.frequency + 1
    }
  };
}

/**
 * Gets auto-complete suggestions based on input text, sorted by relevance and frequency.
 */
export function getSuggestions(input, memoryDB) {
  const normalizedInput = normalizeText(input);
  if (!normalizedInput) return [];

  const results = [];
  for (const [key, data] of Object.entries(memoryDB)) {
    if (key.includes(normalizedInput)) {
      results.push(data);
    }
  }

  return results.sort((a, b) => b.frequency - a.frequency).slice(0, 5);
}

/**
 * Returns top items by frequency.
 */
export function getTopItems(memoryDB, limit = 5) {
  return Object.values(memoryDB)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}
