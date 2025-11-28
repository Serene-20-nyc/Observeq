// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function () {
    const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
    const body = document.body;

    // Load saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Theme toggle functionality
    if (themeToggleDesktop) {
        themeToggleDesktop.addEventListener('click', function () {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        const icon = themeToggleDesktop.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
});

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('open');

            // Toggle icon
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.className = navMenu.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (event) {
            if (!navMenu.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                navMenu.classList.remove('open');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }
});
