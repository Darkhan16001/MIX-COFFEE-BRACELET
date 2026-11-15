
"use strict";

window.MIX_STORE = {
  name: "MIX COFFEE BRACELET",
  whatsapp: "77058038122",
  instagram: "mix_coffee_bracelet",

  prices: {
    classic: 3990,
    premium: 5990
  },

  maxPhotos: 6,
  maxFileMB: 25,
  bucket: "bracelet-photos"
};

window.mixMoney = function(value) {
  return Number(value).toLocaleString("ru-RU") + " ₸";
};

window.mixCategory = function(category) {
  return category === "premium"
    ? "Coffee Premium"
    : "Coffee Classic";
};

window.mixPhotos = function(product) {
  return [...(product.bracelet_photos || [])]
    .filter(photo => photo.image_url)
    .sort((a, b) => a.position - b.position);
};
