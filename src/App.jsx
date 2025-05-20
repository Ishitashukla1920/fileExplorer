import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Layout/Header';
import MainContent from './components/Layout/MainContent';
// Note: useFileTree is now primarily used within FileTree.jsx itself.
// App.jsx might not need all functions from useFileTree directly if FileTree manages its own state.
// However, if App needs to trigger actions like create file/folder from a global UI (like Header),
// it might need access to those functions or pass callbacks.

// For this structure, we assume FileTree component encapsulates its tree logic using useFileTree.
// App.jsx will manage theme and selected file preview.

function App() {
  // Theme state (persisted in localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme-dark-mode');
    return savedTheme ? JSON.parse(savedTheme) : true; // Default to dark mode
  });

  // Apply theme class to HTML element
  useEffect(() => {
    localStorage.setItem('app-theme-dark-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--header-height', '60px'); // Example CSS var
      document.documentElement.style.backgroundColor = '#1f2937'; // Tailwind gray-800
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--header-height', '60px');
      document.documentElement.style.backgroundColor = '#f9fafb'; // Tailwind gray-50
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  // State for the currently selected file to be displayed in MainContent
  // This will be an object like { id, name, type, content }
  const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);

  // Callback for FileTree to update the selected file for preview
  const handleFileSelectForPreview = useCallback((fileNode) => {
    if (fileNode && fileNode.type === 'file') {
      setSelectedFileForPreview(fileNode);
    } else {
      setSelectedFileForPreview(null); // Clear preview if a folder is selected or selection is cleared
    }
  }, []);

  // Placeholder functions for Header actions if they need to be managed by App
  // These would typically call functions from useFileTree if it were instantiated here.
  // Since useFileTree is in FileTree.jsx, FileTree.jsx will handle these internally
  // or App.jsx would need to pass down callbacks that FileTree can then connect.
  // For simplicity, we'll let FileTree manage its own create/delete via its internal useFileTree.
  // The Header in this App.jsx will just be for global actions like theme.
  // If Header needs to interact with tree, it should be part of FileTree or have props drilled.

  // Let's assume the Header component provided earlier is now simplified or
  // its tree-modifying buttons are part of the FileTree component's own toolbar.
  // For this App.jsx, the Header will mainly handle theme toggling.
  // The `selectedNodeId`, `onCreateFile`, `onCreateFolder`, `onDeleteNode` props for Header
  // would imply that `useFileTree` is initialized in `App`.
  // If we want `FileTree` to be self-contained with its `useFileTree`, then `App` doesn't need these.

  // Re-evaluating: The provided Header.jsx *does* expect onCreateFile etc.
  // This means useFileTree *should* be in App.jsx if Header is a direct child of App.
  // Let's adjust App.jsx to use useFileTree and pass necessary things down.

  // This is not ideal as it tightly couples App with FileTree's internal needs.
  // A better approach might be for FileTree to expose methods via a ref,
  // or use a global state manager (Context/Redux/Zustand).
  // But sticking to the provided structure for now:
  // const {
  //   selectedNodeId: ftSelectedNodeId, // Renaming to avoid conflict if App has its own selection logic
  //   createFile: ftCreateFile,
  //   createFolder: ftCreateFolder,
  //   deleteNode: ftDeleteNode,
  // } = useFileTree(); // This would mean useFileTree is initialized here.
  // This also means FileTree component would receive treeData and handlers as props.
  // This contradicts the current setup where FileTree uses its own useFileTree.

  // Let's stick to the current model: FileTree is self-contained.
  // The Header passed to App.jsx will only handle theme.
  // The FileTree component will have its own internal toolbar for file operations.

  return (
    <div className={`flex flex-col h-screen font-sans ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header 
        isDarkMode={isDarkMode} 
        onThemeToggle={toggleTheme}
        // The following props are removed as FileTree will manage its own operations
        // selectedNodeId={null} // No longer needed from App for Header
        // onCreateFile={() => console.warn("Create File from App Header - not implemented directly")}
        // onCreateFolder={() => console.warn("Create Folder from App Header - not implemented directly")}
        // onDeleteNode={() => console.warn("Delete Node from App Header - not implemented directly")}
      />

      <MainContent
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme} // Pass to FileTree's toolbar if it also has a theme toggle
        selectedFile={selectedFileForPreview}
        onFileSelect={handleFileSelectForPreview}
        // treeData and selectedNodeId are managed within FileTree component
      />
    </div>
  );
}

export default App;
