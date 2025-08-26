// Overview Page Manager - Handles overview page functionality
class OverviewManager {
    constructor(router) {
        this.router = router;
        this.dataManager = new DataManager();
        this.paginationManager = new PaginationManager();
        this.searchManager = new SearchManager(this.dataManager, (data) => this.updateDisplay(data));
        this.modalManager = new ModalManager(this.dataManager, () => this.refreshData());
    }

    async initialize() {
        // Load data first
        const result = await this.dataManager.loadGymMembersData();
        if (!result.success) {
            this.showError("Error loading data. Please try again later.");
            return;
        }

        // Initialize components
        setTimeout(() => {
            this.searchManager.init();
            this.modalManager.init();
            this.updateDisplay(this.dataManager.filteredData);
        }, 100);
    }

    updateDisplay(data) {
        this.paginationManager.setData(data);
        this.displayCurrentPage();
        this.paginationManager.setupControls(() => this.displayCurrentPage());
    }

    displayCurrentPage() {
        const tableBody = document.getElementById("booking-table-body");
        if (!tableBody) {
            console.warn("Table body element not found");
            return;
        }

        tableBody.innerHTML = "";
        const currentPageData = this.paginationManager.getCurrentPageData();

        if (currentPageData.length === 0 && this.paginationManager.data.length === 0) {
            this.showNoResults(tableBody);
            return;
        }

        currentPageData.forEach((member) => {
            const row = this.createMemberRow(member);
            tableBody.appendChild(row);
        });
    }

    createMemberRow(member) {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors";
        
        row.addEventListener('click', () => {
            this.router.navigateTo('user-detail', member.bookingNo);
        });

        row.innerHTML = `
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${member.bookingNo}</td>
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <span class="text-sm text-gray-900 dark:text-gray-100">${member.name}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${member.sex}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${member.age}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100" title="${member.email}">${member.email.length > 20 ? member.email.substring(0, 20) + '...' : member.email}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${member.mobile}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${member.lastVisit}</td>
            <td class="px-6 py-4">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.statusClass} whitespace-nowrap">
                    ${member.expiryStatus}
                </span>
            </td>
        `;

        return row;
    }

    showNoResults(tableBody) {
        const noResultsRow = document.createElement("tr");
        noResultsRow.innerHTML = `
            <td colspan="8" class="px-6 py-8 text-center">
                <div class="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <i class="fa-regular fa-search text-3xl mb-3"></i>
                    <h3 class="text-lg font-medium mb-1">No members found</h3>
                    <p class="text-sm">Try adjusting your search terms or clear the search to see all members.</p>
                    <button onclick="window.gymRouter?.overviewManager?.clearSearch()" 
                            class="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                        Clear Search
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(noResultsRow);
    }

    showError(message) {
        const tableBody = document.getElementById("booking-table-body");
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-4 text-center text-sm text-red-500">
                        ${message}
                    </td>
                </tr>
            `;
        }
    }

    clearSearch() {
        this.searchManager.clearSearch();
    }

    refreshData() {
        this.updateDisplay(this.dataManager.filteredData);
    }
}