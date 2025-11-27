
const API = "https://softbarber-backend.onrender.com/api";
const tokenKey = 'softbarber_token';
const roleKey = 'softbarber_role';

const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

function setAuth(token, role) {
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(roleKey, role);
}
function getToken() { return localStorage.getItem(tokenKey); }
function getRole() { return localStorage.getItem(roleKey); }
function logout() { localStorage.removeItem(tokenKey); localStorage.removeItem(roleKey); location.reload(); }

function showNav() {
  const nav = qs('#nav');
  nav.classList.remove('hidden');
  if (getRole() !== 'admin') {
    nav.querySelector('[data-view="admin"]').classList.add('hidden');
  }
}

function showView(id) {
  qsa('main > section').forEach(s => s.classList.add('hidden'));
  qs(`#${id}-view`).classList.remove('hidden');
}

function authHeaders() {
  const t = getToken();
  return { 'Content-Type':'application/json', 'Authorization': `Bearer ${t}` };
}

async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function initLogin() {
  qs('#show-register').addEventListener('click', () => {
    qs('#register-form').classList.toggle('hidden');
  });

  qs('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      const result = await api('/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
      setAuth(result.token, result.role);
      qs('#login-view').classList.add('hidden');
      showNav();
      showView(getRole()==='admin' ? 'admin' : 'barber');
      loadAdmin();
      loadCuts();
    } catch (err) { alert('Login fallido'); }
  });

  qs('#register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const data = { username: f.get('username'), email: f.get('email'), password: f.get('password') };
    try {
      await api('/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
      alert('Barbero registrado');
    } catch (err) { alert('Registro fallido'); }
  });
}

function initNav() {
  qsa('nav button[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      showView(btn.dataset.view);
      if (btn.dataset.view === 'admin') loadAdmin();
      if (btn.dataset.view === 'barber') loadCuts();
      if (btn.dataset.view === 'stats') loadStats();
      if (btn.dataset.view === 'appointments') loadAppointments();
      if (btn.dataset.view === 'clients') loadClients();
    });
  });
  qs('#logout').addEventListener('click', logout);
}

async function loadAdmin() {
  try {
    const dashboard = await api('/admin/dashboard', { headers: authHeaders() });
    qs('#admin-dashboard').innerHTML = `
      <p>Usuarios: ${dashboard.users}</p>
      <p>Cortes: ${dashboard.cuts}</p>
      <p>Citas: ${dashboard.appointments}</p>
      <p>Barberos activos: ${dashboard.barberosActivos}</p>
      <p>Barberos bloqueados: ${dashboard.barberosBloqueados}</p>
    `;
    const barbers = await api('/admin/barberos', { headers: authHeaders() });
    const tbody = qs('#barbers-table tbody');
    tbody.innerHTML = barbers.map(b => `
      <tr>
        <td>${b.username}</td>
        <td>${b.email}</td>
        <td>${b.active ? 'Activo' : 'Bloqueado'}</td>
        <td>
          ${b.active ? `<button data-act="block" data-id="${b._id}">Bloquear</button>` : `<button data-act="activate" data-id="${b._id}">Activar</button>`}
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        const path = act === 'block' ? `/admin/bloquear/${id}` : `/admin/activar/${id}`;
        await api(path, { method: 'PUT', headers: authHeaders() });
        loadAdmin();
      });
    });
  } catch (err) { console.error(err); }
}

function initBarberPanel() {
  qs('#cut-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      await api('/cuts', { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
      alert('Corte registrado');
      e.target.reset();
      loadCuts();
    } catch (err) { alert('Error registrando corte'); }
  });
  qs('#load-cuts').addEventListener('click', loadCuts);
}

async function loadCuts() {
  const params = new URLSearchParams();
  const barber = qs('#filter-barber').value; const client = qs('#filter-client').value;
  if (barber) params.set('barber', barber);
  if (client) params.set('client', client);
  try {
    const cuts = await api(`/cuts?${params.toString()}`, { headers: authHeaders() });
    qs('#cuts-table tbody').innerHTML = cuts.map(c => `
      <tr>
        <td>${new Date(c.date).toLocaleString()}</td>
        <td>${c.client}</td>
        <td>${c.barber}</td>
        <td>${c.payment}</td>
        <td>${c.price.toFixed(2)}</td>
        <td>${c.description || ''}</td>
      </tr>
    `).join('');
  } catch(err) { console.error(err); }
}

async function loadStats() {
  try {
    const daily = await api('/stats/daily', { headers: authHeaders() });
    const weekly = await api('/stats/weekly', { headers: authHeaders() });
    const monthly = await api('/stats/monthly', { headers: authHeaders() });
    qs('#stats-daily').innerHTML = `<h3>Hoy</h3><p>Cortes: ${daily.count || 0} | Total: $${(daily.total || 0).toFixed?.(2) || daily.total || 0}</p>`;
    qs('#stats-weekly').innerHTML = `<h3>Semana</h3><ul>${weekly.map(d => `<li>${d._id}: $${d.total.toFixed(2)} (${d.count})</li>`).join('')}</ul>`;
    qs('#stats-monthly').innerHTML = `<h3>Mes</h3><ul>${monthly.map(d => `<li>${d._id}: $${d.total.toFixed(2)} (${d.count})</li>`).join('')}</ul>`;
    qs('#load-counts').onclick = async () => {
      const from = qs('#counts-from').value; const to = qs('#counts-to').value;
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const counts = await api(`/stats/counts/by-date?${params.toString()}`, { headers: authHeaders() });
      qs('#counts-list').innerHTML = counts.map(c => `<li>${c._id}: ${c.count} cortes</li>`).join('');
    };
  } catch(err) { console.error(err); }
}

function initAppointments() {
  qs('#appointment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      await api('/appointments', { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
      alert('Cita creada');
      e.target.reset();
      loadAppointments();
    } catch(err) { alert('Error creando cita'); }
  });
}

async function loadAppointments() {
  try {
    const appts = await api('/appointments', { headers: authHeaders() });
    const tbody = qs('#appointments-table tbody');
    tbody.innerHTML = appts.map(a => `
      <tr>
        <td>${a.date}</td>
        <td>${a.time}</td>
        <td>${a.client}</td>
        <td>${a.barber}</td>
        <td>${a.status}</td>
        <td>
          <select data-id="${a._id}">
            <option value="pendiente" ${a.status==='pendiente'?'selected':''}>Pendiente</option>
            <option value="confirmada" ${a.status==='confirmada'?'selected':''}>Confirmada</option>
            <option value="cancelada" ${a.status==='cancelada'?'selected':''}>Cancelada</option>
            <option value="completada" ${a.status==='completada'?'selected':''}>Completada</option>
          </select>
          <button data-reminder="${a._id}">Recordatorio</button>
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const id = sel.dataset.id;
        const status = sel.value;
        await api(`/appointments/${id}/status`, { method:'PUT', headers: authHeaders(), body: JSON.stringify({ status }) });
        loadAppointments();
      });
    });
    tbody.querySelectorAll('button[data-reminder]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.reminder;
        await api(`/appointments/${id}/reminder`, { method:'POST', headers: authHeaders(), body: JSON.stringify({}) });
        alert('Recordatorio enviado (si SMTP está configurado)');
      });
    });
  } catch(err) { console.error(err); }
}

function initClients() {
  qs('#client-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    try {
      await api('/clients', { method:'POST', headers: authHeaders(), body: JSON.stringify(data) });
      alert('Cliente registrado');
    } catch(err) { alert('Error registrando cliente'); }
  });
  qs('#load-frequents').addEventListener('click', async () => {
    const barber = qs('#frequent-barber').value;
    const params = new URLSearchParams();
    if (barber) params.set('barber', barber);
    const data = await api(`/clients/frecuentes?${params.toString()}`, { headers: authHeaders() });
    qs('#clients-table tbody').innerHTML = data.map(d => `
      <tr><td>${d.client}</td><td>${d.totalCortes}</td><td>$${d.totalGastado.toFixed(2)}</td></tr>
    `).join('');
  });
}

function bootstrap() {
  initLogin();
  initNav();
  initBarberPanel();
  initAppointments();
  initClients();

  if (getToken()) {
    qs('#login-view').classList.add('hidden');
    showNav();
    showView(getRole()==='admin' ? 'admin' : 'barber');
    loadAdmin();
    loadCuts();
  }
}

document.addEventListener('DOMContentLoaded', bootstrap);
