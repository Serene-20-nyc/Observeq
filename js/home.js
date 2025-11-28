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
// --- Dashboard sidebar toggle for parents & teachers ---
(function () {
    function setupDashboardToggle(logoId, sidebarSelector, layoutSelector, fabId) {
        const logo = document.getElementById(logoId);
        const sidebar = document.querySelector(sidebarSelector);
        const layout = document.querySelector(layoutSelector);
        if (!logo || !sidebar || !layout) return;

        // Apply persisted collapsed state if present
        try {
            const persisted = localStorage.getItem(storageKey);
            if (persisted === 'true') {
                sidebar.classList.add('collapsed');
                layout.classList.add('sidebar-collapsed');
                logo.classList.add('toggled');
                if (layoutSelector.includes('parent-dashboard-layout')) {
                    document.body.classList.add('parent-sidebar-collapsed');
                } else if (layoutSelector.includes('teacher-dashboard-layout')) {
                    document.body.classList.add('teacher-sidebar-collapsed');
                }
                logo.setAttribute('aria-expanded', 'false');
            }
        } catch (err) {
            // Ignore localStorage errors
        }

        const storageKey = `observeq-${logoId}-collapsed`;

        function toggleSidebar(e) {
            if (e) e.preventDefault();
            sidebar.classList.toggle('collapsed');
            layout.classList.toggle('sidebar-collapsed');
            logo.classList.toggle('toggled');
            const expanded = sidebar.classList.contains('collapsed') ? 'false' : 'true';
            logo.setAttribute('aria-expanded', expanded);
            // Toggle body class so FAB visibility and other UI can respond reliably
            if (layoutSelector.includes('parent-dashboard-layout')) {
                document.body.classList.toggle('parent-sidebar-collapsed');
            } else if (layoutSelector.includes('teacher-dashboard-layout')) {
                document.body.classList.toggle('teacher-sidebar-collapsed');
            }
            // Persist in localStorage
            localStorage.setItem(storageKey, sidebar.classList.contains('collapsed'));
            // Overlay: show/hide overlay when sidebar is open (i.e., not collapsed)
            const overlay = document.getElementById('sidebar-overlay');
            if (overlay) {
                if (!sidebar.classList.contains('collapsed')) {
                    overlay.classList.add('active');
                } else {
                    overlay.classList.remove('active');
                }
            }
        }

        logo.addEventListener('click', toggleSidebar);
        logo.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') {
                toggleSidebar(ev);
            }
        });
        if (fabId) {
            const fab = document.getElementById(fabId);
            if (fab) fab.addEventListener('click', toggleSidebar);
        }

        // Add overlay creation (only once for all dashboards)
        if (!document.getElementById('sidebar-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.tabIndex = -1;
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', function () {
                // Close the sidebar when overlay clicked
                if (!sidebar.classList.contains('collapsed')) {
                    toggleSidebar(new Event('click'));
                }
            });
            document.body.appendChild(overlay);
        }
    }

    setupDashboardToggle('parent-logo-toggle', '.dashboard-sidebar', '.parent-dashboard-layout', 'parent-fab-toggle');
    setupDashboardToggle('teacher-logo-toggle', '.teacher-sidebar', '.teacher-dashboard-layout', 'teacher-fab-toggle');
})();

