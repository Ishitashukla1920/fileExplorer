// updated: components/FileTree/FileTree.jsx
import React, { useState, useCallback } from 'react';
import FileTreeNode from './FileTreeNode';
import ContextMenu from './ContextMenu';
import { useFileTree } from '../../hooks/useFileTree';
import { findNodeById, canDrop, findNodeAndIndexById } from '../../utils/treeUtils';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  Upload,
  Download,
  RefreshCw,
  FolderPlus,
  FilePlus,
  SunMoon
} from 'lucide-react';

const FileTree = ({ 
  isDarkMode, // <-- Accept isDarkMode prop
  onThemeToggle, 
  onFileSelect 
}) => {
  const {
    treeData,
    selectedNodeId,
    contextMenuNode,
    contextMenuPosition,
    selectNode,
    toggleFolder,
    openContextMenu,
    closeContextMenu,
    deleteNode,
    createFile,
    createFolder,
    renameItem,
    moveItem,
    importTreeData,
    exportTreeData,
    resetTreeData
  } = useFileTree();

  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSelect = useCallback(
    (id) => {
      selectNode(id);
      const result = findNodeById(treeData, id);
      if (result?.node?.type === 'file') {
        onFileSelect(result.node);
      } else {
        onFileSelect(null);
      }
    },
    [selectNode, treeData, onFileSelect]
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
    if (contextMenuNode) closeContextMenu();
  }, [contextMenuNode, closeContextMenu]);

  const handleDragOver = useCallback((event) => {
    setOverId(event.over?.id || null);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      setActiveId(null); 
      setOverId(null);   
      if (!active || !over ) return; 
      if (active.id === over.id) return; // No actual move if dropped on self
      
      const activeNodeResult = findNodeById(treeData, active.id);
      const overNodeResult = findNodeById(treeData, over.id);
      if (!activeNodeResult?.node) return;
      const overNode = overNodeResult?.node;

      if (!overNode) {
          if (canDrop(treeData, active.id, null)) {
              const { index: currentIndexInRoot } = findNodeAndIndexById(treeData, active.id);
              if (currentIndexInRoot !== treeData.length -1) { 
                moveItem(active.id, null, treeData.length); 
              }
          }
          return;
      }

      const { parent: activeNodeCurrentParent } = findNodeAndIndexById(treeData, active.id);
      const activeNodeCurrentParentId = activeNodeCurrentParent ? activeNodeCurrentParent.id : null;

      if (overNode.type === 'folder' && canDrop(treeData, active.id, over.id)) {
        if (activeNodeCurrentParentId !== over.id) {
            moveItem(active.id, over.id, 0); 
            return;
        }
      }

      const { parent: overNodeParent, index: overNodeIndexInParent } = findNodeAndIndexById(treeData, over.id);
      const targetParentIdForInsertBefore = overNodeParent ? overNodeParent.id : null; 

      if (canDrop(treeData, active.id, targetParentIdForInsertBefore)) {
        moveItem(active.id, targetParentIdForInsertBefore, overNodeIndexInParent);
      }
    },
    [treeData, moveItem, closeContextMenu] 
  );

  const handleImport = () => { /* ... (import logic unchanged) ... */ 
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const imported = JSON.parse(ev.target.result);
          if(importTreeData(imported)) {
            console.log("Tree data imported successfully.");
          } else {
            console.log("Tree data import failed.");
          }
        } catch (err) {
          console.error('Failed to parse imported JSON:', err);
          alert('Failed to import: Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  const handleExport = () => { /* ... (export logic unchanged) ... */ 
    try {
        const jsonData = exportTreeData();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'file-tree-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to export tree data:", error);
        alert("Error exporting tree data. See console for details.");
    }
  };
  const handleToolbarCreateFile = () => createFile(null, 'NewFile'); 
  const handleToolbarCreateFolder = () => createFolder(null, 'NewFolder'); 

  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }),
  };

  // Base classes for FileTree container
  const fileTreeContainerBaseClasses = "h-full flex flex-col";
  // Theme-specific classes for FileTree container
  const fileTreeContainerThemeClasses = isDarkMode 
    ? "bg-gray-800 text-white" // Dark theme for FileTree itself
    : "bg-gray-50 text-gray-900"; // Light theme for FileTree itself

  // Base classes for Toolbar
  const toolbarBaseClasses = "flex justify-between items-center p-2 border-b";
  const toolbarThemeClasses = isDarkMode 
    ? "border-gray-700" 
    : "border-gray-300";
  const toolbarButtonThemeClasses = isDarkMode 
    ? "hover:bg-gray-700" 
    : "hover:bg-gray-200";
  const toolbarTextColor = isDarkMode ? "text-white" : "text-gray-800";
  const iconColor = isDarkMode ? "text-gray-400" : "text-gray-500"; // General icon color

  return (
    <div className={`${fileTreeContainerBaseClasses} ${fileTreeContainerThemeClasses}`}>
      {/* Toolbar */}
      <div className={`${toolbarBaseClasses} ${toolbarThemeClasses}`}>
        <div className={`text-md font-semibold ${toolbarTextColor}`}>File Explorer</div>
        <div className="flex space-x-1">
          {/* Toolbar buttons with theme-aware hover */}
          <button onClick={handleToolbarCreateFile} title="New File (Alt+F)" className={`p-1.5 rounded ${toolbarButtonThemeClasses}`}>
            <FilePlus className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          </button>
          <button onClick={handleToolbarCreateFolder} title="New Folder (Alt+N)" className={`p-1.5 rounded ${toolbarButtonThemeClasses}`}>
            <FolderPlus className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
          </button>
          <button onClick={resetTreeData} title="Reset Tree" className={`p-1.5 rounded ${toolbarButtonThemeClasses}`}>
            <RefreshCw className={`w-5 h-5 ${iconColor}`} />
          </button>
          <button onClick={handleImport} title="Import JSON" className={`p-1.5 rounded ${toolbarButtonThemeClasses}`}>
            <Upload className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
          </button>
          <button onClick={handleExport} title="Export JSON" className={`p-1.5 rounded ${toolbarButtonThemeClasses}`}>
            <Download className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
          </button>
          <button onClick={onThemeToggle} title="Toggle Theme" className={`p-1.5 rounded ${toolbarButtonThemeClasses}`}>
            <SunMoon className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
          </button>
        </div>
      </div>

      {/* File Tree */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => { setActiveId(null); setOverId(null); }}
      >
        <div className="flex-1 overflow-auto p-1 space-y-0.5">
          {treeData.map(node => (
            <FileTreeNode
              key={node.id}
              node={node}
              isDarkMode={isDarkMode} // <-- Pass isDarkMode down
              onSelect={handleSelect}
              onToggle={toggleFolder}
              onContextMenu={openContextMenu}
              selectedNodeId={selectedNodeId}
              isCurrentlyDraggedItem={activeId === node.id}
              isCurrentDropTarget={overId === node.id}
              activeDragItemId={activeId}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeId && (
                <div className={`px-3 py-1.5 rounded-md text-sm shadow-xl pointer-events-none ${
                  isDarkMode ? 'bg-blue-500 bg-opacity-80 text-white' : 'bg-blue-500 bg-opacity-90 text-white'
                }`}>
                    {findNodeById(treeData, activeId)?.node?.name || 'Dragging item...'}
                </div>
            )}
        </DragOverlay>
      </DndContext>

      {/* Context Menu */}
      {contextMenuNode && (
        <ContextMenu
          node={contextMenuNode}
          isDarkMode={isDarkMode} // <-- Pass isDarkMode down
          position={contextMenuPosition}
          onClose={closeContextMenu}
          onDelete={() => { deleteNode(contextMenuNode.id); closeContextMenu(); }}
          onRename={(newName) => { renameItem(contextMenuNode.id, newName); closeContextMenu(); }}
          onCreateFile={(name) => {
            const parentInfo = findNodeById(treeData, contextMenuNode.id);
            const parentId = contextMenuNode.type === 'folder' 
                             ? contextMenuNode.id 
                             : (parentInfo?.parent ? parentInfo.parent.id : null);
            createFile(parentId, name || 'NewFileFromContext');
            closeContextMenu();
          }}
          onCreateFolder={(name) => {
            const parentInfo = findNodeById(treeData, contextMenuNode.id);
            const parentId = contextMenuNode.type === 'folder' 
                             ? contextMenuNode.id 
                             : (parentInfo?.parent ? parentInfo.parent.id : null);
            createFolder(parentId, name || 'NewFolderFromContext');
            closeContextMenu();
          }}
        />
      )}
    </div>
  );
};

export default FileTree;
