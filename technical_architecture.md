# Technical Architecture Overview ⚙️

This document details the architecture and integration methods used for the three primary AI and Machine Learning features in the EVOL JEWELS Kiosk/Website:

* **AI-Powered Vibe Match** (Contextual Styling)
* **Visual Search Engine** (Image-to-Product Matching)
* **Virtual Try-On** (Augmented Reality)

---

## 1. AI-Powered Vibe Match (Google Gemini)

This system uses the **Google Gemini API** to perform contextual style analysis, moving beyond static quiz answers to offer highly personalized inspiration.

### A. Core Function: Outfit Analysis and Inspiration

The system accepts a user's quiz results and an optional free-text description of their current outfit. The **Express backend** sends this input to Gemini, which is tasked with recommending the most suitable metal and generating three specific inspiration points: **celebrity**, **movie scene**, and an **outfit image reference**.

### B. Gemini API Integration

| Detail | Specification |
| :--- | :--- |
| **Endpoint** | `/api/analyze-outfit` (Node/Express Server) |
| **Model** | `gemini-2.5-flash` |

#### 1. System Prompt Strategy
The system uses a highly structured prompt that provides the model with the user's base style (from the quiz) and then instructs it to modify the final metal recommendation based on the optional outfit text.

* **Role Definition:** `"You are a highly skilled jewelry stylist."`
* **Input Data:** The combined quiz answer (e.g., `"Casual_Relaxed_Mixed Metals"`) and the user's free-text outfit description (e.g., `"I'm wearing a deep blue kurta for a wedding reception."`).
* **Output Constraint:** Strict instruction to return **only** a single JSON object.

#### 2. Structured JSON Output
To ensure predictable downstream filtering and display, Gemini is forced to adhere to a specific **JSON schema** using `responseMimeType: "application/json"`.

| Field | Purpose | Example |
| :--- | :--- | :--- |
| `metal_match` | The AI's suggested metal, used to score product recommendations. | `"Polished Gold"` |
| `description` | A short explanation of why the metal was chosen. | `"This complements the richness of the deep blue fabric..."` |
| `celebrity_match` | The celebrity and style title for inspiration. | `"Priyanka Chopra: Classic Edge"` |
| `celebrity_search_query` | A precise query for the Google Custom Search API. | `"Priyanka Chopra bold gold jewelry look"` |

#### 3. Image Grounding
The backend immediately takes the `*_search_query` outputs from Gemini and uses the **Google Custom Search API** to fetch high-quality, relevant image URLs. This grounds the AI's creative suggestions with real-world visual references, which is critical for the visual presentation layer on the `ResultScreen`.

---

## 2. Visual Search Engine (MobileNet & KNN)

This system allows a user to upload an image of any jewelry item and instantly find the closest matches in the Evol Jewels inventory. This feature operates by comparing numerical representations (**feature vectors**) rather than pixel data.

### A. Feature Vector Generation (Offline/Server-Side)

* **Model:** **TensorFlow.js** with **MobileNet V1 (alpha 0.25)**.
* **Process:** The `server/feature_extractor.js` script runs once during setup. It loads all 60 product images, resizes them to 224x224, and uses the MobileNet model's **embeddings layer** to extract a **1024-dimensional feature vector** for each image.
* **Storage:** These vectors are saved to a file: `server/product_features.json`.

### B. Client-Server Feature Extraction & Search

The visual search is split between the client (React) and the server (Express) to optimize performance.

| Role | Component / File | Logic |
| :--- | :--- | :--- |
| **Client-Side Feature Extraction** | `VibeContext.jsx` (`extractClientFeatureVector`) | When a user uploads an image, the client loads the same **MobileNet V1** model and generates the corresponding 1024-dimensional feature vector for the query image in the browser. |
| **Server-Side KNN Search** | `/api/image-search` (Node/Express) | The client sends the query vector to the server. The server then executes a **K-Nearest Neighbors (KNN) search** against the stored features. |

#### Cosine Similarity
The search is powered by the **Cosine Similarity** function, which calculates the angle between two vectors (the query and a product). A score of **1.0** signifies maximum similarity. The server sorts all products by this score in descending order and returns the top 3 product IDs.

---

## 3. Virtual Try-On (MediaPipe AR)

The augmented reality feature uses **Google's MediaPipe Tasks Vision library** to achieve real-time jewelry placement over the live webcam feed.

### A. Key Models and Tracking

The AR Try-On component (`JewelryARTryOn.jsx`) initializes two pre-trained MediaPipe model files, stored locally in `public/models/`:

* **`face_landmarker.task`**: Used to track the position of the user's neck and chin, providing stable placement for **Necklace (Pendant)** models.
* **`hand_landmarker.task`**: Used to track the wrist and hand landmarks for accurate placement of **Bracelet** models.

### B. Placement and Adjustment Logic

* **Jewelry Models:** 3D models are loaded using **THREE.js** from `.glb` files (`public/3dmodels/`).
* **Automatic Placement:** The model automatically attempts to align the jewelry with the detected landmarker coordinates.
* **Manual Override:** The `AdjustmentOverlay.jsx` component provides sliders that allow the user to apply real-time manual offsets (`offsetX`, `offsetY`), **scale factor**, and **rotation angle** to the 3D model. This ensures a realistic fit regardless of camera angle or model size.

---
```eof

This is ready to be saved as `technical_architecture.md`. Now, let's proceed with **Step 2** by implementing the user consent feature.