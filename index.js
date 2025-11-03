const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000; 

app.use(cors()); 
app.use(express.json());

// --- START: INTERNAL "PROCESSING" SKILLS (Our v3 Logic) ---
const exchangeRates = {
  "Cameroon": { code: "XAF", rate: 615 },
  "Nigeria": { code: "NGN", rate: 1250 },
  "India": { code: "INR", rate: 83 }
};
const processingData = {
  "Cameroon": {
    "Cassava": [{ "option_name": "Gari", "output_yield_kg": 28, "est_profit_usd": 40, "equipment_needed": "Grater, Fryer" }, { "option_name": "Bobolo (Cassava Sticks)", "output_yield_kg": 22, "est_profit_usd": 55, "equipment_needed": "Grater, Press, Fermenter, Wrapper" }],
    "Palm Oil": [{ "option_name": "Refined Palm Oil (RBD)", "output_yield_kg": 20, "est_profit_usd": 70, "equipment_needed": "Artisanal Mill, Filter, Deodorizer" }],
    "Cocoa": [{ "option_name": "Cocoa Powder", "output_yield_kg": 35, "est_profit_usd": 80, "equipment_needed": "Roaster, Grinder, Press" }, { "option_name": "Cocoa Butter", "output_yield_kg": 40, "est_profit_usd": 95, "equipment_needed": "Press, Filter" }],
    "Plantain": [ { "option_name": "Plantain Chips (Plantin mûr)", "output_yield_kg": 30, "est_profit_usd": 60, "equipment_needed": "Slicer, Fryer, Packaging" }, { "option_name": "Plantain Flour", "output_yield_kg": 25, "est_profit_usd": 50, "equipment_needed": "Dryer, Miller" } ]
  },
  "Nigeria": {
    "Maize": [{ "option_name": "Ogi (Pap)", "output_yield_kg": 60, "est_profit_usd": 35, "equipment_needed": "Grinder, Sieve, Fermenter" }, { "option_name": "Maize Grits", "output_yield_kg": 75, "est_profit_usd": 42, "equipment_needed": "Dehuller, Grinder" }],
    "Cassava": [{ "option_name": "Gari", "output_yield_kg": 30, "est_profit_usd": 45, "equipment_needed": "Grater, Fryer, Sifter" }, { "option_name": "Fufu (fermented paste)", "output_yield_kg": 50, "est_profit_usd": 38, "equipment_needed": "Fermentation Tank, Pounder" }],
    "Yam": [{ "option_name": "Yam Flour (for Amala)", "output_yield_kg": 25, "est_profit_usd": 60, "equipment_needed": "Slicer, Dryer, Miller" }, { "option_name": "Instant Pounded Yam Flour", "output_yield_kg": 22, "est_profit_usd": 75, "equipment_needed": "Parboiler, Dryer, Miller" }]
  },
  "India": {
    "Rice": [{ "option_name": "Puffed Rice (Muri)", "output_yield_kg": 85, "est_profit_usd": 50, "equipment_needed": "Paddy Soaker, Roaster" }, { "option_name": "Rice Bran Oil", "output_yield_kg": 15, "est_profit_usd": 65, "equipment_needed": "Rice Mill, Oil Extractor" }],
    "Wheat": [{ "option_name": "Atta Flour (Whole Wheat)", "output_yield_kg": 90, "est_profit_usd": 40, "equipment_needed": "Chakki (Mill), Sifter" }, { "option_name": "Maida (Refined Flour)", "output_yield_kg": 70, "est_profit_usd": 48, "equipment_needed": "Roller Mill, Sifter" }]
  }
};
const financeData = {
  "Cameroon": [{ "funder_name": "CAMCCUL (Credit Union)", "loan_details": "Agri-Loan, 7% interest", "contact_url": "www.camccul.org" }, { "funder_name": "MTN Mobile Money", "loan_details": "Small Business Wallet", "contact_url": "www.mtn.cm" }],
  "Nigeria": [{ "funder_name": "Bank of Agriculture (BOA)", "loan_details": "Smallholder Loan, 5% interest", "contact_url": "www.boa.ng" }, { "funder_name": "OPay (Digital Wallet)", "loan_details": "SME Digital Loan", "contact_url": "www.opayweb.com" }],
  "India": [{ "funder_name": "NABARD (National Bank for Agriculture)", "loan_details": "Rural Infra Fund", "contact_url": "www.nabard.org" }, { "funder_name": "Paytm (Payments Bank)", "loan_details": "Merchant Services", "contact_url": "www.paytm.com" }]
};
const marketData = {
  "Gari": { "product": "Gari", "current_price_per_kg_usd": 1.20, "top_buyer": "West Africa Exporters" },
  "Bobolo (Cassava Sticks)": { "product": "Bobolo", "current_price_per_kg_usd": 1.50, "top_buyer": "Yaoundé Markets" },
  "Refined Palm Oil (RBD)": { "product": "Refined Palm Oil", "current_price_per_kg_usd": 1.80, "top_buyer": "Global Foods Inc." },
  "Cocoa Powder": { "product": "Cocoa Powder", "current_price_per_kg_usd": 4.50, "top_buyer": "EU Importers" },
  "Ogi (Pap)": { "product": "Ogi (Pap)", "current_price_per_kg_usd": 0.90, "top_buyer": "Lagos Foods Ltd." },
  "Yam Flour (for Amala)": { "product": "Yam Flour", "current_price_per_kg_usd": 3.00, "top_buyer": "Southwest Nigeria Distributors" },
  "Instant Pounded Yam Flour": { "product": "Instant Yam Flour", "current_price_per_kg_usd": 3.50, "top_buyer": "Lagos Exporters" },
  "Puffed Rice (Muri)": { "product": "Puffed Rice", "current_price_per_kg_usd": 1.10, "top_buyer": "Delhi Snack Co." },
  "Rice Bran Oil": { "product": "Rice Bran Oil", "current_price_per_kg_usd": 2.20, "top_buyer": "India Edible Oils" },
  "Atta Flour (Whole Wheat)": { "product": "Atta Flour", "current_price_per_kg_usd": 0.80, "top_buyer": "India Grains Corp." },
  "Plantain Chips (Plantin mûr)": { "product": "Plantain Chips", "current_price_per_kg_usd": 2.50, "top_buyer": "Cameroon Snack Co." },
  "Plantain Flour": { "product": "Plantain Flour", "current_price_per_kg_usd": 2.00, "top_buyer": "Douala Health Foods" }
};
// --- END: INTERNAL "PROCESSING" SKILLS ---

// --- API ENDPOINTS (Our "Skills" for Orchestrate) ---
app.get('/process', (req, res) => {
  const { crop_name, country } = req.query;
  const data = processingData[country] && processingData[country][crop_name];
  const rateInfo = exchangeRates[country];
  if (data && rateInfo) {
    const localizedData = data.map(option => ({
      option_name: option.option_name,
      output_yield_kg: option.output_yield_kg,
      equipment_needed: option.equipment_needed,
      est_profit_local: (option.est_profit_usd * rateInfo.rate).toFixed(0),
      local_currency_code: rateInfo.code
    }));
    res.json(localizedData);
  } else {
    res.json([]);
  }
});

app.get('/finance', (req, res) => {
  const { country } = req.query;
  const data = financeData[country];
  res.json(data || []);
});

app.get('/market', (req, res) => {
  const { product_name, country } = req.query;
  const data = marketData[product_name];
  const rateInfo = exchangeRates[country];
  if (data && rateInfo) {
    res.json({
      product: data.product,
      current_price_local: (data.current_price_per_kg_usd * rateInfo.rate).toFixed(2),
      local_currency_code: rateInfo.code,
      top_buyer: data.top_buyer
    });
  } else {
    res.json({ product: product_name, current_price_local: "N/A", local_currency_code: "N/A", top_buyer: "Local General Market" });
  }
});

// Vercel needs this export
module.exports = app;