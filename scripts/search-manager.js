// Search Manager for Booking Data
class SearchManager {
	constructor() {
		this.originalBookingData = [];
		this.searchInput = null;
		this.tableBody = null;
		this.isInitialized = false;
	}

	init() {
		// Wait for DOM elements to be available
		this.searchInput = document.getElementById("booking-search");
		this.tableBody = document.getElementById("booking-table-body");

		if (!this.searchInput || !this.tableBody) {
			console.warn("Search elements not found, retrying...");
			setTimeout(() => this.init(), 100);
			return;
		}

		this.extractBookingData();
		this.setupSearchListener();
		this.isInitialized = true;
		console.log("Search Manager initialized successfully");
	}

	extractBookingData() {
		// Extract all booking data from the table rows
		const rows = this.tableBody.querySelectorAll("tr");
		this.originalBookingData = Array.from(rows)
			.map((row) => {
				const cells = row.querySelectorAll("td");
				if (cells.length === 0) return null;

				return {
					element: row,
					bookingNo: cells[0]?.textContent?.trim() || "",
					guestName: cells[1]?.textContent?.trim() || "",
					sex: cells[2]?.textContent?.trim() || "",
					age: cells[3]?.textContent?.trim() || "",
					email: cells[4]?.textContent?.trim() || "",
					mobile: cells[5]?.textContent?.trim() || "",
					lastVisit: cells[6]?.textContent?.trim() || "",
					status: cells[7]?.textContent?.trim() || "",
				};
			})
			.filter((booking) => booking !== null);

		console.log(`Extracted ${this.originalBookingData.length} booking records`);
	}

	setupSearchListener() {
		if (!this.searchInput) return;

		// Add search functionality with debouncing
		let searchTimeout;
		this.searchInput.addEventListener("input", (e) => {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(() => {
				this.performSearch(e.target.value);
			}, 300); // 300ms debounce
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
		if (!this.tableBody || this.originalBookingData.length === 0) {
			console.warn("Search not available - missing data or elements");
			return;
		}

		const normalizedSearchTerm = searchTerm.toLowerCase().trim();

		// If search is empty, show all bookings
		if (normalizedSearchTerm === "") {
			this.showAllBookings();
			return;
		}

		// Filter bookings based on search term
		const filteredBookings = this.originalBookingData.filter((booking) => {
			return this.matchesSearchTerm(booking, normalizedSearchTerm);
		});

		this.displayFilteredBookings(filteredBookings);
		this.updateSearchResults(
			filteredBookings.length,
			this.originalBookingData.length,
		);
	}

	matchesSearchTerm(booking, searchTerm) {
		// Search across multiple fields
		const searchableFields = [
			booking.bookingNo,
			booking.guestName,
			booking.sex,
			booking.age,
			booking.email,
			booking.mobile,
			booking.lastVisit,
			booking.status,
		];

		// Support multiple search terms (space-separated)
		const searchTerms = searchTerm.split(" ").filter((term) => term.length > 0);

		return searchTerms.every((term) =>
			searchableFields.some((field) => field.toLowerCase().includes(term)),
		);
	}

	displayFilteredBookings(filteredBookings) {
		// Hide all rows first
		this.originalBookingData.forEach((booking) => {
			booking.element.style.display = "none";
		});

		// Remove any existing "no results" message
		this.removeNoResultsMessage();

		if (filteredBookings.length === 0) {
			// Show "no results found" message
			this.showNoResultsMessage();
		} else {
			// Show only filtered rows
			filteredBookings.forEach((booking) => {
				booking.element.style.display = "";
			});
		}
	}

	showAllBookings() {
		// Show all booking rows
		this.originalBookingData.forEach((booking) => {
			booking.element.style.display = "";
		});
		this.removeNoResultsMessage();
		this.updateSearchResults(
			this.originalBookingData.length,
			this.originalBookingData.length,
		);
	}

	showNoResultsMessage() {
		const noResultsRow = document.createElement("tr");
		noResultsRow.id = "no-results-message";
		noResultsRow.innerHTML = `
            <td colspan="8" class="px-6 py-8 text-center">
                <div class="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <i class="fa-regular fa-search text-3xl mb-3"></i>
                    <h3 class="text-lg font-medium mb-1">No bookings found</h3>
                    <p class="text-sm">Try adjusting your search terms or clear the search to see all bookings.</p>
                    <button onclick="window.gymRouter?.searchManager?.clearSearch()" 
                            class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                        Clear Search
                    </button>
                </div>
            </td>
        `;
		this.tableBody.appendChild(noResultsRow);
	}

	removeNoResultsMessage() {
		const existingMessage = document.getElementById("no-results-message");
		if (existingMessage) {
			existingMessage.remove();
		}
	}

	updateSearchResults(filteredCount, totalCount) {
		// Create or update search results indicator
		let resultsIndicator = document.getElementById("search-results-indicator");

		if (!resultsIndicator) {
			resultsIndicator = document.createElement("div");
			resultsIndicator.id = "search-results-indicator";
			resultsIndicator.className =
				"text-sm text-gray-600 dark:text-gray-400 mt-2";

			// Insert after the search input
			const searchContainer = this.searchInput.parentElement.parentElement;
			searchContainer.appendChild(resultsIndicator);
		}
	}

	// Method to refresh data when table content changes
	refreshData() {
		if (this.isInitialized) {
			this.extractBookingData();
			// Re-apply current search if there is one
			const currentSearch = this.searchInput?.value || "";
			if (currentSearch) {
				this.performSearch(currentSearch);
			}
		}
	}

	// Method to clear search
	clearSearch() {
		if (this.searchInput) {
			this.searchInput.value = "";
			this.showAllBookings();
		}
	}
}

// Make SearchManager globally available
window.SearchManager = SearchManager;

