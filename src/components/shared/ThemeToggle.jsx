// src/components/shared/ThemeToggle.jsx
import React from 'react';
import { useVibe } from '../../context/VibeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const { isDarkTheme, toggleTheme } = useVibe();
    
    return (
        // The container manages its position via CSS (fixed bottom-right)
        <div className="toggle-switch-container">
            <div 
                id="themeToggle" 
                className={`toggle-switch ${!isDarkTheme ? 'toggled' : ''}`} 
                onClick={toggleTheme}
            >
                <Sun className="toggle-icon sun-icon" />
                <Moon className="toggle-icon moon-icon" />
            </div>
        </div>
    );
};

export default ThemeToggle;
