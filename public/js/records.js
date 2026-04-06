// ---- RECORDS ----
function debounceLoad() {
  clearTimeout(window.debounceTimer);
  window.debounceTimer = setTimeout(loadRecords, 350);
}
function clearFilters() {
  document.getElementById('filterType').value = '';
  document.getElementById('filterCategory').value = '';
  document.getElementById('filterStart').value = '';
  document.getElementById('filterEnd').value = '';
  window.recordsPage = 1; loadRecords();
}

async function loadRecords() {
  const type     = document.getElementById('filterType').value;
  const category = document.getElementById('filterCategory').value;
  const start    = document.getElementById('filterStart').value;
  const end      = document.getElementById('filterEnd').value;
  let qs = `?page=${recordsPage}&limit=10`;
  if (type)     qs += `&type=${type}`;
  if (category) qs += `&category=${encodeURIComponent(category)}`;
  if (start)    qs += `&startDate=${start}`;
  if (end)      qs += `&endDate=${end}`;
  try {
    const res = await apiFetch('/records' + qs);
    renderRecordsTable(res.data.records);
    renderPagination('recordsPagination', res.data.total, window.recordsPage, 10, p => { window.recordsPage = p; loadRecords(); });
  } catch(e) { toast('Failed to load records', 'error'); }
}

function renderRecordsTable(records) {
  const tbody = document.getElementById('recordsTable');
  if (!records.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">◎</div><p>No records found</p></div></td></tr>';
    return;
  }
  const canEdit = window.currentUser.role !== 'viewer';
  tbody.innerHTML = records.map(r => `
    <tr>
      <td>${r.category}</td>
      <td><span class="badge ${r.type}">${r.type}</span></td>
      <td class="mono ${r.type === 'income' ? '' : ''}" style="color:${r.type==='income'?'var(--green)':'var(--red)'}">${r.type==='income'?'+':'-'}${fmt(r.amount)}</td>
      <td class="mono" style="font-size:12px">${r.date}</td>
      <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text3)">${r.notes || '—'}</td>
      <td>
        ${canEdit ? `<button class="btn btn-ghost btn-sm" onclick="openEditRecord(${r.id})">Edit</button>` : ''}
        ${window.currentUser.role==='admin' ? `<button class="btn btn-danger btn-sm" style="margin-left:4px" onclick="deleteRecord(${r.id})">Delete</button>` : ''}
        ${!canEdit ? '<span style="color:var(--text3);font-size:12px">View only</span>' : ''}
      </td>
    </tr>
  `).join('');
}

function openAddRecord() {
  window.editingRecordId = null;
  document.getElementById('recordModalTitle').textContent = 'Add Record';
  document.getElementById('recType').value     = 'income';
  document.getElementById('recAmount').value   = '';
  document.getElementById('recCategory').value = '';
  document.getElementById('recNotes').value    = '';

  // Always set today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('recDate').value = today;

  openModal('recordModal');
}

async function openEditRecord(id) {
  try {
    const res = await apiFetch('/records/' + id);
    const r   = res.data;
    window.editingRecordId = id;

    document.getElementById('recordModalTitle').textContent = 'Edit Record';
    document.getElementById('recType').value     = r.type     || 'income';
    document.getElementById('recAmount').value   = r.amount   || '';
    document.getElementById('recCategory').value = r.category || '';
    document.getElementById('recDate').value     = r.date     || '';
    document.getElementById('recNotes').value    = r.notes    || '';

    openModal('recordModal');
  } catch(e) {
    toast('Failed to load record details', 'error');
    console.error('openEditRecord error:', e);
  }
}

async function saveRecord() {
  const type     = document.getElementById('recType').value;
  const amount   = parseFloat(document.getElementById('recAmount').value);
  const category = document.getElementById('recCategory').value.trim();
  const date     = document.getElementById('recDate').value;
  const notes    = document.getElementById('recNotes').value.trim();

  if (!amount || isNaN(amount) || amount <= 0) { toast('Enter a valid amount', 'error');  return; }
  if (!category)                               { toast('Category is required', 'error'); return; }
  if (!date)                                   { toast('Date is required', 'error');     return; }

  const body = { type, amount, category, date, notes };

  try {
    if (window.editingRecordId) {
      await apiFetch('/records/' + window.editingRecordId, {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
      toast('Record updated successfully');
    } else {
      await apiFetch('/records', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      toast('Record added successfully');
    }

    closeModal('recordModal');

    // Refresh everything that shows financial data
    await Promise.all([
      loadRecords(),
      loadDashboard()
    ]);

  } catch(e) {
    toast(e.message || 'Something went wrong', 'error');
    console.error('saveRecord error:', e);
  }
}

async function deleteRecord(id) {
  if (!window.confirm('Delete this record?')) return;
  try {
    await apiFetch('/records/' + id, { method: 'DELETE' });
    toast('Record deleted');

    // Refresh everything
    await Promise.all([
      loadRecords(),
      loadDashboard()
    ]);
  } catch(e) {
    toast(e.message, 'error');
  }
}