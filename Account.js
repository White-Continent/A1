/* =========================================================
   NORTHGATE — AUTHENTICATION PAGE SCRIPT
   Vanilla JavaScript — no dependencies
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------------
     1. NAVBAR — mobile toggle
  --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu when a link is clicked
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ---------------------------------------------------------
     2. AUTH CARD — panel + tab navigation
  --------------------------------------------------------- */
  const authTabs = document.getElementById('authTabs');
  const tabs = document.querySelectorAll('.auth-tab');
  const panels = document.querySelectorAll('.auth-panel');

  function showPanel(target) {
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.panel === target);
    });

    // Reset registration step to email whenever user switches back to register tab
    if (target === 'register') {
      showRegisterStep('email');
    }

    const hasTab = target === 'login' || target === 'register';
    tabs.forEach((tab) => {
      const isMatch = tab.dataset.target === target;
      tab.classList.toggle('is-active', isMatch);
      tab.setAttribute('aria-selected', String(isMatch));
    });

    if (authTabs) {
      authTabs.style.display = hasTab ? 'flex' : 'none';
    }

    const heading = document.querySelector(`#panel-${target} .auth-panel__header h2`);
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }

  // Switch between register sub-steps (email -> otp -> details)
  function showRegisterStep(stepName) {
    const steps = document.querySelectorAll('.register-step');
    steps.forEach((step) => {
      step.classList.toggle('is-active', step.id === `register-step-${stepName}`);
    });
  }

  // Tab click handlers
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => showPanel(tab.dataset.target));
  });

  document.querySelectorAll('.auth-card [data-target]').forEach((el) => {
    if (el.classList.contains('auth-tab')) return;
    el.addEventListener('click', () => showPanel(el.dataset.target));
  });


  /* ---------------------------------------------------------
     3. PASSWORD SHOW / HIDE TOGGLE
  --------------------------------------------------------- */
  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      btn.classList.toggle('is-visible', isHidden);
    });
  });


  /* ---------------------------------------------------------
     4. OTP INPUTS — Auto-focus & Navigation
  --------------------------------------------------------- */
  function setupOtpNavigation(groupElement) {
    if (!groupElement) return;
    const inputs = Array.from(groupElement.querySelectorAll('.otp-input'));

    inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = value.slice(-1);

        clearFieldError(groupElement, groupElement.id);

        if (value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
          inputs[index - 1].focus();
        }
        if (e.key === 'ArrowRight' && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData)
          .getData('text')
          .replace(/[^0-9]/g, '')
          .slice(0, inputs.length);

        pasted.split('').forEach((char, i) => {
          if (inputs[i]) inputs[i].value = char;
        });

        const nextIndex = Math.min(pasted.length, inputs.length - 1);
        inputs[nextIndex].focus();
      });
    });
  }

  // Setup both general and register OTP fields
  setupOtpNavigation(document.getElementById('otpGroup'));
  setupOtpNavigation(document.getElementById('regOtpGroup'));


  /* ---------------------------------------------------------
     5. VALIDATION HELPERS
  --------------------------------------------------------- */
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^[\d\s\-().+]{7,15}$/;

  function setFieldError(input, key, message) {
    input.classList.add('is-invalid');
    const errorEl = document.querySelector(`[data-error-for="${key}"]`);
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(input, key) {
    input.classList.remove('is-invalid');
    const errorEl = document.querySelector(`[data-error-for="${key}"]`);
    if (errorEl) errorEl.textContent = '';
  }

  document.querySelectorAll('.auth-form input, .auth-form select').forEach((field) => {
    const key = field.id;
    if (!key) return;
    field.addEventListener('input', () => clearFieldError(field, key));
    field.addEventListener('change', () => clearFieldError(field, key));
  });


  /* ---------------------------------------------------------
     6. TOAST NOTIFICATIONS
  --------------------------------------------------------- */
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message, type = 'success') {
    if (!toast) return;
    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.classList.remove('is-success', 'is-error');
    toast.classList.add(type === 'error' ? 'is-error' : 'is-success', 'is-visible');

    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3200);
  }


  /* ---------------------------------------------------------
     7. LOGIN FORM
  --------------------------------------------------------- */
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const email = document.getElementById('loginEmail');
      const password = document.getElementById('loginPassword');

      if (!EMAIL_REGEX.test(email.value.trim())) {
        setFieldError(email, 'loginEmail', 'Please enter a valid email address.');
        isValid = false;
      }

      if (password.value.length < 6) {
        setFieldError(password, 'loginPassword', 'Password must be at least 6 characters.');
        isValid = false;
      }

      if (!isValid) return;

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      setTimeout(() => {
        setLoading(submitBtn, false);
        showToast('Login successful! Redirecting to your dashboard…', 'success');
        loginForm.reset();
      }, 1200);
    });
  }


  /* ---------------------------------------------------------
     8. REGISTER FLOWS (Correct Step Sequence)
  --------------------------------------------------------- */
  let userRegisterEmail = "";

  // -- Step 1: Email Input Form --
  const registerEmailForm = document.getElementById('registerEmailForm');
  if (registerEmailForm) {
    registerEmailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('registerEmail');

      if (!EMAIL_REGEX.test(emailInput.value.trim())) {
        setFieldError(emailInput, 'registerEmail', 'Please enter a valid email address.');
        return;
      }

      userRegisterEmail = emailInput.value.trim();
      const submitBtn = registerEmailForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      // Simulate sending OTP code
      setTimeout(() => {
        setLoading(submitBtn, false);
        showToast(`Verification code sent to ${userRegisterEmail}`, 'success');
        showRegisterStep('otp'); // Go to Step 2
      }, 1200);
    });
  }

  // -- Step 2: Register OTP Verification --
  const registerOtpForm = document.getElementById('registerOtpForm');
  const regOtpGroup = document.getElementById('regOtpGroup');
  if (registerOtpForm && regOtpGroup) {
    registerOtpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const otpInputs = Array.from(regOtpGroup.querySelectorAll('.otp-input'));
      const code = otpInputs.map((input) => input.value).join('');

      if (code.length < 6) {
        otpInputs.forEach((input) => input.classList.add('is-invalid'));
        const errorEl = document.querySelector('[data-error-for="regOtpGroup"]');
        if (errorEl) errorEl.textContent = 'Please enter the complete 6-digit code.';
        return;
      }

      const submitBtn = registerOtpForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      // Simulate OTP Verification Success
      setTimeout(() => {
        setLoading(submitBtn, false);
        showToast('Email verified successfully!', 'success');

        // Autofill verified email in Step 3 display
        const verifiedEmailDisplay = document.getElementById('verifiedEmailDisplay');
        if (verifiedEmailDisplay) verifiedEmailDisplay.value = userRegisterEmail;

        showRegisterStep('details'); // Go to Step 3
      }, 1200);
    });
  }

  // OTP Resend Logic
  const regResendOtp = document.getElementById('regResendOtp');
  if (regResendOtp) {
    regResendOtp.addEventListener('click', () => {
      regResendOtp.disabled = true;
      let seconds = 30;
      const originalText = regResendOtp.textContent;
      regResendOtp.textContent = `Resend in ${seconds}s`;

      const countdown = setInterval(() => {
        seconds -= 1;
        regResendOtp.textContent = `Resend in ${seconds}s`;

        if (seconds <= 0) {
          clearInterval(countdown);
          regResendOtp.disabled = false;
          regResendOtp.textContent = originalText;
        }
      }, 1000);

      showToast(`A new verification code has been sent to ${userRegisterEmail}`, 'success');
    });
  }

  // -- Step 3: Complete Personal Details --
  const registerDetailsForm = document.getElementById('registerDetailsForm');
  if (registerDetailsForm) {
    registerDetailsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const firstName = document.getElementById('firstName');
      const lastName = document.getElementById('lastName');
      const phone = document.getElementById('phone');
      const province = document.getElementById('province');
      const password = document.getElementById('registerPassword');
      const confirmPassword = document.getElementById('confirmPassword');
      const acceptTerms = document.getElementById('acceptTerms');

      if (!firstName.value.trim()) {
        setFieldError(firstName, 'firstName', 'First name is required.');
        isValid = false;
      }

      if (!lastName.value.trim()) {
        setFieldError(lastName, 'lastName', 'Last name is required.');
        isValid = false;
      }

      if (!PHONE_REGEX.test(phone.value.trim())) {
        setFieldError(phone, 'phone', 'Please enter a valid phone number.');
        isValid = false;
      }

      if (!province.value) {
        setFieldError(province, 'province', 'Please select your province.');
        isValid = false;
      }

      if (password.value.length < 8) {
        setFieldError(password, 'registerPassword', 'Password must be at least 8 characters.');
        isValid = false;
      }

      if (confirmPassword.value !== password.value || !confirmPassword.value) {
        setFieldError(confirmPassword, 'confirmPassword', 'Passwords do not match.');
        isValid = false;
      }

      if (!acceptTerms.checked) {
        const errorEl = document.querySelector('[data-error-for="acceptTerms"]');
        if (errorEl) errorEl.textContent = 'You must accept the Terms & Conditions to continue.';
        isValid = false;
      } else {
        const errorEl = document.querySelector('[data-error-for="acceptTerms"]');
        if (errorEl) errorEl.textContent = '';
      }

      if (!isValid) return;

      const submitBtn = registerDetailsForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      // Simulate profile creation complete and redirecting to login page
      setTimeout(() => {
        setLoading(submitBtn, false);
        showToast('Registration complete! Please login with your new credentials.', 'success');
        
        // Reset forms
        registerEmailForm.reset();
        registerOtpForm.reset();
        registerDetailsForm.reset();

        showPanel('login');
      }, 1200);
    });
  }


  /* ---------------------------------------------------------
     9. FORGOT PASSWORD FORM
  --------------------------------------------------------- */
  const forgotForm = document.getElementById('forgotForm');

  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail');

      if (!EMAIL_REGEX.test(email.value.trim())) {
        setFieldError(email, 'forgotEmail', 'Please enter a valid email address.');
        return;
      }

      const submitBtn = forgotForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      setTimeout(() => {
        setLoading(submitBtn, false);
        showToast(`A 6-digit code was sent to ${email.value.trim()}`, 'success');
        forgotForm.reset();
        showPanel('otp');
      }, 1200);
    });
  }


  /* ---------------------------------------------------------
     10. OTP VERIFICATION FORM (General Forgot Password Panel)
  --------------------------------------------------------- */
  const otpForm = document.getElementById('otpForm');
  const resendOtpBtn = document.getElementById('resendOtp');

  if (otpForm) {
    otpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const otpInputs = Array.from(document.getElementById('otpGroup').querySelectorAll('.otp-input'));
      const code = otpInputs.map((input) => input.value).join('');

      if (code.length < 6) {
        otpInputs.forEach((input) => input.classList.add('is-invalid'));
        const errorEl = document.querySelector('[data-error-for="otpGroup"]');
        if (errorEl) errorEl.textContent = 'Please enter the complete 6-digit code.';
        return;
      }

      const submitBtn = otpForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      setTimeout(() => {
        setLoading(submitBtn, false);
        showToast('Code verified successfully!', 'success');
        otpInputs.forEach((input) => (input.value = ''));
        showPanel('reset');
      }, 1200);
    });
  }

  if (resendOtpBtn) {
    resendOtpBtn.addEventListener('click', () => {
      resendOtpBtn.disabled = true;
      let seconds = 30;
      const originalText = resendOtpBtn.textContent;
      resendOtpBtn.textContent = `Resend in ${seconds}s`;

      const countdown = setInterval(() => {
        seconds -= 1;
        resendOtpBtn.textContent = `Resend in ${seconds}s`;

        if (seconds <= 0) {
          clearInterval(countdown);
          resendOtpBtn.disabled = false;
          resendOtpBtn.textContent = originalText;
        }
      }, 1000);

      showToast('A new verification code has been sent.', 'success');
    });
  }


  /* ---------------------------------------------------------
     11. RESET PASSWORD FORM
  --------------------------------------------------------- */
  const resetForm = document.getElementById('resetForm');

  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const newPassword = document.getElementById('newPassword');
      const confirmNewPassword = document.getElementById('confirmNewPassword');

      if (newPassword.value.length < 8) {
        setFieldError(newPassword, 'newPassword', 'Password must be at least 8 characters.');
        isValid = false;
      }

      if (confirmNewPassword.value !== newPassword.value || !confirmNewPassword.value) {
        setFieldError(confirmNewPassword, 'confirmNewPassword', 'Passwords do not match.');
        isValid = false;
      }

      if (!isValid) return;

      const submitBtn = resetForm.querySelector('button[type="submit"]');
      setLoading(submitBtn, true);

      setTimeout(() => {
        setLoading(submitBtn, false);
        showToast('Password updated successfully! Please log in.', 'success');
        resetForm.reset();
        showPanel('login');
      }, 1200);
    });
  }


  /* ---------------------------------------------------------
     12. BUTTON LOADING STATE
  --------------------------------------------------------- */
  function setLoading(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.textContent = 'Please wait…';
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
    }
  }


  /* ---------------------------------------------------------
     13. INITIAL STATE
  --------------------------------------------------------- */
  showPanel('login');

});
