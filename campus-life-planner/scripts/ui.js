const cardWrap = document.getElementById('card-wrapp');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function renderTasks() {
  cardWrap.innerHTML = '';

  if (!AppState.tasks.length) {
    cardWrap.innerHTML =
      '<p class="empty-msg">No tasks yet. Click "add +" to create one!</p>';
    return;
  }

  AppState.tasks.forEach((task) => {
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

loadTasks(); //initialize
renderTasks();
