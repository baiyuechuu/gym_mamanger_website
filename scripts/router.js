// Main Router - Combines all router functionality
class GymRouter extends BaseRouter {
	constructor() {
		super();
		
		// Initialize feature managers
		this.overviewManager = new OverviewManager(this);
		this.paginationManager = new PaginationManager(this.overviewManager);
		this.userDetailManager = new UserDetailManager(this);
		
		// Initialize the router
		this.init();
	}

	initializeOverviewFeatures() {
		// Initialize pagination state
		this.overviewManager.pagination = {
			currentPage: 1,
			itemsPerPage: 10,
			totalItems: 0,
			totalPages: 0,
			allData: [],
			filteredData: []
		};

		// Initialize overview functionality
		this.overviewManager.initialize();
	}

	initializeUserDetailFeatures() {
		this.userDetailManager.initialize();
	}

	// Override methods to use pagination manager
	setupPaginationControls() {
		this.paginationManager.setupPaginationControls();
	}

	// Expose methods for backward compatibility
	clearSearch() {
		this.overviewManager.clearSearch();
	}

	displayCurrentPage() {
		this.overviewManager.displayCurrentPage();
	}

	performSearch(searchTerm) {
		this.overviewManager.performSearch(searchTerm);
	}

	goToPage(pageNumber) {
		this.overviewManager.goToPage(pageNumber);
	}

	goToPreviousPage() {
		this.overviewManager.goToPreviousPage();
	}

	goToNextPage() {
		this.overviewManager.goToNextPage();
	}

	loadGymMembersData() {
		return this.overviewManager.loadGymMembersData();
	}

	setupSearchFunctionality() {
		this.overviewManager.setupSearchFunctionality();
	}

	matchesSearchTerm(member, searchTerm) {
		return this.overviewManager.matchesSearchTerm(member, searchTerm);
	}

	loadUserDetailData() {
		return this.userDetailManager.loadUserDetailData();
	}

	hideLoadingState() {
		this.userDetailManager.hideLoadingState();
	}

	showUserDetailError() {
		this.userDetailManager.showUserDetailError();
	}

	displayUserDetails(user) {
		this.userDetailManager.displayUserDetails(user);
	}

	createPaginationWithEllipsis(container) {
		this.paginationManager.createPaginationWithEllipsis(container);
	}

	createPageButton(container, pageNumber, isActive) {
		this.paginationManager.createPageButton(container, pageNumber, isActive);
	}
}