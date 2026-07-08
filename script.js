const PRODUCT_STORAGE_KEY = "shopyar-products";
const COLLECTION_STORAGE_KEY = "shopyar-collections";
const SLIDER_STORAGE_KEY = "shopyar-slider";
const CART_STORAGE_KEY = "shopyar-cart";
const ORDERS_STORAGE_KEY = "shopyar-orders";
const BRANDING_STORAGE_KEY = "shopyar-branding";
const STORE_CONTENT_STORAGE_KEY = "shopyar-store-content";
const STORE_API_URL = "/api/store";
const ORDERS_API_URL = "/api/orders";

const DEFAULT_LOGO = "assets/logo.jpg";

const defaultStoreContent = {
  heroEyebrow: "Everyday finds",
  heroTitle: "Products for home, gadgets, kids, and daily life.",
  heroText: "Shopyar brings useful products, smart gadgets, home essentials, and family favorites into one easy shopping place.",
  promoEyebrow: "Limited time offer",
  promoTitle: "Free shipping + exclusive bundles this weekend.",
  featureEyebrow: "Featured collection",
  featureTitle: "The calm collection",
  featureText: "Soft tones, premium finishes, and timeless pieces for the refined home and wardrobe.",
  ctaEyebrow: "Customer-first shopping",
  ctaTitle: "Place your order with ease and get your favorites delivered quickly.",
  footerText: "Useful gadgets, home products, kids items, and daily essentials for modern Pakistani families.",
  supportEmail: "support@shopyar.pk",
  supportPhone: "+92 300 1234567",
  whatsappNumber: "+92 300 1234567",
  shippingText: "Free shipping on orders over Rs 8,000",
  ratingText: "4.9/5 rated by customers",
  supportText: "Help when you need it"
};

const defaultProducts = [
  {
    id: 1,
    name: "Smart LED Desk Lamp",
    category: "Home",
    price: 5200,
    salePrice: 4400,
    description: "Adjustable lighting for study tables, work desks, and bedside use.",
    popular: true,
    badge: "Best seller"
  },
  {
    id: 2,
    name: "Wireless Mini Speaker",
    category: "Gadgets",
    price: 6400,
    salePrice: null,
    description: "Compact sound for home, travel, and everyday entertainment.",
    popular: true,
    badge: "Popular"
  },
  {
    id: 3,
    name: "Kids Learning Tablet",
    category: "Kids",
    price: 11800,
    salePrice: 8900,
    description: "A child-friendly learning device for early reading and practice.",
    popular: false,
    badge: "Sale"
  },
  {
    id: 4,
    name: "Kitchen Storage Set",
    category: "Home",
    price: 7400,
    salePrice: null,
    description: "A practical airtight set for snacks, spices, and daily kitchen use.",
    popular: true,
    badge: "Popular"
  },
  {
    id: 5,
    name: "Rechargeable Hand Fan",
    category: "Daily Use",
    price: 8800,
    salePrice: 6900,
    description: "Portable cooling for travel, office, school, and outdoor errands.",
    popular: false,
    badge: "Sale"
  },
  {
    id: 6,
    name: "Baby Care Organizer",
    category: "Kids",
    price: 7200,
    salePrice: null,
    description: "Keeps baby wipes, bottles, diapers, and small essentials organized.",
    popular: true,
    badge: "New"
  }
];

function getProducts() {
  const storedProducts = localStorage.getItem(PRODUCT_STORAGE_KEY);
  if (!storedProducts) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  }

  try {
    const products = JSON.parse(storedProducts);
    if (products[0]?.name === "Cedar Lounge Set") {
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(defaultProducts));
      return defaultProducts;
    }
    return products;
  } catch (error) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(defaultProducts));
    return defaultProducts;
  }
}

function getVisibleProducts() {
  return getProducts().filter((product) => product.status !== "draft");
}

function formatPrice(value) {
  const numericValue = Number(value) || 0;
  return `Rs ${numericValue.toLocaleString("en-PK")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getStoreContent() {
  const stored = localStorage.getItem(STORE_CONTENT_STORAGE_KEY);
  if (!stored) return defaultStoreContent;

  try {
    const parsed = JSON.parse(stored);
    if (parsed.heroTitle?.startsWith("Modern e") || parsed.supportText?.startsWith("24/7")) {
      localStorage.setItem(STORE_CONTENT_STORAGE_KEY, JSON.stringify(defaultStoreContent));
      return defaultStoreContent;
    }
    return { ...defaultStoreContent, ...parsed };
  } catch (error) {
    return defaultStoreContent;
  }
}

function getCollections() {
  const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
  if (!stored) return ["Gadgets", "Home", "Kids", "Daily Use"];
  const collections = JSON.parse(stored);
  if (collections.includes("Fashion") && collections.includes("Accessories")) {
    const defaults = ["Gadgets", "Home", "Kids", "Daily Use"];
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return collections;
}

function getSlider() {
  const stored = localStorage.getItem(SLIDER_STORAGE_KEY);
  if (stored) {
    const slider = JSON.parse(stored);
    if (slider.image === "assets/shopyar-banner.svg") {
      slider.image = "";
      localStorage.setItem(SLIDER_STORAGE_KEY, JSON.stringify(slider));
    }
    return slider;
  }

  return {
        title: "Modern pieces for a lighter everyday look.",
        subtitle: "Explore the newest arrivals crafted in soft greens and calm neutrals.",
        image: ""
      };
}

function getCart() {
  const stored = localStorage.getItem(CART_STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        if (typeof entry === "number") {
          return { id: Number(entry), quantity: 1 };
        }

        if (entry && typeof entry === "object" && entry.id) {
          return { id: Number(entry.id), quantity: Number(entry.quantity || 1) };
        }

        return null;
      })
      .filter(Boolean);
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function getActivePrice(product) {
  return product.salePrice != null && product.salePrice < product.price ? product.salePrice : product.price;
}

function matchesSearch(product, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return [
    product.name,
    product.description,
    product.category,
    product.tags,
    product.sku
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function sortProducts(products, sortValue = "featured") {
  const sorted = [...products];
  if (sortValue === "newest") return sorted.sort((a, b) => Number(b.id) - Number(a.id));
  if (sortValue === "price-asc") return sorted.sort((a, b) => getActivePrice(a) - getActivePrice(b));
  if (sortValue === "price-desc") return sorted.sort((a, b) => getActivePrice(b) - getActivePrice(a));
  if (sortValue === "popular") return sorted.sort((a, b) => Number(!!b.popular) - Number(!!a.popular));
  if (sortValue === "featured") return sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  return sorted;
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;
  const totalItems = getCart().reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  cartCount.textContent = totalItems;
}

function getCartItems() {
  const cart = getCart();
  const products = getVisibleProducts();

  return cart
    .map((entry) => {
      const product = products.find((item) => item.id === Number(entry.id));
      if (!product) return null;

      const unitPrice = product.salePrice != null && product.salePrice < product.price ? product.salePrice : product.price;
      return {
        ...product,
        quantity: Number(entry.quantity || 1),
        unitPrice,
        lineTotal: unitPrice * Number(entry.quantity || 1)
      };
    })
    .filter(Boolean);
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const items = getCartItems();

  if (!cartItems) return;

  if (!items.length) {
    cartItems.innerHTML = '<p class="muted">Your cart is empty.</p>';
    if (cartTotal) cartTotal.textContent = "Rs 0";
    updateCartCount();
    return;
  }

  cartItems.innerHTML = items
    .map((product) => `
      <div class="cart-item">
        <strong>${escapeHtml(product.name)}</strong>
        <div class="muted">${formatPrice(product.unitPrice)} each</div>
        <div class="cart-item-actions">
          <button class="qty-btn" type="button" data-action="cart-decrease" data-product-id="${product.id}">−</button>
          <span class="qty-value">${product.quantity}</span>
          <button class="qty-btn" type="button" data-action="cart-increase" data-product-id="${product.id}">+</button>
          <button class="mini-btn" type="button" data-action="cart-remove" data-product-id="${product.id}">Remove</button>
        </div>
        <div class="cart-item-price">${formatPrice(product.lineTotal)}</div>
      </div>
    `)
    .join("");

  if (cartTotal) {
    const total = items.reduce((sum, product) => sum + product.lineTotal, 0);
    cartTotal.textContent = formatPrice(total);
  }

  updateCartCount();
}

function renderCartPage() {
  const container = document.getElementById("cart-page-items");
  const totalElement = document.getElementById("cart-page-total");
  if (!container) return;
  const items = getCartItems();
  if (!items.length) {
    container.innerHTML = '<p class="muted">Your cart is empty.</p>';
    if (totalElement) totalElement.textContent = "Rs 0";
    return;
  }

  container.innerHTML = items
    .map((product) => `
      <div class="cart-line">
        <img src="${escapeHtml(getProductImage(product, "primary"))}" alt="${escapeHtml(product.name)}" />
        <div>
          <strong>${escapeHtml(product.name)}</strong>
          <p class="muted">${formatPrice(product.unitPrice)} x ${product.quantity}</p>
          <div class="cart-item-actions">
            <button class="qty-btn" type="button" data-action="cart-decrease" data-product-id="${product.id}">-</button>
            <span class="qty-value">${product.quantity}</span>
            <button class="qty-btn" type="button" data-action="cart-increase" data-product-id="${product.id}">+</button>
            <button class="mini-btn" type="button" data-action="cart-remove" data-product-id="${product.id}">Remove</button>
          </div>
        </div>
        <strong>${formatPrice(product.lineTotal)}</strong>
      </div>
    `)
    .join("");

  if (totalElement) totalElement.textContent = formatPrice(items.reduce((sum, product) => sum + product.lineTotal, 0));
}

function renderCheckoutPage() {
  const summary = document.getElementById("checkout-page-summary");
  if (!summary) return;
  const cart = getCart();
  currentCheckoutItems = cart;
  const items = getCartItems();
  if (!items.length) {
    summary.innerHTML = '<p class="muted">Your cart is empty. Add products before checkout.</p>';
    return;
  }

  summary.innerHTML = `
    <ul>
      ${items.map((item) => `<li>${escapeHtml(item.name)} x ${item.quantity} - ${formatPrice(item.lineTotal)}</li>`).join("")}
    </ul>
    <div class="price">Total: ${formatPrice(items.reduce((sum, item) => sum + item.lineTotal, 0))}</div>
  `;
}

function renderOrderConfirmation() {
  const container = document.getElementById("order-confirmation");
  if (!container) return;
  const orderId = Number(new URLSearchParams(window.location.search).get("id"));
  const order = getOrders().find((item) => Number(item.id) === orderId);
  if (!order) {
    container.innerHTML = '<p class="muted">Order details are not available.</p>';
    return;
  }

  container.innerHTML = `
    <p class="eyebrow">Order placed</p>
    <h1>Thank you, ${escapeHtml(order.customerName || "Customer")}.</h1>
    <p>Your order #${order.id} has been received. We will contact you on ${escapeHtml(order.phone || "your phone number")} to confirm delivery.</p>
    <div class="checkout-summary">
      <ul>${order.items.map((item) => `<li>${escapeHtml(item.name)} x ${item.quantity}</li>`).join("")}</ul>
      <div class="price">Total: ${formatPrice(order.total)}</div>
    </div>
    <a class="btn btn-primary" href="shop.html">Continue shopping</a>
  `;
}

function toggleCart(open) {
  const drawer = document.getElementById("cart-drawer");
  if (!drawer) return;
  drawer.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const safeQuantity = Math.max(1, Number(quantity) || 1);
  const existingItem = cart.find((item) => item.id === Number(productId));

  if (existingItem) {
    existingItem.quantity += safeQuantity;
  } else {
    cart.push({ id: Number(productId), quantity: safeQuantity });
  }

  saveCart(cart);
  renderCart();
  renderCartPage();
  renderCheckoutPage();
  updateCartCount();
  showToast("Added to cart");
}

function updateCartQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === Number(productId));
  if (!item) return;

  item.quantity = Math.max(1, Number(item.quantity || 1) + delta);
  if (item.quantity <= 0) {
    const filtered = cart.filter((entry) => entry.id !== Number(productId));
    saveCart(filtered);
  } else {
    saveCart(cart);
  }

  renderCart();
  renderCartPage();
  renderCheckoutPage();
  renderOrderConfirmation();
}

function removeCartItem(productId) {
  const cart = getCart().filter((entry) => entry.id !== Number(productId));
  saveCart(cart);
  renderCart();
  renderCartPage();
  renderCheckoutPage();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toast.hidden = true;
  }, 1800);
}

function getBranding() {
  const stored = localStorage.getItem(BRANDING_STORAGE_KEY);
  return stored
    ? JSON.parse(stored)
    : {
        storeName: "Shopyar",
        logo: DEFAULT_LOGO,
        backgroundLogo: DEFAULT_LOGO,
        primaryColor: "#2f7d53",
        darkColor: "#1f5838",
        softColor: "#cfe2d0"
      };
}

function applyBranding() {
  const branding = getBranding();
  const logoValue = branding.logo || DEFAULT_LOGO;
  const watermarkValue = branding.backgroundLogo || branding.logo || DEFAULT_LOGO;
  const logoElements = Array.from(document.querySelectorAll("img.logo, img.logo-large, img[data-brand-logo]"));
  const brandTextElements = Array.from(document.querySelectorAll(".brand-text"));
  const favicon = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");

  document.documentElement.style.setProperty("--green", branding.primaryColor || "#2f7d53");
  document.documentElement.style.setProperty("--green-dark", branding.darkColor || "#1f5838");
  document.documentElement.style.setProperty("--green-soft", branding.softColor || "#cfe2d0");

  logoElements.forEach((element) => {
    if (element instanceof HTMLImageElement) {
      element.src = logoValue;
      element.alt = "Shopyar logo";
    }
  });

  brandTextElements.forEach((element) => {
    element.textContent = branding.storeName || "Shopyar";
  });

  const watermark = document.getElementById("store-watermark");
  if (watermark) {
    watermark.style.backgroundImage = watermarkValue ? `url('${watermarkValue}')` : "none";
  }

  if (favicon) {
    favicon.href = logoValue;
  }
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function normalizeWhatsAppNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "923001234567";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

function applyStoreContent() {
  const content = getStoreContent();

  setText("[data-content='hero-eyebrow']", content.heroEyebrow);
  setText("[data-content='hero-title']", content.heroTitle);
  setText("[data-content='hero-text']", content.heroText);
  setText("[data-content='promo-eyebrow']", content.promoEyebrow);
  setText("[data-content='promo-title']", content.promoTitle);
  setText("[data-content='feature-eyebrow']", content.featureEyebrow);
  setText("[data-content='feature-title']", content.featureTitle);
  setText("[data-content='feature-text']", content.featureText);
  setText("[data-content='cta-eyebrow']", content.ctaEyebrow);
  setText("[data-content='cta-title']", content.ctaTitle);
  setText("[data-content='footer-text']", content.footerText);
  setText("[data-content='shipping-text']", content.shippingText);
  setText("[data-content='rating-text']", content.ratingText);
  setText("[data-content='support-text']", content.supportText);

  const emailLink = document.querySelector("[data-content='support-email']");
  if (emailLink) {
    emailLink.textContent = content.supportEmail;
    emailLink.href = `mailto:${content.supportEmail}`;
  }

  setText("[data-content='support-phone']", content.supportPhone);

  const whatsappLink = document.querySelector("[data-content='whatsapp-link']");
  if (whatsappLink) {
    whatsappLink.href = `https://wa.me/${normalizeWhatsAppNumber(content.whatsappNumber || content.supportPhone)}`;
  }
}

function getOrders() {
  const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function hydrateStoreFromRemote(store) {
  if (!store || typeof store !== "object") return;
  if (Array.isArray(store.products) && store.products.length) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(store.products));
  }
  if (Array.isArray(store.collections)) {
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(store.collections));
  }
  if (store.slider) {
    localStorage.setItem(SLIDER_STORAGE_KEY, JSON.stringify(store.slider));
  }
  if (store.branding) {
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(store.branding));
  }
  if (store.content) {
    localStorage.setItem(STORE_CONTENT_STORAGE_KEY, JSON.stringify(store.content));
  }
}

async function loadRemoteStore() {
  try {
    const response = await fetch(STORE_API_URL, { cache: "no-store" });
    if (!response.ok) return false;

    hydrateStoreFromRemote(await response.json());
    return true;
  } catch (error) {
    return false;
  }
}

async function postRemoteOrder(order) {
  try {
    const response = await fetch(ORDERS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

function getProductImage(product, variant = "primary") {
  if (variant === "primary" && product.image) {
    return product.image;
  }

  const palette = {
    Home: ["#2f7d53", "#d7ebda"],
    Gadgets: ["#256d85", "#dceff5"],
    Kids: ["#8a6f2a", "#fff0c7"],
    "Daily Use": ["#4a9a68", "#e3f1df"],
    General: ["#2f7d53", "#f7f2e7"]
  };
  const [primary, secondary] = palette[product.category] || palette.General;
  const baseColor = variant === "secondary" ? secondary : primary;
  const accentColor = variant === "secondary" ? primary : secondary;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
      <rect width="800" height="560" rx="36" fill="${baseColor}"/>
      <rect x="72" y="72" width="656" height="416" rx="28" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.28)" stroke-width="4"/>
      <circle cx="232" cy="238" r="126" fill="${accentColor}"/>
      <rect x="360" y="154" width="242" height="180" rx="26" fill="rgba(255,255,255,0.78)"/>
      <rect x="390" y="190" width="182" height="24" rx="12" fill="${primary}"/>
      <rect x="390" y="232" width="130" height="18" rx="9" fill="${primary}" opacity="0.75"/>
      <rect x="260" y="352" width="262" height="48" rx="24" fill="rgba(255,255,255,0.65)"/>
      <text x="110" y="470" font-family="Segoe UI, sans-serif" font-size="44" font-weight="700" fill="white">${escapeHtml(product.name || "Product")}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderProductCards(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!products.length) {
    container.innerHTML = '<p class="muted">No products yet. Add one from the admin page.</p>';
    return;
  }

  container.innerHTML = products
    .map((product) => {
      const hasSale = product.salePrice != null && product.salePrice < product.price;
      const stock = product.stock === "" || product.stock == null ? null : Number(product.stock);
      const stockLabel = stock == null ? "In stock" : stock > 0 ? `${stock} in stock` : "Out of stock";
      const primaryImage = getProductImage(product, "primary");
      const secondaryImage = getProductImage(product, "secondary");
      const safeName = escapeHtml(product.name);
      const safeDescription = escapeHtml(product.description);
      const safeBadge = escapeHtml(product.badge || "Featured");

      return `
        <article class="product-card" data-product-id="${product.id}" tabindex="0" role="button">
          <div class="product-media" aria-hidden="true">
            <div class="product-image-track">
              <img src="${escapeHtml(primaryImage)}" alt="${safeName}" />
              <img src="${escapeHtml(secondaryImage)}" alt="${safeName} preview" />
            </div>
          </div>
          <div class="product-card-body">
            <span class="product-badge">${safeBadge}</span>
            <h3>${safeName}</h3>
            <p>${safeDescription}</p>
            <div class="product-meta-row">
              <span>${escapeHtml(product.category || "General")}</span>
              <span>${escapeHtml(stockLabel)}</span>
            </div>
            <div class="product-price-row">
              <div class="price">
                ${hasSale ? `<del>${formatPrice(product.price)}</del> ${formatPrice(product.salePrice)}` : formatPrice(product.price)}
              </div>
            </div>
            <div class="qty-control">
              <button class="qty-btn" type="button" data-action="qty-dec">−</button>
              <span class="qty-value">1</span>
              <button class="qty-btn" type="button" data-action="qty-inc">+</button>
            </div>
            <div class="product-card-actions">
              <button class="mini-btn" type="button" data-action="buy" data-product-id="${product.id}">Buy</button>
              <button class="mini-btn btn-secondary" type="button" data-action="add" data-product-id="${product.id}">Add to cart</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

let selectedCategory = "All";
let searchQuery = "";

function renderCatalog(category = "All", query = "") {
  selectedCategory = category;
  searchQuery = query;
  const products = getVisibleProducts();
  const catalogContainer = document.getElementById("catalog-products");
  const chipsContainer = document.getElementById("category-chips");

  if (chipsContainer) {
    const allCategories = [
      ...new Set([
        ...getCollections(),
        ...products.map((product) => product.category)
      ])
    ];
    const categories = ["All", ...allCategories];
    chipsContainer.innerHTML = categories
      .map((category) => `
        <button class="chip ${category === selectedCategory ? "active" : ""}" data-category="${escapeHtml(category)}">
          ${escapeHtml(category)}
        </button>
      `)
      .join("");
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesCategory && matchesSearch(product, searchQuery);
  });

  const sortValue = document.getElementById("product-sort")?.value || "featured";
  renderProductCards(sortProducts(filteredProducts, sortValue), "catalog-products");
  renderProductCards(sortProducts(products.filter((product) => product.popular && matchesSearch(product, searchQuery)), sortValue), "popular-products");
  renderProductCards(sortProducts(products.filter((product) => product.salePrice != null && product.salePrice < product.price && matchesSearch(product, searchQuery)), sortValue), "sales-products");
  renderCategoryPage(sortValue);
  renderSearchPage(sortValue);
}

function renderCategoryPage(sortValue = "featured") {
  const container = document.getElementById("category-products");
  if (!container) return;
  const category = container.dataset.category || "";
  const products = getVisibleProducts().filter((product) => product.category === category && matchesSearch(product, searchQuery));
  renderProductCards(sortProducts(products, sortValue), "category-products");
}

function renderSearchPage(sortValue = "featured") {
  const container = document.getElementById("search-products");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const query = searchQuery || params.get("q") || "";
  const searchHeading = document.getElementById("search-heading");
  if (searchHeading) searchHeading.textContent = query ? `Results for "${query}"` : "Search products";
  const visibleProducts = getVisibleProducts();
  const products = query ? visibleProducts.filter((product) => matchesSearch(product, query)) : visibleProducts;
  renderProductCards(sortProducts(products, sortValue), "search-products");
}

function attachCategoryFilter() {
  const chipsContainer = document.getElementById("category-chips");

  if (!chipsContainer) return;

  chipsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;

    renderCatalog(button.dataset.category, searchQuery);
  });
}

function renderSlider() {
  const slider = getSlider();
  const slides = Array.from(document.querySelectorAll(".slide"));
  const sliderShell = document.querySelector(".slider-shell");

  if (!slides.length) return;

  const firstSlide = slides[0];
  const heading = firstSlide.querySelector("h3");
  const paragraph = firstSlide.querySelector("p");

  if (heading) heading.textContent = slider.title || "Modern pieces for a lighter everyday look.";
  if (paragraph) paragraph.textContent = slider.subtitle || "Explore the newest arrivals crafted in soft greens and calm neutrals.";

  if (sliderShell) {
    if (slider.image) {
      sliderShell.style.backgroundImage = `linear-gradient(135deg, rgba(31, 88, 56, 0.38), rgba(47, 125, 83, 0.26)), url('${slider.image}')`;
      sliderShell.style.backgroundSize = "cover, contain";
      sliderShell.style.backgroundPosition = "center";
      sliderShell.style.backgroundRepeat = "no-repeat";
    } else {
      sliderShell.style.backgroundImage = "";
      sliderShell.style.backgroundRepeat = "";
    }
  }
}

function initSlider() {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsContainer = document.querySelector(".slider-dots");
  const buttons = Array.from(document.querySelectorAll(".slider-btn"));

  if (!slides.length || !dotsContainer) return;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    dotsContainer.appendChild(dot);
    return dot;
  });

  let activeIndex = 0;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = Number(button.dataset.dir || 1);
      showSlide(activeIndex + direction);
    });
  });

  showSlide(0);
  setInterval(() => showSlide(activeIndex + 1), 5000);
}

let currentCheckoutItems = [];

function openProductModal(productId, quantity = 1, checkoutItems = null) {
  const products = getVisibleProducts();
  const modal = document.getElementById("product-modal");
  const modalContent = document.getElementById("modal-content");
  if (!modal || !modalContent) return;

  const resolvedItems = checkoutItems || (productId ? [{ id: productId, quantity: Number(quantity || 1) }] : []);
  currentCheckoutItems = resolvedItems;

  const checkoutLines = resolvedItems
    .map((entry) => {
      const product = products.find((item) => item.id === Number(entry.id));
      if (!product) return null;
      const unitPrice = product.salePrice != null && product.salePrice < product.price ? product.salePrice : product.price;
      return {
        product,
        quantity: Number(entry.quantity || 1),
        unitPrice,
        lineTotal: unitPrice * Number(entry.quantity || 1)
      };
    })
    .filter(Boolean);

  const total = checkoutLines.reduce((sum, entry) => sum + entry.lineTotal, 0);

  if (!checkoutLines.length) {
    modal.hidden = true;
    return;
  }

  modalContent.innerHTML = `
    <h2 id="modal-title">Checkout</h2>
    <p class="eyebrow">Order summary</p>
    <div class="checkout-summary">
      <ul>
        ${checkoutLines
          .map((entry) => `<li>${escapeHtml(entry.product.name)} x ${entry.quantity}</li>`)
          .join("")}
      </ul>
      <div class="price">Total: ${formatPrice(total)}</div>
    </div>
    <form class="checkout-form" id="checkout-form">
      <label>
        Full name
        <input type="text" name="customerName" required />
      </label>
      <label>
        Phone number
        <input type="tel" name="phone" required />
      </label>
      <label>
        Address
        <textarea name="address" rows="3" required></textarea>
      </label>
      <label>
        Notes
        <textarea name="notes" rows="2" placeholder="Any delivery instructions?"></textarea>
      </label>
      <div class="modal-actions">
        <button class="btn btn-primary" type="submit">Place order</button>
      </div>
    </form>
  `;
  modal.hidden = false;
}

function openProductPage(productId) {
  window.location.href = `product.html?id=${productId}`;
}

function renderProductPage() {
  const detail = document.getElementById("product-detail");
  if (!detail) return;

  const params = new URLSearchParams(window.location.search);
  const productId = Number(params.get("id"));
  const product = getVisibleProducts().find((item) => item.id === productId);

  if (!product) {
    detail.innerHTML = '<p class="muted">Product not found.</p>';
    return;
  }

  const hasSale = product.salePrice != null && product.salePrice < product.price;
  const primaryImage = getProductImage(product, "primary");
  const secondaryImage = getProductImage(product, "secondary");
  const safeName = escapeHtml(product.name);
  const safeCategory = escapeHtml(product.category);
  const safeDescription = escapeHtml(product.description);
  const features = (product.features || product.tags || product.description || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  const stock = product.stock === "" || product.stock == null ? null : Number(product.stock);
  const stockLabel = stock == null ? "In stock" : stock > 0 ? `${stock} available` : "Out of stock";

  detail.innerHTML = `
    <div class="product-detail-grid">
      <div class="product-detail-media">
        <div class="product-media product-media-large">
          <div class="product-image-track">
            <img src="${escapeHtml(primaryImage)}" alt="${safeName}" />
            <img src="${escapeHtml(secondaryImage)}" alt="${safeName} preview" />
          </div>
        </div>
      </div>
      <div class="product-detail-copy">
        <p class="eyebrow">${safeCategory}</p>
        <h1>${safeName}</h1>
        <p>${safeDescription}</p>
        <div class="product-meta-row detail">
          <span>${escapeHtml(stockLabel)}</span>
          ${product.sku ? `<span>SKU: ${escapeHtml(product.sku)}</span>` : ""}
          ${product.deliveryFee ? `<span>Delivery: ${formatPrice(product.deliveryFee)}</span>` : ""}
        </div>
        <div class="price">${hasSale ? `<del>${formatPrice(product.price)}</del> ${formatPrice(product.salePrice)}` : formatPrice(product.price)}</div>
        <div class="qty-control">
          <button class="qty-btn" type="button" data-action="qty-dec">−</button>
          <span class="qty-value">1</span>
          <button class="qty-btn" type="button" data-action="qty-inc">+</button>
        </div>
        <div class="product-card-actions product-page-actions">
          <button class="btn btn-primary" type="button" data-action="buy" data-product-id="${product.id}">Buy now</button>
          <button class="btn btn-secondary" type="button" data-action="add" data-product-id="${product.id}">Add to cart</button>
        </div>
      </div>
    </div>
    <div class="product-info-grid">
      <section class="dashboard-card">
        <h2>Product features</h2>
        <ul class="clean-list">
          ${features.length ? features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("") : `<li>${safeDescription}</li>`}
        </ul>
      </section>
      <section class="dashboard-card">
        <h2>Delivery and returns</h2>
        <p class="muted">Nationwide delivery is available. Return requests are accepted within 7 days for unused products with original packaging.</p>
      </section>
    </div>
    <section class="section">
      <div class="section-header"><div><p class="eyebrow">Related</p><h2>You may also like</h2></div></div>
      <div id="related-products" class="product-grid"></div>
    </section>
  `;

  const related = getVisibleProducts()
    .filter((item) => item.id !== product.id && item.category === product.category)
    .slice(0, 3);
  renderProductCards(related, "related-products");
}

function closeModal() {
  const modal = document.getElementById("product-modal");
  if (modal) modal.hidden = true;
}

function getQuantityFromContext(element) {
  const container = element?.closest(".product-card, .product-detail-copy");
  const qtyValue = container?.querySelector(".qty-value");
  const parsed = Number(qtyValue?.textContent || 1);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function handleProductInteractions(event) {
  const card = event.target.closest(".product-card");
  const buyButton = event.target.closest("button[data-action='buy']");
  const addButton = event.target.closest("button[data-action='add']");
  const qtyIncButton = event.target.closest("button[data-action='qty-inc']");
  const qtyDecButton = event.target.closest("button[data-action='qty-dec']");
  const cartIncreaseButton = event.target.closest("button[data-action='cart-increase']");
  const cartDecreaseButton = event.target.closest("button[data-action='cart-decrease']");
  const cartRemoveButton = event.target.closest("button[data-action='cart-remove']");

  if (qtyIncButton) {
    const qtyValue = qtyIncButton.parentElement?.querySelector(".qty-value");
    if (qtyValue) {
      qtyValue.textContent = String(Number(qtyValue.textContent || 1) + 1);
    }
    return;
  }

  if (qtyDecButton) {
    const qtyValue = qtyDecButton.parentElement?.querySelector(".qty-value");
    if (qtyValue) {
      const current = Number(qtyValue.textContent || 1);
      qtyValue.textContent = String(Math.max(1, current - 1));
    }
    return;
  }

  if (cartDecreaseButton) {
    event.stopPropagation();
    updateCartQuantity(Number(cartDecreaseButton.dataset.productId), -1);
    return;
  }

  if (cartIncreaseButton) {
    event.stopPropagation();
    updateCartQuantity(Number(cartIncreaseButton.dataset.productId), 1);
    return;
  }

  if (cartRemoveButton) {
    event.stopPropagation();
    removeCartItem(Number(cartRemoveButton.dataset.productId));
    return;
  }

  if (buyButton) {
    event.stopPropagation();
    addToCart(Number(buyButton.dataset.productId), getQuantityFromContext(buyButton));
    window.location.href = "checkout.html";
    return;
  }

  if (addButton) {
    event.stopPropagation();
    addToCart(Number(addButton.dataset.productId), getQuantityFromContext(addButton));
    return;
  }

  if (card) {
    openProductPage(Number(card.dataset.productId));
  }
}

async function handleCheckoutSubmit(event) {
  event.preventDefault();
  const form = event.target.closest("#checkout-form");
  if (!form) return;

  const data = new FormData(form);
  const products = getVisibleProducts();
  const items = currentCheckoutItems
    .map((entry) => {
      const product = products.find((item) => item.id === Number(entry.id));
      if (!product) return null;
      const unitPrice = product.salePrice != null && product.salePrice < product.price ? product.salePrice : product.price;
      return {
        id: product.id,
        name: product.name,
        quantity: Number(entry.quantity || 1),
        price: unitPrice
      };
    })
    .filter(Boolean);

  if (!items.length) {
    showToast("Your cart is empty");
    window.location.href = "cart.html";
    return;
  }

  const order = {
    id: Date.now(),
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    customerName: data.get("customerName") || "",
    phone: data.get("phone") || "",
    address: data.get("address") || "",
    notes: data.get("notes") || "",
    status: "New",
    createdAt: new Date().toISOString()
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  await postRemoteOrder(order);
  saveCart([]);
  renderCart();
  renderCartPage();
  renderCheckoutPage();
  renderOrderConfirmation();
  showToast("Order placed successfully");
  closeModal();
  window.location.href = `order-confirmation.html?id=${order.id}`;
}

function renderStorefront() {
  applyBranding();
  applyStoreContent();
  renderProductPage();
  renderCatalog();
  renderSlider();
  updateCartCount();
  renderCart();
  renderCartPage();
  renderCheckoutPage();
  renderOrderConfirmation();
}

document.addEventListener("DOMContentLoaded", async () => {
  renderStorefront();
  const remoteLoaded = await loadRemoteStore();
  if (remoteLoaded) {
    renderStorefront();
  }

  attachCategoryFilter();
  initSlider();
  initMobileNav();

  const searchInput = document.getElementById("site-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      searchQuery = event.target.value;
      renderCatalog(selectedCategory, event.target.value);
    });
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.target.value.trim()) {
        window.location.href = `search.html?q=${encodeURIComponent(event.target.value.trim())}`;
      }
    });
  }

  const sortSelect = document.getElementById("product-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => renderCatalog(selectedCategory, searchQuery));
  }

  const cartToggle = document.getElementById("cart-toggle");
  const cartClose = document.getElementById("cart-close");
  const cartCheckout = document.getElementById("cart-checkout");

  if (cartToggle) {
    cartToggle.addEventListener("click", (event) => {
      event.preventDefault();
      renderCart();
      toggleCart(true);
    });
  }

  if (cartClose) {
    cartClose.addEventListener("click", () => toggleCart(false));
  }

  if (cartCheckout) {
    cartCheckout.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) {
        showToast("Your cart is empty");
        return;
      }
      toggleCart(false);
      window.location.href = "checkout.html";
    });
  }

  document.addEventListener("click", handleProductInteractions);
  document.addEventListener("submit", handleCheckoutSubmit);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-close-modal='true']")) closeModal();
    if (event.target.id === "cart-drawer") toggleCart(false);
  });
});

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) nav.classList.remove('open');
  });
}
