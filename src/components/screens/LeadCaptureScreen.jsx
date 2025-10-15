
// src/components/screens/LeadCaptureScreen.jsx

import React from 'react';
// FIX: Using the highly stable 'react-qr-code' library
import QRCode from 'react-qr-code'; 
import { useVibe } from '../../context/VibeContext';
import { useTranslation } from 'react-i18next';


const LeadCaptureScreen = () => {
    const { quizAnswers, navigate, isDarkTheme } = useVibe();
    const { t } = useTranslation();


    // Dynamic Class Logic (These use colors defined in tailwind.config/index.css)
    const containerBg = isDarkTheme ? 'bg-E6E2D3' : 'bg-light-card-bg';
    const textPrimary = isDarkTheme ? 'text-111111' : 'text-light-secondary';
    const buttonClass = isDarkTheme 
        ? 'mt-6 w-full py-4 bg-111111 text-F5F5F5 text-xl font-sans font-medium rounded-xl shadow-lg hover:bg-2A2A2A transition duration-300 transform hover:scale-105 active:scale-100'
        : 'mt-6 w-full py-4 bg-light-secondary text-light-card-bg text-xl font-sans font-medium rounded-xl shadow-lg hover:bg-light-primary transition duration-300 transform hover:scale-105 active:scale-100';

    // The logic to generate the URL (btoa(JSON.stringify(quizAnswers)))
    const profileUrl = `https://evoljewels.com/saved-look?vibe=${btoa(JSON.stringify(quizAnswers))}&match=true`;

    // Dynamic colors for QR code to maintain theme contrast
    // Note: react-qr-code uses standard hex values for bgcolor and fgcolor
    const qrBgColor = isDarkTheme ? '#E6E2D3' : '#FFFFFF';
    const qrFgColor = isDarkTheme ? '#111111' : '#333333';


    return (
        <div id="leadCaptureScreen" className="screen flex-col flex">
            <div className={`${containerBg} p-6 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full ${textPrimary}`}>
                <p className="text-3xl md:text-5xl font-serif font-extrabold mb-4">
                    {t('saveYourLook')}
                </p>
                <h3 className="text-xl md:text-2xl font-sans font-semibold mb-8 leading-tight">
                    {t('saveLookPrompt')}
                </h3>
                
                <div id="qrCodeContainer" 
                     className={`mt-8 mx-auto flex items-center justify-center p-4 rounded-xl border border-dashed ${isDarkTheme ? 'bg-E6E2D3 border-DAD5C1' : 'bg-white border-gray-400'}`}
                >
                    <QRCode 
                        value={profileUrl} 
                        size={200} 
                        level="H" 
                        bgColor={qrBgColor} 
                        fgColor={qrFgColor} 
                    />
                </div>

                <p className="mt-8 text-sm text-B1B1B1 font-sans">
                    {t('scanNow')}
                </p>
                <button 
                    onClick={() => navigate('results')}
                    className={buttonClass}
                >
                    {t('doneScanning')}
                </button>
            </div>
        </div>
    );
};

export default LeadCaptureScreen;
