// Authentication Manager - Handle login/logout functionality
class AuthManager {
	constructor() {
		this.credentials = {
			email: "admin@gym.com",
			password: "baiyuechu",
		};
		this.sessionKey = "gym_auth_session";
	}

	init() {
		this.setupLoginForm();
		this.setupPasswordToggle();
	}

	setupLoginForm() {
		const loginForm = document.getElementById("login-form");
		if (!loginForm) return;

		loginForm.addEventListener("submit", (e) => {
			e.preventDefault();
			this.handleLogin();
		});

		// Auto-focus email field
		const emailInput = document.getElementById("email");
		if (emailInput) {
			emailInput.focus();
		}
	}

	setupPasswordToggle() {
		const toggleBtn = document.getElementById("toggle-password");
		const passwordInput = document.getElementById("password");
		const passwordIcon = document.getElementById("password-icon");

		if (toggleBtn && passwordInput && passwordIcon) {
			toggleBtn.addEventListener("click", () => {
				const isPassword = passwordInput.type === "password";
				passwordInput.type = isPassword ? "text" : "password";
				passwordIcon.className = isPassword
					? "fa-regular fa-eye-slash"
					: "fa-regular fa-eye";
			});
		}
	}

	async handleLogin() {
		const emailInput = document.getElementById("email");
		const passwordInput = document.getElementById("password");
		const rememberInput = document.getElementById("remember-me");
		const loginBtn = document.getElementById("login-btn");
		const errorDiv = document.getElementById("login-error");

		if (!emailInput || !passwordInput || !loginBtn) return;

		const email = emailInput.value.trim();
		const password = passwordInput.value;
		const remember = rememberInput?.checked || false;

		// Show loading state
		this.setLoadingState(loginBtn, true);
		this.hideError(errorDiv);

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 800));

		// Validate credentials
		if (this.validateCredentials(email, password)) {
			// Success - create session
			this.createSession(email, remember);
			this.showSuccessMessage();

			// Redirect to main app
			setTimeout(() => {
				window.location.reload();
			}, 1000);
		} else {
			// Error - show message
			this.showError(errorDiv, "Invalid email or password. Please try again.");
			this.setLoadingState(loginBtn, false);
		}
	}

	validateCredentials(email, password) {
		return (
			email === this.credentials.email && password === this.credentials.password
		);
	}

	createSession(email, remember) {
		const sessionData = {
			email: email,
			loginTime: new Date().toISOString(),
			remember: remember,
		};

		if (remember) {
			localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
		} else {
			sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
		}
	}

	isAuthenticated() {
		const sessionData = this.getSessionData();
		return sessionData !== null;
	}

	getSessionData() {
		// Check localStorage first (remember me)
		let sessionData = localStorage.getItem(this.sessionKey);
		if (sessionData) {
			return JSON.parse(sessionData);
		}

		// Check sessionStorage
		sessionData = sessionStorage.getItem(this.sessionKey);
		if (sessionData) {
			return JSON.parse(sessionData);
		}

		return null;
	}

	logout() {
		// Clear both storage types
		localStorage.removeItem(this.sessionKey);
		sessionStorage.removeItem(this.sessionKey);

		// Show logout message
		this.showLogoutMessage();

		// Redirect to login after delay
		setTimeout(() => {
			window.location.reload();
		}, 1500);
	}

	setLoadingState(button, loading) {
		if (loading) {
			button.disabled = true;
			button.innerHTML = `
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i class="fa-solid fa-spinner fa-spin text-purple-300"></i>
                </span>
                Signing In...
            `;
		} else {
			button.disabled = false;
			button.innerHTML = `
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                    <i class="fa-solid fa-arrow-right-to-bracket text-purple-300 group-hover:text-purple-200"></i>
                </span>
                Sign In
            `;
		}
	}

	showError(errorDiv, message) {
		if (errorDiv) {
			const errorMessage = errorDiv.querySelector("#error-message");
			if (errorMessage) {
				errorMessage.textContent = message;
			}
			errorDiv.classList.remove("hidden");
		}
	}

	hideError(errorDiv) {
		if (errorDiv) {
			errorDiv.classList.add("hidden");
		}
	}

	showSuccessMessage() {
		const messageDiv = document.createElement("div");
		messageDiv.className =
			"fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full bg-green-500 text-white";
		messageDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fa-solid fa-check-circle"></i>
                <span>Login successful! Redirecting...</span>
            </div>
        `;

		document.body.appendChild(messageDiv);

		// Animate in
		setTimeout(() => {
			messageDiv.classList.remove("translate-x-full");
		}, 100);

		// Remove after redirect
		setTimeout(() => {
			document.body.removeChild(messageDiv);
		}, 2000);
	}

	showLogoutMessage() {
		const messageDiv = document.createElement("div");
		messageDiv.className =
			"fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full bg-blue-500 text-white";
		messageDiv.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fa-solid fa-sign-out-alt"></i>
                <span>Logged out successfully!</span>
            </div>
        `;

		document.body.appendChild(messageDiv);

		// Animate in
		setTimeout(() => {
			messageDiv.classList.remove("translate-x-full");
		}, 100);

		// Remove after redirect
		setTimeout(() => {
			document.body.removeChild(messageDiv);
		}, 2000);
	}

	getUserEmail() {
		const sessionData = this.getSessionData();
		return sessionData ? sessionData.email : null;
	}

	getLoginTime() {
		const sessionData = this.getSessionData();
		return sessionData ? new Date(sessionData.loginTime) : null;
	}
}
