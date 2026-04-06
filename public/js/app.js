// GLOBAL STATE (shared across all modules)
window.API = '/api';

window.token = localStorage.getItem('fl_token');
window.currentUser = JSON.parse(localStorage.getItem('fl_user') || 'null');

window.editingRecordId = null;
window.editingUserId = null;

window.recordsPage = 1;
window.usersPage = 1;
window.debounceTimer = null;

// ---- INIT ----
function initApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appShell').style.display  = 'flex';

  // Always reset ALL nav items first before applying role rules
  document.getElementById('usersNav').style.display    = 'flex';
  document.getElementById('addRecordBtn').style.display = 'inline-flex';

  // Reset nav to dashboard on every login
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-page="dashboard"]').classList.add('active');
  document.getElementById('page-dashboard').classList.add('active');

  // Update sidebar with current user info
  updateSidebar();

  // Apply role restrictions AFTER reset
  if (currentUser.role !== 'admin') {
    document.getElementById('usersNav').style.display = 'none';
  }

  if (currentUser.role === 'viewer') {
    const btn = document.getElementById('addRecordBtn');
    if (btn) btn.style.display = 'none';
  }

  // Always reload dashboard fresh on login
  loadDashboard();
}

function updateSidebar() {
  document.getElementById('sidebarName').textContent    = window.currentUser.name;
  document.getElementById('sidebarRole').textContent    = window.currentUser.role;
  document.getElementById('sidebarAvatar').textContent  = window.currentUser.name[0].toUpperCase();
}

// ---- NAVIGATION ----
function navigate(page, el) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  if (page === 'records') loadRecords();
  if (page === 'users') loadUsers();
}



// ---- ACCESS PAGE ----
function buildAccessPage() {
  const perms = [
    { label: 'View records',          viewer: true,  analyst: true,  admin: true },
    { label: 'View dashboard',        viewer: true,  analyst: true,  admin: true },
    { label: 'Create records',        viewer: false, analyst: true,  admin: true },
    { label: 'Edit records',          viewer: false, analyst: true,  admin: true },
    { label: 'Delete records',        viewer: false, analyst: false, admin: true },
    { label: 'View users list',       viewer: false, analyst: false, admin: true },
    { label: 'Create users',          viewer: false, analyst: false, admin: true },
    { label: 'Change user roles',     viewer: false, analyst: false, admin: true },
    { label: 'Deactivate users',      viewer: false, analyst: false, admin: true },
    { label: 'Access analytics',      viewer: true,  analyst: true,  admin: true },
    { label: 'Category breakdown',    viewer: true,  analyst: true,  admin: true },
    { label: 'Monthly trends',        viewer: true,  analyst: true,  admin: true },
  ];

  const grid = document.querySelector('.perm-grid');
  perms.forEach(p => {
    const cells = [p.label, p.viewer, p.analyst, p.admin].map((v, i) =>
      i === 0
        ? `<div class="perm-cell">${v}</div>`
        : `<div class="perm-cell center">${v ? '<span class="perm-check">✓</span>' : '<span class="perm-x">—</span>'}</div>`
    ).join('');
    grid.insertAdjacentHTML('beforeend', cells);
  });

  const session = document.getElementById('sessionInfo');
  session.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:13px;color:var(--text2)">Logged in as</span>
        <span style="font-size:13px;color:var(--text);font-weight:500">${window.currentUser.name}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:13px;color:var(--text2)">Email</span>
        <span style="font-size:12px;color:var(--text3);font-family:'DM Mono',monospace">${window.currentUser.email}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0">
        <span style="font-size:13px;color:var(--text2)">Role</span>
        <span class="badge ${window.currentUser.role}">${window.currentUser.role}</span>
      </div>
    </div>
  `;
}

// ---- PAGINATION ----
function renderPagination(containerId, total, page, limit, onPage) {
  const el = document.getElementById(containerId);
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) { el.innerHTML = ''; return; }

  let html = `<span class="page-info">Showing ${Math.min((page-1)*limit+1, total)}–${Math.min(page*limit, total)} of ${total}</span>`;
  html += `<button class="page-btn" ${page===1?'disabled':''} onclick="(${onPage})(${page-1})">← Prev</button>`;
  for (let i = Math.max(1, page-1); i <= Math.min(totalPages, page+1); i++) {
    html += `<button class="page-btn ${i===page?'active':''}" onclick="(${onPage})(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${page===totalPages?'disabled':''} onclick="(${onPage})(${page+1})">Next →</button>`;
  el.innerHTML = html;
}

// ---- MODAL ----
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if(e.target === m) m.classList.remove('open'); });
});


// ---- BOOT ----
window.addEventListener('DOMContentLoaded', () => {
  window.token = localStorage.getItem('fl_token');
  window.currentUser = JSON.parse(localStorage.getItem('fl_user') || 'null');

  if (window.token && window.currentUser) {
    initApp();
  } else {
   document.getElementById('loginPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});
   document.getElementById('loginPage').style.display = 'flex';
   document.getElementById('appShell').style.display = 'none';
   switchTab('login');
   
  }
});