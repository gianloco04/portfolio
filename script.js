const contentMap = {
  me: {
    title: "CD",
    text: `I was born on October 20, 2004, and I live on the island of Mallorca, Spain.
I enjoy designing and programming, but above all, I love learning how to do it and seeing the results.
I'm currently studying Business and Technology and working part-time as a data analyst at e3 Systems.`,
    button: null
  },
  font: {
    title: "XYZ",
    text: `I designed the typeface below by myself for the 2023 graphic design competition.
After the contest ended, I decided to continue developing the font as a personal project, adding different weights and versions.`,
    button: { text: "GET FONT", href: "https://ceresdesign.gumroad.com/l/ceresfont" }
  },
  contest23: {
    title: "ART",
    text: `I took part in a graphic design competition that brought together young people between the ages of 18 and 35, with the goal of testing the skills I’ve learned on my own.
To my surprise, I made it to the final round of the tournament, competing head-to-head with professional designers.`,
    button: { text: "SEE DESIGN", href: "ilovepdf_merged.pdf" }
  },
  contest25: {
    title: "ART",
    text: `This year, I’ve signed up for a new edition of the competition—this time with the clear intention of winning.
I’m approaching it with more experience, clearer ideas, and the motivation to prove how far I’ve come through self-taught practice and creative exploration.`,
    button: null
  }
};

document.querySelectorAll("h2[data-id]").forEach(h2 => {
  h2.addEventListener("mouseenter", () => {
    const key = h2.dataset.id;
    const { title, text, button } = contentMap[key];
    
    document.getElementById("leftTitle").innerHTML = title;
    document.getElementById("leftText").innerHTML = text;
    
    const btn = document.getElementById("leftButton");
    if (button) {
      btn.textContent = button.text;
      btn.classList.add("btn");
      btn.classList.add("flex");
      btn.href = button.href;
      btn.target = "_blank"; // Abre en una nueva pestaña
      btn.style.display = "inline-block";
    } else {
      btn.style.display = "none";
    }
  });
});

const hoverItems = document.querySelectorAll(".bt, .tt");

hoverItems.forEach(item => {
  item.addEventListener("mouseenter", () => {
    // Elimina cualquier id="active"
    document.querySelectorAll("#active").forEach(el => el.removeAttribute("id"));
    // Añade al actual
    item.id = "active";

  });
});

const socialMediaBtn = document.querySelector(".tt:nth-child(1)"); // El primer .tt = "SOCIAL MEDIA"
const popup = document.getElementById("popup");
const closeBtn = document.getElementById("closePopup");

socialMediaBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

// También puedes cerrar al hacer clic fuera del contenido
popup.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.classList.add("hidden");
  }
});

document.getElementById("contact").addEventListener("click", () => {
  window.location.href = "mailto:info@gianludesign.com";
});

document.getElementById("cv").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = "ruta/mi-cv.pdf";
  link.target = "_blank"; // Abre en una nueva pestaña
  link.download = "Gianluca-CV.pdf"; // Puedes darle el nombre que quieras
  link.click();
});
