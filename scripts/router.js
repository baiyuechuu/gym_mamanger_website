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
		// Initialize pagination state
		this.pagination = {
			currentPage: 1,
			itemsPerPage: 10,
			totalItems: 0,
			totalPages: 0,
			allData: [],
			filteredData: [] // Add filtered data for search
		};

		// Initialize search functionality for the overview page
		setTimeout(() => {
			this.setupSearchFunctionality();
			// Make search manager globally accessible for the clear search button
			window.gymRouter = this;
		}, 100);

		// Load gym members data for the overview table
		setTimeout(() => {
			this.loadGymMembersData();
		}, 50);
	}

	// Setup search functionality that works with pagination
	setupSearchFunctionality() {
		const searchInput = document.getElementById("booking-search");
		if (!searchInput) {
			console.warn("Search input not found");
			return;
		}

		// Add search functionality with debouncing
		let searchTimeout;
		searchInput.addEventListener("input", (e) => {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => {
				this.performSearch(e.target.value);
			}, 300); // 300ms debounce
		});

		// Clear search on escape key
		searchInput.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				e.target.value = "";
				this.performSearch("");
			}
		});
	}

	// Perform search and update pagination
	performSearch(searchTerm) {
		const normalizedSearchTerm = searchTerm.toLowerCase().trim();

		if (normalizedSearchTerm === "") {
			// Show all data
			this.pagination.filteredData = [...this.pagination.allData];
		} else {
			// Filter data based on search term
			this.pagination.filteredData = this.pagination.allData.filter((member) => {
				return this.matchesSearchTerm(member, normalizedSearchTerm);
			});
		}

		// Reset to first page and update pagination
		this.pagination.currentPage = 1;
		this.pagination.totalItems = this.pagination.filteredData.length;
		this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);

		// Update display
		this.displayCurrentPage();
		this.setupPaginationControls();
	}

	// Check if member matches search term
	matchesSearchTerm(member, searchTerm) {
		const searchableFields = [
			member.bookingNo,
			member.name,
			member.sex,
			member.age.toString(),
			member.email,
			member.mobile,
			member.lastVisit,
			member.expiryStatus,
		];

		// Support multiple search terms (space-separated)
		const searchTerms = searchTerm.split(" ").filter((term) => term.length > 0);

		return searchTerms.every((term) =>
			searchableFields.some((field) => field.toLowerCase().includes(term)),
		);
	}

	// Method to clear search
	clearSearch() {
		const searchInput = document.getElementById("booking-search");
		if (searchInput) {
			searchInput.value = "";
			this.performSearch("");
		}
	}

	// Function to load and display gym members data from JSON
	async loadGymMembersData() {
		try {
			const response = await fetch("data/gym-members.json");
			const data = await response.json();
			
			// Store all data for pagination
			this.pagination.allData = data.members;
			this.pagination.filteredData = [...data.members]; // Initialize filtered data
			this.pagination.totalItems = data.members.length;
			this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);
			
			// Display current page
			this.displayCurrentPage();
			this.setupPaginationControls();
			
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

	displayCurrentPage() {
		const tableBody = document.getElementById("booking-table-body");
		if (!tableBody) {
			console.warn("Table body element not found");
			return;
		}

		// Clear existing content
		tableBody.innerHTML = "";

		// Calculate start and end indices for current page
		const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
		const endIndex = startIndex + this.pagination.itemsPerPage;
		const currentPageData = this.pagination.filteredData.slice(startIndex, endIndex);

		// Check if there are no results to display
		if (currentPageData.length === 0 && this.pagination.filteredData.length === 0) {
			// Show "no results found" message
			const noResultsRow = document.createElement("tr");
			noResultsRow.innerHTML = `
				<td colspan="8" class="px-6 py-8 text-center">
					<div class="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
						<i class="fa-regular fa-search text-3xl mb-3"></i>
						<h3 class="text-lg font-medium mb-1">No members found</h3>
						<p class="text-sm">Try adjusting your search terms or clear the search to see all members.</p>
						<button onclick="window.gymRouter?.clearSearch()" 
								class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
							Clear Search
						</button>
					</div>
				</td>
			`;
			tableBody.appendChild(noResultsRow);
			return;
		}

		// Populate table with current page data
		currentPageData.forEach((member) => {
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
	}

	setupPaginationControls() {
		// Setup Previous button
		const prevButton = document.getElementById('prev-button');
		if (prevButton) {
			prevButton.onclick = () => this.goToPreviousPage();
			prevButton.disabled = this.pagination.currentPage === 1;
		}

		// Setup Next button
		const nextButton = document.getElementById('next-button');
		if (nextButton) {
			nextButton.onclick = () => this.goToNextPage();
			nextButton.disabled = this.pagination.currentPage === this.pagination.totalPages;
		}

		// Setup top pagination (simple page numbers)
		const topPagination = document.getElementById('top-pagination');
		if (topPagination) {
			topPagination.innerHTML = '';
			
			for (let i = 1; i <= this.pagination.totalPages; i++) {
				const pageButton = document.createElement('button');
				pageButton.className = `w-8 h-8 flex items-center justify-center text-sm rounded ${
					i === this.pagination.currentPage 
						? 'bg-purple-600 text-white' 
						: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
				}`;
				pageButton.textContent = i;
				pageButton.onclick = () => this.goToPage(i);
				topPagination.appendChild(pageButton);
			}
		}

		// Setup bottom pagination (with ellipsis for many pages)
		const bottomPagination = document.getElementById('bottom-pagination');
		if (bottomPagination) {
			bottomPagination.innerHTML = '';
			
			// For small number of pages, show all
			if (this.pagination.totalPages <= 5) {
				for (let i = 1; i <= this.pagination.totalPages; i++) {
					const pageButton = document.createElement('button');
					pageButton.className = `w-8 h-8 flex items-center justify-center text-sm rounded ${
						i === this.pagination.currentPage 
							? 'bg-purple-600 text-white' 
							: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
					}`;
					pageButton.textContent = i;
					pageButton.onclick = () => this.goToPage(i);
					bottomPagination.appendChild(pageButton);
				}
			} else {
				// For many pages, show with ellipsis
				this.createPaginationWithEllipsis(bottomPagination);
			}
		}
	}

	createPaginationWithEllipsis(container) {
		const current = this.pagination.currentPage;
		const total = this.pagination.totalPages;
		
		// Always show first page
		this.createPageButton(container, 1, current === 1);
		
		// Show ellipsis if needed
		if (current > 3) {
			const ellipsis = document.createElement('span');
			ellipsis.textContent = '...';
			ellipsis.className = 'text-gray-400 dark:text-gray-500';
			container.appendChild(ellipsis);
		}
		
		// Show pages around current
		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);
		
		for (let i = start; i <= end; i++) {
			this.createPageButton(container, i, i === current);
		}
		
		// Show ellipsis if needed
		if (current < total - 2) {
			const ellipsis = document.createElement('span');
			ellipsis.textContent = '...';
			ellipsis.className = 'text-gray-400 dark:text-gray-500';
			container.appendChild(ellipsis);
		}
		
		// Always show last page (if more than 1 page)
		if (total > 1) {
			this.createPageButton(container, total, current === total);
		}
	}

	createPageButton(container, pageNumber, isActive) {
		const pageButton = document.createElement('button');
		pageButton.className = `w-8 h-8 flex items-center justify-center text-sm rounded ${
			isActive 
				? 'bg-purple-600 text-white' 
				: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
		}`;
		pageButton.textContent = pageNumber;
		pageButton.onclick = () => this.goToPage(pageNumber);
		container.appendChild(pageButton);
	}

	goToPage(pageNumber) {
		if (pageNumber >= 1 && pageNumber <= this.pagination.totalPages) {
			this.pagination.currentPage = pageNumber;
			this.displayCurrentPage();
			this.setupPaginationControls();
		}
	}

	goToPreviousPage() {
		if (this.pagination.currentPage > 1) {
			this.goToPage(this.pagination.currentPage - 1);
		}
	}

	goToNextPage() {
		if (this.pagination.currentPage < this.pagination.totalPages) {
			this.goToPage(this.pagination.currentPage + 1);
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
