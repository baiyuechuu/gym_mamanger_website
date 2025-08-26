// Modal Management - Handle add member modal functionality
class ModalManager {
    constructor(dataManager, onMemberAdded) {
        this.dataManager = dataManager;
        this.onMemberAdded = onMemberAdded;
        this.modal = null;
        this.form = null;
    }

    init() {
        this.modal = document.getElementById('add-member-modal');
        this.form = document.getElementById('add-member-form');
        
        if (!this.modal || !this.form) {
            console.warn('Add member modal elements not found');
            return;
        }

        this.setupModalControls();
        this.setupFormHandlers();
    }

    setupModalControls() {
        const addMemberBtn = document.getElementById('add-member-btn');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const cancelBtn = document.getElementById('cancel-btn');

        // Open modal
        addMemberBtn?.addEventListener('click', () => {
            this.openModal();
        });

        // Close modal
        const closeModal = () => this.closeModal();
        closeModalBtn?.addEventListener('click', closeModal);
        cancelBtn?.addEventListener('click', closeModal);

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                closeModal();
            }
        });
    }

    setupFormHandlers() {
        const packageSelect = document.getElementById('member-package');
        const startDateInput = document.getElementById('member-start-date');

        // Auto-calculate end date
        const calculateEndDate = () => {
            const packageType = packageSelect?.value;
            const startDate = startDateInput?.value;

            if (packageType && startDate) {
                const endDateInput = document.getElementById('member-end-date');
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

                if (endDateInput) {
                    endDateInput.value = endDate.toISOString().split('T')[0];
                }
            }
        };

        packageSelect?.addEventListener('change', calculateEndDate);
        startDateInput?.addEventListener('change', calculateEndDate);

        // Handle form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddMember();
        });
    }

    openModal() {
        this.modal.classList.remove('hidden');
        this.setDefaultDates();
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.form.reset();
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        
        const signupInput = document.getElementById('member-signup');
        const startDateInput = document.getElementById('member-start-date');
        const paymentDateInput = document.getElementById('member-payment-date');
        const birthdayInput = document.getElementById('member-birthday');

        if (signupInput) signupInput.value = today;
        if (startDateInput) startDateInput.value = today;
        if (paymentDateInput) paymentDateInput.value = today;

        // Set max date for birthday (must be at least 16 years old)
        if (birthdayInput) {
            const maxBirthday = new Date();
            maxBirthday.setFullYear(maxBirthday.getFullYear() - 16);
            birthdayInput.max = maxBirthday.toISOString().split('T')[0];
        }
    }

    async handleAddMember() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Adding Member...';

            // Get form data
            const formData = new FormData(this.form);
            const memberData = {};

            for (let [key, value] of formData.entries()) {
                memberData[key] = value.trim();
            }

            // Validate
            const validationErrors = this.validateMemberData(memberData);
            if (validationErrors.length > 0) {
                this.showErrorMessage(validationErrors.join('<br>'));
                return;
            }

            // Check for duplicate email
            const emailExists = this.dataManager.allData.some(member => 
                member.email.toLowerCase() === memberData.email.toLowerCase()
            );
            if (emailExists) {
                this.showErrorMessage('A member with this email already exists.');
                return;
            }

            // Create new member
            const newMember = this.createMemberObject(memberData);

            // Add to data
            this.dataManager.addMember(newMember);

            // Save to file
            const saveResult = await this.dataManager.saveMembersToFile();
            if (!saveResult.success) {
                this.dataManager.removeMember(newMember.bookingNo);
                this.showErrorMessage('Failed to save member data. Please try again.');
                return;
            }

            // Success
            this.closeModal();
            this.showSuccessMessage(`Member ${memberData.name} has been added successfully!`);
            this.onMemberAdded();

        } catch (error) {
            console.error('Error adding member:', error);
            this.showErrorMessage('Failed to add member. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }

    createMemberObject(memberData) {
        const lastBookingNo = this.dataManager.getLastBookingNumber();
        const newBookingNo = this.dataManager.generateBookingNumber(lastBookingNo);

        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-GB');
        };

        return {
            bookingNo: newBookingNo,
            name: memberData.name,
            sex: memberData.sex,
            age: parseInt(memberData.age),
            email: memberData.email,
            mobile: memberData.mobile,
            lastVisit: formatDate(memberData.startDate),
            expiryStatus: memberData.paymentStatus,
            statusClass: this.getStatusClass(memberData.paymentStatus),
            address: memberData.address,
            birthday: memberData.birthday,
            signupDate: memberData.signupDate,
            packageType: memberData.packageType,
            startDate: memberData.startDate,
            endDate: memberData.endDate,
            paymentDate: memberData.paymentDate
        };
    }

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

        // Mobile validation
        const mobileRegex = /^[+]?[\d\s-()]{10,}$/;
        if (!data.mobile || !mobileRegex.test(data.mobile)) {
            errors.push('Please enter a valid mobile number.');
        }

        return errors;
    }

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

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'success') {
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