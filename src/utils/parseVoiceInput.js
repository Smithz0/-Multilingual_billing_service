import { convertWordsToNumbers } from './numberMapping';

/**
 * Parse voice input transcript into structured item data.
 * 
 * Expected format: "item name + quantity + total price"
 * Examples:
 *   "apple 2 120"       → { itemName: "apple", quantity: 2, total: 120, rate: 60 }
 *   "rice bag 5 250"    → { itemName: "rice bag", quantity: 5, total: 250, rate: 50 }
 *   "milk rendu 90"     → { itemName: "milk", quantity: 2, total: 90, rate: 45 }
 * 
 * Logic:
 *   - Last number = total price
 *   - Second-to-last number = quantity
 *   - All remaining words = item name
 *   - rate = total / quantity
 * 
 * @param {string} transcript - Raw speech-to-text transcript
 * @param {string} lang - Language code for number word conversion
 * @returns {object|null} - Parsed item data or null if parsing fails
 */
export function parseVoiceInput(transcript, lang = 'en') {
  if (!transcript || transcript.trim() === '') return null;

  // Step 1: Convert number words to digits
  const converted = convertWordsToNumbers(transcript.trim(), lang);
  
  // Step 2: Tokenize the string
  const tokens = converted.split(/\s+/).filter(t => t.length > 0);

  if (tokens.length < 2) return null;

  // Step 3: Find all numbers and their positions
  const numberPositions = [];
  tokens.forEach((token, index) => {
    const num = parseFloat(token);
    if (!isNaN(num) && num > 0) {
      numberPositions.push({ index, value: num });
    }
  });

  // Need at least 2 numbers (quantity and total)
  if (numberPositions.length < 2) {
    // If only 1 number, treat it as total with quantity=1
    if (numberPositions.length === 1) {
      const total = numberPositions[0].value;
      const nameTokens = tokens.filter((_, i) => i !== numberPositions[0].index);
      const itemName = nameTokens.join(' ').trim();
      if (!itemName) return null;
      return {
        itemName,
        quantity: 1,
        rate: total,
        total: total,
      };
    }
    return null;
  }

  // Step 4: Extract total (last number) and quantity (second-to-last number)
  const totalInfo = numberPositions[numberPositions.length - 1];
  const quantityInfo = numberPositions[numberPositions.length - 2];

  const total = totalInfo.value;
  const quantity = quantityInfo.value;

  // Step 5: All tokens that are NOT the last two numbers form the item name
  const usedIndices = new Set([totalInfo.index, quantityInfo.index]);
  const nameTokens = tokens.filter((_, i) => !usedIndices.has(i));
  const itemName = nameTokens.join(' ').trim();

  if (!itemName) return null;

  // Step 6: Calculate rate
  const rate = Math.round((total / quantity) * 100) / 100;

  return {
    itemName: itemName.charAt(0).toUpperCase() + itemName.slice(1), // Capitalize first letter
    quantity,
    rate,
    total,
  };
}
