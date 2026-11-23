const signInForm = document.getElementById('signInForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const rememberBox = document.getElementById('remember');
const showButton = document.getElementById('showPassword');
const message = document.getElementById('message');
const signInButton = document.querySelector('.submit');

function showError(text) {
  message.textContent = text;
  message.className = 'message';
}

function showInfo(text) {
  message.textContent = text;
  message.className = 'message info';
}

function togglePassword() {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    showButton.textContent = 'Hide';
  } else {
    passwordInput.type = 'password';
    showButton.textContent = 'Show';
  }
}

function forgotPassword(event) {
  event.preventDefault();
  showInfo("Ask your company's Finpulse admin to set a new password for you.");
}

function contactSupport(event) {
  event.preventDefault();
  showInfo("Your company's Finpulse admin can check your account and reset your password.");
}

async function signIn(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (email === '' || password === '') {
    showError('Enter your work email and password.');
    return;
  }

  showError('');
  signInButton.disabled = true;

  try {
    const response = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password,
        remember: rememberBox.checked
      })
    });
    const data = await response.json();

    if (!response.ok) {
      showError(data.error);
      signInButton.disabled = false;
      return;
    }

    localStorage.setItem('finpulse.profile', JSON.stringify(data));
    if (data.role === 'manager') {
      window.location.href = 'manager.html';
    } else {
      window.location.href = 'employee.html';
    }
  } catch (error) {
    showError('Could not reach Finpulse. Check your connection and try again.');
    signInButton.disabled = false;
  }
}

showButton.addEventListener('click', togglePassword);
document.getElementById('forgot').addEventListener('click', forgotPassword);
document.getElementById('support').addEventListener('click', contactSupport);
signInForm.addEventListener('submit', signIn);
