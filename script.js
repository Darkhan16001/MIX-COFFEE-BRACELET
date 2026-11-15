
"use strict";

// ========================================
// НАСТРОЙКИ МАГАЗИНА
// ========================================

// Вставь публичные данные из своего
// прежнего проекта Supabase.
// НЕ вставляй service_role или secret key.

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

// Контакты магазина
const INSTAGRAM_URL = "https://www.instagram.com/";
const TIKTOK_URL = "https://www.tiktok.com/";
const WHATSAPP_NUMBER = "77058038122";

// ========================================
// ПЕРЕВОДЫ
// ========================================

const TEXTS = {
  ru: {
    heroAccent: "Детали стиля.",
    tagline: "Отборные кофейные зёрна 🤎",
    heroDescription: "Любовь к кофе — на твоём запястье.",
    explore: "Смотреть коллекцию",
    collections: "Наши коллекции",
    collectionHint: "Выберите коллекцию, чтобы посмотреть браслеты.",
    classicShort: "Браслет на эластичной резинке",
    premiumShort: "Браслет на прочной нити",
    classicDescription: "Классический кофейный браслет на эластичной резинке.",
    premiumDescription: "Кофейный браслет на специальной прочной нити.",
    viewProducts: "Смотреть браслеты",
    aboutTitle: "Кофе в каждой детали",
    aboutText: "Украшения, вдохновлённые атмосферой кофе. Тёплые оттенки, особенный стиль и внимание к деталям.",
    add: "В корзину",
    cart: "Корзина",
    favorites: "Избранное",
    total: "Итого",
    order: "Заказать через WhatsApp",
    emptyProducts: "Пока нет опубликованных браслетов.",
    emptyCart: "Корзина пуста.",
    loading: "Загружаем браслеты...",
    loadError: "Не удалось загрузить товары.",
    added: "Добавлено в корзину",
    item: "браслетов"
  },

  kz: {
    heroAccent: "Стиль бөлшектері.",
    tagline: "Іріктелген кофе дәндері 🤎",
    heroDescription: "Кофеге деген махаббат – білегіңде.",
    explore: "Топтаманы көру",
    collections: "Біздің топтамалар",
    collectionHint: "Білезіктерді көру үшін топтаманы таңдаңыз.",
    classicShort: "Серпімді резеңке жіптен жасалған білезік",
    premiumShort: "Берік жіптен жасалған білезік",
    classicDescription: "Серпімді резеңке жіптен жасалған классикалық кофе білезігі.",
    premiumDescription: "Арнайы берік жіптен жасалған кофе білезігі.",
    viewProducts: "Білезіктерді көру",
    aboutTitle: "Әр бөлшектегі кофе",
    aboutText: "Кофе атмосферасынан шабыт алған әшекейлер. Жылы түстер, ерекше стиль және әр бөлшекке назар.",
    add: "Себетке қосу",
    cart: "Себет",
    favorites: "Таңдаулылар",
    total: "Барлығы",
    order: "WhatsApp арқылы тапсырыс беру",
    emptyProducts: "Әзірге білезіктер жарияланбаған.",
    emptyCart: "Себет бос.",
    loading: "Білезіктер жүктелуде...",
    loadError: "Тауарларды жүктеу мүмкін болмады.",
    added: "Себетке қосылды",
    item: "білезік"
  },

  en: {
    heroAccent: "Details of Style.",
    tagline: "Carefully Selected Coffee Beans 🤎",
    heroDescription: "Wear your love for coffee on your wrist.",
    explore: "Explore Collection",
    collections: "Our Collections",
    collectionHint: "Choose a collection to view bracelets.",
    classicShort: "Bracelet with an elastic cord",
    premiumShort: "Bracelet with a durable cord",
    classicDescription: "A classic coffee bracelet with a comfortable elastic cord.",
    premiumDescription: "A coffee bracelet made with a durable cord.",
    viewProducts: "View Bracelets",
    aboutTitle: "Coffee in Every Detail",
    aboutText: "Jewelry inspired by the atmosphere of coffee. Warm shades, unique style and attention to detail.",
    add: "Add to Cart",
    cart: "Shopping Cart",
    favorites: "Favorites",
    total: "Total",
    order: "Order via WhatsApp",
    emptyProducts: "No published bracelets yet.",
    emptyCart: "Your cart is empty.",
    loading: "Loading bracelets...",
    loadError: "Could not load products.",
    added: "Added to cart",
    item: "bracelets"
  }
};

const $ = id => document.getElementById(id);

function saved(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Storage unavailable", error);
  }
}

let language = saved("mix-language-v8", "ru");
if (!TEXTS[language]) language = "ru";

let PRODUCTS = [];
let loaded = false;
let currentCategory = null;
let panelMode = "cart";

let cart = saved("mix-cart-v8", []);
if (!Array.isArray(cart)) cart = [];

let favorites = saved("mix-favorites-v8", []);
if (!Array.isArray(favorites)) favorites = [];

let db = null;

function t(key) {
  return TEXTS[language]?.[key] || key;
}

function money(value) {
  return new Intl.NumberFormat("ru-RU")
    .format(value) + " ₸";
}

function getProduct(id) {
  return PRODUCTS.find(p => String(p.id) === String(id));
}

function categoryName(category) {
  return category === "premium"
    ? "Coffee Premium"
    : "Coffee Classic";
}

function notify(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

// ========================================
// ЗАГРУЗКА ТОВАРОВ ИЗ SUPABASE
// ========================================

async function loadProducts() {
  loaded = false;

  if (!db) {
    $("productCount").textContent =
      "Supabase не настроен";
    return;
  }

  $("productCount").textContent = t("loading");

  try {
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

    PRODUCTS = (data || []).map(product => {
      const photos = [...(product.bracelet_photos || [])]
        .filter(photo => photo.image_url)
        .sort((a, b) =>
          (a.position || 0) - (b.position || 0)
        );

      return {
        ...product,
        photos
      };
    });

    loaded = true;

    // Не показываем товары автоматически.
    if (currentCategory) {
      renderProducts();
    }

    renderCart();
  } catch (error) {
    console.error(error);
    $("productCount").textContent = t("loadError");
  }
}

// ========================================
// ОТКРЫТИЕ КОЛЛЕКЦИЙ
// ========================================

function openCategory(category) {
  if (!["classic", "premium"].includes(category)) {
    return;
  }

  // Если нажали на уже открытую коллекцию,
  // закрываем её.
  if (currentCategory === category) {
    closeCategory();
    return;
  }

  currentCategory = category;

  document.querySelectorAll("[data-open]")
    .forEach(button => {
      const active = button.dataset.open === category;

      button.classList.toggle("selected", active);
      button.setAttribute(
        "aria-expanded",
        String(active)
      );
    });

  $("products").hidden = false;

  $("productsTitle").textContent =
    categoryName(category);

  $("categoryDescription").textContent =
    t(category + "Description");

  renderProducts();

  // Плавно прокручиваем к выбранным товарам
  requestAnimationFrame(() => {
    $("products").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

function closeCategory() {
  currentCategory = null;
  $("products").hidden = true;

  document.querySelectorAll("[data-open]")
    .forEach(button => {
      button.classList.remove("selected");
      button.setAttribute("aria-expanded", "false");
    });
}

// ========================================
// ФОТОГРАФИИ И ТОВАРЫ
// ========================================

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const gallery = document.createElement("div");
  gallery.className = "product-gallery";

  const photos = product.photos || [];
  let photoIndex = 0;

  const image = document.createElement("img");
  image.alt = categoryName(product.category);
  image.loading = "lazy";
  image.decoding = "async";

  const placeholder = document.createElement("div");
  placeholder.className = "photo-placeholder";
  placeholder.textContent = "✦";

  function updateImage() {
    if (photos.length === 0) {
      image.hidden = true;
      placeholder.hidden = false;
      return;
    }

    image.hidden = false;
    image.src = photos[photoIndex].image_url;
  }

  image.addEventListener("error", () => {
    image.hidden = true;
    placeholder.hidden = false;
  });

  image.addEventListener("load", () => {
    placeholder.hidden = true;
    image.hidden = false;
  });

  gallery.append(placeholder, image);

  if (photos.length > 1) {
    const prev = document.createElement("button");
    prev.className = "gallery-arrow prev";
    prev.textContent = "‹";
    prev.setAttribute("aria-label", "Предыдущее фото");

    const next = document.createElement("button");
    next.className = "gallery-arrow next";
    next.textContent = "›";
    next.setAttribute("aria-label", "Следующее фото");

    prev.addEventListener("click", () => {
      photoIndex =
        (photoIndex - 1 + photos.length) % photos.length;
      updateImage();
    });

    next.addEventListener("click", () => {
      photoIndex = (photoIndex + 1) % photos.length;
      updateImage();
    });

    gallery.append(prev, next);
  }

  const favorite = document.createElement("button");
  favorite.className = "favorite-button";

  function updateFavoriteButton() {
    const liked = favorites.some(
      id => String(id) === String(product.id)
    );

    favorite.textContent = liked ? "♥" : "♡";
    favorite.classList.toggle("liked", liked);
  }

  favorite.addEventListener("click", () => {
    toggleFavorite(product.id);
    updateFavoriteButton();
  });

  updateFavoriteButton();
  gallery.append(favorite);
  updateImage();

  const info = document.createElement("div");
  info.className = "product-info";

  const title = document.createElement("h3");
  title.textContent = categoryName(product.category);

  const price = document.createElement("div");
  price.className = "product-price";
  price.textContent = money(product.price);

  const add = document.createElement("button");
  add.className = "add-button";
  add.textContent = t("add");

  add.addEventListener("click", () => {
    addToCart(product.id);
  });

  info.append(title, price, add);
  card.append(gallery, info);

  return card;
}

function renderProducts() {
  if (!currentCategory) return;

  const filtered = PRODUCTS.filter(
    product => product.category === currentCategory
  );

  const grid = $("productGrid");
  grid.replaceChildren();

  filtered.forEach(product => {
    grid.append(createProductCard(product));
  });

  $("productCount").textContent = loaded
    ? filtered.length + " " + t("item")
    : t("loading");

  $("emptyMessage").textContent = t("emptyProducts");
  $("emptyMessage").hidden =
    !loaded || filtered.length > 0;
}

// ========================================
// ИЗБРАННОЕ
// ========================================

function toggleFavorite(id) {
  const exists = favorites.some(
    item => String(item) === String(id)
  );

  if (exists) {
    favorites = favorites.filter(
      item => String(item) !== String(id)
    );
  } else {
    favorites.push(id);
  }

  store("mix-favorites-v8", favorites);
  updateCounters();

  if (panelMode === "favorites" &&
      $("cartPanel").classList.contains("open")) {
    renderCart();
  }
}

// ========================================
// КОРЗИНА
// ========================================

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;

  const item = cart.find(
    row => String(row.id) === String(id)
  );

  if (item) {
    item.quantity = Math.min(99, item.quantity + 1);
  } else {
    cart.push({ id, quantity: 1 });
  }

  store("mix-cart-v8", cart);
  updateCounters();
  notify(t("added"));
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
  }

  store("mix-cart-v8", cart);
  updateCounters();
  renderCart();
}

function updateCounters() {
  $("cartCount").textContent = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  $("favoritesCount").textContent = favorites.length;
}

function openPanel(mode) {
  panelMode = mode;

  $("cartTitle").textContent =
    mode === "favorites" ? t("favorites") : t("cart");

  $("cartPanel").classList.add("open");
  $("cartPanel").setAttribute("aria-hidden", "false");
  $("cartBackdrop").hidden = false;

  document.querySelector(".cart-bottom").hidden =
    mode === "favorites";

  renderCart();
}

function closeCart() {
  $("cartPanel").classList.remove("open");
  $("cartPanel").setAttribute("aria-hidden", "true");
  $("cartBackdrop").hidden = true;
}

function renderCart() {
  const container = $("cartItems");
  container.replaceChildren();

  const items = panelMode === "cart"
    ? cart.map(row => ({
        id: row.id,
        quantity: row.quantity
      }))
    : favorites.map(id => ({ id, quantity: 1 }));

  const valid = items.filter(
    item => getProduct(item.id)
  );

  if (!valid.length) {
    const text = document.createElement("p");
    text.textContent = t("emptyCart");
    container.append(text);
  }

  valid.forEach(item => {
    const product = getProduct(item.id);

    const row = document.createElement("div");
    row.className = "cart-item";

    const details = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = categoryName(product.category);

    const price = document.createElement("p");
    price.textContent = money(
      product.price * item.quantity
    );

    details.append(title, price);

    const controls = document.createElement("div");

    if (panelMode === "cart") {
      const minus = document.createElement("button");
      minus.textContent = "−";

      minus.onclick = () => {
        changeQuantity(product.id, -1);
      };

      const count = document.createElement("span");
      count.textContent = " " + item.quantity + " ";

      const plus = document.createElement("button");
      plus.textContent = "+";

      plus.onclick = () => {
        changeQuantity(product.id, 1);
      };

      controls.append(minus, count, plus);
    } else {
      const remove = document.createElement("button");
      remove.textContent = "✕";

      remove.onclick = () => {
        toggleFavorite(product.id);
        renderProducts();
      };

      controls.append(remove);
    }

    row.append(details, controls);
    container.append(row);
  });

  const total = cart.reduce((sum, item) => {
    const product = getProduct(item.id);

    return sum + (
      product ? product.price * item.quantity : 0
    );
  }, 0);

  $("totalPrice").textContent = money(total);

  updateWhatsAppOrder();
}

function updateWhatsAppOrder() {
  const lines = [
    "MIX COFFEE BRACELET",
    "",
    "Заказ:"
  ];

  cart.forEach(item => {
    const product = getProduct(item.id);
    if (!product) return;

    lines.push(
      categoryName(product.category) +
      " × " + item.quantity +
      " — " +
      money(product.price * item.quantity)
    );
  });

  const total = cart.reduce((sum, item) => {
    const p = getProduct(item.id);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  lines.push("");
  lines.push("Итого: " + money(total));

  const link = $("orderButton");

  link.href = "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" + encodeURIComponent(lines.join("\n"));

  link.textContent = t("order");
  link.style.pointerEvents = cart.length ? "auto" : "none";
  link.style.opacity = cart.length ? "1" : ".5";
}

// ========================================
// ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
// ========================================

function changeLanguage(value) {
  if (!TEXTS[value]) return;

  language = value;
  store("mix-language-v8", value);

  document.documentElement.lang =
    value === "kz" ? "kk" : value;

  document.querySelectorAll(".lang")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.lang === value
      );
    });

  document.querySelectorAll("[data-i18n]")
    .forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });

  if (currentCategory) {
    $("categoryDescription").textContent =
      t(currentCategory + "Description");

    renderProducts();
  }

  $("cartTitle").textContent =
    panelMode === "favorites" ? t("favorites") : t("cart");

  renderCart();
}

// ========================================
// КНОПКИ
// ========================================

document.querySelectorAll(".lang")
  .forEach(button => {
    button.addEventListener("click", () => {
      changeLanguage(button.dataset.lang);
    });
  });

document.querySelectorAll("[data-open]")
  .forEach(button => {
    button.addEventListener("click", () => {
      openCategory(button.dataset.open);
    });
  });

$("backButton").addEventListener("click", () => {
  closeCategory();

  $("collection").scrollIntoView({
    behavior: "smooth"
  });
});

$("favoritesButton").addEventListener("click", () => {
  openPanel("favorites");
});

$("cartButton").addEventListener("click", () => {
  openPanel("cart");
});

$("closeCart").addEventListener("click", closeCart);
$("cartBackdrop").addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

// ========================================
// ЗАПУСК МАГАЗИНА
// ========================================

async function startStore() {
  $("instagramLink").href = INSTAGRAM_URL;
  $("tiktokLink").href = TIKTOK_URL;
  $("whatsappLink").href =
    "https://wa.me/" + WHATSAPP_NUMBER;

  // Главное изменение:
  // товары не видны при открытии сайта.
  closeCategory();

  updateCounters();
  changeLanguage(language);

  if (
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_ANON_KEY.startsWith("YOUR_") &&
    window.supabase
  ) {
    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    await loadProducts();
  } else {
    console.warn(
      "Укажи публичный Supabase URL и anon key."
    );
  }
}

startStore();
