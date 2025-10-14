// src/data/productData.js

// Placeholder function for image paths (adjust paths as needed for your assets)
const getImageUrl = (index) => `/media/image${index}.png`;

// Utility function to generate rich, randomized content for new product fields
const generateDetails = (name, category) => ({
    karats: ['14 KT', '18 KT'],
    availableColors: ['Polished Gold', 'Matte Silver', 'Rose Gold'],
    sizes: category === 'Ring' ? [6, 7, 8, 9] : [],
    deliveryTime: '18-20 business days',
    details: [
        `This ${name} is part of the exclusive Evol Jewels Collection. Crafted for a lifetime of brilliance, it features conflict-free diamonds.`,
        `Perfect for the modern individual who values both legacy and contemporary style.`,
        `Ethically sourced metal and precision setting ensure maximum sparkle and durability.`
    ],
    specifications: [
        `Diamond Weight: ${(Math.random() * 2 + 0.5).toFixed(2)} CT`,
        `Metal Purity: Certified ${category === 'Ring' ? '18 KT' : '14 KT'} Gold`,
        `Stone Clarity: VS-SI`,
        `Setting Type: Micro Pave and Channel Set`
    ]
});

export const productData = [
    { id: 1, name: 'Halo Spiral Diamond Earrings', price: 138477.07, category: 'Earring', collection: 'Statement', imageUrl: getImageUrl(1), tags: ['Party/Celebration', 'Ears', 'Polished Gold'], ...generateDetails('Halo Spiral Diamond Earrings', 'Earring') },
    { id: 2, name: 'Petal Lace Diamond Earrings', price: 82747.55, category: 'Earring', collection: 'Floral', imageUrl: getImageUrl(2), tags: ['Work', 'Ears', 'Polished Gold'], ...generateDetails('Petal Lace Diamond Earrings', 'Earring') },
    { id: 3, name: 'Aria Stacked Diamond Earrings', price: 73181.12, category: 'Earring', collection: 'Tribal', imageUrl: getImageUrl(3), tags: ['Casual', 'Ears', 'Mixed Metals'], ...generateDetails('Aria Stacked Diamond Earrings', 'Earring') },
    { id: 4, name: 'Eclipse Enamel Diamond Earrings', price: 123940.92, category: 'Earring', collection: 'Modern', imageUrl: getImageUrl(4), tags: ['Party/Celebration', 'Ears', 'Matte Silver'], ...generateDetails('Eclipse Enamel Diamond Earrings', 'Earring') },
    { id: 5, name: 'Blossom Vine Diamond Earrings', price: 210731.54, category: 'Earring', collection: 'Classic', imageUrl: getImageUrl(5), tags: ['Casual', 'Ears', 'Polished Gold'], ...generateDetails('Blossom Vine Diamond Earrings', 'Earring') },
    { id: 6, name: 'Ethereal Petal Drop Earrings', price: 455910.50, category: 'Earring', collection: 'Statement', imageUrl: getImageUrl(6), tags: ['Party/Celebration', 'Ears', 'Polished Gold'], ...generateDetails('Ethereal Petal Drop Earrings', 'Earring') },
    { id: 7, name: 'Cascade Diamond Chandelier Earrings', price: 226185.92, category: 'Earring', collection: 'Statement', imageUrl: getImageUrl(7), tags: ['Party/Celebration', 'Ears', 'Polished Gold'], ...generateDetails('Cascade Diamond Chandelier Earrings', 'Earring') },
    { id: 8, name: 'Ethereal Cascade Diamond Earrings', price: 204770.74, category: 'Earring', collection: 'Modern', imageUrl: getImageUrl(8), tags: ['Party/Celebration', 'Ears', 'Mixed Metals'], ...generateDetails('Ethereal Cascade Diamond Earrings', 'Earring') },
    { id: 9, name: 'Swirl Drop Diamond Earrings', price: 78252.43, category: 'Earring', collection: 'Cosmic', imageUrl: getImageUrl(9), tags: ['Work', 'Ears', 'Matte Silver'], ...generateDetails('Swirl Drop Diamond Earrings', 'Earring') },
    { id: 10, name: 'Radiant Spiral Diamond Earrings', price: 106526.38, category: 'Earring', collection: 'Sun', imageUrl: getImageUrl(10), tags: ['Casual', 'Ears', 'Polished Gold'], ...generateDetails('Radiant Spiral Diamond Earrings', 'Earring') },
    { id: 11, name: 'Seraphine Leaf Diamond Ring', price: 60366.21, category: 'Ring', collection: 'Floral', imageUrl: getImageUrl(11), tags: ['Casual', 'Hands', 'Polished Gold'], ...generateDetails('Seraphine Leaf Diamond Ring', 'Ring') },
    { id: 12, name: 'Aurora Crown Diamond Ring', price: 48842.15, category: 'Ring', collection: 'Tribal', imageUrl: getImageUrl(12), tags: ['Work', 'Hands', 'Matte Silver'], ...generateDetails('Aurora Crown Diamond Ring', 'Ring') },
    { id: 13, name: 'Radiant Trinity Diamond Ring', price: 161697.54, category: 'Ring', collection: 'Statement', imageUrl: getImageUrl(13), tags: ['Party/Celebration', 'Hands', 'Polished Gold'], ...generateDetails('Radiant Trinity Diamond Ring', 'Ring') },
    { id: 14, name: 'Phenomena Stackable Diamond Ring', price: 62307.63, category: 'Ring', collection: 'Minimal', imageUrl: getImageUrl(14), tags: ['Casual', 'Hands', 'Mixed Metals'], ...generateDetails('Phenomena Stackable Diamond Ring', 'Ring') },
    { id: 15, name: 'Lustrous Split Emerald Ring', price: 132950.13, category: 'Ring', collection: 'Statement', imageUrl: getImageUrl(15), tags: ['Party/Celebration', 'Hands', 'Polished Gold'], ...generateDetails('Lustrous Split Emerald Ring', 'Ring') },
    { id: 16, name: 'Alchemy Diamond Ring', price: 307245.76, category: 'Ring', collection: 'Modern', imageUrl: getImageUrl(16), tags: ['Work', 'Hands', 'Matte Silver'], ...generateDetails('Alchemy Diamond Ring', 'Ring') },
    { id: 17, name: 'Eve Diamond Ring', price: 189864.90, category: 'Ring', collection: 'Classic', imageUrl: getImageUrl(17), tags: ['Party/Celebration', 'Hands', 'Polished Gold'], ...generateDetails('Eve Diamond Ring', 'Ring') },
    { id: 18, name: 'Ethereal Pear Diamond Ring', price: 207369.29, category: 'Ring', collection: 'Classic', imageUrl: getImageUrl(18), tags: ['Work', 'Hands', 'Polished Gold'], ...generateDetails('Ethereal Pear Diamond Ring', 'Ring') },
    { id: 19, name: 'Halo Glow Diamond Ring', price: 136083.82, category: 'Ring', collection: 'Minimal', imageUrl: getImageUrl(19), tags: ['Casual', 'Hands', 'Polished Gold'], ...generateDetails('Halo Glow Diamond Ring', 'Ring') },
    { id: 20, name: 'Infinity Round Diamond Ring', price: 112273.24, category: 'Ring', collection: 'Modern', imageUrl: getImageUrl(20), tags: ['Casual', 'Hands', 'Mixed Metals'], ...generateDetails('Infinity Round Diamond Ring', 'Ring') },
    { id: 21, name: 'Sculpted Pear Signet Ring', price: 94996.57, category: 'Ring', collection: 'Modern', imageUrl: getImageUrl(21), tags: ['Work', 'Hands', 'Matte Silver'], ...generateDetails('Sculpted Pear Signet Ring', 'Ring') },
    { id: 22, name: 'Elyse Round Diamond Solitaire', price: 146406.00, category: 'Ring', collection: 'Classic', imageUrl: getImageUrl(22), tags: ['Party/Celebration', 'Hands', 'Polished Gold'], ...generateDetails('Elyse Round Diamond Solitaire', 'Ring') },
    { id: 23, name: 'Colossus Diamond Halo Ring', price: 183617.77, category: 'Ring', collection: 'Statement', imageUrl: getImageUrl(23), tags: ['Party/Celebration', 'Hands', 'Mixed Metals'], ...generateDetails('Colossus Diamond Halo Ring', 'Ring') },
    { id: 24, name: 'Gracie Diamond Eternity Ring', price: 263352.20, category: 'Ring', collection: 'Classic', imageUrl: getImageUrl(24), tags: ['Party/Celebration', 'Hands', 'Polished Gold'], ...generateDetails('Gracie Diamond Eternity Ring', 'Ring') },
    { id: 25, name: 'Bold Pear Diamond Ring', price: 112516.85, category: 'Ring', collection: 'Modern', imageUrl: getImageUrl(25), tags: ['Work', 'Hands', 'Mixed Metals'], ...generateDetails('Bold Pear Diamond Ring', 'Ring') },
    { id: 26, name: 'Butterfly Whimsy Diamond Pendant', price: 48196.36, category: 'Pendant', collection: 'Butterfly', imageUrl: getImageUrl(26), tags: ['Casual', 'Neckline', 'Polished Gold'], ...generateDetails('Butterfly Whimsy Diamond Pendant', 'Pendant') },
    { id: 27, name: 'Swirl Drop Diamond Pendant', price: 43684.22, category: 'Pendant', collection: 'Cosmic', imageUrl: getImageUrl(27), tags: ['Casual', 'Neckline', 'Mixed Metals'], ...generateDetails('Swirl Drop Diamond Pendant', 'Pendant') },
    { id: 28, name: 'Diamond Embrace Pendant', price: 61633.71, category: 'Pendant', collection: 'Floral', imageUrl: getImageUrl(28), tags: ['Work', 'Neckline', 'Matte Silver'], ...generateDetails('Diamond Embrace Pendant', 'Pendant') },
    { id: 29, name: 'Modern Layered Diamond Pendant', price: 56855.99, category: 'Pendant', collection: 'Tribal', imageUrl: getImageUrl(29), tags: ['Casual', 'Neckline', 'Mixed Metals'], ...generateDetails('Modern Layered Diamond Pendant', 'Pendant') },
    { id: 30, name: 'Zuri Diamond Pendant', price: 71835.44, category: 'Pendant', collection: 'Minimal', imageUrl: getImageUrl(30), tags: ['Work', 'Neckline', 'Polished Gold'], ...generateDetails('Zuri Diamond Pendant', 'Pendant') },
    { id: 31, name: 'Infinitum Diamond Pendant', price: 39284.93, category: 'Pendant', collection: 'Minimal', imageUrl: getImageUrl(31), tags: ['Casual', 'Neckline', 'Matte Silver'], ...generateDetails('Infinitum Diamond Pendant', 'Pendant') },
    { id: 32, name: 'Apollo Diamond Pendant', price: 176982.14, category: 'Pendant', collection: 'Statement', imageUrl: getImageUrl(32), tags: ['Party/Celebration', 'Neckline', 'Polished Gold'], ...generateDetails('Apollo Diamond Pendant', 'Pendant') },
    { id: 33, name: 'My Beloved Diamond Pendant', price: 97157.72, category: 'Pendant', collection: 'Classic', imageUrl: getImageUrl(33), tags: ['Casual', 'Neckline', 'Polished Gold'], ...generateDetails('My Beloved Diamond Pendant', 'Pendant') },
    { id: 34, name: 'Circle Of Life Diamond Pendant', price: 34476.48, category: 'Pendant', collection: 'Modern', imageUrl: getImageUrl(34), tags: ['Work', 'Neckline', 'Mixed Metals'], ...generateDetails('Circle Of Life Diamond Pendant', 'Pendant') },
    { id: 35, name: 'Helios Diamond Halo Pendant', price: 180317.52, category: 'Pendant', collection: 'Statement', imageUrl: getImageUrl(35), tags: ['Party/Celebration', 'Neckline', 'Matte Silver'], ...generateDetails('Helios Diamond Halo Pendant', 'Pendant') },
    { id: 36, name: 'Eden Diamond Pendant', price: 46131.60, category: 'Pendant', collection: 'Floral', imageUrl: getImageUrl(36), tags: ['Casual', 'Neckline', 'Polished Gold'], ...generateDetails('Eden Diamond Pendant', 'Pendant') },
    { id: 37, name: 'Davina Diamond Halo Pendant', price: 50446.46, category: 'Pendant', collection: 'Minimal', imageUrl: getImageUrl(37), tags: ['Work', 'Neckline', 'Matte Silver'], ...generateDetails('Davina Diamond Halo Pendant', 'Pendant') },
    { id: 38, name: 'Heart Diamond Pendant', price: 235460.03, category: 'Pendant', collection: 'Sun', imageUrl: getImageUrl(38), tags: ['Party/Celebration', 'Neckline', 'Polished Gold'], ...generateDetails('Heart Diamond Pendant', 'Pendant') },
    { id: 39, name: 'Valentine Diamond Pendant', price: 34670.55, category: 'Pendant', collection: 'Paan', imageUrl: getImageUrl(39), tags: ['Casual', 'Neckline', 'Matte Silver'], ...generateDetails('Valentine Diamond Pendant', 'Pendant') },
    { id: 40, name: 'Regal Crown Bangle Bracelet', price: 167725.11, category: 'Bracelet', collection: 'Tribal', imageUrl: getImageUrl(40), tags: ['Work', 'Hands', 'Polished Gold'], ...generateDetails('Regal Crown Bangle Bracelet', 'Bracelet') },
    { id: 41, name: 'Ethereal Spiral Diamond Bracelet', price: 199074.41, category: 'Bracelet', collection: 'Sun', imageUrl: getImageUrl(41), tags: ['Party/Celebration', 'Hands', 'Matte Silver'], ...generateDetails('Ethereal Spiral Diamond Bracelet', 'Bracelet') },
    { id: 42, name: 'Eternal Spark Diamond Bracelet', price: 310678.04, category: 'Bracelet', collection: 'Classic', imageUrl: getImageUrl(42), tags: ['Party/Celebration', 'Hands', 'Polished Gold'], ...generateDetails('Eternal Spark Diamond Bracelet', 'Bracelet') },
    { id: 43, name: 'Orion Diamond Bracelet', price: 259135.49, category: 'Bracelet', collection: 'Modern', imageUrl: getImageUrl(43), tags: ['Work', 'Hands', 'Mixed Metals'], ...generateDetails('Orion Diamond Bracelet', 'Bracelet') },
    { id: 44, name: 'Poly Dazzle Diamond Tennis Bracelet', price: 357003.21, category: 'Bracelet', collection: 'Statement', imageUrl: getImageUrl(44), tags: ['Party/Celebration', 'Hands', 'Polished Gold'], ...generateDetails('Poly Dazzle Diamond Tennis Bracelet', 'Bracelet') },
    { id: 45, name: 'Twain Sparkle Cuff Bracelet', price: 231479.56, category: 'Bracelet', collection: 'Minimal', imageUrl: getImageUrl(45), tags: ['Casual', 'Hands', 'Matte Silver'], ...generateDetails('Twain Sparkle Cuff Bracelet', 'Bracelet') },
    { id: 46, name: 'Trinity Diamond Bangle Bracelet', price: 250506.97, category: 'Bracelet', collection: 'Classic', imageUrl: getImageUrl(46), tags: ['Work', 'Hands', 'Polished Gold'], ...generateDetails('Trinity Diamond Bangle Bracelet', 'Bracelet') },
    { id: 47, name: 'Classic Tennis Bracelet', price: 628331.61, category: 'Bracelet', collection: 'Classic', imageUrl: getImageUrl(47), tags: ['Party/Celebration', 'Hands', 'Polished Gold'], ...generateDetails('Classic Tennis Bracelet', 'Bracelet') },
    { id: 48, name: 'Sterling Diamond Bangle Bracelet', price: 432449.71, category: 'Bracelet', collection: 'Modern', imageUrl: getImageUrl(48), tags: ['Work', 'Hands', 'Matte Silver'], ...generateDetails('Sterling Diamond Bangle Bracelet', 'Bracelet') },
    { id: 49, name: 'Frosty Drops Diamond Bracelet', price: 212512.85, category: 'Bracelet', collection: 'Statement', imageUrl: getImageUrl(49), tags: ['Casual', 'Hands', 'Mixed Metals'], ...generateDetails('Frosty Drops Diamond Bracelet', 'Bracelet') },
    { id: 50, name: 'Meadow Graduation Necklace', price: 470722.14, category: 'Necklace', collection: 'Statement', imageUrl: getImageUrl(50), tags: ['Party/Celebration', 'Neckline', 'Polished Gold'], ...generateDetails('Meadow Graduation Necklace', 'Necklace') },
    { id: 51, name: 'Rainbow Tennis Necklace', price: 244844.81, category: 'Necklace', collection: 'Modern', imageUrl: getImageUrl(51), tags: ['Casual', 'Neckline', 'Mixed Metals'], ...generateDetails('Rainbow Tennis Necklace', 'Necklace') },
    { id: 52, name: 'Celestial Cascade Diamond Necklace', price: 704761.82, category: 'Necklace', collection: 'Statement', imageUrl: getImageUrl(52), tags: ['Party/Celebration', 'Neckline', 'Polished Gold'], ...generateDetails('Celestial Cascade Diamond Necklace', 'Necklace') },
    { id: 53, name: 'Lustre Five Stone Diamond Necklace', price: 68559.56, category: 'Necklace', collection: 'Minimal', imageUrl: getImageUrl(53), tags: ['Work', 'Neckline', 'Matte Silver'], ...generateDetails('Lustre Five Stone Diamond Necklace', 'Necklace') },
    { id: 54, name: 'Ivy Diamond Necklace', price: 1024606.30, category: 'Necklace', collection: 'Classic', imageUrl: getImageUrl(54), tags: ['Party/Celebration', 'Neckline', 'Polished Gold'], ...generateDetails('Ivy Diamond Necklace', 'Necklace') },
    { id: 55, name: 'Periwinkle Diamond Necklace', price: 56130.27, category: 'Necklace', collection: 'Minimal', imageUrl: getImageUrl(55), tags: ['Casual', 'Neckline', 'Matte Silver'], ...generateDetails('Periwinkle Diamond Necklace', 'Necklace') },
    { id: 56, name: 'Gamut Marquise Necklace', price: 62608.29, category: 'Necklace', collection: 'Modern', imageUrl: getImageUrl(56), tags: ['Work', 'Neckline', 'Mixed Metals'], ...generateDetails('Gamut Marquise Necklace', 'Necklace') },
    { id: 57, name: 'Vector Classic Tennis Necklace', price: 1265973.97, category: 'Necklace', collection: 'Statement', imageUrl: getImageUrl(57), tags: ['Party/Celebration', 'Neckline', 'Polished Gold'], ...generateDetails('Vector Classic Tennis Necklace', 'Necklace') },
    { id: 58, name: 'Elite Necklace', price: 48994.68, category: 'Necklace', collection: 'Minimal', imageUrl: getImageUrl(58), tags: ['Work', 'Neckline', 'Polished Gold'], ...generateDetails('Elite Necklace', 'Necklace') },
    { id: 59, name: 'Ivy Necklace', price: 412208.73, category: 'Necklace', collection: 'Classic', imageUrl: getImageUrl(59), tags: ['Casual', 'Neckline', 'Polished Gold'], ...generateDetails('Ivy Necklace', 'Necklace') },
    { id: 60, name: 'Peace Enchantress Charms Necklace', price: 556016.68, category: 'Necklace', collection: 'Tribal', imageUrl: getImageUrl(60), tags: ['Casual', 'Neckline', 'Mixed Metals'], ...generateDetails('Peace Enchantress Charms Necklace', 'Necklace') },
];

// NOTE: The vibeMatches object is kept as a local export in productUtils.js for client-side fallback.


// export const vibeMatches = {
//     'Party/Celebration_Classic_Polished Gold': { icon: 'Zendaya: Effortlessly Chic', subtitle: 'Polished gold and bold silhouettes made for a standout evening look.', celebrityImage: 'https://placehold.co/400x200/ff69b4/F5F5F5?text=Zendaya+Statement+Gold' },
//     'Work_Modern_Matte Silver': { icon: 'Amal Clooney: Power Minimalist', subtitle: 'Sleek, geometric pieces that mean business — in cool matte silver.', celebrityImage: 'https://placehold.co/400x200/3c8dbc/F5F5F5?text=Amal+Clooney+Geometric' },
//     'Casual_Relaxed_Mixed Metals': { icon: 'Gigi Hadid: Relaxed Luxury', subtitle: 'Layered mixed metals that keep it casual yet elevated.', celebrityImage: 'https://placehold.co/400x200/ffa500/F5F5F5?text=Gigi+Hadid+Casual+Layers' },
//     'Work_Classic_Polished Gold': { icon: 'Priyanka Chopra: Classic Edge', subtitle: 'Polished gold with structured lines — timeless and sharp.', celebrityImage: 'https://placehold.co/400x200/9932CC/F5F5F5?text=Priyanka+Gold+Elegance' },
//     'Party/Celebration_Modern_Mixed Metals': { icon: 'Rihanna: Bold & Fearless', subtitle: 'Contrasting metals and standout shapes for fearless energy.', celebrityImage: 'https://placehold.co/400x200/CC0000/F5F5F5?text=Rihanna+Bold+Mix' },
//     'default': { icon: 'Audrey Hepburn: Timeless Grace', subtitle: 'Elegant, refined, and forever in style.', celebrityImage: 'https://placehold.co/400x200/4CAF50/F5F5F5?text=Audrey+Hepburn+Classic' }
// };
