const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors()); // Enable CORS
app.use(express.json());

// --- Our NEW Localized Mock Data (Based on real value chains) ---
const processingData = {
  "Cameroon": {
    "Cassava": [
      { "option_name": "Gari", "output_yield_kg": 28, "est_profit_usd": 40, "equipment_needed": "Grater, Fryer" },
      { "option_name": "Bobolo (Cassava Sticks)", "output_yield_kg": 22, "est_profit_usd": 55, "equipment_needed": "Grater, Press, Fermenter, Wrapper" }
    ],
    "Palm Oil": [
      { "option_name": "Refined Palm Oil (RBD)", "output_yield_kg": 20, "est_profit_usd": 70, "equipment_needed": "Artisanal Mill, Filter, Deodorizer" }
    ]
  },
  "Nigeria": {
    "Maize": [
      { "option_name": "Ogi (Pap)", "output_yield_kg": 60, "est_profit_usd": 35, "equipment_needed": "Grinder, Sieve, Fermenter" },
      { "option_name": "Maize Grits", "output_yield_kg": 75, "est_profit_usd": 42, "equipment_needed": "Dehuller, Grinder" }
    ]
  },
  "India": {
    "Rice": [
      { "option_name": "Puffed Rice (Muri)", "output_yield_kg": 85, "est_profit_usd": 50, "equipment_needed": "Paddy Soaker, Roaster" },
      { "option_name": "Rice Bran Oil", "output_yield_kg": 15, "est_profit_usd": 65, "equipment_needed": "Rice Mill, Oil Extractor" }
    ]
  }
};
const financeData = {
  "Cameroon": [
    { "funder_name": "CAMCCUL (Cameroon Co-operative Credit Union League)", "loan_details": "Agri-Loan, 7% interest", "contact_url": "www.camccul.org" }
  ],
  "Nigeria": [
    { "funder_name": "Bank of Agriculture (BOA)", "loan_details": "Smallholder Loan, 5% interest", "contact_url": "www.boa.ng" },
    { "funder_name": "MTN Mobile Money (MoMo)", "loan_details": "Digital Inclusion Loan", "contact_url": "www.mtn.ng/momo" }
  ],
  "India": [
    { "funder_name": "NABARD (National Bank for Agriculture)", "loan_details": "Rural Infra Fund", "contact_url": "www.nabard.org" }
  ]
};
const marketData = {
  "Gari": { "product": "Gari", "current_price_per_kg": 1.20, "top_buyer": "Douala Central Market" },
  "Bobolo (Cassava Sticks)": { "product": "Bobolo", "current_price_per_kg": 1.50, "top_buyer": "Yaoundé Markets" },
  "Ogi (Pap)": { "product": "Ogi (Pap)", "current_price_per_kg": 0.90, "top_buyer": "Lagos Foods Ltd." },
  "Puffed Rice (Muri)": { "product": "Puffed Rice", "current_price_per_kg": 1.10, "top_buyer": "Delhi Snack Co." }
};

// --- Our 3 API "Skills" ---
app.get('/process', (req, res) => {
  const crop = req.query.crop_name; const country = req.query.country;
  if (!country || !crop) { return res.status(400).json({ error: "Country and crop_name are required." }); }
  const data = processingData[country] && processingData[country][crop];
  if (data) { res.json(data); } else { res.status(444).json({ error: "No processing data for this crop in this country." }); }
});
app.get('/finance', (req, res) => {
  const country = req.query.country;
  if (!country) { return res.status(400).json({ error: "Country is required." }); }
  const data = financeData[country];
  if (data) { res.json(data); } else { res.status(404).json({ error: "No financing data for this country." }); }
});
app.get('/market', (req, res) => {
  const product = req.query.product_name; const data = marketData[product];
  if (data) { res.json(data); } else { res.json({ "product": product, "current_price_per_kg": 1.0, "top_buyer": "Local General Market" }); }
});

// --- Start the Server ---
app.listen(port, () => { console.log(`AgroSphere *Localized* Mock API listening...`); });

// Vercel needs this export
module.exports = app;