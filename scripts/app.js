// Main Application Initialization
class GymApp {
	constructor() {
		this.router = null;
		this.themeManager = null;
		this.init();
	}

	init() {
		// Initialize core components
		this.router = new GymRouter();
		this.themeManager = new ThemeManager();

		// Make instances globally available for debugging/external access
		window.gymRouter = this.router;
		window.themeManager = this.themeManager;
		window.gymApp = this;
	}

	// Method to handle global actions that might be called from templates
	handleAction(action) {
		if (this.router && typeof this.router.handleAction === 'function') {
			this.router.handleAction(action);
		}
	}
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
	new GymApp();
});