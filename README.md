# EVOL-JEWELS-WEBSITE

Unleash Your Style, Elevate Every Moment

[![GitHub issues](https://img.shields.io/github/issues/sashankbanda/evol-jewels-website?style=for-the-badge)](https://github.com/sashankbanda/evol-jewels-website/issues)
[![GitHub forks](https://img.shields.io/github/forks/sashankbanda/evol-jewels-website?style=for-the-badge)](https://github.com/sashankbanda/evol-jewels-website/network)
[![GitHub stars](https://img.shields.io/github/stars/sashankbanda/evol-jewels-website?style=for-the-badge)](https://github.com/sashankbanda/evol-jewels-website/stargazers)
[![License](https://img.shields.io/github/license/sashankbanda/evol-jewels-website?style=for-the-badge)](https://github.com/sashankbanda/evol-jewels-website/blob/main/LICENSE)
[![GitHub watchers](https://img.shields.io/github/watchers/sashankbanda/evol-jewels-website?style=for-the-badge)](https://github.com/sashankbanda/evol-jewels-website/watchers)
[![Last Commit](https://img.shields.io/github/last-commit/sashankbanda/evol-jewels-website?style=for-the-badge)](https://github.com/sashankbanda/evol-jewels-website/commits/main)

---

## Table of Contents

* [Overview](#overview)
* [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Installation](#installation)
* [Usage](#usage)
* [Testing](#testing)
* [Built With](#built-with)

---

## Overview

This project is a multi-screen **jewelry style quiz, virtual try-on, and product recommendation kiosk/website**. It uses **Gemini API** for advanced outfit-to-metal matching and **TensorFlow.js (MobileNet)** for client-side feature extraction for visual image search (K-Nearest Neighbors).

It provides users with a personalized experience that includes:

* A quick quiz to determine their style 'vibe'.
* **AI Context Analysis** (Gemini) to refine metal recommendations based on a text description of their outfit.
* **Image Search** to find similar products by uploading a photo.
* **Virtual AR Try-On** using MediaPipe for real-time jewelry placement (necklace/bracelet).
* A product-aware **Chatbot** (Gemini) that answers questions using the product data catalog.

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
    git clone [https://github.com/sashankbanda/evol-jewels-website.git](https://github.com/sashankbanda/evol-jewels-website.git)
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