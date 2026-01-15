// =======================
// set.js - Página individual de un set
// =======================

const API_BASE = "https://api.tcgdex.net/v2/en/sets";

let currentCards = [];       // Cartas originales del set
let renderedCards = [];      // Cartas renderizadas (Master/Base Set)
let activeTypes = new Set(); // Tipos filtrados
let currentIndex = 0;        // Carta seleccionada en popup
let quickOwnActive = false;
let masterSetActive = true;

// =======================
// ELEMENTOS DOM
// =======================
const quickOwnBtn = document.getElementById("quickOwn");
const masterSetBtn = document.getElementById("master-set");
const toggleBtn = document.getElementById("toggle-opacity-btn");
const cardsContainer = document.getElementById("cards-container");
const popup = document.getElementById("image-popup");
const popupInner = document.querySelector(".popup-inner");
const deleteBtn = document.getElementById("delete");

// =======================
// UTILIDADES - Owned
// =======================

function getCardTrendPrice(card) {
  const variant = card.variant || "normal";
  const pricing = resolvePricing(card, variant);
  return pricing?.trend || 0;
}

function resolvePricing(card, variant) {
  const pricing = card.pricing?.cardmarket;
  if (!pricing) return null;

  const suffixPriority = {
    reverse: ["-reverse", "-holo", ""],
    holo: ["-holo", ""],
    normal: [""],
    base: [""]
  };

  const suffixes = suffixPriority[variant] || [""];

  const isValid = (value) =>
    value !== null && value !== undefined && value !== 0;

  for (const suffix of suffixes) {
    const trend = pricing[`trend${suffix}`];
    if (isValid(trend)) {
      return {
        trend,
        avg7: pricing[`avg7${suffix}`],
        avg30: pricing[`avg30${suffix}`],
        usedSuffix: suffix || "normal"
      };
    }
  }

  return null;
}

function renderPricing(card) {
  const pricingEl = document.getElementById("card-pricing");
  if (!pricingEl) return;

  const variant = card.variant || "normal";
  const prices = resolvePricing(card, variant);

  if (!prices) {
    pricingEl.textContent = "No price data";
    return;
  }

  pricingEl.innerHTML = `
    <div>Trend: <span>€${prices.trend.toFixed(2)}</div>
    <div>7d: <span>€${prices.avg7?.toFixed(2) ?? "—"}</div>
    <div>30d: <span>€${prices.avg30?.toFixed(2) ?? "—"}</div>
  `;
}

function calculateOwnedPercentage() {
  const owned = JSON.parse(localStorage.getItem("ownedCards")) || {};

  const total = renderedCards.length;
  if (total === 0) return 0;

  let ownedCount = 0;

  renderedCards.forEach(card => {
    const variants = owned[card.id]?.variants;
    if (!variants) return;

    if (masterSetActive) {
      // MASTER SET → variante concreta
      if (variants[card.variant || "base"]?.copies > 0) {
        ownedCount++;
      }
    } else {
      // BASE SET → cualquier variante
      if (Object.values(variants).some(v => v.copies > 0)) {
        ownedCount++;
      }
    }
  });

  return Math.round((ownedCount / total) * 100);
}

function calculateOwnedValue() {
  const owned = JSON.parse(localStorage.getItem("ownedCards")) || {};
  let total = 0;

  currentCards.forEach(card => {
    const variants = owned[card.id]?.variants;
    if (!variants) return;

    Object.entries(variants).forEach(([variant, data]) => {
      if (data.copies > 0) {
        total += getCardTrendPrice({ ...card, variant });
      }
    });
  });

  return total;
}

function calculateSetValue() {
  let total = 0;

  currentCards.forEach(card => {
    const variants = expandCardVariants(card);

    variants.forEach(vCard => {
      total += getCardTrendPrice(vCard);
    });
  });

  return total;
}

function renderOverviewData() {
  const ownedPercentageEl = document.getElementById("owned-percentage");
  const ownedValueEl = document.getElementById("owned-value");
  const setValueEl = document.getElementById("set-value");

  if (!ownedPercentageEl) return;

  ownedPercentageEl.textContent = `${calculateOwnedPercentage()}%`;
  ownedValueEl.textContent = `€${calculateOwnedValue().toFixed(2)}`;
  setValueEl.textContent = `€${calculateSetValue().toFixed(2)}`;
}

/**
 * Marca una carta como owned.
 * @param {Object} card - Carta completa
 * @param {Number} copies - Número de copias
 * @param {String} language - Idioma
 * @param {String} mode - "variant" (solo la variante) o "all" (todas)
 */
function setOwned(card, copies = 1, language = "en", mode = "variant") {
  const owned = JSON.parse(localStorage.getItem("ownedCards")) || {};
  if (!owned[card.id]) owned[card.id] = { variants: {} };

  if (mode === "variant") {
    const variant = card.variant || "base";
    if (!owned[card.id].variants[variant])
      owned[card.id].variants[variant] = { copies: 0, languages: [] };
    owned[card.id].variants[variant].copies = copies;
    if (!owned[card.id].variants[variant].languages.includes(language))
      owned[card.id].variants[variant].languages.push(language);

  } else if (mode === "all") {
    const variants = Object.keys(card.variants || { base: true });
    variants.forEach(variant => {
      if (!owned[card.id].variants[variant])
        owned[card.id].variants[variant] = { copies: 0, languages: [] };
      owned[card.id].variants[variant].copies = copies;
      if (!owned[card.id].variants[variant].languages.includes(language))
        owned[card.id].variants[variant].languages.push(language);
    });
  }

  localStorage.setItem("ownedCards", JSON.stringify(owned));
  applyOwnedFilter();
  renderOverviewData();
}

/**
 * Devuelve los datos de owned de una carta y variante
 */
function loadOwnedData(cardId, variant) {
  const owned = JSON.parse(localStorage.getItem("ownedCards")) || {};
  const data = owned[cardId]?.variants?.[variant];
  document.getElementById("card-copies").value = data?.copies || 0;
}

// =======================
// INTERACCIONES UI
// =======================

// QuickOwn toggle
quickOwnBtn.addEventListener("click", () => {
  quickOwnActive = !quickOwnActive;
  quickOwnBtn.classList.toggle("active", quickOwnActive);
});

// Master/Base Set toggle
masterSetBtn.addEventListener("click", () => {
  masterSetActive = !masterSetActive;
  masterSetBtn.textContent = masterSetActive ? "MASTER SET" : "BASE SET";
  renderFilteredCards();
  applyOwnedFilter();
  renderOverviewData();
});

// Toggle OWNED / ALL
toggleBtn.addEventListener("click", () => {
  const newMode = toggleBtn.dataset.mode === "ALL" ? "OWNED" : "ALL";
  toggleBtn.dataset.mode = newMode;
  toggleBtn.textContent = newMode.toUpperCase();
  applyOwnedFilter();
});

// Delete all cards from current set
deleteBtn.addEventListener("click", () => {
  if (!currentCards.length) return;
  const owned = JSON.parse(localStorage.getItem("ownedCards")) || {};

  currentCards.forEach(card => delete owned[card.id]);

  localStorage.setItem("ownedCards", JSON.stringify(owned));
  applyOwnedFilter();
  renderOverviewData()
  alert(`Se han borrado las cartas del set actual (${currentCards.length})`);
});

// =======================
// CLIC EN CARTAS
// =======================

document.addEventListener("click", (e) => {
  const cardEl = e.target.closest(".card");
  if (!cardEl) return;

  const cardId = cardEl.dataset.cardId;
  const variant = cardEl.dataset.variant || "base";

  const card = renderedCards.find(
    c => c.id === cardId && (c.variant || "base") === variant
  );
  if (!card) return;

  if (quickOwnActive) {
    const language = document.getElementById("language-select")?.value || "en";

    if (masterSetActive) {
      // QuickOwn en Master Set → marcar solo esta variante
      setOwned(card, 1, language, "variant");
    } else {
      // QuickOwn en Base Set → marcar todas las variantes
      setOwned(card, 1, language, "all");
    }

  } else {
    currentIndex = renderedCards.indexOf(card);
    openPopup(card);
  }
});

// =======================
// POPUP
// =======================

function openPopup(card) {
  if (!card) return;
  popup.classList.remove("hidden");

  const variant = card.variant || "normal";

  document.getElementById("popup-image").src = `${card.image}/high.png`;
  document.getElementById("card-name").textContent =
    `${card.name} (${variant})`;

  loadOwnedData(card.id, variant);
  renderPricing(card);
}

// Cerrar popup al hacer click en overlay
popup.addEventListener("click", () => popup.classList.add("hidden"));
popupInner.addEventListener("click", (e) => e.stopPropagation());

// Navegación con flechas
document.querySelector(".nav-btn.prev").addEventListener("click", e => {
  e.stopPropagation();
  if (currentIndex > 0) openPopup(renderedCards[--currentIndex]);
});
document.querySelector(".nav-btn.next").addEventListener("click", e => {
  e.stopPropagation();
  if (currentIndex < renderedCards.length - 1) openPopup(renderedCards[++currentIndex]);
});

// Guardar cambios de popup
document.getElementById("save-card").addEventListener("click", () => {
  const card = renderedCards[currentIndex];
  const copies = parseInt(document.getElementById("card-copies").value);
  const language = document.getElementById("card-language").value;
  const mode = masterSetActive ? "variant" : "all";
  setOwned(card, copies, language, mode);
});

// =======================
// FILTROS / TIPOS
// =======================

document.querySelectorAll("#type-buttons-container button").forEach(button => {
  const type = button.dataset.type;
  const img = button.querySelector("img");

  button.addEventListener("click", () => {
    const isActive = button.classList.toggle("active");
    img.src = isActive ? `Types/bg/${type}.png` : `Types/no-bg/${type}.png`;
    isActive ? activeTypes.add(type) : activeTypes.delete(type);
    loadSetPage();
  });
});

// =======================
// FILTRADO DE OPACIDAD - OWNED
// =======================

function applyOwnedFilter() {
  const ownedCards = JSON.parse(localStorage.getItem("ownedCards")) || {};
  const isOwnedView = toggleBtn.dataset.mode === "OWNED";

  document.querySelectorAll(".card").forEach(cardEl => {
    const img = cardEl.querySelector("img");
    const cardId = cardEl.dataset.cardId;
    const variant = cardEl.dataset.variant || "base";

    let isOwned = masterSetActive
      ? ownedCards[cardId]?.variants?.[variant]?.copies > 0
      : Object.values(ownedCards[cardId]?.variants || {}).some(v => v.copies > 0);

    img.style.opacity = !isOwnedView || isOwned ? "1" : "0.3";
  });
}

// =======================
// RENDERIZADO DE CARTAS
// =======================

function logRenderedCardsDetailed() {
  if (!renderedCards || renderedCards.length === 0) {
    console.warn("No hay cartas renderizadas");
    return;
  }

  console.group("🃏 Rendered cards (detailed)");

  renderedCards.forEach((card, index) => {
    console.group(`${index + 1}. ${card.id}`);

    console.log("name:", card.name || "—");
    console.log("variant:", card.variant || "base");
    console.log("rarity:", card.rarity || "unknown");
    console.log("localId:", card.localId || "—");

    console.groupEnd();
  });

  console.groupEnd();
}


function isVariant(card) {
  return card.variant && card.variant !== "base";
}

function expandCardVariants(card) {
  if (!card.variants) return [{ ...card, variant: "base" }];

  const variantNames = Object.entries(card.variants)
    .filter(([_, v]) => v === true)
    .map(([name]) => name);

  if (!variantNames.length) return [{ ...card, variant: "base" }];

  return variantNames.map(variant => ({ ...card, variant }));
}

function renderFilteredCards() {
  const cardsContainer = document.getElementById("cards-container");
  if (!cardsContainer) return;

  if (masterSetActive) {
    // Expandir variantes
    renderedCards = currentCards.flatMap(card => expandCardVariants(card));
  } else {
    renderedCards = currentCards.map(card => ({ ...card, variant: "base" }));
  }

  // ✅ Orden: por id, y dentro de cada id, normal primero
  renderedCards.sort((a, b) => {
    if (a.id !== b.id) return a.id.localeCompare(b.id);        // ordenar por id
    if (a.variant === "normal") return -1;                    // normal primero
    if (b.variant === "normal") return 1;
    return 0;                                                 // el resto mantiene el orden
  });

  const cardsHTML = renderedCards.map(card => `
    <div class="card" data-card-id="${card.id}" data-variant="${card.variant || 'base'}">
      <img src="${card.image}/low.png" alt="${card.name}">
    </div>
  `).join("");

  cardsContainer.innerHTML = `<div class="cards-grid">${cardsHTML}</div>`;
logRenderedCardsDetailed()
}


// =======================
// CARGA DE SET
// =======================

async function enrichCardsWithVariants(cards) {
  return Promise.all(cards.map(async card => {
    const res = await fetch(`https://api.tcgdex.net/v2/en/cards/${card.id}`);
    const fullCard = await res.json();
    return fullCard;
  }));
}

async function loadSetPage() {
  const params = new URLSearchParams(window.location.search);
  const setId = params.get("set");
  if (!setId) return;

  const title = document.getElementById("set-title");
  if (!title || !cardsContainer) return;

  title.textContent = "Loading set...";
  cardsContainer.innerHTML = "<p>Loading cards...</p>";

  try {
    const url = activeTypes.size
      ? `https://api.tcgdex.net/v2/en/cards?set=${setId}&types=${[...activeTypes].map(t => t[0].toUpperCase() + t.slice(1)).join(",")}`
      : `${API_BASE}/${setId}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Error loading set");
    const data = await res.json();

    if (activeTypes.size) {
      currentCards = data;
      const setInfo = await (await fetch(`${API_BASE}/${setId}`)).json();
      title.innerHTML = `<img src="${setInfo.logo}.png" alt="${setInfo.name}" class="set-logo"><h2>${setInfo.name}</h2>`;
    } else {
      currentCards = data.cards;
      title.innerHTML = `<img src="${data.logo}.png" alt="${data.name}" class="set-logo"><h2>${data.name}</h2>`;
    }

    currentCards = await enrichCardsWithVariants(currentCards);
    renderFilteredCards();
    applyOwnedFilter();
    renderOverviewData();

  } catch (err) {
    console.error(err);
    title.textContent = "Error loading set";
    cardsContainer.innerHTML = `<p>${err.message}</p>`;
  }
}

// =======================
// INICIALIZACIÓN
// =======================
document.addEventListener("DOMContentLoaded", () => {
  if (cardsContainer) loadSetPage();
});
