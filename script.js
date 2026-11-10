
"use strict";

/* ================================
   1. АУДАРМАЛАР
================================ */

const TEXTS = {
  kz: {
    tagline: "Іріктелген кофе дәндері 🤎",
    heroDescription:
      "Кофе әрдайым жаныңда. Кофеге деген махаббат – білегіңде.",
    viewCollection: "Коллекцияны көру",
    collectionTitle: "Біздің коллекция",
    classicShort:
      "Серпімді резеңке жіптен жасалған білезік",
    premiumShort:
      "Арнайы берік жіптен жасалған білезік",
    classicDescription:
      "Классикалық кофе білезігі серпімді резеңке жіптен жасалған. Оны қолға оңай тағып, шешуге болады.",
    premiumDescription:
      "Классикалық кофе білезігі білезік жасауға арналған арнайы берік жіптен жасалған.",
    back: "← Артқа",
    productCount: "білезік",
    favorites: "Таңдаулылар",
    favoritesEmpty: "Таңдаулы тауарлар жоқ.",
    noProducts: "Тауарлар жоқ.",
    addFavorite: "Таңдаулыға қосу",
    removeFavorite: "Таңдаулыдан алу",
    addToCart: "Себетке қосу",
    cart: "Себет",
    cartEmpty: "Себет бос",
    total: "Жалпы сома",
    remove: "Өшіру",
    decrease: "Санын азайту",
    increase: "Санын көбейту",
    closeCart: "Себетті жабу",
    whatsappOrder: "WhatsApp арқылы тапсырыс беру",
    copyOrder: "Тізімді көшіру",
    copied: "Тапсырыс тізімі көшірілді!",
    copyError: "Көшіру мүмкін болмады.",
    photoMissing: "Фото табылмады"
  },

  ru: {
    tagline: "Отборные кофейные зёрна 🤎",
    heroDescription:
      "Кофе всегда рядом. Любовь к кофе — на твоём запястье.",
    viewCollection: "Смотреть коллекцию",
    collectionTitle: "Наша коллекция",
    classicShort: "Браслет на эластичной резинке",
    premiumShort:
      "Браслет на специальной прочной нити",
    classicDescription:
      "Классический кофейный браслет, выполненный на эластичной резинке, благодаря которой его удобно надевать и снимать.",
    premiumDescription:
      "Классический кофейный браслет выполнен на специальной прочной нити для изготовления браслетов.",
    back: "← Назад",
    productCount: "браслетов",
    favorites: "Избранное",
    favoritesEmpty: "Избранных товаров пока нет.",
    noProducts: "Товары отсутствуют.",
    addFavorite: "Добавить в избранное",
    removeFavorite: "Убрать из избранного",
    addToCart: "В корзину",
    cart: "Корзина",
    cartEmpty: "Корзина пуста",
    total: "Итого",
    remove: "Удалить",
    decrease: "Уменьшить количество",
    increase: "Увеличить количество",
    closeCart: "Закрыть корзину",
    whatsappOrder: "Заказать через WhatsApp",
    copyOrder: "Скопировать список",
    copied: "Список заказа скопирован!",
    copyError: "Не удалось скопировать.",
    photoMissing: "Фото не найдено"
  },

  en: {
    tagline: "Carefully Selected Coffee Beans 🤎",
    heroDescription:
      "Coffee is always with you. Wear your love for coffee on your wrist.",
    viewCollection: "Explore collection",
    collectionTitle: "Our collection",
    classicShort: "Bracelet with an elastic cord",
    premiumShort: "Bracelet with a special durable cord",
    classicDescription:
      "A classic coffee bracelet made with an elastic cord, making it easy and comfortable to put on and take off.",
    premiumDescription:
      "A classic coffee bracelet crafted with a special durable cord designed for bracelet making.",
    back: "← Back",
    productCount: "bracelets",
    favorites: "Favorites",
    favoritesEmpty: "No favorites yet.",
    noProducts: "No products available.",
    addFavorite: "Add to favorites",
    removeFavorite: "Remove from favorites",
    addToCart: "Add to cart",
    cart: "Cart",
    cartEmpty: "Your cart is empty",
    total: "Total",
    remove: "Remove",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    closeCart: "Close cart",
    whatsappOrder: "Order via WhatsApp",
    copyOrder: "Copy order",
    copied: "Order copied!",
    copyError: "Could not copy order.",
    photoMissing: "Photo not found"
  }
};

/* ================================
   2. БРАУЗЕР ЖАДЫ
================================ */

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);

    return raw === null
      ? fallback
      : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch {
    // LocalStorage бұғатталса да жұмыс істейді
  }
}

/* ================================
   3. САҚТАЛҒАН МӘЛІМЕТТЕР
================================ */

const savedLanguage =
  loadData("mix-language-v7", "kz");

let language = Object.prototype.hasOwnProperty.call(
  TEXTS,
  savedLanguage
) ? savedLanguage : "kz";

const validIds = new Set(
  PRODUCTS.map(product => product.id)
);

const savedFavorites =
  loadData("mix-favorites-v7", []);

const favorites = new Set(
  Array.isArray(savedFavorites)
    ? savedFavorites.filter(id => validIds.has(id))
    : []
);

const savedCart =
  loadData("mix-cart-v7", []);

let cart = [];

if (Array.isArray(savedCart)) {
  for (const item of savedCart) {
    if (
      item &&
      validIds.has(item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    ) {
      const existing = cart.find(
        row => row.id === item.id
      );

      if (existing) {
        existing.quantity = Math.min(
          99,
          existing.quantity + item.quantity
        );
      } else {
        cart.push({
          id: item.id,
          quantity: Math.min(99, item.quantity)
        });
      }
    }
  }
}

let currentView = "classic";
let cartOpen = false;
let lastFocusedElement = null;

/* ================================
   4. HTML ЭЛЕМЕНТТЕР
================================ */

const $ = id => document.getElementById(id);

const productsSection = $("products");
const productsTitle = $("productsTitle");
const categoryDescription = $("categoryDescription");
const categoryTabs = $("categoryTabs");
const productGrid = $("productGrid");
const productCount = $("productCount");
const emptyMessage = $("emptyMessage");

const favoritesButton = $("favoritesButton");
const favoritesCount = $("favoritesCount");

const cartButton = $("cartButton");
const cartCount = $("cartCount");
const cartPanel = $("cartPanel");
const cartBackdrop = $("cartBackdrop");
const cartItems = $("cartItems");

const totalPrice = $("totalPrice");
const orderWhatsApp = $("orderWhatsApp");
const copyOrderButton = $("copyOrder");
const cartMessage = $("cartMessage");

/* ================================
   5. КӨМЕКШІ ФУНКЦИЯЛАР
================================ */

function t(key) {
  return TEXTS[language][key] || key;
}

function getProduct(id) {
  return PRODUCTS.find(
    product => product.id === id
  );
}

function categoryName(category) {
  return category === "classic"
    ? "Coffee Classic"
    : "Coffee Premium";
}

function formatPrice(amount) {
  return new Intl.NumberFormat("ru-RU")
    .format(amount) + " ₸";
}

function scrollToSection(element) {
  element.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* ================================
   6. ФОТОЛАР
================================ */

function displayImage(container, product) {
  container.replaceChildren();

  if (!product) return;

  const img = document.createElement("img");

  img.src = product.image;
  img.alt = categoryName(product.category);
  img.loading = "lazy";
  img.decoding = "async";

  img.onerror = () => {
    const placeholder =
      document.createElement("span");

    placeholder.textContent =
      t("photoMissing");

    container.replaceChildren(placeholder);
  };

  container.appendChild(img);
}

function renderCollectionCovers() {
  displayImage(
    $("classicCover"),
    getProduct(COLLECTION_COVERS.classic)
  );

  displayImage(
    $("premiumCover"),
    getProduct(COLLECTION_COVERS.premium)
  );
}

/* ================================
   7. ТІЛ АУЫСТЫРУ
================================ */

function setLanguage(nextLanguage) {
  if (
    !Object.prototype.hasOwnProperty.call(
      TEXTS,
      nextLanguage
    )
  ) return;

  language = nextLanguage;
  saveData("mix-language-v7", language);

  document.documentElement.lang =
    language === "kz" ? "kk" : language;

  document.querySelectorAll("[data-i18n]")
    .forEach(element => {
      element.textContent = t(
        element.dataset.i18n
      );
    });

  document.querySelectorAll(".lang-btn")
    .forEach(button => {
      const active =
        button.dataset.lang === language;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

  favoritesButton.setAttribute(
    "aria-label",
    t("favorites")
  );

  cartButton.setAttribute(
    "aria-label",
    t("cart")
  );

  $("cartTitle").textContent = t("cart");
  $("totalLabel").textContent = t("total");

  $("closeCart").setAttribute(
    "aria-label",
    t("closeCart")
  );

  orderWhatsApp.textContent =
    t("whatsappOrder");

  copyOrderButton.textContent =
    t("copyOrder");

  cartMessage.textContent = "";

  renderCollectionCovers();
  renderProducts();
  renderCart();
}

/* ================================
   8. САНАУЫШТАР
================================ */

function updateCounters() {
  favoritesCount.textContent =
    favorites.size;

  cartCount.textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
}

/* ================================
   9. ТАУАР КАРТОЧКАСЫ
================================ */

function createProductCard(product) {
  const card =
    document.createElement("article");

  card.className = "product-card";

  const photo =
    document.createElement("div");

  photo.className = "product-photo";

  displayImage(photo, product);

  // FAVORITE
  const heart =
    document.createElement("button");

  heart.type = "button";
  heart.className = "favorite-btn";

  const liked = favorites.has(product.id);

  heart.textContent =
    liked ? "♥" : "♡";

  heart.classList.toggle("active", liked);

  heart.setAttribute(
    "aria-pressed",
    String(liked)
  );

  heart.setAttribute(
    "aria-label",
    liked ? t("removeFavorite") : t("addFavorite")
  );

  heart.addEventListener("click", () => {
    toggleFavorite(product.id);
  });

  photo.appendChild(heart);

  // PRICE
  const info =
    document.createElement("div");

  info.className = "product-info";

  const price =
    document.createElement("p");

  price.className = "product-price";
  price.textContent = formatPrice(product.price);

  // ADD TO CART
  const addButton =
    document.createElement("button");

  addButton.type = "button";
  addButton.className = "add-to-cart";
  addButton.textContent = t("addToCart");

  addButton.addEventListener("click", () => {
    addToCart(product.id);
  });

  // Жеке атау да, сипаттама да жоқ
  info.append(price, addButton);
  card.append(photo, info);

  return card;
}

/* ================================
   10. КОЛЛЕКЦИЯ
================================ */

function openCategory(category) {
  if (!["classic", "premium"].includes(category)) {
    return;
  }

  currentView = category;
  productsSection.hidden = false;

  renderProducts();
  scrollToSection(productsSection);
}

function openFavorites() {
  currentView = "favorites";
  productsSection.hidden = false;

  renderProducts();
  scrollToSection(productsSection);
}

/* ================================
   11. ТАҢДАУЛЫЛАР
================================ */

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }

  saveData(
    "mix-favorites-v7",
    [...favorites]
  );

  renderProducts();
}

/* ================================
   12. ӨНІМДЕРДІ ШЫҒАРУ
================================ */

function renderProducts() {
  const isFavorites =
    currentView === "favorites";

  productsTitle.textContent = isFavorites
    ? t("favorites")
    : categoryName(currentView);

  if (isFavorites) {
    categoryDescription.hidden = true;
    categoryDescription.textContent = "";
  } else {
    categoryDescription.hidden = false;

    categoryDescription.textContent =
      currentView === "classic"
        ? t("classicDescription")
        : t("premiumDescription");
  }

  categoryTabs.hidden = isFavorites;

  document.querySelectorAll(".category-tab")
    .forEach(button => {
      const active =
        button.dataset.category === currentView;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

  const visible = PRODUCTS.filter(product =>
    isFavorites
      ? favorites.has(product.id)
      : product.category === currentView
  );

  productGrid.replaceChildren();

  visible.forEach(product => {
    productGrid.appendChild(
      createProductCard(product)
    );
  });

  productCount.textContent =
    visible.length + " " + t("productCount");

  emptyMessage.textContent = isFavorites
    ? t("favoritesEmpty")
    : t("noProducts");

  emptyMessage.hidden = visible.length > 0;

  updateCounters();
}

/* ================================
   13. СЕБЕТ
================================ */

function saveCart() {
  saveData("mix-cart-v7", cart);
}

function addToCart(id) {
  if (!getProduct(id)) return;

  const existing = cart.find(
    item => item.id === id
  );

  if (existing) {
    existing.quantity = Math.min(
      existing.quantity + 1,
      99
    );
  } else {
    cart.push({
      id,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(id, delta) {
  const item = cart.find(
    row => row.id === id
  );

  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(
      row => row.id !== id
    );
  } else {
    item.quantity = Math.min(
      99,
      item.quantity
    );
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(
    item => item.id !== id
  );

  saveCart();
  renderCart();
}

function calculateTotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);

    return sum + (
      product
        ? product.price * item.quantity
        : 0
    );
  }, 0);
}

/* ================================
   14. WHATSAPP ТАПСЫРЫСЫ
================================ */

function buildOrderText() {
  const lines = [
    "🤎 MIX BRACELET",
    "",
    "Тапсырыс / Заказ",
    "━━━━━━━━━━━━━━━━"
  ];

  cart.forEach((item, index) => {
    const product = getProduct(item.id);
    if (!product) return;

    const photoUrl = new URL(
      product.image,
      document.baseURI
    ).href;

    lines.push("");
    lines.push(
      (index + 1) + ". " +
      categoryName(product.category)
    );

    lines.push(
      "Код / Код: " +
      product.id.toUpperCase()
    );

    lines.push(
      "Саны / Количество: " +
      item.quantity
    );

    lines.push(
      "Бағасы / Цена: " +
      formatPrice(product.price * item.quantity)
    );

    lines.push("📷 Фото:");
    lines.push(photoUrl);
    lines.push("");
    lines.push("━━━━━━━━━━━━━━━━");
  });

  lines.push("");
  lines.push(
    "💰 " + t("total") + ": " +
    formatPrice(calculateTotal())
  );

  return lines.join("\n");
}

function updateWhatsAppLink() {
  if (!cart.length) {
    orderWhatsApp.removeAttribute("href");
    orderWhatsApp.classList.add("disabled");

    orderWhatsApp.setAttribute(
      "aria-disabled",
      "true"
    );
    return;
  }

  orderWhatsApp.href =
    "https://wa.me/" +
    STORE.whatsapp +
    "?text=" +
    encodeURIComponent(buildOrderText());

  orderWhatsApp.classList.remove("disabled");

  orderWhatsApp.setAttribute(
    "aria-disabled",
    "false"
  );
}

/* ================================
   15. СЕБЕТТІ КӨРСЕТУ
================================ */

function renderCart() {
  cartItems.replaceChildren();

  if (!cart.length) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = t("cartEmpty");
    cartItems.appendChild(empty);
  }

  cart.forEach(item => {
    const product = getProduct(item.id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";

    const photo = document.createElement("div");
    photo.className = "cart-item-photo";
    displayImage(photo, product);

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const title = document.createElement("p");
    title.className = "cart-item-title";
    title.textContent = categoryName(product.category);

    const code = document.createElement("p");
    code.className = "cart-item-code";
    code.textContent = product.id.toUpperCase();

    const price = document.createElement("p");
    price.className = "cart-item-price";
    price.textContent = formatPrice(
      product.price * item.quantity
    );

    const quantityRow = document.createElement("div");
    quantityRow.className = "quantity-row";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "qty-btn";
    minus.textContent = "−";
    minus.setAttribute("aria-label", t("decrease"));

    minus.addEventListener("click", () => {
      changeQuantity(product.id, -1);
    });

    const amount = document.createElement("strong");
    amount.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "qty-btn";
    plus.textContent = "+";
    plus.setAttribute("aria-label", t("increase"));

    plus.addEventListener("click", () => {
      changeQuantity(product.id, 1);
    });

    quantityRow.append(minus, amount, plus);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-btn";
    remove.textContent = t("remove");

    remove.addEventListener("click", () => {
      removeFromCart(product.id);
    });

    info.append(
      title,
      code,
      price,
      quantityRow,
      remove
    );

    row.append(photo, info);
    cartItems.appendChild(row);
  });

  totalPrice.textContent =
    formatPrice(calculateTotal());

  copyOrderButton.disabled =
    cart.length === 0;

  updateWhatsAppLink();
  updateCounters();
}

/* ================================
   16. СЕБЕТТІ АШУ / ЖАБУ
================================ */

function openCart() {
  if (cartOpen) return;

  cartOpen = true;
  lastFocusedElement = document.activeElement;

  cartBackdrop.hidden = false;
  cartPanel.classList.add("open");

  cartPanel.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add("cart-open");
  $("closeCart").focus();
}

function closeCart() {
  if (!cartOpen) return;

  cartOpen = false;
  cartBackdrop.hidden = true;

  cartPanel.classList.remove("open");

  cartPanel.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove("cart-open");

  if (
    lastFocusedElement &&
    lastFocusedElement.isConnected
  ) {
    lastFocusedElement.focus();
  } else {
    cartButton.focus();
  }
}

/* ================================
   17. ТІЗІМДІ КӨШІРУ
================================ */

async function copyOrderText() {
  if (!cart.length) return;

  const text = buildOrderText();
  let success = false;

  try {
    if (!navigator.clipboard) {
      throw new Error("Clipboard unavailable");
    }

    await navigator.clipboard.writeText(text);
    success = true;
  } catch {
    const textarea =
      document.createElement("textarea");

    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    try {
      success = document.execCommand("copy");
    } catch {
      success = false;
    }

    textarea.remove();
  }

  cartMessage.textContent = success
    ? t("copied")
    : t("copyError");
}

/* ================================
   18. БАТЫРМАЛАР
================================ */

// ТІЛДЕР
document.querySelectorAll(".lang-btn")
  .forEach(button => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.lang);
    });
  });

// КОЛЛЕКЦИЯЛАР
document.querySelectorAll("[data-open-category]")
  .forEach(button => {
    button.addEventListener("click", () => {
      openCategory(button.dataset.openCategory);
    });
  });

// CLASSIC / PREMIUM
document.querySelectorAll(".category-tab")
  .forEach(button => {
    button.addEventListener("click", () => {
      openCategory(button.dataset.category);
    });
  });

// ТАҢДАУЛЫЛАР
favoritesButton.addEventListener(
  "click",
  openFavorites
);

// АРТҚА
$("backButton").addEventListener("click", () => {
  productsSection.hidden = true;
  scrollToSection($("collection"));
});

// СЕБЕТ
cartButton.addEventListener("click", openCart);

$("closeCart").addEventListener(
  "click",
  closeCart
);

cartBackdrop.addEventListener(
  "click",
  closeCart
);

// ESC / TAB
document.addEventListener("keydown", event => {
  if (!cartOpen) return;

  if (event.key === "Escape") {
    closeCart();
    return;
  }

  if (event.key !== "Tab") return;

  const focusable = [
    ...cartPanel.querySelectorAll(
      'button:not([disabled]), a[href]:not([aria-disabled="true"])'
    )
  ].filter(el => el.getClientRects().length > 0);

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (
    event.shiftKey &&
    document.activeElement === first
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    document.activeElement === last
  ) {
    event.preventDefault();
    first.focus();
  }
});

// ТАПСЫРЫСТЫ КӨШІРУ
copyOrderButton.addEventListener(
  "click",
  copyOrderText
);

/* ================================
   19. САЙТТЫ ІСКЕ ҚОСУ
================================ */

$("year").textContent =
  new Date().getFullYear();

setLanguage(language);
