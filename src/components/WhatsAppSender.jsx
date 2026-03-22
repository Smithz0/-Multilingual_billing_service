import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useLocalStorage } from '../hooks/useLocalStorage';

/**
 * WhatsAppSender component — sends formatted bill via wa.me link.
 * 
 * Features:
 *   - Phone number input with +91 prefix
 *   - Generates formatted bill text
 *   - Opens WhatsApp with pre-filled message
 *   - Handles empty phone number gracefully
 * 
 * Props:
 *   items - array of bill items
 */
export default function WhatsAppSender({ items }) {
  const { t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useLocalStorage('whatsapp-phone', '');
  const [error, setError] = useState('');

  const generateBillText = () => {
    if (items.length === 0) return '';

    const lines = items.map(
      (item) => `${item.itemName} | ${item.quantity} | ₹${item.total.toFixed(2)}`
    );
    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN');
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return `🧾 *NEW MANIKANDA STORES*

📅 Date: ${dateStr}
🕒 Time: ${timeStr}

Items:
Item Name Qty Total
${lines.join('\n')}

💰 Grand Total: ₹${grandTotal.toFixed(2)}

Thank you for shopping with us 🙏
Visit Again!`;
  };

  const sendToWhatsApp = () => {
    setError('');

    // Clean phone number — remove spaces, dashes, etc.
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

    if (!cleaned || cleaned.length < 10) {
      setError(t('enterPhone'));
      return;
    }

    if (items.length === 0) {
      return;
    }

    // Format number — add country code if not present
    let fullNumber = cleaned;
    if (!fullNumber.startsWith('+')) {
      fullNumber = '91' + fullNumber; // Default to India country code
    } else {
      fullNumber = fullNumber.replace('+', '');
    }

    const billText = generateBillText();
    const encodedText = encodeURIComponent(billText);
    const url = `https://wa.me/${fullNumber}?text=${encodedText}`;

    window.open(url, '_blank');
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex gap-2">
        {/* Phone number input */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm font-medium">
            +91
          </span>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setError('');
            }}
            placeholder={t('enterPhone')}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600
              bg-white dark:bg-gray-700 text-gray-800 dark:text-white
              focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none
              text-base placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Send button */}
        <button
          onClick={sendToWhatsApp}
          disabled={items.length === 0}
          className="px-5 py-3 bg-green-500 text-white font-semibold rounded-xl
            hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-green-500/25
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            flex items-center gap-2 whitespace-nowrap"
        >
          {/* WhatsApp icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="hidden sm:inline">{t('sendToWhatsApp')}</span>
        </button>
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
