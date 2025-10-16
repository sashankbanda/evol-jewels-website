# EVOL-JEWELS-WEBSITE

*<p align="center">Unleash Your Style, Elevate Every Moment</p>*

<p align="center">
     <img alt="Last Commit" src="https://img.shields.io/github/last-commit/sashankbanda/evol-jewels-website?style=for-the-badge&label=LAST%20COMMIT&labelColor=555555&color=05C2E0&logo=github&logoColor=white">
     <img alt="Today's Date" src="https://img.shields.io/badge/TODAY-14%20OCT%202025-05C2E0?style=for-the-badge&labelColor=555555&color=05C2E0">
     <img alt="JavaScript Percentage" src="https://img.shields.io/badge/JAVASCRIPT-94.3%25-05C2E0?style=for-the-badge&labelColor=555555&color=05C2E0">
     <img alt="Language Count" src="https://img.shields.io/badge/LANGUAGES-3-05C2E0?style=for-the-badge&labelColor=555555&color=05C2E0">
</p>

*<p align="center">Built with the tools and technologies:</p>*

<p align="center">
     <img alt="JavaScript" src="https://img.shields.io/badge/JAVASCRIPT-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
     <img alt="React" src="https://img.shields.io/badge/REACT-61DAFB?style=for-the-badge&logo=react&logoColor=black">
     <img alt="Tailwind CSS" src="https://img.shields.io/badge/TAILWIND%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
     <img alt="Vite" src="https://img.shields.io/badge/VITE-646CFF?style=for-the-badge&logo=vite&logoColor=white">
     <img alt="Express" src="https://img.shields.io/badge/EXPRESS-000000?style=for-the-badge&logo=express&logoColor=white">
     <img alt="Google Gemini API" src="https://img.shields.io/badge/GEMINI%20API-4285F4?style=for-the-badge&logo=google&logoColor=white">
     <img alt="TensorFlow.js" src="https://img.shields.io/badge/TENSORFLOW%20JS-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white">
     <br>
     <img alt="npm" src="https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white">
     <img alt="PostCSS" src="https://img.shields.io/badge/POSTCSS-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white">
     <img alt="Autoprefixer" src="https://img.shields.io/badge/AUTOPREFIXER-CC3A23?style=for-the-badge&logo=autoprefixer&logoColor=white">
     <img alt="ESLint" src="https://img.shields.io/badge/ESLINT-4B32C3?style=for-the-badge&logo=eslint&logoColor=white">
     <img alt="dotenv" src="https://img.shields.io/badge/DOTENV-D2B948?style=for-the-badge&logo=dotenv&logoColor=black">
     <img alt="JSON" src="https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white">
     <img alt="Markdown" src="https://img.shields.io/badge/MARKDOWN-000000?style=for-the-badge&logo=markdown&logoColor=white">
</p>

---

## Table of Contents

* [Overview](#overview-revised)
* [Core Features](#core-features)
* [Technology Stack](#technology-stack)
* [Technical Architecture (AI/ML)](#technical-architecture-aiml)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Testing](#testing)
* [Built With](#built-with)

---

## Overview (Revised)

This is an **AI-Powered Jewelry Styling Kiosk or Website** that gives customers a fun, hyper-personalized shopping experience.

**[Read the Full Technical Architecture Document (AI/ML Breakdown)](./technical_architecture.md)**

It’s built using React and an Express backend, bringing together several advanced AI and computer vision features:

* **Intelligent Style Matching (Gemini AI):** A personalized style guide that uses a short quiz and an optional free-text description of your current outfit to recommend the *exact* right metal (like 'Polished Gold' or 'Matte Silver') to complement your look.
* **Virtual Try-On (MediaPipe):** Uses your webcam to place virtual necklaces and bracelets right onto you in real-time. You can adjust the position, size, and rotation to see how a piece truly fits.
* **Visual Search (TensorFlow.js / KNN):** Upload a photo of *any* jewelry piece you like, and the system instantly finds the closest matches from our product catalog.
* **Product Chatbot (Gemini AI):** An assistant that can answer specific questions about our collection (materials, prices, where to find an item) by referring to the live product data.

This project showcases what the future of interactive retail looks like, offering a powerful, personal styling session powered by cutting-edge vision and language models.

---

## Core Features

<div align="center">

### System Capabilities

</div>

```mermaid
mindmap
  root((AI Jewelry Kiosk))
    Intelligent Style Matching
      Personalized Quiz
      Gemini-Powered Outfit Analysis
      Metal & Style Recommendations
    Virtual AR Try-On
      Real-time Face & Hand Tracking
      3D Model Rendering (necklaces, bracelets)
      Manual Adjustment Controls (position, scale, rotation)
    Visual Search
      Image Upload (Find similar items)
      TensorFlow.js & MobileNet Feature Extraction
      Backend KNN Similarity Search
    Product Chatbot
      Natural Language Q&A
      Gemini-Powered Product Knowledge
      Markdown Response Formatting
    Accessibility
      Multilingual Support (i18next)
      Dynamic Font Resizing
      Dark/Light Theme Toggle
```

<table align="center">
<tr>
<td align="center" width="25%">

**AI Style Matching**
<br>
Uses a Gemini-powered backend to analyze quiz answers and outfit descriptions, providing hyper-personalized metal and style recommendations.

</td>
<td align="center" width="25%">

**Virtual AR Try-On**
<br>
Leverages MediaPipe for real-time face and hand tracking to overlay 3D jewelry models, creating an immersive try-on experience.

</td>
<td align="center" width="25%">

**Visual Product Search**
<br>
Allows users to upload a photo of any jewelry piece, using MobileNet and a KNN algorithm to find the closest matches in the catalog.

</td>
<td align="center" width="25%">

**Accessible & Multilingual**
<br>
Features a full accessibility suite, including dynamic font resizing and multilingual support (EN, HI, TE) powered by `react-i18next`.

</td>
</tr>
</table>

<br>

---

## Technology Stack

The project uses a modern MERN-like stack with a focus on cutting-edge AI and ML libraries:

| Area | Technology / Library | Details |
| :--- | :--- | :--- |
| **Frontend (Client)** | **React, Vite, Tailwind CSS** | A fast, single-page application (SPA) built with Vite for rapid development. Tailwind is used for utility-first styling, and a custom VibeContext manages state and navigation across screens (Quiz, Results, Cart, etc.). |
| **Backend (Server)** | **Node.js, Express, dotenv** | Provides a simple REST API on port 3001 to handle heavy lifting and secure API key access. Uses dotenv for secret management. |
| **AI Integration** | **Google Gemini API, Google Custom Search API** | Drives the contextual style analysis and the product-aware chatbot. |
| **Machine Learning** | **TensorFlow.js, MobileNet, Jimp** | Used to calculate and compare image feature vectors for the visual search feature. The `server/feature_extractor.js` script handles the initial feature generation. |
| **AR/Computer Vision** | **MediaPipe Tasks Vision** | Provides the real-time face and hand tracking needed for the augmented reality try-on experience. |

---

## Getting Started

### Prerequisites

This project requires two main dependencies to run both the client and the backend server:

* **Programming Language:** `JavaScript` (Node.js)
* **Package Manager:** `npm` (Node Package Manager)

### Installation

Follow these steps to get your development environment running.

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/sashankbanda/evol-jewels-website.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd evol-jewels-website
    ```

3.  **Install the dependencies:**

    This will install both the frontend (React/Vite) and backend (Express) packages.

    ```bash
    npm install
    ```

4.  **Configure API Keys and Features:**

    * **API Keys:** Open the `server/.env` file and replace the placeholder values with your actual API keys:
         * `GEMINI_API_KEY`
         * `Google Search_API_KEY`
         * `CUSTOM_SEARCH_ENGINE_ID`
    * **Image Features (Critical Step):** The image search relies on pre-calculated image feature vectors. You must run the feature extractor script once:

    ```bash
    npm run extract-features
    ```

    *This process loads MobileNet, reads all 60 product images from the `public/media_bgr` folder, and saves the feature vectors to `server/product_features.json`.*

---

## Usage

You need two separate terminal windows for this project to run both the frontend and the backend simultaneously.

1.  **Start the Backend Server:**

    In the first terminal, start the Express server which hosts the API endpoints for the Gemini and image search services.

    ```bash
    npm run server
    ```

2.  **Start the Frontend Application:**

    In a second terminal, start the React development server.

    ```bash
    npm run dev
    ```

The application should automatically open in your browser at the local address specified in the console (usually `http://localhost:5173`).

---

## Testing

The project includes two main scripts for quality assurance and environment setup.

* **Feature Extraction Check:** Confirm that your image feature data is correctly generated (run this first!):

    ```bash
    npm run extract-features
    ```

* **Linting:** Run ESLint to check for code quality and style issues (configured in `eslint.config.js`):

    ```bash
    npm run lint
    ```

---

## Built With

| Feature | Technology / Library | Role |
| :--- | :--- | :--- |
| **Styling & AI** | **Google Gemini API** | Vibe Match outfit-to-metal analysis and product Chatbot.|
| **Image Recognition** | **TensorFlow.js & MobileNet** | Feature vector extraction for client-side/server-side image search.|
| **Frontend** | React, Vite | Core user interface and rapid development tooling.|
| **Backend** | Node.js, Express | REST API endpoints for AI analysis and image search.|
| **Styles** | Tailwind CSS | Utility-first CSS framework for responsive design.|
| **AR Try-On** | MediaPipe (Face/Hand Landmarker) | Real-time virtual jewelry placement.|
