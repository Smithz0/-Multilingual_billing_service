import { useLocalStorage } from './useLocalStorage';
import { updateMemory, findBestMatch, getTopItems, normalizeText } from '../utils/itemMemory';

/**
 * Custom hook managing the item memory database.
 */
export function useItemMemory() {
  const [memoryDB, setMemoryDB] = useLocalStorage('smart-item-memory', {});

  const recordItem = (itemName) => {
    setMemoryDB((prev) => updateMemory(prev, itemName));
  };

  const matchItem = (spokenName) => {
    return findBestMatch(spokenName, memoryDB);
  };

  const topItems = getTopItems(memoryDB, 8);

  const clearMemory = () => {
    setMemoryDB({});
  };

  const editItemName = (oldName, newName) => {
    setMemoryDB((prev) => {
      const oldKey = normalizeText(oldName);
      const newKey = normalizeText(newName);
      
      const updated = { ...prev };
      
      // If changing the key entirely
      if (oldKey && updated[oldKey]) {
        const freq = updated[oldKey].frequency;
        delete updated[oldKey];
        
        updated[newKey] = {
          name: newName,
          frequency: freq
        };
      }
      return updated;
    });
  };

  const deleteItem = (itemName) => {
    setMemoryDB((prev) => {
      const key = normalizeText(itemName);
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  return {
    memoryDB,
    recordItem,
    matchItem,
    topItems,
    clearMemory,
    editItemName,
    deleteItem
  };
}
