// script.js

let user = JSON.parse(localStorage.getItem("user"));

// --- LOGIN FUNCTION ---
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("https://your-render-backend-url.onrender.com/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.user.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } else {
    alert("Login gagal: " + data.message);
  }
}

// --- SUBMIT CHECKLIST ---
async function submitChecklist() {
  const minggu = document.getElementById("minggu").value;
  const isian = document.getElementById("isian").value;

  const res = await fetch("https://your-render-backend-url.onrender.com/api/checklist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: user.id, minggu, isian }),
  });

  const data = await res.json();
  alert(data.message);
}

// --- UPLOAD FOTO PROFIL ---
async function uploadFoto() {
  const fileInput = document.getElementById("foto");
  const formData = new FormData();
  formData.append("foto", fileInput.files[0]);
  formData.append("user_id", user.id);

  const res = await fetch("https://your-render-backend-url.onrender.com/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  alert(data.message);
}

// --- FETCH REKAP UNTUK ADMIN ---
async function fetchRekap() {
  const res = await fetch("https://your-render-backend-url.onrender.com/api/rekap?admin_id=" + user.id);
  const data = await res.json();
  const table = document.getElementById("rekap-tbody");
  table.innerHTML = "";

  data.rekap.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${row.name}</td>
      <td>${row.minggu}</td>
      <td>${row.isian}</td>
    `;
    table.appendChild(tr);
  });
}

// --- LOGOUT ---
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// --- LOAD NAMA USER KE DASHBOARD ---
function loadUserName() {
  if (!user) {
    window.location.href = "index.html";
  } else {
    document.getElementById("user-name").textContent = user.name;
  }
}
