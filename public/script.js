// Config de API: funcionar en Render y en local
const API_BASE = (() => {
  const host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "http://localhost:4000/api"; // desarrollo local
  if (host.endsWith("onrender.com")) return "https://softbarber-backend.onrender.com/api"; // Render
  return "https://softbarber-backend.onrender.com/api"; // fallback
})();

// Estado global (compatibilidad con clave previa)
const state = {
  token: localStorage.getItem("token") || localStorage.getItem("softbarber_token") || null,
  user: JSON.parse(localStorage.getItem("user") || localStorage.getItem("softbarber_user") || "null")
};

function setStatus(el, msg, isError = false) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? "#fca5a5" : "#94a3b8";
}

/**
 * apiFetch:
 * - path: ruta relativa que se concatena con API_BASE (API_BASE ya contiene /api)
 * - options: fetch options. Si options.skipAuth === true no añade Authorization.
 */
async function apiFetch(path, options = {}) {
  const finalOptions = { ...options };
  finalOptions.headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  // Añadir token solo si existe y no se pidió skipAuth
  if (state.token && options.skipAuth !== true) {
    finalOptions.headers.Authorization = `Bearer ${state.token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, finalOptions);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }

  if (!res.ok) {
    // Estandarizar error
    const msg = (data && (data.msg || data.message)) || `HTTP ${res.status}`;
    throw { status: res.status, data: { msg }, raw: data };
  }

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
  Object.values(views).forEach(v => v && v.classList.add("hidden"));

  // Bloquear acceso a admin si no es admin
  if (view === "admin" && state.user?.role !== "admin") {
    alert("Acceso denegado. Solo el administrador puede entrar.");
    if (views.reservas) views.reservas.classList.remove("hidden");
    return;
  }

  if (views[view]) views[view].classList.remove("hidden");
}

// NAV
const navLogin = document.getElementById("nav-login");
const navReservas = document.getElementById("nav-reservas");
const navCortes = document.getElementById("nav-cortes");
const navAdmin = document.getElementById("nav-admin");
const navLogout = document.getElementById("nav-logout");
navLogin && (navLogin.onclick = () => show("login"));
navReservas && (navReservas.onclick = () => show("reservas"));
navCortes && (navCortes.onclick = () => show("cortes"));
navAdmin && (navAdmin.onclick = () => show("admin"));
navLogout && (navLogout.onclick = () => {
  state.token = null; state.user = null;
  // limpiar claves antiguas y nuevas
  localStorage.removeItem("softbarber_token");
  localStorage.removeItem("softbarber_user");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  alert("Sesión cerrada");
  show("login");
});

// LOGIN
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const btnLogin = document.getElementById("btn-login");
const loginStatus = document.getElementById("login-status");

if (btnLogin) {
  btnLogin.onclick = async () => {
    setStatus(loginStatus, "Comprobando…");
    try {
      const payload = { email: loginEmail.value.trim(), password: loginPassword.value.trim() };

      // No enviar Authorization para login
      const data = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(payload), skipAuth: true });

      // Guardar token y rol
      state.token = data.token;
      state.user = { role: data.role };

      // Guardar en localStorage (compatibilidad con claves antiguas)
      localStorage.setItem("token", state.token);
      localStorage.setItem("softbarber_token", state.token);
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("softbarber_user", JSON.stringify(state.user));

      setStatus(loginStatus, "OK");
      // Mostrar vista según rol
      if (state.user.role === "admin") {
        show("admin");
      } else {
        show("reservas");
        await cargarReservas();
      }
    } catch (e) {
      const msg = (e.data && (e.data.msg || e.data.message)) || `HTTP ${e.status}` || "login";
      setStatus(loginStatus, `Error: ${msg}`, true);
    }
  };
}

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
    const list = await apiFetch("/appointments", { method: "GET" });
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

if (btnCrearReserva) {
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
}

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
    const daily = await apiFetch("/stats/daily", { method: "GET" });
    const monthly = await apiFetch("/stats/monthly", { method: "GET" });
    statHoy.textContent = (daily && (daily.count ?? daily.total)) ?? "–";
    statMes.textContent = (monthly && monthly.total) ?? "–";
    const clients = await apiFetch("/clients", { method: "GET" });
    statClientes.textContent = (clients && clients.length) || "–";
    setStatus(adminStatus, "Listo");
  } catch (e) { setStatus(adminStatus, "Error al cargar stats", true); }
}

async function cargarUsuarios() {
  try {
    const users = await apiFetch("/admin/barberos", { method: "GET" });
    usuariosTableBody.innerHTML = (users || []).map(u => `<tr>
      <td>${u.username || u.name || ""}</td>
      <td>${u.email || ""}</td>
      <td>${u.role || ""}</td>
    </tr>`).join("");
  } catch { usuariosTableBody.innerHTML = ""; }
}

if (btnLoadStats) btnLoadStats.onclick = async () => {
  if (state.user?.role !== "admin") {
    alert("Solo el administrador puede ver estadísticas");
    return;
  }
  await cargarStats();
  await cargarUsuarios();
};

// Arranque: si hay sesión, ir directo a reservas o admin
(async function init() {
  // Si el token existe pero user no, intentar obtener rol mínimo llamando a /api/auth/me (si existe)
  if (state.token && !state.user) {
    try {
      const me = await apiFetch("/auth/me", { method: "GET" });
      state.user = { role: me.role };
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("softbarber_user", JSON.stringify(state.user));
    } catch {
      // no hay endpoint me o token inválido: limpiar
      localStorage.removeItem("token");
      localStorage.removeItem("softbarber_token");
      localStorage.removeItem("user");
      localStorage.removeItem("softbarber_user");
      state.token = null; state.user = null;
    }
  }

  if (state.token && state.user) {
    if (state.user.role === "admin") {
      show("admin");
    } else {
      show("reservas");
      await cargarReservas();
    }
  } else {
    show("login");
  }
})();
