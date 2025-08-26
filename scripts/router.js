// Simple Router System
class GymRouter {
	constructor() {
		this.routes = {
			overview: { templatePath: "templates/overview.html" },
			reports: { templatePath: "templates/reports.html" },
			settings: { templatePath: "templates/settings.html" },
		};

		this.currentRoute = "overview";
		this.init();
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

	async navigateTo(route) {
		if (!this.routes[route]) {
			console.warn(`Route "${route}" not found`);
			return;
		}

		this.currentRoute = route;
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
		const mainContent = document.querySelector(".ml-12.sm\\:ml-64");
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
			case "reports":
				// Future: Initialize reports features
				break;
			case "settings":
				// Future: Initialize settings features
				break;
		}
	}

	initializeOverviewFeatures() {
		// Initialize search functionality for the overview page
		if (window.SearchManager) {
			// Use setTimeout to ensure DOM elements are fully rendered
			setTimeout(() => {
				if (!this.searchManager) {
					this.searchManager = new window.SearchManager();
				}
				this.searchManager.init();

				// Make search manager globally accessible for the clear search button
				window.gymRouter = this;
			}, 100);
		}

		// Load gym members data for the overview table
		setTimeout(() => {
			this.loadGymMembersData();
		}, 50);
	}

	// Function to load and display gym members data from JSON
	async loadGymMembersData() {
		try {
			const response = await fetch("data/gym-members.json");
			const data = await response.json();
			const tableBody = document.getElementById("booking-table-body");

			if (!tableBody) {
				console.warn("Table body element not found");
				return;
			}

			// Clear existing content
			tableBody.innerHTML = "";

			// Populate table with data from JSON
			data.members.forEach((member) => {
				const row = document.createElement("tr");
				row.className = "hover:bg-gray-50 dark:hover:bg-gray-600";

				row.innerHTML = `
					<td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
						${member.bookingNo}
					</td>
					<td class="px-6 py-4">
						<div class="flex items-center">
							<span class="text-sm text-gray-900 dark:text-gray-100">${member.name}</span>
						</div>
					</td>
					<td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
						${member.sex}
					</td>
					<td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
						${member.age}
					</td>
					<td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
						${member.email}
					</td>
					<td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
						${member.mobile}
					</td>
					<td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
						${member.lastVisit}
					</td>
					<td class="px-6 py-4">
						<span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.statusClass} whitespace-nowrap">
							${member.expiryStatus}
						</span>
					</td>
				`;

				tableBody.appendChild(row);
			});
		} catch (error) {
			console.error("Error loading gym members data:", error);
			const tableBody = document.getElementById("booking-table-body");
			if (tableBody) {
				tableBody.innerHTML = `
					<tr>
						<td colspan="8" class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
							Error loading data. Please try again later.
						</td>
					</tr>
				`;
			}
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
		const initialRoute = hash && this.routes[hash] ? hash : "overview";
		await this.navigateTo(initialRoute);
	}

	setupPopstateListener() {
		window.addEventListener("popstate", async (e) => {
			const route = e.state?.route || "overview";
			this.currentRoute = route;
			this.updateActiveTab(route);
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
