
"use strict";

/* ДҮКЕН */

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

/* CLASSIC — 6 ФОТО */

const classicProducts = Array.from(
  { length: 6 },
  (_, index) => {
    const number = String(index + 1)
      .padStart(2, "0");

    return {
      id: "c" + number,
      category: "classic",
      price: PRICES.classic,
      image: "images/classic-" + number + ".jpg"
    };
  }
);

/* PREMIUM — 6 ФОТО */

const premiumProducts = Array.from(
  { length: 6 },
  (_, index) => {
    const number = String(index + 1)
      .padStart(2, "0");

    return {
      id: "p" + number,
      category: "premium",
      price: PRICES.premium,
      image: "images/premium-" + number + ".jpg"
    };
  }
);

/* БАРЛЫҒЫ — 12 БІЛЕЗІК */

const PRODUCTS = [
  ...classicProducts,
  ...premiumProducts
];
