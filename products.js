
"use strict";

const STORE = {
  name: "MIX BRACELET",
  whatsapp: "77058038122",
  instagram: "mix_coffee_bracelet"
};

const PRICES = {
  classic: 3990,
  premium: 5990
};

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

const PRODUCTS = [
  ...classicProducts,
  ...premiumProducts
];

const COLLECTION_COVERS = {
  classic: "c01",
  premium: "p04"
};
