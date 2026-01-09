// =======================
// set.js
// Página individual de un set
// =======================

const API_BASE = "https://api.tcgdex.net/v2/en/sets";

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

    const res = await fetch(`${API_BASE}/${setId}`);
    if (!res.ok) throw new Error("Error loading set");

    const setData = await res.json();

    // -------------------------
    // Mostrar título + logo
    // -------------------------
    title.innerHTML = `
      <img src="${setData.logo}.png" alt="${setData.name}" class="set-logo">
      ${setData.name}
    `;

    // -------------------------
    // Mostrar cartas
    // -------------------------
    const cardsHTML = setData.cards.map(card => `
      <div class="card">
        <img src="${card.image}/low.png" alt="${card.name}">
      </div>
    `).join("");

    cardsContainer.innerHTML = `<div class="cards-grid">${cardsHTML}</div>`;

  } catch (err) {
    title.textContent = "Error loading set";
    cardsContainer.innerHTML = `<p>${err.message}</p>`;
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("cards-container")) {
    loadSetPage();
  }
});

const toggleBtn = document.getElementById("toggle-opacity-btn");
toggleBtn.addEventListener("click", () => {
    const cards = document.querySelectorAll(".card img");
    const isAll = toggleBtn.textContent === "ALL";

    cards.forEach(img => {
        img.style.opacity = isAll ? "1" : "0.5";
    });

    toggleBtn.textContent = isAll ? "OWNED" : "ALL";
});

// Mapa de colores por tipo
const typeColors = {
    dark: "#5A5366",
    dragon: "#0A6DC4",
    electric: "#F3D23B",
    fairy: "#EC8FE6",
    fighting: "#CE4069",
    fire: "#FF9C54",
    grass: "#63BB5B",
    normal: "#9099A1",
    psychic: "#F97176",
    steel: "#5A8EA1",
    water: "#4D90D5"
};

document
  .querySelectorAll("#type-buttons-container button")
  .forEach(button => {
    const type = button.dataset.type;
    const img = button.querySelector("img");

    button.addEventListener("click", () => {
        const isActive = button.classList.toggle("active");

        if (isActive) {
            // ACTIVAR
            button.style.backgroundColor = typeColors[type] || "";
            img.src = `Types/bg/${type}.png`;
        } else {
            // DESACTIVAR
            button.style.backgroundColor = "";
            img.src = `Types/no-bg/${type}.png`;
        }
    });
});