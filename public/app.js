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
      <button type="button">Add to bag</button>
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

function addMessage(text, role) {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.textContent = text;
  messages.append(node);
  messages.scrollTop = messages.scrollHeight;
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
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  engineEl.textContent = data.poweredBy || "agent";

  addMessage(data.reply || "I found the closest product.", "bot");
  if (data.action?.productId) {
    openProduct(data.action.productId);
    statusEl.textContent = "opened";
  } else {
    statusEl.textContent = "ready";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  addMessage(message, "user");
  input.value = "";

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
}

boot();
