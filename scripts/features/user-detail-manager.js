// User Detail Manager - Handles user detail page functionality
class UserDetailManager {
	constructor(router) {
		this.router = router;
	}

	initialize() {
		// Load user detail data
		setTimeout(() => {
			this.loadUserDetailData();
		}, 100);
	}

	async loadUserDetailData() {
		if (!this.router.currentUserId) {
			this.showUserDetailError();
			return;
		}

		try {
			// Load gym members data to find the specific user
			const response = await fetch("data/gym-members.json");
			const data = await response.json();
			
			// Find the user by booking number
			const user = data.members.find(member => member.bookingNo === this.router.currentUserId);
			
			if (!user) {
				this.showUserDetailError();
				return;
			}

			// Hide loading state and show user details
			this.hideLoadingState();
			this.displayUserDetails(user);
			
		} catch (error) {
			console.error("Error loading user detail data:", error);
			this.showUserDetailError();
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

	showUserDetailError() {
		const loadingState = document.getElementById("loading-state");
		const errorState = document.getElementById("error-state");
		const memberDetails = document.getElementById("member-details");
		
		if (loadingState) loadingState.classList.add("hidden");
		if (errorState) errorState.classList.remove("hidden");
		if (memberDetails) memberDetails.classList.add("hidden");
	}

	displayUserDetails(user) {
		// Update header information
		const memberName = document.getElementById("member-name");
		const memberBookingNo = document.getElementById("member-booking-no");
		
		if (memberName) memberName.textContent = user.name;
		if (memberBookingNo) memberBookingNo.textContent = user.bookingNo;

		// Update personal information
		const detailName = document.getElementById("detail-name");
		const detailSex = document.getElementById("detail-sex");
		const detailAge = document.getElementById("detail-age");
		const detailBookingNo = document.getElementById("detail-booking-no");
		
		if (detailName) detailName.textContent = user.name;
		if (detailSex) detailSex.textContent = user.sex;
		if (detailAge) detailAge.textContent = user.age;
		if (detailBookingNo) detailBookingNo.textContent = user.bookingNo;

		// Update contact information
		const detailEmail = document.getElementById("detail-email");
		const detailMobile = document.getElementById("detail-mobile");
		
		if (detailEmail) {
			detailEmail.textContent = user.email;
			detailEmail.href = `mailto:${user.email}`;
		}
		if (detailMobile) {
			detailMobile.textContent = user.mobile;
			detailMobile.href = `tel:${user.mobile}`;
		}

		// Update membership status
		const detailStatus = document.getElementById("detail-status");
		const detailLastVisit = document.getElementById("detail-last-visit");
		
		if (detailStatus) {
			detailStatus.textContent = user.expiryStatus;
			detailStatus.className = `inline-flex px-3 py-1 text-sm font-semibold rounded-full ${user.statusClass}`;
		}
		if (detailLastVisit) detailLastVisit.textContent = user.lastVisit;
	}
}