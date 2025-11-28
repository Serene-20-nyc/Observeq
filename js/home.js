// Theme toggle + persistence + navbar interactions

const body = document.body;
const themeToggleDesktop = document.getElementById("theme-toggle-desktop");
const themeToggleMobile = document.getElementById("theme-toggle-mobile");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");
const yearSpan = document.getElementById("year");
const navbar = document.getElementById("navbar");

// --- Init year ---
if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
}

// --- Theme handling ---
const THEME_KEY = "observeq-theme";

function applyTheme(theme) {
    body.setAttribute("data-theme", theme);
    const isDark = theme === "dark";
    const iconClass = isDark ? "fa-sun" : "fa-moon";
    const oldIconClass = isDark ? "fa-moon" : "fa-sun";

    [themeToggleDesktop, themeToggleMobile].forEach((btn) => {
        if (!btn) return;
        const icon = btn.querySelector("i");
        if (!icon) return;

        icon.classList.remove(oldIconClass);
        icon.classList.add(iconClass);
    });
}

function getSystemPrefersDark() {
    return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    );
}

// Load theme from localStorage or system preference
(function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    const theme = stored || (getSystemPrefersDark() ? "dark" : "light");
    applyTheme(theme);
})();

function toggleTheme() {
    const current = body.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
}

if (themeToggleDesktop) {
    themeToggleDesktop.addEventListener("click", toggleTheme);
}
if (themeToggleMobile) {
    themeToggleMobile.addEventListener("click", toggleTheme);
}

// --- Mobile nav ---
if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    // Close nav when clicking a link
    navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });
    });
}

// --- Navbar scroll shadow (optional but nice) ---
if (navbar) {
    const handleScroll = () => {
        if (window.scrollY > 12) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // run once on load
}

// --- Smooth scroll with offset for sticky navbar ---
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (!href || href === "#") return;

        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        const offset = navbar ? navbar.offsetHeight + 8 : 0;
        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const scrollTo = elementPosition - offset;

        window.scrollTo({
            top: scrollTo,
            behavior: "smooth"
        });
    });
});

