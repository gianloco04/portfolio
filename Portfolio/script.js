// DOM Elements
const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebar = document.getElementById('sidebar');
const sidebarLeft = document.getElementById('sidebar-left');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li');

// Toggle sidebar
hamburgerBtn.addEventListener('click', () => {
    hamburgerBtn.classList.toggle('open');
    sidebar.classList.toggle('open');
    sidebarLeft.classList.toggle('open');
    document.body.classList.toggle('no-scroll');
});

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
});

// Sidebar menu navigation
sidebarMenuItems.forEach(item => {
    item.addEventListener('click', () => {
        // Close sidebar
        hamburgerBtn.classList.remove('open');
        sidebar.classList.remove('open');
        sidebarLeft.classList.remove('open');
        document.body.classList.remove('no-scroll');
    });
});

const sidebarLeftImg = document.getElementById('sidebar-left-img');
const defaultImg = '../4x/gianluca-logo.png';

// When switching tabs
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const isProjectsTab = btn.dataset.tab === 'projects';

        if (!isProjectsTab) {
            sidebarLeftImg.src = defaultImg;
        } else {
            sidebarLeftImg.src = '../4x/gianluca-logo.png'; // clear until hover
        }
    });
});

// Hover logic for project items
document.querySelectorAll('#projects-tab .sidebar-menu li').forEach(item => {
    item.addEventListener('mouseenter', () => {
        const imgSrc = getImageForProject(item.dataset.project);
        sidebarLeftImg.src = imgSrc;
    });

    item.addEventListener('mouseleave', () => {
        sidebarLeftImg.src = images[projectKey]; // blank when not hovering
    });
});

// Image mapping function
function getImageForProject(projectKey) {
    const images = {
        'my-font': '../4x/gianluca-font.png',
        'art-jove-2023': '../4x/gianluca-artjove23.png',
        'my-app': '../4x/gianluca-app.png',
        'art-jove-2025': '../4x/gianluca-artjove25.png',
        'my-videogame': '../4x/gianluca-videogame.png',

    };
    return images[projectKey] || '';
}

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;

    const parallaxSpeed = 1;     // Y movement
    const scaleSpeed = 0.001;     // Shrinking

    const happyFaces = document.getElementById('happyFaces');

    const translateY = scrolled * parallaxSpeed;
    const scale = Math.max(1 - scrolled * scaleSpeed, 0.5);

    happyFaces.style.transform = `translateY(${translateY}px) scale(${scale})`;
});

const circle = document.getElementById("rollingFace");
const about = document.getElementById("about");

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
    if (entry.isIntersecting) {
        circle.classList.add("animate");
        observer.unobserve(entry.target); // Remove observer if animation should only trigger once
    }
    });
}, {
    threshold: 0.5 // Trigger when 50% of #about is visible
});

observer.observe(about);

const circle2 = document.getElementById("rollingFace2");
const studies = document.getElementById("studies");

const observer2 = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      circle2.classList.add("animate");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.5
});

observer2.observe(studies);

const aboutStrongEls = document.querySelectorAll("#about strong");
const studiesStrongEls = document.querySelectorAll("#studies strong");

const observer3 = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      aboutStrongEls.forEach(el => el.classList.add("animate"));
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.5
});

observer3.observe(about);

const observer4 = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      studiesStrongEls.forEach(el => el.classList.add("animate"));
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.5
});

observer4.observe(studies);

const bottomcircle = document.getElementById("rollingFace3");
const contact = document.getElementById("contact");

const observer5 = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      bottomcircle.classList.add("animate");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.5
});

observer5.observe(contact);



const container = document.getElementById("scroll-container");
const progressBar = document.getElementById("scroll-progress");

container.addEventListener("scroll", () => {
    const scrollWidth = container.scrollWidth - container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const progress = (scrollLeft / scrollWidth) * 100;
    progressBar.style.width = `${progress}%`;
});