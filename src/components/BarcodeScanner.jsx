import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useLanguage } from '../hooks/useLanguage';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { playScan, playItemAdded, playError } from '../utils/soundUtils';

/**
 * BarcodeScanner component — modal-based barcode/QR scanner using html5-qrcode.
 * 
 * When a barcode is detected:
 *   - If product exists in local DB → auto-fill item
 *   - If not found → show form to register new product
 * 
 * Props:
 *   isOpen       - whether modal is visible
 *   onClose      - callback to close modal
 *   onItemAdd    - callback with scanned/registered item data
 */
export default function BarcodeScanner({ isOpen, onClose, onItemAdd }) {
  const { t } = useLanguage();
  const [productDB, setProductDB] = useLocalStorage('product-database', {});
  const [scannedCode, setScannedCode] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [scannerError, setScannerError] = useState('');
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure the DOM element exists
    const timer = setTimeout(() => {
      startScanner();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    try {
      setScannerError('');
      const html5Qr = new Html5Qrcode('barcode-reader');
      scannerRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: 'environment' }, // Use rear camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scan errors (they happen continuously when no barcode is visible)
        }
      );
    } catch (err) {
      console.error('Scanner start error:', err);
      setScannerError('Camera access denied or not available. Please check permissions.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // Only stop if scanning (state 2 = SCANNING)
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn('Scanner stop warning:', err);
      }
      scannerRef.current = null;
    }
  };

  const handleScanSuccess = async (code) => {
    playScan();
    setScannedCode(code);

    // Stop scanner after successful scan
    await stopScanner();

    // Check if product exists in local database
    if (productDB[code]) {
      const product = productDB[code];
      playItemAdded();
      onItemAdd({
        itemName: product.name,
        quantity: 1,
        rate: product.price,
        total: product.price,
      });
      handleClose();
    } else {
      // Product not found — show registration form
      setShowRegisterForm(true);
    }
  };

  const handleRegisterProduct = () => {
    const name = newProductName.trim();
    const price = parseFloat(newProductPrice);

    if (!name || isNaN(price) || price <= 0) {
      playError();
      return;
    }

    // Save to local product database
    const updatedDB = {
      ...productDB,
      [scannedCode]: { name, price },
    };
    setProductDB(updatedDB);

    // Add item to bill
    playItemAdded();
    onItemAdd({
      itemName: name,
      quantity: 1,
      rate: price,
      total: price,
    });

    handleClose();
  };

  const handleClose = () => {
    setScannedCode('');
    setShowRegisterForm(false);
    setNewProductName('');
    setNewProductPrice('');
    setScannerError('');
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {t('scannerTitle')}
          </h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center
              text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        {/* Scanner area */}
        <div className="p-5">
          {!showRegisterForm ? (
            <div>
              <div
                id="barcode-reader"
                ref={containerRef}
                className="w-full rounded-xl overflow-hidden bg-black"
                style={{ minHeight: '280px' }}
              />
              {scannerError && (
                <p className="mt-3 text-red-500 dark:text-red-400 text-sm text-center">
                  {scannerError}
                </p>
              )}
            </div>
          ) : (
            /* Product registration form */
            <div className="space-y-4">
              <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 rounded-lg">
                {t('barcodeNotFound')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Barcode: <span className="font-mono font-bold">{scannedCode}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('productName')}
                </label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                    focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none
                    text-base"
                  placeholder={t('productName')}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('productPrice')} (₹)
                </label>
                <input
                  type="number"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-700 text-gray-800 dark:text-white
                    focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none
                    text-base"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <button
                onClick={handleRegisterProduct}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold
                  rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all active:scale-98
                  shadow-lg shadow-emerald-500/25"
              >
                {t('saveProduct')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
