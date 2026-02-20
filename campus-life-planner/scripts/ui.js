// Helpers ───────────────────────────────────────────────
function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}
// format time with locale, fallback to ISO(International Standard format for time) if invalid
function fmtDateTime(t) {
  if (!t) return '';
  return new Date(t).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function announce(msg, assertive = false) {
  const el = document.getElementById(
    assertive ? 'live-assertive' : 'live-status',
  );
  el.textContent = '';
  // Used requestAnimationFrame to ensure screen readers detect the change
  requestAnimationFrame(() => {
    el.textContent = msg;
  });
}
//To not repeate "document.getElementById" all over the code, created a helper function $
function $(id) {
  return document.getElementById(id);
}

// default state variables
let editingTaskId = null; //optional
let currentSort = 'date_created';
let currentOrder = 'asc';
let caseInsensitive = true;
let currentSection = 'tasks';

//  Section navigation

function showSection(name) {
  ['tasks', 'dashboard', 'about'].forEach((s) => {
    $(`section-${s}`).classList.toggle('hidden', s !== name);
  });
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    const active = btn.dataset.section === name;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });
  currentSection = name;
  if (name === 'dashboard') updateDashboard();
}

document
  .querySelectorAll('.nav-btn')
  .forEach((btn) =>
    btn.addEventListener('click', () => showSection(btn.dataset.section)),
  );

// ── Settings ──────────────────────────────────────────────
const cardWrap = $('card-wrapp');

function applySettings() {
  const s = getSettings();
  document.body.dataset.theme = s.theme || 'light';
  cardWrap.style.gridTemplateColumns = `repeat(${s.columns || 3}, 1fr)`;
  caseInsensitive = s.caseInsensitive !== false;
  const chk = $('settings-regex-flags');
  if (chk) chk.checked = caseInsensitive;
}

$('settings-btn').addEventListener('click', () => {
  const s = getSettings();
  $('settings-theme').value = s.theme || 'light'; // light for default value
  $('settings-columns').value = s.columns || '3'; // 3 for default value
  $('settings-regex-flags').checked = s.caseInsensitive !== false; // true for default value
  $('settings-modal').classList.remove('hidden'); // show modal/popup
  $('settings-close').focus();
});

function closeSettings() {
  $('settings-modal').classList.add('hidden');
  $('settings-btn').focus();
}
$('settings-close').addEventListener('click', closeSettings);
$('settings-cancel').addEventListener('click', closeSettings);
$('settings-modal').addEventListener('click', (e) => {
  if (e.target === $('settings-modal')) closeSettings();
});

$('settings-theme').addEventListener('change', () => {
  saveSettings({ theme: $('settings-theme').value });
  applySettings();
});
$('settings-columns').addEventListener('change', () => {
  saveSettings({ columns: $('settings-columns').value });
  applySettings();
});
$('settings-regex-flags').addEventListener('change', () => {
  caseInsensitive = $('settings-regex-flags').checked;
  saveSettings({ caseInsensitive });
  renderTasks();
});

// ── Export / Import ───────────────────────────────────────
$('btn-export').addEventListener('click', () => {
  exportJSON();
  announce('Tasks exported as JSON.');
});

$('btn-import').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  importJSON(
    file,
    (added, total) => {
      renderTasks();
      updateDashboard();
      $('import-status').textContent =
        `Imported ${added} new tasks (${total} valid in file).`;
      announce(`Imported ${added} new tasks.`);
    },
    (err) => {
      $('import-status').textContent = `Import failed: ${err}`;
      announce(`Import failed: ${err}`, true);
    },
  );
  e.target.value = ''; // reset so same file can be re-imported
});

// ── Sort dropdown ─────────────────────────────────────────
const sortTrigger = $('sort-trigger');
const sortPanel = $('sort-panel');

function openSortPanel() {
  sortPanel.classList.remove('hidden');
  sortTrigger.setAttribute('aria-expanded', 'true');
  sortPanel.querySelector('.sort-option.active')?.focus();
}

function closeSortPanel() {
  sortPanel.classList.add('hidden');
  sortTrigger.setAttribute('aria-expanded', 'false');
}

sortTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  sortPanel.classList.contains('hidden') ? openSortPanel() : closeSortPanel();
});

document.addEventListener('click', () => closeSortPanel());
sortPanel.addEventListener('click', (e) => e.stopPropagation());

// Keyboard navigation within sort panel
sortPanel.addEventListener('keydown', (e) => {
  const items = [...sortPanel.querySelectorAll('.sort-option, .order-btn')];
  const idx = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    items[(idx + 1) % items.length]?.focus();
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    items[(idx - 1 + items.length) % items.length]?.focus();
  }
  if (e.key === 'Escape') {
    closeSortPanel();
    sortTrigger.focus();
  }
});

document.querySelectorAll('.sort-option').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-option').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    currentSort = btn.dataset.value;
    renderTasks();
  });
});

document.querySelectorAll('.order-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-checked', 'true');
    currentOrder = btn.dataset.order;
    renderTasks();
  });
});

// ── Task Modal ────────────────────────────────────────────
function clearErrors() {
  document.querySelectorAll('.field-error').forEach((el) => {
    el.textContent = '';
    el.classList.add('hidden');
  });
  $('form-error').classList.add('hidden');
}

function showFieldError(id, msg) {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

function openModal(task = null) {
  editingTaskId = task?.id ?? null;
  $('modal-title').textContent = task ? 'Edit Task' : 'Add Task';
  $('form-title').value = task?.title ?? '';
  $('form-description').value = task?.description ?? '';
  $('form-tag').value = task?.tag ?? '';
  $('form-priority').value = task?.priority ?? 'medium';
  $('form-due-date').value = task?.dueDate ?? '';
  $('form-duration-hours').value = task?.durationHours ?? '';
  $('form-duration-minutes').value = task?.durationMinutes ?? '';
  clearErrors();
  $('task-modal').classList.remove('hidden');
  $('form-title').focus();
}

function closeModal() {
  $('task-modal').classList.add('hidden');
  editingTaskId = null;
  $('add-btn').focus();
}

$('modal-close').addEventListener('click', closeModal);
$('modal-cancel').addEventListener('click', closeModal);
$('task-modal').addEventListener('click', (e) => {
  if (e.target === $('task-modal')) closeModal();
});
$('modal-submit').addEventListener('click', submitForm);

// Trap focus inside modal
$('task-modal').addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const focusable = [
    ...$('task-modal').querySelectorAll(
      'button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((el) => !el.disabled);
  const first = focusable[0],
    last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

function submitForm() {
  clearErrors();
  let hasError = false;

  const title = $('form-title').value.trim();
  const titleErr = validateTitle(title);
  if (titleErr) {
    showFieldError('err-title', titleErr);
    hasError = true;
  }

  const tag = $('form-tag').value.trim();
  const tagErr = validateTag(tag);
  if (tagErr) {
    showFieldError('err-tag', tagErr);
    hasError = true;
  }

  const durH = $('form-duration-hours').value;
  const durM = $('form-duration-minutes').value;
  const durErr = validateDuration(durH, durM);
  if (durErr) {
    showFieldError('err-dur', durErr);
    hasError = true;
  }

  if (hasError) {
    announce('Form has errors. Please fix them before saving.', true);
    // focus first error field
    document
      .querySelector('.field-error:not(.hidden)')
      ?.previousElementSibling?.focus();
    return;
  }

  const fields = {
    title,
    description: $('form-description').value.trim(),
    tag: tag || null,
    priority: $('form-priority').value,
    dueDate: $('form-due-date').value || null,
    durationHours: parseInt(durH) || 0,
    durationMinutes: parseInt(durM) || 0,
    modified: Date.now(),
  };

  if (editingTaskId !== null) {
    const task = AppState.tasks.find((t) => t.id === editingTaskId);
    if (task) Object.assign(task, fields);
    announce(`Task "${title}" updated.`);
  } else {
    AppState.tasks.push({
      id: Date.now(),
      createdAt: Date.now(),
      done: false, // ← NEW
      ...fields,
    });
    announce(`Task "${title}" added.`);
  }

  closeModal();
  renderTasks();
  if (currentSection === 'dashboard') updateDashboard();
}

// ── Render tasks ──────────────────────────────────────────
const searchInput = $('search-input');

function renderTasks() {
  cardWrap.innerHTML = '';
  const { tasks, searchRe } = getFilteredTasks(
    searchInput.value,
    currentSort,
    currentOrder,
    caseInsensitive,
  );

  // Footer count
  $('footer-count').textContent =
    `${AppState.tasks.length} task${AppState.tasks.length !== 1 ? 's' : ''}`; // pluralize "task" based on count

  if (!tasks.length) {
    // show empty state when no tasks after filtering from search or no tasks at all
    cardWrap.innerHTML =
      '<p class="empty-msg" role="listitem">No tasks found. Click + to create one.</p>';
    return;
  }

  tasks.forEach((task) => {
    const priority = task.priority || 'medium'; // default to medium if not set
    const priorityLabel = { low: 'Low', medium: 'Medium', high: 'High' }[
      priority
    ];
    const createdStr = task.createdAt
      ? fmtDateTime(task.createdAt)
      : task.date || '';
    const modifiedStr = task.modified ? fmtDateTime(task.modified) : null;
    const showModified = modifiedStr && modifiedStr !== createdStr;
    const dueDateStr = task.dueDate ? fmtDateTime(task.dueDate) : null;
    const durParts = [
      task.durationHours ? `${task.durationHours}h` : '',
      task.durationMinutes ? `${task.durationMinutes}m` : '',
    ].filter(Boolean); // return array with only non-empty values, so if durationHours is 0, it won't show "0h"
    const durationStr = durParts.length ? durParts.join(' ') : null;

    // Apply regex highlight to title, description, tag
    const re = searchRe ? new RegExp(searchRe.source, searchRe.flags) : null;
    const titleHtml = highlight(task.title, re);
    const descHtml = task.description ? highlight(task.description, re) : null;
    const tagHtml = task.tag ? highlight(task.tag, re) : null;

    const article = document.createElement('article');
    article.className = `card priority-border-${priority} ${task.done ? 'card-done' : ''}`;
    article.dataset.id = task.id;
    article.setAttribute('role', 'listitem');
    article.setAttribute(
      'aria-label',
      `Task: ${task.title}, priority ${priorityLabel}${task.done ? ', completed' : ''}`,
    );

    article.innerHTML = `
      <div class="card-header">
        <label class="checkbox-label">
          <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} aria-label="Mark ${escapeHtml(task.title)} as ${task.done ? 'incomplete' : 'complete'}" />
          <h3 class="${task.done ? 'task-done-text' : ''}">${titleHtml}</h3>
        </label>
        <span class="priority-badge priority-${priority}" aria-label="Priority: ${priorityLabel}">${priorityLabel}</span>
      </div>
      <p class="task-date"><time datetime="${task.createdAt || ''}" >Created: ${createdStr}</time></p>
      ${showModified ? `<p class="task-date">Modified: ${modifiedStr}</p>` : ''}
      ${tagHtml ? `<p class="task-tag"><span aria-label="Tag">🏷</span> ${tagHtml}</p>` : ''}
      ${descHtml ? `<p class="task-description">${descHtml}</p>` : ''}
      ${dueDateStr ? `<p class="task-due"><span aria-hidden="true">⏰</span> Due: ${dueDateStr}</p>` : ''}
      ${durationStr ? `<p class="task-duration"><span aria-hidden="true">⏱</span> Duration: ${durationStr}</p>` : ''}
      <div class="card-actions">
        <button class="edit-btn"   aria-label="Edit task: ${escapeHtml(task.title)}">Edit</button>
        <button class="delete-btn" aria-label="Delete task: ${escapeHtml(task.title)}">Delete</button>
      </div>`;

    article.querySelector('.task-checkbox').addEventListener('change', (e) => {
      task.done = e.target.checked;
      task.modified = Date.now();
      announce(
        `Task "${task.title}" marked as ${task.done ? 'complete' : 'incomplete'}.`,
      );
      renderTasks();
      if (currentSection === 'dashboard') updateDashboard();
    });

    article.querySelector('.edit-btn').addEventListener('click', () => {
      const t = AppState.tasks.find((t) => t.id === task.id);
      if (t) openModal(t);
    });

    article.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm(`Delete "${task.title}"?`)) {
        AppState.tasks = AppState.tasks.filter((t) => t.id !== task.id);
        announce(`Task "${task.title}" deleted.`);
        renderTasks();
        if (currentSection === 'dashboard') updateDashboard();
      }
    });

    cardWrap.appendChild(article);
  });

  saveTasks();
  updateCapStatus();
}

// ── Cap / Target ──────────────────────────────────────────
function updateCapStatus() {
  const cap = parseInt($('cap-input')?.value) || 10;
  const open = AppState.tasks.filter((t) => !t.done).length;
  const el = $('cap-status');
  if (!el) return;
  if (open > cap) {
    el.textContent = `⚠ Over limit: ${open}/${cap} tasks (${open - cap} over).`;
    el.className = 'cap-over';
    el.setAttribute('aria-live', 'assertive');
    announce(
      `Warning: you have ${open - cap} tasks over your cap of ${cap}.`,
      true,
    );
  } else {
    el.textContent = `${open}/${cap} tasks — ${cap - open} remaining.`;
    el.className = 'cap-ok';
    el.setAttribute('aria-live', 'polite');
  }
}

$('cap-input')?.addEventListener('input', updateCapStatus);

// ── Dashboard ─────────────────────────────────────────────
function updateDashboard() {
  const tasks = AppState.tasks;
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  $('stat-total').textContent = tasks.length;
  $('stat-high').textContent = open.filter((t) => t.priority === 'high').length;

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  $('stat-week').textContent = open.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) >= new Date() &&
      new Date(t.dueDate) <= new Date(now + weekMs),
  ).length;
  $('stat-done').textContent = done.length;

  // Trend chart — last 7 days
  const chart = $('trend-chart');
  chart.innerHTML = '';
  const days = 7;
  const counts = Array(days).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  tasks.forEach((t) => {
    const created = new Date(t.createdAt || t.id);
    const diffDay = Math.floor((today - created) / (24 * 60 * 60 * 1000));
    if (diffDay >= 0 && diffDay < days) counts[days - 1 - diffDay]++;
  });

  const max = Math.max(...counts, 1);
  counts.forEach((count, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const label = d.toLocaleDateString([], { weekday: 'short' });

    const col = document.createElement('div');
    col.className = 'chart-col';
    col.innerHTML = `
      <div class="chart-bar-wrap">
        <span class="chart-count" aria-hidden="true">${count}</span>
        <div class="chart-bar" style="height:${Math.round((count / max) * 100)}%"
             role="img" aria-label="${label}: ${count} task${count !== 1 ? 's' : ''}"></div>
      </div>
      <span class="chart-label">${label}</span>`;
    chart.appendChild(col);
  });

  updateCapStatus();
}

// ── Search ────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  const q = searchInput.value;
  const re = compileRegex(q);
  if (q && !re) {
    searchInput.setAttribute('aria-invalid', 'true');
    announce('Invalid regex pattern.', true);
  } else {
    searchInput.removeAttribute('aria-invalid');
  }
  renderTasks();
});

// ── Global keyboard shortcuts ─────────────────────────────
document.addEventListener('keydown', (e) => {
  const tag = document.activeElement?.tagName?.toLowerCase();
  const inInput = ['input', 'textarea', 'select'].includes(tag);
  if (e.key === 'Escape') {
    if (!$('task-modal').classList.contains('hidden')) {
      closeModal();
      return;
    }
    if (!$('settings-modal').classList.contains('hidden')) {
      closeSettings();
      return;
    }
    if (!sortPanel.classList.contains('hidden')) {
      closeSortPanel();
      sortTrigger.focus();
      return;
    }
  }
  if (!inInput) {
    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      openModal();
    }
    if (e.key === '/') {
      e.preventDefault();
      searchInput.focus();
    }
  }
});

// ── Add button ────────────────────────────────────────────
$('add-btn').addEventListener('click', () => openModal());

// ── Burger (mobile nav toggle) ────────────────────────────
$('burger').addEventListener('click', () => {
  const nav = $('main-nav');
  const expanded = $('burger').getAttribute('aria-expanded') === 'true';
  $('burger').setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('nav-open', !expanded);
});

// ── Init ──────────────────────────────────────────────────
loadTasks();
applySettings();
renderTasks();
