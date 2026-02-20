const cardWrap = document.getElementById('card-wrapp');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

// Modal elements
const modal = document.getElementById('task-modal');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.getElementById('modal-close');
const modalCancel = document.getElementById('modal-cancel');
const modalSubmit = document.getElementById('modal-submit');
const formTitle = document.getElementById('form-title');
const formDescription = document.getElementById('form-description');
const formDate = document.getElementById('form-date');
const formError = document.getElementById('form-error');
const addBtn = document.getElementById('add-btn');

let editingTaskId = null;

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function openModal(task = null) {
  editingTaskId = task ? task.id : null;
  modalTitle.textContent = task ? 'Edit Task' : 'Add Task';
  formTitle.value = task ? task.title : '';
  formDescription.value = task ? task.description || '' : '';
  formDate.value = task ? task.date || '' : '';
  formError.classList.add('hidden');
  modal.classList.remove('hidden');
  formTitle.focus();
}

function closeModal() {
  modal.classList.add('hidden');
  editingTaskId = null;
}

function submitForm() {
  const title = formTitle.value.trim();

  if (!isValidTask(title)) {
    formError.classList.remove('hidden');
    formTitle.focus();
    return;
  }

  formError.classList.add('hidden');

  if (editingTaskId !== null) {
    // Edit existing (will implement in next commit)
  } else {
    // Add new
    AppState.tasks.push({
      id: Date.now(),
      title,
      description: formDescription.value.trim(),
      date: formDate.value || null,
      createdAt: Date.now(),
      modified: Date.now(),
    });
  }

  closeModal();
  renderTasks();
}

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modalSubmit.addEventListener('click', submitForm);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
addBtn.addEventListener('click', () => openModal());

function renderTasks() {
  const searchText = searchInput.value;
  const sortType = sortSelect.value;
  const { tasks } = getFilteredTasks(searchText, sortType, 'asc');

  cardWrap.innerHTML = '';

  if (!tasks.length) {
    cardWrap.innerHTML = '<p class="empty-msg">No tasks found.</p>';
    return;
  }

  tasks.forEach((task) => {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.id = task.id;
    div.innerHTML = `
      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description || '')}</p>
      <p>Due: ${task.date || 'No due date'}</p>
    `;
    cardWrap.appendChild(div);
  });

  saveTasks();
}

searchInput.addEventListener('input', renderTasks);
sortSelect.addEventListener('change', renderTasks);

loadTasks();
renderTasks();
