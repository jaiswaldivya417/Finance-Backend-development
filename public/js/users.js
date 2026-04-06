// ---- USERS ----
async function loadUsers() {
  try {
    const res = await apiFetch(`/users?page=${window.usersPage}&limit=10`);
    renderUsersTable(res.data.users);
    renderPagination('usersPagination', res.data.total, window.usersPage, 10, p => { window.usersPage = p; loadUsers(); });
  } catch(e) { toast('Failed to load users', 'error'); }
}

let usersData = [];

function renderUsersTable(users) {
  usersData = users; // save for lookup
  const tbody = document.getElementById('usersTable');
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">◎</div><p>No users found</p></div></td></tr>';
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td style="color:var(--text3)">${u.email}</td>
      <td><span class="badge ${u.role}">${u.role}</span></td>
      <td><span class="badge ${u.status}">${u.status}</span></td>
      <td class="mono" style="font-size:11px">${u.created_at ? u.created_at.slice(0,10) : '—'}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="openEditUser(${u.id})">Edit</button>
        <button class="btn btn-danger btn-sm" style="margin-left:4px" onclick="deleteUser(${u.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openAddUser() {
  window.editingUserId = null;
  document.getElementById('userModalTitle').textContent = 'Add User';

  // Clear all fields
  document.getElementById('userName').value    = '';
  document.getElementById('userEmail').value   = '';
  document.getElementById('userPassword').value = '';
  document.getElementById('userRole').value    = 'viewer';
  document.getElementById('userStatus').value  = 'active';

  // Show password, show status
  document.getElementById('userPasswordGroup').style.display = 'block';
  document.getElementById('userStatusGroup').style.display   = 'block';

  openModal('userModal');
}

function openEditUser(id) {
  // Find user from stored data
  const u = window.usersData.find(u => u.id === id);
  if (!u) { toast('User not found', 'error'); return; }

  window.editingUserId = id;
  document.getElementById('userModalTitle').textContent = 'Edit User';

  // Pre-fill ALL current values
  document.getElementById('userName').value    = u.name   || '';
  document.getElementById('userEmail').value   = u.email  || '';
  document.getElementById('userRole').value    = u.role   || 'viewer';
  document.getElementById('userStatus').value  = u.status || 'active';

  // Hide password, show status
  document.getElementById('userPasswordGroup').style.display = 'none';
  document.getElementById('userStatusGroup').style.display   = 'block';

  openModal('userModal');
}

async function saveUser() {
  try {
    if (window.editingUserId) {
      const name   = document.getElementById('userName').value.trim();
      const email  = document.getElementById('userEmail').value.trim();
      const role   = document.getElementById('userRole').value;
      const status = document.getElementById('userStatus').value;

      if (!name)  { toast('Name is required', 'error');  return; }
      if (!email) { toast('Email is required', 'error'); return; }

      const res = await apiFetch('/users/' + window.editingUserId, {
        method: 'PATCH',
        body: JSON.stringify({ name, email, role, status })
      });

       // If the edited user is the currently logged in user, update sidebar too
      if (window.editingUserId === window.currentUser.id) {
        window.currentUser.name  = res.data.name;
        window.currentUser.email = res.data.email;
        window.currentUser.role  = res.data.role;
        localStorage.setItem('fl_user', JSON.stringify(window.currentUser));
        updateSidebar();
      }

      toast('User updated successfully');

    } else {
      const name     = document.getElementById('userName').value.trim();
      const email    = document.getElementById('userEmail').value.trim();
      const password = document.getElementById('userPassword').value;
      const role     = document.getElementById('userRole').value;

      if (!name)               { toast('Name is required', 'error');                    return; }
      if (!email)              { toast('Email is required', 'error');                   return; }
      if (!password)           { toast('Password is required', 'error');                return; }
      if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');
      toast('User created successfully');
    }

    closeModal('userModal');
    loadUsers();

  } catch(e) {
    toast(e.message || 'Something went wrong', 'error');
    console.error('saveUser error:', e);
  }
}

async function deleteUser(id) {
  if (!window.confirm('Delete this user?')) return;
  try {
    await apiFetch('/users/' + id, { method: 'DELETE' });
    toast('User deleted');
    await loadUsers();
  } catch(e) {
    toast(e.message, 'error');
  }
}