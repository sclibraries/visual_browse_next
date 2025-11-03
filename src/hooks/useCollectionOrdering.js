import { useCallback, useMemo, useState } from 'react';

export function useCollectionOrdering(sourceRecords = []) {
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: 'default', direction: 'asc' });
  const [localRecords, setLocalRecords] = useState([]);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [originalRecords, setOriginalRecords] = useState([]);

  const displayRecords = useMemo(() => (localRecords.length > 0 ? localRecords : sourceRecords), [localRecords, sourceRecords]);

  const ensureOriginalSaved = useCallback((source) => {
    if (originalRecords.length === 0 && source.length > 0) {
      setOriginalRecords([...source]);
    }
  }, [originalRecords.length]);

  const handleSort = useCallback((sortKey, collectionRecords) => {
    setSortConfig({ field: sortKey, direction: 'asc' });
    if (sortKey === 'default') {
      setLocalRecords([]);
      setHasLocalChanges(false);
      setOriginalRecords([]);
      return;
    }
    const recordsToSort = localRecords.length > 0 ? localRecords : collectionRecords;
    ensureOriginalSaved(collectionRecords);
    const sortedRecords = [...recordsToSort].sort((a, b) => {
      let aValue = '';
      let bValue = '';
      switch (sortKey) {
        case 'title-asc':
        case 'title-desc':
          aValue = a.titleFull || a.eds_id || '';
          bValue = b.titleFull || b.eds_id || '';
          break;
        case 'author-asc':
        case 'author-desc':
          aValue = a.author || '';
          bValue = b.author || '';
          break;
        case 'year-asc':
        case 'year-desc':
          aValue = a.publicationyear || '';
          bValue = b.publicationyear || '';
          break;
        case 'type-asc':
        case 'type-desc':
          aValue = a.materialType || '';
          bValue = b.materialType || '';
          break;
        default:
          aValue = a.collection_records_id || '';
          bValue = b.collection_records_id || '';
      }
      if (sortKey.includes('year')) {
        const aNum = parseInt(aValue) || 0;
        const bNum = parseInt(bValue) || 0;
        return sortKey.includes('desc') ? bNum - aNum : aNum - bNum;
      }
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
      return sortKey.includes('desc') ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    });
    setLocalRecords(sortedRecords);
    setHasLocalChanges(true);
  }, [ensureOriginalSaved, localRecords]);

  const handleToggleSelect = useCallback((recordId) => {
    setSelectedRecords(prev => (prev.includes(recordId) ? prev.filter(id => id !== recordId) : [...prev, recordId]));
  }, []);

  const handleMoveToPosition = useCallback((targetIndex, collectionRecords) => {
    const recordsToMove = localRecords.length > 0 ? localRecords : collectionRecords;
    const newRecords = [...recordsToMove];
    const selectedItems = [];
    for (let i = newRecords.length - 1; i >= 0; i--) {
      if (selectedRecords.includes(newRecords[i].collection_records_id)) {
        selectedItems.unshift(newRecords.splice(i, 1)[0]);
      }
    }
    newRecords.splice(targetIndex, 0, ...selectedItems);
    setLocalRecords(newRecords);
    setSelectedRecords([]);
    setHasLocalChanges(true);
    ensureOriginalSaved(collectionRecords);
  }, [ensureOriginalSaved, localRecords, selectedRecords]);

  const handleMoveSelectedToPosition = useCallback((position, collectionRecords) => {
    if (selectedRecords.length === 0) return;
    const recordsToMove = localRecords.length > 0 ? localRecords : collectionRecords;
    const newRecords = [...recordsToMove];
    ensureOriginalSaved(collectionRecords);
    const selectedItems = [];
    for (let i = newRecords.length - 1; i >= 0; i--) {
      if (selectedRecords.includes(newRecords[i].collection_records_id)) {
        selectedItems.unshift(newRecords.splice(i, 1)[0]);
      }
    }
    const insertPosition = Math.min(position, newRecords.length);
    newRecords.splice(insertPosition, 0, ...selectedItems);
    setLocalRecords(newRecords);
    setSelectedRecords([]);
    setHasLocalChanges(true);
  }, [ensureOriginalSaved, localRecords, selectedRecords]);

  const handleMoveSelectedUp = useCallback((collectionRecords) => {
    if (selectedRecords.length === 0) return;
    const recordsToMove = localRecords.length > 0 ? localRecords : collectionRecords;
    const newRecords = [...recordsToMove];
    ensureOriginalSaved(collectionRecords);
    const selectedIndices = [];
    newRecords.forEach((r, i) => { if (selectedRecords.includes(r.collection_records_id)) selectedIndices.push(i); });
    selectedIndices.sort((a, b) => a - b);
    if (selectedIndices[0] === 0) return;
    selectedIndices.forEach(i => {
      if (i > 0) {
        const item = newRecords[i];
        newRecords[i] = newRecords[i - 1];
        newRecords[i - 1] = item;
      }
    });
    setLocalRecords(newRecords);
    setHasLocalChanges(true);
  }, [ensureOriginalSaved, localRecords, selectedRecords]);

  const handleMoveSelectedDown = useCallback((collectionRecords) => {
    if (selectedRecords.length === 0) return;
    const recordsToMove = localRecords.length > 0 ? localRecords : collectionRecords;
    const newRecords = [...recordsToMove];
    ensureOriginalSaved(collectionRecords);
    const selectedIndices = [];
    newRecords.forEach((r, i) => { if (selectedRecords.includes(r.collection_records_id)) selectedIndices.push(i); });
    selectedIndices.sort((a, b) => b - a);
    if (selectedIndices[0] === newRecords.length - 1) return;
    selectedIndices.forEach(i => {
      if (i < newRecords.length - 1) {
        const item = newRecords[i];
        newRecords[i] = newRecords[i + 1];
        newRecords[i + 1] = item;
      }
    });
    setLocalRecords(newRecords);
    setHasLocalChanges(true);
  }, [ensureOriginalSaved, localRecords, selectedRecords]);

  const handleResetOrder = useCallback(() => {
    setLocalRecords([]);
    setHasLocalChanges(false);
    setSortConfig({ field: 'default', direction: 'asc' });
    setSelectedRecords([]);
    setOriginalRecords([]);
  }, []);

  const moveRecord = useCallback((dragIndex, hoverIndex, collectionRecords) => {
    const recordsToMove = localRecords.length > 0 ? localRecords : collectionRecords;
    const updatedRecords = [...recordsToMove];
    const draggedItem = updatedRecords[dragIndex];
    updatedRecords.splice(dragIndex, 1);
    updatedRecords.splice(hoverIndex, 0, draggedItem);
    setLocalRecords(updatedRecords);
    setHasLocalChanges(true);
    ensureOriginalSaved(collectionRecords);
  }, [ensureOriginalSaved, localRecords]);

  return {
    selectedRecords,
    setSelectedRecords,
    sortConfig,
    setSortConfig,
    localRecords,
    setLocalRecords,
    hasLocalChanges,
    setHasLocalChanges,
    originalRecords,
    setOriginalRecords,
    displayRecords,
    handleSort,
    handleToggleSelect,
    handleMoveToPosition,
    handleMoveSelectedToPosition,
    handleMoveSelectedUp,
    handleMoveSelectedDown,
    handleResetOrder,
    moveRecord,
  };
}
