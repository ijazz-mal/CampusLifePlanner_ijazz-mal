function getFilteredTasks(searchText, sortType, sortOrder) {
  let tasks = [...AppState.tasks];

  // Filter by search
  if (searchText) {
    const query = searchText.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        (t.description || '').toLowerCase().includes(query),
    );
  }

  return { tasks, searchRe: null };
}
