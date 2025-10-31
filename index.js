/*
 * =============================================================
 * index.js
 * =============================================================
 * NEW: Added automatic currency conversion to XAF, NGN, and INR.
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000; 

app.use(cors()); 
app.use(express.json());

// --- NEW: Exchange Rates ---
const exchangeRates = {
  "Cameroon": { code: "XAF", rate: 615 }, // 1 USD = 615 XAF
  "Nigeria": { code: "NGN", rate: 1250 }, // 1 USD = 1250 NGN
  "India": { code: "INR", rate: 83 }    // 1 USD = 83 INR
};

// --- Data (Prices are now in USD to be converted) ---
const processingData = {
  "Cameroon": {
    "Cassava": [
      { "option_name": "Gari", "output_yield_kg": 28, "est_profit_usd": 40, "equipment_needed": "Grater, Fryer" },
      { "option_name": "Bobolo (Cassava Sticks)", "output_yield_kg": 22, "est_profit_usd": 55, "equipment_needed": "Grater, Press, Fermenter, Wrapper" }
    ],
    "Palm Oil": [
      { "option_name": "Refined Palm Oil (RBD)", "output_yield_kg": 20, "est_profit_usd": 70, "equipment_needed": "Artisanal Mill, Filter, Deodorizer" }
    ],
    "Cocoa": [
      { "option_name": "Cocoa Powder", "output_yield_kg": 35, "est_profit_usd": 80, "equipment_needed": "Roaster, Grinder, Press" },
      { "option_name": "Cocoa Butter", "output_yield_kg": 40, "est_profit_usd": 95, "equipment_needed": "Press, Filter" }
    ]
  },
  "Nigeria": {
    "Maize": [
      { "option_name": "Ogi (Pap)", "output_yield_kg": 60, "est_profit_usd": 35, "equipment_needed": "Grinder, Sieve, Fermenter" },
      { "option_name": "Maize Grits", "output_yield_kg": 75, "est_profit_usd": 42, "equipment_needed": "Dehuller, Grinder" }
    ],
    "Cassava": [
      { "option_name": "Gari", "output_yield_kg": 30, "est_profit_usd": 45, "equipment_needed": "Grater, Fryer, Sifter" },
      { "option_name": "Fufu (fermented paste)", "output_yield_kg": 50, "est_profit_usd": 38, "equipment_needed": "Fermentation Tank, Pounder" }
    ],
    "Yam": [
      { "option_name": "Yam Flour (for Amala)", "output_yield_kg": 25, "est_profit_usd": 60, "equipment_needed": "Slicer, Dryer, Miller" },
      { "option_name": "Instant Pounded Yam Flour", "output_yield_kg": 22, "est_profit_usd": 75, "equipment_needed": "Parboiler, Dryer, Miller" }
    ]
  },
  "India": {
    "Rice": [
      { "option_name": "Puffed Rice (Muri)", "output_yield_kg": 85, "est_profit_usd": 50, "equipment_needed": "Paddy Soaker, Roaster" },
      { "option_name": "Rice Bran Oil", "output_yield_kg": 15, "est_profit_usd": 65, "equipment_needed": "Rice Mill, Oil Extractor" }
    ],
    "Wheat": [
      { "option_name": "Atta Flour (Whole Wheat)", "output_yield_kg": 90, "est_profit_usd": 40, "equipment_needed": "Chakki (Mill), Sifter" },
      { "option_name": "Maida (Refined Flour)", "output_yield_kg": 70, "est_profit_usd": 48, "equipment_needed": "Roller Mill, Sifter" }
    ]
  }
};
const financeData = { /* (This data is just text, no changes needed) */
  "Cameroon": [
    { "funder_name": "CAMCCUL (Credit Union)", "loan_details": "Agri-Loan, 7% interest", "contact_url": "www.camccul.org" },
    { "funder_name": "MTN Mobile Money", "loan_details": "Small Business Wallet", "contact_url": "www.mtn.cm" }
  ],
  "Nigeria": [
    { "funder_name": "Bank of Agriculture (BOA)", "loan_details": "Smallholder Loan, 5% interest", "contact_url": "www.boa.ng" },
    { "funder_name": "OPay (Digital Wallet)", "loan_details": "SME Digital Loan", "contact_url": "www.opayweb.com" }
  ],
  "India": [
    { "funder_name": "NABARD (National Bank for Agriculture)", "loan_details": "Rural Infra Fund", "contact_url": "www.nabard.org" },
    { "funder_name": "Paytm (Payments Bank)", "loan_details": "Merchant Services", "contact_url": "www.paytm.com" }
  ]
};
const marketData = { // NEW: Prices are now in USD
  "Gari": { "product": "Gari", "current_price_per_kg_usd": 1.20, "top_buyer": "West Africa Exporters" },
  "Bobolo (Cassava Sticks)": { "product": "Bobolo", "current_price_per_kg_usd": 1.50, "top_buyer": "Yaoundé Markets" },
  "Refined Palm Oil (RBD)": { "product": "Refined Palm Oil", "current_price_per_kg_usd": 1.80, "top_buyer": "Global Foods Inc." },
  "Cocoa Powder": { "product": "Cocoa Powder", "current_price_per_kg_usd": 4.50, "top_buyer": "EU Importers" },
  "Ogi (Pap)": { "product": "Ogi (Pap)", "current_price_per_kg_usd": 0.90, "top_buyer": "Lagos Foods Ltd." },
  "Yam Flour (for Amala)": { "product": "Yam Flour", "current_price_per_kg_usd": 3.00, "top_buyer": "Southwest Nigeria Distributors" },
  "Instant Pounded Yam Flour": { "product": "Instant Yam Flour", "current_price_per_kg_usd": 3.50, "top_buyer": "Lagos Exporters" },
  "Puffed Rice (Muri)": { "product": "Puffed Rice", "current_price_per_kg_usd": 1.10, "top_buyer": "Delhi Snack Co." },
  "Rice Bran Oil": { "product": "Rice Bran Oil", "current_price_per_kg_usd": 2.20, "top_buyer": "India Edible Oils" },
  "Atta Flour (Whole Wheat)": { "product": "Atta Flour", "current_price_per_kg_usd": 0.80, "top_buyer": "India Grains Corp." }
};

// --- Our 3 API "Skills" (UPDATED) ---

// Skill 1: Processing Planner (UPDATED)
app.get('/process', (req, res) => {
  const crop = req.query.crop_name;
  const country = req.query.country;
  
  if (!country || !crop) {
    return res.status(400).json({ error: "Country and crop_name are required." });
  }
  
  const data = processingData[country] && processingData[country][crop];
  const rateInfo = exchangeRates[country];

  if (data && rateInfo) {
    // NEW: Localize currency
    const localizedData = data.map(option => {
      const localizedProfit = option.est_profit_usd * rateInfo.rate;
      return {
        option_name: option.option_name,
        output_yield_kg: option.output_yield_kg,
        equipment_needed: option.equipment_needed,
        est_profit_local: localizedProfit.toFixed(0), // Round to whole number
        local_currency_code: rateInfo.code
      };
    });
    res.json(localizedData); // Send the new localized data
  } else {
    res.json([]); 
  }
});

// Skill 2: Finance Finder (No changes needed)
app.get('/finance', (req, res) => {
  const country = req.query.country;
  if (!country) {
    return res.status(400).json({ error: "Country is required." });
  }
  const data = financeData[country];
  if (data) { res.json(data); } else { res.json([]); }
});

// Skill 3: Market Access (UPDATED)
app.get('/market', (req, res) => {
  const product = req.query.product_name;
  const country = req.query.country; // NEW: Country is now required

  if (!country || !product) {
    return res.status(400).json({ error: "Country and product_name are required." });
  }

  const data = marketData[product];
  const rateInfo = exchangeRates[country];
  
  if (data && rateInfo) {
    const localizedPrice = data.current_price_per_kg_usd * rateInfo.rate;
    res.json({
      product: data.product,
      current_price_local: localizedPrice.toFixed(2), // Keep 2 decimal places
      local_currency_code: rateInfo.code,
      top_buyer: data.top_buyer
    });
  } else {
    // Fallback
    const fallbackRate = rateInfo ? rateInfo.rate : 1;
    const fallbackCode = rateInfo ? rateInfo.code : "USD";
    res.json({ "product": product, "current_price_local": (1.0 * fallbackRate).toFixed(2), "local_currency_code": fallbackCode, "top_buyer": "Local General Market" });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`AgroSphere *Localized* Mock API (v3) listening...`);
});

// Vercel needs this export
module.exports = app;