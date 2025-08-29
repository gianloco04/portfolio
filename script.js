const contentMap = {
  me: {
    title: "CD",
    text: `I was born on October 20, 2004, and I live on the island of <span>Mallorca</span>, Spain.
    I love <span>programming and design</span>, especially the process of learning and seeing the results take shape.
    I'm studying <span>Business and Technology</span> and working part-time as a <span>data analyst at e3 Systems.</span>`,
    button: null
  },
  font: {
    title: "XYZ",
    text: `<span>I designed the typeface above</span> by myself for the 2023 graphic design competition.
After the contest ended, I decided to continue developing the font as <span>a personal project</span>, adding different weights and versions.`,
    button: { text: "GET FONT", href: "https://ceresdesign.gumroad.com/l/ceresfont" }
  },
  contest23: {
    title: "ART",
    text: `I took part in a <span>graphic design competition</span> that brought together young people between the ages of 18 and 35, with the goal of testing the skills I’ve learned on my own.
To my surprise, <span>I made it to the final</span> round of the tournament, <span>competing head-to-head with professional designers.</span>`,
    button: { text: "SEE DESIGN", href: "ilovepdf_merged.pdf" }
  },
  contest25: {
    title: "ART",
    text: `This year, <span>I’ve signed up</span> for a new edition of the competition—this time <span>with the clear intention of winning.</span>
I’m approaching it with more experience, clearer ideas, and the motivation <span>to prove how far I’ve come through self-taught practice and creative exploration.</span>`,
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
      btn.target = "_blank";
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

const socialMediaBtn = document.querySelector(".tt:nth-child(1)");
const popup = document.getElementById("popup");
const closeBtn = document.getElementById("closePopup");

socialMediaBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
  popup.classList.add("hidden");
});

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
  link.target = "_blank";
  link.download = "Gianluca-CV.pdf";
  link.click();
});
