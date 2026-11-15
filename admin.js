
"use strict";

/* =========================================
   MIX COFFEE BRACELET — ADMIN PANEL
   Supabase + Gallery + Products
   ========================================= */

const el = id => document.getElementById(id);

const BUCKET = "bracelet-photos";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_PHOTOS = 6;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

let products = [];
let selectedProduct = null;
let editingPhotos = [];
let savingProduct = false;
let staffAccess = false;

const coverUrls = {
  classic: "",
  premium: ""
};

/* ========== HELPERS ========== */

function setMessage(id, message, isError = false) {
  const target = el(id);
  if (!target) return;

  target.textContent = message;
  target.className =
    "status " + (isError ? "error" : "success");
}

function formatPrice(amount) {
  return Number(amount).toLocaleString("ru-RU") + " ₸";
}

function categoryName(category) {
  return category === "premium"
    ? "Coffee Premium"
    : "Coffee Classic";
}

function sortPhotos(photos) {
  return [...(photos || [])].sort(
    (a, b) => a.position - b.position
  );
}

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + " МБ";
}

function validateImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Разрешены только JPG, PNG и WEBP."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Файл " + file.name +
      " слишком большой (" +
      formatSize(file.size) +
      "). Максимум — 25 МБ."
    );
  }

  if (file.size === 0) {
    throw new Error("Фотография пустая.");
  }
}

function fileExtension(file) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function friendlyError(error) {
  const message = error?.message || String(error);

  if (/maximum.*size|file.*size|too large|413/i.test(message)) {
    return (
      "Файл превышает лимит Supabase Storage. " +
      "Проверь настройки размера файлов в Supabase. " +
      "Подробности: " + message
    );
  }

  return message;
}

/* ========== SUPABASE STORAGE ========== */

async function uploadFile(file, folder) {
  validateImage(file);

  const path =
    folder + "/" +
    crypto.randomUUID() + "." +
    fileExtension(file);

  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600"
    });

  if (error) {
    throw new Error(friendlyError(error));
  }

  const { data } = db.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return {
    image_url: data.publicUrl,
    storage_path: path
  };
}

/* ========== AUTHENTICATION ========== */

async function checkStaff() {
  const { data, error } = await db.auth.getUser();

  if (error || !data?.user) return false;

  const result = await db.rpc("is_staff", {
    uid: data.user.id
  });

  if (result.error) {
    console.error(result.error);
    return false;
  }

  return result.data === true;
}

async function showScreen() {
  staffAccess = await checkStaff();

  el("loginSection").hidden = staffAccess;
  el("managerSection").hidden = !staffAccess;
  el("logout").hidden = !staffAccess;

  if (staffAccess) {
    await Promise.all([
      loadProducts(),
      loadCollectionCovers()
    ]);
  }
}

el("loginForm").addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const email = el("email").value.trim();
    const password = el("password").value;

    setMessage(
      "loginMessage",
      "Проверяем данные..."
    );

    const { error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(
        "loginMessage",
        "Ошибка входа: " + error.message,
        true
      );
      return;
    }

    el("password").value = "";

    if (!(await checkStaff())) {
      await db.auth.signOut();

      setMessage(
        "loginMessage",
        "У этого аккаунта нет прав администратора.",
        true
      );
      return;
    }

    await showScreen();
  }
);

el("logout").addEventListener(
  "click",
  async () => {
    await db.auth.signOut();
    closeEditor();
    await showScreen();
  }
);

/* ========== COLLECTION COVERS ========== */

function previewCover(category, url) {
  const target = el(
    category === "classic"
      ? "coverPreviewClassic"
      : "coverPreviewPremium"
  );

  target.replaceChildren();

  if (!url) {
    target.textContent = "Нет фотографии";
    return;
  }

  const image = document.createElement("img");

  image.src = url;
  image.alt = categoryName(category);

  image.onerror = () => {
    target.textContent =
      "Не удалось открыть фотографию";
  };

  target.appendChild(image);
}

async function loadCollectionCovers() {
  const { data, error } = await db
    .from("collection_covers")
    .select("category,image_url");

  if (error) {
    for (const category of ["Classic", "Premium"]) {
      setMessage(
        "coverStatus" + category,
        "Ошибка: " + error.message,
        true
      );
    }
    return;
  }

  for (const category of ["classic", "premium"]) {
    const found = (data || []).find(
      item => item.category === category
    );

    coverUrls[category] = found?.image_url || "";

    previewCover(
      category,
      coverUrls[category]
    );
  }
}

async function saveCover(category) {
  if (!staffAccess) return;

  const suffix =
    category === "classic" ? "Classic" : "Premium";

  const input = el("coverFile" + suffix);
  const button = el("saveCover" + suffix);
  const statusId = "coverStatus" + suffix;

  const file = input.files?.[0];

  if (!file) {
    setMessage(
      statusId,
      "Сначала выберите фотографию.",
      true
    );
    return;
  }

  button.disabled = true;
  setMessage(statusId, "Загружаем фотографию...");

  let uploaded = null;

  try {
    validateImage(file);

    uploaded = await uploadFile(file, "covers");

    const { data, error } = await db
      .from("collection_covers")
      .update({
        image_url: uploaded.image_url,
        storage_path: uploaded.storage_path,
        updated_at: new Date().toISOString()
      })
      .eq("category", category)
      .select("category")
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error(
        "Коллекция не найдена в базе данных."
      );
    }

    coverUrls[category] = uploaded.image_url;

    previewCover(category, uploaded.image_url);

    input.value = "";

    setMessage(
      statusId,
      "Фотография успешно опубликована!"
    );

  } catch (error) {
    if (uploaded?.storage_path) {
      await db.storage
        .from(BUCKET)
        .remove([uploaded.storage_path]);
    }

    setMessage(
      statusId,
      "Ошибка: " + friendlyError(error),
      true
    );

  } finally {
    button.disabled = false;
  }
}

el("saveCoverClassic").addEventListener(
  "click",
  () => saveCover("classic")
);

el("saveCoverPremium").addEventListener(
  "click",
  () => saveCover("premium")
);

for (const category of ["classic", "premium"]) {
  const suffix =
    category === "classic" ? "Classic" : "Premium";

  el("coverFile" + suffix).addEventListener(
    "change",
    event => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        validateImage(file);

      } catch (error) {
        setMessage(
          "coverStatus" + suffix,
          error.message,
          true
        );

        event.target.value = "";
        return;
      }

      const url = URL.createObjectURL(file);

      previewCover(category, url);

      const image = el(
        "coverPreview" + suffix
      ).querySelector("img");

      if (image) {
        const cleanup = () => URL.revokeObjectURL(url);

        image.addEventListener(
          "load",
          cleanup,
          { once: true }
        );

        image.addEventListener(
          "error",
          cleanup,
          { once: true }
        );
      }

      setMessage(
        "coverStatus" + suffix,
        "Файл выбран. Нажмите «Сохранить фото»."
      );
    }
  );
}

/* ========== LOAD PRODUCTS ========== */

async function loadProducts() {
  setMessage(
    "listMessage",
    "Загружаем браслеты..."
  );

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
        storage_path,
        position
      )
    `)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    setMessage(
      "listMessage",
      "Ошибка: " + error.message,
      true
    );
    return;
  }

  products = (data || []).map(product => ({
    ...product,
    bracelet_photos:
      sortPhotos(product.bracelet_photos)
  }));

  renderProducts();

  setMessage(
    "listMessage",
    "Всего браслетов: " + products.length
  );
}

/* ========== PRODUCT CARDS ========== */

function renderProducts() {
  const container = el("productList");
  container.replaceChildren();

  products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const photo = document.createElement("div");
    photo.className = "product-photo";

    const mainPhoto = product.bracelet_photos[0];

    if (mainPhoto?.image_url) {
      const image = document.createElement("img");

      image.src = mainPhoto.image_url;
      image.alt = categoryName(product.category);
      image.loading = "lazy";

      photo.appendChild(image);
    } else {
      photo.textContent = "Нет фотографии";
    }

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "edit-corner";
    edit.textContent = "✏️";
    edit.setAttribute(
      "aria-label",
      "Редактировать браслет"
    );

    edit.addEventListener(
      "click",
      () => openEditor(product)
    );

    photo.appendChild(edit);

    const content = document.createElement("div");
    content.className = "product-content";

    const name = document.createElement("h3");
    name.textContent = categoryName(product.category);

    const price = document.createElement("p");
    price.textContent = formatPrice(product.price);

    const photoCount = document.createElement("p");
    photoCount.className = "muted";
    photoCount.textContent =
      product.bracelet_photos.length + " фото";

    const status = document.createElement("p");
    status.className = "muted";
    status.textContent = product.published
      ? "Опубликован"
      : "Скрыт";

    const toggle = document.createElement("button");
    toggle.type = "button";

    toggle.className = product.published
      ? "danger remove-action"
      : "outline remove-action";

    toggle.textContent = product.published
      ? "− Убрать"
      : "+ Вернуть";

    toggle.addEventListener("click", async () => {
      const nextStatus = !product.published;

      const question = nextStatus
        ? "Опубликовать этот браслет?"
        : "Скрыть этот браслет от покупателей?";

      if (!confirm(question)) return;

      toggle.disabled = true;

      const { error } = await db
        .from("bracelets")
        .update({
          published: nextStatus
        })
        .eq("id", product.id);

      if (error) {
        alert("Ошибка: " + error.message);
        toggle.disabled = false;
        return;
      }

      await loadProducts();
    });

    content.append(
      name,
      price,
      photoCount,
      status,
      toggle
    );

    card.append(photo, content);
    container.appendChild(card);
  });
}

/* ========== OPEN EDITOR ========== */

function openEditor(product = null) {
  closeEditor();

  selectedProduct = product;

  editingPhotos = (
    product?.bracelet_photos || []
  ).map(photo => ({
    ...photo,
    kind: "existing"
  }));

  el("editorTitle").textContent = product
    ? "Редактировать браслет"
    : "Новый браслет";

  el("category").value =
    product?.category || "classic";

  el("price").value =
    product?.price || 3990;

  el("published").checked =
    product?.published ?? true;

  el("photoInput").value = "";

  setMessage("editorMessage", "");

  renderPhotos();

  el("editorSection").hidden = false;

  el("editorSection").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function closeEditor() {
  editingPhotos.forEach(photo => {
    if (photo.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }
  });

  editingPhotos = [];
  selectedProduct = null;

  el("editorSection").hidden = true;
}

el("addProduct").addEventListener(
  "click",
  () => openEditor()
);

el("cancelEdit").addEventListener(
  "click",
  closeEditor
);

/* ========== SELECT PHOTOS ========== */

el("photoInput").addEventListener(
  "change",
  event => {
    const files = Array.from(
      event.target.files || []
    );

    const errors = [];
    let added = 0;

    for (const file of files) {
      if (editingPhotos.length >= MAX_PHOTOS) {
        errors.push(
          "Можно добавить максимум " +
          MAX_PHOTOS + " фотографий."
        );
        break;
      }

      try {
        validateImage(file);

        editingPhotos.push({
          kind: "new",
          file,
          previewUrl: URL.createObjectURL(file)
        });

        added++;

      } catch (error) {
        errors.push(
          file.name + ": " + friendlyError(error)
        );
      }
    }

    event.target.value = "";

    renderPhotos();

    if (errors.length > 0) {
      setMessage(
        "editorMessage",
        "Добавлено: " + added +
        ". Ошибки: " + errors.join(" | "),
        true
      );
    } else {
      setMessage(
        "editorMessage",
        "Фотографии выбраны: " +
        editingPhotos.length +
        " из " + MAX_PHOTOS +
        ". Нажмите «Сохранить браслет»."
      );
    }
  }
);

/* ========== PHOTO ORDER ========== */

function movePhoto(index, direction) {
  const next = index + direction;

  if (
    next < 0 ||
    next >= editingPhotos.length
  ) {
    return;
  }

  [
    editingPhotos[index],
    editingPhotos[next]
  ] = [
    editingPhotos[next],
    editingPhotos[index]
  ];

  renderPhotos();
}

function removePhoto(index) {
  const photo = editingPhotos[index];

  if (photo.previewUrl) {
    URL.revokeObjectURL(photo.previewUrl);
  }

  editingPhotos.splice(index, 1);
  renderPhotos();
}

/* ========== PHOTO PREVIEW ========== */

function renderPhotos() {
  const container = el("photoList");
  container.replaceChildren();

  editingPhotos.forEach((photo, index) => {
    const item = document.createElement("div");
    item.className = "photo-item";

    const image = document.createElement("img");
    image.src =
      photo.previewUrl || photo.image_url;

    image.alt = "Фото " + (index + 1);

    const label = document.createElement("div");
    label.className = "photo-title";

    label.textContent = index === 0
      ? "Главное фото"
      : "Фото " + (index + 1);

    const controls = document.createElement("div");
    controls.className = "photo-controls";

    const left = document.createElement("button");
    left.type = "button";
    left.className = "outline";
    left.textContent = "←";
    left.disabled = index === 0;

    left.addEventListener(
      "click",
      () => movePhoto(index, -1)
    );

    const right = document.createElement("button");
    right.type = "button";
    right.className = "outline";
    right.textContent = "→";
    right.disabled =
      index === editingPhotos.length - 1;

    right.addEventListener(
      "click",
      () => movePhoto(index, 1)
    );

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "danger";
    remove.textContent = "×";

    remove.addEventListener(
      "click",
      () => removePhoto(index)
    );

    controls.append(left, right, remove);

    item.append(image, label, controls);
    container.appendChild(item);
  });
}

/* ========== SAVE PRODUCT ========== */

el("productForm").addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    if (savingProduct || !staffAccess) return;

    if (!editingPhotos.length) {
      setMessage(
        "editorMessage",
        "Добавьте хотя бы одну фотографию.",
        true
      );
      return;
    }

    if (editingPhotos.length > MAX_PHOTOS) {
      setMessage(
        "editorMessage",
        "Максимум 6 фотографий.",
        true
      );
      return;
    }

    const price = Number(el("price").value);

    if (!Number.isInteger(price) || price <= 0) {
      setMessage(
        "editorMessage",
        "Укажите правильную цену.",
        true
      );
      return;
    }

    savingProduct = true;
    el("saveProduct").disabled = true;

    let productId = selectedProduct?.id;
    const newProduct = !productId;
    const previousPublished =
      selectedProduct?.published ?? false;

    const uploadedPaths = [];
    let dbPhotosWritten = false;

    try {
      const category = el("category").value;
      const published = el("published").checked;

      // Проверяем все новые изображения.
      for (const photo of editingPhotos) {
        if (photo.kind === "new") {
          validateImage(photo.file);
        }
      }

      setMessage(
        "editorMessage",
        "Подготавливаем браслет..."
      );

      // Сначала загружаем новые фотографии.
      // Старый товар пока не изменяется.
      const orderedPhotos = [];

      for (let i = 0; i < editingPhotos.length; i++) {
        const photo = editingPhotos[i];

        if (photo.kind === "existing") {
          orderedPhotos.push({
            kind: "existing",
            id: photo.id
          });

        } else {
          setMessage(
            "editorMessage",
            "Загружаем фото " +
            (i + 1) + " из " +
            editingPhotos.length + "..."
          );

          const uploaded = await uploadFile(
            photo.file,
            "products"
          );

          uploadedPaths.push(uploaded.storage_path);

          orderedPhotos.push({
            kind: "new",
            ...uploaded
          });
        }
      }

      setMessage(
        "editorMessage",
        "Сохраняем данные в Supabase..."
      );

      if (newProduct) {
        const { data, error } = await db
          .from("bracelets")
          .insert({
            category,
            price,
            published: false
          })
          .select("id")
          .single();

        if (error) throw error;

        productId = data.id;

      } else {
        const { error } = await db
          .from("bracelets")
          .update({
            category,
            price,
            published: false
          })
          .eq("id", productId);

        if (error) throw error;
      }

      const oldPhotos =
        selectedProduct?.bracelet_photos || [];

      const retainedIds = new Set(
        editingPhotos
          .filter(photo => photo.kind === "existing")
          .map(photo => photo.id)
      );

      // Сохраняем порядок фотографий.
      for (let i = 0; i < orderedPhotos.length; i++) {
        const photo = orderedPhotos[i];

        if (photo.kind === "existing") {
          const { error } = await db
            .from("bracelet_photos")
            .update({ position: i })
            .eq("id", photo.id);

          if (error) throw error;

        } else {
          const { error } = await db
            .from("bracelet_photos")
            .insert({
              bracelet_id: productId,
              image_url: photo.image_url,
              storage_path: photo.storage_path,
              position: i
            });

          if (error) throw error;
        }

        dbPhotosWritten = true;
      }

      // Удаляем записи о снятых фотографиях.
      for (const photo of oldPhotos) {
        if (retainedIds.has(photo.id)) continue;

        const { error } = await db
          .from("bracelet_photos")
          .delete()
          .eq("id", photo.id);

        if (error) throw error;
      }

      // Публикуем товар только после сохранения.
      const { error: publishError } = await db
        .from("bracelets")
        .update({ published })
        .eq("id", productId);

      if (publishError) throw publishError;

      await loadProducts();

      closeEditor();

      setMessage(
        "listMessage",
        "Браслет успешно сохранён! " +
        "Фотографий: " + orderedPhotos.length
      );

    } catch (error) {
      console.error("Ошибка сохранения:", error);

      // Если новые фотографии уже записаны
      // в таблицу, не удаляем их из Storage:
      // так мы не создадим битые ссылки.
      if (!dbPhotosWritten && uploadedPaths.length) {
        const { error: cleanupError } = await db.storage
          .from(BUCKET)
          .remove(uploadedPaths);

        if (cleanupError) {
          console.error(
            "Ошибка очистки файлов:",
            cleanupError
          );
        }
      }

      // Пытаемся вернуть прежний статус товара.
      if (!newProduct && productId) {
        const { error: restoreError } = await db
          .from("bracelets")
          .update({ published: previousPublished })
          .eq("id", productId);

        if (restoreError) {
          console.error(
            "Ошибка восстановления статуса:",
            restoreError
          );
        }
      }

      setMessage(
        "editorMessage",
        "Ошибка сохранения: " +
        friendlyError(error) +
        ". Проверьте данные перед повторной попыткой.",
        true
      );

    } finally {
      savingProduct = false;
      el("saveProduct").disabled = false;
    }
  }
);

/* ========== START ========== */

showScreen().catch(error => {
  console.error("Ошибка запуска админ-панели:", error);
});
