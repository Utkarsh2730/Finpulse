const registerForm = document.getElementById('register');
const errorBox = document.getElementById('error');
const preview = document.getElementById('preview');
const previewPicture = document.querySelector('#preview img');

async function registerCompany(event) {
  event.preventDefault();
  errorBox.textContent = '';

  const details = {
    companyName: document.getElementById('companyName').value,
    name: document.getElementById('name').value,
    teamSize: document.getElementById('teamSize').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  const response = await fetch('/api/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details)
  });
  const data = await response.json();

  if (!response.ok) {
    errorBox.textContent = data.error;
    return;
  }

  localStorage.setItem('finpulse.profile', JSON.stringify(data));
  window.location.href = 'manager.html?new=1';
}

function showPreview() {
  preview.hidden = false;
}

registerForm.addEventListener('submit', registerCompany);
previewPicture.addEventListener('load', showPreview);

if (previewPicture.complete && previewPicture.naturalWidth > 0) {
  showPreview();
}
