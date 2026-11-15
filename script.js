
"use strict";

/* ==========================================
   MIX COFFEE BRACELET
   ОРИГИНАЛЬНЫЙ МАГАЗИН
   CLASSIC / PREMIUM / SUPABASE
========================================== */

const $ = id => document.getElementById(id);

const WHATSAPP = "77058038122";

/* ==========================================
   ТРИ ЯЗЫКА
========================================== */

const TEXTS = {
  ru: {
    tagline: "Отборные кофейные зёрна 🤎",
    heroDescription: "Любовь к кофе — на твоём запястье.",
    explore: "Смотреть коллекцию",
    collections: "Наши коллекции",
    classicShort: "Браслет на эластичной резинке",
    premiumShort: "Браслет на прочной нити",
    classicDescription: "Классический кофейный браслет на эластичной резинке.",
    premiumDescription: "Кофейный браслет на прочной нити.",
    viewProducts: "Смотреть браслеты",
    back: "← Назад",
    add: "В корзину",
    total: "Итого",
    order: "Заказать через WhatsApp",
    copy: "Скопировать заказ",
    copied: "Заказ скопирован",
    cart: "Корзина",
    emptyCart: "Корзина пуста",
    emptyProducts: "Пока нет опубликованных браслетов.",
    favorites: "Избранное",
    emptyFavorites: "Избранных товаров пока нет.",
    loading: "Загружаем браслеты...",
    loadError: "Ошибка загрузки товаров",
    remove: "Удалить",
    photo: "Фото",
    item: "браслетов",
    close: "Закрыть"
  },

  kz: {
    tagline: "Іріктелген кофе дәндері 🤎",
    heroDescription: "Кофеге деген махаббат – білегіңде.",
    explore: "Коллекцияны көру",
    collections: "Біздің коллекция",
    classicShort: "Серпімді резеңке жіптен жасалған білезік",
    premiumShort: "Арнайы берік жіптен жасалған білезік",
    classicDescription: "Серпімді жіптен жасалған кофе білезігі.",
    premiumDescription: "Арнайы берік жіптен жасалған кофе білезігі.",
    viewProducts: "Білезіктерді көру",
    back: "← Артқа",
    add: "Себетке қосу",
    total: "Жалпы сома",
    order: "WhatsApp арқылы тапсырыс беру",
    copy: "Тапсырысты көшіру",
    copied: "Тапсырыс көшірілді",
    cart: "Себет",
    emptyCart: "Себет бос",
    emptyProducts: "Әзірге білезіктер жарияланбаған.",
    favorites: "Таңдаулылар",
    emptyFavorites: "Таңдаулы тауарлар жоқ.",
    loading: "Білезіктер жүктелуде...",
    loadError: "Тауарларды жүктеу қатесі",
    remove: "Өшіру",
    photo: "Фото",
    item: "білезік",
    close: "Жабу"
  },

  en: {
    tagline: "Carefully Selected Coffee Beans 🤎",
    heroDescription: "Wear your love for coffee on your wrist.",
    explore: "Explore collections",
    collections: "Our collections",
    classicShort: "Bracelet with an elastic cord",
    premiumShort: "Bracelet with a durable cord",
    classicDescription: "Classic coffee bracelet with an elastic cord.",
    premiumDescription: "Coffee bracelet with a durable cord.",
    viewProducts: "View bracelets",
    back: "← Back",
    add: "Add to cart",
    total: "Total",
    order: "Order via WhatsApp",
    copy: "Copy order",
    copied: "Order copied",
    cart: "Shopping cart",
    emptyCart: "Your cart is empty",
    emptyProducts: "No published bracelets yet.",
    favorites: "Favorites",
    emptyFavorites: "No favorites yet.",
    loading: "Loading bracelets...",
    loadError: "Unable to load products",
    remove: "Remove",
    photo: "Photo",
    item: "bracelets",
    close: "Close"
  }
};

/* ==========================================
   СОХРАНЕНИЕ
========================================== */

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    return saved === null
      ? fallback
      : JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Ошибка сохранения:", error);
  }
}

/* ==========================================
   ПЕРЕМЕННЫЕ
========================================== */

let language = readStorage("mix-language-v8", "ru");

if (!TEXTS[language]) {
  language = "ru";
}

let currentView = null;
let cartOpen = false;
let favoritesView = false;
let loadingComplete = false;

let favorites = new Set(
  readStorage("mix-favorites-v8", [])
);

let cart = readStorage("mix-cart-v8", []);

if (!Array.isArray(cart)) {
  cart = [];
}

// PRODUCTS уже объявляется в старом products.js.
// Повторно объявлять его здесь нельзя.

/* ==========================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
========================================== */

function t(key) {
  return TEXTS[language]?.[key] || key;
}

function money(value) {
  return new Intl.NumberFormat("ru-RU")
    .format(Number(value) || 0) + " ₸";
}

function getProduct(id) {
  return PRODUCTS.find(product =>
    String(product.id) === String(id)
  );
}

function categoryName(category) {
  return category === "premium"
    ? "Coffee Premium"
    : "Coffee Classic";
}

function photoList(product) {
  return [...(product.bracelet_photos || [])]
    .filter(photo => photo && photo.image_url)
    .sort((a, b) =>
      Number(a.position || 0) -
      Number(b.position || 0)
    );
}

function goTo(element) {
  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* ==========================================
   ЗАГРУЗКА ИЗ SUPABASE
========================================== */

async function loadProducts() {
  const count = $("productCount");

  if (count) count.textContent = t("loading");

  if (typeof db === "undefined" || !db) {
    console.error("Подключение Supabase отсутствует.");

    if (count) {
      count.textContent = t("loadError");
    }

    return;
  }

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
      .order("created_at", {
        ascending: false
      });

    if (error) throw error;

    PRODUCTS = (data || []).map(product => ({
      ...product,
      bracelet_photos: photoList(product)
    }));

    loadingComplete = true;

    // Удаляем из корзины товары,
    // которых больше нет в каталоге.
    cart = cart.filter(item => getProduct(item.id));

    writeStorage("mix-cart-v8", cart);

    // Не открываем товары автоматически.
    if (currentView !== null) {
      renderProducts();
    } else if (count) {
      count.textContent = "";
    }

    renderCart();
    updateCounters();

  } catch (error) {
    console.error("Supabase:", error);

    loadingComplete = true;

    if (count) {
      count.textContent = t("loadError");
    }

    if ($("emptyMessage")) {
      $("emptyMessage").hidden = false;
      $("emptyMessage").textContent =
        t("loadError");
    }
  }
}

/* ==========================================
   ФОТОГРАФИИ КОЛЛЕКЦИЙ
========================================== */

async function loadCollectionCovers() {
  if (typeof db === "undefined" || !db) return;

  try {
    const { data, error } = await db
      .from("collection_covers")
      .select("category,image_url");

    if (error) throw error;

    for (const category of ["classic", "premium"]) {
      const cover = $(
        category === "classic"
          ? "classicCover"
          : "premiumCover"
      );

      if (!cover) continue;

      const item = (data || []).find(
        row => row.category === category
      );

      if (!item?.image_url) continue;

      cover.replaceChildren();

      const img = document.createElement("img");

      img.src = item.image_url;
      img.alt = categoryName(category);
      img.loading = "lazy";
      img.decoding = "async";

      cover.append(img);
    }

  } catch (error) {
    console.warn("Обложки:", error);
  }
}

/* ==========================================
   СЛАЙДЕР ФОТОГРАФИЙ
========================================== */

function installSliderStyles() {
  const style = document.createElement("style");

  style.textContent = `
    .product-photo-gallery {
      position:relative;
      width:100%;
      aspect-ratio:3/3.7;
      overflow:hidden;
      background:#f8f4ef;
    }

    .photo-track {
      width:100%;
      height:100%;
      display:flex;
      overflow-x:auto;
      overflow-y:hidden;
      scroll-snap-type:x mandatory;
      scroll-behavior:smooth;
      scrollbar-width:none;
      -webkit-overflow-scrolling:touch;
    }

    .photo-track::-webkit-scrollbar {
      display:none;
    }

    .photo-slide {
      flex:0 0 100%;
      width:100%;
      height:100%;
      scroll-snap-align:start;
    }

    .photo-slide img {
      width:100%;
      height:100%;
      display:block;
      object-fit:contain;
    }

    .photo-dots {
      position:absolute;
      left:50%;
      bottom:12px;
      transform:translateX(-50%);
      display:flex;
      gap:7px;
      background:#ffffffcc;
      padding:7px 10px;
      border-radius:30px;
      z-index:2;
    }

    .photo-dot {
      padding:0;
      min-height:0;
      width:8px;
      height:8px;
      border:0;
      border-radius:50%;
      background:#c9b8a7;
    }

    .photo-dot.active {
      background:#543929;
    }

    .product-photo-gallery .favorite-btn {
      position:absolute;
      z-index:3;
      top:10px;
      right:10px;
      width:38px;
      height:38px;
      border:0;
      border-radius:50%;
      background:#fff;
      color:#543929;
      font-size:25px;
    }

    .product-photo-gallery .favorite-btn.active {
      color:#b84b4b;
    }

    .collection-cover img {
      width:100%;
      height:100%;
      display:block;
      object-fit:contain;
    }

    /* Каталог скрыт по умолчанию */
    #products[hidden] {
      display:none !important;
    }
  `;

  document.head.append(style);
}

function makePhotoGallery(product) {
  const gallery = document.createElement("div");
  gallery.className = "product-photo-gallery";

  const photos = photoList(product);

  const track = document.createElement("div");
  track.className = "photo-track";

  if (!photos.length) {
    const empty = document.createElement("div");
    empty.className = "photo-slide";
    empty.textContent = t("photo");
    track.append(empty);
  }

  photos.forEach((photo, index) => {
    const slide = document.createElement("div");
    slide.className = "photo-slide";

    const img = document.createElement("img");

    img.src = photo.image_url;
    img.alt =
      categoryName(product.category) +
      " — " + (index + 1);

    img.loading = "lazy";
    img.decoding = "async";

    slide.append(img);
    track.append(slide);
  });

  gallery.append(track);

  if (photos.length > 1) {
    const dots = document.createElement("div");
    dots.className = "photo-dots";

    const buttons = photos.map((photo, index) => {
      const button = document.createElement("button");

      button.className =
        "photo-dot" + (index === 0 ? " active" : "");

      button.setAttribute(
        "aria-label",
        "Фото " + (index + 1)
      );

      button.onclick = () => {
        track.scrollTo({
          left: track.clientWidth * index,
          behavior: "smooth"
        });
      };

      dots.append(button);
      return button;
    });

    track.addEventListener("scroll", () => {
      const width = track.clientWidth || 1;

      const active = Math.min(
        photos.length - 1,
        Math.max(0, Math.round(track.scrollLeft / width))
      );

      buttons.forEach((button, index) => {
        button.classList.toggle(
          "active",
          index === active
        );
      });
    }, { passive: true });

    gallery.append(dots);
  }

  const favorite = document.createElement("button");
  favorite.className = "favorite-btn";

  function updateFavorite() {
    const liked = favorites.has(product.id);

    favorite.textContent = liked ? "♥" : "♡";
    favorite.classList.toggle("active", liked);
  }

  favorite.onclick = () => {
    toggleFavorite(product.id);
  };

  updateFavorite();
  gallery.append(favorite);

  return gallery;
}

/* ==========================================
   КАРТОЧКА БРАСЛЕТА
========================================== */

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const gallery = makePhotoGallery(product);

  const info = document.createElement("div");
  info.className = "product-info";

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = money(product.price);

  const add = document.createElement("button");
  add.className = "add-to-cart";
  add.textContent = t("add");

  add.onclick = () => addToCart(product.id);

  info.append(price, add);
  card.append(gallery, info);

  return card;
}

/* ==========================================
   ГЛАВНОЕ: ОТКРЫТИЕ CLASSIC / PREMIUM
========================================== */

function openCategory(category) {
  if (!["classic", "premium"].includes(category)) {
    return;
  }

  // Повторное нажатие закрывает каталог.
  if (
    currentView === category &&
    !$("products").hidden
  ) {
    closeCategory();
    return;
  }

  favoritesView = false;
  currentView = category;

  $("products").hidden = false;

  document.querySelectorAll("[data-open]")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.open === category
      );
    });

  renderProducts();
  goTo($("products"));
}

function closeCategory() {
  currentView = null;
  favoritesView = false;

  $("products").hidden = true;

  document.querySelectorAll("[data-open]")
    .forEach(button => {
      button.classList.remove("active");
    });
}

/* ==========================================
   ИЗБРАННОЕ
========================================== */

function openFavorites() {
  favoritesView = true;
  currentView = "favorites";

  $("products").hidden = false;

  renderProducts();
  goTo($("products"));
}

function toggleFavorite(id) {
  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }

  writeStorage(
    "mix-favorites-v8",
    [...favorites]
  );

  updateCounters();
  renderProducts();
}

/* ==========================================
   ПОКАЗ ТОВАРОВ
========================================== */

function renderProducts() {
  if (!currentView) return;

  const isFavorites =
    currentView === "favorites";

  const title = $("productsTitle");
  const description = $("categoryDescription");

  if (title) {
    title.textContent = isFavorites
      ? t("favorites")
      : categoryName(currentView);
  }

  if (description) {
    description.hidden = isFavorites;

    if (!isFavorites) {
      description.textContent =
        t(currentView + "Description");
    }
  }

  if ($("categoryTabs")) {
    $("categoryTabs").hidden = isFavorites;
  }

  document.querySelectorAll(".category-tab")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.category === currentView
      );
    });

  const visible = PRODUCTS.filter(product => {
    if (isFavorites) {
      return favorites.has(product.id);
    }

    return product.category === currentView;
  });

  const grid = $("productGrid");
  grid.replaceChildren();

  visible.forEach(product => {
    grid.append(createProductCard(product));
  });

  if ($("productCount")) {
    $("productCount").textContent =
      visible.length + " " + t("item");
  }

  const empty = $("emptyMessage");

  if (empty) {
    empty.textContent = isFavorites
      ? t("emptyFavorites")
      : t("emptyProducts");

    empty.hidden =
      !loadingComplete || visible.length > 0;
  }

  updateCounters();
}

/* ==========================================
   КОРЗИНА
========================================== */

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
  renderCart();
  openCart();
}

function saveCart() {
  writeStorage("mix-cart-v8", cart);
  updateCounters();
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

  saveCart();
  renderCart();
}

function removeCartItem(id) {
  cart = cart.filter(
    row => String(row.id) !== String(id)
  );

  saveCart();
  renderCart();
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

function updateCounters() {
  if ($("favoritesCount")) {
    $("favoritesCount").textContent =
      favorites.size;
  }

  if ($("cartCount")) {
    $("cartCount").textContent =
      cart.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
  }
}

function renderCart() {
  const container = $("cartItems");
  if (!container) return;

  container.replaceChildren();

  if (!cart.length) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = t("emptyCart");
    container.append(empty);
  }

  cart.forEach(item => {
    const product = getProduct(item.id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";

    const photo = document.createElement("div");
    photo.className = "cart-item-photo";

    const first = photoList(product)[0];

    if (first) {
      const img = document.createElement("img");
      img.src = first.image_url;
      img.alt = categoryName(product.category);
      photo.append(img);
    }

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const name = document.createElement("strong");
    name.textContent = categoryName(product.category);

    const price = document.createElement("p");
    price.textContent = money(
      Number(product.price) * item.quantity
    );

    const quantity = document.createElement("div");
    quantity.className = "quantity-row";

    const minus = document.createElement("button");
    minus.textContent = "−";
    minus.onclick = () =>
      changeQuantity(product.id, -1);

    const number = document.createElement("span");
    number.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.onclick = () =>
      changeQuantity(product.id, 1);

    quantity.append(minus, number, plus);

    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.textContent = t("remove");

    remove.onclick = () =>
      removeCartItem(product.id);

    info.append(name, price, quantity, remove);
    row.append(photo, info);
    container.append(row);
  });

  if ($("totalPrice")) {
    $("totalPrice").textContent =
      money(calculateTotal());
  }

  if ($("copyOrder")) {
    $("copyOrder").disabled =
      cart.length === 0;
  }

  updateOrderLink();
}

function buildOrderText() {
  const lines = [
    "🤎 MIX COFFEE BRACELET",
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
      money(Number(product.price) * item.quantity)
    );
  });

  lines.push("");
  lines.push("Итого: " + money(calculateTotal()));

  return lines.join("\n");
}

function updateOrderLink() {
  const link = $("orderButton");
  if (!link) return;

  link.href =
    "https://wa.me/" +
    WHATSAPP +
    "?text=" +
    encodeURIComponent(buildOrderText());
}

function openCart() {
  cartOpen = true;

  $("cartBackdrop").hidden = false;
  $("cartPanel").classList.add("open");

  $("cartPanel").setAttribute(
    "aria-hidden",
    "false"
  );

  renderCart();
}

function closeCart() {
  cartOpen = false;

  $("cartBackdrop").hidden = true;
  $("cartPanel").classList.remove("open");

  $("cartPanel").setAttribute(
    "aria-hidden",
    "true"
  );
}

async function copyOrder() {
  try {
    await navigator.clipboard.writeText(
      buildOrderText()
    );

    if ($("cartMessage")) {
      $("cartMessage").textContent =
        t("copied");
    }

  } catch (error) {
    console.error("Ошибка копирования:", error);
  }
}

/* ==========================================
   ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА
========================================== */

function changeLanguage(value) {
  if (!TEXTS[value]) return;

  language = value;

  writeStorage("mix-language-v8", value);

  document.documentElement.lang =
    value === "kz" ? "kk" : value;

  document.querySelectorAll("[data-i18n]")
    .forEach(element => {
      const key = element.dataset.i18n;

      if (TEXTS[value][key]) {
        element.textContent = t(key);
      }
    });

  document.querySelectorAll(".lang-btn")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.lang === value
      );
    });

  if ($("cartTitle")) {
    $("cartTitle").textContent = t("cart");
  }

  if (currentView) {
    renderProducts();
  }

  renderCart();
}

/* ==========================================
   ОБРАБОТЧИКИ КНОПОК
========================================== */

document.querySelectorAll(".lang-btn")
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

document.querySelectorAll(".category-tab")
  .forEach(button => {
    button.addEventListener("click", () => {
      openCategory(button.dataset.category);
    });
  });

if ($("favoritesButton")) {
  $("favoritesButton").onclick = openFavorites;
}

if ($("backButton")) {
  $("backButton").onclick = closeCategory;
}

if ($("cartButton")) {
  $("cartButton").onclick = openCart;
}

if ($("closeCart")) {
  $("closeCart").onclick = closeCart;
}

if ($("cartBackdrop")) {
  $("cartBackdrop").onclick = closeCart;
}

if ($("copyOrder")) {
  $("copyOrder").onclick = copyOrder;
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartOpen) {
    closeCart();
  }
});

/* ==========================================
   ЗАПУСК САЙТА
========================================== */

async function startStore() {
  if ($("year")) {
    $("year").textContent =
      new Date().getFullYear();
  }

  installSliderStyles();

  // Важное: при открытии сайта
  // никакие товары не отображаются.
  closeCategory();

  changeLanguage(language);
  updateCounters();

  // Подключение берётся из оригинального
  // products.js старого проекта.
  if (typeof db === "undefined" || !db) {
    console.error(
      "Supabase не подключён. Проверь products.js."
    );
    return;
  }

  await Promise.all([
    loadProducts(),
    loadCollectionCovers()
  ]);
}

startStore();
