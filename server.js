const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const publicDir = path.join(__dirname, "public");

const products = [
  {
    id: "linen-shirt",
    name: "Ocean Linen Shirt",
    category: "Shirts",
    price: 69,
    color: "Sky blue",
    sizes: ["S", "M", "L", "XL"],
    tags: ["linen", "summer", "office", "breathable", "men", "women"],
    description: "A breathable linen shirt for warm days, office looks, and vacation packing.",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "black-dress",
    name: "Studio Black Dress",
    category: "Dresses",
    price: 119,
    color: "Black",
    sizes: ["XS", "S", "M", "L"],
    tags: ["evening", "cocktail", "minimal", "women"],
    description: "A clean black dress for dinner, events, or a polished office look.",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "runner-jacket",
    name: "Runner Pro Windbreaker",
    category: "Jackets",
    price: 89,
    color: "Lime",
    sizes: ["S", "M", "L"],
    tags: ["sport", "running", "rain", "lightweight", "unisex"],
    description: "A lightweight water-resistant windbreaker with easy ventilation.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "denim-jacket",
    name: "Raw Denim Jacket",
    category: "Jackets",
    price: 98,
    color: "Indigo",
    sizes: ["S", "M", "L", "XL"],
    tags: ["denim", "casual", "fall", "unisex"],
    description: "A sturdy straight-cut denim jacket for everyday layering.",
    image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "cream-sneakers",
    name: "Cloud Cream Sneakers",
    category: "Shoes",
    price: 79,
    color: "Cream",
    sizes: ["38", "39", "40", "41", "42", "43"],
    tags: ["sneakers", "shoes", "daily", "minimal"],
    description: "Soft everyday sneakers with a clean, versatile silhouette.",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "wedding-gown",
    name: "Aurora Wedding Gown",
    category: "Bridal",
    price: 890,
    color: "Ivory",
    sizes: ["XS", "S", "M", "L"],
    tags: ["wedding", "dress", "ivory", "satin", "bride"],
    description: "An ivory satin bridal gown with a structured bodice and soft skirt.",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "ribbed-tank",
    name: "Ribbed Cotton Tank",
    category: "Tops",
    price: 34,
    color: "White",
    sizes: ["XS", "S", "M", "L", "XL"],
    tags: ["cotton", "basic", "summer", "layering", "women"],
    description: "A fitted ribbed tank top for layering or hot weather outfits.",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "tailored-blazer",
    name: "Tailored City Blazer",
    category: "Blazers",
    price: 168,
    color: "Charcoal",
    sizes: ["S", "M", "L", "XL"],
    tags: ["business", "office", "formal", "tailored", "men", "women"],
    description: "A sharp charcoal blazer for meetings, dinners, and business travel.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "wide-leg-trousers",
    name: "Wide-Leg Wool Trousers",
    category: "Trousers",
    price: 126,
    color: "Graphite",
    sizes: ["XS", "S", "M", "L"],
    tags: ["wool", "office", "formal", "wide leg", "women"],
    description: "Soft wool-blend trousers with a fluid wide-leg shape.",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "cashmere-cardigan",
    name: "Cashmere Weekend Cardigan",
    category: "Knitwear",
    price: 142,
    color: "Oat",
    sizes: ["S", "M", "L"],
    tags: ["cashmere", "cozy", "knitwear", "weekend", "women"],
    description: "A warm cashmere cardigan with a relaxed fit and soft hand feel.",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "leather-loafers",
    name: "Polished Leather Loafers",
    category: "Shoes",
    price: 138,
    color: "Brown",
    sizes: ["39", "40", "41", "42", "43", "44"],
    tags: ["loafers", "leather", "office", "smart casual", "men"],
    description: "Brown leather loafers that work with tailoring or dark denim.",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "silk-slip-skirt",
    name: "Silk Slip Skirt",
    category: "Skirts",
    price: 104,
    color: "Champagne",
    sizes: ["XS", "S", "M", "L"],
    tags: ["silk", "evening", "date night", "women"],
    description: "A bias-cut silk skirt with a soft sheen and easy movement.",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d27?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "puffer-vest",
    name: "Packable Puffer Vest",
    category: "Outerwear",
    price: 92,
    color: "Forest green",
    sizes: ["S", "M", "L", "XL"],
    tags: ["puffer", "travel", "warm", "outdoor", "unisex"],
    description: "A lightweight insulated vest that packs down for travel.",
    image: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "straight-jeans",
    name: "Straight Vintage Jeans",
    category: "Denim",
    price: 86,
    color: "Washed blue",
    sizes: ["26", "27", "28", "29", "30", "31", "32"],
    tags: ["jeans", "denim", "casual", "vintage", "women"],
    description: "Straight-leg jeans with a vintage wash and everyday structure.",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "oxford-shirt",
    name: "Classic Oxford Shirt",
    category: "Shirts",
    price: 74,
    color: "White",
    sizes: ["S", "M", "L", "XL", "XXL"],
    tags: ["oxford", "office", "classic", "cotton", "men"],
    description: "A crisp cotton Oxford shirt for workdays and smart weekends.",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "midi-wrap-dress",
    name: "Midi Wrap Dress",
    category: "Dresses",
    price: 112,
    color: "Emerald",
    sizes: ["XS", "S", "M", "L", "XL"],
    tags: ["midi", "wrap", "wedding guest", "party", "women"],
    description: "A flattering wrap dress for parties, dinners, and wedding guest looks.",
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "technical-parka",
    name: "Technical Rain Parka",
    category: "Outerwear",
    price: 176,
    color: "Navy",
    sizes: ["S", "M", "L", "XL"],
    tags: ["rain", "waterproof", "commute", "hood", "unisex"],
    description: "A waterproof hooded parka built for wet commutes and weekend walks.",
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "training-leggings",
    name: "Training Sculpt Leggings",
    category: "Activewear",
    price: 64,
    color: "Black",
    sizes: ["XS", "S", "M", "L"],
    tags: ["gym", "training", "stretch", "activewear", "women"],
    description: "High-rise training leggings with supportive stretch and a smooth finish.",
    image: "https://images.unsplash.com/photo-1506629905607-d9f297d3bbbe?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "merino-tee",
    name: "Merino Travel Tee",
    category: "T-Shirts",
    price: 58,
    color: "Slate",
    sizes: ["S", "M", "L", "XL"],
    tags: ["merino", "travel", "breathable", "men", "basic"],
    description: "A breathable merino tee that resists odor and packs easily.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "pleated-chinos",
    name: "Pleated Cotton Chinos",
    category: "Trousers",
    price: 94,
    color: "Khaki",
    sizes: ["30", "32", "34", "36", "38"],
    tags: ["chinos", "cotton", "smart casual", "men"],
    description: "Pleated cotton chinos with a relaxed top block and tapered leg.",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "satin-cami",
    name: "Satin Evening Cami",
    category: "Tops",
    price: 52,
    color: "Rose",
    sizes: ["XS", "S", "M", "L"],
    tags: ["satin", "evening", "date night", "layering", "women"],
    description: "A satin camisole that pairs neatly with skirts, denim, or tailoring.",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "canvas-tote",
    name: "Heavy Canvas Tote",
    category: "Accessories",
    price: 42,
    color: "Natural",
    sizes: ["One size"],
    tags: ["bag", "tote", "canvas", "travel", "daily"],
    description: "A sturdy canvas tote with room for a laptop, gym kit, and daily extras.",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "wool-coat",
    name: "Double-Face Wool Coat",
    category: "Outerwear",
    price: 248,
    color: "Camel",
    sizes: ["S", "M", "L"],
    tags: ["wool", "winter", "coat", "formal", "women"],
    description: "A refined wool coat with a clean double-face construction.",
    image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: "trail-boots",
    name: "Trail Leather Boots",
    category: "Shoes",
    price: 154,
    color: "Dark brown",
    sizes: ["40", "41", "42", "43", "44", "45"],
    tags: ["boots", "trail", "leather", "outdoor", "men"],
    description: "Durable leather boots for city weekends and light trail walks.",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=80"
  }
];

function sendJson(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function findProduct(productId) {
  return products.find((product) => product.id === productId);
}

function isPurchaseIntent(message) {
  return /\b(how\s+can\s+i\s+buy|how\s+do\s+i\s+buy|buy\s+it|buy\s+this|purchase|checkout|order|add\s+(it|this)?\s*(to\s+)?(bag|cart)|add\s+to\s+(bag|cart))\b/i.test(message);
}

function wantsDirectAdd(message) {
  return /\b(add\s+(it|this)?\s*(to\s+)?(bag|cart)|add\s+to\s+(bag|cart))\b/i.test(message);
}

function purchaseQuickReplies(productId) {
  return [
    { label: "Add to bag", action: "add_to_bag", productId },
    { label: "Show sizes", message: "What sizes are available?" },
    { label: "Keep browsing", message: "Show me another option" }
  ];
}

function purchaseResponse(product, directAdd = false) {
  return {
    reply: directAdd
      ? `Sure - I added ${product.name} to your bag.`
      : `You can buy ${product.name} by adding it to your bag first. Would you like me to add it now?`,
    action: {
      type: directAdd ? "add_to_bag" : "navigate",
      productId: product.id,
      reason: directAdd ? "The user asked to add the selected item to the bag." : "The user asked how to buy the selected item."
    },
    quickReplies: directAdd ? [{ label: "Checkout", message: "I am ready to checkout" }] : purchaseQuickReplies(product.id)
  };
}

function enhanceResult(result, context) {
  const productId = result?.action?.productId;
  const product = findProduct(productId);
  const shouldOfferPurchase = product && result?.action?.type !== "add_to_bag" && context.turnCount >= 2 && context.turnCount % 2 === 0;

  if (shouldOfferPurchase) {
    const existingReplies = Array.isArray(result.quickReplies) ? result.quickReplies : [];
    const hasAddToBag = existingReplies.some((reply) => reply.action === "add_to_bag");
    return {
      ...result,
      reply: /add it to your bag/i.test(result.reply) ? result.reply : `${result.reply} Want me to add it to your bag?`,
      quickReplies: hasAddToBag ? existingReplies : [
        { label: "Add to bag", action: "add_to_bag", productId: product.id },
        ...existingReplies.slice(0, 2)
      ]
    };
  }

  if (!result.quickReplies?.length) {
    return {
      ...result,
      quickReplies: [
        { label: "Similar items", message: "Show me similar items" },
        { label: "Different style", message: "Show me a different style" }
      ]
    };
  }

  return result;
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(publicDir, pathname));

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    const type = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8"
    }[ext] || "application/octet-stream";

    res.writeHead(200, { "content-type": type });
    res.end(data);
  });
}

function localMatch(message, context = {}) {
  const text = message.toLowerCase();
  const currentProduct = findProduct(context.currentProductId);

  if (currentProduct && isPurchaseIntent(message)) {
    return purchaseResponse(currentProduct, wantsDirectAdd(message));
  }

  const scored = products.map((product) => {
    const haystack = [
      product.name,
      product.category,
      product.color,
      product.description,
      product.tags.join(" "),
      product.sizes.join(" ")
    ].join(" ").toLowerCase();

    const score = text.split(/\s+/).filter((word) => word.length > 2 && haystack.includes(word)).length;
    return { product, score };
  }).sort((a, b) => b.score - a.score);

  const winner = scored[0].score > 0 ? scored[0].product : products[0];
  return {
    reply: `I found ${winner.name}: ${winner.description} Available sizes: ${winner.sizes.join(", ")}.`,
    action: {
      type: "navigate",
      productId: winner.id,
      reason: "Best match from local keyword search."
    }
  };
}

async function geminiMatch(message, context = {}) {
  const currentProduct = findProduct(context.currentProductId);

  if (currentProduct && isPurchaseIntent(message)) {
    return purchaseResponse(currentProduct, wantsDirectAdd(message));
  }

  const prompt = [
    "You are an AI shopping assistant for an English clothing store.",
    "Choose the single best matching product from the catalog and return only valid JSON.",
    "JSON schema: {\"reply\":\"short helpful answer in English\", \"action\":{\"type\":\"navigate\", \"productId\":\"product id\", \"reason\":\"short reason in English\"}, \"quickReplies\":[{\"label\":\"short option\", \"message\":\"message to send\"}]}",
    "If there is no exact match, choose the closest product and be honest in English.",
    "If useful, include 2-3 quickReplies. Keep labels short, like messenger option chips.",
    currentProduct ? `Current selected product: ${JSON.stringify(currentProduct)}` : "No current selected product.",
    `Catalog: ${JSON.stringify(products)}`,
    `User request: ${message}`
  ].join("\n\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API returned ${response.status}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsed = JSON.parse(text);
  const productExists = products.some((product) => product.id === parsed?.action?.productId);

  if (!productExists) {
    return localMatch(message, context);
  }

  return parsed;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/products") {
    sendJson(res, 200, { products });
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    try {
      const body = JSON.parse(await readBody(req));
      const message = String(body.message || "").trim();
      const context = {
        currentProductId: String(body.currentProductId || ""),
        turnCount: Number(body.turnCount || 1)
      };
      if (!message) {
        sendJson(res, 400, { error: "Message is required" });
        return;
      }

      const result = API_KEY ? await geminiMatch(message, context) : localMatch(message, context);
      sendJson(res, 200, { ...enhanceResult(result, context), poweredBy: API_KEY ? MODEL : "local-fallback" });
    } catch (error) {
      const fallback = localMatch("shirt", { turnCount: 1 });
      sendJson(res, 200, {
        ...enhanceResult(fallback, { turnCount: 1 }),
        poweredBy: "local-fallback",
        warning: error.message
      });
    }
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`AI shop agent prototype: http://localhost:${PORT}`);
  console.log(API_KEY ? `Gemini model: ${MODEL}` : "Gemini key not set; using local fallback.");
});
