
// src/App.jsx - FINAL ATTEMPT ISOLATION

import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useVibe, VibeProvider } from './context/VibeContext';
import { useTranslation } from 'react-i18next';

// Import all Screen Components
import StartScreen from './components/screens/StartScreen';
import QuizScreen from './components/screens/QuizScreen';
import ResultScreen from './components/screens/ResultScreen';
import AllProductsScreen from './components/screens/AllProductsScreen';
import CartScreen from './components/screens/CartScreen';
import LeadCaptureScreen from './components/screens/LeadCaptureScreen';
import CheckoutScreen from './components/screens/CheckoutScreen';
import OutfitInputScreen from './components/screens/OutfitInputScreen';
import ImageSearchScreen from './components/screens/ImageSearchScreen'; // NEW IMPORT
// Import shared components
import NavBar from './components/shared/NavBar';
import ThemeToggle from './components/shared/ThemeToggle';
import TryOnModal from './components/shared/TryOnModal';
import MessageModal from './components/shared/MessageModal';
import ProductChatbot from './components/shared/ProductChatbot'; // NEW IMPORT
import AccessibilityControls from './components/shared/AccessibilityControls'; // NEW: Accessibility Component


// NEW: A dedicated component for the dynamic loading screen
const LoadingScreen = () => {
    const { t } = useTranslation();
    const loadingMessages = [
        t('loadingMessage1'),
        t('loadingMessage2'),
        t('loadingMessage3'),
        t('loadingMessage4'),
    ];

    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        // Cycle through messages every 2 seconds
        const intervalId = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [loadingMessages.length]);

    return (
        <div id="loadingScreen" className="screen flex-col">
            <div className="spinner mb-6"></div>
            <p className="text-2xl md:text-4xl font-serif font-semibold text-text-light">{t('findingVibe')}</p>
            {/* Using key to re-trigger animation on message change */}
            <p key={messageIndex} className="text-lg md:text-xl mt-2 text-B1B1B1 font-sans min-h-[28px] animate-fade-in">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};


// This component dynamically renders the current screen based on context state.
const AppContent = () => {
     const { 
         goBack, 
         navigate, 
         cart, 
         screenHistory,
         tryOnProduct // <--- FIX: Added missing context value here
     } = useVibe();
     
     const currentScreenId = screenHistory;
     
     // Visibility logic... (keep as is)
     const screensWithNav = ['quiz', 'results', 'allproducts', 'cart', 'imagesearch', 'imagesearchresults'];
     const showNav = screensWithNav.includes(currentScreenId);
     const showBack = currentScreenId !== 'start' && currentScreenId !== 'loading' && currentScreenId !== 'checkout';
     
     // Function to render the currently active screen component
     const renderScreen = () => {
         switch (currentScreenId) {
             case 'quiz': return <QuizScreen />;
             case 'outfitinput': return <OutfitInputScreen />;
             case 'imagesearch': return <ImageSearchScreen />; // NEW ROUTE
             case 'imagesearchresults': return <ImageSearchScreen />; // NEW ROUTE (Same component handles both states)
             // ... (keep other cases)
             case 'loading': 
                 return <LoadingScreen />; // Use the new dynamic loading component
             case 'results': return <ResultScreen />;
             case 'allproducts': return <AllProductsScreen />;
             case 'cart': return <CartScreen />;
             case 'leadcapture': return <LeadCaptureScreen />;
             case 'checkout': return <CheckoutScreen />;
             case 'start':
             default: return <StartScreen />;
         }
     };
     
     // **ADDED CONDITION:** Only render if currentScreenId exists
     if (!currentScreenId) return null; // Should never happen, but safe check

     return (
         <div id="app" className="max-w-4xl mx-auto w-full min-h-screen relative">
             
             {showBack && <NavBar type="back" onClick={goBack} />}
             {showNav && <NavBar type="cart" onClick={() => navigate('cart')} cartCount={cart.length} />}
             <ThemeToggle />

             {renderScreen()}

             {tryOnProduct && <TryOnModal />}
             <MessageModal />
             <ProductChatbot /> {/* NEW COMPONENT */}
             <AccessibilityControls /> {/* NEW: Accessibility Component */}
         </div>
     );
};


// The top-level application wrapper
const App = () => (
     <VibeProvider>
         <BrowserRouter>
             <AppContent />
         </BrowserRouter>
     </VibeProvider>
);

export default App;
