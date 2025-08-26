// Main Application Entry Point
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

		// Make instances globally available
		window.gymRouter = this.router;
		window.themeManager = this.themeManager;
		window.gymApp = this;
	}
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new GymApp();
});
