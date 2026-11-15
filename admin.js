
"use strict";

const el = id => document.getElementById(id);
const cfg = MIX_STORE;

let adminProducts = [];
let editingProduct = null;
let selectedPhotos = [];
let saving = false;

function message(id, text, error = false) {
  const target = el(id);
  if (!target) return;

  target.textContent = text;
  target.className =
    "status" + (error ? " error" : "");
}

function validateFile(file) {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowed.includes(file.type)) {
    throw new Error(
      file.name + ": разрешены только JPG, PNG и WEBP."
    );
  }

  if (file.size > cfg.maxFileMB * 1024 * 1024) {
    throw new Error(
      file.name + ": размер больше 25 МБ."
    );
  }

  if (!file.size) {
    throw new Error("Пустой файл: " + file.name);
  }
}

function fileExt(file) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function uploadPhoto(file, folder) {
  validateFile(file);

  const path =
    folder + "/" +
    crypto.randomUUID() + "." +
    fileExt(file);

  const { error } = await db.storage
    .from(cfg.bucket)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    throw new Error(
      "Не удалось загрузить " +
      file.name + ": " + error.message
    );
  }

  const { data } = db.storage
    .from(cfg.bucket)
    .getPublicUrl(path);

  return {
    image_url: data.publicUrl,
    storage_path: path
  };
}

/* ===== AUTH ===== */

async function isStaff() {
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

async function showAdmin() {
  const allowed = await isStaff();

  el("loginSection").hidden = allowed;
  el("managerSection").hidden = !allowed;
  el("logout").hidden = !allowed;

  if (allowed) {
    await Promise.all([
      loadAdminProducts(),
      loadAdminCovers()
    ]);
  }
}

el("loginForm").addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    message("loginMessage", "Выполняется вход...");

    const { error } = await db.auth
      .signInWithPassword({
        email: el("email").value.trim(),
        password: el("password").value
      });

    if (error) {
      message(
        "loginMessage",
        error.message,
        true
      );
      return;
    }

    if (!(await isStaff())) {
      await db.auth.signOut();

      message(
        "loginMessage",
        "У аккаунта нет прав администратора.",
        true
      );
      return;
    }

    el("password").value = "";
    await showAdmin();
  }
);

el("logout").addEventListener(
  "click",
  async () => {
    await db.auth.signOut();
    closeEditor();
    await showAdmin();
  }
);

/* ===== PRODUCTS ===== */

async function loadAdminProducts() {
  message("listMessage", "Загружаем товары...");

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
    message(
      "listMessage",
      error.message,
      true
    );
    return;
  }

  adminProducts = (data || []).map(product => ({
    ...product,
    bracelet_photos: mixPhotos(product)
  }));

  renderAdminProducts();

  message(
    "listMessage",
    "Всего браслетов: " + adminProducts.length
  );
}

function renderAdminProducts() {
  const container = el("productList");
  container.replaceChildren();

  adminProducts.forEach(product => {
    const card = document.createElement("article");
    card.className = "admin-product";

    const photo = document.createElement("img");
    photo.src = mixPhotos(product)[0]?.image_url || "";
    photo.alt = mixCategory(product.category);

    const name = document.createElement("h3");
    name.textContent = mixCategory(product.category);

    const price = document.createElement("p");
    price.textContent = mixMoney(product.price);

    const count = document.createElement("p");
    count.textContent =
      mixPhotos(product).length + " фото";

    const status = document.createElement("p");
    status.textContent = product.published
      ? "Опубликован"
      : "Скрыт";

    const edit = document.createElement("button");
    edit.className = "outline-button";
    edit.textContent = "✏️ Редактировать";
    edit.addEventListener("click", () => {
      openEditor(product);
    });

    const toggle = document.createElement("button");
    toggle.className = "outline-button";
    toggle.textContent = product.published
      ? "− Убрать"
      : "+ Вернуть";

    toggle.addEventListener("click", async () => {
      const next = !product.published;

      if (!confirm(
        next
          ? "Опубликовать браслет?"
          : "Скрыть браслет?"
      )) return;

      toggle.disabled = true;

      const { error } = await db
        .from("bracelets")
        .update({ published: next })
        .eq("id", product.id);

      if (error) {
        alert(error.message);
        toggle.disabled = false;
        return;
      }

      await loadAdminProducts();
    });

    card.append(
      photo,
      name,
      price,
      count,
      status,
      edit,
      toggle
    );

    container.appendChild(card);
  });
}

/* ===== EDITOR ===== */

function closeEditor() {
  selectedPhotos.forEach(photo => {
    if (photo.preview) {
      URL.revokeObjectURL(photo.preview);
    }
  });

  selectedPhotos = [];
  editingProduct = null;
  el("editorSection").hidden = true;
}

function openEditor(product = null) {
  closeEditor();

  editingProduct = product;

  selectedPhotos = (
    product?.bracelet_photos || []
  ).map(photo => ({
    kind: "existing",
    ...photo
  }));

  el("editorTitle").textContent = product
    ? "Редактировать браслет"
    : "Добавить браслет";

  el("category").value =
    product?.category || "classic";

  el("price").value =
    product?.price ||
    cfg.prices.classic;

  el("published").checked =
    product?.published ?? true;

  el("photoInput").value = "";
  message("editorMessage", "");

  el("editorSection").hidden = false;
  renderEditorPhotos();

  el("editorSection").scrollIntoView({
    behavior: "smooth"
  });
}

function renderEditorPhotos() {
  const list = el("photoList");
  list.replaceChildren();

  selectedPhotos.forEach((photo, index) => {
    const item = document.createElement("div");
    item.className = "photo-preview-item";

    const image = document.createElement("img");
    image.src = photo.preview || photo.image_url;
    image.alt = "Фото " + (index + 1);

    const label = document.createElement("p");
    label.textContent = index === 0
      ? "Главное фото"
      : "Фото " + (index + 1);

    const controls = document.createElement("div");
    controls.className = "photo-buttons";

    const left = document.createElement("button");
    left.type = "button";
    left.textContent = "←";
    left.disabled = index === 0;

    left.addEventListener("click", () => {
      movePhoto(index, -1);
    });

    const right = document.createElement("button");
    right.type = "button";
    right.textContent = "→";
    right.disabled =
      index === selectedPhotos.length - 1;

    right.addEventListener("click", () => {
      movePhoto(index, 1);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";

    remove.addEventListener("click", () => {
      removePhoto(index);
    });

    controls.append(left, right, remove);
    item.append(image, label, controls);
    list.appendChild(item);
  });
}

function movePhoto(index, step) {
  const next = index + step;

  if (next < 0 || next >= selectedPhotos.length) {
    return;
  }

  [
    selectedPhotos[index],
    selectedPhotos[next]
  ] = [
    selectedPhotos[next],
    selectedPhotos[index]
  ];

  renderEditorPhotos();
}

function removePhoto(index) {
  const photo = selectedPhotos[index];

  if (photo.preview) {
    URL.revokeObjectURL(photo.preview);
  }

  selectedPhotos.splice(index, 1);
  renderEditorPhotos();
}

el("photoInput").addEventListener(
  "change",
  event => {
    const files = [...(event.target.files || [])];
    const errors = [];
    let added = 0;

    for (const file of files) {
      if (selectedPhotos.length >= cfg.maxPhotos) {
        errors.push(
          "Максимум 6 фотографий на браслет."
        );
        break;
      }

      try {
        validateFile(file);

        selectedPhotos.push({
          kind: "new",
          file,
          preview: URL.createObjectURL(file)
        });

        added++;

      } catch (error) {
        errors.push(error.message);
      }
    }

    event.target.value = "";
    renderEditorPhotos();

    message(
      "editorMessage",
      "Добавлено: " + added +
      ". Всего: " + selectedPhotos.length +
      "/6." +
      (errors.length ? "\n" + errors.join("\n") : ""),
      errors.length > 0
    );
  }
);

el("addProduct").addEventListener(
  "click",
  () => openEditor()
);

el("cancelEdit").addEventListener(
  "click",
  closeEditor
);

el("reloadProducts").addEventListener(
  "click",
  loadAdminProducts
);

el("category").addEventListener("change", () => {
  if (editingProduct) return;

  el("price").value =
    cfg.prices[el("category").value];
});

/* ===== SAVE ===== */

el("productForm").addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    if (saving) return;

    if (!(await isStaff())) {
      message(
        "editorMessage",
        "Нет прав администратора.",
        true
      );
      return;
    }

    if (!selectedPhotos.length) {
      message(
        "editorMessage",
        "Добавьте хотя бы одну фотографию.",
        true
      );
      return;
    }

    const price = Number(el("price").value);

    if (!Number.isInteger(price) || price <= 0) {
      message(
        "editorMessage",
        "Укажите правильную цену.",
        true
      );
      return;
    }

    saving = true;
    el("saveProduct").disabled = true;

    const category = el("category").value;
    const published = el("published").checked;

    const uploadedPaths = [];
    let recordsStarted = false;

    try {
      const prepared = [];

      // Сначала загружаем новые файлы,
      // не меняя существующий товар.
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];

        if (photo.kind === "existing") {
          prepared.push({
            kind: "existing",
            ...photo
          });
          continue;
        }

        message(
          "editorMessage",
          "Загружаем фото " + (i + 1) +
          " из " + selectedPhotos.length + "..."
        );

        const uploaded = await uploadPhoto(
          photo.file,
          "products"
        );

        uploadedPaths.push(uploaded.storage_path);

        prepared.push({
          kind: "new",
          ...uploaded
        });
      }

      message(
        "editorMessage",
        "Сохраняем браслет в базе..."
      );

      let id = editingProduct?.id;

      if (!id) {
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
        id = data.id;
        recordsStarted = true;

      } else {
        // При редактировании не скрываем
        // уже опубликованный товар.
        const { error } = await db
          .from("bracelets")
          .update({ category, price })
          .eq("id", id);

        if (error) throw error;
        recordsStarted = true;
      }

      // Промежуточные позиции для новых фото.
      const newEntries = prepared.filter(
        photo => photo.kind === "new"
      );

      if (newEntries.length) {
        const rows = newEntries.map((photo, index) => ({
          bracelet_id: id,
          image_url: photo.image_url,
          storage_path: photo.storage_path,
          position: 1000 + index
        }));

        const { error } = await db
          .from("bracelet_photos")
          .insert(rows);

        if (error) throw error;
      }

      // Получаем новые ID фотографий.
      const { data: saved, error: readError } = await db
        .from("bracelet_photos")
        .select(
          "id,image_url,storage_path,position"
        )
        .eq("bracelet_id", id);

      if (readError) throw readError;

      const newIdsByPath = new Map(
        (saved || []).map(photo => [
          photo.storage_path,
          photo.id
        ])
      );

      for (let i = 0; i < prepared.length; i++) {
        const photo = prepared[i];

        const photoId = photo.kind === "existing"
          ? photo.id
          : newIdsByPath.get(photo.storage_path);

        if (!photoId) {
          throw new Error(
            "Не удалось определить фото №" + (i + 1)
          );
        }

        const { error } = await db
          .from("bracelet_photos")
          .update({ position: i })
          .eq("id", photoId);

        if (error) throw error;
      }

      // Удаляем из галереи записи об удалённых фото.
      const retainedIds = new Set(
        prepared
          .filter(photo => photo.kind === "existing")
          .map(photo => photo.id)
      );

      for (const old of editingProduct?.bracelet_photos || []) {
        if (retainedIds.has(old.id)) continue;

        const { error } = await db
          .from("bracelet_photos")
          .delete()
          .eq("id", old.id);

        if (error) throw error;
      }

      // Публикуем после сохранения фото.
      const { error: publishError } = await db
        .from("bracelets")
        .update({ published })
        .eq("id", id);

      if (publishError) throw publishError;

      closeEditor();
      await loadAdminProducts();

      message(
        "listMessage",
        "Браслет сохранён! Фото: " +
        prepared.length
      );

    } catch (error) {
      console.error(error);

      // Не удаляем файлы, если записи
      // уже могли быть созданы в базе.
      if (!recordsStarted && uploadedPaths.length) {
        await db.storage
          .from(cfg.bucket)
          .remove(uploadedPaths);
      }

      message(
        "editorMessage",
        "Ошибка сохранения: " + error.message +
        "\nПроверьте товар перед повторной загрузкой.",
        true
      );

    } finally {
      saving = false;
      el("saveProduct").disabled = false;
    }
  }
);

/* ===== COVERS ===== */

async function loadAdminCovers() {
  const { data, error } = await db
    .from("collection_covers")
    .select("category,image_url");

  if (error) {
    console.error(error);
    return;
  }

  for (const category of ["classic", "premium"]) {
    const suffix =
      category === "classic" ? "Classic" : "Premium";

    const element = el("coverPreview" + suffix);
    element.replaceChildren();

    const cover = (data || []).find(
      item => item.category === category
    );

    if (cover?.image_url) {
      const img = document.createElement("img");
      img.src = cover.image_url;
      img.alt = category;

      element.appendChild(img);
    } else {
      element.textContent = "Нет обложки";
    }
  }
}

async function saveCover(category) {
  const suffix =
    category === "classic" ? "Classic" : "Premium";

  const input = el("coverFile" + suffix);
  const button = el("saveCover" + suffix);
  const file = input.files?.[0];

  if (!file) {
    message(
      "coverStatus" + suffix,
      "Выберите фотографию.",
      true
    );
    return;
  }

  button.disabled = true;

  let uploaded = null;

  try {
    if (!(await isStaff())) {
      throw new Error("Нет прав администратора");
    }

    uploaded = await uploadPhoto(file, "covers");

    const { error } = await db
      .from("collection_covers")
      .upsert({
        category,
        image_url: uploaded.image_url,
        storage_path: uploaded.storage_path,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "category"
      });

    if (error) throw error;

    input.value = "";

    await loadAdminCovers();

    message(
      "coverStatus" + suffix,
      "Обложка сохранена!"
    );

  } catch (error) {
    if (uploaded?.storage_path) {
      await db.storage
        .from(cfg.bucket)
        .remove([uploaded.storage_path]);
    }

    message(
      "coverStatus" + suffix,
      error.message,
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

/* ===== START ===== */

showAdmin().catch(error => {
  console.error(error);
  message("loginMessage", error.message, true);
});
