import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { DndContext } from '@dnd-kit/core';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DndContext>
      <App />
    </DndContext>
  </React.StrictMode>,
)