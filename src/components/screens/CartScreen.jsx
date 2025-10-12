// src/components/screens/CartScreen.jsx

import React from 'react';
import { useVibe } from '../../context/VibeContext';
import { formatPrice } from '../../logic/productUtils';
import { ShoppingCart, Trash2 } from 'lucide-react'; // Changed X to Trash2

const CartScreen = () => {
    const { isDarkTheme, cart, removeCartItem, getCartTotal, navigate, isKioskMode } = useVibe();

    // Dynamic Class Logic
    const bgColor = isDarkTheme ? 'bg-2A2A2A' : 'bg-light-card-bg';
    const textColor = isDarkTheme ? 'text-F5F5F5' : 'text-light-secondary';
    const subTextColor = isDarkTheme ? 'text-B1B1B1' : 'text-light-muted';
    const accentColor = isDarkTheme ? 'text-DAD5C1' : 'text-light-primary';
    const removeColor = isDarkTheme ? 'text-8B2E2E' : 'text-red-500';
    const total = getCartTotal();

    // Conditional rendering for checkout logic (Kiosk vs. Website)
    const handleCheckout = () => {
        // In an industrial app, this would trigger an API call to POS/Payment Gateway
        navigate('checkout'); 
    };

    return (
        <div id="cartScreen" className="screen flex-col flex pt-24">
            <div className="w-full max-w-4xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-light text-center mb-8">
                    Your Shopping Cart
                </h2>
                
                <div id="cartItemsContainer" className="w-full space-y-4">
                    {cart.length === 0 ? (
                        <p className={`text-xl text-center ${subTextColor} mt-10 font-sans`}>
                            Your cart is empty. Time to find your vibe!
                        </p>
                    ) : (
                        cart.map((product, index) => (
                            <div key={`${product.id}-${index}`} className={`flex items-center ${bgColor} p-4 rounded-xl shadow-md border-b ${isDarkTheme ? 'border-DAD5C1/20' : 'border-gray-200'}`}>
                                <img 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    className={`w-20 h-20 object-cover rounded-lg mr-4 border ${isDarkTheme ? 'border-111111' : 'border-gray-300'}`}
                                />
                                <div className="flex-1 text-left">
                                    <p className={`font-bold text-lg ${textColor} font-sans`}>{product.name}</p>
                                    <p className={`text-sm ${subTextColor} font-sans`}>{product.category} | {product.collection || 'General'}</p>
                                    <p className={`font-bold ${accentColor} mt-1 font-sans`}>{formatPrice(product.price)}</p>
                                </div>
                                <button 
                                    onClick={() => removeCartItem(index)} 
                                    className={`${removeColor} hover:${removeColor}/80 transition duration-200 ml-4`}
                                >
                                    <Trash2 className="h-6 w-6" /> {/* CHANGED: Trash icon */}
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div id="cartSummary" className={`w-full mt-8 p-6 card-bg rounded-xl shadow-xl border-t-4 border-accent-platinum`}>
                        <div className="flex justify-between items-center text-2xl font-serif font-bold mb-4">
                            <span>Total:</span>
                            <span id="cartTotal" className="text-accent-platinum font-sans font-medium total-price-font">
                                {formatPrice(total)}
                            </span>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            className="w-full py-4 text-xl font-sans rounded-xl shadow-lg primary-cta"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
                
                <button 
                    onClick={() => navigate('results')}
                    className="mt-8 w-full max-w-xs mx-auto block py-3 text-B1B1B1 text-lg font-sans hover:text-F5F5F5 transition duration-300"
                >
                    &larr; Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default CartScreen;