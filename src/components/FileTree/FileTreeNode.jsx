// updated: components/FileTree/FileTreeNode.jsx
import React from 'react';
import { FileIcon, FolderIcon } from './TreeIcons';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

const FileTreeNode = ({
  node,
  level = 0,
  isDarkMode, // <-- Accept isDarkMode
  onSelect,
  onToggle,
  onContextMenu,
  selectedNodeId,
  isCurrentlyDraggedItem,
  isCurrentDropTarget,
  activeDragItemId,
}) => {
  const { id, name, type, isOpen, children } = node;
  const isSelected = selectedNodeId === id;

  const { attributes, listeners, setNodeRef: setDraggableNodeRef } = useDraggable({
    id: id, data: { node, type: 'TREE_NODE' }
  });

  const { setNodeRef: setDroppableNodeRef, isOver: dndKitIsOverThisInstance } = useDroppable({
    id: id, data: { node, type: 'TREE_NODE_TARGET' }
  });

  const combinedRef = (element) => {
    setDraggableNodeRef(element);
    setDroppableNodeRef(element);
  };

  const handleContextMenu = (e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(id, e.clientX, e.clientY); };
  const handleClick = (e) => { e.stopPropagation(); onSelect(id); };
  const handleDoubleClick = (e) => { e.stopPropagation(); if (type === 'folder') onToggle(id); };
  const handleToggleClick = (e) => { e.stopPropagation(); if (type === 'folder') onToggle(id); };

  const indent = `${level * 20}px`;
  const showDropIndicator = dndKitIsOverThisInstance && !isCurrentlyDraggedItem;

  // Theme-dependent classes
  const selectedClasses = isDarkMode
    ? 'bg-blue-600 bg-opacity-60 text-white'
    : 'bg-blue-200 text-blue-800';
  const hoverClasses = isDarkMode
    ? 'hover:bg-gray-700 hover:bg-opacity-70'
    : 'hover:bg-gray-200';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800'; // General text color for node name
  const chevronColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const chevronHoverBg = isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-300';

  const nodeClasses = `
    flex items-center py-1.5 px-2 cursor-pointer select-none rounded-md
    group relative
    transition-all duration-100 ease-in-out
    ${isSelected ? selectedClasses : `${hoverClasses} ${textColor}`}
    ${isCurrentlyDraggedItem ? 'opacity-40' : 'opacity-100'}
  `;

  const dropIndicatorClasses = `
    absolute top-0 left-0 right-0 h-0.5 bg-blue-400 z-10
    transition-opacity duration-150 ease-in-out
    ${showDropIndicator ? 'opacity-100' : 'opacity-0'}
  `;

  return (
    <div ref={combinedRef} className="relative" {...attributes} {...listeners}>
      <div className={dropIndicatorClasses}></div>
      <div
        className={nodeClasses}
        style={{ paddingLeft: indent }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {type === 'folder' && (
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse ${name} folder` : `Expand ${name} folder`}
            className={`inline-flex mr-1.5 w-5 h-5 items-center justify-center rounded focus:outline-none focus:ring-1 ${isDarkMode ? 'focus:ring-blue-400' : 'focus:ring-blue-600'} ${chevronHoverBg}`}
            onClick={handleToggleClick}
          >
            {isOpen ?
              <ChevronDown className={`w-4 h-4 ${chevronColor}`} /> :
              <ChevronRight className={`w-4 h-4 ${chevronColor}`} />
            }
          </button>
        )}

        <div className="flex items-center min-w-0 flex-shrink-0 mr-1.5">
          {type === 'folder' ? (
            <FolderIcon isOpen={isOpen} isDarkMode={isDarkMode} /> // Pass isDarkMode
          ) : (
            <FileIcon fileName={name} isDarkMode={isDarkMode} /> // Pass isDarkMode
          )}
        </div>

        <span className={`truncate text-sm flex-grow ${isSelected && !isDarkMode ? 'text-blue-800 font-medium' : (isSelected && isDarkMode ? 'text-white font-medium' : '')}`}>
          {name}
        </span>
      </div>

      {type === 'folder' && isOpen && children && children.length > 0 && (
        <div className="children pl-2">
          {children.map(childNode => (
            <FileTreeNode
              key={childNode.id}
              node={childNode}
              level={level + 1}
              isDarkMode={isDarkMode} // <-- Pass isDarkMode down
              onSelect={onSelect}
              onToggle={onToggle}
              onContextMenu={onContextMenu}
              selectedNodeId={selectedNodeId}
              isCurrentlyDraggedItem={activeDragItemId === childNode.id}
              isCurrentDropTarget={dndKitIsOverThisInstance && activeDragItemId !== null && activeDragItemId === childNode.id}
              activeDragItemId={activeDragItemId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;