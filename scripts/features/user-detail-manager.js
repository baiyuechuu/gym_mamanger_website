// User Detail Manager - Handles user detail page functionality
class UserDetailManager {
	constructor(router) {
		this.router = router;
		this.dataManager = new DataManager();
		this.currentUser = null;
	}

	async initialize() {
		await this.loadUserDetailData();
		this.setupEventListeners();
	}

	async loadUserDetailData() {
		if (!this.router.currentUserId) {
			this.showError();
			return;
		}

		try {
			// Load data
			const result = await this.dataManager.loadGymMembersData();
			if (!result.success) {
				this.showError();
				return;
			}

			// Find the user
			const user = this.dataManager.findMemberByBookingNo(
				this.router.currentUserId,
			);

			if (!user) {
				this.showError();
				return;
			}

			// Display user details
			this.currentUser = user;
			this.hideLoadingState();
			this.displayUserDetails(user);
		} catch (error) {
			console.error("Error loading user detail data:", error);
			this.showError();
		}
	}

	hideLoadingState() {
		const loadingState = document.getElementById("loading-state");
		const errorState = document.getElementById("error-state");
		const memberDetails = document.getElementById("member-details");

		if (loadingState) loadingState.classList.add("hidden");
		if (errorState) errorState.classList.add("hidden");
		if (memberDetails) memberDetails.classList.remove("hidden");
	}

	showError() {
		const loadingState = document.getElementById("loading-state");
		const errorState = document.getElementById("error-state");
		const memberDetails = document.getElementById("member-details");

		if (loadingState) loadingState.classList.add("hidden");
		if (errorState) errorState.classList.remove("hidden");
		if (memberDetails) memberDetails.classList.add("hidden");
	}

	displayUserDetails(user) {
		// Update header information
		this.updateElement("member-name", user.name);
		this.updateElement("member-booking-no", user.bookingNo);

		// Update personal information
		this.updateElement("detail-name", user.name);
		this.updateElement("detail-sex", user.sex);
		this.updateElement("detail-age", user.age);
		this.updateElement("detail-birthday", this.formatDate(user.birthday));
		this.updateElement("detail-booking-no", user.bookingNo);

		// Update contact information
		this.updateContactElement(
			"detail-email",
			user.email,
			`mailto:${user.email}`,
		);
		this.updateContactElement(
			"detail-mobile",
			user.mobile,
			`tel:${user.mobile}`,
		);
		this.updateElement("detail-address", user.address || "Not provided");

		// Update membership status
		this.updateStatusElement(
			"detail-status",
			user.expiryStatus,
			user.statusClass,
		);
		this.updateElement(
			"detail-package-type",
			this.formatPackageType(user.packageType),
		);
		this.updateElement("detail-last-visit", user.lastVisit);

		// Update membership details
		this.updateElement("detail-signup-date", this.formatDate(user.signupDate));
		this.updateElement("detail-start-date", this.formatDate(user.startDate));
		this.updateElement("detail-end-date", this.formatDate(user.endDate));
		this.updateElement(
			"detail-payment-date",
			this.formatDate(user.paymentDate),
		);
	}

	updateElement(id, text) {
		const element = document.getElementById(id);
		if (element) {
			element.textContent = text;
		}
	}

	updateContactElement(id, text, href) {
		const element = document.getElementById(id);
		if (element) {
			element.textContent = text;
			element.href = href;
		}
	}

	updateStatusElement(id, text, className) {
		const element = document.getElementById(id);
		if (element) {
			element.textContent = text;
			element.className = `inline-flex px-3 py-1 text-sm font-semibold rounded-full ${className}`;
		}
	}

	formatDate(dateString) {
		if (!dateString) return "Not provided";

		try {
			let date;
			if (dateString.includes("/")) {
				const parts = dateString.split("/");
				if (parts.length === 3) {
					date = new Date(parts[2], parts[1] - 1, parts[0]);
				}
			} else {
				date = new Date(dateString);
			}

			if (isNaN(date.getTime())) {
				return dateString;
			}

			return date.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});
		} catch (error) {
			return dateString;
		}
	}

	formatPackageType(packageType) {
		if (!packageType) return "Not specified";

		const packageMap = {
			month: "1 Month",
			"6month": "6 Months",
			year: "1 Year",
		};

		return packageMap[packageType] || packageType;
	}

	setupEventListeners() {
		// Edit member button
		const editBtn = document.getElementById("edit-member-btn");
		editBtn?.addEventListener("click", () => this.openEditModal());

		// Edit modal controls
		const closeEditBtn = document.getElementById("close-edit-modal-btn");
		const cancelEditBtn = document.getElementById("cancel-edit-btn");
		closeEditBtn?.addEventListener("click", () => this.closeEditModal());
		cancelEditBtn?.addEventListener("click", () => this.closeEditModal());

		// Edit form submission
		const editForm = document.getElementById("edit-member-form");
		editForm?.addEventListener("submit", (e) => this.handleEditSubmit(e));

		// Package type change for auto-calculating end date
		const editPackageSelect = document.getElementById("edit-package-type");
		const editStartDateInput = document.getElementById("edit-start-date");
		editPackageSelect?.addEventListener("change", () =>
			this.calculateEndDate(),
		);
		editStartDateInput?.addEventListener("change", () =>
			this.calculateEndDate(),
		);

		// Payment collection button
		const collectPaymentBtn = document.getElementById("collect-payment-btn");
		collectPaymentBtn?.addEventListener("click", () => this.openPaymentModal());

		// Payment modal controls
		const closePaymentBtn = document.getElementById("close-payment-modal-btn");
		const cancelPaymentBtn = document.getElementById("cancel-payment-btn");
		closePaymentBtn?.addEventListener("click", () => this.closePaymentModal());
		cancelPaymentBtn?.addEventListener("click", () => this.closePaymentModal());

		// Payment form submission
		const paymentForm = document.getElementById("payment-form");
		paymentForm?.addEventListener("submit", (e) => this.handlePaymentSubmit(e));

		// Termination button
		const terminateBtn = document.getElementById("terminate-membership-btn");
		terminateBtn?.addEventListener("click", () => this.openTerminationModal());

		// Termination modal controls
		const closeTerminationBtn = document.getElementById(
			"close-termination-modal-btn",
		);
		const cancelTerminationBtn = document.getElementById(
			"cancel-termination-btn",
		);
		closeTerminationBtn?.addEventListener("click", () =>
			this.closeTerminationModal(),
		);
		cancelTerminationBtn?.addEventListener("click", () =>
			this.closeTerminationModal(),
		);

		// Termination form submission
		const terminationForm = document.getElementById("termination-form");
		terminationForm?.addEventListener("submit", (e) =>
			this.handleTerminationSubmit(e),
		);

		// Close modals when clicking outside
		const editModal = document.getElementById("edit-member-modal");
		const paymentModal = document.getElementById("payment-modal");
		const terminationModal = document.getElementById("termination-modal");

		editModal?.addEventListener("click", (e) => {
			if (e.target === editModal) this.closeEditModal();
		});
		paymentModal?.addEventListener("click", (e) => {
			if (e.target === paymentModal) this.closePaymentModal();
		});
		terminationModal?.addEventListener("click", (e) => {
			if (e.target === terminationModal) this.closeTerminationModal();
		});
	}

	// Edit Member Functionality
	openEditModal() {
		if (!this.currentUser) return;

		// Populate form with current user data
		document.getElementById("edit-name").value = this.currentUser.name || "";
		document.getElementById("edit-sex").value = this.currentUser.sex || "";
		document.getElementById("edit-age").value = this.currentUser.age || "";
		document.getElementById("edit-birthday").value =
			this.currentUser.birthday || "";
		document.getElementById("edit-email").value = this.currentUser.email || "";
		document.getElementById("edit-mobile").value =
			this.currentUser.mobile || "";
		document.getElementById("edit-address").value =
			this.currentUser.address || "";
		document.getElementById("edit-package-type").value =
			this.currentUser.packageType || "";
		document.getElementById("edit-start-date").value =
			this.currentUser.startDate || "";
		document.getElementById("edit-end-date").value =
			this.currentUser.endDate || "";

		// Show modal
		document.getElementById("edit-member-modal").classList.remove("hidden");
	}

	closeEditModal() {
		document.getElementById("edit-member-modal").classList.add("hidden");
	}

	calculateEndDate() {
		const packageSelect = document.getElementById("edit-package-type");
		const startDateInput = document.getElementById("edit-start-date");
		const endDateInput = document.getElementById("edit-end-date");

		const packageType = packageSelect?.value;
		const startDate = startDateInput?.value;

		if (packageType && startDate) {
			const start = new Date(startDate);
			let endDate = new Date(start);

			switch (packageType) {
				case "month":
					endDate.setMonth(endDate.getMonth() + 1);
					break;
				case "6month":
					endDate.setMonth(endDate.getMonth() + 6);
					break;
				case "year":
					endDate.setFullYear(endDate.getFullYear() + 1);
					break;
			}

			if (endDateInput) {
				endDateInput.value = endDate.toISOString().split("T")[0];
			}
		}
	}

	async handleEditSubmit(e) {
		e.preventDefault();

		const submitBtn = e.target.querySelector('button[type="submit"]');
		const originalBtnText = submitBtn.innerHTML;

		try {
			// Show loading state
			submitBtn.disabled = true;
			submitBtn.innerHTML =
				'<i class="fa-solid fa-spinner fa-spin mr-2"></i>Saving Changes...';

			// Get form data
			const formData = new FormData(e.target);
			const updatedData = {};

			for (let [key, value] of formData.entries()) {
				updatedData[key] = value.trim();
			}

			// Convert age to number
			updatedData.age = parseInt(updatedData.age);

			// Validate data
			const validationErrors = this.validateEditData(updatedData);
			if (validationErrors.length > 0) {
				this.showMessage(validationErrors.join("<br>"), "error");
				return;
			}

			// Update member data
			const updatedMember = this.dataManager.updateMember(
				this.currentUser.bookingNo,
				updatedData,
			);

			// Save to file
			const saveResult = await this.dataManager.saveMembersToFile();
			if (!saveResult.success) {
				this.showMessage("Failed to save changes. Please try again.", "error");
				return;
			}

			// Update current user and refresh display
			this.currentUser = updatedMember;
			this.displayUserDetails(updatedMember);
			this.closeEditModal();
			this.showMessage("Member information updated successfully!", "success");
		} catch (error) {
			console.error("Error updating member:", error);
			this.showMessage(
				"Failed to update member information. Please try again.",
				"error",
			);
		} finally {
			submitBtn.disabled = false;
			submitBtn.innerHTML = originalBtnText;
		}
	}

	validateEditData(data) {
		const errors = [];

		// Name validation
		if (!data.name || data.name.length < 2) {
			errors.push("Name must be at least 2 characters long.");
		}

		// Age validation
		const age = parseInt(data.age);
		if (!age || age < 16 || age > 100) {
			errors.push("Age must be between 16 and 100.");
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!data.email || !emailRegex.test(data.email)) {
			errors.push("Please enter a valid email address.");
		}

		// Mobile validation
		const mobileRegex = /^[+]?[\d\s-()]{10,}$/;
		if (!data.mobile || !mobileRegex.test(data.mobile)) {
			errors.push("Please enter a valid mobile number.");
		}

		return errors;
	}

	// Payment Collection Functionality
	openPaymentModal() {
		// Set default payment date to today
		const today = new Date().toISOString().split("T")[0];
		document.getElementById("payment-date").value = today;

		// Show modal
		document.getElementById("payment-modal").classList.remove("hidden");
	}

	closePaymentModal() {
		document.getElementById("payment-modal").classList.add("hidden");
		document.getElementById("payment-form").reset();
	}

	async handlePaymentSubmit(e) {
		e.preventDefault();

		const submitBtn = e.target.querySelector('button[type="submit"]');
		const originalBtnText = submitBtn.innerHTML;

		try {
			// Show loading state
			submitBtn.disabled = true;
			submitBtn.innerHTML =
				'<i class="fa-solid fa-spinner fa-spin mr-2"></i>Processing Payment...';

			// Get form data
			const formData = new FormData(e.target);
			const paymentMethod = formData.get("paymentMethod");
			const amount = parseFloat(formData.get("amount"));
			const paymentDate = formData.get("paymentDate");
			const notes = formData.get("notes");

			// Validate amount
			if (!amount || amount <= 0) {
				this.showMessage("Please enter a valid payment amount.", "error");
				return;
			}

			// Update member payment status and date
			const updatedData = {
				expiryStatus: paymentMethod,
				statusClass: this.getStatusClass(paymentMethod),
				paymentDate: paymentDate,
				lastVisit: new Date().toLocaleDateString("en-GB"),
			};

			// Update member data
			const updatedMember = this.dataManager.updateMember(
				this.currentUser.bookingNo,
				updatedData,
			);

			// Save to file
			const saveResult = await this.dataManager.saveMembersToFile();
			if (!saveResult.success) {
				this.showMessage(
					"Failed to process payment. Please try again.",
					"error",
				);
				return;
			}

			// Update current user and refresh display
			this.currentUser = updatedMember;
			this.displayUserDetails(updatedMember);
			this.closePaymentModal();
			this.showMessage(
				`Payment of $${amount.toFixed(2)} processed successfully!`,
				"success",
			);
		} catch (error) {
			console.error("Error processing payment:", error);
			this.showMessage("Failed to process payment. Please try again.", "error");
		} finally {
			submitBtn.disabled = false;
			submitBtn.innerHTML = originalBtnText;
		}
	}

	getStatusClass(status) {
		switch (status) {
			case "Cash - Paid":
				return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
			case "Online - Paid":
				return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
			case "Pending":
				return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
			case "Terminated":
				return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
			default:
				return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400";
		}
	}

	// Termination Functionality
	openTerminationModal() {
		// Set default termination date to today
		const today = new Date().toISOString().split("T")[0];
		document.getElementById("termination-date").value = today;

		// Show modal
		document.getElementById("termination-modal").classList.remove("hidden");
	}

	closeTerminationModal() {
		document.getElementById("termination-modal").classList.add("hidden");
		document.getElementById("termination-form").reset();
	}

	async handleTerminationSubmit(e) {
		e.preventDefault();

		const submitBtn = e.target.querySelector('button[type="submit"]');
		const originalBtnText = submitBtn.innerHTML;

		try {
			// Show loading state
			submitBtn.disabled = true;
			submitBtn.innerHTML =
				'<i class="fa-solid fa-spinner fa-spin mr-2"></i>Terminating Membership...';

			// Get form data
			const formData = new FormData(e.target);
			const terminationDate = formData.get("terminationDate");
			const reason = formData.get("reason");
			const notes = formData.get("notes");

			// Validate required fields
			if (!terminationDate || !reason) {
				this.showMessage("Please fill in all required fields.", "error");
				return;
			}

			// Update member status to terminated
			const updatedData = {
				expiryStatus: "Terminated",
				statusClass: this.getStatusClass("Terminated"),
				endDate: terminationDate,
				terminationReason: reason,
				terminationNotes: notes,
				terminationDate: terminationDate,
			};

			// Update member data
			const updatedMember = this.dataManager.updateMember(
				this.currentUser.bookingNo,
				updatedData,
			);

			// Save to file
			const saveResult = await this.dataManager.saveMembersToFile();
			if (!saveResult.success) {
				this.showMessage(
					"Failed to terminate membership. Please try again.",
					"error",
				);
				return;
			}

			// Update current user and refresh display
			this.currentUser = updatedMember;
			this.displayUserDetails(updatedMember);
			this.closeTerminationModal();
			this.showMessage("Membership terminated successfully.", "success");
		} catch (error) {
			console.error("Error terminating membership:", error);
			this.showMessage(
				"Failed to terminate membership. Please try again.",
				"error",
			);
		} finally {
			submitBtn.disabled = false;
			submitBtn.innerHTML = originalBtnText;
		}
	}

	showMessage(message, type = "success") {
		const messageDiv = document.createElement("div");
		messageDiv.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
			type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
		}`;
		messageDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fa-solid ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
                <span>${message}</span>
            </div>
        `;

		document.body.appendChild(messageDiv);

		// Animate in
		setTimeout(() => {
			messageDiv.classList.remove("translate-x-full");
		}, 100);

		// Remove after 3 seconds
		setTimeout(() => {
			messageDiv.classList.add("translate-x-full");
			setTimeout(() => {
				if (document.body.contains(messageDiv)) {
					document.body.removeChild(messageDiv);
				}
			}, 300);
		}, 3000);
	}
}

