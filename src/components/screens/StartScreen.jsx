// src/components/screens/StartScreen.jsx
import React from 'react';
import { useVibe } from '../../context/VibeContext';

const StartScreen = () => {
    const { startQuiz } = useVibe();

    return (
        // Must use 'screen flex-col' to inherit the correct display property
        <div id="startScreen" className="screen flex-col">
            <h1 id="startScreenTitle" className="text-7xl md:text-8xl font-serif font-semibold mb-4 uppercase platinum-text-gradient leading-tighter-custom">
                EVOL JEWELS
            </h1>
            <p className="text-2xl md:text-3xl font-sans font-light mb-12 text-B1B1B1">
                Your Personal Digital Stylist Kiosk
            </p>
            <button 
                onClick={startQuiz}
                className="px-10 py-5 text-xl md:text-2xl font-sans rounded-xl primary-cta"
            >
                Start Your Vibe Quiz
            </button>
            <div className="mt-16 text-lg text-B1B1B1 font-sans">
                Tap to unlock your personal collection match.
            </div>
        </div>
    );
};
export default StartScreen;
