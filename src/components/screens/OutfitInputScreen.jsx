// src/components/screens/OutfitInputScreen.jsx
import React, { useState } from 'react';
import { useVibe } from '../../context/VibeContext';

const OutfitInputScreen = () => {
    const { navigate, startContextAnalysis, isDarkTheme } = useVibe();
    const [outfitText, setOutfitText] = useState('');

    const handleNext = () => {
        // Pass the user's text to the context function for AI processing
        startContextAnalysis(outfitText);
    };
    
    // Check if the text input has enough characters to be worth sending to the AI
    const isInputValid = outfitText.trim().length >= 5;

    // Dynamic classes based on the theme
    const textareaClass = isDarkTheme 
        ? 'card-bg text-text-light border-B1B1B1/30 focus:border-accent-platinum' 
        : 'bg-white text-light-secondary border-gray-300 focus:border-light-primary';

    return (
        <div id="outfitInputScreen" className="screen flex-col">
            <div className="w-full max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-serif font-semibold text-text-light mb-6 text-center">
                    Got an outfit already?
                </h2>
                
                <p className="text-xl md:text-2xl font-sans font-medium mb-8 text-B1B1B1">
                    Tell us what you're wearing for extra specific jewelry matches!
                </p>

                <textarea
                    value={outfitText}
                    onChange={(e) => setOutfitText(e.target.value)}
                    placeholder="E.g., I'm wearing a deep blue kurta for a wedding reception."
                    rows="4"
                    className={`w-full p-4 rounded-xl text-lg font-sans border focus:ring-1 resize-none mb-8 ${textareaClass}`}
                />

                <div className="flex justify-between space-x-4">
                    <button 
                        onClick={() => startContextAnalysis('')} // Pass empty string to skip analysis
                        className="flex-1 py-4 text-xl font-sans rounded-xl shadow-lg secondary-cta"
                    >
                        Skip to Results
                    </button>
                    <button 
                        onClick={handleNext}
                        disabled={!isInputValid}
                        className={`flex-1 py-4 text-xl font-sans rounded-xl shadow-lg primary-cta ${!isInputValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Analyze Outfit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OutfitInputScreen;