import { createContext, useContext } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Translation dictionary for UI labels only.
 * Item names are NOT translated — they stay as spoken/entered by the user.
 */
const translations = {
  en: {
    appTitle: 'Grocery Billing',
    voiceInput: 'Voice Input',
    scanBarcode: 'Scan Barcode',
    itemName: 'Item Name',
    quantity: 'Quantity',
    rate: 'Rate',
    total: 'Total',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    clearAll: 'Clear All',
    grandTotal: 'Grand Total',
    sendToWhatsApp: 'Send to WhatsApp',
    phoneNumber: 'Phone Number',
    noItems: 'No items added yet. Use voice or barcode to add items.',
    listening: 'Listening...',
    tapToSpeak: 'Tap to Speak',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    scannerTitle: 'Scan Barcode / QR Code',
    close: 'Close',
    productName: 'Product Name',
    productPrice: 'Product Price',
    saveProduct: 'Save Product',
    barcodeNotFound: 'Product not found. Please enter details:',
    groceryBill: 'Grocery Bill',
    enterPhone: 'Enter phone number',
    addItem: 'Add Item',
    manualEntry: 'Manual Entry',
    price: 'Price',
    add: 'Add',
  },
  ta: {
    appTitle: 'மளிகை பில்லிங்',
    voiceInput: 'குரல் உள்ளீடு',
    scanBarcode: 'பார்கோடு ஸ்கேன்',
    itemName: 'பொருள் பெயர்',
    quantity: 'அளவு',
    rate: 'விலை',
    total: 'மொத்தம்',
    actions: 'செயல்கள்',
    edit: 'திருத்து',
    delete: 'அழி',
    save: 'சேமி',
    cancel: 'ரத்து',
    clearAll: 'அனைத்தும் அழி',
    grandTotal: 'மொத்த தொகை',
    sendToWhatsApp: 'WhatsApp அனுப்பு',
    phoneNumber: 'தொலைபேசி எண்',
    noItems: 'இன்னும் பொருட்கள் சேர்க்கப்படவில்லை.',
    listening: 'கேட்கிறது...',
    tapToSpeak: 'பேச தட்டவும்',
    language: 'மொழி',
    darkMode: 'இருண்ட பயன்முறை',
    lightMode: 'ஒளி பயன்முறை',
    scannerTitle: 'பார்கோடு / QR குறியீடு ஸ்கேன்',
    close: 'மூடு',
    productName: 'பொருள் பெயர்',
    productPrice: 'பொருள் விலை',
    saveProduct: 'பொருளை சேமி',
    barcodeNotFound: 'பொருள் கிடைக்கவில்லை. விவரங்களை உள்ளிடவும்:',
    groceryBill: 'மளிகை பில்',
    enterPhone: 'தொலைபேசி எண் உள்ளிடவும்',
    addItem: 'பொருள் சேர்',
    manualEntry: 'கைமுறை உள்ளீடு',
    price: 'விலை',
    add: 'சேர்',
  },
  ml: {
    appTitle: 'കിറാണ ബില്ലിംഗ്',
    voiceInput: 'ശബ്ദ ഇൻപുട്ട്',
    scanBarcode: 'ബാർകോഡ് സ്കാൻ',
    itemName: 'ഇനത്തിന്റെ പേര്',
    quantity: 'അളവ്',
    rate: 'നിരക്ക്',
    total: 'ആകെ',
    actions: 'പ്രവർത്തനങ്ങൾ',
    edit: 'എഡിറ്റ്',
    delete: 'ഡിലീറ്റ്',
    save: 'സേവ്',
    cancel: 'റദ്ദാക്കുക',
    clearAll: 'എല്ലാം മായ്ക്കുക',
    grandTotal: 'ആകെ തുക',
    sendToWhatsApp: 'WhatsApp അയയ്ക്കുക',
    phoneNumber: 'ഫോൺ നമ്പർ',
    noItems: 'ഇതുവരെ ഇനങ്ങൾ ചേർത്തിട്ടില്ല.',
    listening: 'കേൾക്കുന്നു...',
    tapToSpeak: 'സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക',
    language: 'ഭാഷ',
    darkMode: 'ഡാർക്ക് മോഡ്',
    lightMode: 'ലൈറ്റ് മോഡ്',
    scannerTitle: 'ബാർകോഡ് / QR കോഡ് സ്കാൻ',
    close: 'അടയ്ക്കുക',
    productName: 'ഉൽപ്പന്ന പേര്',
    productPrice: 'ഉൽപ്പന്ന വില',
    saveProduct: 'ഉൽപ്പന്നം സേവ് ചെയ്യുക',
    barcodeNotFound: 'ഉൽപ്പന്നം കണ്ടെത്തിയില്ല. വിശദാംശങ്ങൾ നൽകുക:',
    groceryBill: 'കിറാണ ബിൽ',
    enterPhone: 'ഫോൺ നമ്പർ നൽകുക',
    addItem: 'ഇനം ചേർക്കുക',
    manualEntry: 'മാനുവൽ എൻട്രി',
    price: 'വില',
    add: 'ചേർക്കുക',
  },
};

// BCP-47 language codes for Web Speech API
export const speechLanguageCodes = {
  en: 'en-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
};

const LanguageContext = createContext();

/**
 * LanguageProvider wraps the app and provides language state + translation function.
 */
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useLocalStorage('app-language', 'en');

  // Translation function — looks up a key in the current language dictionary
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context.
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
