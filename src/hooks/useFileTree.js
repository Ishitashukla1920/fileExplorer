// hooks/useFileTree.js
import { useState, useEffect, useCallback } from 'react';
import {
  findNodeById,
  removeNodeFromTree,
  addNode,
  renameNode,
  toggleFolderOpen,
  moveNode,
  generateId,
  ensureNodeIsVisible,
  cloneTree 
} from '../utils/treeUtils';
import { initialTreeData } from '../data/initialTree';

const STORAGE_KEY = 'file-tree-data';
const MAX_HISTORY_LENGTH = 30; // Max number of history states

export const useFileTree = () => {
  const [treeData, _setTreeData] = useState(() => {
    const savedTree = localStorage.getItem(STORAGE_KEY);
    if (savedTree) { try { return JSON.parse(savedTree); } catch (e) { /* use initial */ } }
    return cloneTree(initialTreeData); // Always work with clones
  });

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [contextMenuNode, setContextMenuNode] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Undo/Redo state
  const [history, setHistory] = useState([cloneTree(treeData)]); // Initialize with the initial tree state
  const [historyIndex, setHistoryIndex] = useState(0); // Pointer to the current state in history

  // Wrapper for setTreeData to manage history
  const setTreeDataWithHistory = useCallback((newTreeOrCallback, isUndoRedo = false) => {
    _setTreeData(prevTree => {
      const newTree = typeof newTreeOrCallback === 'function' 
        ? newTreeOrCallback(prevTree) 
        : newTreeOrCallback;

      if (!isUndoRedo) { // Only update history if it's not an undo/redo action itself
        const newHistory = history.slice(0, historyIndex + 1); // Discard redo states if new action
        newHistory.push(cloneTree(newTree)); // Add new state
        
        if (newHistory.length > MAX_HISTORY_LENGTH) {
          newHistory.shift(); // Keep history bounded
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        } else {
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTree));
      return newTree;
    });
  }, [history, historyIndex]);


  useEffect(() => {
    // Initial load effect or if treeData was loaded async and history needs sync
    // This might be redundant if initial history is set correctly with initial treeData
    const currentTreeSnapshot = cloneTree(treeData);
    if (JSON.stringify(history[historyIndex]) !== JSON.stringify(currentTreeSnapshot)) {
        // This case should ideally not happen if setTreeDataWithHistory is used consistently.
        // It's a safeguard.
        setHistory([currentTreeSnapshot]);
        setHistoryIndex(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount to ensure history is initialized

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      _setTreeData(cloneTree(history[newIndex])); // Set tree without adding to history
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history[newIndex]));
      setSelectedNodeId(null); // Clear selection on undo/redo
      setContextMenuNode(null);
    }
  }, [canUndo, history, historyIndex]);

  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      _setTreeData(cloneTree(history[newIndex])); // Set tree without adding to history
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history[newIndex]));
      setSelectedNodeId(null);
      setContextMenuNode(null);
    }
  }, [canRedo, history, historyIndex]);


  const selectNode = useCallback((id) => setSelectedNodeId(id), []);
  
  const toggleFolder = useCallback((id) => {
    setTreeDataWithHistory(prevTree => toggleFolderOpen(prevTree, id));
  }, [setTreeDataWithHistory]);

  const openContextMenu = useCallback((nodeId, x, y) => {
    const findResult = findNodeById(treeData, nodeId);
    if (findResult?.node) { setContextMenuNode(findResult.node); setContextMenuPosition({ x, y }); }
  }, [treeData]);
  const closeContextMenu = useCallback(() => setContextMenuNode(null), []);

  const deleteNode = useCallback((id) => {
    setTreeDataWithHistory(prevTree => removeNodeFromTree(prevTree, id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  }, [selectedNodeId, setTreeDataWithHistory]);

  const createFile = useCallback((parentId, name = 'New File') => {
    const newFileNameWithExt = name.includes('.') ? name : `${name}.txt`;
    const newFile = { id: generateId(), name: newFileNameWithExt, type: 'file', content: `// ${newFileNameWithExt}\n` };
    let actualParentId = parentId;
    if (parentId === null && selectedNodeId) {
      const { node: selected } = findNodeById(treeData, selectedNodeId) || {};
      if (selected?.type === 'folder') actualParentId = selected.id;
    }
    setTreeDataWithHistory(prevTree => {
      let newTreeState = addNode(prevTree, actualParentId, newFile);
      newTreeState = ensureNodeIsVisible(newTreeState, newFile.id);
      return newTreeState;
    });
    setSelectedNodeId(newFile.id);
    return newFile.id;
  }, [selectedNodeId, treeData, setTreeDataWithHistory]);

  const createFolder = useCallback((parentId, name = 'New Folder') => {
    const newFolder = { id: generateId(), name, type: 'folder', isOpen: true, children: [] };
    let actualParentId = parentId;
    if (parentId === null && selectedNodeId) {
      const { node: selected } = findNodeById(treeData, selectedNodeId) || {};
      if (selected?.type === 'folder') actualParentId = selected.id;
    }
    setTreeDataWithHistory(prevTree => {
      let newTreeState = addNode(prevTree, actualParentId, newFolder);
      newTreeState = ensureNodeIsVisible(newTreeState, newFolder.id); // Ensure parents are open
      return newTreeState;
    });
    setSelectedNodeId(newFolder.id);
    return newFolder.id;
  }, [selectedNodeId, treeData, setTreeDataWithHistory]);

  const renameItem = useCallback((id, newName) => {
    setTreeDataWithHistory(prevTree => renameNode(prevTree, id, newName));
  }, [setTreeDataWithHistory]);

  const moveItem = useCallback((nodeId, targetParentId, index) => {
    setTreeDataWithHistory(prevTree => moveNode(prevTree, nodeId, targetParentId, index));
  }, [setTreeDataWithHistory]);

  const importTreeData = useCallback((jsonData) => {
    try {
      const parsedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (Array.isArray(parsedData) && parsedData.every(item => item && typeof item.id === 'string')) {
        setTreeDataWithHistory(cloneTree(parsedData)); // Use clone to ensure it's a new reference
        setSelectedNodeId(null); setContextMenuNode(null);
        // Reset history with the new imported tree as the starting point
        setHistory([cloneTree(parsedData)]);
        setHistoryIndex(0);
        return true;
      } else { /* ... alert ... */ return false; }
    } catch (e) { /* ... alert ... */ return false; }
  }, [setTreeDataWithHistory]);

  const exportTreeData = useCallback(() => JSON.stringify(treeData, null, 2), [treeData]);
  
  const resetTreeData = useCallback(() => {
    const newInitialTree = cloneTree(initialTreeData);
    setTreeDataWithHistory(newInitialTree);
    setSelectedNodeId(null); setContextMenuNode(null);
    // Reset history with the new initial tree
    setHistory([newInitialTree]);
    setHistoryIndex(0);
  }, [setTreeDataWithHistory]);

  return {
    treeData, selectedNodeId, contextMenuNode, contextMenuPosition,
    selectNode, toggleFolder, openContextMenu, closeContextMenu,
    deleteNode, createFile, createFolder, renameItem, moveItem,
    importTreeData, exportTreeData, resetTreeData,
    undo, redo, canUndo, canRedo // Export history functions
  };
};
