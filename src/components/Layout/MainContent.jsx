// updated: components/Layout/MainContent.jsx
import React from 'react';
import FileTree from '../FileTree/FileTree'; 
import { FileText, Info } from 'lucide-react';

const MainContent = ({
  isDarkMode,
  onThemeToggle, 
  selectedFile,  
  onFileSelect   
}) => {
  return (
    <div className={`flex-1 flex h-[calc(100vh-var(--header-height,60px))] ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      {/* File Explorer Panel (Sidebar) */}
      <aside className={`w-64 md:w-72 lg:w-80 border-r ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'} flex flex-col`}>
        {/* Ensure FileTree itself can adapt its internal background if its container's bg doesn't cover everything */}
        <FileTree 
          isDarkMode={isDarkMode} // <-- Pass isDarkMode here
          onThemeToggle={onThemeToggle} 
          onFileSelect={onFileSelect}    
        />
      </aside>
      
      {/* Content Preview Panel */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {selectedFile && selectedFile.type === 'file' ? (
          <div className="max-w-full">
            <h2 className={`text-xl font-semibold mb-3 pb-2 border-b ${isDarkMode ? 'border-gray-700 text-gray-100' : 'border-gray-300 text-gray-900'}`}>
              {selectedFile.name}
            </h2>
            <pre
              className={`p-4 rounded-lg border text-sm leading-relaxed ${
                isDarkMode
                  ? 'bg-gray-900 border-gray-700 text-gray-300' // Preview area dark theme
                  : 'bg-white border-gray-300 text-gray-700'   // Preview area light theme
              } overflow-auto whitespace-pre-wrap break-words max-h-[calc(100vh-var(--header-height,60px)-120px)]`}
              aria-label={`Content of ${selectedFile.name}`}
            >
              {selectedFile.content !== undefined && selectedFile.content !== null 
                ? (selectedFile.content.trim() === '' ? (isDarkMode ? '// This file is empty.' : '// This file is empty.') : selectedFile.content)
                : (isDarkMode ? '// This file has no content property or it is null.' : '// This file has no content property or it is null.')}
            </pre>
          </div>
        ) : (
          <div className={`h-full flex flex-col items-center justify-center text-center opacity-70 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            {selectedFile && selectedFile.type === 'folder' ? (
                <>
                    <Info className={`w-16 h-16 mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Folder Selected: {selectedFile.name}</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select a file to view its content, or right-click the folder for options.</p>
                </>
            ) : (
                <>
                    <FileText className="w-16 h-16 mb-4" /> {/* Icon color will be inherited or can be set */}
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>No file selected</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select a file from the explorer to view its content here.</p>
                </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MainContent;
