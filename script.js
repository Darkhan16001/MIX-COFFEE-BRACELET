
"use strict";

/* ==========================================
   MIX COFFEE BRACELET
   STORE SCRIPT
========================================== */

/* SUPABASE */

const SUPABASE_URL =
  "https://zvancvqgwsqzrqestovd.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_ixGxOe65UcmtWQHW2Bxh5w_qZepizp2";

/*
  Контакты магазина.

  Здесь нужно указать свои настоящие
  номер WhatsApp и ссылки на профили.

  Не вводи здесь Supabase Secret Key.
*/


const WHATSAPP_NUMBER = "77058038122";

const INSTAGRAM_URL =
  "https://www.instagram.com/mix_coffee_bracelet/";

const TIKTOK_URL =
  "https://www.tiktok.com/@mix_coffee_bracelet";


/* ==========================================
   ELEMENTS
========================================== */

const $ = id => document.getElementById(id);

const elements = {
  products: $("products"),
  productGrid: $("productGrid"),
  productsTitle: $("productsTitle"),
  categoryDescription: $("categoryDescription"),
  productCount: $("productCount"),
  emptyMessage: $("emptyMessage"),

  cartCount: $("cartCount"),
  favoritesCount: $("favoritesCount"),

  sidePanel: $("sidePanel"),
  panelBackdrop: $("panelBackdrop"),
  panelTitle: $("panelTitle"),
  panelItems: $("panelItems"),
  panelFooter: $("panelFooter"),
  cartTotal: $("cartTotal"),
  orderButton: $("orderButton"),

  toast: $("toast")
};

/* ==========================================
   TRANSLATIONS
========================================== */

const LANG = {

  ru: {
    tagline: "Отборные кофейные зёрна",
    heroDescription:
      "Любовь к кофе — на твоём запястье.",

    collections: "Наши коллекции",

    classicShort:
      "Браслет на эластичной резинке",

    premiumShort:
      "Браслет на прочной нити",

    viewProducts: "Посмотреть браслеты",

    classicDescription:
      "Коллекция Coffee Classic",

    premiumDescription:
      "Коллекция Coffee Premium",

    aboutTitle: "Красота в деталях",

    aboutText:
      "Кофейные браслеты с особенным характером. Сдержанная элегантность на каждый день.",

    cart: "Корзина",
    favorites: "Избранное",
    add: "В корзину",
    total: "Итого",
    order: "Заказать через WhatsApp",
    remove: "Удалить",

    loading: "Загрузка браслетов...",
    empty: "В этой коллекции пока нет товаров.",
    error: "Не удалось загрузить товары.",
    noPhotos: "Фото пока не добавлены",
    emptyCart: "Корзина пуста",
    emptyFavorites: "Избранное пусто",
    added: "Добавлено в корзину",
    contactMissing: "Укажите номер WhatsApp в script.js",
    productsCount: "браслетов"
  },

  kz: {
    tagline: "Іріктелген кофе дәндері",

    heroDescription:
      "Кофеге деген махаббат – білегіңде.",

    collections: "Біздің топтамалар",

    classicShort:
      "Серпімді резеңке жіптен жасалған білезік",

    premiumShort:
      "Берік жіптен жасалған білезік",

    viewProducts: "Білезіктерді көру",

    classicDescription:
      "Coffee Classic топтамасы",

    premiumDescription:
      "Coffee Premium топтамасы",

    aboutTitle: "Әсемдік әр бөлшекте",

    aboutText:
      "Ерекше кофелік білезіктер. Күнделікті сәнділік пен нәзік талғам.",

    cart: "Себет",
    favorites: "Таңдаулылар",
    add: "Себетке қосу",
    total: "Барлығы",
    order: "WhatsApp арқылы тапсырыс беру",
    remove: "Өшіру",

    loading: "Білезіктер жүктелуде...",
    empty: "Бұл топтамада әзірге тауар жоқ.",
    error: "Тауарларды жүктеу мүмкін болмады.",
    noPhotos: "Фото әлі қосылмаған",
    emptyCart: "Себет бос",
    emptyFavorites: "Таңдаулылар бос",
    added: "Себетке қосылды",
    contactMissing: "script.js ішінде WhatsApp нөмірін көрсетіңіз",
    productsCount: "білезік"
  },

  en: {
    tagline: "Carefully Selected Coffee Beans",

    heroDescription:
      "Wear your love for coffee on your wrist.",

    collections: "Our Collections",

    classicShort:
      "Bracelet with an elastic cord",

    premiumShort:
      "Bracelet with a durable cord",

    viewProducts: "View Bracelets",

    classicDescription:
      "Coffee Classic Collection",

    premiumDescription:
      "Coffee Premium Collection",

    aboutTitle: "Beauty in Every Detail",

    aboutText:
      "Distinctive coffee-inspired bracelets. Understated elegance for every day.",

    cart: "Cart",
    favorites: "Favorites",
    add: "Add to Cart",
    total: "Total",
    order: "Order via WhatsApp",
    remove: "Remove",

    loading: "Loading bracelets...",
    empty: "No products in this collection yet.",
    error: "Unable to load products.",
    noPhotos: "No photos available",
    emptyCart: "Your cart is empty",
    emptyFavorites: "No favorites yet",
    added: "Added to cart",
    contactMissing: "Set the WhatsApp number in script.js",
    productsCount: "bracelets"
  }
};

/* ==========================================
   STORAGE
========================================== */

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    return value === null
      ? fallback
      : JSON.parse(value);

  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.warn("Local storage:", error);
  }
}

/*
  Сохраняем совместимость с
  предыдущей версией магазина.
*/

let language = readStorage(
  "mix-language-v9",
  readStorage("mix-language-v8", "ru")
);

if (!LANG[language]) language = "ru";

let cart = readStorage(
  "mix-cart-v9",
  readStorage("mix-cart-v8", [])
);

let favorites = readStorage(
  "mix-favorites-v9",
  readStorage("mix-favorites-v8", [])
);

if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(favorites)) favorites = [];

/* ==========================================
   APP STATE
========================================== */

let PRODUCTS = [];
let db = null;

let currentCategory = null;
let currentPanel = null;

let loadingState = "loading";
let databaseError = null;

function t(key) {
  return LANG[language]?.[key] || key;
}

function money(amount) {
  return new Intl.NumberFormat("ru-RU")
    .format(Number(amount) || 0) + " ₸";
}

function getProduct(id) {
  return PRODUCTS.find(
    product => String(product.id) === String(id)
  );
}

function categoryTitle(category) {
  return category === "premium"
    ? "Coffee Premium"
    : "Coffee Classic";
}

function isFavorite(id) {
  return favorites.some(
    item => String(item) === String(id)
  );
}

function getPhotoUrl(product) {
  return product.photos?.[0]?.image_url || "";
}

/* ==========================================
   LANGUAGE
========================================== */

function changeLanguage(nextLanguage) {
  if (!LANG[nextLanguage]) return;

  language = nextLanguage;

  saveStorage("mix-language-v9", language);
  saveStorage("mix-language-v8", language);

  document.documentElement.lang =
    language === "kz" ? "kk" : language;

  document.querySelectorAll("[data-i18n]")
    .forEach(element => {
      const key = element.dataset.i18n;

      if (LANG[language][key] !== undefined) {
        element.textContent = t(key);
      }
    });

  document.querySelectorAll(".lang-btn")
    .forEach(button => {
      const active =
        button.dataset.lang === language;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

  $("cartButton").setAttribute(
    "aria-label",
    t("cart")
  );

  $("favoritesButton").setAttribute(
    "aria-label",
    t("favorites")
  );

  if (currentCategory) renderProducts();
  if (currentPanel) renderPanel();
}

document.querySelectorAll(".lang-btn")
  .forEach(button => {
    button.addEventListener("click", () => {
      changeLanguage(button.dataset.lang);
    });
  });

/* ==========================================
   CATEGORY SWITCHING
========================================== */

function openCategory(category) {
  if (!["classic", "premium"].includes(category)) {
    return;
  }

  // Повторное нажатие закрывает коллекцию
  if (currentCategory === category) {
    closeCategory();
    return;
  }

  currentCategory = category;

  elements.products.hidden = false;

  document.querySelectorAll("[data-open]")
    .forEach(button => {
      const active =
        button.dataset.open === category;

      button.classList.toggle("active", active);

      button.setAttribute(
        "aria-expanded",
        String(active)
      );
    });

  renderProducts();

  requestAnimationFrame(() => {
    elements.products.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function closeCategory() {
  currentCategory = null;

  elements.products.hidden = true;

  document.querySelectorAll("[data-open]")
    .forEach(button => {
      button.classList.remove("active");

      button.setAttribute(
        "aria-expanded",
        "false"
      );
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

/* ==========================================
   SUPABASE DATABASE
========================================== */

async function loadProducts() {
  loadingState = "loading";

  if (currentCategory) renderProducts();

  try {
    if (!window.supabase?.createClient) {
      throw new Error(
        "Supabase JavaScript library not loaded"
      );
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
      .order("created_at", {
        ascending: false
      });

    if (error) throw error;

    PRODUCTS = (data || []).map(product => {
      const images = Array.isArray(
        product.bracelet_photos
      )
        ? product.bracelet_photos
        : [];

      return {
        ...product,

        category: String(
          product.category || ""
        ).toLowerCase(),

        price: Number(product.price) || 0,

        photos: images
          .filter(photo => photo.image_url)
          .sort((a, b) =>
            Number(a.position || 0) -
            Number(b.position || 0)
          )
      };
    });

    loadingState = "ready";
    databaseError = null;

    renderCollectionCovers();

    updateCounts();

    if (currentCategory) renderProducts();
    if (currentPanel) renderPanel();

    console.info(
      "MIX COFFEE BRACELET:",
      PRODUCTS.length,
      "products loaded"
    );

  } catch (error) {
    loadingState = "error";
    databaseError = error;

    console.error(
      "Supabase catalog error:",
      databaseError
    );

    if (currentCategory) renderProducts();
    if (currentPanel) renderPanel();
  }
}

/* ==========================================
   COLLECTION COVER PHOTOS
========================================== */

function renderCollectionCovers() {
  for (const category of ["classic", "premium"]) {

    const element = $(
      category === "classic"
        ? "classicCover"
        : "premiumCover"
    );

    if (!element) continue;

    const product = PRODUCTS.find(item =>
      item.category === category &&
      item.photos.length > 0
    );

    // Если фото нет, звезда остаётся.
    if (!product) continue;

    const image = document.createElement("img");

    image.src = getPhotoUrl(product);
    image.alt = categoryTitle(category);
    image.decoding = "async";

    image.onerror = () => {
      image.remove();

      const symbol =
        document.createElement("span");

      symbol.className = "cover-symbol";
      symbol.textContent =
        category === "classic" ? "✦" : "✧";

      element.replaceChildren(symbol);
    };

    element.replaceChildren(image);
  }
}

/* ==========================================
   PHOTO GALLERY
========================================== */

function createGallery(product) {
  const gallery = document.createElement("div");
  gallery.className = "product-gallery";

  const track = document.createElement("div");
  track.className = "gallery-track";

  gallery.append(track);

  const photos = product.photos || [];
  let activePhoto = 0;

  if (photos.length === 0) {
    const placeholder =
      document.createElement("div");

    placeholder.className = "photo-placeholder";
    placeholder.textContent = t("noPhotos");

    track.append(placeholder);
  }

  photos.forEach((photo, index) => {
    const slide = document.createElement("div");
    slide.className = "gallery-slide";

    const image = document.createElement("img");

    image.src = photo.image_url;

    image.alt =
      categoryTitle(product.category) +
      " — " +
      (index + 1);

    image.loading = index === 0
      ? "eager"
      : "lazy";

    image.decoding = "async";

    image.onerror = () => {
      const placeholder =
        document.createElement("div");

      placeholder.className =
        "photo-placeholder";

      placeholder.textContent =
        t("noPhotos");

      slide.replaceChildren(placeholder);
    };

    slide.append(image);
    track.append(slide);
  });

  if (photos.length > 1) {
    const prev = document.createElement("button");
    const next = document.createElement("button");
    const counter = document.createElement("span");

    prev.type = "button";
    next.type = "button";

    prev.className =
      "gallery-nav gallery-prev";

    next.className =
      "gallery-nav gallery-next";

    counter.className = "gallery-counter";

    prev.textContent = "‹";
    next.textContent = "›";

    prev.setAttribute(
      "aria-label",
      "Предыдущая фотография"
    );

    next.setAttribute(
      "aria-label",
      "Следующая фотография"
    );

    function updateCounter() {
      counter.textContent =
        `${activePhoto + 1} / ${photos.length}`;
    }

    function goToPhoto(index) {
      activePhoto = (
        index + photos.length
      ) % photos.length;

      track.scrollTo({
        left: track.clientWidth * activePhoto,
        behavior: "smooth"
      });

      updateCounter();
    }

    prev.addEventListener("click", () => {
      goToPhoto(activePhoto - 1);
    });

    next.addEventListener("click", () => {
      goToPhoto(activePhoto + 1);
    });

    track.addEventListener("scroll", () => {
      const width = track.clientWidth || 1;

      activePhoto = Math.max(
        0,
        Math.min(
          photos.length - 1,
          Math.round(track.scrollLeft / width)
        )
      );

      updateCounter();

    }, { passive: true });

    updateCounter();
    gallery.append(prev, next, counter);
  }

  /* Favorite heart */

  const favorite = document.createElement("button");

  favorite.type = "button";
  favorite.className = "favorite-btn";

  function refreshFavorite() {
    const active = isFavorite(product.id);

    favorite.textContent =
      active ? "♥" : "♡";

    favorite.classList.toggle(
      "active",
      active
    );
  }

  favorite.addEventListener("click", () => {
    toggleFavorite(product.id);
    refreshFavorite();
  });

  refreshFavorite();

  gallery.append(favorite);

  return gallery;
}

/* ==========================================
   PRODUCT CARD
========================================== */

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const gallery = createGallery(product);

  const info = document.createElement("div");
  info.className = "product-info";

  const title = document.createElement("h3");
  title.textContent =
    categoryTitle(product.category);

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = money(product.price);

  const addButton = document.createElement("button");

  addButton.type = "button";
  addButton.className = "add-to-cart";
  addButton.textContent = t("add");

  addButton.addEventListener("click", () => {
    addToCart(product.id);
  });

  info.append(title, price, addButton);
  card.append(gallery, info);

  return card;
}

/* ==========================================
   RENDER PRODUCTS
========================================== */

function renderProducts() {
  if (!currentCategory) return;

  elements.productsTitle.textContent =
    categoryTitle(currentCategory);

  elements.categoryDescription.textContent =
    t(currentCategory + "Description");

  elements.productGrid.replaceChildren();

  elements.emptyMessage.hidden = true;

  if (loadingState === "loading") {
    elements.productCount.textContent =
      t("loading");
    return;
  }

  if (loadingState === "error") {
    elements.productCount.textContent = "";

    elements.emptyMessage.textContent =
      t("error");

    elements.emptyMessage.hidden = false;
    return;
  }

  const visible = PRODUCTS.filter(
    product => product.category === currentCategory
  );

  elements.productCount.textContent =
    `${visible.length} ${t("productsCount")}`;

  visible.forEach(product => {
    elements.productGrid.append(
      createProductCard(product)
    );
  });

  if (visible.length === 0) {
    elements.emptyMessage.textContent =
      t("empty");

    elements.emptyMessage.hidden = false;
  }
}

/* ==========================================
   FAVORITES
========================================== */

function toggleFavorite(id) {
  if (isFavorite(id)) {
    favorites = favorites.filter(
      item => String(item) !== String(id)
    );

  } else {
    favorites.push(id);
  }

  saveStorage("mix-favorites-v9", favorites);
  saveStorage("mix-favorites-v8", favorites);

  updateCounts();

  if (currentPanel) renderPanel();
}

/* ==========================================
   CART
========================================== */

function normalizeCart() {
  cart = cart
    .filter(item =>
      item &&
      item.id !== undefined &&
      item.id !== null
    )
    .map(item => ({
      id: item.id,

      quantity: Math.max(
        1,
        Math.min(
          99,
          Math.floor(
            Number(item.quantity) || 1
          )
        )
      )
    }));
}

normalizeCart();

function addToCart(id) {
  const product = getProduct(id);

  if (!product) return;

  const existing = cart.find(
    item => String(item.id) === String(id)
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
  showToast(t("added"));
}

function saveCart() {
  saveStorage("mix-cart-v9", cart);
  saveStorage("mix-cart-v8", cart);

  updateCounts();

  if (currentPanel) renderPanel();
}

function changeQuantity(id, amount) {
  const item = cart.find(
    row => String(row.id) === String(id)
  );

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(
      row => String(row.id) !== String(id)
    );
  } else {
    item.quantity = Math.min(
      99,
      item.quantity
    );
  }

  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(
    item => String(item.id) !== String(id)
  );

  saveCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);

    if (!product) return sum;

    return sum +
      product.price * item.quantity;
  }, 0);
}

function updateCounts() {
  elements.cartCount.textContent =
    cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

  elements.favoritesCount.textContent =
    favorites.length;
}

/* ==========================================
   PANEL
========================================== */

function openPanel(type) {
  currentPanel = type;

  elements.panelBackdrop.hidden = false;

  elements.sidePanel.classList.add("open");

  elements.sidePanel.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";

  renderPanel();
}

function closePanel() {
  currentPanel = null;

  elements.panelBackdrop.hidden = true;

  elements.sidePanel.classList.remove("open");

  elements.sidePanel.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";
}

function createPanelItem(item, isCart) {
  const product = getProduct(item.id);

  if (!product) return null;

  const row = document.createElement("div");
  row.className = "panel-item";

  const photoUrl = getPhotoUrl(product);

  if (photoUrl) {
    const img = document.createElement("img");

    img.className = "panel-item-photo";
    img.src = photoUrl;
    img.alt = categoryTitle(product.category);
    img.loading = "lazy";

    img.onerror = () => img.remove();

    row.append(img);
  }

  const body = document.createElement("div");
  body.className = "panel-item-body";

  const title = document.createElement("strong");
  title.textContent =
    categoryTitle(product.category);

  const price = document.createElement("p");
  price.textContent = money(
    product.price * item.quantity
  );

  const remove = document.createElement("button");

  remove.type = "button";
  remove.className = "remove-btn";
  remove.textContent = t("remove");

  remove.addEventListener("click", () => {
    if (isCart) {
      removeFromCart(item.id);

    } else {
      toggleFavorite(item.id);

      if (currentCategory) {
        renderProducts();
      }
    }
  });

  body.append(title, price, remove);

  if (isCart) {
    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";

    minus.addEventListener("click", () => {
      changeQuantity(item.id, -1);
    });

    const number = document.createElement("span");
    number.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";

    plus.addEventListener("click", () => {
      changeQuantity(item.id, 1);
    });

    controls.append(minus, number, plus);
    body.append(controls);
  }

  row.append(body);

  return row;
}

function renderPanel() {
  if (!currentPanel) return;

  const isCart = currentPanel === "cart";

  elements.panelTitle.textContent =
    t(isCart ? "cart" : "favorites");

  elements.panelFooter.hidden = !isCart;

  elements.panelItems.replaceChildren();

  const rows = isCart
    ? cart
    : favorites.map(id => ({
        id,
        quantity: 1
      }));

  const visible = rows.filter(
    item => getProduct(item.id)
  );

  if (visible.length === 0) {
    const message = document.createElement("p");

    message.textContent = t(
      isCart ? "emptyCart" : "emptyFavorites"
    );

    elements.panelItems.append(message);
  }

  visible.forEach(item => {
    const row = createPanelItem(item, isCart);

    if (row) {
      elements.panelItems.append(row);
    }
  });

  elements.cartTotal.textContent =
    money(cartTotal());

  updateOrderLink();
}

/* ==========================================
   WHATSAPP ORDER
========================================== */

function updateOrderLink() {
  const link = elements.orderButton;

  link.textContent = t("order");

  const phone = WHATSAPP_NUMBER.replace(/\D/g, "");

  if (!phone || cartTotal() === 0) {
    link.removeAttribute("href");

    link.setAttribute(
      "aria-disabled",
      "true"
    );

    return;
  }

  const lines = [
    "MIX COFFEE BRACELET",
    "",
    "Заказ:"
  ];

  cart.forEach(item => {
    const product = getProduct(item.id);

    if (!product) return;

    lines.push(
      `${categoryTitle(product.category)} × ${item.quantity} — ` +
      money(product.price * item.quantity)
    );
  });

  lines.push("");
  lines.push("Итого: " + money(cartTotal()));

  link.href =
    "https://wa.me/" +
    phone +
    "?text=" +
    encodeURIComponent(lines.join("\n"));

  link.removeAttribute("aria-disabled");
}

/* ==========================================
   NOTIFICATION
========================================== */

let toastTimer = null;

function showToast(message) {
  elements.toast.textContent = message;

  elements.toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2200);
}

/* ==========================================
   BUTTONS
========================================== */

$("cartButton").addEventListener("click", () => {
  openPanel("cart");
});

$("favoritesButton").addEventListener("click", () => {
  openPanel("favorites");
});

$("closePanel").addEventListener(
  "click",
  closePanel
);

elements.panelBackdrop.addEventListener(
  "click",
  closePanel
);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && currentPanel) {
    closePanel();
  }
});

/* ==========================================
   SOCIAL LINKS
========================================== */

function setupSocialLinks() {
  const links = [
    ["instagramLink", INSTAGRAM_URL],
    ["tiktokLink", TIKTOK_URL],
    [
      "whatsappLink",
      WHATSAPP_NUMBER
        ? "https://wa.me/" +
          WHATSAPP_NUMBER.replace(/\D/g, "")
        : ""
    ]
  ];

  links.forEach(([id, url]) => {
    const element = $(id);

    if (!element) return;

    if (url) {
      element.href = url;
    } else {
      element.hidden = true;
    }
  });
}

/* ==========================================
   START
========================================== */

function startStore() {
  closeCategory();

  changeLanguage(language);

  updateCounts();

  setupSocialLinks();

  loadProducts();
}

startStore();
