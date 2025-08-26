// Overview Page Manager - Handles overview page functionality
class OverviewManager {
	constructor(router) {
		this.router = router;
		this.pagination = {
			currentPage: 1,
			itemsPerPage: 10,
			totalItems: 0,
			totalPages: 0,
			allData: [],
			filteredData: []
		};
	}

	initialize() {
		// Initialize search functionality for the overview page
		setTimeout(() => {
			this.setupSearchFunctionality();
			this.setupAddMemberModal();
			// Make search manager globally accessible for the clear search button
			window.gymRouter = this.router;
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
		this.router.setupPaginationControls();
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
			this.router.setupPaginationControls();
			
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
						<button onclick="window.gymRouter?.overviewManager?.clearSearch()" 
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
			row.className = "hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors";
			
			// Add click handler to navigate to user detail
			row.addEventListener('click', () => {
				this.router.navigateTo('user-detail', member.bookingNo);
			});

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

	goToPage(pageNumber) {
		if (pageNumber >= 1 && pageNumber <= this.pagination.totalPages) {
			this.pagination.currentPage = pageNumber;
			this.displayCurrentPage();
			this.router.setupPaginationControls();
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

	// Setup Add Member Modal functionality
	setupAddMemberModal() {
		const addMemberBtn = document.getElementById('add-member-btn');
		const modal = document.getElementById('add-member-modal');
		const closeModalBtn = document.getElementById('close-modal-btn');
		const cancelBtn = document.getElementById('cancel-btn');
		const form = document.getElementById('add-member-form');
		const packageSelect = document.getElementById('member-package');
		const startDateInput = document.getElementById('member-start-date');
		const endDateInput = document.getElementById('member-end-date');

		if (!addMemberBtn || !modal || !form) {
			console.warn('Add member modal elements not found');
			return;
		}

		// Open modal
		addMemberBtn.addEventListener('click', () => {
			modal.classList.remove('hidden');
			this.setDefaultDates();
		});

		// Close modal
		const closeModal = () => {
			modal.classList.add('hidden');
			form.reset();
		};

		closeModalBtn?.addEventListener('click', closeModal);
		cancelBtn?.addEventListener('click', closeModal);

		// Close modal when clicking outside
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				closeModal();
			}
		});

		// Auto-calculate end date based on package and start date
		const calculateEndDate = () => {
			const packageType = packageSelect.value;
			const startDate = startDateInput.value;

			if (packageType && startDate) {
				const start = new Date(startDate);
				let endDate = new Date(start);

				switch (packageType) {
					case 'month':
						endDate.setMonth(endDate.getMonth() + 1);
						break;
					case '6month':
						endDate.setMonth(endDate.getMonth() + 6);
						break;
					case 'year':
						endDate.setFullYear(endDate.getFullYear() + 1);
						break;
				}

				endDateInput.value = endDate.toISOString().split('T')[0];
			}
		};

		packageSelect?.addEventListener('change', calculateEndDate);
		startDateInput?.addEventListener('change', calculateEndDate);

		// Handle form submission
		form.addEventListener('submit', (e) => {
			e.preventDefault();
			this.handleAddMember(form);
		});
	}

	// Set default dates for form
	setDefaultDates() {
		const today = new Date().toISOString().split('T')[0];
		const signupInput = document.getElementById('member-signup');
		const startDateInput = document.getElementById('member-start-date');
		const paymentDateInput = document.getElementById('member-payment-date');
		const endDateInput = document.getElementById('member-end-date');

		if (signupInput) signupInput.value = today;
		if (startDateInput) startDateInput.value = today;
		if (paymentDateInput) paymentDateInput.value = today;
		if (endDateInput) endDateInput.value = '';

		// Set max date for birthday (must be at least 16 years old)
		const birthdayInput = document.getElementById('member-birthday');
		if (birthdayInput) {
			const maxBirthday = new Date();
			maxBirthday.setFullYear(maxBirthday.getFullYear() - 16);
			birthdayInput.max = maxBirthday.toISOString().split('T')[0];
		}
	}

	// Handle adding new member
	async handleAddMember(form) {
		const submitBtn = form.querySelector('button[type="submit"]');
		const originalBtnText = submitBtn.innerHTML;
		
		try {
			// Show loading state
			submitBtn.disabled = true;
			submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Adding Member...';

			// Validate form data
			const formData = new FormData(form);
			const memberData = {};

			// Convert form data to object
			for (let [key, value] of formData.entries()) {
				memberData[key] = value.trim();
			}

			// Validate required fields
			const validationErrors = this.validateMemberData(memberData);
			if (validationErrors.length > 0) {
				this.showErrorMessage(validationErrors.join('<br>'));
				return;
			}

			// Check for duplicate email
			const emailExists = this.pagination.allData.some(member => 
				member.email.toLowerCase() === memberData.email.toLowerCase()
			);
			if (emailExists) {
				this.showErrorMessage('A member with this email already exists.');
				return;
			}

			// Generate booking number
			const lastBookingNo = this.getLastBookingNumber();
			const newBookingNo = this.generateBookingNumber(lastBookingNo);

			// Format dates for display
			const formatDate = (dateStr) => {
				const date = new Date(dateStr);
				return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
			};

			// Create new member object
			const newMember = {
				bookingNo: newBookingNo,
				name: memberData.name,
				sex: memberData.sex,
				age: parseInt(memberData.age),
				email: memberData.email,
				mobile: memberData.mobile,
				lastVisit: formatDate(memberData.startDate),
				expiryStatus: memberData.paymentStatus,
				statusClass: this.getStatusClass(memberData.paymentStatus),
				// Additional fields for extended data
				address: memberData.address,
				birthday: memberData.birthday,
				signupDate: memberData.signupDate,
				packageType: memberData.packageType,
				startDate: memberData.startDate,
				endDate: memberData.endDate,
				paymentDate: memberData.paymentDate
			};

			// Add to data arrays first
			this.pagination.allData.unshift(newMember);
			this.pagination.filteredData.unshift(newMember);

			// Save to JSON file via API
			const saveResult = await this.saveMembersToFile();
			if (!saveResult.success) {
				// If save failed, remove from arrays and show error
				this.pagination.allData.shift();
				this.pagination.filteredData.shift();
				this.showErrorMessage('Failed to save member data. Please try again.');
				return;
			}

			// Update pagination
			this.pagination.totalItems = this.pagination.allData.length;
			this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.itemsPerPage);

			// Go to first page to show new member
			this.pagination.currentPage = 1;

			// Update display
			this.displayCurrentPage();
			this.router.setupPaginationControls();

			// Close modal and show success message
			document.getElementById('add-member-modal').classList.add('hidden');
			form.reset();

			this.showSuccessMessage(`Member ${memberData.name} has been added successfully and saved to file!`);

		} catch (error) {
			console.error('Error adding member:', error);
			this.showErrorMessage('Failed to add member. Please try again.');
		} finally {
			// Reset button state
			submitBtn.disabled = false;
			submitBtn.innerHTML = originalBtnText;
		}
	}

	// Save members data to JSON file via API
	async saveMembersToFile() {
		try {
			const response = await fetch('/api/save-members', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					members: this.pagination.allData
				})
			});

			const result = await response.json();
			
			if (!response.ok) {
				throw new Error(result.message || 'Failed to save data');
			}

			console.log('Data saved successfully:', result.message);
			return { success: true, data: result };

		} catch (error) {
			console.error('Error saving to file:', error);
			return { success: false, error: error.message };
		}
	}

	// Validate member data
	validateMemberData(data) {
		const errors = [];

		// Name validation
		if (!data.name || data.name.length < 2) {
			errors.push('Name must be at least 2 characters long.');
		}

		// Age validation
		const age = parseInt(data.age);
		if (!age || age < 16 || age > 100) {
			errors.push('Age must be between 16 and 100.');
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!data.email || !emailRegex.test(data.email)) {
			errors.push('Please enter a valid email address.');
		}

		// Mobile validation (basic format check)
		const mobileRegex = /^\+?[\d\s-()]{10,}$/;
		if (!data.mobile || !mobileRegex.test(data.mobile)) {
			errors.push('Please enter a valid mobile number.');
		}

		// Date validations
		const today = new Date();
		const birthday = new Date(data.birthday);
		const signupDate = new Date(data.signupDate);
		const startDate = new Date(data.startDate);
		const paymentDate = new Date(data.paymentDate);

		// Birthday should be at least 16 years ago
		const minBirthday = new Date();
		minBirthday.setFullYear(minBirthday.getFullYear() - 16);
		if (birthday > minBirthday) {
			errors.push('Member must be at least 16 years old.');
		}

		// Start date should not be in the past (allow today)
		const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
		if (startDateOnly < todayStart) {
			errors.push('Start date cannot be in the past.');
		}

		return errors;
	}

	// Generate new booking number
	getLastBookingNumber() {
		if (this.pagination.allData.length === 0) return '#102112';
		
		const bookingNumbers = this.pagination.allData.map(member => 
			parseInt(member.bookingNo.replace('#', ''))
		);
		
		return Math.max(...bookingNumbers);
	}

	generateBookingNumber(lastNumber) {
		const nextNumber = typeof lastNumber === 'string' ? 
			parseInt(lastNumber.replace('#', '')) + 1 : 
			lastNumber + 1;
		return `#${nextNumber}`;
	}

	// Get status class based on payment status
	getStatusClass(status) {
		switch (status) {
			case 'Cash - Paid':
				return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
			case 'Online - Paid':
				return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
			case 'Pending':
				return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
			default:
				return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400';
		}
	}

	// Show success message
	showSuccessMessage(message) {
		this.showMessage(message, 'success');
	}

	// Show error message
	showErrorMessage(message) {
		this.showMessage(message, 'error');
	}

	// Generic message display
	showMessage(message, type = 'success') {
		// Create message element
		const messageDiv = document.createElement('div');
		messageDiv.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
			type === 'success' 
				? 'bg-green-500 text-white' 
				: 'bg-red-500 text-white'
		}`;
		messageDiv.innerHTML = `
			<div class="flex items-center space-x-2">
				<i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
				<span>${message}</span>
			</div>
		`;

		document.body.appendChild(messageDiv);

		// Animate in
		setTimeout(() => {
			messageDiv.classList.remove('translate-x-full');
		}, 100);

		// Remove after 3 seconds
		setTimeout(() => {
			messageDiv.classList.add('translate-x-full');
			setTimeout(() => {
				document.body.removeChild(messageDiv);
			}, 300);
		}, 3000);
	}
}