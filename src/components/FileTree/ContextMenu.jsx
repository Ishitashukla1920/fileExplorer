// updated: components/ContextMenu.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Edit2, Trash2, FolderPlus, FilePlus } from 'lucide-react';

const ContextMenu = ({ 
  node, 
  isDarkMode, // <-- Accept isDarkMode
  position, 
  onClose, 
  onDelete,       
  onRename,       
  onCreateFile,   
  onCreateFolder  
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node?.name || '');
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  
  const menuStyle = { left: `${position.x}px`, top:  `${position.y}px` };
  
  useEffect(() => { if (isRenaming && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } }, [isRenaming]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (isRenaming) { inputRef.current?.blur(); } else { onClose(); }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, isRenaming]);

  const handleRenameClick = (e) => { e.stopPropagation(); setIsRenaming(true); setNewName(node.name); };
  const handleRenameSubmit = (e) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (trimmed && trimmed !== node.name) { onRename(trimmed); }
    setIsRenaming(false); onClose();
  };
  const handleRenameBlur = () => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== node.name) { onRename(trimmed); }
    setIsRenaming(false); onClose();
  };
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${node.name}"? This action cannot be undone.`)) {
      onDelete(); onClose();
    }
  };
  const handleCreateFileClick = (e) => {
    e.stopPropagation();
    const fileName = window.prompt(`Enter name for the new file in ${node.type === 'folder' ? node.name : 'current directory'}:`, "new-file.txt");
    if (fileName) { onCreateFile(fileName); }
    onClose(); 
  };
  const handleCreateFolderClick = (e) => {
    e.stopPropagation();
    const folderName = window.prompt(`Enter name for the new folder in ${node.type === 'folder' ? node.name : 'current directory'}:`, "NewFolder");
    if (folderName) { onCreateFolder(folderName); }
    onClose();
  };
  
  if (!node) return null;

  // Theme-dependent classes
  const menuBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const menuBorder = isDarkMode ? 'border-gray-700' : 'border-gray-300';
  const menuTextColor = isDarkMode ? 'text-gray-200' : 'text-gray-700';
  const menuItemHoverBg = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorder = isDarkMode ? 'border-gray-600' : 'border-gray-300';
  const inputFocusRing = isDarkMode ? 'focus:ring-blue-500' : 'focus:ring-blue-500'; // Keep focus ring color consistent or make it themeable
  const inputText = isDarkMode ? 'text-white' : 'text-gray-900';
  const iconColor = isDarkMode ? 'text-gray-300' : 'text-gray-500';
  const destructiveColor = isDarkMode ? 'text-red-400' : 'text-red-600';
  const destructiveHoverBg = isDarkMode ? 'hover:bg-red-700 hover:text-white' : 'hover:bg-red-100';


  return (
    <div
      ref={menuRef}
      className={`absolute z-50 w-52 rounded-md shadow-xl py-1 ${menuBg} ${menuBorder} ${menuTextColor}`}
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {isRenaming ? (
        <form onSubmit={handleRenameSubmit} className="p-2">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={handleRenameBlur}
            className={`w-full px-2 py-1.5 text-sm rounded focus:outline-none focus:ring-2 ${inputBg} ${inputBorder} ${inputFocusRing} ${inputText} placeholder-gray-400`}
            placeholder="Enter new name"
            onKeyDown={e => {
              if (e.key === 'Escape') { setIsRenaming(false); setNewName(node.name); onClose(); } 
              else if (e.key === 'Enter') { handleRenameSubmit(e); }
            }}
          />
        </form>
      ) : (
        <ul>
          <li
            className={`flex items-center px-3 py-2 text-sm cursor-pointer ${menuItemHoverBg}`}
            onClick={handleRenameClick}
          >
            <Edit2 className={`w-4 h-4 mr-3 ${iconColor}`} />
            Rename
          </li>
          
          <li
            className={`flex items-center px-3 py-2 text-sm cursor-pointer ${destructiveColor} ${destructiveHoverBg}`}
            onClick={handleDeleteClick}
          >
            <Trash2 className="w-4 h-4 mr-3" /> {/* Icon color will be handled by text-red-* */}
            Delete
          </li>
          
          {node.type === 'folder' && (
            <>
              <hr className={`my-1 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
              <li
                className={`flex items-center px-3 py-2 text-sm cursor-pointer ${menuItemHoverBg}`}
                onClick={handleCreateFileClick}
              >
                <FilePlus className={`w-4 h-4 mr-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                New File
              </li>
              <li
                className={`flex items-center px-3 py-2 text-sm cursor-pointer ${menuItemHoverBg}`}
                onClick={handleCreateFolderClick}
              >
                <FolderPlus className={`w-4 h-4 mr-3 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
                New Folder
              </li>
            </>
          )}
        </ul>
      )}
    </div>
  );
};

export default ContextMenu;
