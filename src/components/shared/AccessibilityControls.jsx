// src/components/shared/AccessibilityControls.jsx

import React, { useState } from 'react';
import { useVibe } from '../../context/VibeContext';
import { useTranslation } from 'react-i18next';
import { Languages, Text, X } from 'lucide-react';

// NEW: Custom SVG Icon component to match the user's reference image
const CustomAccessibilityIcon = ({ size = 28 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
        <path d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>
    </svg>
);


const AccessibilityControls = () => {
    const { isDarkTheme, fontSize, increaseFontSize, decreaseFontSize } = useVibe();
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'te', name: 'తెలుగు' },
    ];

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-20 left-4 z-40 p-4 rounded-full transition-all duration-300 shadow-2xl ${isDarkTheme ? 'bg-DAD5C1 text-111111 hover:bg-D8CBAF' : 'bg-light-primary text-F5F5F5 hover:bg-CC484D'}`}
                aria-label={t('accessibilityControls')}
            >
                <CustomAccessibilityIcon size={28} />
            </button>
        );
    }
    
    const panelBg = isDarkTheme ? 'bg-2A2A2A border-DAD5C1/30' : 'bg-white border-gray-200';
    const sectionTitleColor = isDarkTheme ? 'text-DAD5C1' : 'text-light-primary';
    const textColor = isDarkTheme ? 'text-F5F5F5' : 'text-333333';
    const buttonBg = isDarkTheme ? 'bg-111111 hover:bg-black' : 'bg-gray-200 hover:bg-gray-300';
    
    return (
        <div className={`fixed bottom-4 left-4 z-50 w-full max-w-xs flex flex-col rounded-2xl shadow-2xl transition-all duration-300 ${panelBg} border-2 overflow-hidden p-4`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xl font-serif font-bold flex items-center gap-2 ${textColor}`}>
                    <CustomAccessibilityIcon size={20} />
                    {t('accessibilityControls')}
                </h3>
                <button onClick={() => setIsOpen(false)} className={`p-1 rounded-full hover:opacity-70 transition ${textColor}`}>
                    <X size={20} />
                </button>
            </div>

            {/* Language Selection */}
            <div className="mb-4">
                <h4 className={`font-bold font-sans mb-2 flex items-center gap-2 ${sectionTitleColor}`}>
                    <Languages size={18} />
                    {t('language')}
                </h4>
                <div className="flex space-x-2">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            className={`flex-1 py-2 text-sm font-sans rounded-md transition ${i18n.language === lang.code ? 'primary-cta' : `${buttonBg} ${textColor}`}`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Size Control */}
            <div>
                <h4 className={`font-bold font-sans mb-2 flex items-center gap-2 ${sectionTitleColor}`}>
                    <Text size={18} />
                    {t('fontSize')}
                </h4>
                <div className="flex items-center justify-between space-x-2">
                    <button onClick={decreaseFontSize} className={`px-4 py-2 text-xl font-bold rounded-md ${buttonBg} ${textColor}`}>-</button>
                    <span className={`font-sans font-medium ${textColor}`}>{fontSize}px</span>
                    <button onClick={increaseFontSize} className={`px-4 py-2 text-xl font-bold rounded-md ${buttonBg} ${textColor}`}>+</button>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityControls;