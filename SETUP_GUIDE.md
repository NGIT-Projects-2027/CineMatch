# CineMatch Setup Guide

Welcome to **CineMatch**, an AI-powered movie recommendation platform. This guide will walk you through the steps to get the entire application running on your local machine.

## Prerequisites
Before you begin, ensure you have the following installed on your system:
- **Node.js** (v18 or higher) and `npm`
- **Python** (v3.10 or higher)
- **MongoDB** (Local instance running, or a MongoDB Atlas URI)

The project consists of three main components that need to be run simultaneously:
1. **Machine Learning Service** (Python / Flask)
2. **Backend API** (Node.js / Express)
3. **Frontend Application** (React / Vite)

---

## Step 1: Set Up the Machine Learning Service
The ML service uses a Python content-based recommendation model.

1. Open a terminal and navigate to the ML service folder:
   ```bash
   cd ml-service
   ```
2. *(Optional but recommended)* Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install flask flask-cors pandas numpy
   ```
4. Start the Flask server (the pre-trained ML models are already included in the `models/` folder):
   ```bash
   python app.py
   ```
   *The ML service will now run on `http://localhost:5000`.*

---

## Step 2: Set Up the Backend API
The backend handles user authentication, favorites, search history, and fetches live posters from the TVDB API.

1. Open a **new** terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. The `.env` file is already included and pre-configured inside the `backend` folder. It contains:
   ```env
   PORT=3001
   MONGODB_URI=<MongoDB connection string>
   JWT_SECRET=<JWT signing key>
   FLASK_ML_URL=http://localhost:5000
   TVDB_API_KEY=<TVDB API key>
   ```
   > **Note:** `FLASK_ML_URL=http://localhost:5000` is correct — `localhost` means "this computer", so it will automatically connect to the Flask ML service you started in Step 1. No changes needed.
   
   > If you want to use your own MongoDB database or TVDB API key, simply edit the `.env` file with your own values.
4. Start the Node.js server:
   ```bash
   npm start
   ```
   *The backend will now run on `http://localhost:3001`.*

---

## Step 3: Set Up the Frontend Application
The frontend is a modern, dark-mode React application powered by Vite.

1. Open a **third** terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* If your backend is running on a port other than 3001, configure the Vite proxy in `vite.config.js`. By default, it is configured to point to `http://localhost:3001`.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will typically run on `http://localhost:5173`.*

---

## Step 4: View the Application
Open your web browser and navigate to the URL provided by the Vite terminal (usually [http://localhost:5173](http://localhost:5173)). 

You can now sign up for an account, search for movies, view AI recommendations, and build your favorites list!
