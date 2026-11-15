
// ========================================
// MIX COFFEE BRACELET
// ========================================

// ЗАМЕНИ названия и изображения на свои.
// Фотографии нужно положить в папку images
// и опубликовать вместе с сайтом.
//
// Это демонстрационные товары.
// Реальные товары из прежней админ-панели
// сюда автоматически не переносятся.

const products = [
  {
    id: 1,
    name: "Coffee Classic",
    category: "classic",
    price: 3990,
    images: [
      "images/classic-1.jpg",
      "images/classic-2.jpg",
      "images/classic-3.jpg"
    ]
  },
  {
    id: 2,
    name: "Coffee Classic №2",
    category: "classic",
    price: 3990,
    images: [
      "images/classic-4.jpg",
      "images/classic-5.jpg",
      "images/classic-6.jpg"
    ]
  },
  {
    id: 3,
    name: "Coffee Premium",
    category: "premium",
    price: 5990,
    images: [
      "images/premium-1.jpg",
      "images/premium-2.jpg",
      "images/premium-3.jpg"
    ]
  },
  {
    id: 4,
    name: "Coffee Premium №2",
    category: "premium",
    price: 5990,
    images: [
      "images/premium-4.jpg",
      "images/premium-5.jpg",
      "images/premium-6.jpg"
    ]
  }
];

// ========================================
// ПЕРЕВОДЫ
// ========================================

const translations = {
  ru: {
    heroTitle: "Украшения с характером",
    heroSubtitle: "Отборные кофейные зёрна 🤎",
    explore: "Смотреть коллекции",
    collections: "Наши коллекции",
    choose: "Выберите коллекцию, чтобы увидеть браслеты",
    selectCollection: "Нажмите на Classic или Premium",
    aboutTitle: "Особенные детали",
    aboutText:
      "Тёплые оттенки, эстетика кофе и браслеты, созданные для вашего стиля.",
    total: "Итого",
    add: "В корзину",
    added: "Добавлено в корзину",
    cart: "Корзина",
    favorites: "Избранное",
    empty: "Здесь пока пусто",
    copy: "Скопировать заказ",
    copied: "Заказ скопирован",
    unavailable: "Не удалось скопировать заказ",
    remove: "Удалить",
    quantity: "Количество"
  },

  kz: {
    heroTitle: "Ерекше сәндік бұйымдар",
    heroSubtitle: "Таңдаулы кофе дәндері 🤎",
    explore: "Топтамаларды көру",
    collections: "Біздің топтамалар",
    choose: "Білезіктерді көру үшін топтаманы таңдаңыз",
    selectCollection: "Classic немесе Premium таңдаңыз",
    aboutTitle: "Ерекше бөлшектер",
    aboutText:
      "Жылы түстер, кофе эстетикасы және сіздің стиліңізге арналған білезіктер.",
    total: "Барлығы",
    add: "Себетке салу",
    added: "Себетке қосылды",
    cart: "Себет",
    favorites: "Таңдаулылар",
    empty: "Әзірге бос",
    copy: "Тапсырысты көшіру",
    copied: "Тапсырыс көшірілді",
    unavailable: "Тапсырысты көшіру мүмкін болмады",
    remove: "Жою",
    quantity: "Саны"
  }
};

let lang = "ru";
let activeCategory = null;
let activePanel = null;

// ========================================
// БЕЗОПАСНОЕ ЛОКАЛЬНОЕ СОХРАНЕНИЕ
// Только корзина и избранное.
// Каталог хранится в коде сайта.
// ========================================

function readSavedArray(key) {
  try {
    const data = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

let cart = readSavedArray("mix_cart");
let favorites = readSavedArray("mix_favorites");

function save() {
  try {
    localStorage.setItem(
      "mix_cart",
      JSON.stringify(cart)
    );

    localStorage.setItem(
      "mix_favorites",
      JSON.stringify(favorites)
    );
  } catch (error) {
    console.warn("Ошибка сохранения:", error);
  }
}

function t(key) {
  return translations[lang][key] || key;
}

function money(value) {
  return new Intl.NumberFormat("ru-RU")
    .format(value) + " ₸";
}

// ========================================
// КАТЕГОРИИ
// ========================================

const productsSection =
  document.getElementById("productsSection");

const productsGrid =
  document.getElementById("productsGrid");

const productsTitle =
  document.getElementById("productsTitle");

const emptyMessage =
  document.getElementById("emptyMessage");

const categoryButtons =
  document.querySelectorAll(".collection-button");

function toggleCategory(category) {

  // Повторное нажатие закрывает коллекцию
  if (activeCategory === category) {
    closeCategory();
    return;
  }

  activeCategory = category;

  categoryButtons.forEach(button => {
    const selected =
      button.dataset.category === category;

    button.classList.toggle(
      "active",
      selected
    );

    button.setAttribute(
      "aria-expanded",
      String(selected)
    );
  });

  emptyMessage.hidden = true;
  productsSection.hidden = false;

  productsTitle.textContent =
    category === "classic"
      ? "Coffee Classic"
      : "Coffee Premium";

  renderProducts(category);
}

function closeCategory() {
  activeCategory = null;

  productsSection.hidden = true;
  emptyMessage.hidden = false;

  categoryButtons.forEach(button => {
    button.classList.remove("active");
    button.setAttribute("aria-expanded", "false");
  });
}

// ========================================
// КАРТОЧКИ ТОВАРОВ
// ========================================

function renderProducts(category) {

  productsGrid.replaceChildren();

  const filtered = products.filter(
    product => product.category === category
  );

  if (filtered.length === 0) {
    const message = document.createElement("p");
    message.textContent = t("empty");
    productsGrid.append(message);
    return;
  }

  filtered.forEach(product => {

    const card = document.createElement("article");
    card.className = "product-card";

    const picture = document.createElement("div");
    picture.className = "product-image";

    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.textContent = "✦";

    picture.append(placeholder);

    if (product.images.length > 0) {
      const img = document.createElement("img");
      img.alt = product.name;
      img.loading = "lazy";
      img.decoding = "async";

      img.addEventListener("load", () => {
        placeholder.hidden = true;
      });

      img.addEventListener("error", () => {
        img.hidden = true;
        placeholder.hidden = false;
      });

      img.src = product.images[0];
      picture.append(img);
    }

    const favoriteButton =
      document.createElement("button");

    favoriteButton.className =
      "favorite-button";

    favoriteButton.textContent =
      favorites.includes(product.id)
        ? "♥"
        : "♡";

    favoriteButton.classList.toggle(
      "selected",
      favorites.includes(product.id)
    );

    favoriteButton.setAttribute(
      "aria-label",
      t("favorites")
    );

    favoriteButton.addEventListener(
      "click",
      () => toggleFavorite(product.id)
    );

    picture.append(favoriteButton);

    const details = document.createElement("div");
    details.className = "product-details";

    const title = document.createElement("h4");
    title.textContent = product.name;

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = money(product.price);

    const addButton = document.createElement("button");
    addButton.className = "add-to-cart";
    addButton.textContent = t("add");

    addButton.addEventListener("click", () => {
      addToCart(product.id);
    });

    details.append(title, price, addButton);
    card.append(picture, details);
    productsGrid.append(card);
  });
}

// ========================================
// ИЗБРАННОЕ
// ========================================

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(
      item => item !== id
    );
  } else {
    favorites.push(id);
  }

  save();
  updateCounts();

  if (activeCategory) {
    renderProducts(activeCategory);
  }

  if (activePanel === "favorites") {
    renderPanel();
  }
}

// ========================================
// КОРЗИНА
// ========================================

function addToCart(id) {
  cart.push(id);
  save();
  updateCounts();
  showToast(t("added"));
}

function removeFromCart(id) {
  const index = cart.indexOf(id);

  if (index !== -1) {
    cart.splice(index, 1);
  }

  save();
  updateCounts();
  renderPanel();
}

function updateCounts() {
  document.getElementById("cartCount")
    .textContent = cart.length;

  document.getElementById("favoritesCount")
    .textContent = favorites.length;
}

// ========================================
// БОКОВАЯ ПАНЕЛЬ
// ========================================

const sidePanel =
  document.getElementById("sidePanel");

const overlay =
  document.getElementById("overlay");

const panelItems =
  document.getElementById("panelItems");

const panelFooter =
  document.getElementById("panelFooter");

function openPanel(type) {
  activePanel = type;

  sidePanel.classList.add("open");
  sidePanel.setAttribute("aria-hidden", "false");

  overlay.hidden = false;

  renderPanel();
}

function closePanel() {
  sidePanel.classList.remove("open");
  sidePanel.setAttribute("aria-hidden", "true");

  overlay.hidden = true;
  activePanel = null;
}

function renderPanel() {
  if (!activePanel) return;

  document.getElementById("panelTitle")
    .textContent = t(activePanel);

  panelItems.replaceChildren();

  const ids =
    activePanel === "cart"
      ? cart
      : favorites;

  const counts = new Map();

  ids.forEach(id => {
    if (products.some(p => p.id === id)) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  });

  if (counts.size === 0) {
    const empty = document.createElement("p");
    empty.textContent = t("empty");
    panelItems.append(empty);
  }

  let total = 0;

  counts.forEach((quantity, id) => {

    const product = products.find(
      p => p.id === id
    );

    if (!product) return;

    if (activePanel === "cart") {
      total += product.price * quantity;
    }

    const row = document.createElement("div");
    row.className = "panel-product";

    const info = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = money(
      product.price * quantity
    );

    info.append(name, price);

    if (activePanel === "cart") {
      const qty = document.createElement("small");
      qty.textContent =
        `${t("quantity")}: ${quantity}`;

      info.append(qty);
    }

    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.textContent = t("remove");

    remove.addEventListener("click", () => {
      if (activePanel === "cart") {
        removeFromCart(id);
      } else {
        toggleFavorite(id);
      }
    });

    row.append(info, remove);
    panelItems.append(row);
  });

  panelFooter.hidden = activePanel !== "cart";

  document.getElementById("cartTotal")
    .textContent = money(total);
}

// ========================================
// КОПИРОВАНИЕ ЗАКАЗА
// ========================================

async function copyOrder() {

  if (cart.length === 0) {
    showToast(t("empty"));
    return;
  }

  const counts = new Map();

  cart.forEach(id => {
    if (products.some(p => p.id === id)) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  });

  let total = 0;

  const lines = [
    "MIX COFFEE BRACELET",
    "Заказ:",
    ""
  ];

  counts.forEach((quantity, id) => {
    const product = products.find(p => p.id === id);

    const sum = product.price * quantity;
    total += sum;

    lines.push(
      `${product.name} × ${quantity} — ${money(sum)}`
    );
  });

  lines.push("");
  lines.push(`Итого: ${money(total)}`);

  try {
    await navigator.clipboard.writeText(
      lines.join("\n")
    );

    showToast(t("copied"));

  } catch {
    showToast(t("unavailable"));
  }
}

// ========================================
// ЯЗЫК
// ========================================

function changeLanguage(value) {
  lang = value;

  document.documentElement.lang =
    value === "kz" ? "kk" : "ru";

  document.querySelectorAll(
    "[data-i18n]"
  ).forEach(element => {
    element.textContent =
      t(element.dataset.i18n);
  });

  document.getElementById("copyOrder")
    .textContent = t("copy");

  if (activeCategory) {
    renderProducts(activeCategory);
  }

  if (activePanel) {
    renderPanel();
  }
}

// ========================================
// УВЕДОМЛЕНИЯ
// ========================================

let toastTimeout;

function showToast(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// ========================================
// ОБРАБОТЧИКИ КНОПОК
// ========================================

categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    toggleCategory(button.dataset.category);
  });
});

document.getElementById("closeCollection")
  .addEventListener("click", closeCategory);

document.getElementById("cartBtn")
  .addEventListener("click", () => {
    openPanel("cart");
  });

document.getElementById("favoritesBtn")
  .addEventListener("click", () => {
    openPanel("favorites");
  });

document.getElementById("closePanel")
  .addEventListener("click", closePanel);

overlay.addEventListener("click", closePanel);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closePanel();
  }
});

document.getElementById("copyOrder")
  .addEventListener("click", copyOrder);

document.getElementById("language")
  .addEventListener("change", event => {
    changeLanguage(event.target.value);
  });

// ========================================
// ЗАПУСК
// ========================================

updateCounts();
changeLanguage("ru");

// При открытии сайта обе коллекции скрыты
closeCategory();
