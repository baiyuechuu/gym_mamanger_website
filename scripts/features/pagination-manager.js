// Pagination Manager - Handles pagination controls and logic
class PaginationManager {
	constructor(overviewManager) {
		this.overviewManager = overviewManager;
	}

	setupPaginationControls() {
		// Setup Previous button
		const prevButton = document.getElementById('prev-button');
		if (prevButton) {
			prevButton.onclick = () => this.overviewManager.goToPreviousPage();
			prevButton.disabled = this.overviewManager.pagination.currentPage === 1;
		}

		// Setup Next button
		const nextButton = document.getElementById('next-button');
		if (nextButton) {
			nextButton.onclick = () => this.overviewManager.goToNextPage();
			nextButton.disabled = this.overviewManager.pagination.currentPage === this.overviewManager.pagination.totalPages;
		}

		// Setup top pagination (simple page numbers)
		const topPagination = document.getElementById('top-pagination');
		if (topPagination) {
			topPagination.innerHTML = '';
			
			for (let i = 1; i <= this.overviewManager.pagination.totalPages; i++) {
				const pageButton = document.createElement('button');
				pageButton.className = `w-8 h-8 flex items-center justify-center text-sm rounded ${
					i === this.overviewManager.pagination.currentPage 
						? 'bg-purple-600 text-white' 
						: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
				}`;
				pageButton.textContent = i;
				pageButton.onclick = () => this.overviewManager.goToPage(i);
				topPagination.appendChild(pageButton);
			}
		}

		// Setup bottom pagination (with ellipsis for many pages)
		const bottomPagination = document.getElementById('bottom-pagination');
		if (bottomPagination) {
			bottomPagination.innerHTML = '';
			
			// For small number of pages, show all
			if (this.overviewManager.pagination.totalPages <= 5) {
				for (let i = 1; i <= this.overviewManager.pagination.totalPages; i++) {
					const pageButton = document.createElement('button');
					pageButton.className = `w-8 h-8 flex items-center justify-center text-sm rounded ${
						i === this.overviewManager.pagination.currentPage 
							? 'bg-purple-600 text-white' 
							: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
					}`;
					pageButton.textContent = i;
					pageButton.onclick = () => this.overviewManager.goToPage(i);
					bottomPagination.appendChild(pageButton);
				}
			} else {
				// For many pages, show with ellipsis
				this.createPaginationWithEllipsis(bottomPagination);
			}
		}
	}

	createPaginationWithEllipsis(container) {
		const current = this.overviewManager.pagination.currentPage;
		const total = this.overviewManager.pagination.totalPages;
		
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
		pageButton.onclick = () => this.overviewManager.goToPage(pageNumber);
		container.appendChild(pageButton);
	}
}