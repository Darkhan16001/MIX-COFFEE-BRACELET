
"use strict";

/* =========================================
   MIX BRACELET — SCRIPT.JS
   CLASSIC: 6 білезік, 3990 ₸
   PREMIUM: 6 білезік, 5990 ₸

   Collection cover:
   Classic  → classic-01.jpg
   Premium  → premium-04.jpg
========================================= */

/* =========================================
   1. ҮШ ТІЛДЕГІ АУДАРМАЛАР
========================================= */

const TEXTS = {
  kz: {
    tagline: "Іріктелген кофе дәндері 🤎",

    heroDescription:
      "Кофе әрдайым жаныңда. Кофеге деген махаббат – білегіңде.",

    viewCollection: "Коллекцияны көру",

    collectionEyebrow: "КОЛЛЕКЦИЯ",
    collectionTitle: "Біздің коллекция",

    collectionSubtitle:
      "Өзіңізге ұнайтын топтаманы таңдаңыз.",

    classicLabel: "КЛАССИКАЛЫҚ ТОПТАМА",
    premiumLabel: "ПРЕМИУМ ТОПТАМА",

    classicShort:
      "Серпімді резеңке жіптен жасалған білезік",

    premiumShort:
      "Арнайы берік жіптен жасалған білезік",

    classicDescription:
      "Классикалық кофе білезігі серпімді резеңке жіптен жасалған. Оны қолға оңай тағып, шешуге болады.",

    premiumDescription:
      "Классикалық кофе білезігі білезік жасауға арналған арнайы берік жіптен жасалған.",

    photoComing: "Фото қосу",
    back: "← Артқа",
    productCount: "білезік",
    noProducts: "Тауар табылмады.",

    favorites: "Таңдаулылар",
    favoritesEmpty:
      "Әзірге таңдаулы тауарлар жоқ.",

    favoriteAdd: "Таңдаулыға қосу",
    favoriteRemove: "Таңдаулыдан алып тастау",

    addToCart: "Себетке қосу",

    cart: "Себет",
    cartEmpty: "Себет бос",
    total: "Жалпы сома",
    remove: "Өшіру",

    decrease: "Санын азайту",
    increase: "Санын көбейту",
    closeCart: "Себетті жабу",

    whatsappOrder:
      "WhatsApp арқылы тапсырыс беру",

    copyOrder: "Тізімді көшіру",
    copied: "Тапсырыс тізімі көшірілді!",
    copyError: "Көшіру мүмкін болмады.",

    footerTitle:
      "Әр бөлшекте ерекше мән бар."
  },

  ru: {
    tagline: "Отборные кофейные зёрна 🤎",

    heroDescription:
      "Кофе всегда рядом. Любовь к кофе — на твоём запястье.",

    viewCollection: "Смотреть коллекцию",

    collectionEyebrow: "КОЛЛЕКЦИЯ",
    collectionTitle: "Наша коллекция",

    collectionSubtitle:
      "Выберите понравившуюся коллекцию.",

    classicLabel: "КЛАССИЧЕСКАЯ КОЛЛЕКЦИЯ",
    premiumLabel: "ПРЕМИАЛЬНАЯ КОЛЛЕКЦИЯ",

    classicShort:
      "Браслет на эластичной резинке",

    premiumShort:
      "Браслет на специальной прочной нити",

    classicDescription:
      "Классический кофейный браслет, выполненный на эластичной резинке, благодаря которой его удобно надевать и снимать.",

    premiumDescription:
      "Классический кофейный браслет выполнен на специальной прочной нити для изготовления браслетов.",

    photoComing: "Добавить фото",
    back: "← Назад",
    productCount: "браслетов",
    noProducts: "Товары не найдены.",

    favorites: "Избранное",
    favoritesEmpty:
      "В избранном пока нет товаров.",

    favoriteAdd: "Добавить в избранное",
    favoriteRemove: "Убрать из избранного",

    addToCart: "В корзину",

    cart: "Корзина",
    cartEmpty: "Корзина пуста",
    total: "Итого",
    remove: "Удалить",

    decrease: "Уменьшить количество",
    increase: "Увеличить количество",
    closeCart: "Закрыть корзину",

    whatsappOrder:
      "Заказать через WhatsApp",

    copyOrder: "Скопировать список",
    copied: "Список заказа скопирован!",
    copyError: "Не удалось скопировать.",

    footerTitle:
      "Особенность в каждой детали."
  },

  en: {
    tagline: "Carefully Selected Coffee Beans 🤎",

    heroDescription:
      "Coffee is always with you. Wear your love for coffee on your wrist.",

    viewCollection: "Explore collection",

    collectionEyebrow: "COLLECTION",
    collectionTitle: "Our collection",

    collectionSubtitle:
      "Choose your favorite collection.",

    classicLabel: "CLASSIC COLLECTION",
    premiumLabel: "PREMIUM COLLECTION",

    classicShort:
      "Bracelet with an elastic cord",

    premiumShort:
      "Bracelet with a special durable cord",

    classicDescription:
      "A classic coffee bracelet made with an elastic cord, making it easy and comfortable to put on and take off.",

    premiumDescription:
      "A classic coffee bracelet crafted with a special durable cord designed for bracelet making.",

    photoComing: "Add photo",
    back: "← Back",
    productCount: "bracelets",
    noProducts: "No products found.",

    favorites: "Favorites",
    favoritesEmpty:
      "You have no favorite products yet.",

    favoriteAdd: "Add to favorites",
    favoriteRemove: "Remove from favorites",

    addToCart: "Add to cart",

    cart: "Cart",
    cartEmpty: "Your cart is empty",
    total: "Total",
    remove: "Remove",

    decrease: "Decrease quantity",
    increase: "Increase quantity",
    closeCart: "Close cart",

    whatsappOrder:
      "Order via WhatsApp",

    copyOrder: "Copy order",
    copied: "Order copied!",
    copyError: "Could not copy the order.",

    footerTitle:
      "Beauty in every detail."
  }
};

/* =========================================
   2. ЖАДТА САҚТАУ
========================================= */

function loadData(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    return value === null
      ? fallback
      : JSON.parse(value);

  } catch (error) {
    return fallback;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(data)
    );

  } catch (error) {
    // Сақтау мүмкін болмаса да сайт жұмыс істейді.
  }
}

/* =========================================
   3. БАСТАПҚЫ МӘЛІМЕТТЕР
========================================= */

// Алдыңғы сайттағы сақталған лайктар
// мен себетті жоғалтпау үшін v7 кілттері сақталды.

const savedLanguage = loadData(
  "mix-language-v7",
  "kz"
);

let language =
  Object.prototype.hasOwnProperty.call(
    TEXTS,
    savedLanguage
  )
    ? savedLanguage
    : "kz";

const validProductIds = new Set(
  PRODUCTS.map(product => product.id)
);

const savedFavorites = loadData(
  "mix-favorites-v7",
  []
);

const favorites = new Set(
  Array.isArray(savedFavorites)
    ? savedFavorites.filter(id =>
        validProductIds.has(id)
      )
    : []
);

const savedCart = loadData(
  "mix-cart-v7",
  []
);

let cart = Array.isArray(savedCart)
  ? savedCart
      .filter(item =>
        item &&
        validProductIds.has(item.id) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      )
      .map(item => ({
        id: item.id,
        quantity: Math.min(
          item.quantity,
          99
        )
      }))
  : [];

let currentView = "classic";

let cartOpen = false;

let lastFocusedElement = null;

/* =========================================
   4. КӨМЕКШІ ФУНКЦИЯЛАР
========================================= */

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

function formatPrice(price) {
  return new Intl.NumberFormat("ru-RU")
    .format(price) + " ₸";
}

function productDescription(product) {
  return product.category === "classic"
    ? t("classicDescription")
    : t("premiumDescription");
}

function scrollToSection(element) {
  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================================
   5. HTML ЭЛЕМЕНТТЕРІ
========================================= */

const productsSection =
  document.getElementById("products");

const productGrid =
  document.getElementById("productGrid");

const productsTitle =
  document.getElementById("productsTitle");

const productsEyebrow =
  document.getElementById("productsEyebrow");

const categoryTabs =
  document.getElementById("categoryTabs");

const productCount =
  document.getElementById("productCount");

const emptyState =
  document.getElementById("emptyState");

const emptyMessage =
  document.getElementById("emptyMessage");

const favoritesButton =
  document.getElementById("favoritesButton");

const favoritesCount =
  document.getElementById("favoritesCount");

const cartButton =
  document.getElementById("cartButton");

const cartCount =
  document.getElementById("cartCount");

const cartPanel =
  document.getElementById("cartPanel");

const cartBackdrop =
  document.getElementById("cartBackdrop");

const cartItems =
  document.getElementById("cartItems");

const totalPrice =
  document.getElementById("totalPrice");

const orderWhatsApp =
  document.getElementById("orderWhatsApp");

const copyOrderButton =
  document.getElementById("copyOrder");

/* =========================================
   6. ФОТОЛАРДЫ КӨРСЕТУ
========================================= */

function displayImage(container, product) {
  container.replaceChildren();

  function showPlaceholder() {
    const placeholder =
      document.createElement("span");

    placeholder.textContent =
      t("photoComing");

    container.replaceChildren(placeholder);
  }

  if (!product || !product.image) {
    showPlaceholder();
    return;
  }

  const image =
    document.createElement("img");

  image.src = product.image;

  image.alt = categoryName(
    product.category
  );

  image.loading = "lazy";

  image.onerror = () => {
    showPlaceholder();
  };

  container.appendChild(image);
}

/* =========================================
   7. КОЛЛЕКЦИЯ СЫРТЫНДАҒЫ ФОТОЛАР
========================================= */

function renderCollectionCovers() {

  /*
    COFFEE CLASSIC
    1-СУРЕТ
    images/classic-01.jpg
  */

  const classicCoverProduct =
    PRODUCTS.find(product =>
      product.id === "c01"
    );

  /*
    COFFEE PREMIUM
    4-СУРЕТ
    images/premium-04.jpg
  */

  const premiumCoverProduct =
    PRODUCTS.find(product =>
      product.id === "p04"
    );

  displayImage(
    document.getElementById("classicCover"),
    classicCoverProduct
  );

  displayImage(
    document.getElementById("premiumCover"),
    premiumCoverProduct
  );
}

/* =========================================
   8. ТІЛ АУЫСТЫРУ
========================================= */

function setLanguage(newLanguage) {
  if (
    !Object.prototype.hasOwnProperty.call(
      TEXTS,
      newLanguage
    )
  ) {
    return;
  }

  language = newLanguage;

  saveData(
    "mix-language-v7",
    language
  );

  document.documentElement.lang =
    language === "kz" ? "kk" : language;

  // Статикалық жазулар
  document.querySelectorAll("[data-i18n]")
    .forEach(element => {

      const key = element.dataset.i18n;

      element.textContent = t(key);

    });

  // Тіл батырмалары
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

  favoritesButton.setAttribute(
    "aria-label",
    t("favorites")
  );

  cartButton.setAttribute(
    "aria-label",
    t("cart")
  );

  document.getElementById("cartTitle")
    .textContent = t("cart");

  document.getElementById("totalLabel")
    .textContent = t("total");

  document.getElementById("closeCart")
    .setAttribute(
      "aria-label",
      t("closeCart")
    );

  orderWhatsApp.textContent =
    t("whatsappOrder");

  copyOrderButton.textContent =
    t("copyOrder");

  document.getElementById("cartMessage")
    .textContent = "";

  renderCollectionCovers();

  renderProducts();

  renderCart();
}

/* =========================================
   9. ЖОҒАРҒЫ САНАУЫШТАР
========================================= */

function updateCounters() {

  favoritesCount.textContent =
    favorites.size;

  cartCount.textContent =
    cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
}

/* =========================================
   10. ТАУАР КАРТОЧКАСЫН ЖАСАУ
========================================= */

function createProductCard(product) {

  const card =
    document.createElement("article");

  card.className = "product-card";

  /* ФОТО */

  const photo =
    document.createElement("div");

  photo.className = "product-photo";

  displayImage(photo, product);

  /* ЖҮРЕК */

  const heart =
    document.createElement("button");

  heart.type = "button";

  heart.className = "favorite-button";

  const liked =
    favorites.has(product.id);

  heart.textContent =
    liked ? "♥" : "♡";

  heart.classList.toggle(
    "active",
    liked
  );

  heart.setAttribute(
    "aria-label",
    liked
      ? t("favoriteRemove")
      : t("favoriteAdd")
  );

  heart.setAttribute(
    "aria-pressed",
    String(liked)
  );

  heart.addEventListener(
    "click",
    () => toggleFavorite(product.id)
  );

  photo.appendChild(heart);

  /* МӘЛІМЕТТЕР */

  const info =
    document.createElement("div");

  info.className = "product-info";

  /* СИПАТТАМА */

  const description =
    document.createElement("p");

  description.className =
    "product-description";

  description.textContent =
    productDescription(product);

  /* БАҒА */

  const price =
    document.createElement("p");

  price.className =
    "product-price";

  price.textContent =
    formatPrice(product.price);

  /* СЕБЕТКЕ ҚОСУ */

  const addButton =
    document.createElement("button");

  addButton.type = "button";

  addButton.className =
    "add-to-cart";

  addButton.textContent =
    t("addToCart");

  addButton.addEventListener(
    "click",
    () => addToCart(product.id)
  );

  /*
    ЖЕКЕ АТАУЛАР ЖОҚ.

    Coffee Classic 01,
    Coffee Premium 02
    деген жазулар көрсетілмейді.
  */

  info.append(
    description,
    price,
    addButton
  );

  card.append(
    photo,
    info
  );

  return card;
}

/* =========================================
   11. КОЛЛЕКЦИЯНЫ АШУ
========================================= */

function openCategory(category) {

  if (
    category !== "classic" &&
    category !== "premium"
  ) {
    return;
  }

  currentView = category;

  productsSection.hidden = false;

  renderProducts();

  scrollToSection(productsSection);
}

/* =========================================
   12. ТАҢДАУЛЫЛАРДЫ АШУ
========================================= */

function openFavorites() {

  currentView = "favorites";

  productsSection.hidden = false;

  renderProducts();

  scrollToSection(productsSection);
}

/* =========================================
   13. ЛАЙК ҚОСУ / АЛУ
========================================= */

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

/* =========================================
   14. ӨНІМДЕРДІ КӨРСЕТУ
========================================= */

function renderProducts() {

  if (currentView === "favorites") {

    productsTitle.textContent =
      t("favorites");

    productsEyebrow.textContent =
      t("favorites");

    categoryTabs.hidden = true;

  } else {

    productsTitle.textContent =
      categoryName(currentView);

    productsEyebrow.textContent =
      t("collectionEyebrow");

    categoryTabs.hidden = false;

  }

  // Classic / Premium таңдалған батырма
  document.querySelectorAll(".category-tab")
    .forEach(button => {

      const active =
        button.dataset.category === currentView;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        String(active)
      );

    });

  const visibleProducts =
    PRODUCTS.filter(product => {

      if (currentView === "favorites") {

        return favorites.has(
          product.id
        );

      }

      return product.category === currentView;

    });

  productGrid.replaceChildren();

  visibleProducts.forEach(product => {

    productGrid.appendChild(
      createProductCard(product)
    );

  });

  productCount.textContent =
    visibleProducts.length +
    " " +
    t("productCount");

  emptyMessage.textContent =
    currentView === "favorites"
      ? t("favoritesEmpty")
      : t("noProducts");

  emptyState.hidden =
    visibleProducts.length !== 0;

  updateCounters();
}

/* =========================================
   15. СЕБЕТТІ САҚТАУ
========================================= */

function saveCart() {

  saveData(
    "mix-cart-v7",
    cart
  );

}

/* =========================================
   16. СЕБЕТКЕ ҚОСУ
========================================= */

function addToCart(id) {

  const product = getProduct(id);

  if (!product) return;

  const existing =
    cart.find(item =>
      item.id === id
    );

  if (existing) {

    existing.quantity =
      Math.min(
        existing.quantity + 1,
        99
      );

  } else {

    cart.push({
      id: id,
      quantity: 1
    });

  }

  saveCart();

  renderCart();

  openCart();
}

/* =========================================
   17. САНЫН ӨЗГЕРТУ
========================================= */

function changeQuantity(id, delta) {

  const item =
    cart.find(entry =>
      entry.id === id
    );

  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {

    cart = cart.filter(entry =>
      entry.id !== id
    );

  } else {

    item.quantity =
      Math.min(
        item.quantity,
        99
      );

  }

  saveCart();

  renderCart();
}

/* =========================================
   18. СЕБЕТТЕН ӨШІРУ
========================================= */

function removeFromCart(id) {

  cart = cart.filter(item =>
    item.id !== id
  );

  saveCart();

  renderCart();
}

/* =========================================
   19. ЖАЛПЫ БАҒАНЫ ЕСЕПТЕУ
========================================= */

function calculateTotal() {

  return cart.reduce(
    (sum, item) => {

      const product =
        getProduct(item.id);

      if (!product) {
        return sum;
      }

      return sum +
        product.price * item.quantity;

    },
    0
  );
}

/* =========================================
   20. ТАПСЫРЫС МӘТІНІ
========================================= */

function buildOrderText() {

  const lines = [
    STORE.name,
    "-------------------------"
  ];

  cart.forEach(item => {

    const product =
      getProduct(item.id);

    if (!product) return;

    /*
      Сатып алушыға сайтта
      жеке атау көрсетілмейді.

      Бірақ тапсырыста C01,
      P04 сияқты код болады.
      Сол арқылы қай фото
      таңдалғанын білуге болады.
    */

    lines.push(
      categoryName(product.category) +
      " (" +
      product.id.toUpperCase() +
      ")" +
      " × " +
      item.quantity +
      " — " +
      formatPrice(
        product.price * item.quantity
      )
    );

  });

  lines.push(
    "-------------------------"
  );

  lines.push(
    t("total") +
    ": " +
    formatPrice(
      calculateTotal()
    )
  );

  return lines.join("\n");
}

/* =========================================
   21. WHATSAPP СІЛТЕМЕСІ
========================================= */

function updateWhatsAppLink() {

  if (cart.length === 0) {

    orderWhatsApp.removeAttribute(
      "href"
    );

    orderWhatsApp.classList.add(
      "disabled"
    );

    orderWhatsApp.setAttribute(
      "aria-disabled",
      "true"
    );

    return;
  }

  const message =
    buildOrderText();

  const url =
    "https://wa.me/" +
    STORE.whatsapp +
    "?text=" +
    encodeURIComponent(message);

  orderWhatsApp.href = url;

  orderWhatsApp.classList.remove(
    "disabled"
  );

  orderWhatsApp.setAttribute(
    "aria-disabled",
    "false"
  );
}

/* =========================================
   22. СЕБЕТТІ КӨРСЕТУ
========================================= */

function renderCart() {

  cartItems.replaceChildren();

  if (cart.length === 0) {

    const empty =
      document.createElement("p");

    empty.className = "cart-empty";

    empty.textContent =
      t("cartEmpty");

    cartItems.appendChild(empty);

  }

  cart.forEach(item => {

    const product =
      getProduct(item.id);

    if (!product) return;

    const row =
      document.createElement("div");

    row.className = "cart-item";

    /* ФОТО */

    const photo =
      document.createElement("div");

    photo.className =
      "cart-item-photo";

    displayImage(photo, product);

    /* АҚПАРАТ */

    const info =
      document.createElement("div");

    info.className =
      "cart-item-info";

    /* КОЛЛЕКЦИЯ АТАУЫ */

    const category =
      document.createElement("p");

    category.className =
      "cart-item-category";

    category.textContent =
      categoryName(product.category);

    /* БАҒА */

    const price =
      document.createElement("p");

    price.className =
      "cart-item-price";

    price.textContent =
      formatPrice(
        product.price * item.quantity
      );

    /* САНЫ */

    const quantity =
      document.createElement("div");

    quantity.className =
      "quantity-row";

    /* МИНУС */

    const minus =
      document.createElement("button");

    minus.type = "button";

    minus.className =
      "qty-button";

    minus.textContent = "−";

    minus.setAttribute(
      "aria-label",
      t("decrease")
    );

    minus.addEventListener(
      "click",
      () => changeQuantity(
        product.id,
        -1
      )
    );

    /* САН */

    const amount =
      document.createElement("strong");

    amount.textContent =
      item.quantity;

    /* ПЛЮС */

    const plus =
      document.createElement("button");

    plus.type = "button";

    plus.className =
      "qty-button";

    plus.textContent = "+";

    plus.setAttribute(
      "aria-label",
      t("increase")
    );

    plus.addEventListener(
      "click",
      () => changeQuantity(
        product.id,
        1
      )
    );

    quantity.append(
      minus,
      amount,
      plus
    );

    /* ӨШІРУ */

    const remove =
      document.createElement("button");

    remove.type = "button";

    remove.className =
      "remove-item";

    remove.textContent =
      t("remove");

    remove.addEventListener(
      "click",
      () => removeFromCart(
        product.id
      )
    );

    info.append(
      category,
      price,
      quantity,
      remove
    );

    row.append(
      photo,
      info
    );

    cartItems.appendChild(row);

  });

  totalPrice.textContent =
    formatPrice(
      calculateTotal()
    );

  copyOrderButton.disabled =
    cart.length === 0;

  updateWhatsAppLink();

  updateCounters();
}

/* =========================================
   23. СЕБЕТТІ АШУ
========================================= */

function openCart() {

  if (cartOpen) return;

  cartOpen = true;

  lastFocusedElement =
    document.activeElement;

  cartBackdrop.hidden = false;

  cartPanel.classList.add(
    "open"
  );

  cartPanel.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "cart-open"
  );

  requestAnimationFrame(() => {

    cartBackdrop.classList.add(
      "visible"
    );

  });

  document.getElementById(
    "closeCart"
  ).focus();
}

/* =========================================
   24. СЕБЕТТІ ЖАБУ
========================================= */

function closeCart() {

  if (!cartOpen) return;

  cartOpen = false;

  cartPanel.classList.remove(
    "open"
  );

  cartPanel.setAttribute(
    "aria-hidden",
    "true"
  );

  cartBackdrop.classList.remove(
    "visible"
  );

  document.body.classList.remove(
    "cart-open"
  );

  if (
    lastFocusedElement &&
    lastFocusedElement.isConnected
  ) {

    lastFocusedElement.focus();

  } else {

    cartButton.focus();

  }

  setTimeout(() => {

    if (!cartOpen) {
      cartBackdrop.hidden = true;
    }

  }, 300);
}

/* =========================================
   25. ТІЗІМДІ КӨШІРУ
========================================= */

async function copyOrderText() {

  if (cart.length === 0) return;

  const text =
    buildOrderText();

  const message =
    document.getElementById(
      "cartMessage"
    );

  let success = false;

  try {

    if (!navigator.clipboard) {
      throw new Error(
        "Clipboard unavailable"
      );
    }

    await navigator.clipboard.writeText(
      text
    );

    success = true;

  } catch (error) {

    const textarea =
      document.createElement(
        "textarea"
      );

    textarea.value = text;

    textarea.style.position =
      "fixed";

    textarea.style.opacity =
      "0";

    document.body.appendChild(
      textarea
    );

    textarea.focus();

    textarea.select();

    try {

      success =
        document.execCommand(
          "copy"
        );

    } catch (error) {

      success = false;

    }

    textarea.remove();
  }

  message.textContent =
    success
      ? t("copied")
      : t("copyError");
}

/* =========================================
   26. ТІЛ ТАҢДАУ БАТЫРМАЛАРЫ
========================================= */

document.querySelectorAll(
  ".lang-btn"
).forEach(button => {

  button.addEventListener(
    "click",
    () => {

      setLanguage(
        button.dataset.lang
      );

    }
  );

});

/* =========================================
   27. CLASSIC / PREMIUM АШУ
========================================= */

document.querySelectorAll(
  "[data-open-category]"
).forEach(button => {

  button.addEventListener(
    "click",
    () => {

      openCategory(
        button.dataset.openCategory
      );

    }
  );

});

/* =========================================
   28. КОЛЛЕКЦИЯЛАРДЫ АУЫСТЫРУ
========================================= */

document.querySelectorAll(
  ".category-tab"
).forEach(button => {

  button.addEventListener(
    "click",
    () => {

      openCategory(
        button.dataset.category
      );

    }
  );

});

/* =========================================
   29. ТАҢДАУЛЫЛАР БАТЫРМАСЫ
========================================= */

favoritesButton.addEventListener(
  "click",
  openFavorites
);

/* =========================================
   30. АРТҚА ҚАЙТУ
========================================= */

document.getElementById(
  "backButton"
).addEventListener("click", () => {

  productsSection.hidden = true;

  scrollToSection(
    document.getElementById(
      "collection"
    )
  );

});

/* =========================================
   31. СЕБЕТ БАТЫРМАЛАРЫ
========================================= */

cartButton.addEventListener(
  "click",
  openCart
);

document.getElementById(
  "closeCart"
).addEventListener(
  "click",
  closeCart
);

cartBackdrop.addEventListener(
  "click",
  closeCart
);

/* =========================================
   32. ПЕРНЕТАҚТА
========================================= */

document.addEventListener(
  "keydown",
  event => {

    if (!cartOpen) return;

    // ESC — СЕБЕТТІ ЖАБУ
    if (event.key === "Escape") {

      closeCart();

      return;
    }

    // TAB — СЕБЕТ ІШІНДЕ ҚАЛУ
    if (event.key !== "Tab") {
      return;
    }

    const focusable = [
      ...cartPanel.querySelectorAll(
        'button:not([disabled]), a[href]:not([aria-disabled="true"])'
      )
    ].filter(element =>
      element.getClientRects().length > 0
    );

    if (!focusable.length) return;

    const first =
      focusable[0];

    const last =
      focusable[
        focusable.length - 1
      ];

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

  }
);

/* =========================================
   33. ТІЗІМДІ КӨШІРУ БАТЫРМАСЫ
========================================= */

copyOrderButton.addEventListener(
  "click",
  copyOrderText
);

/* =========================================
   34. САЙТТЫ ІСКЕ ҚОСУ
========================================= */

document.getElementById(
  "year"
).textContent =
  new Date().getFullYear();

setLanguage(language);
