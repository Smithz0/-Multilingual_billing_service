import { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLanguage } from './hooks/useLanguage';
import VoiceInput from './components/VoiceInput';
import BarcodeScanner from './components/BarcodeScanner';
import BillingTable from './components/BillingTable';
import WhatsAppSender from './components/WhatsAppSender';
import { playItemAdded } from './utils/soundUtils';

/**
 * Main App component — central hub for the grocery billing application.
 * Manages bill items state and orchestrates all child components.
 */
export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [items, setItems] = useLocalStorage('bill-items', []);
  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  // Apply dark mode class to html element
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  /**
   * Add item to bill. Auto-merges duplicates (same item name → increment quantity).
   */
  const handleAddItem = useCallback((newItem) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.itemName.toLowerCase() === newItem.itemName.toLowerCase()
      );

      if (existingIndex !== -1) {
        // Merge: increment quantity and recalculate total
        const existing = prevItems[existingIndex];
        const updatedItem = {
          ...existing,
          quantity: existing.quantity + newItem.quantity,
          total: existing.total + newItem.total,
        };
        const updated = [...prevItems];
        updated[existingIndex] = updatedItem;
        return updated;
      }

      playItemAdded();
      return [...prevItems, newItem];
    });
  }, [setItems]);

  const handleUpdateItem = useCallback((index, updatedItem) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = updatedItem;
      return updated;
    });
  }, [setItems]);

  const handleDeleteItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, [setItems]);

  const handleClearAll = () => {
    if (items.length === 0) return;
    setItems([]);
  };

  const handleManualAdd = () => {
    const name = manualName.trim();
    const qty = parseFloat(manualQty);
    const price = parseFloat(manualPrice);
    if (!name || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) return;

    handleAddItem({
      itemName: name.charAt(0).toUpperCase() + name.slice(1),
      quantity: qty,
      rate: Math.round((price / qty) * 100) / 100,
      total: price,
    });

    setManualName('');
    setManualQty('');
    setManualPrice('');
    setShowManualEntry(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* ═══════════ HEADER ═══════════ */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* App title */}
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            🛒 {t('appTitle')}
          </h1>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm
                focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              aria-label={t('language')}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="ml">മലയാളം</option>
            </select>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center
                text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={darkMode ? t('lightMode') : t('darkMode')}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ─── Input Section: Voice + Barcode + Manual ─── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex flex-col items-center gap-4">
            {/* Voice Input */}
            <VoiceInput onItemAdd={handleAddItem} />

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              {/* Scan Barcode button */}
              <button
                onClick={() => setScannerOpen(true)}
                className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold
                  rounded-xl hover:from-violet-600 hover:to-purple-700 active:scale-95 transition-all
                  shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                {t('scanBarcode')}
              </button>

              {/* Manual Entry button */}
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold
                  rounded-xl hover:from-amber-600 hover:to-orange-600 active:scale-95 transition-all
                  shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {t('manualEntry')}
              </button>
            </div>

            {/* Manual Entry Form */}
            {showManualEntry && (
              <div className="w-full space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder={t('itemName')}
                    className="col-span-3 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                      focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-base"
                  />
                  <input
                    type="number"
                    value={manualQty}
                    onChange={(e) => setManualQty(e.target.value)}
                    placeholder={t('quantity')}
                    min="0"
                    step="0.01"
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                      focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-base"
                  />
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder={`${t('total')} (₹)`}
                    min="0"
                    step="0.01"
                    className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                      focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-base"
                  />
                  <button
                    onClick={handleManualAdd}
                    className="py-3 bg-emerald-500 text-white font-semibold rounded-xl
                      hover:bg-emerald-600 active:scale-95 transition-all"
                  >
                    {t('add')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Billing Table Section ─── */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <BillingTable
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />

          {/* Clear All button */}
          {items.length > 0 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleClearAll}
                className="px-6 py-2.5 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800
                  rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
              >
                {t('clearAll')}
              </button>
            </div>
          )}
        </section>

        {/* ─── WhatsApp Section ─── */}
        {items.length > 0 && (
          <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <WhatsAppSender items={items} />
          </section>
        )}
      </main>

      {/* ═══════════ BARCODE SCANNER MODAL ═══════════ */}
      <BarcodeScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onItemAdd={handleAddItem}
      />

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400 dark:text-gray-600">
        Grocery Billing App • Offline-First POS
      </footer>
    </div>
  );
}
