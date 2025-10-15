
// src/components/shared/NavBar.jsx
import React from 'react';
import { useVibe } from '../../context/VibeContext';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const NavBar = ({ type, onClick, cartCount }) => {
    const { isDarkTheme } = useVibe();
    const { t } = useTranslation();

    
    // Dynamic Class Logic
    const cartBg = isDarkTheme ? 'bg-DAD5C1' : 'bg-light-primary'; 
    const cartText = isDarkTheme ? 'text-111111' : 'text-F5F5F5';
    const backBg = isDarkTheme ? 'bg-2A2A2A' : 'bg-D1D5DB';
    const backText = isDarkTheme ? 'text-F5F5F5' : 'text-333333';
    const cartHover = isDarkTheme ? 'hover:bg-D8CBAF' : 'hover:bg-CC484D';
    const backHover = isDarkTheme ? 'hover:bg-111111' : 'hover:bg-B1B1B1';

    if (type === 'back') {
        return (
            // Removed 'hidden' class from here. Visibility is controlled by {showBack && ...} in App.jsx
            <button onClick={onClick} className={`back-btn ${backBg} ${backText} ${backHover}`}>
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span className="font-sans font-medium">{t('navBack')}</span>
            </button>
        );
    }
    
    if (type === 'cart') {
        return (
            // Removed 'hidden' class from here. Visibility is controlled by {showNav && ...} in App.jsx
            <button onClick={onClick} className={`cart-icon-btn ${cartBg} ${cartText} ${cartHover}`}>
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                    <span 
                        id="cartCount" 
                        className="absolute -top-1 -right-1 bg-0E5C4E text-F5F5F5 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    >
                        {cartCount}
                    </span>
                )}
            </button>
        );
    }
    
    return null;
};

export default NavBar;
