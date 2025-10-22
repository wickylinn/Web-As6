// Define theme colors for the whole site
const themes = {
  light: {
    bodyClass: "light-theme",
    logo: {
      default: "Logos/logoW.png",
      mini: "Logos/logoWmini.png"
    }
  },
  dark: {
    bodyClass: "dark-theme",
    logo: {
      default: "Logos/logoB.png",
      mini: "Logos/logoBmini.png"
    }
  }
};

// Apply the theme for current page
function applyTheme() {
  const theme = localStorage.getItem("theme") || "light";
  const logo = document.getElementById("logo");

  // Apply body class
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(themes[theme].bodyClass);

  // Apply correct logo if exists
  if (logo) {
    const isMini = logo.dataset.mini === "true";
    logo.src = isMini ? themes[theme].logo.mini : themes[theme].logo.default;
  }
}

// Toggle theme and save to localStorage
function toggleTheme() {
  const current = localStorage.getItem("theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme();
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", applyTheme);
