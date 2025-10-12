// src/components/screens/LeadCaptureScreen.jsx

import React from 'react';
// FIX: Change to a default import from the main package name
// import QRCode from 'qrcode.react'; 
import { useVibe } from '../../context/VibeContext';

const LeadCaptureScreen = () => {
    const { quizAnswers, navigate, isDarkTheme } = useVibe();

    // Dynamic Class Logic
    const containerBg = isDarkTheme ? 'bg-E6E2D3' : 'bg-light-card-bg';
    const textPrimary = isDarkTheme ? 'text-111111' : 'text-light-secondary';
    const buttonClass = isDarkTheme 
        ? 'mt-6 w-full py-4 bg-111111 text-F5F5F5 text-xl font-sans font-medium rounded-xl shadow-lg hover:bg-2A2A2A transition duration-300 transform hover:scale-105 active:scale-100'
        : 'mt-6 w-full py-4 bg-light-secondary text-light-card-bg text-xl font-sans font-medium rounded-xl shadow-lg hover:bg-light-primary transition duration-300 transform hover:scale-105 active:scale-100';

    // The logic to generate the URL (copied from prototype)
    const profileUrl = `https://evoljewels.com/saved-look?vibe=${btoa(JSON.stringify(quizAnswers))}&match=true`;

    return (
        <div id="leadCaptureScreen" className="screen flex-col flex">
            <div className={`${containerBg} p-6 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full ${textPrimary}`}>
                <p className="text-3xl md:text-5xl font-serif font-extrabold mb-4">
                    Save Your Look!
                </p>
                <h3 className="text-xl md:text-2xl font-sans font-semibold mb-8 leading-tight">
                    Scan the QR code to save your recommended products and unlock your special in-store offer.
                </h3>
                
                {/* <div id="qrCodeContainer" className="mt-8 mx-auto flex items-center justify-center bg-E6E2D3">
                    <QRCode 
                        value={profileUrl} 
                        size={200} 
                        level="H" 
                        bgColor="#E6E2D3" 
                        fgColor="#111111" 
                        // Note: You might need to adjust bgColor/fgColor dynamically for light theme 
                    />
                </div> */}

                <div id="qrCodeContainer" className="mt-8 mx-auto flex items-center justify-center bg-E6E2D3 h-64 border-4 border-dashed border-gray-400">
                    {/* Placeholder for QR Code: Component removed to fix crash */}
                    <p className="text-gray-700">QR Code functionality removed.</p>
                </div>

                <p className="mt-8 text-sm text-B1B1B1 font-sans">
                    Scan this code with your phone camera now!
                </p>
                <button 
                    onClick={() => navigate('results')}
                    className={buttonClass}
                >
                    Done Scanning / Back to Products
                </button>
            </div>
        </div>
    );
};

export default LeadCaptureScreen;