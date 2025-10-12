// src/components/screens/CheckoutScreen.jsx

import React from 'react';
import { useVibe } from '../../context/VibeContext';
import { formatPrice } from '../../logic/productUtils'; 

const CheckoutScreen = () => {
    const { startNewSession, isDarkTheme, getCartTotal } = useVibe();
    
    // Static data based on previous steps
    const orderId = 'EV' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const finalTotal = formatPrice(getCartTotal());

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
                <h2 className={`text-5xl font-serif font-extrabold ${h2Color} mb-4`}>Success!</h2>
                <p className={`text-2xl font-sans font-semibold ${p2Color} mb-8`}>
                    Your Order is Placed In-Store.
                </p>
                <p className={`text-lg ${p3Color} mb-4 font-sans`}>
                    A staff member has been notified and will prepare your selections.
                </p>
                
                <p className={`text-lg font-bold ${p3Color} mb-2 font-sans`}>
                    Order ID: <span id="checkoutOrderIdDisplay" className={spanIdColor}>{orderId}</span>
                </p>

                <p className={`text-xl font-bold font-sans ${totalColor}`} id="checkoutTotalDisplay">
                    Total: {finalTotal}
                </p>
                
                <button 
                    onClick={startNewSession}
                    className="mt-8 w-full py-4 text-xl font-sans rounded-xl shadow-lg primary-cta"
                >
                    Start a New Session
                </button>
            </div>
        </div>
    );
};

export default CheckoutScreen;