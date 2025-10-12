// src/context/VibeContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProductById } from '../logic/productUtils';

// 1. Create Context
const VibeContext = createContext();

// 2. Custom Hook for easy access
export const useVibe = () => useContext(VibeContext);

// 3. Provider Component
export const VibeProvider = ({ children }) => {
    // State copied from prototype globals
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [cart, setCart] = useState([]);
    const [screenHistory, setScreenHistory] = useState(['start']); 
    const [tryOnProduct, setTryOnProduct] = useState(null); 
    const [recommendationOffset, setRecommendationOffset] = useState(0);
    const [messageModal, setMessageModal] = useState(null);


    // --- Initialization & Theme Logic ---
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkTheme(false);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkTheme;
        setIsDarkTheme(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };
    
    // --- Navigation Logic (using history array) ---
    const navigate = (screenId) => {
        setScreenHistory(prev => {
            if (screenId === prev[prev.length - 1]) return prev;
            return [...prev, screenId];
        });
    };

    const goBack = () => {
        setScreenHistory(prev => {
            if (prev.length <= 1) {
                startNewSession();
                return ['start']; 
            }
            
            let history = [...prev];
            const lastScreen = history[history.length - 1];

            // 1. Handle Quiz step navigation (same as before)
            if (lastScreen === 'quiz' && currentStep > 1) {
                setCurrentStep(prevStep => prevStep - 1);
                return history;
            }
            
            // Pop the current screen off the history array
            history.pop(); 
            
            // 2. NEW FIX: If the previous screen was 'loading', pop that too, 
            //    so we land on the screen *before* loading (which is quiz or cart)
            if (history.length > 0 && history[history.length - 1] === 'loading') {
                history.pop();
            }

            // If history is empty after cleanup, default to start
            if (history.length === 0) return ['start'];

            // Return the corrected history array
            return history; 
        });
    };

    // --- Quiz Logic ---
    const startQuiz = () => {
        setQuizAnswers({});
        setCurrentStep(1);
        setRecommendationOffset(0);
        navigate('quiz'); 
    };

    const answerQuiz = (step, answer) => {
        const newAnswers = { ...quizAnswers, [step]: answer };
        setQuizAnswers(newAnswers);

        if (currentStep < 4) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 400);
        } else {
            navigate('loading');
            setTimeout(() => navigate('results'), 1500); 
        }
    };

    // --- NEW: Custom Modal Logic ---
    const showMessageModal = (message) => {
        setMessageModal(message);
    };

    const hideMessageModal = () => {
        setMessageModal(null);
    };
    
    // --- Cart Logic ---
    const addToCart = (productId) => {
        const product = getProductById(productId);
        if (product) {
            setCart(prev => [...prev, product]);
        }
        console.log(`${product?.name || 'Item'} added to cart!`); 
    };

    const removeCartItem = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };

    // --- Try-On Modal Logic ---
    const showTryOnModal = (productId) => {
        const product = getProductById(productId);
        setTryOnProduct(product);
    };

    const handleTryOnFeedback = (action, product) => {
        if (action === 'love') {
            addToCart(product.id); 
        }
        setTryOnProduct(null); 
        // Logic to navigate back only if not already on the result screen
        setScreenHistory(prev => (prev[prev.length - 1] !== 'results' ? [...prev, 'results'] : prev));
    };

    const startNewSession = () => {
        setCart([]);
        setQuizAnswers({});
        setCurrentStep(1);
        setRecommendationOffset(0);
        setScreenHistory(['start']);
    };


    const contextValue = {
        isKioskMode: window.location.pathname.startsWith('/kiosk'), 
        isDarkTheme,
        toggleTheme,
        currentStep,
        quizAnswers,
        cart,
        screenHistory: screenHistory[screenHistory.length - 1] || 'start', 
        tryOnProduct,
        messageModal,
        recommendationOffset,
        setRecommendationOffset,

        navigate,
        goBack,
        startQuiz,
        answerQuiz,
        addToCart,
        removeCartItem,
        getCartTotal,
        showTryOnModal,
        handleTryOnFeedback,
        startNewSession,
        showMessageModal, // <-- EXPORT NEW FUNCTION
        hideMessageModal, // <-- EXPORT NEW FUNCTION
    };

    useEffect(() => {
        document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
    }, [isDarkTheme]);

    return (
        <VibeContext.Provider value={contextValue}>
            {children}
        </VibeContext.Provider>
    );
};
