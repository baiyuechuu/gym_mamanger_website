// Search Management - Handle search functionality
class SearchManager {
	constructor(dataManager, displayCallback) {
		this.dataManager = dataManager;
		this.displayCallback = displayCallback;
		this.searchInput = null;
		this.searchTimeout = null;
	}

	init() {
		this.searchInput = document.getElementById("booking-search");
		if (!this.searchInput) {
			console.warn("Search input not found");
			return;
		}

		this.setupSearchListener();
	}

	setupSearchListener() {
		// Search with debouncing
		this.searchInput.addEventListener("input", (e) => {
			clearTimeout(this.searchTimeout);
			this.searchTimeout = setTimeout(() => {
				this.performSearch(e.target.value);
			}, 300);
		});

		// Clear search on escape key
		this.searchInput.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				e.target.value = "";
				this.performSearch("");
			}
		});
	}

	performSearch(searchTerm) {
		const filteredData = this.dataManager.filterData(searchTerm);

		// Trigger display update callback
		if (this.displayCallback) {
			this.displayCallback(filteredData);
		}
	}

	clearSearch() {
		if (this.searchInput) {
			this.searchInput.value = "";
			this.performSearch("");
		}
	}
}
