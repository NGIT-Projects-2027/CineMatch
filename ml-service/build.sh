#!/usr/bin/env bash
# Render Build Script for Flask ML Service
# Installs dependencies and trains the model to generate pickle files

set -e

echo "[BUILD] Installing Python dependencies..."
pip install -r requirements.txt

echo "[BUILD] Training ML model..."
python train_model.py

echo "[BUILD] Done! Pickle files generated in models/"
ls -lh models/
