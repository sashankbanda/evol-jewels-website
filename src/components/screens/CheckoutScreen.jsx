
// src/components/screens/CheckoutScreen.jsx

import React, { useEffect } from 'react';
import { useVibe } from '../../context/VibeContext';
import { formatPrice } from '../../logic/productUtils'; 
import { useTranslation } from 'react-i18next';


const CheckoutScreen = () => {
    const { startNewSession, isDarkTheme, getCartTotal, cart } = useVibe();
    const { t } = useTranslation();

    
    // Static data based on previous steps
    const orderId = 'EV' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const finalTotalValue = getCartTotal();
    const finalTotalDisplay = formatPrice(finalTotalValue);

    // --- NEW: Mock Analytics & ROI Tracking ---
    useEffect(() => {
        const conversionData = {
            eventName: 'conversion_order_completed',
            orderId: orderId,
            totalValue: finalTotalValue,
            currency: 'INR',
            itemCount: cart.length,
            items: cart.map(item => ({ id: item.id, name: item.name, price: item.price })),
            timestamp: new Date().toISOString(),
        };

        // In a real-world scenario, you would send this to your analytics backend.
        // For this mock implementation, we are logging to the console to demonstrate capability.
        console.log('--- MOCK ROI TRACKING: Conversion Event ---', conversionData);

        // This simulates a POST request to an analytics endpoint.
        // fetch('https://api.your-analytics-service.com/events', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(conversionData),
        // }).catch(err => console.error("Mock Analytics Fetch Error:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once when the component mounts.

    // Dynamic Class Logic
    const containerClass = isDarkTheme ? 'bg-E6E2D3 p-6 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full text-111111' : 'bg-white p-6 md:p-12 rounded-3xl shadow-2xl max-w-lg w-full';
    const h2Color = isDarkTheme ? 'text-0E5C4E' : 'text-green-600';
    const p2Color = isDarkTheme ? 'text-111111' : 'text-light-secondary';
    const p3Color = isDarkTheme ? 'text-2A2A2A' : 'text-gray-700';
    const totalColor = isDarkTheme ? 'text-0E5C4E' : 'text-light-primary';
    const spanIdColor = isDarkTheme ? 'text-000000' : 'text-light-primary';

    return (
        <div id="checkoutScreen" className="screen flex-col flex">
            <div className={containerClass}>
                <h2 className={`text-5xl font-serif font-extrabold ${h2Color} mb-4`}>{t('checkoutSuccess')}</h2>
                <p className={`text-2xl font-sans font-semibold ${p2Color} mb-8`}>
                    {t('orderPlaced')}
                </p>
                <p className={`text-lg ${p3Color} mb-4 font-sans`}>
                    {t('orderPreparing')}
                </p>
                
                <p className={`text-lg font-bold ${p3Color} mb-2 font-sans`}>
                    {t('orderId', { id: '' })} <span id="checkoutOrderIdDisplay" className={spanIdColor}>{orderId}</span>
                </p>

                <p className={`text-xl font-bold font-sans ${totalColor}`} id="checkoutTotalDisplay">
                    {t('total')} {finalTotalDisplay}
                </p>
                
                <button 
                    onClick={startNewSession}
                    className="mt-8 w-full py-4 text-xl font-sans rounded-xl shadow-lg primary-cta"
                >
                    {t('startNewSession')}
                </button>
            </div>
        </div>
    );
};

export default CheckoutScreen;
