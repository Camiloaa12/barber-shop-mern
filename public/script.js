// ===============================
// 🔥 CONFIGURACIÓN API FINAL
// ===============================
const API_BASE = location.hostname.includes("onrender.com")
  ? "https://softbarber-backend.onrender.com/api"
  : "http://localhost:4000/api";

// ===============================
// 🔐 ESTADO GLOBAL
// ===============================
const state = {
  token: localStorage.getItem("token"),
  user: JSON.parse(localStorage.getItem("user") || "null")
};

// ===============================
// 🛠️ UTILIDADES
// ===============================
function setStatus(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "#fca5a5" : "#94a3b8";
}

async function apiFetch(path, options = {}) {
  const finalOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  };

  if (state.token && options.skipAuth !== true) {
    finalOptions.headers.Authorization = `Bearer ${state.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, finalOptions);
  const text = await res.text();

  let data;
  try { data = JSON.parse(text); } catch { data = { msg: text }; }

  if (!res.ok) throw data;
  return data;
}

// ===============================
// 🧭 VISTAS
// ===============================
const views = {
  login: document.getElementById("login-view"),
  reservas: document.getElementById("reservas-view"),
  cortes: document.getElementById("cortes-view"),
  admin: document.getElementById("admin-view"),
};

function show(view) {
  Object.values(views).forEach(v => v.classList.add("hidden"));

  if (view === "admin" && state.user?.role !== "admin") {
    alert("Acceso solo para administrador");
    return show("reservas");
  }

  views[view]?.classList.remove("hidden");
}

// ===============================
// 🔑 LOGIN
// ===============================
const btnLogin = document.getElementById("btn-login");
const loginStatus = document.getElementById("login-status");

btnLogin.onclick = async () => {
  setStatus(loginStatus, "Ingresando...");
  try {
    const payload = {
      email: document.getElementById("login-email").value.trim(),
      password: document.getElementById("login-password").value.trim()
    };

    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true
    });

    state.token = data.token;
    state.user = { role: data.role };

    localStorage.setItem("token", state.token);
    localStorage.setItem("user", JSON.stringify(state.user));

    if (state.user.role === "admin") show("admin");
    else {
      show("reservas");
      cargarReservas();
    }

    setStatus(loginStatus, "Ingreso correcto ✅");
  } catch (err) {
    setStatus(loginStatus, err.msg || "Error de login", true);
  }
};

// ===============================
// 📅 RESERVAS
// ===============================
const reservasTableBody = document.querySelector("#reservas-table tbody");
const resStatus = document.getElementById("res-status");

async function cargarReservas() {
  setStatus(resStatus, "Cargando...");
  try {
    const list = await apiFetch("/appointments");
    reservasTableBody.innerHTML = list.map(r => `
      <tr>
        <td>${r.client}</td>
        <td>${r.date}</td>
        <td>${r.time}</td>
        <td>${r.barber}</td>
      </tr>`).join("");
    setStatus(resStatus, "Reservas cargadas ✅");
  } catch {
    setStatus(resStatus, "Error al cargar reservas", true);
  }
}

// ===============================
// ✂️ CORTES
// ===============================
document.getElementById("btn-registrar-cut").onclick = async () => {
  try {
    const payload = {
      client: document.getElementById("cut-cliente").value,
      barber: document.getElementById("cut-barbero").value,
      price: Number(document.getElementById("cut-precio").value),
      payment: document.getElementById("cut-pago").value,
      description: document.getElementById("cut-desc").value,
    };

    await apiFetch("/cuts", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    alert("✅ Corte registrado");
  } catch {
    alert("❌ Error al registrar corte");
  }
};

// ===============================
// 👑 ADMIN
// ===============================
document.getElementById("btn-load-stats").onclick = async () => {
  try {
    const daily = await apiFetch("/stats/daily");
    const monthly = await apiFetch("/stats/monthly");

    document.getElementById("stat-hoy").textContent = daily.total || 0;
    document.getElementById("stat-mes").textContent = monthly.total || 0;

    const users = await apiFetch("/admin/barberos");
    document.querySelector("#usuarios-table tbody").innerHTML =
      users.map(u => `<tr><td>${u.username}</td><td>${u.role}</td></tr>`).join("");

  } catch {
    alert("Error cargando estadísticas");
  }
};

// ===============================
// 🚀 AUTO-LOGIN
// ===============================
if (state.token && state.user) {
  state.user.role === "admin" ? show("admin") : show("reservas");
  if (state.user.role !== "admin") cargarReservas();
} else {
  show("login");
}
