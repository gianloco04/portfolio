// =======================
// pokemon.js
// Página principal de sets
// =======================

const API_BASE = "https://api.tcgdex.net/v2/en/sets";
const setsContainer = document.getElementById("sets-container");
const addRemoveBtn = document.getElementById("add-remove-btn");
const moreSetsBtn = document.getElementById("more-sets-btn");
const FAVORITES_STORAGE_KEY = "tcgdex_favorite_set_ids";

let FAVORITE_SET_IDS = [];
let showingAllSets = false;
let currentMode = "none"; // "none" | "delete" | "add"
let allSets = []; // Todos los sets

// -----------------------
// LocalStorage
// -----------------------
function loadFavorites() {
  const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
  FAVORITE_SET_IDS = stored
    ? JSON.parse(stored)
    : [
        "me02","me01","sv10.5w","sv10.5b","sv08.5",
        "sv06.5b","sv04.5","sv04","sv03.5","sv03","swsh12.5"
      ];
}

function saveFavorites() {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(FAVORITE_SET_IDS));
}

// -----------------------
// Reset de modos
// -----------------------
function resetMode() {
  currentMode = "none";
  if (addRemoveBtn) addRemoveBtn.classList.remove("add-mode", "delete-mode");

  document.querySelectorAll(".set-card").forEach(card => {
    card.classList.remove("add", "delete");
  });
}

// -----------------------
// Mostrar sets
// -----------------------
function displayTCGDexSets(sets) {
  if (!sets || sets.length === 0) {
    if (setsContainer) setsContainer.innerHTML = `<p>No se encontraron sets.</p>`;
    return;
  }

  const html = sets.map(set => `
    <div class="set-card" data-set-id="${set.id}" data-set-name="${set.name}" style="--bg: url('${set.logo}.png')">
      <img class="logo" src="${set.logo}.png" alt="${set.name}">
    </div>
  `).join("");

  if (setsContainer) setsContainer.innerHTML = `<div class="sets-grid">${html}</div>`;

  document.querySelectorAll(".set-card").forEach(card => {
    const setId = card.dataset.setId;

    // Marcar favoritos
    if (FAVORITE_SET_IDS.includes(setId)) card.classList.add("is-favorite");

    // Mantener modo activo tras re-render
    if (currentMode === "add") card.classList.add("add");
    if (currentMode === "delete") card.classList.add("delete");

    card.addEventListener("click", e => {
      if (currentMode === "delete") {
        e.preventDefault(); e.stopPropagation();
        FAVORITE_SET_IDS = FAVORITE_SET_IDS.filter(id => id !== setId);
        saveFavorites();
        card.remove();
        return;
      }

      if (currentMode === "add") {
        e.preventDefault(); e.stopPropagation();
        if (!FAVORITE_SET_IDS.includes(setId)) {
          FAVORITE_SET_IDS.push(setId);
          saveFavorites();
          card.classList.add("is-favorite");
        }
        return;
      }

      // Normal: ir a página de set
      window.location.href = `set.html?set=${setId}`;
    });
  });
}

// -----------------------
// Cargar sets desde API
// -----------------------
async function loadSetsTCGDex() {
  if (!setsContainer) return;

  try {
    setsContainer.innerHTML = `<p>Cargando sets...</p>`;

    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Error al cargar sets");

    allSets = await res.json();
    allSets.reverse(); // más reciente → más antiguo

    // Mostrar SOLO favoritos al inicio
    const favoriteSets = allSets.filter(set => FAVORITE_SET_IDS.includes(set.id));
    displayTCGDexSets(favoriteSets);

  } catch (err) {
    setsContainer.innerHTML = `<p>Error al cargar los sets: ${err.message}</p>`;
    console.error(err);
  }
}

// -----------------------
// Botones Add / Delete
// -----------------------
if (addRemoveBtn) {
  addRemoveBtn.addEventListener("click", () => {
    if (currentMode !== "none") {
      resetMode();
      return;
    }

    if (showingAllSets) {
      currentMode = "add";
      addRemoveBtn.classList.add("add-mode");
      document.querySelectorAll(".set-card").forEach(card => card.classList.add("add"));
    } else {
      currentMode = "delete";
      addRemoveBtn.classList.add("delete-mode");
      document.querySelectorAll(".set-card").forEach(card => card.classList.add("delete"));
    }
  });
}

// -----------------------
// Botón MORE SETS → GO BACK
// -----------------------
if (moreSetsBtn) {
  moreSetsBtn.addEventListener("click", () => {
    if (currentMode !== "none") {
      resetMode();
      return;
    }

    if (!showingAllSets) {
      // Mostrar todos los sets
      displayTCGDexSets(allSets);
      moreSetsBtn.textContent = "GO BACK";
      showingAllSets = true;
    } else {
      // Volver a favoritos
      const favoriteSets = allSets.filter(set => FAVORITE_SET_IDS.includes(set.id));
      displayTCGDexSets(favoriteSets);
      moreSetsBtn.textContent = "MORE SETS";
      showingAllSets = false;
    }
  });
}

// -----------------------
// Inicializar
// -----------------------
document.addEventListener("DOMContentLoaded", () => {
  if (setsContainer) {
    loadFavorites();
    loadSetsTCGDex();
  }
});
