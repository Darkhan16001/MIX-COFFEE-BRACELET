
"use strict";

/* =====================================
   MIX BRACELET
   ONLINE STORE + SUPABASE
===================================== */

const $ = id => document.getElementById(id);

const WHATSAPP = "77058038122";

const TEXTS = {
  kz: {
    tagline: "Іріктелген кофе дәндері 🤎",
    heroDescription:
      "Кофеге деген махаббат – білегіңде.",
    explore: "Коллекцияны көру",
    collections: "Біздің коллекция",
    classicShort:
      "Серпімді резеңке жіптен жасалған білезік",
    premiumShort:
      "Арнайы берік жіптен жасалған білезік",
    classicDescription:
      "Классикалық кофе білезігі серпімді резеңке жіптен жасалған. Оны қолға оңай тағып, шешуге болады.",
    premiumDescription:
      "Кофе білезігі арнайы берік жіптен жасалған.",
    viewProducts: "Білезіктерді көру",
    back: "← Артқа",
    add: "Себетке қосу",
    total: "Жалпы сома",
    order: "WhatsApp арқылы тапсырыс беру",
    copy: "Тізімді көшіру",
    copied: "Тізім көшірілді",
    cart: "Себет",
    emptyCart: "Себет бос",
    emptyProducts: "Әзірге білезіктер жарияланбаған.",
    favorites: "Таңдаулылар",
    emptyFavorites: "Таңдаулы тауарлар жоқ.",
    loading: "Білезіктер жүктелуде...",
    loadError: "Тауарларды жүктеу мүмкін болмады.",
    remove: "Өшіру",
    photo: "Фото",
    item: "білезік",
    close: "Жабу"
  },

  ru: {
    tagline: "Отборные кофейные зёрна 🤎",
    heroDescription:
      "Любовь к кофе — на твоём запястье.",
    explore: "Смотреть коллекцию",
    collections: "Наши коллекции",
    classicShort: "Браслет на эластичной резинке",
    premiumShort: "Браслет на прочной нити",
    classicDescription:
      "Классический кофейный браслет на эластичной резинке. Его удобно надевать и снимать.",
    premiumDescription:
      "Кофейный браслет на специальной прочной нити.",
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
    emptyFavorites: "В избранном пока пусто.",
    loading: "Загружаем браслеты...",
    loadError: "Не удалось загрузить товары.",
    remove: "Удалить",
    photo: "Фото",
    item: "браслетов",
    close: "Закрыть"
  },

  en: {
    tagline: "Carefully Selected Coffee Beans 🤎",
    heroDescription:
      "Wear your love for coffee on your wrist.",
    explore: "Explore collections",
    collections: "Our collections",
    classicShort: "Bracelet with an elastic cord",
    premiumShort: "Bracelet with a durable cord",
    classicDescription:
      "A classic coffee bracelet with an elastic cord for easy and comfortable wear.",
    premiumDescription:
      "A coffee bracelet made with a special durable cord.",
    viewProducts: "View bracelets",
    back: "← Back",
    add: "Add to cart",
    total: "Total",
    order: "Order via WhatsApp",
    copy: "Copy order",
    copied: "Order copied",
    cart: "Cart",
    emptyCart: "Your cart is empty",
    emptyProducts: "No published bracelets yet.",
    favorites: "Favorites",
    emptyFavorites: "No favorites yet.",
    loading: "Loading bracelets...",
    loadError: "Could not load products.",
    remove: "Remove",
    photo: "Photo",
    item: "bracelets",
    close: "Close"
  }
};

/* =====================================
   STORAGE
===================================== */

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

function writeStorage(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch {
    // Сайт работает даже без localStorage.
  }
}

/* =====================================
   STATE
===================================== */

let language = readStorage(
  "mix-language-v8",
  "kz"
);

if (!TEXTS[language]) {
  language = "kz";
}

let PRODUCTS = [];
let currentView = "classic";
let cartOpen = false;
let focusedBeforeCart = null;

const savedFavorites = readStorage(
  "mix-favorites-v8",
  []
);

let favorites = new Set(
  Array.isArray(savedFavorites)
    ? savedFavorites
    : []
);

let cart = readStorage(
  "mix-cart-v8",
  []
);

if (!Array.isArray(cart)) {
  cart = [];
}

/* =====================================
   HELPERS
===================================== */

function t(key) {
  return TEXTS[language][key] || key;
}

function money(value) {
  return new Intl.NumberFormat("ru-RU")
    .format(value) + " ₸";
}

function getProduct(id) {
  return PRODUCTS.find(product => product.id === id);
}

function categoryName(category) {
  return category === "premium"
    ? "Coffee Premium"
    : "Coffee Classic";
}

function photoList(product) {
  return (product.bracelet_photos || [])
    .filter(photo => photo.image_url)
    .sort((a, b) => a.position - b.position);
}

function goTo(element) {
  element.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =====================================
   DATABASE: LOAD PRODUCTS
===================================== */

async function loadProducts() {
  const count = $("productCount");

  count.textContent = t("loading");

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

    // Убираем устаревшие товары из корзины
    const availableIds = new Set(
      PRODUCTS.map(product => product.id)
    );

    cart = cart.filter(item =>
      availableIds.has(item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );

    favorites = new Set(
      [...favorites].filter(id =>
        availableIds.has(id)
      )
    );

    writeStorage("mix-cart-v8", cart);
    writeStorage(
      "mix-favorites-v8",
      [...favorites]
    );

    renderProducts();
    renderCart();
    updateCounters();

  } catch (error) {
    console.error("Ошибка Supabase:", error);

    count.textContent = t("loadError");
    $("productGrid").replaceChildren();
  }
}

/* =====================================
   DATABASE: COLLECTION COVERS
===================================== */

async function loadCollectionCovers() {
  try {
    const { data, error } = await db
      .from("collection_covers")
      .select("category,image_url");

    if (error) throw error;

    const covers = {
      classic: "",
      premium: ""
    };

    for (const item of data || []) {
      if (item.category in covers) {
        covers[item.category] = item.image_url;
      }
    }

    for (const category of ["classic", "premium"]) {
      const element = $(
        category === "classic"
          ? "classicCover"
          : "premiumCover"
      );

      if (!element) continue;

      element.replaceChildren();

      if (!covers[category]) {
        const placeholder =
          document.createElement("span");

        placeholder.textContent =
          categoryName(category);

        element.appendChild(placeholder);
        continue;
      }

      const image = document.createElement("img");

      image.src = covers[category];
      image.alt = categoryName(category);
      image.loading = "lazy";

      image.onerror = () => {
        element.textContent =
          categoryName(category);
      };

      element.appendChild(image);
    }

  } catch (error) {
    console.error(
      "Ошибка обложек коллекций:",
      error
    );
  }
}

/* =====================================
   PHOTO SLIDER STYLES
===================================== */

function installSliderStyles() {
  const style = document.createElement("style");

  style.textContent = `
    .product-photo-gallery {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 3.7;
      overflow: hidden;
      background: #f8f4ef;
    }

    .photo-track {
      display: flex;
      width: 100%;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      touch-action: pan-x pan-y;
    }

    .photo-track::-webkit-scrollbar {
      display: none;
    }

    .photo-slide {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      scroll-snap-align: start;
      display: grid;
      place-items: center;
    }

    .photo-slide img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
    }

    .photo-dots {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 7px;
      max-width: 90%;
      padding: 7px 10px;
      border-radius: 30px;
      background: rgba(255,255,255,.75);
      z-index: 3;
    }

    .photo-dot {
      width: 7px;
      height: 7px;
      flex-shrink: 0;
      padding: 0;
      min-height: 0;
      border: 0;
      border-radius: 50%;
      background: #c8b9ad;
      cursor: pointer;
    }

    .photo-dot.active {
      background: #543929;
      transform: scale(1.2);
    }

    .product-photo-gallery .favorite-btn {
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 4;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: none;
      background: #fff;
      color: #543929;
      font-size: 25px;
    }

    .product-photo-gallery .favorite-btn.active {
      color: #b84b4b;
    }

    .photo-placeholder {
      color: #8b7767;
      font-size: 13px;
      text-align: center;
      padding: 20px;
    }

    .collection-cover img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    @media (max-width: 420px) {
      .photo-dots {
        bottom: 8px;
        gap: 5px;
      }

      .photo-dot {
        width: 6px;
        height: 6px;
      }
    }
  `;

  document.head.appendChild(style);
}

/* =====================================
   TIKTOK STYLE PHOTO GALLERY
===================================== */

function makePhotoGallery(product) {
  const gallery = document.createElement("div");
  gallery.className = "product-photo-gallery";

  const photos = photoList(product);

  const track = document.createElement("div");
  track.className = "photo-track";

  track.setAttribute(
    "aria-label",
    "Фотографии браслета"
  );

  if (!photos.length) {
    const placeholder =
      document.createElement("div");

    placeholder.className = "photo-placeholder";
    placeholder.textContent = "Нет фотографии";

    track.appendChild(placeholder);
  }

  photos.forEach((photo, index) => {
    const slide = document.createElement("div");
    slide.className = "photo-slide";

    const image = document.createElement("img");

    image.src = photo.image_url;
    image.alt =
      categoryName(product.category) +
      " — " + (index + 1);

    image.loading = "lazy";
    image.draggable = false;

    slide.appendChild(image);
    track.appendChild(slide);
  });

  gallery.appendChild(track);

  // Точки показываем только при 2+ фото
  if (photos.length > 1) {
    const dots = document.createElement("div");
    dots.className = "photo-dots";

    const buttons = photos.map((_, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className =
        "photo-dot" + (index === 0 ? " active" : "");

      button.setAttribute(
        "aria-label",
        "Фотография " + (index + 1)
      );

      button.addEventListener("click", () => {
        track.scrollTo({
          left: track.clientWidth * index,
          behavior: "smooth"
        });
      });

      dots.appendChild(button);
      return button;
    });

    let framePending = false;

    track.addEventListener("scroll", () => {
      if (framePending) return;

      framePending = true;

      requestAnimationFrame(() => {
        const width = track.clientWidth || 1;

        const current = Math.max(
          0,
          Math.min(
            buttons.length - 1,
            Math.round(track.scrollLeft / width)
          )
        );

        buttons.forEach((button, i) => {
          button.classList.toggle(
            "active",
            i === current
          );
        });

        framePending = false;
      });
    }, { passive: true });

    gallery.appendChild(dots);
  }

  // Избранное
  const favorite = document.createElement("button");
  favorite.type = "button";
  favorite.className = "favorite-btn";

  const liked = favorites.has(product.id);

  favorite.textContent = liked ? "♥" : "♡";
  favorite.classList.toggle("active", liked);

  favorite.setAttribute(
    "aria-label",
    t("favorites")
  );

  favorite.setAttribute(
    "aria-pressed",
    String(liked)
  );

  favorite.addEventListener("click", () => {
    toggleFavorite(product.id);
  });

  gallery.appendChild(favorite);

  return gallery;
}

/* =====================================
   PRODUCT CARDS
===================================== */

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
  add.type = "button";
  add.className = "add-to-cart";
  add.textContent = t("add");

  add.addEventListener("click", () => {
    addToCart(product.id);
  });

  info.append(price, add);
  card.append(gallery, info);

  return card;
}

/* =====================================
   CATALOG
===================================== */

function openCategory(category) {
  if (!["classic", "premium"].includes(category)) {
    return;
  }

  currentView = category;
  $("products").hidden = false;

  renderProducts();
  goTo($("products"));
}

function openFavorites() {
  currentView = "favorites";

  $("products").hidden = false;

  renderProducts();
  goTo($("products"));
}

function renderProducts() {
  const isFavorites =
    currentView === "favorites";

  const title = $("productsTitle");
  const description = $("categoryDescription");

  title.textContent = isFavorites
    ? t("favorites")
    : categoryName(currentView);

  description.hidden = isFavorites;

  if (!isFavorites) {
    description.textContent =
      t(currentView + "Description");
  }

  $("categoryTabs").hidden = isFavorites;

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
    grid.appendChild(createProductCard(product));
  });

  $("productCount").textContent =
    visible.length + " " + t("item");

  const empty = $("emptyMessage");

  empty.textContent = isFavorites
    ? t("emptyFavorites")
    : t("emptyProducts");

  empty.hidden = visible.length !== 0;

  updateCounters();
}

/* =====================================
   FAVORITES
===================================== */

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

  renderProducts();
  updateCounters();
}

/* =====================================
   SHOPPING CART
===================================== */

function addToCart(id) {
  if (!getProduct(id)) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity = Math.min(
      99,
      existing.quantity + 1
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

function changeQuantity(id, amount) {
  const item = cart.find(row => row.id === id);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(row => row.id !== id);
  } else {
    item.quantity = Math.min(99, item.quantity);
  }

  saveCart();
  renderCart();
}

function removeCartItem(id) {
  cart = cart.filter(item => item.id !== id);

  saveCart();
  renderCart();
}

function saveCart() {
  writeStorage("mix-cart-v8", cart);
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

function updateCounters() {
  $("favoritesCount").textContent = favorites.size;

  $("cartCount").textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
}

/* =====================================
   WHATSAPP ORDER
===================================== */

function buildOrderText() {
  const lines = [
    "🤎 MIX BRACELET",
    "",
    "Тапсырыс / Заказ",
    "━━━━━━━━━━━━━━"
  ];

  cart.forEach((item, index) => {
    const product = getProduct(item.id);
    if (!product) return;

    lines.push("");
    lines.push(
      (index + 1) + ". " +
      categoryName(product.category)
    );

    lines.push("ID: " + product.id);
    lines.push("Количество: " + item.quantity);

    lines.push(
      "Цена: " +
      money(product.price * item.quantity)
    );

    const first = photoList(product)[0];

    if (first) {
      lines.push("Фото:");
      lines.push(first.image_url);
    }

    lines.push("━━━━━━━━━━━━━━");
  });

  lines.push("");
  lines.push(
    "Итого: " + money(calculateTotal())
  );

  return lines.join("\n");
}

function updateOrderLink() {
  const button = $("orderWhatsApp");

  if (!cart.length) {
    button.removeAttribute("href");
    button.classList.add("disabled");
    button.setAttribute("aria-disabled", "true");
    return;
  }

  button.href =
    "https://wa.me/" + WHATSAPP +
    "?text=" +
    encodeURIComponent(buildOrderText());

  button.classList.remove("disabled");
  button.setAttribute("aria-disabled", "false");
}

/* =====================================
   RENDER CART
===================================== */

function renderCart() {
  const container = $("cartItems");
  container.replaceChildren();

  if (!cart.length) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = t("emptyCart");

    container.appendChild(empty);
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
      photo.appendChild(img);
    }

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const title = document.createElement("p");
    title.className = "cart-item-title";
    title.textContent = categoryName(product.category);

    const price = document.createElement("p");
    price.className = "cart-item-price";
    price.textContent = money(
      product.price * item.quantity
    );

    const quantity = document.createElement("div");
    quantity.className = "quantity-row";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "qty-btn";
    minus.textContent = "−";

    minus.addEventListener("click", () => {
      changeQuantity(product.id, -1);
    });

    const amount = document.createElement("strong");
    amount.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "qty-btn";
    plus.textContent = "+";

    plus.addEventListener("click", () => {
      changeQuantity(product.id, 1);
    });

    quantity.append(minus, amount, plus);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-btn";
    remove.textContent = t("remove");

    remove.addEventListener("click", () => {
      removeCartItem(product.id);
    });

    info.append(title, price, quantity, remove);
    row.append(photo, info);
    container.appendChild(row);
  });

  $("totalPrice").textContent =
    money(calculateTotal());

  $("copyOrder").disabled = cart.length === 0;

  updateOrderLink();
  updateCounters();
}

/* =====================================
   OPEN / CLOSE CART
===================================== */

function openCart() {
  if (cartOpen) return;

  focusedBeforeCart = document.activeElement;
  cartOpen = true;

  $("cartBackdrop").hidden = false;
  $("cartPanel").classList.add("open");

  $("cartPanel").setAttribute(
    "aria-hidden", "false"
  );

  document.body.classList.add("cart-open");
  $("closeCart").focus();
}

function closeCart() {
  if (!cartOpen) return;

  cartOpen = false;

  $("cartBackdrop").hidden = true;
  $("cartPanel").classList.remove("open");

  $("cartPanel").setAttribute(
    "aria-hidden", "true"
  );

  document.body.classList.remove("cart-open");

  if (
    focusedBeforeCart &&
    focusedBeforeCart.isConnected
  ) {
    focusedBeforeCart.focus();
  }
}

/* =====================================
   COPY ORDER
===================================== */

async function copyOrder() {
  if (!cart.length) return;

  try {
    await navigator.clipboard.writeText(
      buildOrderText()
    );

    $("cartMessage").textContent = t("copied");

  } catch (error) {
    console.error(error);

    $("cartMessage").textContent =
      "Не удалось скопировать заказ.";
  }
}

/* =====================================
   LANGUAGE
===================================== */

function changeLanguage(next) {
  if (!TEXTS[next]) return;

  language = next;

  writeStorage("mix-language-v8", language);

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
      button.classList.toggle(
        "active",
        button.dataset.lang === language
      );
    });

  $("cartTitle").textContent = t("cart");

  renderProducts();
  renderCart();
}

/* =====================================
   BUTTON EVENTS
===================================== */

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

$("favoritesButton").addEventListener(
  "click",
  openFavorites
);

$("backButton").addEventListener("click", () => {
  $("products").hidden = true;
  goTo($("collection"));
});

$("cartButton").addEventListener(
  "click",
  openCart
);

$("closeCart").addEventListener(
  "click",
  closeCart
);

$("cartBackdrop").addEventListener(
  "click",
  closeCart
);

$("copyOrder").addEventListener(
  "click",
  copyOrder
);

document.addEventListener("keydown", event => {
  if (!cartOpen) return;

  if (event.key === "Escape") {
    closeCart();
    return;
  }

  if (event.key !== "Tab") return;

  const elements = [
    ...$("cartPanel").querySelectorAll(
      'button:not(:disabled), a[href]'
    )
  ];

  if (!elements.length) return;

  const first = elements[0];
  const last = elements[elements.length - 1];

  if (
    event.shiftKey &&
    document.activeElement === first
  ) {
    event.preventDefault();
    last.focus();
  }

  if (
    !event.shiftKey &&
    document.activeElement === last
  ) {
    event.preventDefault();
    first.focus();
  }
});

/* =====================================
   START
===================================== */

async function startStore() {
  $("year").textContent =
    new Date().getFullYear();

  installSliderStyles();
  changeLanguage(language);

  if (typeof db === "undefined") {
    console.error(
      "Supabase не подключён. Проверь файлы подключения."
    );

    $("productCount").textContent =
      t("loadError");

    return;
  }

  await Promise.all([
    loadProducts(),
    loadCollectionCovers()
  ]);
}

startStore();
