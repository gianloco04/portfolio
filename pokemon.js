const API_BASE = "https://api.tcgdex.net/v2/en/sets";
const setsContainer = document.getElementById("sets-container");
const moreSetsBtn = document.getElementById("more-sets-btn");

const FAVORITE_SET_IDS = [
  "me02",
  "me01",
  "sv10.5w",
  "sv10.5b",
  "sv08.5",
  "sv06.5b",
  "sv04.5",
  "sv04",
  "sv03.5",
  "sv03",
  "swsh12.5"
];

let allSets = []; // guardamos todos los sets aquí

async function loadSetsTCGDex() {
  try {
    setsContainer.innerHTML = `<p>Cargando sets...</p>`;

    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Error al cargar sets");

    allSets = await res.json();
    allSets.reverse(); // más reciente → más antiguo

    // Mostrar SOLO favoritos al inicio
    const favoriteSets = allSets.filter(set =>
      FAVORITE_SET_IDS.includes(set.id)
    );

    displayTCGDexSets(favoriteSets);

  } catch (err) {
    setsContainer.innerHTML = `<p>Error al cargar los sets: ${err.message}</p>`;
    console.error(err);
  }
}

function displayTCGDexSets(sets) {
  if (!sets || sets.length === 0) {
    setsContainer.innerHTML = `<p>No se encontraron sets.</p>`;
    return;
  }

  const html = sets.map(set => `
    <div 
      class="set-card"
      style="background-image: url('${set.logo}.png')"
      data-set-id="${set.id}"
      data-set-name="${set.name}"
    >
      <img class="logo" src="${set.logo}.png" alt="${set.name}">
    </div>
  `).join("");

  setsContainer.innerHTML = `<div class="sets-grid">${html}</div>`;

  // Click en set → ir a set.html
  document.querySelectorAll(".set-card").forEach(card => {
    card.addEventListener("click", () => {
      const setId = card.dataset.setId;
      window.location.href = `set.html?set=${setId}`;
    });
  });
}

if (moreSetsBtn) {
  moreSetsBtn.addEventListener("click", () => {
    displayTCGDexSets(allSets);

    console.log("All set IDs:");
    allSets.forEach(set => console.log(set.id, set.name));

    moreSetsBtn.style.display = "none";
  });
}

// Cargar sets al iniciar
loadSetsTCGDex();


// =======================
// SET PAGE LOGIC
// =======================

async function loadSetPage() {
  const params = new URLSearchParams(window.location.search);
  const setId = params.get("set");

  if (!setId) return;

  const title = document.getElementById("set-title");
  const cardsContainer = document.getElementById("cards-container");

  try {
    title.textContent = "Loading set...";
    cardsContainer.innerHTML = "<p>Loading cards...</p>";

    const res = await fetch(`https://api.tcgdex.net/v2/en/sets/${setId}`);
    if (!res.ok) throw new Error("Error loading set");

    const setData = await res.json();

    title.textContent = setData.name;

    const cardsHTML = setData.cards.map(card => `
      <div class="card">
        <img src="${card.image}/low.png" alt="${card.name}">
      </div>
    `).join("");

    cardsContainer.innerHTML = `
      <div class="cards-grid">
        ${cardsHTML}
      </div>
    `;

  } catch (err) {
    title.textContent = "Error loading set";
    cardsContainer.innerHTML = `<p>${err.message}</p>`;
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("sets-container")) {
    loadSetsTCGDex();
  }

  if (document.getElementById("cards-container")) {
    loadSetPage();
  }
});
