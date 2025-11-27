
// Config de API: funciona en Vercel (usa /api con rewrites) y en Render (usa dominio backend)
const API_BASE = (() => {
  const host = location.hostname;
  if (host.endsWith("vercel.app")) return "/api"; // proxy via vercel.json
  if (host.endsWith("onrender.com")) return "https://softbarber-backend.onrender.com/api"; // Render static
  return "/api"; // local puede usar proxy si configuras
})();

const state = {
  token: localStorage.getItem("softbarber_token") || null,
  user: null,
};

function setStatus(el, msg, isError = false) {
  el.textContent = msg;
  el.style.color = isError ? "#fca5a5" : "#94a3b8";
}

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw { status: res.status, data };
  return data;
}

// Router simple: muestra/oculta secciones
const views = {
  login: document.getElementById("login-view"),
  reservas: document.getElementById("reservas-view"),
  cortes: document.getElementById("cortes-view"),
  admin: document.getElementById("admin-view"),
};
function show(view) {
  Object.values(views).forEach(v => v.classList.add("hidden"));
  views[view].classList.remove("hidden");
}

// NAV
const navLogin = document.getElementById("nav-login");
const navReservas = document.getElementById("nav-reservas");
const navCortes = document.getElementById("nav-cortes");
const navAdmin = document.getElementById("nav-admin");
const navLogout = document.getElementById("nav-logout");
navLogin.onclick = () => show("login");
navReservas.onclick = () => show("reservas");
navCortes.onclick = () => show("cortes");
navAdmin.onclick = () => show("admin");
navLogout.onclick = () => {
  state.token = null; state.user = null;
  localStorage.removeItem("softbarber_token");
  alert("Sesión cerrada");
  show("login");
};

// LOGIN
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const btnLogin = document.getElementById("btn-login");
const loginStatus = document.getElementById("login-status");
btnLogin.onclick = async () => {
  setStatus(loginStatus, "Comprobando…");
  try {
    const payload = { email: loginEmail.value.trim(), password: loginPassword.value.trim() };
    const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(payload) });
    // backend retorna { token, role }
    state.token = data.token; state.user = { role: data.role };
    localStorage.setItem("softbarber_token", state.token);
    setStatus(loginStatus, "OK");
    show("reservas");
    await cargarReservas();
  } catch (e) {
    const msg = (e.data && (e.data.msg || e.data.message)) || `HTTP ${e.status}` || "login";
    setStatus(loginStatus, `Error: ${msg}`, true);
  }
};

// RESERVAS (appointments)
const reservasTableBody = document.querySelector("#reservas-table tbody");
const resNombre = document.getElementById("res-nombre");
const resBarbero = document.getElementById("res-barbero");
const resFecha = document.getElementById("res-fecha");
const resHora = document.getElementById("res-hora");
const resServicio = document.getElementById("res-servicio");
const resStatus = document.getElementById("res-status");
const btnCrearReserva = document.getElementById("btn-crear-reserva");

async function cargarReservas() {
  setStatus(resStatus, "Cargando…");
  try {
    const list = await apiFetch("/appointments", { method: "GET" }); // GET lista
    reservasTableBody.innerHTML = (list || []).map(r => {
      const fecha = r.date || "";
      const hora = r.time || "";
      return `<tr>
        <td>${r.client || ""}</td>
        <td>${fecha}</td>
        <td>${hora}</td>
        <td>${r.barber || ""}</td>
        <td>
          <button data-id="${r._id || r.id}" class="btn-cancel">Cancelar</button>
        </td>
      </tr>`;
    }).join("");
    // acciones
    document.querySelectorAll(".btn-cancel").forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        try {
          await apiFetch(`/appointments/${id}/status`, { method: "PUT", body: JSON.stringify({ status: "cancelada" }) });
          await cargarReservas();
        } catch (e) { alert("No se pudo cancelar"); }
      };
    });
    setStatus(resStatus, "Listo");
  } catch (e) {
    const msg = (e.data && (e.data.msg || e.data.message)) || `HTTP ${e.status}`;
    setStatus(resStatus, `Error al cargar: ${msg}`, true);
  }
}

btnCrearReserva.onclick = async () => {
  setStatus(resStatus, "Guardando…");
  try {
    const payload = {
      client: resNombre.value.trim(),
      barber: resBarbero.value.trim(),
      date: resFecha.value.trim(), // backend espera string
      time: resHora.value.trim(),  // backend espera string
      status: "pendiente",
    };
    await apiFetch("/appointments", { method: "POST", body: JSON.stringify(payload) });
    resNombre.value = ""; resBarbero.value = ""; resFecha.value = ""; resHora.value = ""; resServicio.value = "corte";
    await cargarReservas();
    setStatus(resStatus, "Reserva creada");
  } catch (e) {
    const msg = (e.data && (e.data.msg || e.data.message)) || `HTTP ${e.status}`;
    setStatus(resStatus, `Error al crear: ${msg}`, true);
  }
};

// CORTES (cuts)
const cutCliente = document.getElementById("cut-cliente");
const cutBarbero = document.getElementById("cut-barbero");
const cutPrecio = document.getElementById("cut-precio");
const cutPago = document.getElementById("cut-pago");
const cutDesc = document.getElementById("cut-desc");
const cutStatus = document.getElementById("cut-status");
const btnRegistrarCut = document.getElementById("btn-registrar-cut");

if (btnRegistrarCut) {
  btnRegistrarCut.onclick = async () => {
    setStatus(cutStatus, "Guardando…");
    try {
      const payload = {
        client: cutCliente.value.trim(),
        barber: cutBarbero.value.trim(),
        price: Number(cutPrecio.value),
        payment: cutPago.value,
        description: cutDesc.value.trim(),
      };
      await apiFetch("/cuts", { method: "POST", body: JSON.stringify(payload) });
      cutCliente.value = ""; cutBarbero.value = ""; cutPrecio.value = ""; cutPago.value = "efectivo"; cutDesc.value = "";
      setStatus(cutStatus, "Corte registrado");
    } catch (e) {
      const msg = (e.data && (e.data.msg || e.data.message)) || `HTTP ${e.status}`;
      setStatus(cutStatus, `Error al registrar: ${msg}`, true);
    }
  };
}

// ADMIN: estadísticas y usuarios
const statHoy = document.getElementById("stat-hoy");
const statMes = document.getElementById("stat-mes");
const statClientes = document.getElementById("stat-clientes");
const btnLoadStats = document.getElementById("btn-load-stats");
const adminStatus = document.getElementById("admin-status");
const usuariosTableBody = document.querySelector("#usuarios-table tbody");

async function cargarStats() {
  setStatus(adminStatus, "Cargando…");
  try {
    const daily = await apiFetch("/stats/daily");
    const monthly = await apiFetch("/stats/monthly");
    statHoy.textContent = (daily && (daily.count ?? daily.total)) ?? "–";
    statMes.textContent = (monthly && monthly.total) ?? "–";
    const clients = await apiFetch("/clients", { method: "GET" });
    statClientes.textContent = (clients && clients.length) || "–";
    setStatus(adminStatus, "Listo");
  } catch (e) { setStatus(adminStatus, "Error al cargar stats", true); }
}

async function cargarUsuarios() {
  try {
    // usa endpoint real del backend
    const users = await apiFetch("/admin/barberos", { method: "GET" });
    usuariosTableBody.innerHTML = (users || []).map(u => `<tr>
      <td>${u.username || u.name || ""}</td>
      <td>${u.email || ""}</td>
      <td>${u.role || ""}</td>
    </tr>`).join("");
  } catch { usuariosTableBody.innerHTML = ""; }
}

if (btnLoadStats) btnLoadStats.onclick = async () => { await cargarStats(); await cargarUsuarios(); };

// Arranque: si hay sesión, ir directo a reservas
(async function init() {
  if (state.token) { show("reservas"); await cargarReservas(); }
  else { show("login"); }
})();
