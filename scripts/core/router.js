// Core Router - Navigation and Route Management
class GymRouter {
	constructor() {
		this.routes = {
			login: { templatePath: "templates/login.html" },
			overview: { templatePath: "templates/overview.html" },
			reports: { templatePath: "templates/reports.html" },
			settings: { templatePath: "templates/settings.html" },
			"user-detail": { templatePath: "templates/user-detail.html" },
		};

		this.currentRoute = "overview";
		this.currentUserId = null;

		// Initialize auth manager
		this.authManager = new AuthManager();

		// Initialize feature managers
		this.overviewManager = new OverviewManager(this);
		this.userDetailManager = new UserDetailManager(this);

		this.init();
	}

	async init() {
		// Check authentication first
		if (!this.authManager.isAuthenticated()) {
			await this.showLoginPage();
			return;
		}

		this.setupNavigation();
		this.setupLogoutButton();
		await this.handleInitialRoute();
		this.setupPopstateListener();
	}

	setupNavigation() {
		const navLinks = document.querySelectorAll("nav a");
		const routes = ["overview", "reports", "settings"];

		navLinks.forEach((link, index) => {
			const route = routes[index];
			if (route) {
				link.setAttribute("data-route", route);
				link.addEventListener("click", (e) => {
					e.preventDefault();
					this.navigateTo(route);
				});
			}
		});
	}

	async navigateTo(route, userId = null) {
		if (route === "user-detail" && userId) {
			this.currentUserId = userId;
			this.currentRoute = route;
			history.pushState({ route, userId }, "", `#${route}/${userId}`);
			this.updateActiveTab("overview");
			await this.updateMainContent(route);
			return;
		}

		if (!this.routes[route]) {
			console.warn(`Route "${route}" not found`);
			return;
		}

		this.currentRoute = route;
		this.currentUserId = null;
		history.pushState({ route }, "", `#${route}`);
		this.updateActiveTab(route);
		await this.updateMainContent(route);
	}

	updateActiveTab(activeRoute) {
		const navLinks = document.querySelectorAll("nav a");

		// Reset all links
		navLinks.forEach((link) => {
			link.classList.remove(
				"bg-white",
				"dark:bg-gray-700",
				"text-purple-700",
				"dark:text-white",
			);
			link.classList.add(
				"hover:bg-purple-700/50",
				"dark:hover:bg-gray-700/50",
				"transition-colors",
			);
		});

		// Activate current link
		const activeLink = document.querySelector(
			`nav a[data-route="${activeRoute}"]`,
		);
		if (activeLink) {
			activeLink.classList.add(
				"bg-white",
				"dark:bg-gray-700",
				"text-purple-700",
				"dark:text-white",
			);
			activeLink.classList.remove(
				"hover:bg-purple-700/50",
				"dark:hover:bg-gray-700/50",
				"transition-colors",
			);
		}
	}

	async updateMainContent(route) {
		const mainContent = document.querySelector(".ml-12.sm\\:ml-48");
		const routeData = this.routes[route];

		if (mainContent && routeData) {
			try {
				const templateContent = await this.loadTemplate(routeData.templatePath);
				mainContent.innerHTML = templateContent;
				this.initializeRouteFeatures(route);
			} catch (error) {
				console.error("Error loading template:", error);
				mainContent.innerHTML =
					'<div class="p-3"><div class="text-red-500">Error loading content. Please try again.</div></div>';
			}
		}
	}

	initializeRouteFeatures(route) {
		switch (route) {
			case "login":
				this.authManager.init();
				break;
			case "overview":
				this.overviewManager.initialize();
				break;
			case "user-detail":
				this.userDetailManager.initialize();
				break;
		}
	}

	async showLoginPage() {
		// Hide sidebar for login page
		const sidebar = document.querySelector(".fixed.left-0.top-0.h-screen");
		if (sidebar) {
			sidebar.style.display = "none";
		}

		// Show login page in full screen
		const mainContent =
			document.querySelector(".ml-12.sm\\:ml-48") || document.body;
		mainContent.className = "min-h-screen";

		try {
			const templateContent = await this.loadTemplate("templates/login.html");
			mainContent.innerHTML = templateContent;
			this.authManager.init();
		} catch (error) {
			console.error("Error loading login template:", error);
			mainContent.innerHTML =
				'<div class="flex items-center justify-center min-h-screen"><div class="text-red-500">Error loading login page.</div></div>';
		}
	}

	setupLogoutButton() {
		// Find logout button and add click handler
		const logoutBtn = document.querySelector(
			"button:has(.fa-arrow-right-from-bracket)",
		);
		if (logoutBtn) {
			logoutBtn.addEventListener("click", (e) => {
				e.preventDefault();
				this.handleLogout();
			});
		}
	}

	handleLogout() {
		// Show confirmation dialog
		if (confirm("Are you sure you want to log out?")) {
			this.authManager.logout();
		}
	}

	async loadTemplate(templatePath) {
		const response = await fetch(templatePath);
		if (!response.ok) {
			throw new Error(`Failed to load template: ${templatePath}`);
		}
		return await response.text();
	}

	async handleInitialRoute() {
		// If not authenticated, don't process routes
		if (!this.authManager.isAuthenticated()) {
			return;
		}

		const hash = window.location.hash.slice(1);

		if (hash.startsWith("user-detail/")) {
			const userId = hash.split("/")[1];
			if (userId) {
				this.currentUserId = userId;
				await this.navigateTo("user-detail", userId);
				return;
			}
		}

		const initialRoute =
			hash && this.routes[hash] && hash !== "login" ? hash : "overview";
		await this.navigateTo(initialRoute);
	}

	setupPopstateListener() {
		window.addEventListener("popstate", async (e) => {
			const route = e.state?.route || "overview";
			const userId = e.state?.userId || null;

			this.currentRoute = route;
			this.currentUserId = userId;

			if (route === "user-detail") {
				this.updateActiveTab("overview");
			} else {
				this.updateActiveTab(route);
			}

			await this.updateMainContent(route);
		});
	}
}

