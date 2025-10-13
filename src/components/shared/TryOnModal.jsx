// src/components/shared/TryOnModal.jsx

import React, { useState, useEffect } from 'react';
import { useVibe } from '../../context/VibeContext';
// Keep X icon for the stop button, but we don't need Camera icon anymore
import { X } from 'lucide-react'; 
import JewelryARTryOn from './JewelryARTryOn'; 

const TryOnModal = () => {
    const { isDarkTheme, tryOnProduct, handleTryOnFeedback } = useVibe();
    
    // CRITICAL CHANGE: Initialize isCameraActive to TRUE so it starts immediately
    const [isCameraActive, setIsCameraActive] = useState(true); 
    const [engagementStatus, setEngagementStatus] = useState("Loading AR experience..."); // Updated status text

    const product = tryOnProduct;

    // Reset camera active state when the modal opens/closes
    useEffect(() => {
        if (product) {
            // Set active immediately when a product is selected
            setIsCameraActive(true); 
            setEngagementStatus("Loading AR experience...");
            const timer = setTimeout(() => {
                setEngagementStatus("Ready for try-on!");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [product]);

    // Function to handle stopping the view (will be triggered by the button)
    const handleStopView = () => {
        setIsCameraActive(false);
    };

    if (!product) return null;

    // Dynamic Class Logic
    const modalBg = isDarkTheme ? 'rgba(17, 17, 17, 0.9)' : 'rgba(0, 0, 0, 0.7)';
    const modalContentClass = isDarkTheme ? 'card-bg p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-xl text-center border border-DAD5C1/30' : 'bg-light-card-bg p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-xl text-center border border-gray-100';
    // Border change for better aesthetics when camera is active
    const arViewClass = `h-96 w-full ${isDarkTheme ? 'bg-111111' : 'bg-gray-100'} border-4 ${isCameraActive ? 'border-none' : (isDarkTheme ? 'border-dashed border-accent-platinum' : 'border-dashed border-light-primary')} rounded-xl flex items-center justify-center mb-6 relative`;
    const emotionDetectorClass = `absolute top-4 left-4 text-sm font-bold px-3 py-1 rounded-full shadow-lg z-10 ${isDarkTheme ? 'bg-0E5C4E text-F5F5F5' : 'bg-light-primary text-white'}`;
    const closeBtnTextClass = isDarkTheme ? 'text-B1B1B1 hover:text-F5F5F5' : 'text-gray-500 hover:text-gray-700';
    
    // Button classes: Only show STOP button now
    const stopCtaClass = 'bg-red-500 hover:bg-red-600 text-white';

    return (
        <div id="feedbackModal" className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: modalBg }}>
            <div className={modalContentClass}>
                <h4 className="text-3xl font-serif font-bold mb-2 text-text-light">Virtual Try-On</h4>
                <p id="modalProductName" className="text-xl text-accent-platinum font-sans font-semibold mb-4">
                    {product.name}
                </p>

                <div className={arViewClass}>
                    <JewelryARTryOn 
                        selectedJewelry={product}
                        isActive={isCameraActive}
                        setIsActive={setIsCameraActive} // Allows AR component to stop camera on failure
                    />
                    
                    {/* The engagement status shows model/tracking status */}
                    <div id="emotionDetector" className={emotionDetectorClass}>
                        {engagementStatus}
                    </div>
                </div>
                
                {/* NEW: Camera Stop Button only, always visible while in the modal */}
                <button 
                    onClick={handleStopView}
                    className={`w-full py-3 text-lg font-sans rounded-xl shadow-md transition duration-300 flex items-center justify-center gap-2 mb-4 ${stopCtaClass}`}
                >
                    <X size={20} /> Stop Try-On View
                </button>

                <div className="flex space-x-4">
                    <button 
                        onClick={() => handleTryOnFeedback('love', product)}
                        className="flex-1 py-4 text-lg font-sans rounded-xl shadow-md primary-cta">
                        Love it (Add to Cart)
                    </button>
                    <button 
                        onClick={() => handleTryOnFeedback('dislike', product)}
                        className="flex-1 py-4 text-lg font-sans rounded-xl shadow-md tertiary-cta">
                        Try Another Style
                    </button>
                </div>

               <button 
                    onClick={() => handleTryOnFeedback('cancel')} 
                    className={`mt-4 w-full py-2 text-sm font-sans transition duration-200 ${closeBtnTextClass}`}>
                    Back to Looks
                </button>
            </div>
        </div>
    );
};

export default TryOnModal;