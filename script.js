
"use strict";

/* ========================================
   MIX COFFEE BRACELET
   ОСНОВНОЙ СКРИПТ МАГАЗИНА
======================================== */

// Публичный ключ уже вставлен.
const SUPABASE_KEY =
  "sb_publishable_ixGxOe65UcmtWQHW2Bxh5w_qZepizp2";

// Неизвестен только адрес проекта.
// Если URL уже был указан в старом
// products.js, код попробует его взять.
const SUPABASE_URL =
  window.MIX_SUPABASE_URL ||
  window.SUPABASE_URL ||
  "";

// Контакты
const WHATSAPP_NUMBER = "77058038122";
const INSTAGRAM_URL = "https://www.instagram.com/";
const TIKTOK_URL = "https://www.tiktok.com/";

/* ========================================
   ПЕРЕВОДЫ
======================================== */

const TEXTS = {
  ru: {
    tagline: "Отборные кофейные зёрна 🤎",
    heroDescription: "Любовь к кофе — на твоём запястье.",
    explore: "Смотреть коллекцию",
    collections: "Наши коллекции",
    choose: "Выберите коллекцию, чтобы увидеть браслеты",
    classicShort: "Браслет на эластичной резинке",
    premiumShort: "Браслет на прочной нити",
    viewProducts: "Смотреть браслеты",
    classicDescription: "Коллекция Coffee Classic",
    premiumDescription: "Коллекция Coffee Premium",
    aboutTitle: "Кофе в каждой детали",
    aboutText: "Украшения, вдохновлённые атмосферой кофе. Особенный стиль и внимание к деталям.",
    add: "В корзину",
    cart: "Корзина",
    favorites: "Избранное",
    total: "Итого",
    order: "Заказать через WhatsApp",
    empty: "Пока нет опубликованных браслетов.",
    emptyCart: "Корзина пуста",
    emptyFavorites: "Избранное пусто",
    loading: "Загрузка браслетов...",
    error: "Не удалось загрузить товары. Проверь подключение Supabase.",
    noUrl: "Не указан Project URL Supabase.",
    added: "Добавлено в корзину",
    remove: "Удалить",
    quantity: "Количество",
    items: "браслетов"
  },

  kz: {
    tagline: "Іріктелген кофе дәндері 🤎",
    heroDescription: "Кофеге деген махаббат – білегіңде.",
    explore: "Топтаманы көру",
    collections: "Біздің топтамалар",
    choose: "Білезіктерді көру үшін топтаманы таңдаңыз",
    classicShort: "Серпімді резеңке жіптен жасалған білезік",
    premiumShort: "Берік жіптен жасалған білезік",
    viewProducts: "Білезіктерді көру",
    classicDescription: "Coffee Classic топтамасы",
    premiumDescription: "Coffee Premium топтамасы",
    aboutTitle: "Әр бөлшектегі кофе",
    aboutText: "Кофе атмосферасынан шабыт алған әшекейлер. Ерекше стиль және әр бөлшекке назар.",
    add: "Себетке қосу",
    cart: "Себет",
    favorites: "Таңдаулылар",
    total: "Барлығы",
    order: "WhatsApp арқылы тапсырыс беру",
    empty: "Әзірге білезіктер жарияланбаған.",
    emptyCart: "Себет бос",
    emptyFavorites: "Таңдаулылар бос",
    loading: "Білезіктер жүктелуде...",
    error: "Тауарларды жүктеу мүмкін болмады.",
    noUrl: "Supabase Project URL көрсетілмеген.",
    added: "Себетке қосылды",
    remove: "Өшіру",
    quantity: "Саны",
    items: "білезік"
  },

  en: {
    tagline: "Carefully Selected Coffee Beans 🤎",
    heroDescription: "Wear your love for coffee on your wrist.",
    explore: "Explore Collection",
    collections: "Our Collections",
    choose: "Choose a collection to view bracelets",
    classicShort: "Bracelet with an elastic cord",
    premiumShort: "Bracelet with a durable cord",
    viewProducts: "View Bracelets",
    classicDescription: "Coffee Classic Collection",
    premiumDescription: "Coffee Premium Collection",
    aboutTitle: "Coffee in Every Detail",
    aboutText: "Jewelry inspired by coffee. Unique style and attention to detail.",
    add: "Add to Cart",
    cart: "Shopping Cart",
    favorites: "Favorites",
    total: "Total",
    order: "Order via WhatsApp",
    empty: "No published bracelets yet.",
    emptyCart: "Your cart is empty",
    emptyFavorites: "No favorites yet",
    loading: "Loading bracelets...",
    error: "Unable to load products. Check Supabase.",
    noUrl: "Supabase Project URL is missing.",
    added: "Added to cart",
    remove: "Remove",
    quantity: "Quantity",
    items: "bracelets"
  }
};

/* ========================================
   ЭЛЕМЕНТЫ И ПАМЯТЬ
======================================== */

const $ = id => document.getElementById(id);

function readStorage(key, fallback) {
  try {
    return JSON.parse(
      localStorage.getItem(key)
    ) ?? fallback;
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
    console.warn("Storage:", error);
  }
}

let language = readStorage(
  "mix-language-v8",
  "ru"
);

if (!TEXTS[language]) {
  language = "ru";
}

let products = [];
let category = null;
let panelMode = null;
let status = "loading";
let errorKey = "error";

let cart = readStorage("mix-cart-v8", []);
let favorites = readStorage(
  "mix-favorites-v8",
  []
);

if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(favorites)) favorites = [];

let db = null;

function t(key) {
  return TEXTS[language]?.[key] || key;
}

function money(number) {
  return new Intl.NumberFormat("ru-RU")
    .format(Number(number) || 0) + " ₸";
}

function getProduct(id) {
  return products.find(
    p => String(p.id) === String(id)
  );
}

function categoryName(value) {
  return value === "premium"
    ? "Coffee Premium"
    : "Coffee Classic";
}

/* ========================================
   RU / KZ / EN
======================================== */

function changeLanguage(value) {
  if (!TEXTS[value]) return;

  language = value;
  document.documentElement.lang =
    value === "kz" ? "kk" : value;

  saveStorage(
    "mix-language-v8",
    value
  );

  document.querySelectorAll("[data-t]")
    .forEach(element => {
      const translated = TEXTS[value][
        element.dataset.t
      ];

      if (translated !== undefined) {
        element.textContent = translated;
      }
    });

  document.querySelectorAll(".lang-btn")
    .forEach(button => {
      const selected =
        button.dataset.lang === value;

      button.classList.toggle(
        "active",
        selected
      );

      button.setAttribute(
        "aria-pressed",
        String(selected)
      );
    });

  if (category) renderProducts();
  if (panelMode) renderPanel();
}

document.querySelectorAll(".lang-btn")
  .forEach(button => {
    button.addEventListener("click", () => {
      changeLanguage(button.dataset.lang);
    });
  });

/* ========================================
   CLASSIC / PREMIUM
======================================== */

function toggleCategory(value) {
  if (!["classic", "premium"].includes(value)) {
    return;
  }

  if (category === value) {
    closeCategory();
    return;
  }

  category = value;

  $("products").hidden = false;

  document.querySelectorAll("[data-open]")
    .forEach(button => {
      const selected =
        button.dataset.open === value;

      button.classList.toggle(
        "active",
        selected
      );

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
  category = null;
  $("products").hidden = true;

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
      toggleCategory(button.dataset.open);
    });
  });

$("closeProducts").addEventListener(
  "click",
  closeCategory
);

/* ========================================
   ГАЛЕРЕЯ ФОТОГРАФИЙ
======================================== */

function makeGallery(product) {
  const photos = product.photos || [];

  const gallery = document.createElement("div");
  gallery.className = "product-gallery";

  const track = document.createElement("div");
  track.className = "gallery-track";

  let active = 0;

  if (!photos.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "photo-placeholder";
    placeholder.textContent = "✦";
    track.append(placeholder);
  }

  photos.forEach((photo, index) => {
    const slide = document.createElement("div");
    slide.className = "gallery-slide";

    const img = document.createElement("img");
    img.src = photo.image_url;
    img.alt = categoryName(product.category);
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";

    img.onerror = () => {
      slide.replaceChildren();

      const fallback = document.createElement("div");
      fallback.className = "photo-placeholder";
      fallback.textContent = "✦";

      slide.append(fallback);
    };

    slide.append(img);
    track.append(slide);
  });

  gallery.append(track);

  if (photos.length > 1) {
    const prev = document.createElement("button");
    prev.className = "gallery-nav gallery-prev";
    prev.textContent = "‹";
    prev.setAttribute("aria-label", "Previous photo");

    const next = document.createElement("button");
    next.className = "gallery-nav gallery-next";
    next.textContent = "›";
    next.setAttribute("aria-label", "Next photo");

    const counter = document.createElement("div");
    counter.className = "gallery-counter";

    function updateCounter() {
      counter.textContent =
        `${active + 1} / ${photos.length}`;
    }

    function showPhoto(index) {
      active = (
        index + photos.length
      ) % photos.length;

      track.scrollTo({
        left: track.clientWidth * active,
        behavior: "smooth"
      });

      updateCounter();
    }

    prev.onclick = () => showPhoto(active - 1);
    next.onclick = () => showPhoto(active + 1);

    track.addEventListener("scroll", () => {
      const width = track.clientWidth || 1;

      active = Math.max(
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

  const favorite = document.createElement("button");
  favorite.className = "favorite-btn";

  const liked = favorites.some(
    id => String(id) === String(product.id)
  );

  favorite.textContent = liked ? "♥" : "♡";
  favorite.classList.toggle("active", liked);

  favorite.onclick = () => {
    toggleFavorite(product.id);
    favorite.textContent =
      isFavorite(product.id) ? "♥" : "♡";

    favorite.classList.toggle(
      "active",
      isFavorite(product.id)
    );
  };

  gallery.append(favorite);
  return gallery;
}

/* ========================================
   ТОВАРЫ
======================================== */

function renderProducts() {
  if (!category) return;

  $("productsTitle").textContent =
    categoryName(category);

  $("categoryDescription").textContent =
    t(category + "Description");

  const grid = $("productGrid");
  const count = $("productCount");
  const empty = $("emptyMessage");

  grid.replaceChildren();

  if (status === "loading") {
    count.textContent = t("loading");
    empty.hidden = true;
    return;
  }

  if (status === "error") {
    count.textContent = t(errorKey);
    empty.hidden = false;
    empty.textContent = t(errorKey);
    return;
  }

  const visible = products.filter(
    p => p.category === category
  );

  count.textContent =
    `${visible.length} ${t("items")}`;

  empty.hidden = visible.length > 0;
  empty.textContent = t("empty");

  visible.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const gallery = makeGallery(product);

    const info = document.createElement("div");
    info.className = "product-info";

    const name = document.createElement("h3");
    name.textContent =
      categoryName(product.category);

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = money(product.price);

    const add = document.createElement("button");
    add.className = "add-to-cart";
    add.textContent = t("add");

    add.onclick = () => addToCart(product.id);

    info.append(name, price, add);
    card.append(gallery, info);
    grid.append(card);
  });
}

/* ========================================
   SUPABASE
======================================== */

async function loadProducts() {
  status = "loading";

  if (category) renderProducts();

  if (!SUPABASE_URL) {
    status = "error";
    errorKey = "noUrl";

    console.error(
      "Supabase Project URL отсутствует."
    );

    if (category) renderProducts();
    return;
  }

  try {
    if (!window.supabase) {
      throw new Error(
        "Supabase SDK не загрузился"
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

    products = (data || []).map(product => ({
      ...product,

      photos: (product.bracelet_photos || [])
        .filter(photo => photo.image_url)
        .sort((a, b) =>
          Number(a.position || 0) -
          Number(b.position || 0)
        )
    }));

    status = "ready";
    errorKey = "";

    renderCovers();

    if (category) renderProducts();

    if (panelMode) renderPanel();

  } catch (error) {
    console.error(
      "Ошибка загрузки Supabase:",
      error
    );

    status = "error";
    errorKey = "error";

    if (category) renderProducts();
  }
}

/* ========================================
   ФОТО ОБЛОЖЕК КОЛЛЕКЦИЙ
======================================== */

function renderCovers() {
  for (const type of ["classic", "premium"]) {
    const cover = $(
      type === "classic"
        ? "classicCover"
        : "premiumCover"
    );

    const product = products.find(
      p => p.category === type &&
           p.photos.length > 0
    );

    if (!cover || !product) continue;

    const img = document.createElement("img");
    img.src = product.photos[0].image_url;
    img.alt = categoryName(type);

    img.onerror = () => {
      cover.replaceChildren();

      const fallback = document.createElement("span");
      fallback.textContent = "✦";

      cover.append(fallback);
    };

    cover.replaceChildren(img);
  }
}

/* ========================================
   ИЗБРАННОЕ
======================================== */

function isFavorite(id) {
  return favorites.some(
    item => String(item) === String(id)
  );
}

function toggleFavorite(id) {
  if (isFavorite(id)) {
    favorites = favorites.filter(
      item => String(item) !== String(id)
    );
  } else {
    favorites.push(id);
  }

  saveStorage(
    "mix-favorites-v8",
    favorites
  );

  updateCounts();

  if (panelMode) renderPanel();
}

/* ========================================
   КОРЗИНА
======================================== */

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
  saveStorage("mix-cart-v8", cart);
  updateCounts();

  if (panelMode) renderPanel();
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

function updateCounts() {
  $("cartCount").textContent =
    cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

  $("favoritesCount").textContent =
    favorites.length;
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = getProduct(item.id);

    return sum +
      (product
        ? product.price * item.quantity
        : 0);
  }, 0);
}

/* ========================================
   ПАНЕЛЬ
======================================== */

function openPanel(type) {
  panelMode = type;

  $("panelBackdrop").hidden = false;
  $("sidePanel").classList.add("open");

  $("sidePanel").setAttribute(
    "aria-hidden",
    "false"
  );

  renderPanel();
}

function closePanel() {
  panelMode = null;

  $("panelBackdrop").hidden = true;
  $("sidePanel").classList.remove("open");

  $("sidePanel").setAttribute(
    "aria-hidden",
    "true"
  );
}

function renderPanel() {
  if (!panelMode) return;

  const isCart = panelMode === "cart";

  $("panelTitle").textContent =
    t(isCart ? "cart" : "favorites");

  $("panelFooter").hidden = !isCart;

  const container = $("panelItems");
  container.replaceChildren();

  const rows = isCart
    ? cart
    : favorites.map(id => ({
        id,
        quantity: 1
      }));

  const valid = rows.filter(
    item => getProduct(item.id)
  );

  if (!valid.length) {
    const text = document.createElement("p");
    text.textContent = t(
      isCart ? "emptyCart" : "emptyFavorites"
    );
    container.append(text);
  }

  valid.forEach(item => {
    const product = getProduct(item.id);

    const card = document.createElement("div");
    card.className = "panel-item";

    const row = document.createElement("div");
    row.className = "panel-item-row";

    const details = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent =
      categoryName(product.category);

    const price = document.createElement("p");
    price.textContent = money(
      product.price * item.quantity
    );

    details.append(title, price);

    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.textContent = t("remove");

    remove.onclick = () => {
      if (isCart) {
        cart = cart.filter(
          p => String(p.id) !== String(product.id)
        );
        saveCart();
      } else {
        toggleFavorite(product.id);

        if (category) renderProducts();
      }
    };

    row.append(details, remove);
    card.append(row);

    if (isCart) {
      const controls = document.createElement("div");
      controls.className = "quantity-controls";

      const minus = document.createElement("button");
      minus.textContent = "−";
      minus.onclick = () =>
        changeQuantity(product.id, -1);

      const amount = document.createElement("strong");
      amount.textContent = item.quantity;

      const plus = document.createElement("button");
      plus.textContent = "+";
      plus.onclick = () =>
        changeQuantity(product.id, 1);

      controls.append(minus, amount, plus);
      card.append(controls);
    }

    container.append(card);
  });

  $("cartTotal").textContent = money(
    cartTotal()
  );

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
      categoryName(product.category) +
      " × " + item.quantity +
      " — " +
      money(product.price * item.quantity)
    );
  });

  lines.push("");
  lines.push("Итого: " + money(cartTotal()));

  const button = $("orderButton");

  button.href =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(lines.join("\n"));

  button.textContent = t("order");

  button.style.pointerEvents =
    cart.length ? "auto" : "none";

  button.style.opacity =
    cart.length ? "1" : ".5";
}

/* ========================================
   УВЕДОМЛЕНИЯ
======================================== */

let toastTimeout;

function showToast(message) {
  const toast = $("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

/* ========================================
   КНОПКИ
======================================== */

$("cartButton").onclick = () =>
  openPanel("cart");

$("favoritesButton").onclick = () =>
  openPanel("favorites");

$("closePanel").onclick = closePanel;
$("panelBackdrop").onclick = closePanel;

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closePanel();
  }
});

/* ========================================
   ЗАПУСК
======================================== */

function startStore() {
  $("instagramLink").href = INSTAGRAM_URL;
  $("tiktokLink").href = TIKTOK_URL;
  $("whatsappLink").href =
    "https://wa.me/" + WHATSAPP_NUMBER;

  // Сначала товары скрыты.
  closeCategory();

  // Кнопки языков работают независимо
  // от загрузки фотографий.
  changeLanguage(language);

  updateCounts();

  // Подключение товаров и фотографий.
  loadProducts();
}

startStore();
