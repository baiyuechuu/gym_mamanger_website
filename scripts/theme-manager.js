// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.setInitialTheme();
        this.setupThemeToggle();
    }

    setInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.enableDarkMode();
        } else {
            this.enableLightMode();
        }
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        if (document.documentElement.classList.contains('dark')) {
            this.enableLightMode();
        } else {
            this.enableDarkMode();
        }
    }

    enableDarkMode() {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        this.updateThemeIcon('fa-sun');
    }

    enableLightMode() {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        this.updateThemeIcon('fa-moon');
    }

    updateThemeIcon(iconClass) {
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.className = `fa-regular ${iconClass}`;
        }
    }
}