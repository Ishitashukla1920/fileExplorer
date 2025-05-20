// updated: utils/treeUtils.js

/* ---------------------- Basic Tree Utilities ---------------------- */

// Generate a unique ID for new nodes
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };
  
  // Deep clone of the tree
  export const cloneTree = (tree) => {
    // Basic check for non-array input, though tree is expected to be an array
    if (!Array.isArray(tree)) {
      console.error("cloneTree expects an array.");
      return []; // Or handle error appropriately
    }
    try {
      return JSON.parse(JSON.stringify(tree));
    } catch (e) {
      console.error("Error cloning tree:", e);
      return []; // Or handle error appropriately
    }
  };
  
  /* ---------------------- Node Finders ---------------------- */
  
  // Find node and its parent by ID
  export const findNodeById = (tree, id) => {
    if (!id || !Array.isArray(tree)) return null; // Guard against null/undefined id or invalid tree
    for (const node of tree) {
      if (node.id === id) return { node, parent: null };
      if (node.type === 'folder' && Array.isArray(node.children)) {
        const result = findNodeInChildrenRecursive(node.children, id, node);
        if (result) return result;
      }
    }
    return null;
  };
  
  // Recursive helper for findNodeById
  const findNodeInChildrenRecursive = (children, id, parent) => {
    for (const node of children) {
      if (node.id === id) return { node, parent };
      if (node.type === 'folder' && Array.isArray(node.children)) {
        const result = findNodeInChildrenRecursive(node.children, id, node);
        if (result) return result;
      }
    }
    return null;
  };
  
  // Find node, its parent, and its index within parent's children array
  export const findNodeAndIndexById = (tree, id) => {
    if (!id || !Array.isArray(tree)) return { node: null, parent: null, index: -1 };
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.id === id) return { node, parent: null, index: i };
      if (node.type === 'folder' && Array.isArray(node.children)) {
        const result = findNodeAndIndexInChildrenRecursive(node.children, id, node);
        if (result && result.node) return result; // Ensure node is found
      }
    }
    return { node: null, parent: null, index: -1 };
  };
  
  // Recursive helper for findNodeAndIndexById
  const findNodeAndIndexInChildrenRecursive = (children, id, parent) => {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.id === id) return { node, parent, index: i };
      if (node.type === 'folder' && Array.isArray(node.children)) {
        const result = findNodeAndIndexInChildrenRecursive(node.children, id, node);
        if (result && result.node) return result;
      }
    }
    return { node: null, parent: null, index: -1 }; // Return consistent structure if not found
  };
  
  
  // Get array of parent IDs leading to a node (path from root to node)
  export const getPathToNode = (tree, id) => {
    if (!id || !Array.isArray(tree)) return []; // Return empty path for invalid input
    const findPathRecursive = (nodes, targetId, currentPath) => {
      for (const node of nodes) {
        const newPath = [...currentPath, node.id];
        if (node.id === targetId) return newPath;
        if (node.type === 'folder' && Array.isArray(node.children)) {
          const result = findPathRecursive(node.children, targetId, newPath);
          if (result) return result;
        }
      }
      return null;
    };
    return findPathRecursive(tree, id, []) || [];
  };
  
  
  /* ---------------------- Tree Mutations ---------------------- */
  
  // Remove a node by ID
  export const removeNodeFromTree = (tree, id) => {
    if (!id || !Array.isArray(tree)) return tree; // Return original tree if invalid input
    const newTree = cloneTree(tree);
    const removeRecursive = (nodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].type === 'folder' && Array.isArray(nodes[i].children)) {
          if (removeRecursive(nodes[i].children)) return true;
        }
      }
      return false;
    };
    removeRecursive(newTree);
    return newTree;
  };
  
  // Add a node under a parent or root if parent is null
  export const addNode = (tree, parentId, nodeToAdd) => {
    if (!nodeToAdd || !nodeToAdd.id || !Array.isArray(tree)) return tree; // Basic validation
    const newTree = cloneTree(tree);
  
    if (!parentId) { // Add to root
      newTree.push(nodeToAdd);
      return newTree;
    }
  
    const result = findNodeById(newTree, parentId);
    if (!result || !result.node || result.node.type !== 'folder') {
      console.warn(`Parent node with ID ${parentId} not found or not a folder. Adding to root instead.`);
      newTree.push(nodeToAdd); // Fallback: add to root if parent not found/invalid
      return newTree;
    }
    
    result.node.children = result.node.children || []; // Ensure children array exists
    result.node.children.push(nodeToAdd);
    if (result.node.type === 'folder' && !result.node.isOpen) { // Open parent if closed
      result.node.isOpen = true;
    }
    return newTree;
  };
  
  // Rename a node
  export const renameNode = (tree, id, newName) => {
    if (!id || typeof newName !== 'string' || !Array.isArray(tree)) return tree;
    const newTree = cloneTree(tree);
    const result = findNodeById(newTree, id);
    if (result && result.node) {
      result.node.name = newName;
    }
    return newTree;
  };
  
  // Toggle open/close state of a folder
  export const toggleFolderOpen = (tree, id) => {
    if (!id || !Array.isArray(tree)) return tree;
    const newTree = cloneTree(tree);
    const result = findNodeById(newTree, id);
    if (result && result.node && result.node.type === 'folder') {
      result.node.isOpen = !result.node.isOpen;
    }
    return newTree;
  };
  
  // Ensures a node is visible by opening all its parent folders.
  export const ensureNodeIsVisible = (tree, nodeId) => {
    if (!nodeId || !Array.isArray(tree)) return tree;
    let newTree = cloneTree(tree); // Work on a copy
    const pathIds = getPathToNode(newTree, nodeId); // Path from root to node: [grandparentId, parentId, nodeId]
  
    if (pathIds && pathIds.length > 0) {
      // Open all ancestors of the node, up to (but not including) the node itself
      for (let i = 0; i < pathIds.length - 1; i++) {
        const ancestorId = pathIds[i];
        // We need to find the ancestor in the *current state* of newTree, as it might have been modified
        const ancestorSearchResult = findNodeById(newTree, ancestorId); 
        if (ancestorSearchResult && ancestorSearchResult.node && ancestorSearchResult.node.type === 'folder' && !ancestorSearchResult.node.isOpen) {
           // Directly modify the node in the cloned tree.
           // This is okay because findNodeById returns a reference to the node within the cloned newTree.
           ancestorSearchResult.node.isOpen = true; 
           // Or, if toggleFolderOpen is preferred for its cloning safety (though ensureNodeIsVisible already clones):
           // newTree = toggleFolderOpen(newTree, ancestorId); // This would re-clone, potentially less efficient here
        }
      }
    }
    return newTree;
  };
  
  
  /* ---------------------- Drag & Drop ---------------------- */
  
  // Move node to a new parent (or to root)
  export const moveNode = (tree, nodeId, newParentId, index = -1) => {
    if (!nodeId || !Array.isArray(tree)) return tree;
  
    const { node: nodeToMoveOriginal } = findNodeById(tree, nodeId); // Get original node data from original tree
    if (!nodeToMoveOriginal) return tree; // Node to move not found, return original tree
  
    // Important: Clone the nodeToMove to avoid issues with shared references if it's moved multiple times or if tree cloning is shallow.
    const nodeToMove = JSON.parse(JSON.stringify(nodeToMoveOriginal));
  
    const newTreeWithoutNode = removeNodeFromTree(tree, nodeId); // Operates on a clone, returns new clone
    
    if (newParentId === null) { // Moving to root
      const targetRootArray = newTreeWithoutNode; // This is already a clone
      if (index >= 0 && index <= targetRootArray.length) {
        targetRootArray.splice(index, 0, nodeToMove);
      } else {
        targetRootArray.push(nodeToMove); // Add to end if index is out of bounds or -1
      }
      return targetRootArray;
    }
  
    // Find parent in the tree *after* the node has been removed
    const parentSearchResult = findNodeById(newTreeWithoutNode, newParentId);
    if (!parentSearchResult || !parentSearchResult.node || parentSearchResult.node.type !== 'folder') {
      // Invalid parent, perhaps it was the node being moved or a descendant.
      // Re-add node to root as a fallback, or return original tree.
      // For now, let's log a warning and effectively cancel the move by returning the tree before adding back.
      console.warn(`Drag&Drop: Target parent ${newParentId} not found or not a folder after removing ${nodeId}. Move cancelled.`);
      // To revert, one might consider adding nodeToMove back to its original position, but that's complex.
      // Simplest is to return the tree as it was before this move operation.
      // However, the `removeNodeFromTree` has already happened.
      // A safer approach if target parent is invalid: return the tree state *before* removeNodeFromTree.
      // But for now, we'll proceed with newTreeWithoutNode and if parent is invalid, the node remains "removed" effectively.
      // Let's try to add it to the root of newTreeWithoutNode as a fallback.
      newTreeWithoutNode.push(nodeToMove);
      return newTreeWithoutNode;
    }
  
    const targetParentNode = parentSearchResult.node;
    targetParentNode.children = targetParentNode.children || [];
    if (index >= 0 && index <= targetParentNode.children.length) {
      targetParentNode.children.splice(index, 0, nodeToMove);
    } else {
      targetParentNode.children.push(nodeToMove); // Add to end if index is out of bounds or -1
    }
    // Ensure the new parent folder is open if we move an item into it
    if (!targetParentNode.isOpen) {
        targetParentNode.isOpen = true;
    }
  
    return newTreeWithoutNode; // This tree now contains the moved node in its new position
  };
  
  
  // Check if draggedNodeId can be dropped into targetFolderId (or at root if targetFolderId is null)
  export const canDrop = (tree, draggedNodeId, targetFolderId) => {
    if (!draggedNodeId || !Array.isArray(tree)) return false;
  
    const { node: draggedNode } = findNodeById(tree, draggedNodeId);
    if (!draggedNode) return false; // Dragged node doesn't exist
  
    // Case 1: Dropping at the root (targetFolderId is null)
    if (targetFolderId === null) {
      return true; // Generally allowed to drop at root
    }
  
    // Case 2: Dropping into a specific folder (targetFolderId is an ID)
    const { node: targetFolderNode } = findNodeById(tree, targetFolderId);
  
    // Target must exist and be a folder
    if (!targetFolderNode || targetFolderNode.type !== 'folder') {
      return false; // Target is not a valid folder
    }
  
    // Cannot drop a node into itself
    if (draggedNodeId === targetFolderId) {
      return false;
    }
  
    // If dragging a folder, prevent dropping it into one of its own descendants
    if (draggedNode.type === 'folder') {
      // Check if targetFolderId is a descendant of draggedNodeId
      const pathFromDraggedToTarget = getPathToNode(draggedNode.children || [], targetFolderId);
      if(pathFromDraggedToTarget && pathFromDraggedToTarget.includes(targetFolderId)){
          // This check is more direct: is target inside draggedNode's children?
          // A more robust check: traverse upwards from targetFolderId to see if draggedNodeId is an ancestor.
          let currentAncestorId = targetFolderId;
          while(currentAncestorId) {
              const { parent } = findNodeById(tree, currentAncestorId);
              if (!parent) break; // Reached root or an orphaned node
              if (parent.id === draggedNodeId) return false; // draggedNode is an ancestor of targetFolder
              currentAncestorId = parent.id;
          }
      }
       // Simpler check: is targetFolderId part of the subtree of draggedNode?
       // This can be done by checking if targetFolderId is an id within draggedNode.children recursively.
       // The original logic was:
       // let currentParentPathNodeId = targetFolderId;
       // while (currentParentPathNodeId) {
       //   if (currentParentPathNodeId === draggedNodeId) {
       //     return false; // targetFolder is a descendant of draggedNode (this logic is actually reversed)
       //   }
       //   const parentInfo = findNodeById(tree, currentParentPathNodeId);
       //   currentParentPathNodeId = parentInfo && parentInfo.parent ? parentInfo.parent.id : null;
       // }
       // Corrected logic: Check if targetFolder is a descendant of draggedNode.
       // If so, draggedNode cannot be moved into targetFolder.
       // This means checking if draggedNode is an ancestor of targetFolder.
       const pathFromRootToTarget = getPathToNode(tree, targetFolderId);
       if (pathFromRootToTarget.includes(draggedNodeId)) {
           return false; // Cannot drop a folder into its own descendant.
       }
    }
    return true; // If all checks pass
  };
  
  
  export const getFileExtension = (filename) => {
    if (typeof filename !== 'string') return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };
  