// src/App.jsx - FINAL ATTEMPT ISOLATION

import React from 'react';
import { BrowserRouter } from 'react-router-dom'; // Changed to BrowserRouter
import { useVibe, VibeProvider } from './context/VibeContext';

// Import all Screen Components
import StartScreen from './components/screens/StartScreen';
import QuizScreen from './components/screens/QuizScreen';
import ResultScreen from './components/screens/ResultScreen';
import AllProductsScreen from './components/screens/AllProductsScreen';
import CartScreen from './components/screens/CartScreen';
import LeadCaptureScreen from './components/screens/LeadCaptureScreen';
import CheckoutScreen from './components/screens/CheckoutScreen';
import OutfitInputScreen from './components/screens/OutfitInputScreen'; // <--- ADD THIS
// Import shared components
import NavBar from './components/shared/NavBar';
import ThemeToggle from './components/shared/ThemeToggle';
import TryOnModal from './components/shared/TryOnModal';
import MessageModal from './components/shared/MessageModal';

// This component dynamically renders the current screen based on context state.
const AppContent = () => {
    const { 
        goBack, 
        navigate, 
        cart, 
        screenHistory,
        tryOnProduct 
    } = useVibe();
    
    const currentScreenId = screenHistory;
    
    // Visibility logic... (keep as is)
    const screensWithNav = ['quiz', 'results', 'allproducts', 'cart'];
    const showNav = screensWithNav.includes(currentScreenId);
    const showBack = currentScreenId !== 'start' && currentScreenId !== 'loading' && currentScreenId !== 'checkout';
    
    // Function to render the currently active screen component
    const renderScreen = () => {
        switch (currentScreenId) {
            case 'quiz': return <QuizScreen />;
            case 'outfitinput': return <OutfitInputScreen />; // <--- ADD THIS CASE
            // ... (keep other cases)
            case 'loading': 
                return (
                    <div id="loadingScreen" className="screen flex-col">
                        <div className="spinner mb-6"></div>
                        <p className="text-2xl md:text-4xl font-serif font-semibold text-text-light">Finding your vibe...</p>
                        <p className="text-lg md:text-xl mt-2 text-B1B1B1 font-sans">Just a moment — matching your style preferences.</p>
                    </div>
                );
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