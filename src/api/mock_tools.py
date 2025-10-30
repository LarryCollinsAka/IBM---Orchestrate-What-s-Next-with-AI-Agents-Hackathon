from fastapi import FastAPI, Query, Body

app = FastAPI(title="AgroSphere Mock Tools", version="1.0.0")

@app.post("/cost/calc")
def cost_calc(
    crop: str = Body(..., embed=True),
    option: str = Body(..., embed=True),
    quantity_tons: float = Body(..., embed=True),
    packaging: str | None = Body(None, embed=True)
):
    return {
        "capex_usd": 850,
        "opex_per_kg_usd": 0.12,
        "yield_percent": 0.70,
        "unit_cost_per_kg_usd": 0.18
    }

@app.get("/prices/latest")
def prices_latest(commodity: str = Query(...), market: str = Query(...)):
    return {"currency":"NGN","min_price":210,"max_price":260,"avg_price":235,"week_ending":"2025-10-24"}

@app.get("/weather/forecast")
def weather_forecast(location: str = Query(...), days: int = 5):
    return {"risk_rain_next_5d": True, "avg_temp_c": 29.5, "note": "High chance of rain; prefer covered drying."}
