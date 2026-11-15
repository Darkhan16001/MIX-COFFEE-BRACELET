
"use strict";

/* =========================================
   MIX COFFEE BRACELET
   PREMIUM SHOP — 2026
========================================= */

const SUPABASE_URL =
  "https://zvancvqgwsqzrqestovd.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_ixGxOe65UcmtWQHW2Bxh5w_qZepizp2";

// Контакты. Instagram и TikTok замени
// на ссылки своего магазина.
const WHATSAPP = "77058038122";
const INSTAGRAM = "https://www.instagram.com/";
const TIKTOK = "https://www.tiktok.com/";

const $ = id => document.getElementById(id);

/* =========================================
   TRANSLATIONS
========================================= */

const TEXTS = {
  ru: {
    tagline: "Отборные кофейные зёрна 🤎",
    heroDescription: "Любовь к кофе — на твоём запястье.",
    explore: "Смотреть коллекции",
    collections: "Наши коллекции",
    choose: "Выберите коллекцию, чтобы посмотреть браслеты",
    classicShort: "Браслет на эластичной резинке",
    premiumShort: "Браслет на прочной нити",
    viewProducts: "Смотреть браслеты",
    classicDescription: "Коллекция Coffee Classic",
    premiumDescription: "Коллекция Coffee Premium",
    aboutTitle: "Элегантность в каждой детали",
    aboutText: "Браслеты, вдохновлённые эстетикой кофе: глубокие оттенки, утончённые детали и особенный характер.",
    add: "В корзину",
    cart: "Корзина",
    favorites: "Избранное",
    total: "Итого",
    order: "Заказать через WhatsApp",
    loading: "Загружаем браслеты...",
    empty: "Пока нет опубликованных браслетов.",
    error: "Не удалось загрузить каталог. Проверь подключение Supabase.",
    noPhotos: "Фотографии пока недоступны",
    emptyCart: "Корзина пуста",
    emptyFavorites: "В избранном пока пусто",
    added: "Добавлено в корзину",
    remove: "Удалить",
    count: "браслетов"
  },

  kz: {
    tagline: "Іріктелген кофе дәндері 🤎",
    heroDescription: "Кофеге деген махаббат – білегіңде.",
    explore: "Топтамаларды көру",
    collections: "Біздің топтамалар",
    choose: "Білезіктерді көру үшін топтаманы таңдаңыз",
    classicShort: "Серпімді резеңке жіптен жасалған білезік",
    premiumShort: "Берік жіптен жасалған білезік",
    viewProducts: "Білезіктерді көру",
    classicDescription: "Coffee Classic топтамасы",
    premiumDescription: "Coffee Premium топтамасы",
    aboutTitle: "Әр бөлшектегі әсемдік",
    aboutText: "Кофе эстетикасынан шабыт алған білезіктер: қанық реңктер, нәзік бөлшектер және ерекше стиль.",
    add: "Себетке қосу",
    cart: "Себет",
    favorites: "Таңдаулылар",
    total: "Барлығы",
    order: "WhatsApp арқылы тапсырыс беру",
    loading: "Білезіктер жүктелуде...",
    empty: "Әзірге жарияланған білезіктер жоқ.",
    error: "Каталог жүктелмеді. Supabase қосылымын тексеріңіз.",
    noPhotos: "Фотосуреттер қолжетімсіз",
    emptyCart: "Себет бос",
    emptyFavorites: "Таңдаулылар бос",
    added: "Себетке қосылды",
    remove: "Өшіру",
    count: "білезік"
  },

  en: {
    tagline: "Carefully Selected Coffee Beans 🤎",
    heroDescription: "Wear your love for coffee on your wrist.",
    explore: "Explore Collections",
    collections: "Our Collections",
    choose: "Select a collection to discover bracelets",
    classicShort: "Bracelet with an elastic cord",
    premiumShort: "Bracelet with a durable cord",
    viewProducts: "View Bracelets",
    classicDescription: "Coffee Classic Collection",
    premiumDescription: "Coffee Premium Collection",
    aboutTitle: "Elegance in Every Detail",
    aboutText: "Bracelets inspired by coffee aesthetics: rich shades, refined details and a distinctive character.",
    add: "Add to Cart",
    cart: "Shopping Cart",
    favorites: "Favorites",
    total: "Total",
    order: "Order via WhatsApp",
    loading: "Loading bracelets...",
    empty: "No published bracelets yet.",
    error: "Unable to load the catalog. Check your Supabase connection.",
    noPhotos: "Photos are unavailable",
    emptyCart: "Your cart is empty",
    emptyFavorites: "No favorites yet",
    added: "Added to cart",
    remove: "Remove",
    count: "bracelets"
  }
};

/* =========================================
   STORAGE
========================================= */

function readSaved(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Storage:", error);
  }
}

let language = readSaved("mix-language-v9", "ru");
if (!TEXTS[language]) language = "ru";

// Восстанавливаем корзину старого магазина.
let cart = readSaved(
  "mix-cart-v9",
  readSaved("mix-cart-v8", [])
);

let favorites = readSaved(
  "mix-favorites-v9",
  readSaved("mix-favorites-v8", [])
);

if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(favorites)) favorites = [];

let PRODUCTS = [];
let db = null;
let activeCategory = null;
let activePanel = null;
let loadState = "loading";

function t(key) {
  return TEXTS[language]?.[key] || key;
}

function money(value) {
  return new Intl.NumberFormat("ru-RU")
    .format(Number(value) || 0) + " ₸";
}

function getProduct(id) {
  return PRODUCTS.find(
    product => String(product.id) === String(id)
  );
}

function productName(category) {
  return category === "premium"
    ? "Coffee Premium"
    : "Coffee Classic";
}

function isFavorite(id) {
  return favorites.some(
    item => String(item) === String(id)
  );
}

/* =========================================
   LANGUAGE
========================================= */

function changeLanguage(value) {
  if (!TEXTS[value]) return;

  language = value;

  document.documentElement.lang =
    value === "kz" ? "kk" : value;

  save("mix-language-v9", value);

  document.querySelectorAll("[data-i18n]")
    .forEach(element => {
      const translation =
        TEXTS[value][element.dataset.i18n];

      if (translation !== undefined) {
        element.textContent = translation;
      }
    });

  document.querySelectorAll(".lang-btn")
    .forEach(button => {
      const selected = button.dataset.lang === value;

      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

  if (activeCategory) renderProducts();
  if (activePanel) renderPanel();
}

document.querySelectorAll(".lang-btn")
  .forEach(button => {
    button.addEventListener("click", () => {
      changeLanguage(button.dataset.lang);
    });
  });

/* =========================================
   OPEN / CLOSE COLLECTION
========================================= */

function openCategory(name) {
  if (!["classic", "premium"].includes(name)) return;

  if (activeCategory === name) {
    closeCategory();
    return;
  }

  activeCategory = name;
  $("products").hidden = false;

  document.querySelectorAll("[data-open]")
    .forEach(button => {
      const selected = button.dataset.open === name;

      button.classList.toggle("active", selected);
      button.setAttribute(
        "aria-expanded",
        String(selected)
      );
    });

  renderProducts();

  requestAnimationFrame(() => {
    $("products").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function closeCategory() {
  activeCategory = null;
  $("products").hidden = true;

  document.querySelectorAll("[data-open]")
    .forEach(button => {
      button.classList.remove("active");
      button.setAttribute("aria-expanded", "false");
    });
}

document.querySelectorAll("[data-open]")
  .forEach(button => {
    button.addEventListener("click", () => {
      openCategory(button.dataset.open);
    });
  });

$("closeProducts").addEventListener(
  "click",
  closeCategory
);

/* =========================================
   SUPABASE PRODUCTS
========================================= */

async function loadProducts() {
  loadState = "loading";

  try {
    if (!window.supabase) {
      throw new Error("Supabase library unavailable");
    }

    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    const { data, error } = await db
      .from("bracelets")
      .select(`
        id,
        category,
        price,
        published,
        bracelet_photos (
          id,
          image_url,
          position
        )
      `)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    PRODUCTS = (data || []).map(product => ({
      ...product,
      photos: [...(product.bracelet_photos || [])]
        .filter(photo => photo.image_url)
        .sort((a, b) =>
          Number(a.position || 0) -
          Number(b.position || 0)
        )
    }));

    loadState = "ready";

    renderCollectionCovers();

    if (activeCategory) renderProducts();
    if (activePanel) renderPanel();

    console.log(
      "MIX catalog loaded:",
      PRODUCTS.length,
      "products"
    );

  } catch (error) {
    console.error("MIX Supabase error:", error);

    loadState = "error";

    if (activeCategory) renderProducts();
  }
}

/* =========================================
   COLLECTION COVERS
========================================= */

function renderCollectionCovers() {
  for (const type of ["classic", "premium"]) {
    const element = $(
      type === "classic" ? "classicCover" : "premiumCover"
    );

    const product = PRODUCTS.find(p =>
      p.category === type && p.photos.length > 0
    );

    if (!element || !product) continue;

    const image = document.createElement("img");
    image.alt = productName(type);
    image.decoding = "async";
    image.src = product.photos[0].image_url;

    image.onerror = () => {
      image.remove();
    };

    element.replaceChildren(image);
  }
}

/* =========================================
   PHOTO GALLERY
========================================= */

function createGallery(product) {
  const gallery = document.createElement("div");
  gallery.className = "product-gallery";

  const track = document.createElement("div");
  track.className = "gallery-track";

  const photos = product.photos;
  let active = 0;

  if (photos.length === 0) {
    const placeholder = document.createElement("div");
    placeholder.className = "photo-placeholder";
    placeholder.textContent = t("noPhotos");
    track.append(placeholder);
  }

  photos.forEach((photo, index) => {
    const slide = document.createElement("div");
    slide.className = "gallery-slide";

    const image = document.createElement("img");
    image.src = photo.image_url;
    image.alt = `${productName(product.category)} ${index + 1}`;
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";

    image.onerror = () => {
      slide.replaceChildren();

      const fallback = document.createElement("div");
      fallback.className = "photo-placeholder";
      fallback.textContent = t("noPhotos");

      slide.append(fallback);
    };

    slide.append(image);
    track.append(slide);
  });

  gallery.append(track);

  if (photos.length > 1) {
    const prev = document.createElement("button");
    const next = document.createElement("button");
    const counter = document.createElement("div");

    prev.className = "gallery-nav gallery-prev";
    next.className = "gallery-nav gallery-next";
    counter.className = "gallery-counter";

    prev.textContent = "‹";
    next.textContent = "›";

    prev.setAttribute("aria-label", "Previous photo");
    next.setAttribute("aria-label", "Next photo");

    function updateCounter() {
      counter.textContent =
        `${active + 1} / ${photos.length}`;
    }

    function goToPhoto(index) {
      active = (index + photos.length) % photos.length;

      track.scrollTo({
        left: track.clientWidth * active,
        behavior: "smooth"
      });

      updateCounter();
    }

    prev.onclick = () => goToPhoto(active - 1);
    next.onclick = () => goToPhoto(active + 1);

    track.addEventListener("scroll", () => {
      active = Math.max(0, Math.min(
        photos.length - 1,
        Math.round(
          track.scrollLeft / (track.clientWidth || 1)
        )
      ));

      updateCounter();
    }, { passive: true });

    updateCounter();
    gallery.append(prev, next, counter);
  }

  const heart = document.createElement("button");
  heart.className = "favorite-btn";

  function refreshHeart() {
    const liked = isFavorite(product.id);
    heart.textContent = liked ? "♥" : "♡";
    heart.classList.toggle("active", liked);
  }

  heart.onclick = () => {
    toggleFavorite(product.id);
    refreshHeart();
  };

  refreshHeart();
  gallery.append(heart);

  return gallery;
}

/* =========================================
   PRODUCT CARDS
========================================= */

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const gallery = createGallery(product);

  const info = document.createElement("div");
  info.className = "product-info";

  const title = document.createElement("h3");
  title.textContent = productName(product.category);

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = money(product.price);

  const button = document.createElement("button");
  button.className = "add-to-cart";
  button.textContent = t("add");

  button.onclick = () => addToCart(product.id);

  info.append(title, price, button);
  card.append(gallery, info);

  return card;
}

function renderProducts() {
  if (!activeCategory) return;

  $("productsTitle").textContent =
    productName(activeCategory);

  $("categoryDescription").textContent =
    t(activeCategory + "Description");

  const grid = $("productGrid");
  const count = $("productCount");
  const empty = $("emptyMessage");

  grid.replaceChildren();
  empty.hidden = true;

  if (loadState === "loading") {
    count.textContent = t("loading");
    return;
  }

  if (loadState === "error") {
    count.textContent = t("error");
    empty.textContent = t("error");
    empty.hidden = false;
    return;
  }

  const visible = PRODUCTS.filter(
    product => product.category === activeCategory
  );

  count.textContent =
    `${visible.length} ${t("count")}`;

  visible.forEach(product => {
    grid.append(createProductCard(product));
  });

  if (visible.length === 0) {
    empty.textContent = t("empty");
    empty.hidden = false;
  }
}

/* =========================================
   FAVORITES
========================================= */

function toggleFavorite(id) {
  if (isFavorite(id)) {
    favorites = favorites.filter(
      item => String(item) !== String(id)
    );
  } else {
    favorites.push(id);
  }

  save("mix-favorites-v9", favorites);
  updateCounts();

  if (activePanel) renderPanel();
}

/* =========================================
   CART
========================================= */

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;

  const existing = cart.find(
    item => String(item.id) === String(id)
  );

  if (existing) {
    existing.quantity = Math.min(
      99,
      existing.quantity + 1
    );
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  showToast(t("added"));
}

function saveCart() {
  save("mix-cart-v9", cart);
  updateCounts();

  if (activePanel) renderPanel();
}

function changeQuantity(id, amount) {
  const row = cart.find(
    item => String(item.id) === String(id)
  );

  if (!row) return;

  row.quantity += amount;

  if (row.quantity <= 0) {
    cart = cart.filter(
      item => String(item.id) !== String(id)
    );
  } else {
    row.quantity = Math.min(row.quantity, 99);
  }

  saveCart();
}

function updateCounts() {
  $("cartCount").textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  $("favoritesCount").textContent = favorites.length;
}

function calculateTotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);

    return sum + (
      product
        ? Number(product.price) * item.quantity
        : 0
    );
  }, 0);
}

/* =========================================
   PANEL
========================================= */

function openPanel(type) {
  activePanel = type;

  $("panelBackdrop").hidden = false;
  $("sidePanel").classList.add("open");
  $("sidePanel").setAttribute("aria-hidden", "false");

  renderPanel();
}

function closePanel() {
  activePanel = null;

  $("panelBackdrop").hidden = true;
  $("sidePanel").classList.remove("open");
  $("sidePanel").setAttribute("aria-hidden", "true");
}

function renderPanel() {
  if (!activePanel) return;

  const isCart = activePanel === "cart";
  const container = $("panelItems");

  $("panelTitle").textContent =
    t(isCart ? "cart" : "favorites");

  $("panelFooter").hidden = !isCart;

  container.replaceChildren();

  const rows = isCart
    ? cart
    : favorites.map(id => ({ id, quantity: 1 }));

  const valid = rows.filter(
    item => getProduct(item.id)
  );

  if (valid.length === 0) {
    const message = document.createElement("p");

    message.textContent = t(
      isCart ? "emptyCart" : "emptyFavorites"
    );

    container.append(message);
  }

  valid.forEach(item => {
    const product = getProduct(item.id);

    const row = document.createElement("div");
    row.className = "panel-item";

    const title = document.createElement("strong");
    title.textContent = productName(product.category);

    const price = document.createElement("p");
    price.textContent = money(
      product.price * item.quantity
    );

    const remove = document.createElement("button");
    remove.textContent = t("remove");

    remove.onclick = () => {
      if (isCart) {
        cart = cart.filter(
          x => String(x.id) !== String(item.id)
        );
        saveCart();
      } else {
        toggleFavorite(item.id);
        if (activeCategory) renderProducts();
      }
    };

    row.append(title, price, remove);

    if (isCart) {
      const controls = document.createElement("div");
      controls.className = "quantity-controls";

      const minus = document.createElement("button");
      minus.textContent = "−";
      minus.onclick = () =>
        changeQuantity(item.id, -1);

      const amount = document.createElement("span");
      amount.textContent = item.quantity;

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.onclick = () =>
        changeQuantity(item.id, 1);

      controls.append(minus, amount, plus);
      row.append(controls);
    }

    container.append(row);
  });

  $("cartTotal").textContent = money(calculateTotal());
  updateOrderLink();
}

function updateOrderLink() {
  const lines = [
    "MIX COFFEE BRACELET",
    "",
    "Заказ:"
  ];

  cart.forEach(item => {
    const product = getProduct(item.id);
    if (!product) return;

    lines.push(
      `${productName(product.category)} × ${item.quantity} — ` +
      money(product.price * item.quantity)
    );
  });

  lines.push("");
  lines.push("Итого: " + money(calculateTotal()));

  const link = $("orderButton");

  link.href =
    "https://wa.me/" +
    WHATSAPP +
    "?text=" +
    encodeURIComponent(lines.join("\n"));

  link.textContent = t("order");

  link.style.opacity = cart.length ? "1" : ".5";
  link.style.pointerEvents =
    cart.length ? "auto" : "none";
}

/* =========================================
   TOAST
========================================= */

let toastTimer;

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* =========================================
   EVENTS
========================================= */

$("cartButton").addEventListener("click", () => {
  openPanel("cart");
});

$("favoritesButton").addEventListener("click", () => {
  openPanel("favorites");
});

$("closePanel").addEventListener("click", closePanel);

$("panelBackdrop").addEventListener(
  "click",
  closePanel
);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePanel();
});

/* =========================================
   START
========================================= */

function startStore() {
  $("instagramLink").href = INSTAGRAM;
  $("tiktokLink").href = TIKTOK;
  $("whatsappLink").href = "https://wa.me/" + WHATSAPP;

  // Товары не показываются сразу.
  closeCategory();

  changeLanguage(language);
  updateCounts();

  // Загружаем настоящие товары.
  loadProducts();
}

startStore();
