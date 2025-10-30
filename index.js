/*
 * =============================================================
 * index.js
 * =============================================================
 * (Cameroon: Cassava, Cocoa, Palm Oil)
 * (India: Rice, Wheat)
 * (Nigeria: Yam, Cassava, Maize)
 */

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000; // Vercel will manage this

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// --- FINALIZED Localized Mock Data (Based on Team Chat) ---

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

// --- Digital Inclusion (Finance) Data ---
const financeData = {
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

// --- Market Data (Updated with new products) ---
const marketData = {
  // Cameroon
  "Gari": { "product": "Gari", "current_price_per_kg": 1.20, "top_buyer": "West Africa Exporters" },
  "Bobolo (Cassava Sticks)": { "product": "Bobolo", "current_price_per_kg": 1.50, "top_buyer": "Yaoundé Markets" },
  "Refined Palm Oil (RBD)": { "product": "Refined Palm Oil", "current_price_per_kg": 1.80, "top_buyer": "Global Foods Inc." },
  "Cocoa Powder": { "product": "Cocoa Powder", "current_price_per_kg": 4.50, "top_buyer": "EU Importers" },

  // Nigeria
  "Ogi (Pap)": { "product": "Ogi (Pap)", "current_price_per_kg": 0.90, "top_buyer": "Lagos Foods Ltd." },
  "Yam Flour (for Amala)": { "product": "Yam Flour", "current_price_per_kg": 3.00, "top_buyer": "Southwest Nigeria Distributors" },
  "Instant Pounded Yam Flour": { "product": "Instant Yam Flour", "current_price_per_kg": 3.50, "top_buyer": "Lagos Exporters" },

  // India
  "Puffed Rice (Muri)": { "product": "Puffed Rice", "current_price_per_kg": 1.10, "top_buyer": "Delhi Snack Co." },
  "Rice Bran Oil": { "product": "Rice Bran Oil", "current_price_per_kg": 2.20, "top_buyer": "India Edible Oils" },
  "Atta Flour (Whole Wheat)": { "product": "Atta Flour", "current_price_per_kg": 0.80, "top_buyer": "India Grains Corp." }
};


// --- Our 3 API "Skills" (No changes needed here) ---

// Skill 1: Processing Planner
app.get('/process', (req, res) => {
  const crop = req.query.crop_name;
  const country = req.query.country;

  if (!country || !crop) {
    return res.status(400).json({ error: "Country and crop_name are required." });
  }

  const data = processingData[country] && processingData[country][crop];

  if (data) {
    res.json(data);
  } else {
    res.json([]); // Return an empty array if no data found
  }
});

// Skill 2: Finance Finder (Digital Inclusion)
app.get('/finance', (req, res) => {
  const country = req.query.country;
  if (!country) {
    return res.status(400).json({ error: "Country is required." });
  }

  const data = financeData[country];
  if (data) {
    res.json(data);
  } else {
    res.json([]);
  }
});

// Skill 3: Market Access
app.get('/market', (req, res) => {
  const product = req.query.product_name;
  const data = marketData[product];

  if (data) {
    res.json(data);
  } else {
    // Fallback for products not in our small mock DB
    res.json({ "product": product, "current_price_per_kg": 1.0, "top_buyer": "Local General Market" });
  }
});

// --- Start the Server ---
app.listen(port, () => {
  console.log(`AgroSphere *Localized* Mock API listening...`);
});

// Vercel needs this export to run as a serverless function
module.exports = app;