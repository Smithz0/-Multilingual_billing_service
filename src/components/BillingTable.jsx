import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

/**
 * BillingTable component — displays the current bill items.
 * 
 * Features:
 *   - Item Name, Quantity, Rate, Total columns
 *   - Inline edit and delete actions
 *   - Running grand total at bottom
 *   - Empty state message
 * 
 * Props:
 *   items         - array of bill items
 *   onUpdateItem  - callback(index, updatedItem) for editing
 *   onDeleteItem  - callback(index) for removing items
 */
export default function BillingTable({ items, onUpdateItem, onDeleteItem }) {
  const { t } = useLanguage();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({ itemName: '', quantity: '', rate: '' });

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const startEdit = (index) => {
    const item = items[index];
    setEditData({
      itemName: item.itemName,
      quantity: String(item.quantity),
      rate: String(item.rate),
    });
    setEditingIndex(index);
  };

  const saveEdit = () => {
    const quantity = parseFloat(editData.quantity);
    const rate = parseFloat(editData.rate);
    if (isNaN(quantity) || isNaN(rate) || quantity <= 0 || rate <= 0) return;

    onUpdateItem(editingIndex, {
      itemName: editData.itemName,
      quantity,
      rate,
      total: Math.round(quantity * rate * 100) / 100,
    });
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
          {t('noItems')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <th className="px-3 py-3 text-left font-semibold">#</th>
              <th className="px-3 py-3 text-left font-semibold">{t('itemName')}</th>
              <th className="px-3 py-3 text-center font-semibold">{t('quantity')}</th>
              <th className="px-3 py-3 text-right font-semibold">{t('rate')}</th>
              <th className="px-3 py-3 text-right font-semibold">{t('total')}</th>
              <th className="px-3 py-3 text-center font-semibold no-print">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={index}
                className={`border-b border-gray-100 dark:border-gray-700 transition-colors
                  ${index % 2 === 0
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-gray-50 dark:bg-gray-800/50'
                  }
                  hover:bg-emerald-50 dark:hover:bg-emerald-900/20`}
              >
                {editingIndex === index ? (
                  /* Edit mode row */
                  <>
                    <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={editData.itemName}
                        onChange={(e) => setEditData({ ...editData, itemName: e.target.value })}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm
                          focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={editData.quantity}
                        onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                        className="w-16 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm text-center
                          focus:ring-2 focus:ring-emerald-500 outline-none"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={editData.rate}
                        onChange={(e) => setEditData({ ...editData, rate: e.target.value })}
                        className="w-20 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600
                          bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm text-right
                          focus:ring-2 focus:ring-emerald-500 outline-none"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">
                      ₹{(parseFloat(editData.quantity || 0) * parseFloat(editData.rate || 0)).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={saveEdit}
                          className="px-2.5 py-1.5 bg-emerald-500 text-white text-xs rounded-lg
                            hover:bg-emerald-600 transition-colors font-medium"
                        >
                          {t('save')}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-2.5 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200
                            text-xs rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  /* Display mode row */
                  <>
                    <td className="px-3 py-3 text-gray-500 dark:text-gray-400">{index + 1}</td>
                    <td className="px-3 py-3 font-medium text-gray-800 dark:text-white">{item.itemName}</td>
                    <td className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-gray-700 dark:text-gray-300">₹{item.rate.toFixed(2)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-800 dark:text-white">₹{item.total.toFixed(2)}</td>
                    <td className="px-3 py-3 no-print">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => startEdit(index)}
                          className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30
                            rounded-lg transition-colors"
                          aria-label={t('edit')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => onDeleteItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30
                            rounded-lg transition-colors"
                          aria-label={t('delete')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      <div className="mt-4 flex justify-end">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25">
          <span className="text-sm font-medium opacity-90">{t('grandTotal')}:</span>
          <span className="ml-2 text-2xl font-bold">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
