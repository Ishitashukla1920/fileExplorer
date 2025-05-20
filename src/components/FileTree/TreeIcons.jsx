// updated: components/TreeIcons.jsx
import React from 'react';
import * as Icons from 'lucide-react';

const defaultIconWidthHeight = "w-5 h-5"; // Slightly larger default
const defaultIconMargin = "mr-1.5";
const defaultIconFlexShrink = "flex-shrink-0";

const extensionToIconName = {
  js:   'FileCode2', jsx:  'FileCode2', ts:   'FileCode2', tsx:  'FileCode2',
  py:   'FileCode', java: 'FileCode', c:    'FileCode', cpp:  'FileCode',
  cs:   'FileCode', go:   'FileCode', rb:   'FileCode', php:  'FileCode',
  swift:'FileCode', kt:   'FileCode', rs:   'FileCode',
  css:  'FileCss', scss: 'FileCss', sass: 'FileCss', less: 'FileCss',
  html: 'FileHtml', xml:  'FileCode', json: 'FileJson', yaml: 'FileJson2', yml:  'FileJson2',
  csv:  'FileSpreadsheet',
  md:   'FileText', txt:  'FileText', doc:  'FileText', docx: 'FileText', pdf:  'FilePdf',
  png:  'FileImage', jpg:  'FileImage', jpeg: 'FileImage', gif:  'FileImage',
  svg:  'FileSvg', webp: 'FileImage', ico:  'FileImage', bmp:  'FileImage',
  mp3:  'FileAudio', wav:  'FileAudio', ogg:  'FileAudio',
  mp4:  'FileVideo', mov:  'FileVideo', avi:  'FileVideo', mkv:  'FileVideo',
  zip:  'FileArchive', tar:  'FileArchive', gz:   'FileArchive', rar:  'FileArchive', '7z': 'FileArchive',
  exe:  'AppWindow', sh:   'FileTerminal', bat:  'FileTerminal', log:  'FileText',
  git:  'GitCommit', gitignore: 'ShieldAlert', npmignore: 'ShieldAlert',
  env:  'FileLock2', lock: 'Lock',
  default: 'File',
};

export function FileIcon({ fileName, className, isDarkMode }) {
  const baseClasses = `${defaultIconWidthHeight} ${defaultIconMargin} ${defaultIconFlexShrink}`;
  // Define text colors based on theme
  const lightThemeColor = "text-gray-500"; // Default for light mode
  const darkThemeColor = "text-gray-400";  // Default for dark mode
  
  const effectiveColor = isDarkMode ? darkThemeColor : lightThemeColor;
  const effectiveClassName = className || `${baseClasses} ${effectiveColor}`;
  
  if (typeof fileName !== 'string' || fileName.trim() === '') {
    const FallbackIcon = Icons[extensionToIconName.default] || Icons.File;
    return <FallbackIcon className={effectiveClassName} />;
  }

  const ext = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : 'default';
  
  if (fileName.endsWith('.lock')) {
    const LockIcon = Icons.Lock || Icons.File;
    return <LockIcon className={effectiveClassName} />;
  }
  
  const iconName = extensionToIconName[ext] || extensionToIconName.default;
  const IconComponent = Icons[iconName] || Icons.File;

  return <IconComponent className={effectiveClassName} />;
}

export function FolderIcon({ isOpen, className, isDarkMode }) {
  const baseClasses = `${defaultIconWidthHeight} ${defaultIconMargin} ${defaultIconFlexShrink}`;
  // Define folder icon colors based on theme
  const lightThemeColor = "text-yellow-600"; // Example: slightly darker yellow for light mode
  const darkThemeColor = "text-yellow-400";  // Original yellow for dark mode

  const effectiveColor = isDarkMode ? darkThemeColor : lightThemeColor;
  const effectiveClassName = className || `${baseClasses} ${effectiveColor}`;
  
  const IconComponent = isOpen ? Icons.FolderOpen : Icons.Folder;
  return <IconComponent className={effectiveClassName} />;
}
