/**
 * Developer Hub Authentication Logic
 * Smooth transitions, interactive elements & form validation
 */

// Switch to Register Form
function switchToRegister(e) {
  if (e) e.preventDefault();
  const loginCard = document.getElementById('login-card');
  const registerCard = document.getElementById('register-card');

  loginCard.classList.add('fade-out');

  setTimeout(() => {
    loginCard.classList.add('hidden');
    loginCard.classList.remove('fade-out');

    registerCard.classList.remove('hidden');
    registerCard.classList.add('fade-in');

    setTimeout(() => {
      registerCard.classList.remove('fade-in');
    }, 350);
  }, 250);
}

// Switch to Login Form
function switchToLogin(e) {
  if (e) e.preventDefault();
  const loginCard = document.getElementById('login-card');
  const registerCard = document.getElementById('register-card');

  registerCard.classList.add('fade-out');

  setTimeout(() => {
    registerCard.classList.add('hidden');
    registerCard.classList.remove('fade-out');

    loginCard.classList.remove('hidden');
    loginCard.classList.add('fade-in');

    setTimeout(() => {
      loginCard.classList.remove('fade-in');
    }, 350);
  }, 250);
}

// Role Selector in Register Form
function selectRole(button) {
  const buttons = document.querySelectorAll('.segmented-control .segment-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  button.classList.add('active');
  const role = button.getAttribute('data-role');
  document.getElementById('selected-role').value = role;
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === 'password';

  input.type = isPassword ? 'text' : 'password';

  if (isPassword) {
    btn.innerHTML = `
      <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
  } else {
    btn.innerHTML = `
      <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
  }
}

// Login Handler
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;

  showToast(`Welcome back! Logging in as ${email}...`, 'success');
}

// Registration Handler
function handleRegister(e) {
  e.preventDefault();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const role = document.getElementById('selected-role').value;
  const name = document.getElementById('reg-name').value;

  if (password !== confirmPassword) {
    showToast('Passwords do not match. Please check again.', 'error');
    return;
  }

  showToast(`Account created successfully for ${name} (${role})! Redirecting...`, 'success');

  setTimeout(() => {
    switchToLogin();
  }, 2000);
}

// Forgot Password Handler
function handleForgotPassword(e) {
  e.preventDefault();
  showToast('Password reset link sent to your email!', 'success');
}

// Toast Notification Helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success'
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
