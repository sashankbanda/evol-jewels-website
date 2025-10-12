// src/components/shared/MessageModal.jsx

import React from 'react';
import { useVibe } from '../../context/VibeContext';

const MessageModal = () => {
    const { isDarkTheme, messageModal, hideMessageModal, navigate } = useVibe();

    if (!messageModal) return null;

    // Use existing styling logic from other shared components
    const modalBg = isDarkTheme ? 'rgba(17, 17, 17, 0.95)' : 'rgba(0, 0, 0, 0.8)';
    const modalContentClass = isDarkTheme ? 'card-bg p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-DAD5C1/50' : 'bg-light-card-bg p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border border-gray-200';
    const primaryCtaClass = isDarkTheme ? 'primary-cta' : 'primary-cta light-theme';

    const handleOk = () => {
        hideMessageModal();
        // Optionally navigate away or perform other actions here
    };

    return (
        // The overlay container (fixed, z-50)
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: modalBg }}>
            <div className={modalContentClass}>
                
                <h4 className="text-2xl font-serif font-bold mb-4 text-text-light">
                    Heads Up!
                </h4>
                
                <p className="text-lg text-B1B1B1 font-sans mb-8">
                    {messageModal}
                </p>

                <button 
                    onClick={handleOk}
                    className={`w-full py-3 text-xl font-sans rounded-xl shadow-md ${primaryCtaClass}`}
                >
                    OK
                </button>

            </div>
        </div>
    );
};

export default MessageModal;