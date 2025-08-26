// Theme Management
class ThemeManager {
	constructor() {
		this.init();
	}

	init() {
		// Check for saved theme preference or default to light mode
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		
		if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
			this.enableDarkMode();
		} else {
			this.enableLightMode();
		}

		// Set up theme toggle button
		this.setupThemeToggle();
	}

	setupThemeToggle() {
		const themeToggle = document.getElementById('theme-toggle');
		const themeIcon = document.getElementById('theme-icon');
		
		if (themeToggle) {
			themeToggle.addEventListener('click', (e) => {
				e.preventDefault();
				if (document.documentElement.classList.contains('dark')) {
					this.enableLightMode();
				} else {
					this.enableDarkMode();
				}
			});
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