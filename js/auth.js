document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements and State ---
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotPanel = document.getElementById('forgot-password-panel');
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const loginSubmitBtn = document.getElementById('login-submit');
    const signupSubmitBtn = document.getElementById('signup-submit');
    // --- Utility Functions ---

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    re
    const toggleLoading = (button, isLoading) => {
        const spinner = button.querySelector('.spinner-border');
        if (isLoading) {
            button.setAttribute('disabled', 'true');
            spinner.style.display = 'inline-block';
            button.innerHTML = button.innerHTML.replace('Log In', 'Please wait...');
            button.innerHTML = button.innerHTML.replace('Create Account', 'Please wait...');
        } else {
            button.removeAttribute('disabled');
            spinner.style.display = 'none';
            // Restore original button text (simple fix for demo)
            if (button.id === 'login-submit') {
                button.innerHTML = `Log In <span class="spinner-border" style="display: none;"></span>`;
            } else if (button.id === 'signup-submit') {
                button.innerHTML = `Create Account <span class="spinner-border" style="display: none;"></span>`;
            } else if (button.id === 'forgot-submit') {
                button.innerHTML = `Send reset link <span class="spinner-border" style="display: none;"></span>`;
            }
        }
    };

    const showMessage = (element, message, isSuccess = false) => {
        if (!element) return;

        element.textContent = message;
        element.className = `form-message ${isSuccess ? 'form-success' : 'form-error'}`;
        element.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    };

    const setFieldValidation = (input, isValid, errorMessageId, errorMessageText) => {
        const errorElement = document.getElementById(errorMessageId);
        
        if (isValid) {
            input.classList.remove('invalid');
            input.classList.add('valid');
            errorElement.style.display = 'none';
            errorElement.textContent = '';
            input.removeAttribute('aria-invalid');
        } else {
            input.classList.remove('valid');
            input.classList.add('invalid');
            errorElement.textContent = errorMessageText;
            errorElement.style.display = 'block';
            input.setAttribute('aria-invalid', 'true');
        }
        return isValid;
    };

    // --- View Switching Logic ---
    const switchToView = (viewName) => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        forgotPanel.style.display = 'none';
        tabLogin.classList.remove('active');
        tabSignup.classList.remove('active');

        if (viewName === 'login') {
            loginForm.style.display = 'block';
            tabLogin.classList.add('active');
        } else if (viewName === 'signup') {
            signupForm.style.display = 'block';
            tabSignup.classList.add('active');
        } else if (viewName === 'forgot') {
            forgotPanel.style.display = 'block';
            tabLogin.classList.add('active'); // Keep Login tab active when in overlay
        }
    };

    // Attach listeners for tab/link switching
    tabLogin.addEventListener('click', () => switchToView('login'));
    tabSignup.addEventListener('click', () => switchToView('signup'));
    document.getElementById('switch-to-signup').addEventListener('click', (e) => { e.preventDefault(); switchToView('signup'); });
    document.getElementById('switch-to-login').addEventListener('click', (e) => { e.preventDefault(); switchToView('login'); });
    
    document.getElementById('forgot-password-link').addEventListener('click', (e) => { e.preventDefault(); switchToView('forgot'); });
    document.getElementById('back-to-login').addEventListener('click', (e) => { e.preventDefault(); switchToView('login'); });


    // --- Password Show/Hide Toggle ---
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const passwordInput = document.getElementById(targetId);
            const icon = toggle.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                toggle.setAttribute('aria-label', 'Hide password');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                toggle.setAttribute('aria-label', 'Show password');
            }
        });
    });


    // =======================================================
    // --- 1. LOGIN FORM VALIDATION & SUBMISSION ---
    // =======================================================
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');

    const validateLoginForm = () => {
        const emailValid = isValidEmail(loginEmailInput.value);
        const passwordValid = loginPasswordInput.value.trim().length > 0;
        
        // Inline validation on blur for UX
        if (loginEmailInput.value.length > 0) {
            setFieldValidation(loginEmailInput, emailValid, 'login-email-error', 'Please enter a valid email or non-empty username.');
        } else if (loginEmailInput.classList.contains('invalid')) {
             setFieldValidation(loginEmailInput, false, 'login-email-error', 'Email/Username is required.');
        }

        if (loginPasswordInput.value.length > 0) {
             setFieldValidation(loginPasswordInput, passwordValid, 'login-password-error', '');
        } else if (loginPasswordInput.classList.contains('invalid')) {
            setFieldValidation(loginPasswordInput, false, 'login-password-error', 'Password is required.');
        }


        // Global button state
        loginSubmitBtn.disabled = !(emailValid && passwordValid);
    };

    loginEmailInput.addEventListener('input', validateLoginForm);
    loginPasswordInput.addEventListener('input', validateLoginForm);

    // Initial validation check on load
    validateLoginForm();

    // Submission handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Final re-validation before submission
        const emailValid = setFieldValidation(loginEmailInput, isValidEmail(loginEmailInput.value), 'login-email-error', 'Please enter a valid email.');
        const passwordValid = setFieldValidation(loginPasswordInput, loginPasswordInput.value.length > 0, 'login-password-error', 'Password is required.');

        if (!emailValid || !passwordValid) {
            return;
        }

        toggleLoading(loginSubmitBtn, true);

        try {
            const body = new URLSearchParams();
            body.append('email', loginEmailInput.value.trim());
            body.append('password', loginPasswordInput.value);

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body
            });

            const data = await response.json();
            toggleLoading(loginSubmitBtn, false);

            if (!response.ok || !data.ok) {
                const errorText = data && data.error ? data.error : 'Login failed. Please try again.';
                setFieldValidation(loginPasswordInput, false, 'login-password-error', errorText);
                return;
            }

            showMessage(
                loginForm.querySelector('.auth-switch'), 
                'Login successful! Redirecting to dashboard...', 
                true
            );

            if (data.redirect) {
                window.location.href = data.redirect;
            }
        } catch (err) {
            toggleLoading(loginSubmitBtn, false);
            setFieldValidation(loginPasswordInput, false, 'login-password-error', 'Network error. Please try again.');
        }
    });


    // =======================================================
    // --- 2. SIGNUP FORM VALIDATION & SUBMISSION ---
    // =======================================================
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupConfirmInput = document.getElementById('signup-confirm-password');
    const termsCheckbox = document.getElementById('terms-agree');
    const passwordStrengthMeter = document.getElementById('password-strength-meter').querySelector('.strength-bar');

    const rules = {
        length: { check: (p) => p.length >= 8, id: 'rule-length' },
        uppercase: { check: (p) => /[A-Z]/.test(p), id: 'rule-uppercase' },
        number: { check: (p) => /[0-9]/.test(p), id: 'rule-number' }
    };

    const checkPasswordStrength = () => {
        const password = signupPasswordInput.value;
        let satisfiedRules = 0;

        Object.keys(rules).forEach(key => {
            const rule = rules[key];
            const isValid = rule.check(password);
            const ruleElement = document.getElementById(rule.id);
            
            ruleElement.setAttribute('data-valid', isValid);
            if (isValid) {
                satisfiedRules++;
            }
        });

        // Set strength meter
        passwordStrengthMeter.setAttribute('data-strength', satisfiedRules);

        // Update email validation on input
        if (signupEmailInput.value.length > 0) {
            setFieldValidation(signupEmailInput, isValidEmail(signupEmailInput.value), 'signup-email-error', 'Please enter a valid email address.');
        }

        // Return true if all rules are satisfied (strength >= 3)
        return satisfiedRules === Object.keys(rules).length;
    };

    const validateSignupForm = () => {
        const emailValid = isValidEmail(signupEmailInput.value);
        const passwordMeetsRules = checkPasswordStrength();
        const passwordsMatch = signupPasswordInput.value === signupConfirmInput.value && signupConfirmInput.value.length > 0;
        const termsAgreed = termsCheckbox.checked;

        // Confirm Password validation
        if (signupConfirmInput.value.length > 0 || signupConfirmInput.classList.contains('invalid')) {
            setFieldValidation(signupConfirmInput, passwordsMatch, 'signup-confirm-error', 'Passwords do not match.');
        }

        // Email validation
        if (signupEmailInput.value.length > 0 || signupEmailInput.classList.contains('invalid')) {
            setFieldValidation(signupEmailInput, emailValid, 'signup-email-error', 'Please enter a valid email address.');
        }
        
        // Password validation (only show specific error if rules failed)
        if (signupPasswordInput.value.length > 0) {
             setFieldValidation(signupPasswordInput, passwordMeetsRules, 'signup-password-error', passwordMeetsRules ? '' : 'Password does not meet all complexity requirements.');
        }


        // Global button state
        signupSubmitBtn.disabled = !(emailValid && passwordMeetsRules && passwordsMatch && termsAgreed);
    };
    
    signupEmailInput.addEventListener('input', validateSignupForm);
    signupPasswordInput.addEventListener('input', validateSignupForm);
    signupConfirmInput.addEventListener('input', validateSignupForm);
    termsCheckbox.addEventListener('change', validateSignupForm);

    // Initial validation check on load
    validateSignupForm();


    // Submission handler
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Final re-validation before submission
        validateSignupForm();

        if (signupSubmitBtn.disabled) {
            return;
        }
        
        toggleLoading(signupSubmitBtn, true);

        try {
            const fullNameInput = document.getElementById('signup-name');
            const roleSelect = document.getElementById('signup-role');

            const body = new URLSearchParams();
            if (fullNameInput && fullNameInput.value.trim()) {
                body.append('fullname', fullNameInput.value.trim());
            }
            body.append('email', signupEmailInput.value.trim());
            body.append('password', signupPasswordInput.value);
            if (roleSelect && roleSelect.value) {
                body.append('role', roleSelect.value);
            }

            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body
            });

            const data = await response.json();
            toggleLoading(signupSubmitBtn, false);

            if (!response.ok || !data.ok) {
                const errorText = data && data.error ? data.error : 'Signup failed. Please try again.';
                setFieldValidation(signupEmailInput, false, 'signup-email-error', errorText);
                return;
            }

            showMessage(
                signupForm.querySelector('.auth-switch'), 
                'Account created successfully! Redirecting to your dashboard...', 
                true
            );

            if (data.redirect) {
                window.location.href = data.redirect;
            }
        } catch (err) {
            toggleLoading(signupSubmitBtn, false);
            setFieldValidation(signupEmailInput, false, 'signup-email-error', 'Network error. Please try again.');
        }
    });

    // =======================================================
    // --- 3. FORGOT PASSWORD LOGIC ---
    // =======================================================
    const forgotForm = document.getElementById('forgot-form');
    const forgotEmailInput = document.getElementById('forgot-email');
    const forgotSubmitBtn = document.getElementById('forgot-submit');
    const forgotMessage = document.getElementById('forgot-message');

    const validateForgotForm = () => {
        const emailValid = isValidEmail(forgotEmailInput.value);
        
        if (forgotEmailInput.value.length > 0) {
            setFieldValidation(forgotEmailInput, emailValid, 'forgot-email-error', 'Please enter a valid email address.');
        }

        forgotSubmitBtn.disabled = !emailValid;
    };
    
    forgotEmailInput.addEventListener('input', validateForgotForm);

    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Final validation
        validateForgotForm();
        if (forgotSubmitBtn.disabled) return;

        toggleLoading(forgotSubmitBtn, true);

        // --- Simulated API Call ---
        setTimeout(() => {
            toggleLoading(forgotSubmitBtn, false);
            showMessage(
                forgotMessage, 
                'If an account associated with that email exists, a password reset link has been sent.', 
                true
            );
            forgotForm.reset();
            // Optional: after success, switch back to login
            // setTimeout(() => { switchToView('login'); }, 3000);
        }, 2000);
    });
});