// script.js

const API_BASE = 'https://your-backend-url.onrender.com'; // Ganti dengan URL backend kamu

const user = JSON.parse(localStorage.getItem('user'));
if (!user) window.location.href = 'index.html';

// Tampilkan nama user
const userNameEl = document.getElementById('userName');
if (userNameEl) userNameEl.innerText = user.name;

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Submit checklist
const checklistForm = document.getElementById('checklistForm');
if (checklistForm) {
  checklistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const checklist = document.getElementById('checklist').value;
    const response = await fetch(`${API_BASE}/api/submit-checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, checklist })
    });
    const data = await response.json();
    alert(data.message);
  });
}

// Upload foto profil
const fotoForm = document.getElementById('fotoForm');
if (fotoForm) {
  fotoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('foto').files[0];
    const formData = new FormData();
    formData.append('foto', file);
    formData.append('userId', user.id);

    const response = await fetch(`${API_BASE}/api/upload-foto`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    alert(data.message);
  });
}
