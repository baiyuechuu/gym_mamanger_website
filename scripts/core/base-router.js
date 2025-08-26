// Base Router System - Core routing functionality
class BaseRouter {
	constructor() {
		this.routes = {
			overview: { templatePath: "templates/overview.html" },
			reports: { templatePath: "templates/reports.html" },
			settings: { templatePath: "templates/settings.html" },
			"user-detail": { templatePath: "templates/user-detail.html" },
		};

		this.currentRoute = "overview";
		this.currentUserId = null;
	}

	async init() {
		this.setupNavigation();
		await this.handleInitialRoute();
		this.setupPopstateListener();
	}

	setupNavigation() {
		// Get all navigation links
		const navLinks = document.querySelectorAll("nav a");

		// Add data attributes and click handlers
		navLinks.forEach((link, index) => {
			const routes = ["overview", "reports", "settings"];
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
		// Handle user detail route with userId parameter
		if (route === "user-detail" && userId) {
			this.currentUserId = userId;
			this.currentRoute = route;
			history.pushState({ route, userId }, "", `#${route}/${userId}`);
			this.updateActiveTab("overview"); // Keep overview tab active for user detail
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
		// Remove active class from all nav links
		const navLinks = document.querySelectorAll("nav a");
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

		// Add active class to current route
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

				// Initialize route-specific functionality
				this.initializeRouteFeatures(route);
			} catch (error) {
				console.error("Error loading template:", error);
				mainContent.innerHTML =
					'<div class="p-3"><div class="text-red-500">Error loading content. Please try again.</div></div>';
			}
		}
	}

	initializeRouteFeatures(route) {
		// Initialize features specific to each route
		switch (route) {
			case "overview":
				this.initializeOverviewFeatures();
				break;
			case "user-detail":
				this.initializeUserDetailFeatures();
				break;
			case "reports":
				// Future: Initialize reports features
				break;
			case "settings":
				// Future: Initialize settings features
				break;
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
		const hash = window.location.hash.slice(1);
		
		// Handle user detail routes with parameters
		if (hash.startsWith("user-detail/")) {
			const userId = hash.split("/")[1];
			if (userId) {
				this.currentUserId = userId;
				await this.navigateTo("user-detail", userId);
				return;
			}
		}
		
		const initialRoute = hash && this.routes[hash] ? hash : "overview";
		await this.navigateTo(initialRoute);
	}

	setupPopstateListener() {
		window.addEventListener("popstate", async (e) => {
			const route = e.state?.route || "overview";
			const userId = e.state?.userId || null;
			
			this.currentRoute = route;
			this.currentUserId = userId;
			
			if (route === "user-detail") {
				this.updateActiveTab("overview"); // Keep overview tab active for user detail
			} else {
				this.updateActiveTab(route);
			}
			
			await this.updateMainContent(route);
		});
	}

	handleAction(action) {
		const actions = {
			generateReport: () => alert("Generating report..."),
			saveSettings: () => alert("Saving settings..."),
		};

		if (actions[action]) {
			actions[action]();
		} else {
			console.log(`Action ${action} not implemented`);
		}
	}
}
