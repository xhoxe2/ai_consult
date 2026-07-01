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

const icons = {
  atelier: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z"></path><path d="M12 7v10M7 9.5l5 3 5-3"></path></svg>`,
  bag: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9h10l1 11H6L7 9Z"></path><path d="M9 9V7a3 3 0 0 1 6 0v2"></path></svg>`,
  arrow: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13"></path><path d="m13 6 6 6-6 6"></path></svg>`,
  spark: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z"></path><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z"></path></svg>`,
  size: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v8H4V8Z"></path><path d="M8 8v4M12 8v3M16 8v4"></path></svg>`
};

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
      <div class="product-media">
        <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.parentElement.classList.add('image-failed'); this.remove();">
        <span>${product.name}</span>
      </div>
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
        <button class="view-button" type="button" data-product-id="${product.id}">View product ${icons.arrow}</button>
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
    <div class="selected-media">
      <img src="${product.image}" alt="${product.name}" onerror="this.parentElement.classList.add('image-failed'); this.remove();">
      <strong>${product.name}</strong>
      <span class="image-badge">${icons.spark} Curated</span>
    </div>
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
        <div><dt>Styling</dt><dd>${product.tags.slice(0, 3).join(", ")}</dd></div>
      </dl>
      <button type="button" data-action="add_to_bag" data-product-id="${product.id}">${icons.bag} Add to bag</button>
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
    button.innerHTML = `${icons.spark}<span>${reply.label}</span>`;
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
  renderSelectedProduct();
  renderProducts();
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
