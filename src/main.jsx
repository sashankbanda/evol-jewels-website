
// FILE: src/main.jsx

import React, { StrictMode } from 'react' // <--- ADDED React IMPORT HERE
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n'; // Import and initialize i18next

// ADDED Console Log here (Line 7)
console.log("--- main.jsx: Script started and creating root ---");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
