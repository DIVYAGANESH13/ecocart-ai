from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import json
import os

# Create FastAPI instance
app = FastAPI()

# Mount static folder for images
app.mount("/static", StaticFiles(directory="static"), name="static")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load product data from JSON file
with open(os.path.join("data", "product.json"), "r") as f:
    products = {item["sku"]: item for item in json.load(f)}

# Request body model
class CartItem(BaseModel):
    sku: str
    name: str

# Root route for health check
@app.get("/")
def read_root():
    return {"message": "EcoCart AI backend is running 🎉"}

# Recommendation endpoint
@app.post("/recommend")
def recommend(cart: List[CartItem]):
    suggestions = []
    plastic_saved = 0
    co2_saved = 0

    for item in cart:
        product = products.get(item.sku)
        if product and not product.get("sustainable"):
            alt = products.get(product.get("swap_sku"))
            if alt:
                suggestions.append({
                    "from": product["name"],
                    "to": alt["name"],
                    "reason": "Eco alternative with less plastic and CO₂",
                    "price": alt.get("price", "N/A"),
                    "image_url": alt.get("image_url", "")
                })
                plastic_saved += product.get("plastic_grams", 0) - alt.get("plastic_grams", 0)
                co2_saved += product.get("co2_kg", 0) - alt.get("co2_kg", 0)

    return {
        "suggestions": suggestions,
        "impact": {
            "plastic_saved_g": plastic_saved,
            "co2_saved_kg": round(co2_saved, 2)
        }
    }
