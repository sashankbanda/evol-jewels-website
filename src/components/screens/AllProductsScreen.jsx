// src/components/screens/AllProductsScreen.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useVibe } from '../../context/VibeContext';
import { getAllFilteredRecommendations, formatPrice } from '../../logic/productUtils';
import { productData } from '../../data/productData'; // Using raw data here
import ProductCard from '../shared/ProductCard';


// Helper function to handle sorting and filtering
const applyFiltersAndSort = (products, categoryFilter, sortBy) => {
    let filteredProducts = [...products];

    // 1. Filtering
    if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => {
            const productCategory = product.category === 'Pendant' ? 'Necklace' : product.category;
            return productCategory === categoryFilter;
        });
    }

    // 2. Sorting
    switch (sortBy) {
        case 'priceLow':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'priceHigh':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'nameAsc':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'default':
        default:
            filteredProducts.sort((a, b) => a.id - b.id);
            break;
    }

    return filteredProducts;
};


const AllProductsScreen = () => {
    const { isDarkTheme, navigate } = useVibe();
    
    // Local state for filters and sort
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortBy, setSortBy] = useState('default');

    // Use useMemo to re-run filtering/sorting only when filters change
    const displayedProducts = useMemo(() => {
        return applyFiltersAndSort(productData, categoryFilter, sortBy);
    }, [categoryFilter, sortBy]);


    // Dynamic Class Logic for the filter/sort boxes
    const selectBg = isDarkTheme ? 'bg-2A2A2A' : 'bg-light-card-bg';
    const selectText = isDarkTheme ? 'text-F5F5F5' : 'text-333333';
    const borderColor = isDarkTheme ? 'border-111111' : 'border-gray-300';
    const focusRing = isDarkTheme ? 'focus:ring-accent-platinum focus:border-accent-platinum' : 'focus:ring-light-primary focus:border-light-primary';


    return (
        <div id="allProductsScreen" className="screen flex-col flex">
            <div className="w-full max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-light text-center mb-8">
                    All Evol Jewels Products
                </h2>

                {/* Filter and Sort Controls (Replaces HTML Selects) */}
                <div className="max-w-4xl mx-auto w-full mb-6 flex flex-wrap gap-4 items-center justify-between card-bg p-4 rounded-xl shadow-md">
                    
                    <select 
                        id="filterCategory" 
                        onChange={(e) => setCategoryFilter(e.target.value)} 
                        value={categoryFilter}
                        className={`p-3 border ${borderColor} rounded-lg text-lg ${selectText} ${selectBg} ${focusRing}`}
                    >
                        <option value="">All Categories</option>
                        <option value="Earring">Earrings</option>
                        <option value="Ring">Rings</option>
                        <option value="Necklace">Necklaces/Pendants</option>
                        <option value="Bracelet">Bracelets</option>
                    </select>

                    <select 
                        id="sortBy" 
                        onChange={(e) => setSortBy(e.target.value)} 
                        value={sortBy}
                        className={`p-3 border ${borderColor} rounded-lg text-lg ${selectText} ${selectBg} ${focusRing}`}
                    >
                        <option value="default">Default</option>
                        <option value="priceLow">Price: Low to High</option>
                        <option value="priceHigh">Price: High to Low</option>
                        <option value="nameAsc">Name: A-Z</option>
                    </select>
                </div>

                {/* Product Grid */}
                <div id="allProductGrid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full">
                    {displayedProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                    {displayedProducts.length === 0 && (
                        <p className="col-span-full text-center text-B1B1B1 mt-8">
                            No products found matching your filter criteria.
                        </p>
                    )}
                </div>

                {/* Back Button */}
                <button 
                    onClick={() => navigate('results')}
                    className="mt-10 w-full max-w-sm mx-auto block py-4 text-xl font-sans rounded-xl shadow-lg primary-cta"
                >
                    &larr; Back to My Vibe Match
                </button>
            </div>
        </div>
    );
};

export default AllProductsScreen;