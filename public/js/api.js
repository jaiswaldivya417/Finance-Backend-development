
// ---- API HELPER ----
async function apiFetch(path, options = {}) {
  const res = await fetch(window.API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + window.token,
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('API ERROR:', data);
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ---- TOAST ----
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-dot"></div>${msg}`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ---- TAB SWITCHER ----
function switchTab(tab) {
  const isLogin = tab === 'login';

  // Toggle forms
  document.getElementById('loginForm').style.display    = isLogin ? 'flex' : 'none';
  document.getElementById('registerForm').style.display = isLogin ? 'none' : 'flex';

  // Toggle tab styles
  const loginTab    = document.getElementById('tabLogin');
  const registerTab = document.getElementById('tabRegister');
  loginTab.style.background    = isLogin ? 'var(--accent)' : 'transparent';
  loginTab.style.color         = isLogin ? '#0a0a0f'       : 'var(--text2)';
  registerTab.style.background = isLogin ? 'transparent'   : 'var(--accent)';
  registerTab.style.color      = isLogin ? 'var(--text2)'  : '#0a0a0f';

  // Update subtitle
  document.getElementById('authSubtitle').textContent = isLogin
    ? 'Welcome back. Sign in to continue.'
    : 'Create your account to get started.';

  // Clear error
  const err = document.getElementById('authError');
  err.textContent = '';
  err.classList.remove('show');
}

// ---- AUTH ----
// ---- LOGIN ----
async function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('authError');
  errEl.classList.remove('show');

  if (!email)    { errEl.textContent = 'Please enter your email.';    errEl.classList.add('show'); return; }
  if (!password) { errEl.textContent = 'Please enter your password.'; errEl.classList.add('show'); return; }

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      // If user not found, suggest registering
      if (res.status === 401) {
        errEl.innerHTML = 'Invalid email or password. <span onclick="switchTab(\'register\')" style="color:var(--accent);cursor:pointer;text-decoration:underline">Not registered yet?</span>';
      } else {
        errEl.textContent = data.message || 'Login failed.';
      }
      errEl.classList.add('show');
      return;
    }
    token       = data.data.token;
    currentUser = data.data.user;
    localStorage.setItem('fl_token', token);
    localStorage.setItem('fl_user',  JSON.stringify(currentUser));
    initApp();
  } catch(e) {
    errEl.textContent = 'Could not connect to server. Is it running?';
    errEl.classList.add('show');
  }
}

// ---- REGISTER ----
async function doRegister() {
  const userName   = document.getElementById('regName').value.trim();
  const userEmail  = document.getElementById('regEmail').value.trim();
  const password   = document.getElementById('regPassword').value;
  const confirm    = document.getElementById('regConfirm').value;
  const role       = document.getElementById('regRole').value;
  const errEl      = document.getElementById('authError');
  errEl.classList.remove('show');

  // Frontend validation
  if (!userName)             { errEl.textContent = 'Please enter your full name.';           errEl.classList.add('show'); return; }
  if (!userEmail)            { errEl.textContent = 'Please enter your email.';               errEl.classList.add('show'); return; }
  if (!password)             { errEl.textContent = 'Please enter a password.';               errEl.classList.add('show'); return; }
  if (password.length < 6)   { errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.add('show'); return; }
  if (password !== confirm)  { errEl.textContent = 'Passwords do not match.';                errEl.classList.add('show'); return; }

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName, email: userEmail, password, role })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.message || 'Registration failed.';
      errEl.classList.add('show');
      return;
    }

    // Auto-login after registration
    const loginRes  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, password })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      // Registration worked but auto-login failed — send to login tab
      switchTab('login');
      document.getElementById('loginEmail').value = userEmail;
      errEl.textContent = 'Account created! Please sign in.';
      errEl.classList.add('show');
      return;
    }

    token       = loginData.data.token;
    currentUser = loginData.data.user;
    localStorage.setItem('fl_token', token);
    localStorage.setItem('fl_user',  JSON.stringify(currentUser));
    initApp();

  } catch(e) {
    errEl.textContent = 'Could not connect to server. Is it running?';
    errEl.classList.add('show');
  }
}

function doLogout() {
  // Clear auth data
  token       = null;
  currentUser = null;
  localStorage.removeItem('fl_token');
  localStorage.removeItem('fl_user');

  // Reset all UI state
  editingRecordId = null;
  editingUserId   = null;
  recordsPage     = 1;
  usersPage       = 1;
  usersData       = [];

  // Close any open modals
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));

  // Switch back to login page
  document.getElementById('appShell').style.display  = 'none';
  document.getElementById('loginPage').style.display = 'flex';

  // Clear login form
  document.getElementById('loginEmail').value    = '';
  document.getElementById('loginPassword').value = '';
  document.getElementById('authError').classList.remove('show');

  // Switch to login tab
  switchTab('login');
}

document.getElementById('loginPassword').addEventListener('keydown', e => { if(e.key==='Enter') doLogin(); });