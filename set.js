// =======================
// set.js
// Página individual de un set
// =======================

const API_BASE = "https://api.tcgdex.net/v2/en/sets";
let currentCards = [];
let activeTypes = new Set();
let currentIndex = 0;
let quickOwnActive = false;

const quickOwnBtn = document.getElementById("quickOwn");
quickOwnBtn.addEventListener("click", () => {
  quickOwnActive = !quickOwnActive;
  quickOwnBtn.classList.toggle("active", quickOwnActive);
});

// Cuando se pulsa una carta
document.addEventListener("click", (e) => {
  const cardEl = e.target.closest(".card");
  if (!cardEl) return;

  const cards = Array.from(document.querySelectorAll(".card"));
  const index = cards.indexOf(cardEl);

  if (quickOwnActive) {
    // Idioma seleccionado
    const language = document.getElementById("language-select").value;

    const cardId = cardEl.dataset.cardId;
    const owned = JSON.parse(localStorage.getItem("ownedCards")) || {};

    if (!owned[cardId]) {
      owned[cardId] = { copies: 0, languages: [] };
    }

    // Añadir 1 copia
    owned[cardId].copies = 1;

    // Añadir idioma si no está
    if (!owned[cardId].languages.includes(language)) {
      owned[cardId].languages.push(language);
    }

    // Guardar en localStorage
    localStorage.setItem("ownedCards", JSON.stringify(owned));

    // Aplicar opacidad si toggle OWNED está activo
    applyOwnedFilter();
  }

  // Abrir popup si no estamos en QUICK OWN
  if (!quickOwnActive) {
    currentIndex = index;
    openPopup(index);
  }
});

function loadOwnedData(cardId) {
  const owned = JSON.parse(localStorage.getItem("ownedCards")) || {};
  const data = owned[cardId];

  document.getElementById("card-copies").value = data?.copies || 1;
}

// -------------------------
// Cargar set
// -------------------------

function applyOwnedFilter() {
  const cards = document.querySelectorAll(".card");
  const ownedCards = JSON.parse(localStorage.getItem("ownedCards")) || {};
  const toggleMode = toggleBtn.dataset.mode || "ALL";
  const isOwnedView = toggleMode === "OWNED";

  cards.forEach(card => {
    const img = card.querySelector("img");
    const cardId = card.dataset.cardId;

    const isOwned =
      ownedCards[cardId] &&
      typeof ownedCards[cardId].copies === "number" &&
      ownedCards[cardId].copies > 0;

    img.style.opacity = !isOwnedView || isOwned ? "1" : "0.5";
  });
}

async function loadSetPage() {
  const params = new URLSearchParams(window.location.search);
  const setId = params.get("set");
  if (!setId) return;

  const title = document.getElementById("set-title");
  const cardsContainer = document.getElementById("cards-container");

  if (!title || !cardsContainer) return;

  try {
    title.textContent = "Loading set...";
    cardsContainer.innerHTML = "<p>Loading cards...</p>";

    let url;
    let isFiltered = activeTypes.size > 0;

    if (isFiltered) {
      // URL con tipos filtrados
      const typesParam = Array.from(activeTypes)
        .map(t => t.charAt(0).toUpperCase() + t.slice(1))
        .join(",");

      url = `https://api.tcgdex.net/v2/en/cards?set=${setId}&types=${typesParam}`;
    } else {
      // URL normal del set
      url = `${API_BASE}/${setId}`;
    }

const res = await fetch(url);
if (!res.ok) throw new Error("Error loading set");

const data = await res.json();

if (isFiltered) {
  currentCards = data;

  const setRes = await fetch(`${API_BASE}/${setId}`);
  const setInfo = await setRes.json();
  title.innerHTML = `
    <img src="${setInfo.logo}.png" alt="${setInfo.name}" class="set-logo"><h2>
    ${setInfo.name}</h2>
  `;
} else {
  currentCards = data.cards;
  title.innerHTML = `
    <img src="${data.logo}.png" alt="${data.name}" class="set-logo"><h2>
    ${data.name}</h2>
  `;
}


    renderFilteredCards();
    applyOwnedFilter();

  } catch (err) {
    title.textContent = "Error loading set";
    cardsContainer.innerHTML = `<p>${err.message}</p>`;
    console.error(err);
  }
}


// -------------------------
// Renderizar cartas filtradas
// -------------------------
function renderFilteredCards() {
  const cardsContainer = document.getElementById("cards-container");
  if (!cardsContainer) return;

  const cardsHTML = currentCards.map(card => `
    <div class="card" data-card-id="${card.id}">
      <img src="${card.image}/low.png" alt="${card.name}">
    </div>
  `).join("");

  cardsContainer.innerHTML = `<div class="cards-grid">${cardsHTML}</div>`;
}

// -------------------------
// Toggle OWNED / ALL
// -------------------------
const toggleBtn = document.getElementById("toggle-opacity-btn");

toggleBtn.addEventListener("click", () => {
  const cards = document.querySelectorAll(".card");
  const ownedCards = JSON.parse(localStorage.getItem("ownedCards")) || {};

  // Determinar el NUEVO modo
  const newMode =
    toggleBtn.dataset.mode === "ALL" ? "OWNED" : "ALL";

  toggleBtn.dataset.mode = newMode;
  toggleBtn.textContent = newMode.toUpperCase();
  applyOwnedFilter();
});

// -------------------------
// Botones de tipos
// -------------------------
document
  .querySelectorAll("#type-buttons-container button")
  .forEach(button => {
    const type = button.dataset.type;
    const img = button.querySelector("img");

    button.addEventListener("click", () => {
        const isActive = button.classList.toggle("active");

        if (isActive) {
            img.src = `Types/bg/${type}.png`;
            activeTypes.add(type); // debe coincidir exactamente con la API
        } else {
            img.src = `Types/no-bg/${type}.png`;
            activeTypes.delete(type);
        }

        // Cada vez que cambias el filtro, recarga la API con los tipos
        loadSetPage();
    });
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cards-container")) {
    loadSetPage();
  }
});


// POP UP

function openPopup(index) {
  const card = currentCards[index];
  const popup = document.getElementById("image-popup");

  // Mostrar popup
  popup.classList.remove("hidden");

  // Imagen y info
  document.getElementById("popup-image").src = `${card.image}/high.png`;
  document.getElementById("card-name").textContent = card.name;
  document.getElementById("card-rarity").textContent = card.rarity || "—";
  document.getElementById("card-illustrator").textContent = card.illustrator || "—";
  document.getElementById("card-type").textContent = card.types?.join(", ") || "—";

  // Cargar datos de owned
  loadOwnedData(card.id);
}

// Abrir popup al clicar en una carta
document.addEventListener("click", (e) => {
  const cardEl = e.target.closest(".card");
  if (!cardEl) return;

  // Si QUICK OWN está activo, solo marcar la carta y salir
  if (quickOwnActive) return;

  const cards = Array.from(document.querySelectorAll(".card"));
  currentIndex = cards.indexOf(cardEl);

  openPopup(currentIndex);
});


// =======================
// Cerrar popup solo al click en el fondo
// =======================
const popup = document.getElementById("image-popup");
const popupInner = document.querySelector(".popup-inner");

// Clic en el overlay/fondo
popup.addEventListener("click", () => {
  popup.classList.add("hidden");
});

// Evitar que los clicks dentro del contenido cierren el popup
popupInner.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.querySelector(".nav-btn.prev").addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentIndex > 0) {
    currentIndex--;
    openPopup(currentIndex);
  }
});

document.querySelector(".nav-btn.next").addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentIndex < currentCards.length - 1) {
    currentIndex++;
    openPopup(currentIndex);
  }
});

document.getElementById("save-card").addEventListener("click", () => {
  const card = currentCards[currentIndex];
  const copies = parseInt(document.getElementById("card-copies").value);
  const language = document.getElementById("card-language").value;

  const owned = JSON.parse(localStorage.getItem("ownedCards")) || {};

  if (!owned[card.id]) {
    owned[card.id] = { copies: 0, languages: [] };
  }

  owned[card.id].copies = copies;

  if (!owned[card.id].languages.includes(language)) {
    owned[card.id].languages.push(language);
  }

  localStorage.setItem("ownedCards", JSON.stringify(owned));
});

const deleteBtn = document.getElementById("delete");

deleteBtn.addEventListener("click", () => {
  if (!currentCards || currentCards.length === 0) return;

  const owned = JSON.parse(localStorage.getItem("ownedCards")) || {};

  // Recorrer todas las cartas del set actual
  currentCards.forEach(card => {
    if (owned[card.id]) {
      delete owned[card.id];
    }
  });

  // Guardar cambios en localStorage
  localStorage.setItem("ownedCards", JSON.stringify(owned));

  // Actualizar opacidades según toggle OWNED/ALL
  applyOwnedFilter();

  alert(`Se han borrado las cartas del set actual (${currentCards.length})`);
});
