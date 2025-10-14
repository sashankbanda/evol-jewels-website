import * as tf from '@tensorflow/tfjs'; 
import * as mobilenet from '@tensorflow-models/mobilenet';
import Jimp from 'jimp';
import fs from 'fs/promises';
import path from 'path';

// --- CONFIGURATION ---
const OUTPUT_FILE = path.join(process.cwd(), 'server', 'product_features.json');
// IMPORTANT: The image paths must be correct relative to your project root.
const IMAGE_DIR = path.join(process.cwd(), 'public', 'media_bgr');
const IMAGE_COUNT = 60; // Total number of product images (image1.png to image60.png)

/**
 * Loads a pre-trained MobileNet model and extracts a feature vector 
 * (a numerical "fingerprint") from a given product image path.
 * * @param {string} imagePath The full path to the image file.
 * @param {object} model The loaded MobileNet model instance.
 * @returns {number[]} The feature vector array.
 */
async function extractFeatureVector(imagePath, model) {
    let imageTensor;
    let featureVector;
    
    try {
        // 1. Load image buffer using Jimp
        const image = await Jimp.read(imagePath);
        
        // 2. Prepare the image data structure for tf.browser.fromPixels
        // This is necessary because we are running in Node, but using the browser TFJS API
        const imageData = {
            data: new Uint8Array(image.bitmap.data),
            width: image.bitmap.width,
            height: image.bitmap.height
        };

        // 3. Create the Tensor from the image data
        imageTensor = tf.browser.fromPixels(imageData, 3);
        
        // 4. Resize and Normalize 
        const resizedTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
        const normalizedTensor = resizedTensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
        const batchedTensor = normalizedTensor.expandDims(0); 

        // 5. Extract the feature vector using the 'embeddings' layer (true argument)
        const embeddings = model.infer(batchedTensor, true); 
        
        // 6. Convert TensorFlow tensor to a plain JavaScript array
        featureVector = embeddings.dataSync();

        // Dispose tensors to free up memory
        tf.dispose([imageTensor, resizedTensor, normalizedTensor, batchedTensor, embeddings]);

        return Array.from(featureVector);

    } catch (error) {
        console.error(`Error processing image ${path.basename(imagePath)}:`, error.message);
        return []; 
    }
}

/**
 * Main function to load the model and process all product images.
 */
async function generateFeatures() {
    console.log('--- Starting Feature Extraction for KNN Search ---');
    
    // IMPORTANT: Ensure you have run 'npm install @tensorflow/tfjs @tensorflow-models/mobilenet jimp' 
    // This step can take a moment as it loads the large model file.
    console.log(`Loading MobileNet model...`); 
    const model = await mobilenet.load({ 
        version: 1, 
        alpha: 0.25 
    }); 

    const allFeatures = [];
    let processedCount = 0;

    for (let id = 1; id <= IMAGE_COUNT; id++) {
        const imageName = `image${id}.png`;
        const imagePath = path.join(IMAGE_DIR, imageName);
        
        if (id % 10 === 0) {
            console.log(`Processing image ${id}/${IMAGE_COUNT}...`);
        }
        
        const featureVector = await extractFeatureVector(imagePath, model);

        if (featureVector.length > 0) {
            allFeatures.push({
                id: id,
                featureVector: featureVector
            });
            processedCount++;
        }
    }
    
    const jsonOutput = JSON.stringify(allFeatures, null, 2);

    // Save the data to the specified output file (server/product_features.json)
    await fs.writeFile(OUTPUT_FILE, jsonOutput);

    console.log(`\nSuccessfully processed ${processedCount} images.`);
    console.log(`Feature vectors saved to: ${OUTPUT_FILE}`);
    console.log('----------------------------------------------------');
    console.log('PHASE 1 COMPLETE. Ready to update server.js in Phase 2.');
}

generateFeatures();
