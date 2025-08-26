// Pagination Management - Handle pagination controls and logic
class PaginationManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalItems = 0;
        this.totalPages = 0;
        this.data = [];
    }

    setData(data) {
        this.data = data;
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1;
    }

    getCurrentPageData() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return this.data.slice(startIndex, endIndex);
    }

    goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.currentPage = pageNumber;
            return true;
        }
        return false;
    }

    goToPreviousPage() {
        return this.goToPage(this.currentPage - 1);
    }

    goToNextPage() {
        return this.goToPage(this.currentPage + 1);
    }

    setupControls(onPageChange) {
        // Setup Previous button
        const prevButton = document.getElementById('prev-button');
        if (prevButton) {
            prevButton.onclick = () => {
                if (this.goToPreviousPage()) {
                    onPageChange();
                }
            };
            prevButton.disabled = this.currentPage === 1;
        }

        // Setup Next button
        const nextButton = document.getElementById('next-button');
        if (nextButton) {
            nextButton.onclick = () => {
                if (this.goToNextPage()) {
                    onPageChange();
                }
            };
            nextButton.disabled = this.currentPage === this.totalPages;
        }

        // Setup top pagination
        this.setupTopPagination(onPageChange);
        
        // Setup bottom pagination
        this.setupBottomPagination(onPageChange);
    }

    setupTopPagination(onPageChange) {
        const topPagination = document.getElementById('top-pagination');
        if (!topPagination) return;

        topPagination.innerHTML = '';
        
        for (let i = 1; i <= this.totalPages; i++) {
            const pageButton = this.createPageButton(i, onPageChange);
            topPagination.appendChild(pageButton);
        }
    }

    setupBottomPagination(onPageChange) {
        const bottomPagination = document.getElementById('bottom-pagination');
        if (!bottomPagination) return;

        bottomPagination.innerHTML = '';
        
        if (this.totalPages <= 5) {
            for (let i = 1; i <= this.totalPages; i++) {
                const pageButton = this.createPageButton(i, onPageChange);
                bottomPagination.appendChild(pageButton);
            }
        } else {
            this.createPaginationWithEllipsis(bottomPagination, onPageChange);
        }
    }

    createPageButton(pageNumber, onPageChange) {
        const pageButton = document.createElement('button');
        pageButton.className = `w-8 h-8 flex items-center justify-center text-sm rounded ${
            pageNumber === this.currentPage 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
        }`;
        pageButton.textContent = pageNumber;
        pageButton.onclick = () => {
            if (this.goToPage(pageNumber)) {
                onPageChange();
            }
        };
        return pageButton;
    }

    createPaginationWithEllipsis(container, onPageChange) {
        const current = this.currentPage;
        const total = this.totalPages;
        
        // Always show first page
        container.appendChild(this.createPageButton(1, onPageChange));
        
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
            container.appendChild(this.createPageButton(i, onPageChange));
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
            container.appendChild(this.createPageButton(total, onPageChange));
        }
    }
}