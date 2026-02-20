const cardWrap = document.getElementById('card-wrapp');
const searchInput = document.getElementById('search-input');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function renderTasks() {
  const searchText = searchInput.value;
  const { tasks } = getFilteredTasks(searchText, '', '');

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
}

searchInput.addEventListener('input', renderTasks);

loadTasks(); //initialize
renderTasks();
