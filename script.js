
"use strict";

const $ = id => document.getElementById(id);

const TEXTS = {
  ru: {
    hero: "Отборные кофейные зёрна 🤎",
    collections: "Наши коллекции",
    view: "Смотреть браслеты",
    add: "В корзину",
    cart: "Корзина",
    emptyCart: "Корзина пуста",
    favorites: "Избранное",
    empty: "Пока нет опубликованных браслетов.",
    emptyFavorites: "В избранном пока пусто.",
    loading: "Загружаем браслеты...",
    error: "Не удалось загрузить товары.",
    total: "Итого",
    order: "Заказать через WhatsApp",
    copy: "Скопировать заказ"
  },
  kz: {
    hero: "Іріктелген кофе дәндері 🤎",
    collections: "Біздің коллекциялар",
    view: "Білезіктерді көру",
    add: "Себетке қосу",
    cart: "Себет",
    emptyCart: "Себет бос",
    favorites: "Таңдаулылар",
    empty: "Әзірге білезіктер жарияланбаған.",
    emptyFavorites: "Таңдаулы тауарлар жоқ.",
    loading: "Білезіктер жүктелуде...",
    error: "Тауарларды жүктеу мүмкін болмады.",
    total: "Жалпы сома",
    order: "WhatsApp арқылы тапсырыс беру",
    copy: "Тапсырысты көшіру"
  },
  en: {
    hero: "Carefully Selected Coffee Beans 🤎",
    collections: "Our collections",
    view: "View bracelets",
    add: "Add to cart",
    cart: "Cart",
    emptyCart: "Your cart is empty",
    favorites: "Favorites",
    empty: "No published bracelets yet.",
    emptyFavorites: "No favorites yet.",
    loading: "Loading bracelets...",
    error: "Unable to load products.",
    total: "Total",
    order: "Order via WhatsApp",
    copy: "Copy order"
  }
};

function readLocal(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item === null ? fallback : JSON.parse(item);
  } catch {
    return fallback;
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Storage:", error);
  }
}

let language = readLocal("mix-lang-v9", "ru");
if (!TEXTS[language]) language = "ru";

let products = [];
let currentCategory = "classic";
let cart = readLocal("mix-cart-v9", []);
let favoriteIds = readLocal("mix-favorites-v9", []);

if (!Array.isArray(cart)) cart = [];
if (!Array.isArray(favoriteIds)) favoriteIds = [];

let favorites = new Set(favoriteIds);
let loaded = false;
let loading = false;

function t(key) {
  return TEXTS[language][key] || key;
}

function productById(id) {
  return products.find(product => product.id === id);
}

function firstPhoto(product) {
  return mixPhotos(product)[0]?.image_url || "";
}

function setStatus(message, isError = false) {
  const element = $("catalogStatus");
  element.textContent = message;
  element.style.color = isError ? "#b12e2e" : "";
}

/* ===== DATABASE ===== */

async function loadProducts() {
  if (loading) return;

  loading = true;
  setStatus(t("loading"));
  $("refreshProducts").disabled = true;

  try {
    if (!window.db) {
      throw new Error("Supabase не подключён");
    }

    const { data, error } = await db
      .from("bracelets")
      .select(`
        id,
        category,
        price,
        published,
        created_at,
        bracelet_photos (
          id,
          image_url,
          position
        )
      `)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    products = (data || []).map(product => ({
      ...product,
      bracelet_photos: mixPhotos(product)
    }));

    // Корзина и избранное могут быть локальными:
    // сами товары всегда берём из Supabase.
    const ids = new Set(products.map(p => p.id));

    cart = cart.filter(item =>
      ids.has(item.id) && item.quantity > 0
    );

    favorites = new Set(
      [...favorites].filter(id => ids.has(id))
    );

    saveCart();
    saveFavorites();

    loaded = true;
    setStatus("");
    renderProducts();
    renderCart();
    updateCounters();

  } catch (error) {
    console.error("Ошибка загрузки Supabase:", error);

    loaded = false;
    products = [];

    $("productGrid").replaceChildren();
    $("emptyMessage").hidden = true;

    setStatus(
      t("error") + " " + error.message,
      true
    );

  } finally {
    loading = false;
    $("refreshProducts").disabled = false;
  }
}

/* ===== COLLECTION COVERS ===== */

async function loadCovers() {
  try {
    const { data, error } = await db
      .from("collection_covers")
      .select("category,image_url");

    if (error) throw error;

    for (const category of ["classic", "premium"]) {
      const element = $(
        category === "classic"
          ? "classicCover"
          : "premiumCover"
      );

      const cover = (data || []).find(
        item => item.category === category
      );

      if (!cover?.image_url) continue;

      const img = document.createElement("img");
      img.src = cover.image_url;
      img.alt = mixCategory(category);

      img.onerror = () => {
        img.remove();
      };

      element.replaceChildren(img);
    }
  } catch (error) {
    console.error("Ошибка обложек:", error);
  }
}

/* ===== GALLERY ===== */

function makeGallery(product) {
  const photos = mixPhotos(product);
  const gallery = document.createElement("div");
  gallery.className = "product-gallery";

  const track = document.createElement("div");
  track.className = "gallery-track";

  photos.forEach((photo, index) => {
    const slide = document.createElement("div");
    slide.className = "gallery-slide";

    const img = document.createElement("img");
    img.src = photo.image_url;
    img.alt = mixCategory(product.category) +
      " — фото " + (index + 1);
    img.loading = index === 0 ? "eager" : "lazy";

    img.onerror = () => {
      const error = document.createElement("div");
      error.className = "photo-error";
      error.textContent = "Фото недоступно";
      img.replaceWith(error);
    };

    slide.appendChild(img);
    track.appendChild(slide);
  });

  if (!photos.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "photo-error";
    placeholder.textContent = "Нет фотографии";
    track.appendChild(placeholder);
  }

  gallery.appendChild(track);

  if (photos.length > 1) {
    const counter = document.createElement("span");
    counter.className = "photo-counter";
    counter.textContent = "1 / " + photos.length;

    track.addEventListener("scroll", () => {
      const width = track.clientWidth || 1;
      const page = Math.min(
        photos.length,
        Math.round(track.scrollLeft / width) + 1
      );
      counter.textContent = page + " / " + photos.length;
    }, { passive: true });

    gallery.appendChild(counter);
  }

  const like = document.createElement("button");
  like.className = "favorite-btn";
  like.type = "button";
  like.textContent =
    favorites.has(product.id) ? "♥" : "♡";

  like.classList.toggle(
    "active",
    favorites.has(product.id)
  );

  like.addEventListener("click", () => {
    if (favorites.has(product.id)) {
      favorites.delete(product.id);
    } else {
      favorites.add(product.id);
    }

    saveFavorites();
    renderProducts();
    updateCounters();
  });

  gallery.appendChild(like);
  return gallery;
}

/* ===== CATALOG ===== */

function createCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  card.appendChild(makeGallery(product));

  const info = document.createElement("div");
  info.className = "product-info";

  const title = document.createElement("h3");
  title.textContent = mixCategory(product.category);

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = mixMoney(product.price);

  const button = document.createElement("button");
  button.className = "add-to-cart";
  button.textContent = t("add");

  button.addEventListener("click", () => {
    addToCart(product.id);
  });

  info.append(title, price, button);
  card.appendChild(info);

  return card;
}

function renderProducts() {
  const grid = $("productGrid");
  grid.replaceChildren();

  const isFavorites = currentCategory === "favorites";

  $("productsTitle").textContent = isFavorites
    ? t("favorites")
    : mixCategory(currentCategory);

  $("categoryTabs").hidden = isFavorites;

  document.querySelectorAll(".category-tab")
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.category === currentCategory
      );
    });

  const visible = products.filter(product =>
    isFavorites
      ? favorites.has(product.id)
      : product.category === currentCategory
  );

  for (const product of visible) {
    grid.appendChild(createCard(product));
  }

  $("productCount").textContent =
    visible.length + " " +
    (language === "kz" ? "білезік" : "браслетов");

  $("emptyMessage").textContent = isFavorites
    ? t("emptyFavorites")
    : t("empty");

  $("emptyMessage").hidden =
    !loaded || visible.length !== 0;
}

function openCategory(category) {
  currentCategory = category;
  renderProducts();
  $("products").scrollIntoView({
    behavior: "smooth"
  });
}

/* ===== FAVORITES ===== */

function saveFavorites() {
  saveLocal("mix-favorites-v9", [...favorites]);
}

/* ===== CART ===== */

function saveCart() {
  saveLocal("mix-cart-v9", cart);
}

function addToCart(id) {
  const product = productById(id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity = Math.min(
      existing.quantity + 1, 99
    );
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(row => row.id !== id);
  } else {
    item.quantity = Math.min(item.quantity, 99);
  }

  saveCart();
  renderCart();
}

function totalPrice() {
  return cart.reduce((sum, item) => {
    const product = productById(item.id);
    return sum + (
      product ? product.price * item.quantity : 0
    );
  }, 0);
}

function updateCounters() {
  $("cartCount").textContent = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );
  $("favoritesCount").textContent = favorites.size;
}

function orderText() {
  const lines = [
    "MIX COFFEE BRACELET 🤎",
    "",
    "Заказ / Тапсырыс",
    "-------------------"
  ];

  cart.forEach((item, index) => {
    const product = productById(item.id);
    if (!product) return;

    lines.push(
      (index + 1) + ". " +
      mixCategory(product.category)
    );
    lines.push("ID: " + product.id);
    lines.push("Количество: " + item.quantity);
    lines.push(
      "Сумма: " +
      mixMoney(product.price * item.quantity)
    );

    const photo = firstPhoto(product);
    if (photo) lines.push("Фото: " + photo);

    lines.push("-------------------");
  });

  lines.push("Итого: " + mixMoney(totalPrice()));

  return lines.join("\n");
}

function renderCart() {
  const container = $("cartItems");
  container.replaceChildren();

  if (!cart.length) {
    const empty = document.createElement("p");
    empty.textContent = t("emptyCart");
    container.appendChild(empty);
  }

  cart.forEach(item => {
    const product = productById(item.id);
    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.src = firstPhoto(product);
    image.alt = mixCategory(product.category);

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const name = document.createElement("strong");
    name.textContent = mixCategory(product.category);

    const price = document.createElement("p");
    price.textContent = mixMoney(
      product.price * item.quantity
    );

    const quantity = document.createElement("div");
    quantity.className = "quantity-row";

    const minus = document.createElement("button");
    minus.className = "qty-btn";
    minus.textContent = "−";
    minus.addEventListener("click", () =>
      changeQuantity(item.id, -1)
    );

    const amount = document.createElement("strong");
    amount.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.className = "qty-btn";
    plus.textContent = "+";
    plus.addEventListener("click", () =>
      changeQuantity(item.id, 1)
    );

    quantity.append(minus, amount, plus);

    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.textContent = "Удалить";
    remove.addEventListener("click", () =>
      changeQuantity(item.id, -item.quantity)
    );

    info.append(name, price, quantity, remove);
    row.append(image, info);
    container.appendChild(row);
  });

  $("totalPrice").textContent = mixMoney(totalPrice());
  $("copyOrder").disabled = cart.length === 0;

  const link = $("orderWhatsApp");
  link.textContent = t("order");

  if (cart.length) {
    link.href = "https://wa.me/" +
      MIX_STORE.whatsapp +
      "?text=" + encodeURIComponent(orderText());

    link.style.pointerEvents = "auto";
    link.style.opacity = "1";
  } else {
    link.removeAttribute("href");
    link.style.pointerEvents = "none";
    link.style.opacity = ".5";
  }

  updateCounters();
}

function openCart() {
  $("cartBackdrop").hidden = false;
  $("cartPanel").classList.add("open");
}

function closeCart() {
  $("cartBackdrop").hidden = true;
  $("cartPanel").classList.remove("open");
}

/* ===== LANGUAGE ===== */

function changeLanguage(next) {
  if (!TEXTS[next]) return;

  language = next;
  saveLocal("mix-lang-v9", next);

  document.documentElement.lang =
    next === "kz" ? "kk" : next;

  $("language").value = next;
  $("heroDescription").textContent = t("hero");
  $("collectionTitle").textContent = t("collections");
  $("cartTitle").textContent = t("cart");
  $("totalLabel").textContent = t("total");
  $("copyOrder").textContent = t("copy");
  $("exploreButton").textContent = t("collections");

  document.querySelectorAll("[data-i18n]")
    .forEach(element => {
      element.textContent = t(element.dataset.i18n);
    });

  renderProducts();
  renderCart();
}

/* ===== EVENTS ===== */

$("language").addEventListener("change", event => {
  changeLanguage(event.target.value);
});

$("exploreButton").addEventListener("click", () => {
  $("collection").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll("[data-open]")
  .forEach(button => button.addEventListener(
    "click",
    () => openCategory(button.dataset.open)
  ));

document.querySelectorAll(".category-tab")
  .forEach(button => button.addEventListener(
    "click",
    () => openCategory(button.dataset.category)
  ));

$("favoritesButton").addEventListener("click", () => {
  openCategory("favorites");
});

$("cartButton").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("cartBackdrop").addEventListener("click", closeCart);
$("refreshProducts").addEventListener("click", loadProducts);

$("copyOrder").addEventListener("click", async () => {
  if (!cart.length) return;

  try {
    await navigator.clipboard.writeText(orderText());
    $("cartMessage").textContent = "Заказ скопирован!";
  } catch {
    $("cartMessage").textContent =
      "Не удалось скопировать заказ.";
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCart();
});

/* ===== START ===== */

async function startStore() {
  $("year").textContent = new Date().getFullYear();

  changeLanguage(language);

  await Promise.all([
    loadProducts(),
    loadCovers()
  ]);
}

startStore().catch(error => {
  console.error(error);
  setStatus(error.message, true);
});
