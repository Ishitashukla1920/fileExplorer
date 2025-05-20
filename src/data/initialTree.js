// src/data/initialTree.js

// Helper to generate unique IDs
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

export const initialTreeData = [
  {
    id: generateId(),
    name: "README.md",
    type: "file",
    content: "# Project Title\n\nThis is a sample README file.\n\n- Feature 1\n- Feature 2\n",
  },
  {
    id: generateId(),
    name: "src",
    type: "folder",
    isOpen: true, // Root 'src' folder is open by default
    children: [
      {
        id: generateId(),
        name: "App.jsx",
        type: "file",
        content: "// src/App.jsx\nimport React from 'react';\n\nfunction App() {\n  return <h1>Hello, World!</h1>;\n}\n\nexport default App;",
      },
      {
        id: generateId(),
        name: "index.js",
        type: "file",
        content: "// src/index.js\nimport React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);",
      },
      {
        id: generateId(),
        name: "components",
        type: "folder",
        isOpen: false,
        children: [
          {
            id: generateId(),
            name: "Button.jsx",
            type: "file",
            content: "// src/components/Button.jsx\nimport React from 'react';\n\nconst Button = ({ children }) => {\n  return <button>{children}</button>;\n};\n\nexport default Button;",
          },
          {
            id: generateId(),
            name: "Card.jsx",
            type: "file",
            content: "// src/components/Card.jsx\nimport React from 'react';\n\nconst Card = ({ title, children }) => {\n  return (\n    <div className='card'>\n      <h2>{title}</h2>\n      {children}\n    </div>\n  );\n};\n\nexport default Card;",
          },
        ],
      },
      {
        id: generateId(),
        name: "assets",
        type: "folder",
        isOpen: true,
        children: [
          { id: generateId(), name: "logo.svg", type: "file", content: "<svg>...</svg>" },
          { id: generateId(), name: "favicon.ico", type: "file", content: "binary data..." }, // Content can be placeholder for binary
        ],
      },
      {
        id: generateId(),
        name: "styles",
        type: "folder",
        isOpen: false,
        children: [
            {id: generateId(), name: "main.css", type: "file", content: "/* styles/main.css */\nbody {\n font-family: sans-serif;\n}"}
        ]
      }
    ],
  },
  {
    id: generateId(),
    name: "public",
    type: "folder",
    isOpen: false,
    children: [
      { id: generateId(), name: "index.html", type: "file", content: "<!DOCTYPE html>..." },
      { id: generateId(), name: "robots.txt", type: "file", content: "User-agent: *\nDisallow:" },
    ],
  },
  {
    id: generateId(),
    name: "package.json",
    type: "file",
    content: JSON.stringify({
      name: "my-app",
      version: "0.1.0",
      private: true,
      dependencies: {
        react: "^18.2.0",
      },
    }, null, 2),
  },
  {
    id: generateId(),
    name: ".gitignore",
    type: "file",
    content: "node_modules\nbuild\n.DS_Store\n*.log",
  },
  {
    id: generateId(),
    name: "empty-folder",
    type: "folder",
    isOpen: false,
    children: []
  }
];
