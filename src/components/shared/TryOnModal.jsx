// src/components/shared/TryOnModal.jsx

import React, { useState, useEffect } from 'react';
import { useVibe } from '../../context/VibeContext';
import { X, SlidersHorizontal, Camera } from 'lucide-react'; 
import JewelryARTryOn from './JewelryARTryOn'; 
import AdjustmentOverlay from './AdjustmentOverlay'; 

const TryOnModal = () => {
    const { isDarkTheme, tryOnProduct, handleTryOnFeedback } = useVibe();
    
    const [isCameraActive, setIsCameraActive] = useState(true); 
    const [engagementStatus, setEngagementStatus] = useState("Loading AR experience...");
    
    const [manualAdjustment, setManualAdjustment] = useState({
        offsetX: 0,
        offsetY: 0,
        scaleFactor: 1.0,
        rotationAngle: 0, 
    });
    const [showAdjustmentOverlay, setShowAdjustmentOverlay] = useState(false); 

    const product = tryOnProduct;

    useEffect(() => {
        if (product) {
            // --- NEW: Mock Analytics & ROI Tracking ---
            const engagementData = {
                eventName: 'engagement_virtual_try_on',
                product: {
                    id: product.id,
                    name: product.name,
                    category: product.category,
                },
                timestamp: new Date().toISOString(),
            };
            // In a real-world scenario, send this to your analytics backend.
            console.log('--- MOCK ROI TRACKING: Engagement Event (Try-On) ---', engagementData);
            // --- END NEW ---

            // Ensure camera starts active when modal first opens
            setIsCameraActive(true); 
            setShowAdjustmentOverlay(false); 
            setManualAdjustment({ offsetX: 0, offsetY: 0, scaleFactor: 1.0, rotationAngle: 0 }); 
            setEngagementStatus("Loading AR experience...");
            const timer = setTimeout(() => {
                setEngagementStatus("Ready for try-on!");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [product]);

    // Function to handle stopping the view
    const handleStopView = () => {
        setIsCameraActive(false);
    };

    // NEW: Function to handle restarting the view
    const handleStartView = () => {
        setIsCameraActive(true);
    };
    
    const handleToggleAdjustments = () => {
        setShowAdjustmentOverlay(prev => !prev);
    };

    if (!product) return null;

    // Dynamic Class Logic
    const modalBg = isDarkTheme ? 'rgba(17, 17, 17, 0.9)' : 'rgba(0, 0, 0, 0.7)';
    const modalContentClass = isDarkTheme ? 'card-bg p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-xl text-center border border-DAD5C1/30 relative' : 'bg-light-card-bg p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-xl text-center border border-gray-100 relative'; 
    const arViewClass = `h-96 w-full ${isDarkTheme ? 'bg-111111' : 'bg-gray-100'} border-4 ${isCameraActive ? 'border-none' : (isDarkTheme ? 'border-dashed border-accent-platinum' : 'border-dashed border-light-primary')} rounded-xl flex items-center justify-center mb-6 relative overflow-hidden`;
    const emotionDetectorClass = `absolute top-4 left-4 text-sm font-bold px-3 py-1 rounded-full shadow-lg z-10 ${isDarkTheme ? 'bg-0E5C4E text-F5F5F5' : 'bg-light-primary text-white'}`;
    const closeBtnTextClass = isDarkTheme ? 'text-B1B1B1 hover:text-F5F5F5' : 'text-gray-500 hover:text-gray-700';
    
    // NEW: Conditional button styles and functionality
    const mainCtaText = isCameraActive ? 'Stop Try-On View' : 'Start Try-On View';
    const mainCtaClass = isCameraActive 
        ? 'bg-red-500 hover:bg-red-600 text-white' 
        : 'bg-green-500 hover:bg-green-600 text-white';
    const mainCtaIcon = isCameraActive ? <X size={20} /> : <Camera size={20} />;


    const adjustBtnClass = `absolute top-4 right-4 z-20 p-2 rounded-full shadow-lg transition-colors ${
        showAdjustmentOverlay 
            ? (isDarkTheme ? 'bg-DAD5C1 text-111111' : 'bg-light-primary text-F5F5F5')
            : (isDarkTheme ? 'bg-2A2A2A text-DAD5C1 hover:bg-111111' : 'bg-light-card-bg text-333333 hover:bg-gray-200')
    }`;


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
                        setIsActive={setIsCameraActive}
                        manualAdjustment={manualAdjustment}
                    />
                    
                    {isCameraActive && (
                        <button onClick={handleToggleAdjustments} className={adjustBtnClass}>
                            <SlidersHorizontal size={20} />
                        </button>
                    )}

                    {isCameraActive && showAdjustmentOverlay && (
                        <AdjustmentOverlay 
                            adjustment={manualAdjustment} 
                            setAdjustment={setManualAdjustment}
                            isDarkTheme={isDarkTheme}
                        />
                    )}

                    <div id="emotionDetector" className={emotionDetectorClass}>
                        {engagementStatus}
                    </div>
                </div>
                
                {/* MODIFIED: Main Start/Stop button logic */}
                <button 
                    onClick={isCameraActive ? handleStopView : handleStartView}
                    className={`w-full py-3 text-lg font-sans rounded-xl shadow-md transition duration-300 flex items-center justify-center gap-2 mb-4 ${mainCtaClass}`}
                >
                    {mainCtaIcon} {mainCtaText}
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