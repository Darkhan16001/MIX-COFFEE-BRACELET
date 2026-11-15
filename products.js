
"use strict";

/* ДҮКЕН МӘЛІМЕТТЕРІ */

const STORE = {
  name: "MIX BRACELET",
  whatsapp: "77058038122",
  instagram: "mix_coffee_bracelet"
};

/* БАҒАЛАР */

const PRICES = {
  classic: 3990,
  premium: 5990
};

/* CLASSIC — 6 БІЛЕЗІК */

const classicProducts = [1, 2, 3, 4, 5, 6].map(
  number => {
    const n = String(number).padStart(2, "0");

    return {
      id: "c" + n,
      category: "classic",
      price: PRICES.classic,
      image: "images/classic-" + n + ".jpg"
    };
  }
);

/* PREMIUM — 5 БІЛЕЗІК */
/* premium-06.jpg қолданылмайды */

const premiumProducts = [1, 2, 3, 4, 5].map(
  number => {
    const n = String(number).padStart(2, "0");

    return {
      id: "p" + n,
      category: "premium",
      price: PRICES.premium,
      image: "images/premium-" + n + ".jpg"
    };
  }
);

/* БАРЛЫҚ ТАУАРЛАР */

const PRODUCTS = [
  ...classicProducts,
  ...premiumProducts
];

/* КОЛЛЕКЦИЯ МҰҚАБАЛАРЫ */

const COLLECTION_COVERS = {
  classic: "c01",
  premium: "p04"
};
