// User Detail Manager - Handles user detail page functionality
class UserDetailManager {
    constructor(router) {
        this.router = router;
        this.dataManager = new DataManager();
    }

    async initialize() {
        await this.loadUserDetailData();
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
            const user = this.dataManager.findMemberByBookingNo(this.router.currentUserId);
            
            if (!user) {
                this.showError();
                return;
            }

            // Display user details
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
        this.updateContactElement("detail-email", user.email, `mailto:${user.email}`);
        this.updateContactElement("detail-mobile", user.mobile, `tel:${user.mobile}`);
        this.updateElement("detail-address", user.address || 'Not provided');

        // Update membership status
        this.updateStatusElement("detail-status", user.expiryStatus, user.statusClass);
        this.updateElement("detail-package-type", this.formatPackageType(user.packageType));
        this.updateElement("detail-last-visit", user.lastVisit);

        // Update membership details
        this.updateElement("detail-signup-date", this.formatDate(user.signupDate));
        this.updateElement("detail-start-date", this.formatDate(user.startDate));
        this.updateElement("detail-end-date", this.formatDate(user.endDate));
        this.updateElement("detail-payment-date", this.formatDate(user.paymentDate));
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
        if (!dateString) return 'Not provided';
        
        try {
            let date;
            if (dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    date = new Date(parts[2], parts[1] - 1, parts[0]);
                }
            } else {
                date = new Date(dateString);
            }
            
            if (isNaN(date.getTime())) {
                return dateString;
            }
            
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    formatPackageType(packageType) {
        if (!packageType) return 'Not specified';
        
        const packageMap = {
            'month': '1 Month',
            '6month': '6 Months',
            'year': '1 Year'
        };
        
        return packageMap[packageType] || packageType;
    }
}