
"use strict";

/* MIX BRACELET — ADMIN */

const el = id => document.getElementById(id);

const BUCKET = "bracelet-photos";

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

/* HELPERS */

function setMessage(id, text, isError = false) {
  const target = el(id);

  target.textContent = text;

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

function validateImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Разрешены только JPG, PNG и WEBP."
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      "Фотография должна быть меньше 5 МБ."
    );
  }
}

function fileExtension(file) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

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
      upsert: false
    });

  if (error) throw error;

  const { data } = db.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return {
    image_url: data.publicUrl,
    storage_path: path
  };
}

/* AUTHENTICATION */

async function checkStaff() {
  const {
    data: { user },
    error
  } = await db.auth.getUser();

  if (error || !user) return false;

  const result = await db.rpc("is_staff", {
    uid: user.id
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

    const { error } =
      await db.auth.signInWithPassword({
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
        "У этого аккаунта нет прав управления.",
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

/* COLLECTION COVERS */

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

  const img = document.createElement("img");

  img.src = url;
  img.alt = categoryName(category);

  img.onerror = () => {
    target.textContent =
      "Не удалось открыть фотографию";
  };

  target.appendChild(img);
}

async function loadCollectionCovers() {
  const { data, error } = await db
    .from("collection_covers")
    .select("category,image_url");

  if (error) {
    setMessage(
      "coverStatusClassic",
      "Ошибка: " + error.message,
      true
    );
    return;
  }

  for (const category of ["classic", "premium"]) {
    const found = (data || []).find(
      item => item.category === category
    );

    coverUrls[category] =
      found?.image_url || "";

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
    uploaded = await uploadFile(
      file,
      "covers"
    );

    // Строки classic и premium уже созданы SQL-кодом.
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

    previewCover(
      category,
      uploaded.image_url
    );

    input.value = "";

    setMessage(
      statusId,
      "Фото сохранено! Оно появится в магазине."
    );

  } catch (error) {
    // При ошибке записи удаляем только что
    // загруженный, но не сохранённый файл.
    if (uploaded?.storage_path) {
      await db.storage
        .from(BUCKET)
        .remove([uploaded.storage_path]);
    }

    setMessage(
      statusId,
      "Ошибка: " + error.message,
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

// Локальный предварительный просмотр
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
        image.addEventListener(
          "load",
          () => URL.revokeObjectURL(url),
          { once: true }
        );
        image.addEventListener(
          "error",
          () => URL.revokeObjectURL(url),
          { once: true }
        );
      }

      setMessage(
        "coverStatus" + suffix,
        "Нажмите «Сохранить фото»."
      );
    }
  );
}

/* PRODUCTS */

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
      error.message,
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

function renderProducts() {
  const container = el("productList");
  container.replaceChildren();

  products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const photo = document.createElement("div");
    photo.className = "product-photo";

    const mainPhoto =
      product.bracelet_photos[0];

    if (mainPhoto?.image_url) {
      const image = document.createElement("img");
      image.src = mainPhoto.image_url;
      image.alt = categoryName(product.category);
      image.loading = "lazy";
      photo.appendChild(image);
    } else {
      photo.textContent = "Нет фотографии";
    }

    // Карандаш в правом верхнем углу
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
    name.textContent =
      categoryName(product.category);

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
        alert(error.message);
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

/* PRODUCT EDITOR */

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

el("photoInput").addEventListener(
  "change",
  event => {
    const files = Array.from(
      event.target.files || []
    );

    for (const file of files) {
      try {
        validateImage(file);

        editingPhotos.push({
          kind: "new",
          file,
          previewUrl: URL.createObjectURL(file)
        });

      } catch (error) {
        setMessage(
          "editorMessage",
          error.message,
          true
        );
      }
    }

    event.target.value = "";
    renderPhotos();
  }
);

function movePhoto(index, direction) {
  const next = index + direction;

  if (
    next < 0 ||
    next >= editingPhotos.length
  ) return;

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

/* SAVE PRODUCT */

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

    setMessage(
      "editorMessage",
      "Сохраняем браслет..."
    );

    let productId = selectedProduct?.id;
    const newProduct = !productId;

    try {
      const category = el("category").value;
      const published = el("published").checked;

      // Новый товар создаётся скрытым.
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
        // Скрываем товар на время замены фото.
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

      // Сначала загружаем новые файлы
      const orderedPhotos = [];

      for (const photo of editingPhotos) {
        if (photo.kind === "existing") {
          orderedPhotos.push({
            kind: "existing",
            id: photo.id
          });
        } else {
          const uploaded = await uploadFile(
            photo.file,
            "products"
          );

          orderedPhotos.push({
            kind: "new",
            ...uploaded
          });
        }
      }

      // Сохраняем фотографии и порядок
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
      }

      // Удаляем снятые из галереи записи
      for (const photo of oldPhotos) {
        if (retainedIds.has(photo.id)) continue;

        const { error } = await db
          .from("bracelet_photos")
          .delete()
          .eq("id", photo.id);

        if (error) throw error;

        // Старый файл не удаляем автоматически:
        // это безопаснее для восстановления.
      }

      // Публикуем после сохранения всех данных
      const { error: publishError } = await db
        .from("bracelets")
        .update({ published })
        .eq("id", productId);

      if (publishError) throw publishError;

      await loadProducts();

      closeEditor();

      setMessage(
        "listMessage",
        "Браслет успешно сохранён!"
      );

    } catch (error) {
      setMessage(
        "editorMessage",
        "Ошибка: " + error.message,
        true
      );

      console.error(error);

    } finally {
      savingProduct = false;
      el("saveProduct").disabled = false;
    }
  }
);

/* START */

showScreen();
