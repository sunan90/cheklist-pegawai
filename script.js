// script.js

// Cek jika di dashboard, jalankan ini
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  if (path.includes("dashboard.html")) {
    loadUserInfo();
    setupChecklistForm();
  } else if (path.includes("admin.html")) {
    // akan kita lanjutkan nanti untuk admin
  }
});

function loadUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    alert("Silakan login dulu.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("username").textContent = user.name;
  document.getElementById("profilePic").src = user.photo
    ? `/uploads/${user.photo}`
    : "default.png";

  checkThisWeekStatus(user.id);
}

function setupChecklistForm() {
  const form = document.getElementById("checklistForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    const checklist = {
      userId: user.id,
      minggu: getCurrentWeek(),
      checklist: {
        task1: form.task1.checked,
        task2: form.task2.checked,
        task3: form.task3.checked
      }
    };

    const res = await fetch("http://localhost:3000/api/checklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checklist)
    });

    const data = await res.json();
    document.getElementById("statusMsg").textContent = data.message;
  });
}

function getCurrentWeek() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

async function checkThisWeekStatus(userId) {
  const minggu = getCurrentWeek();
  const res = await fetch(`http://localhost:3000/api/checklist/status?userId=${userId}&minggu=${minggu}`);
  const data = await res.json();

  if (data.exists) {
    document.getElementById("statusMsg").textContent = "✔️ Checklist minggu ini sudah dikirim.";
    document.getElementById("checklistForm").style.display = "none";
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
