
"use strict";

/* ======================================
   MIX COFFEE BRACELET
   PRODUCTS — SUPABASE
   ====================================== */

const STORE = {
  name: "MIX COFFEE BRACELET",
  whatsapp: "77058038122",
  instagram: "mix_coffee_bracelet"
};

const PRICES = {
  classic: 3990,
  premium: 5990
};

// Товары загружаются из общей базы.
let PRODUCTS = [];

let COLLECTION_COVERS = {
  classic: "",
  premium: ""
};

/* ======================================
   HELPERS
====================================== */

function productCategoryName(category) {
  return category === "premium"
    ? "Coffee Premium"
    : "Coffee Classic";
}

function sortProductPhotos(photos) {
  return [...(photos || [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );
}

/* ======================================
   LOAD PRODUCTS
====================================== */

async function loadProductsFromSupabase() {
  if (typeof db === "undefined") {
    throw new Error(
      "Supabase не подключён. Проверь supabase-client.js"
    );
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
        storage_path,
        position
      )
    `)
    .eq("published", true)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error(
      "Ошибка загрузки товаров:",
      error
    );

    throw new Error(
      "Не удалось загрузить браслеты: " +
      error.message
    );
  }

  PRODUCTS = (data || []).map(product => {
    const photos = sortProductPhotos(
      product.bracelet_photos
    );

    return {
      id: product.id,
      category: product.category,

      name: productCategoryName(
        product.category
      ),

      price: Number(product.price),

      published: product.published,

      // Главное фото для карточки.
      image: photos[0]?.image_url || "",

      // Все фото для галереи.
      images: photos.map(
        photo => photo.image_url
      ),

      bracelet_photos: photos
    };
  });

  console.log(
    "Загружено браслетов:",
    PRODUCTS.length
  );

  return PRODUCTS;
}

/* ======================================
   LOAD COLLECTION COVERS
====================================== */

async function loadCoversFromSupabase() {
  const { data, error } = await db
    .from("collection_covers")
    .select("category,image_url");

  if (error) {
    console.error(
      "Ошибка загрузки обложек:",
      error
    );

    throw new Error(error.message);
  }

  COLLECTION_COVERS = {
    classic: "",
    premium: ""
  };

  for (const cover of data || []) {
    if (
      cover.category === "classic" ||
      cover.category === "premium"
    ) {
      COLLECTION_COVERS[cover.category] =
        cover.image_url || "";
    }
  }

  return COLLECTION_COVERS;
}

/* ======================================
   LOAD ALL STORE DATA
====================================== */

async function loadStoreData() {
  const [products, covers] = await Promise.all([
    loadProductsFromSupabase(),
    loadCoversFromSupabase()
  ]);

  return {
    products,
    covers
  };
}
