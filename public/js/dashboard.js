// ---- DASHBOARD ----
async function loadDashboard() {
  try {
    const [summary, categories, trends, recent] = await Promise.all([
      apiFetch('/dashboard/summary'),
      apiFetch('/dashboard/categories'),
      apiFetch('/dashboard/trends'),
      apiFetch('/dashboard/recent')
    ]);
    renderSummary(summary.data);
    renderCategories(categories.data);
    renderTrends(trends.data);
    renderRecent(recent.data);
  } catch(e) { toast('Failed to load dashboard', 'error'); }
}

// Render Summary
function renderSummary(s) {
  document.getElementById('statIncome').textContent  = fmt(s.total_income);
  document.getElementById('statExpense').textContent = fmt(s.total_expenses);
  const bal = document.getElementById('statBalance');
  bal.textContent = fmt(s.net_balance);
  bal.className = 'stat-value ' + (s.net_balance >= 0 ? 'positive' : 'negative');
  document.getElementById('statRecords').textContent = s.total_records;

  const total = (s.total_income || 0) + (s.total_expenses || 0);
  if (total > 0) {
    const ip = Math.round((s.total_income / total) * 100);
    const ep = 100 - ip;
    document.getElementById('balanceIncomBar').style.width    = ip + '%';
    document.getElementById('balanceExpenseBar').style.width  = ep + '%';
    document.getElementById('balanceLabelIncome').textContent  = `Income ${ip}%`;
    document.getElementById('balanceLabelExpense').textContent = `Expenses ${ep}%`;
  } else {
    // Reset to zero when all records are deleted
    document.getElementById('balanceIncomBar').style.width    = '0%';
    document.getElementById('balanceExpenseBar').style.width  = '0%';
    document.getElementById('balanceLabelIncome').textContent  = 'Income 0%';
    document.getElementById('balanceLabelExpense').textContent = 'Expenses 0%';
  }
}

// Render Categories
function renderCategories(cats) {
  const el = document.getElementById('categoryChart');
  if (!cats.length) { el.innerHTML = '<div class="empty-state"><p>No data yet</p></div>'; return; }
  const maxVal = Math.max(...cats.map(c => c.total));
  el.innerHTML = cats.slice(0, 8).map(c => `
    <div class="bar-row">
      <div class="bar-label">
        <span>${c.category} <span style="color:var(--text3);font-size:11px">(${c.type})</span></span>
        <span class="mono">${fmt(c.total)}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill ${c.type}" style="width:${Math.round((c.total/maxVal)*100)}%"></div>
      </div>
    </div>
  `).join('');
}

// Render Trends
function renderTrends(trends) {
  const el = document.getElementById('monthlyChart');
  if (!trends.length) { el.innerHTML = '<div class="empty-state"><p>No data yet</p></div>'; return; }
  const maxVal = Math.max(...trends.flatMap(t => [t.income || 0, t.expenses || 0])) || 1;
  el.innerHTML = trends.slice().reverse().map(t => {
    const ih = Math.round(((t.income || 0) / maxVal) * 120);
    const eh = Math.round(((t.expenses || 0) / maxVal) * 120);
    const mo = t.month ? t.month.slice(5) : '?';
    return `
      <div class="month-group">
        <div class="month-bars">
          <div class="month-bar income"  style="height:${ih}px"></div>
          <div class="month-bar expense" style="height:${eh}px"></div>
        </div>
        <div class="month-label">${mo}</div>
      </div>
    `;
  }).join('');
}


// Render Recent
function renderRecent(items) {
  const el = document.getElementById('recentList');
  if (!items.length) { el.innerHTML = '<div class="empty-state"><p>No transactions yet</p></div>'; return; }
  el.innerHTML = items.slice(0, 8).map(r => `
    <div class="recent-item">
      <div class="recent-dot ${r.type}"></div>
      <div class="recent-info">
        <div class="recent-category">${r.category}</div>
        <div class="recent-date">${r.date}</div>
      </div>
      <div class="recent-amount ${r.type}">${r.type === 'income' ? '+' : '-'}${fmt(r.amount)}</div>
    </div>
  `).join('');
}