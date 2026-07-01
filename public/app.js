const grid = document.querySelector("#productGrid");
const selectedProduct = document.querySelector("#selectedProduct");
const pagination = document.querySelector("#pagination");
const form = document.querySelector("#chatForm");
const input = document.querySelector("#chatInput");
const messages = document.querySelector("#messages");
const statusEl = document.querySelector("#status");
const engineEl = document.querySelector("#engine");

let products = [];
let selectedProductId = null;
let currentPage = 1;
let turnCount = 0;
let bagCount = 0;
const pageSize = 8;

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function pageCount() {
  return Math.max(1, Math.ceil(products.length / pageSize));
}

function currentProducts() {
  const start = (currentPage - 1) * pageSize;
  return products.slice(start, start + pageSize);
}

function renderProducts() {
  grid.innerHTML = currentProducts().map((product) => `
    <article class="product ${product.id === selectedProductId ? "active" : ""}" id="product-${product.id}" tabindex="0" data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-body">
        <div class="meta">
          <span>${product.category}</span>
          <strong>${money(product.price)}</strong>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="tags">
          <span>${product.color}</span>
          <span>${product.sizes.join(" / ")}</span>
        </div>
        <button class="view-button" type="button" data-product-id="${product.id}">View product</button>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-product-id]").forEach((node) => {
    node.addEventListener("click", () => openProduct(node.dataset.productId));
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openProduct(node.dataset.productId);
      }
    });
  });
}

function renderSelectedProduct() {
  const product = products.find((item) => item.id === selectedProductId) || products[0];
  if (!product) return;
  selectedProductId = product.id;
  selectedProduct.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div class="selected-copy">
      <div class="selected-topline">
        <span>${product.category}</span>
        <strong>${money(product.price)}</strong>
      </div>
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <dl>
        <div><dt>Color</dt><dd>${product.color}</dd></div>
        <div><dt>Sizes</dt><dd>${product.sizes.join(", ")}</dd></div>
        <div><dt>Tags</dt><dd>${product.tags.slice(0, 5).join(", ")}</dd></div>
      </dl>
      <button type="button" data-action="add_to_bag" data-product-id="${product.id}">Add to bag</button>
    </div>
  `;
}

function renderPagination() {
  const total = pageCount();
  pagination.innerHTML = Array.from({ length: total }, (_, index) => {
    const page = index + 1;
    return `<button type="button" class="${page === currentPage ? "active" : ""}" data-page="${page}">${page}</button>`;
  }).join("");

  pagination.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      currentPage = Number(button.dataset.page);
      renderProducts();
      renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderAll() {
  renderSelectedProduct();
  renderProducts();
  renderPagination();
}

function updateBagStatus() {
  statusEl.textContent = bagCount > 0 ? `bag ${bagCount}` : "ready";
}

function addQuickReplies(replies = []) {
  if (!replies.length) return;

  const row = document.createElement("div");
  row.className = "quick-replies";

  replies.slice(0, 4).forEach((reply) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = reply.label;
    if (reply.message) button.dataset.message = reply.message;
    if (reply.action) button.dataset.action = reply.action;
    if (reply.productId) button.dataset.productId = reply.productId;
    row.append(button);
  });

  messages.append(row);
  messages.scrollTop = messages.scrollHeight;
}

function addMessage(text, role, quickReplies = []) {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.textContent = text;
  messages.append(node);
  if (role === "bot") addQuickReplies(quickReplies);
  messages.scrollTop = messages.scrollHeight;
}

function addToBag(productId, announce = true) {
  const product = products.find((item) => item.id === productId) || products.find((item) => item.id === selectedProductId);
  if (!product) return;

  bagCount += 1;
  selectedProductId = product.id;
  renderAll();
  statusEl.textContent = `bag ${bagCount}`;

  if (announce) {
    addMessage(`${product.name} is in your bag.`, "bot", [
      { label: "Checkout", message: "I am ready to checkout" },
      { label: "Keep browsing", message: "Show me another option" }
    ]);
  }
}

function openProduct(productId) {
  selectedProductId = productId;
  const index = products.findIndex((product) => product.id === productId);
  if (index >= 0) {
    currentPage = Math.floor(index / pageSize) + 1;
  }

  renderAll();
  const card = document.querySelector(`#product-${CSS.escape(productId)}`);
  if (!card) return;
  selectedProduct.scrollIntoView({ behavior: "smooth", block: "start" });
  card.focus({ preventScroll: true });
}

async function sendMessage(message) {
  statusEl.textContent = "thinking";
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      message,
      currentProductId: selectedProductId,
      turnCount
    })
  });
  const data = await response.json();
  engineEl.textContent = data.poweredBy || "agent";

  if (data.action?.type === "add_to_bag") {
    addToBag(data.action.productId, false);
  }

  addMessage(data.reply || "I found the closest product.", "bot", data.quickReplies || []);
  if (data.action?.productId) {
    if (data.action.type !== "add_to_bag") {
      openProduct(data.action.productId);
      statusEl.textContent = "opened";
    }
  } else {
    updateBagStatus();
  }
}

messages.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "add_to_bag") {
    addToBag(button.dataset.productId || selectedProductId);
    return;
  }

  const message = button.dataset.message;
  if (!message) return;

  addMessage(message, "user");
  turnCount += 1;

  try {
    await sendMessage(message);
  } catch (error) {
    statusEl.textContent = "error";
    addMessage("I could not reach the assistant. Please check the server.", "bot");
  }
});

selectedProduct.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action='add_to_bag']");
  if (!button) return;
  addToBag(button.dataset.productId);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";
  turnCount += 1;

  try {
    await sendMessage(message);
  } catch (error) {
    statusEl.textContent = "error";
    addMessage("I could not reach the assistant. Please check the server.", "bot");
  }
});

async function boot() {
  const response = await fetch("/api/products");
  const data = await response.json();
  products = data.products;
  selectedProductId = products[0]?.id;
  renderAll();
  updateBagStatus();
}

boot();
