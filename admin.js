const ADMIN_STORAGE_KEY = "shopyar-admin-session";
const ADMIN_API_TOKEN_KEY = "shopyar-admin-api-token";
const PRODUCT_STORAGE_KEY = "shopyar-products";
const COLLECTION_STORAGE_KEY = "shopyar-collections";
const SLIDER_STORAGE_KEY = "shopyar-slider";
const ORDERS_STORAGE_KEY = "shopyar-orders";
const BRANDING_STORAGE_KEY = "shopyar-branding";
const STORE_CONTENT_STORAGE_KEY = "shopyar-store-content";
const DEFAULT_LOGO = "assets/logo.jpg";
const AUTH_API_URL = "/api/auth";
const STORE_API_URL = "/api/store";
const ORDERS_API_URL = "/api/orders";

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
  freeDeliveryMinimum: 8000,
  karachiDeliveryFee: 250,
  pakistanDeliveryFee: 500,
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
      saveStoreContent(defaultStoreContent);
      return defaultStoreContent;
    }
    return { ...defaultStoreContent, ...parsed };
  } catch (error) {
    return defaultStoreContent;
  }
}

function saveStoreContent(content) {
  localStorage.setItem(STORE_CONTENT_STORAGE_KEY, JSON.stringify(content));
}

function getAdminToken() {
  return localStorage.getItem(ADMIN_API_TOKEN_KEY) || "";
}

async function adminFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": getAdminToken(),
      ...(options.headers || {})
    }
  });
}

async function syncStoreToVercel(partialStore) {
  try {
    await adminFetch(STORE_API_URL, {
      method: "POST",
      body: JSON.stringify(partialStore)
    });
  } catch (error) {
    // Local preview keeps using localStorage when the Vercel API is unavailable.
  }
}

async function syncOrderStatusToVercel(id, status) {
  try {
    await adminFetch(ORDERS_API_URL, {
      method: "PUT",
      body: JSON.stringify({ id, status })
    });
  } catch (error) {
    // Local preview keeps using localStorage when the Vercel API is unavailable.
  }
}

function hydrateStoreFromRemote(store) {
  if (!store || typeof store !== "object") return;
  if (Array.isArray(store.products) && store.products.length) saveProducts(store.products);
  if (Array.isArray(store.collections)) saveCollections(store.collections);
  if (store.slider) saveSlider(store.slider);
  if (store.branding) saveBranding(store.branding);
  if (store.content) saveStoreContent(store.content);
}

async function loadRemoteAdminData() {
  try {
    const storeResponse = await fetch(STORE_API_URL, { cache: "no-store" });
    if (storeResponse.ok) hydrateStoreFromRemote(await storeResponse.json());

    const orderResponse = await adminFetch(ORDERS_API_URL, { cache: "no-store" });
    if (orderResponse.ok) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(await orderResponse.json()));
    }
  } catch (error) {
    // Local preview and missing KV should not block the admin dashboard.
  }
}

function getProducts() {
  const storedProducts = localStorage.getItem(PRODUCT_STORAGE_KEY);
  if (!storedProducts) {
    saveProducts(defaultProducts);
    return defaultProducts;
  }

  const products = JSON.parse(storedProducts);
  if (products[0]?.name === "Cedar Lounge Set") {
    saveProducts(defaultProducts);
    return defaultProducts;
  }
  return products;
}

function saveProducts(products) {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

function getCollections() {
  const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
  if (!stored) return ["Gadgets", "Home", "Kids", "Daily Use"];
  const collections = JSON.parse(stored);
  if (collections.includes("Fashion") && collections.includes("Accessories")) {
    const defaults = ["Gadgets", "Home", "Kids", "Daily Use"];
    saveCollections(defaults);
    return defaults;
  }
  return collections;
}

function saveCollections(collections) {
  localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collections));
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

function saveSlider(slider) {
  localStorage.setItem(SLIDER_STORAGE_KEY, JSON.stringify(slider));
}

function getOrders() {
  const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
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

function saveBranding(branding) {
  localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
}

function applyBrandingToPage() {
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

function renderBrandingForm() {
  const branding = getBranding();
  const logoInput = document.getElementById("branding-logo");
  const backgroundLogoInput = document.getElementById("branding-background-logo");
  const storeNameInput = document.getElementById("branding-store-name");
  const primaryColorInput = document.getElementById("branding-primary-color");
  const darkColorInput = document.getElementById("branding-dark-color");
  const softColorInput = document.getElementById("branding-soft-color");
  const previewLogo = document.getElementById("branding-preview-logo");

  if (storeNameInput) storeNameInput.value = branding.storeName || "Shopyar";
  if (logoInput) logoInput.value = branding.logo || "";
  if (backgroundLogoInput) backgroundLogoInput.value = branding.backgroundLogo || "";
  if (primaryColorInput) primaryColorInput.value = branding.primaryColor || "#2f7d53";
  if (darkColorInput) darkColorInput.value = branding.darkColor || "#1f5838";
  if (softColorInput) softColorInput.value = branding.softColor || "#cfe2d0";
  if (previewLogo) previewLogo.src = branding.logo || DEFAULT_LOGO;
}

function handleBrandingSubmit(event) {
  event.preventDefault();
  const branding = {
    storeName: document.getElementById("branding-store-name")?.value.trim() || "Shopyar",
    logo: document.getElementById("branding-logo")?.value.trim() || DEFAULT_LOGO,
    backgroundLogo: document.getElementById("branding-background-logo")?.value.trim() || DEFAULT_LOGO,
    primaryColor: document.getElementById("branding-primary-color")?.value || "#2f7d53",
    darkColor: document.getElementById("branding-dark-color")?.value || "#1f5838",
    softColor: document.getElementById("branding-soft-color")?.value || "#cfe2d0"
  };

  saveBranding(branding);
  syncStoreToVercel({ branding });
  renderBrandingForm();
  applyBrandingToPage();
}

function showView(view) {
  const loginView = document.getElementById("login-view");
  const dashboardView = document.getElementById("dashboard-view");

  if (!loginView || !dashboardView) return;

  const showLogin = view === "login";
  loginView.hidden = !showLogin;
  dashboardView.hidden = showLogin;
  document.body.classList.toggle("is-logged-out", showLogin);
  document.body.classList.toggle("is-logged-in", !showLogin);
}

function handleLogout() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_API_TOKEN_KEY);
  showView("login");

  if (!window.location.pathname.endsWith("/admin.html") && !window.location.pathname.endsWith("/admin")) {
    window.location.href = "admin.html";
  }
}

function normalizeGalleryImages(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value)
    .split(/\n|,/) 
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderProductList() {
  const productList = document.getElementById("product-list");
  if (!productList) return;

  const products = getProducts();
  if (!products.length) {
    productList.innerHTML = '<p class="muted">No products yet. Publish your first item above.</p>';
    return;
  }

  productList.innerHTML = products
    .map((product) => {
      const galleryImages = normalizeGalleryImages(product.gallery || product.images || product.image);
      const primaryImage = product.image || galleryImages[0] || "";
      const imagesMarkup = galleryImages.length
        ? `<div class="product-image-row">${galleryImages
            .slice(0, 4)
            .map((image) => `<img class="product-thumb" src="${escapeHtml(image)}" alt="${escapeHtml(product.name)}" />`)
            .join("")}</div>`
        : primaryImage
          ? `<div class="product-image-row"><img class="product-thumb" src="${escapeHtml(primaryImage)}" alt="${escapeHtml(product.name)}" /></div>`
          : "";

      return `
        <div class="product-item">
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <span class="muted">${escapeHtml(product.category)} - ${formatPrice(product.price)} - ${escapeHtml(product.status || "active")}${product.stock != null && product.stock !== "" ? ` - Stock ${escapeHtml(product.stock)}` : ""}</span>
            ${imagesMarkup}
          </div>
          <div class="product-item-actions">
            <button class="mini-btn" data-action="edit" data-id="${product.id}" type="button">Edit</button>
            <button class="mini-btn" data-action="delete" data-id="${product.id}" type="button">Delete</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderOrders() {
  const orderList = document.getElementById("order-list");
  const overviewOrders = document.getElementById("overview-orders");

  const orders = getOrders();
  const markup = orders.length
    ? orders
        .map((order, index) => {
          const items = Array.isArray(order.items) ? order.items : [];
          const itemSummary = items.length
            ? items.map((item) => `${escapeHtml(item.name)} x ${Number(item.quantity || 1)}`).join(", ")
            : escapeHtml(order.productName || "Product");
          const orderTotal = order.total || order.productPrice || 0;
          const subtotal = order.subtotal || orderTotal;
          const shippingFee = Number(order.shippingFee || 0);
          const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : "New order";
          const orderNumber = order.id || index + 1;

          return `
          <details class="product-item order-item" data-order-details>
            <summary class="order-summary-line">
              <span><strong>${index + 1}. Order #${escapeHtml(orderNumber)}</strong><small>${escapeHtml(createdAt)}</small></span>
              <b>${formatPrice(orderTotal)}</b>
            </summary>
            <div class="order-detail-grid">
              <div><span>Name:</span><strong>${escapeHtml(order.customerName || "Customer")}</strong></div>
              <div><span>Phone:</span><strong>${escapeHtml(order.phone || "")}</strong></div>
              <div><span>Contact:</span><strong>${escapeHtml(order.contact || "")}</strong></div>
              <div><span>News/offers:</span><strong>${order.marketingOptIn ? "Yes" : "No"}</strong></div>
              <div class="span-2"><span>Address:</span><strong>${escapeHtml(order.address || "")}</strong></div>
              <div class="span-2"><span>Items:</span><strong>${itemSummary}</strong></div>
              <div><span>Subtotal:</span><strong>${formatPrice(subtotal)}</strong></div>
              <div><span>Shipping:</span><strong>${shippingFee === 0 ? "Free" : formatPrice(shippingFee)}${order.shippingMethod ? ` (${escapeHtml(order.shippingMethod)})` : ""}</strong></div>
              <div><span>Total:</span><strong>${formatPrice(orderTotal)}</strong></div>
              <div><span>Billing:</span><strong>Same as shipping address</strong></div>
              ${order.freeDeliveryApplied ? `<div class="span-2"><span>Delivery:</span><strong>Free delivery applied</strong></div>` : ""}
              ${order.notes ? `<div class="span-2"><span>Note:</span><strong>${escapeHtml(order.notes)}</strong></div>` : ""}
              <div><span>Status:</span><select class="order-status-select" data-order-status="${order.id}">
                ${["New", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"].map((status) => `<option value="${status}" ${status === (order.status || "New") ? "selected" : ""}>${status}</option>`).join("")}
              </select></div>
              <div class="order-detail-actions"><button class="mini-btn" type="button" data-action="close-order">Close</button></div>
            </div>
          </details>
        `;
        })
        .join("")
    : '<p class="muted">No orders yet. Customer orders will appear here.</p>';

  if (orderList) orderList.innerHTML = markup;
  if (overviewOrders) overviewOrders.innerHTML = markup;
}

function getNewsSubscribers() {
  const seen = new Set();
  return getOrders()
    .filter((order) => order.marketingOptIn && String(order.contact || "").includes("@"))
    .map((order) => ({
      email: String(order.contact || "").trim(),
      name: order.customerName || "",
      phone: order.phone || "",
      orderId: order.id || "",
      createdAt: order.createdAt || ""
    }))
    .filter((subscriber) => {
      const key = subscriber.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function renderNewsEmails() {
  const list = document.getElementById("news-email-list");
  if (!list) return;

  const subscribers = getNewsSubscribers();
  list.innerHTML = subscribers.length
    ? subscribers
        .map((subscriber, index) => `
          <div class="product-item">
            <div>
              <strong>${index + 1}. ${escapeHtml(subscriber.email)}</strong>
              <span class="muted">${escapeHtml(subscriber.name || "Customer")} - ${escapeHtml(subscriber.phone || "No phone")} - Order #${escapeHtml(subscriber.orderId)}</span>
            </div>
          </div>
        `)
        .join("")
    : '<p class="muted">No news email opt-ins yet.</p>';
}

function exportNewsEmailsCsv() {
  const subscribers = getNewsSubscribers();
  const header = ["Serial", "Email", "Name", "Phone", "Order ID", "Created At"];
  const rows = subscribers.map((subscriber, index) => [
    index + 1,
    subscriber.email,
    subscriber.name,
    subscriber.phone,
    subscriber.orderId,
    subscriber.createdAt
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "shopyar-news-emails.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderCollections() {
  const collectionList = document.getElementById("collection-list");
  const collections = getCollections();

  renderCategoryOptions();

  if (collectionList) {
    collectionList.innerHTML = collections
      .map((collection, index) => `
        <div class="product-item">
          <strong>${escapeHtml(collection)}</strong>
          <button class="mini-btn" data-remove-collection="${index}" type="button">Remove</button>
        </div>
      `)
      .join("");
  }
}

function renderCategoryOptions(selectedValue = "") {
  const categorySelect = document.getElementById("product-category");
  if (!categorySelect) return;

  const collections = getCollections();
  const currentValue = selectedValue || categorySelect.value || collections[0] || "";

  categorySelect.innerHTML = collections
    .map((collection) => {
      const selected = collection === currentValue ? "selected" : "";
      return `<option value="${escapeHtml(collection)}" ${selected}>${escapeHtml(collection)}</option>`;
    })
    .join("");

  if (currentValue && !collections.includes(currentValue)) {
    categorySelect.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeHtml(currentValue)}" selected>${escapeHtml(currentValue)}</option>`
    );
  }
}

function renderOverviewProducts() {
  const overviewProducts = document.getElementById("overview-products");
  if (!overviewProducts) return;

  const products = getProducts();
  if (!products.length) {
    overviewProducts.innerHTML = '<p class="muted">No products yet. Add your first item to start selling.</p>';
    return;
  }

  overviewProducts.innerHTML = products
    .slice(0, 4)
    .map((product) => `
      <div class="product-item">
        <div>
          <strong>${escapeHtml(product.name)}</strong>
          <span class="muted">${escapeHtml(product.category)} - ${formatPrice(product.price)}</span>
        </div>
        <span class="product-badge">${product.popular ? "Popular" : "Active"}</span>
      </div>
    `)
    .join("");
}

function renderAdminMetrics() {
  const productMetric = document.getElementById("metric-products");
  const orderMetric = document.getElementById("metric-orders");
  const collectionMetric = document.getElementById("metric-collections");

  if (productMetric) productMetric.textContent = getProducts().length;
  if (orderMetric) orderMetric.textContent = getOrders().length;
  if (collectionMetric) collectionMetric.textContent = getCollections().length;
}

function renderSliderForm() {
  const slider = getSlider();
  const titleInput = document.getElementById("slider-title");
  const subtitleInput = document.getElementById("slider-subtitle");
  const imageInput = document.getElementById("slider-image");

  if (titleInput) titleInput.value = slider.title || "";
  if (subtitleInput) subtitleInput.value = slider.subtitle || "";
  if (imageInput) imageInput.value = slider.image || "";
}

function setInputValue(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = value || "";
}

function renderStoreContentForm() {
  const content = getStoreContent();

  setInputValue("content-hero-eyebrow", content.heroEyebrow);
  setInputValue("content-hero-title", content.heroTitle);
  setInputValue("content-hero-text", content.heroText);
  setInputValue("content-promo-eyebrow", content.promoEyebrow);
  setInputValue("content-promo-title", content.promoTitle);
  setInputValue("content-feature-eyebrow", content.featureEyebrow);
  setInputValue("content-feature-title", content.featureTitle);
  setInputValue("content-feature-text", content.featureText);
  setInputValue("content-cta-eyebrow", content.ctaEyebrow);
  setInputValue("content-cta-title", content.ctaTitle);
  setInputValue("content-footer-text", content.footerText);
  setInputValue("content-support-email", content.supportEmail);
  setInputValue("content-support-phone", content.supportPhone);
  setInputValue("content-whatsapp-number", content.whatsappNumber);
  setInputValue("content-shipping-text", content.shippingText);
  setInputValue("content-free-delivery-minimum", content.freeDeliveryMinimum);
  setInputValue("content-karachi-delivery-fee", content.karachiDeliveryFee);
  setInputValue("content-pakistan-delivery-fee", content.pakistanDeliveryFee);
  setInputValue("content-rating-text", content.ratingText);
  setInputValue("content-support-text", content.supportText);
}

function handleStoreContentSubmit(event) {
  event.preventDefault();

  const content = {
    heroEyebrow: document.getElementById("content-hero-eyebrow").value.trim(),
    heroTitle: document.getElementById("content-hero-title").value.trim(),
    heroText: document.getElementById("content-hero-text").value.trim(),
    promoEyebrow: document.getElementById("content-promo-eyebrow").value.trim(),
    promoTitle: document.getElementById("content-promo-title").value.trim(),
    featureEyebrow: document.getElementById("content-feature-eyebrow").value.trim(),
    featureTitle: document.getElementById("content-feature-title").value.trim(),
    featureText: document.getElementById("content-feature-text").value.trim(),
    ctaEyebrow: document.getElementById("content-cta-eyebrow").value.trim(),
    ctaTitle: document.getElementById("content-cta-title").value.trim(),
    footerText: document.getElementById("content-footer-text").value.trim(),
    supportEmail: document.getElementById("content-support-email").value.trim(),
    supportPhone: document.getElementById("content-support-phone").value.trim(),
    whatsappNumber: document.getElementById("content-whatsapp-number").value.trim(),
    shippingText: document.getElementById("content-shipping-text").value.trim(),
    freeDeliveryMinimum: Number(document.getElementById("content-free-delivery-minimum").value) || 0,
    karachiDeliveryFee: Number(document.getElementById("content-karachi-delivery-fee").value) || 0,
    pakistanDeliveryFee: Number(document.getElementById("content-pakistan-delivery-fee").value) || 0,
    ratingText: document.getElementById("content-rating-text").value.trim(),
    supportText: document.getElementById("content-support-text").value.trim()
  };

  saveStoreContent({ ...defaultStoreContent, ...content });
  syncStoreToVercel({ content: { ...defaultStoreContent, ...content } });
  renderStoreContentForm();
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const feedback = document.getElementById("login-feedback");

  try {
    const response = await fetch(AUTH_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    let data = {};
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      feedback.textContent = data.error || data.message || "Incorrect email or password.";
      return;
    }
    localStorage.setItem(ADMIN_STORAGE_KEY, "true");
    localStorage.setItem(ADMIN_API_TOKEN_KEY, data.token);
    await loadRemoteAdminData();
    showView("dashboard");
    renderProductList();
    renderOrders();
    renderCollections();
    renderCategoryOptions();
    renderOverviewProducts();
    renderAdminMetrics();
    renderSliderForm();
    renderStoreContentForm();
    renderNewsEmails();
    feedback.textContent = "Welcome back!";
  } catch (error) {
    feedback.textContent = "Admin auth API is not available. Check Vercel environment variables.";
  }
}

async function handlePasswordChange(event) {
  event.preventDefault();
  const currentPassword = document.getElementById("current-password")?.value || "";
  const newPassword = document.getElementById("new-password")?.value || "";
  const confirmPassword = document.getElementById("confirm-password")?.value || "";
  const feedback = document.getElementById("password-feedback");

  if (newPassword.length < 8) {
    if (feedback) feedback.textContent = "New password must be at least 8 characters.";
    return;
  }

  if (newPassword !== confirmPassword) {
    if (feedback) feedback.textContent = "New passwords do not match.";
    return;
  }

  try {
    const response = await adminFetch(AUTH_API_URL, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (feedback) feedback.textContent = data.error || "Password update failed.";
      return;
    }

    event.target.reset();
    if (feedback) feedback.textContent = "Password updated successfully.";
  } catch (error) {
    if (feedback) feedback.textContent = "Password update failed. Check Vercel auth API.";
  }
}

async function handleProductSubmit(event) {
  event.preventDefault();

  const productImageInput = document.getElementById("product-image-file");
  const galleryFilesInput = document.getElementById("product-gallery-files");
  const products = getProducts();
  const productId = document.getElementById("product-id").value;
  const galleryValue = document.getElementById("product-gallery")?.value || "";
  const galleryImages = normalizeGalleryImages(galleryValue);
  const primaryImageUrl = document.getElementById("product-image").value.trim();

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read image file"));
    reader.readAsDataURL(file);
  });

  let uploadedPrimaryImage = primaryImageUrl;
  let uploadedGalleryImages = [...galleryImages];

  if (productImageInput?.files?.length) {
    uploadedPrimaryImage = await readFileAsDataUrl(productImageInput.files[0]);
  }

  if (galleryFilesInput?.files?.length) {
    const uploadedFiles = Array.from(galleryFilesInput.files);
    const fileUrls = [];
    for (const file of uploadedFiles) {
      fileUrls.push(await readFileAsDataUrl(file));
    }
    uploadedGalleryImages = [...fileUrls, ...uploadedGalleryImages];
  }

  const productData = {
    name: document.getElementById("product-name").value.trim(),
    category: document.getElementById("product-category").value.trim(),
    price: Number(document.getElementById("product-price").value),
    salePrice: document.getElementById("product-sale-price").value
      ? Number(document.getElementById("product-sale-price").value)
      : null,
    image: uploadedPrimaryImage,
    gallery: uploadedGalleryImages,
    images: uploadedGalleryImages,
    sku: document.getElementById("product-sku")?.value.trim() || "",
    stock: document.getElementById("product-stock")?.value === "" ? null : Number(document.getElementById("product-stock")?.value),
    status: document.getElementById("product-status")?.value || "active",
    deliveryFee: document.getElementById("product-delivery-fee")?.value ? Number(document.getElementById("product-delivery-fee")?.value) : 0,
    tags: document.getElementById("product-tags")?.value.trim() || "",
    description: document.getElementById("product-description").value.trim(),
    popular: document.getElementById("product-popular").checked,
    featured: document.getElementById("product-featured")?.checked || false,
    badge: document.getElementById("product-popular").checked ? "Popular" : "New"
  };

  if (productId) {
    const index = products.findIndex((item) => item.id === Number(productId));
    if (index >= 0) {
      products[index] = { ...products[index], ...productData };
    }
  } else {
    products.unshift({ id: Date.now(), ...productData });
  }

  saveProducts(products);
  syncStoreToVercel({ products });
  renderProductList();
  renderOverviewProducts();
  renderAdminMetrics();
  resetProductForm();
}

function resetProductForm() {
  const productForm = document.getElementById("product-form");
  const productIdInput = document.getElementById("product-id");
  const formTitle = document.getElementById("product-form-title");
  const cancelEditButton = document.getElementById("cancel-edit-btn");
  const imageInput = document.getElementById("product-image-file");
  const galleryFilesInput = document.getElementById("product-gallery-files");

  if (productForm) productForm.reset();
  if (imageInput) imageInput.value = "";
  if (galleryFilesInput) galleryFilesInput.value = "";
  if (productIdInput) productIdInput.value = "";
  if (formTitle) formTitle.textContent = "Add a product";
  if (cancelEditButton) cancelEditButton.hidden = true;
  renderCategoryOptions();
}

function handleCollectionSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("collection-name").value.trim();
  if (!name) return;

  const collections = getCollections();
  if (!collections.includes(name)) {
    collections.push(name);
    saveCollections(collections);
    syncStoreToVercel({ collections });
    renderCollections();
    renderAdminMetrics();
  }

  event.target.reset();
}

function handleSliderSubmit(event) {
  event.preventDefault();
  const slider = {
    title: document.getElementById("slider-title").value.trim(),
    subtitle: document.getElementById("slider-subtitle").value.trim(),
    image: document.getElementById("slider-image").value.trim()
  };
  saveSlider(slider);
  syncStoreToVercel({ slider });
  renderSliderForm();
}

function handleDashboardClick(event) {
  const editButton = event.target.closest("button[data-action='edit']");
  const deleteButton = event.target.closest("button[data-action='delete']");
  const closeOrderButton = event.target.closest("button[data-action='close-order']");
  const removeCollectionButton = event.target.closest("button[data-remove-collection]");
  const exportNewsEmailsButton = event.target.closest("#export-news-emails");

  if (closeOrderButton) {
    const details = closeOrderButton.closest("details[data-order-details]");
    if (details) details.open = false;
    return;
  }

  if (exportNewsEmailsButton) {
    exportNewsEmailsCsv();
    return;
  }

  if (editButton) {
    const product = getProducts().find((item) => item.id === Number(editButton.dataset.id));
    if (!product) return;

    document.getElementById("product-id").value = product.id;
    const formTitle = document.getElementById("product-form-title");
    if (formTitle) formTitle.textContent = "Edit product";
    document.getElementById("product-name").value = product.name || "";
    renderCategoryOptions(product.category || "");
    document.getElementById("product-price").value = product.price || "";
    document.getElementById("product-sale-price").value = product.salePrice || "";
    document.getElementById("product-image").value = product.image || "";
    if (document.getElementById("product-gallery")) {
      const galleryValue = Array.isArray(product.gallery)
        ? product.gallery.join("\n")
        : Array.isArray(product.images)
          ? product.images.join("\n")
          : product.gallery || product.images || "";
      document.getElementById("product-gallery").value = galleryValue;
    }
    if (document.getElementById("product-sku")) document.getElementById("product-sku").value = product.sku || "";
    if (document.getElementById("product-stock")) document.getElementById("product-stock").value = product.stock ?? "";
    if (document.getElementById("product-status")) document.getElementById("product-status").value = product.status || "active";
    if (document.getElementById("product-delivery-fee")) document.getElementById("product-delivery-fee").value = product.deliveryFee || "";
    if (document.getElementById("product-tags")) document.getElementById("product-tags").value = product.tags || "";
    document.getElementById("product-description").value = product.description || "";
    document.getElementById("product-popular").checked = !!product.popular;
    if (document.getElementById("product-featured")) document.getElementById("product-featured").checked = !!product.featured;
    const cancelEditButton = document.getElementById("cancel-edit-btn");
    if (cancelEditButton) cancelEditButton.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (deleteButton) {
    const remaining = getProducts().filter((item) => item.id !== Number(deleteButton.dataset.id));
    saveProducts(remaining);
    syncStoreToVercel({ products: remaining });
    renderProductList();
    renderOverviewProducts();
    renderAdminMetrics();
  }

  if (removeCollectionButton) {
    const index = Number(removeCollectionButton.dataset.removeCollection);
    const collections = getCollections();
    collections.splice(index, 1);
    saveCollections(collections);
    syncStoreToVercel({ collections });
    renderCollections();
    renderAdminMetrics();
  }
}

function handleDashboardChange(event) {
  const orderStatusSelect = event.target.closest("select[data-order-status]");
  if (!orderStatusSelect) return;

  const orders = getOrders();
  const order = orders.find((item) => Number(item.id) === Number(orderStatusSelect.dataset.orderStatus));
  if (order) {
    order.status = orderStatusSelect.value;
    saveOrders(orders);
    syncOrderStatusToVercel(order.id, order.status);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.getElementById("login-form");
  const productForm = document.getElementById("product-form");
  const collectionForm = document.getElementById("collection-form");
  const sliderForm = document.getElementById("slider-form");
  const brandingForm = document.getElementById("branding-form");
  const storeContentForm = document.getElementById("store-content-form");
  const passwordForm = document.getElementById("password-form");
  const logoutButton = document.getElementById("logout-btn");
  const cancelEditButton = document.getElementById("cancel-edit-btn");
  const dashboard = document.getElementById("dashboard-view");

  applyBrandingToPage();
  renderBrandingForm();
  renderStoreContentForm();
  renderCategoryOptions();

  if (localStorage.getItem(ADMIN_STORAGE_KEY) && getAdminToken()) {
    await loadRemoteAdminData();
    showView("dashboard");
    renderProductList();
    renderOrders();
    renderCollections();
    renderCategoryOptions();
    renderOverviewProducts();
    renderAdminMetrics();
    renderSliderForm();
    renderStoreContentForm();
    renderNewsEmails();
  } else {
    showView("login");
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (productForm) {
    productForm.addEventListener("submit", handleProductSubmit);
  }

  if (collectionForm) {
    collectionForm.addEventListener("submit", handleCollectionSubmit);
  }

  if (sliderForm) {
    sliderForm.addEventListener("submit", handleSliderSubmit);
  }

  if (brandingForm) {
    brandingForm.addEventListener("submit", handleBrandingSubmit);
  }

  if (storeContentForm) {
    storeContentForm.addEventListener("submit", handleStoreContentSubmit);
  }

  if (passwordForm) {
    passwordForm.addEventListener("submit", handlePasswordChange);
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  if (cancelEditButton) {
    cancelEditButton.addEventListener("click", resetProductForm);
  }

  if (dashboard) {
    dashboard.addEventListener("click", handleDashboardClick);
    dashboard.addEventListener("change", handleDashboardChange);
  }
});
