function getFilteredTasks(searchText, sortType, sortOrder = 'asc') {
  let tasks = [...AppState.tasks];

  // Filter
  if (searchText) {
    const query = searchText.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.description || '').toLowerCase().includes(query),
    );
  }

  // Sort
  switch (sortType) {
    case 'date_added':
      tasks.sort((a, b) => a.id - b.id);
      break;
    case 'date_modified':
      tasks.sort((a, b) => (a.modified || a.id) - (b.modified || b.id));
      break;
    case 'a_to_z':
      tasks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'due_date':
      tasks.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
      });
      break;
  }

  if (sortOrder === 'desc') tasks.reverse();

  return { tasks, searchRe: null };
}
