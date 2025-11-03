/*
 * =============================================================
 * SUPERVISOR API: index.js
 * =============================================================
 * This is our master "brain." It has internal "Processing" skills
 * and it delegates (collaborates) with our "Research Agent."
 */
const express = require('express');
const cors = require('cors');
const { XMLHttpRequest } = require("xmlhttprequest"); 
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
// This is the "Research Agent" (from Agent Lab)
const RESEARCH_AGENT_URL = "https://us-south.ml.cloud.ibm.com/ml/v4/deployments/39156981-89e2-4977-be57-f8e1bf097280/ai_service_stream?version=2021-05-01";
// This is our Vercel Environment Variable
const IAM_API_KEY = process.env.IAM_API_KEY; 

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
    "Plantain": [
      { "option_name": "Plantain Chips (Plantin mûr)", "output_yield_kg": 30, "est_profit_usd": 60, "equipment_needed": "Slicer, Fryer, Packaging" },
      { "option_name": "Plantain Flour", "output_yield_kg": 25, "est_profit_usd": 50, "equipment_needed": "Dryer, Miller" }
    ]
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
  "Atta Flour (Whole Wheat)": { "product": "Atta Flour", "current_price_per_kg_usd": 0.80, "top_buyer": "India Grains Corp." }
};
// --- END: INTERNAL "PROCESSING" SKILLS ---


// --- START: EXTERNAL "ADVISOR" SKILLS (Our Collaborator) ---
function getToken() {
  return new Promise((resolve, reject) => {
    if (!IAM_API_KEY) {
      return reject(new Error("IAM_API_KEY is not set. Check Vercel Environment Variables."));
    }
    const req = new XMLHttpRequest();
    req.addEventListener("load", () => resolve(JSON.parse(req.responseText)));
    req.addEventListener("error", (err) => reject("Token Error: " + err));
    req.open("POST", "https://iam.cloud.ibm.com/identity/token");
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Accept", "application/json");
    req.send(`grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${IAM_API_KEY}`);
  });
}

function callResearchAgent(token, query) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ messages: [{ role: "user", content: query }] });
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", () => resolve(JSON.parse(oReq.responseText)));
    oReq.addEventListener("error", (err) => reject("Agent Call Error: " + err));
    oReq.open("POST", RESEARCH_AGENT_URL);
    oReq.setRequestHeader("Accept", "application/json");
    oReq.setRequestHeader("Authorization", "Bearer " + token);
    oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    oReq.send(payload);
  });
}

// This is the single, powerful function our "Advisor" skills will all call
async function getExpertAdvice(query) {
  try {
    const tokenResponse = await getToken();
    const agentResponse = await callResearchAgent(tokenResponse.access_token, query);
    
    // Extract the text from the Research Agent's response
    if (agentResponse.messages && agentResponse.messages[1] && agentResponse.messages[1].content) {
      return { advice: agentResponse.messages[1].content, source: "AgroSphere Research Advisor" };
    } else {
      // Handle "No chunks returned" or other agent-side errors
      console.error("Agent Response Error:", agentResponse);
      return { advice: "My research specialist (AgroSphere Advisor) was unable to find an answer for that specific query.", source: "AgroSphere Research Advisor" };
    }
  } catch (error) {
    console.error(error);
    return { error: `Failed to contact the Research Advisor: ${error.message}` };
  }
}
// --- END: EXTERNAL "ADVISOR" SKILLS ---


// --- API ENDPOINTS (Our "Skills" for Orchestrate) ---

// SKILL 1: Processing
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

// SKILL 2: Finance
app.get('/finance', (req, res) => {
  const { country } = req.query;
  const data = financeData[country];
  res.json(data || []);
});

// SKILL 3: Market
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

// SKILL 4: Planting Advisor
app.get('/planting-advice', async (req, res) => {
  const { query } = req.query;
  const result = await getExpertAdvice(`Provide expert planting advice for: ${query}`);
  res.json(result);
});

// SKILL 5: Harvesting Advisor
app.get('/harvesting-advice', async (req, res) => {
  const { query } = req.query;
  const result = await getExpertAdvice(`Provide expert harvesting advice for: ${query}`);
  res.json(result);
});

// SKILL 6: Storage Advisor
app.get('/storage-advice', async (req, res) => {
  const { query } = req.query;
  const result = await getExpertAdvice(`Provide expert storage advice for: ${query}`);
  res.json(result);
});

// Vercel needs this export
module.exports = app;