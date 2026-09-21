import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { applyPalette, DEFAULT_PALETTE } from './lib/palettes';
import './styles.css';

applyPalette(DEFAULT_PALETTE);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
