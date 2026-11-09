
"use strict";

/* ==========================
   ҮШ ТІЛДЕГІ МӘТІНДЕР
========================== */

const TRANSLATIONS = {
  kz: {
    catalog: "Каталог",
    about: "Біз туралы",
    contact: "Байланыс",

    heroDescription:
      "Кофе әрдайым жаныңда. Кофеге деген махаббат – білегіңде.",

    explore: "Коллекцияны көру",
    learnMore: "Толығырақ",
    addPhoto: "Фото қосу",

    shopTitle: "Біздің коллекция",
    viewAll: "Барлығын көру",
    catalogTitle: "Білезіктер каталогы",

    all: "Барлығы",
    classic: "Классикалық",
    special: "Ерекше",
    favorites: "Таңдаулылар",

    noProducts: "Тауар табылмады.",
    search: "Білезік іздеу...",

    aboutTitle: "Кофеден шабыт алған әшекей",

    aboutText:
      "MIX COFFEE BRACELET — кофе атмосферасынан шабыт алған білезіктер дүкені. Біз күнделікті стильге ерекше көңіл күй сыйлайтын аксессуарларды ұсынамыз.",

    contactTitle: "Бізбен байланысыңыз",
    contactText: "Сұрақтарыңыз болса, бізге хабарласыңыз.",

    contactNote:
      "WhatsApp және Instagram байланыстары кейін қосылады.",

    footerText: "Кофеге деген махаббат – білегіңде.",

    productsCount: "тауар",
    categoryClassic: "Классикалық",
    categorySpecial: "Ерекше",

    addFavorite: "Таңдаулыға қосу",
    removeFavorite: "Таңдаулыдан алып тастау",

    addToCart: "Себетке қосу",
    cart: "Себет",
    cartEmpty: "Себет бос",
    total: "Жалпы сома",
    remove: "Өшіру",
    copyOrder: "Тапсырыс мәтінін көшіру",
    copied: "Тапсырыс мәтіні көшірілді!",
    copyFailed: "Көшіру мүмкін болмады.",
    cartLabel: "Себетті ашу"
  },

  ru: {
    catalog: "Каталог",
    about: "О нас",
    contact: "Контакты",

    heroDescription:
      "Кофе всегда рядом. Любовь к кофе — на твоём запястье.",

    explore: "Смотреть коллекцию",
    learnMore: "Подробнее",
    addPhoto: "Добавить фото",

    shopTitle: "Наша коллекция",
    viewAll: "Смотреть всё",
    catalogTitle: "Каталог браслетов",

    all: "Все",
    classic: "Классические",
    special: "Особенные",
    favorites: "Избранное",

    noProducts: "Товары не найдены.",
    search: "Поиск браслетов...",

    aboutTitle: "Украшения, вдохновлённые кофе",

    aboutText:
      "MIX COFFEE BRACELET — магазин браслетов, вдохновлённых атмосферой кофе. Мы предлагаем аксессуары, которые добавляют особенное настроение повседневному стилю.",

    contactTitle: "Свяжитесь с нами",
    contactText: "Если у вас есть вопросы, напишите нам.",

    contactNote:
      "Контакты WhatsApp и Instagram будут добавлены позже.",

    footerText: "Любовь к кофе — на твоём запястье.",

    productsCount: "товаров",
    categoryClassic: "Классические",
    categorySpecial: "Особенные",

    addFavorite: "Добавить в избранное",
    removeFavorite: "Убрать из избранного",

    addToCart: "В корзину",
    cart: "Корзина",
    cartEmpty: "Корзина пуста",
    total: "Итого",
    remove: "Удалить",
    copyOrder: "Скопировать заказ",
    copied: "Текст заказа скопирован!",
    copyFailed: "Не удалось скопировать.",
    cartLabel: "Открыть корзину"
  },

  en: {
    catalog: "Catalog",
    about: "About us",
    contact: "Contact",

    heroDescription:
      "Coffee is always with you. Wear your love for coffee on your wrist.",

    explore: "Explore collection",
    learnMore: "Learn more",
    addPhoto: "Add photo",

    shopTitle: "Our Collection",
    viewAll: "View all",
    catalogTitle: "Bracelet Collection",

    all: "All",
    classic: "Classic",
    special: "Special",
    favorites: "Favorites",

    noProducts: "No products found.",
    search: "Search bracelets...",

    aboutTitle: "Jewelry inspired by coffee",

    aboutText:
      "MIX COFFEE BRACELET is a bracelet store inspired by the atmosphere of coffee. We offer accessories that bring a special feeling to everyday style.",

    contactTitle: "Get in touch",
    contactText: "If you have any questions, contact us.",

    contactNote:
      "WhatsApp and Instagram contacts will be added later.",

    footerText: "Wear your love for coffee on your wrist.",

    productsCount: "products",
    categoryClassic: "Classic",
    categorySpecial: "Special",

    addFavorite: "Add to favorites",
    removeFavorite: "Remove from favorites",

    addToCart: "Add to cart",
    cart: "Cart",
    cartEmpty: "Your cart is empty",
    total: "Total",
    remove: "Remove",
    copyOrder: "Copy order",
    copied: "Order text copied!",
    copyFailed: "Could not copy the order.",
    cartLabel: "Open cart"
  }
};

/* ==========================
   САҚТАУ ЖҮЙЕСІ
========================== */

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Сақтау бұғатталса да сайт жұмыс істейді.
  }
}

const savedLanguage = readStorage("mix-language", "kz");

let currentLanguage =
  TRANSLATIONS[savedLanguage] ? savedLanguage : "kz";

let activeFilter = "all";
let searchQuery = "";

const savedFavorites = readStorage("mix-favorites", []);

let favorites = new Set(
  Array.isArray(savedFavorites)
    ? savedFavorites.filter(id =>
        PRODUCTS.some(product => product.id === id)
      )
    : []
);

const savedCart = readStorage("mix-cart", []);

let cart = Array.isArray(savedCart)
  ? savedCart
      .filter(item =>
        item &&
        PRODUCTS.some(product => product.id === item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      )
      .map(item => ({
        id: item.id,
        quantity: Math.min(item.quantity, 99)
      }))
  : [];

/* ==========================
   КӨМЕКШІ ФУНКЦИЯЛАР
========================== */

function t(key) {
  return TRANSLATIONS[currentLanguage][key] || key;
}

function formatPrice(price) {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₸";
}

function getProduct(id) {
  return PRODUCTS.find(product => product.id === id);
}

function saveCart() {
  writeStorage("mix-cart", cart);
}

function cartQuantity() {
  return cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);

    return sum + (
      product ? product.price * item.quantity : 0
    );
  }, 0);
}

/* ==========================
   ТІЛ АУЫСТЫРУ
========================== */

function setLanguage(language) {
  if (!TRANSLATIONS[language]) return;

  currentLanguage = language;
  writeStorage("mix-language", language);

  document.documentElement.lang =
    language === "kz" ? "kk" : language;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll(".lang-btn").forEach(button => {
    const selected = button.dataset.lang === language;

    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  const searchInput = document.getElementById("searchInput");
  searchInput.placeholder = t("search");
  searchInput.setAttribute("aria-label", t("search"));

  document.getElementById("cartTitle").textContent = t("cart");
  document.getElementById("cartTotalLabel").textContent = t("total");
  document.getElementById("checkoutBtn").textContent = t("copyOrder");

  document.getElementById("cartTrigger")
    .setAttribute("aria-label", t("cartLabel"));

  document.getElementById("checkoutStatus").textContent = "";

  renderFeatured();
  renderCatalog();
  renderCart();
}

/* ==========================
   ТАУАР КАРТОЧКАСЫ
========================== */

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const image = document.createElement("div");
  image.className = "product-image";

  const photoText = document.createElement("span");
  photoText.textContent = t("addPhoto");
  image.appendChild(photoText);

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = "favorite-button";

  const isFavorite = favorites.has(product.id);

  favoriteButton.textContent = isFavorite ? "♥" : "♡";
  favoriteButton.classList.toggle("is-favorite", isFavorite);

  favoriteButton.setAttribute(
    "aria-label",
    isFavorite ? t("removeFavorite") : t("addFavorite")
  );

  favoriteButton.setAttribute(
    "aria-pressed",
    String(isFavorite)
  );

  favoriteButton.addEventListener("click", () => {
    toggleFavorite(product.id);
  });

  image.appendChild(favoriteButton);

  const info = document.createElement("div");
  info.className = "product-info";

  const category = document.createElement("div");
  category.className = "product-category";

  category.textContent =
    product.category === "classic"
      ? t("categoryClassic")
      : t("categorySpecial");

  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = product.name[currentLanguage];

  const description = document.createElement("p");
  description.className = "product-description";
  description.textContent =
    product.description[currentLanguage];

  const price = document.createElement("strong");
  price.className = "product-price";
  price.textContent = formatPrice(product.price);

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "add-cart-btn";
  addButton.textContent = t("addToCart");

  addButton.addEventListener("click", () => {
    addToCart(product.id);
  });

  info.append(
    category,
    name,
    description,
    price,
    addButton
  );

  card.append(image, info);
  return card;
}

/* ==========================
   ТАҢДАУЛЫЛАР
========================== */

function toggleFavorite(productId) {
  if (favorites.has(productId)) {
    favorites.delete(productId);
  } else {
    favorites.add(productId);
  }

  writeStorage("mix-favorites", [...favorites]);

  renderFeatured();
  renderCatalog();
}

/* ==========================
   SHOP ЖӘНЕ КАТАЛОГ
========================== */

function renderFeatured() {
  const container = document.getElementById("featuredProducts");
  container.replaceChildren();

  PRODUCTS.slice(0, 3).forEach(product => {
    container.appendChild(createProductCard(product));
  });
}

function renderCatalog() {
  const container = document.getElementById("catalogProducts");
  const count = document.getElementById("productCount");
  const empty = document.getElementById("emptyMessage");

  const filtered = PRODUCTS.filter(product => {
    const categoryMatches =
      activeFilter === "all" ||
      (activeFilter === "favorites"
        ? favorites.has(product.id)
        : product.category === activeFilter);

    const searchableText = [
      ...Object.values(product.name),
      ...Object.values(product.description)
    ].join(" ").toLowerCase();

    return categoryMatches &&
      searchableText.includes(searchQuery);
  });

  container.replaceChildren();

  filtered.forEach(product => {
    container.appendChild(createProductCard(product));
  });

  count.textContent =
    filtered.length + " " + t("productsCount");

  empty.hidden = filtered.length > 0;
}

/* ==========================
   СЕБЕТКЕ ҚОСУ
========================== */

function addToCart(productId) {
  if (!getProduct(productId)) return;

  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + 1);
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  openCart();
}

/* ==========================
   ТАУАР САНЫН ӨЗГЕРТУ
========================== */

function changeQuantity(productId, change) {
  const item = cart.find(entry => entry.id === productId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(entry => entry.id !== productId);
  } else {
    item.quantity = Math.min(item.quantity, 99);
  }

  saveCart();
  renderCart();
}

/* ==========================
   СЕБЕТТЕН ӨШІРУ
========================== */

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);

  saveCart();
  renderCart();
}

/* ==========================
   СЕБЕТТІ КӨРСЕТУ
========================== */

function renderCart() {
  const container = document.getElementById("cartItems");
  const count = document.getElementById("cartCount");
  const total = document.getElementById("cartTotal");
  const checkout = document.getElementById("checkoutBtn");

  count.textContent = cartQuantity();
  total.textContent = formatPrice(cartTotal());
  checkout.disabled = cart.length === 0;

  container.replaceChildren();

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = t("cartEmpty");

    container.appendChild(empty);
    return;
  }

  cart.forEach(item => {
    const product = getProduct(item.id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";

    const photo = document.createElement("div");
    photo.className = "cart-item-photo";
    photo.textContent = t("addPhoto");

    const details = document.createElement("div");
    details.className = "cart-item-details";

    const name = document.createElement("h3");
    name.textContent = product.name[currentLanguage];

    const price = document.createElement("p");
    price.textContent = formatPrice(product.price);

    const controls = document.createElement("div");
    controls.className = "cart-quantity";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Decrease quantity");

    minus.addEventListener("click", () => {
      changeQuantity(product.id, -1);
    });

    const quantity = document.createElement("strong");
    quantity.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Increase quantity");

    plus.addEventListener("click", () => {
      changeQuantity(product.id, 1);
    });

    controls.append(minus, quantity, plus);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.textContent = t("remove");

    remove.addEventListener("click", () => {
      removeFromCart(product.id);
    });

    details.append(name, price, controls, remove);
    row.append(photo, details);
    container.appendChild(row);
  });
}

/* ==========================
   СЕБЕТТІ АШУ / ЖАБУ
========================== */

const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const cartTrigger = document.getElementById("cartTrigger");
const closeCartButton = document.getElementById("closeCart");

let cartIsOpen = false;

function openCart() {
  cartIsOpen = true;

  cartOverlay.hidden = false;
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");

  document.body.classList.add("cart-open");

  requestAnimationFrame(() => {
    cartOverlay.classList.add("open");
  });

  closeCartButton.focus();
}

function closeCart() {
  if (!cartIsOpen) return;

  cartIsOpen = false;

  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  cartOverlay.classList.remove("open");

  document.body.classList.remove("cart-open");

  cartTrigger.focus();

  setTimeout(() => {
    if (!cartIsOpen) {
      cartOverlay.hidden = true;
    }
  }, 300);
}

cartTrigger.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (!cartIsOpen) return;

  if (event.key === "Escape") {
    closeCart();
  }

  if (event.key === "Tab") {
    const focusable = [
      ...cartPanel.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled])'
      )
    ].filter(element => element.getClientRects().length > 0);

    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  }
});

/* ==========================
   ТАПСЫРЫС МӘТІНІН КӨШІРУ
========================== */

function buildOrderText() {
  const lines = [
    "MIX COFFEE BRACELET",
    "------------------------"
  ];

  cart.forEach(item => {
    const product = getProduct(item.id);
    if (!product) return;

    lines.push(
      `${product.name[currentLanguage]} × ${item.quantity} — ` +
      formatPrice(product.price * item.quantity)
    );
  });

  lines.push("------------------------");
  lines.push(`${t("total")}: ${formatPrice(cartTotal())}`);

  return lines.join("\n");
}

async function copyOrder() {
  if (!cart.length) return;

  const status = document.getElementById("checkoutStatus");
  const orderText = buildOrderText();

  try {
    await navigator.clipboard.writeText(orderText);
    status.textContent = t("copied");
  } catch {
    // Ескі браузерлерге арналған балама.
    const textarea = document.createElement("textarea");
    textarea.value = orderText;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    let copied = false;

    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    textarea.remove();

    status.textContent =
      copied ? t("copied") : t("copyFailed");
  }
}

document.getElementById("checkoutBtn")
  .addEventListener("click", copyOrder);

/* ==========================
   СҮЗГІЛЕР
========================== */

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter-btn").forEach(item => {
      item.classList.toggle("active", item === button);
    });

    renderCatalog();
  });
});

/* ==========================
   ІЗДЕУ
========================== */

document.getElementById("searchInput")
  .addEventListener("input", event => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderCatalog();
  });

/* ==========================
   ТІЛ БАТЫРМАЛАРЫ
========================== */

document.querySelectorAll(".lang-btn").forEach(button => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

/* ==========================
   ЖОҒАРЫ ҚАЙТУ
========================== */

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  backToTop.classList.toggle(
    "visible",
    window.scrollY > 500
  );
}, { passive: true });

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

/* ==========================
   САЙТТЫ ІСКЕ ҚОСУ
========================== */

document.getElementById("year").textContent =
  new Date().getFullYear();

setLanguage(currentLanguage);
