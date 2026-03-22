/**
 * Mapping of Tamil and Malayalam number words to digits.
 * Used to convert spoken number words from voice input into numeric values.
 */

// Tamil number word mappings
const tamilNumbers = {
  'oru': 1, 'onnu': 1, 'onru': 1, 'ஒன்று': 1, 'ஒரு': 1,
  'rendu': 2, 'irandu': 2, 'randu': 2, 'இரண்டு': 2,
  'moonu': 3, 'moonru': 3, 'mūnru': 3, 'மூன்று': 3,
  'naalu': 4, 'naangu': 4, 'நான்கு': 4,
  'anju': 5, 'ainthu': 5, 'ஐந்து': 5,
  'aaru': 6, 'aaṟu': 6, 'ஆறு': 6,
  'ezhu': 7, 'eazhu': 7, 'ஏழு': 7,
  'ettu': 8, 'என்ட்டு': 8, 'எட்டு': 8,
  'ombathu': 9, 'onpathu': 9, 'ஒன்பது': 9,
  'pathu': 10, 'பத்து': 10,
  'iruvathu': 20, 'இருபது': 20,
  'muppathu': 30, 'முப்பது': 30,
  'naarpathu': 40, 'நாற்பது': 40,
  'aimpathu': 50, 'ஐம்பது': 50,
  'aruvathu': 60, 'அறுபது': 60,
  'ezhuvathu': 70, 'எழுபது': 70,
  'enpathu': 80, 'எண்பது': 80,
  'thonnūru': 90, 'தொண்ணூறு': 90,
  'nooru': 100, 'நூறு': 100,
  'ayiram': 1000, 'ஆயிரம்': 1000,
};

// Malayalam number word mappings
const malayalamNumbers = {
  'onnu': 1, 'onno': 1, 'onnŭ': 1, 'ഒന്ന്': 1,
  'randu': 2, 'randŭ': 2, 'രണ്ട്': 2,
  'moonu': 3, 'mūnnu': 3, 'മൂന്ന്': 3,
  'naalu': 4, 'nālŭ': 4, 'നാല്': 4,
  'anju': 5, 'añcŭ': 5, 'അഞ്ച്': 5,
  'aaru': 6, 'āṟŭ': 6, 'ആറ്': 6,
  'ezhu': 7, 'ēzŭ': 7, 'ഏഴ്': 7,
  'ettu': 8, 'eṭṭŭ': 8, 'എട്ട്': 8,
  'ombathu': 9, 'onpatŭ': 9, 'ഒൻപത്': 9,
  'pathu': 10, 'pattŭ': 10, 'പത്ത്': 10,
  'irupathu': 20, 'ഇരുപത്': 20,
  'muppathu': 30, 'മുപ്പത്': 30,
  'naalpathu': 40, 'നാല്പത്': 40,
  'aimpathu': 50, 'അമ്പത്': 50,
  'arupathu': 60, 'അറുപത്': 60,
  'ezhupathu': 70, 'എഴുപത്': 70,
  'enpathu': 80, 'എൺപത്': 80,
  'thonnūru': 90, 'തൊണ്ണൂറ്': 90,
  'nooru': 100, 'നൂറ്': 100,
  'aayiram': 1000, 'ആയിരം': 1000,
};

/**
 * Convert number words in a text string to digits.
 * Handles Tamil, Malayalam, and English number words.
 * 
 * @param {string} text - Input text potentially containing number words
 * @param {string} lang - Language code ('en', 'ta', 'ml')
 * @returns {string} - Text with number words replaced by digits
 */
export function convertWordsToNumbers(text, lang = 'en') {
  if (!text) return text;

  let mapping = {};
  if (lang === 'ta') {
    mapping = tamilNumbers;
  } else if (lang === 'ml') {
    mapping = malayalamNumbers;
  }

  // Also include the other language mappings as fallback for mixed-language input
  const combinedMapping = { ...tamilNumbers, ...malayalamNumbers, ...mapping };

  const words = text.toLowerCase().split(/\s+/);
  const converted = words.map(word => {
    // If the word is already a number, keep it
    if (!isNaN(word) && word.trim() !== '') {
      return word;
    }
    // Check if the word is a number word in any supported language
    if (combinedMapping[word] !== undefined) {
      return String(combinedMapping[word]);
    }
    return word;
  });

  return converted.join(' ');
}
