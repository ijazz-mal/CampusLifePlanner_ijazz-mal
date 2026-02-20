// Highlight search result with regex
function highlight(text, re) {
  if (!re) return escapeHtml(text);
  return escapeHtml(text).replace(re, function (m) {
    return `<mark>${m}</mark>`;
  });
}

// Filter and sort
function getFilteredTasks(
  searchText,
  sortType,
  sortOrder,
  caseInsensitive = true,
) {
  let tasks = [...AppState.tasks];
  let searchRe = null;

  if (searchText) {
    const flags = caseInsensitive ? 'gi' : 'g';
    searchRe = compileRegex(searchText, flags);
    if (searchRe) {
      tasks = tasks.filter(
        (t) =>
          searchRe.test(t.title) ||
          searchRe.test(t.description || '') ||
          searchRe.test(t.tag || ''),
      );
      // Reset lastIndex after test() calls to avoid skipping matches
      searchRe.lastIndex = 0;
    } else {
      // Invalid regex fallback: simple substring search
      const q = searchText.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q) ||
          (t.tag || '').toLowerCase().includes(q),
      );
    }
  }

  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

  switch (sortType) {
    case 'date_created':
      tasks.sort((x, y) => x.id - y.id);
      break;
    case 'date_modified':
      tasks.sort((x, y) => (x.modified || x.id) - (y.modified || y.id));
      break;
    case 'a_to_z':
      tasks.sort((x, y) => x.title.localeCompare(y.title));
      break;
    case 'priority':
      tasks.sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority || 'medium'] ?? 1) -
          (PRIORITY_ORDER[b.priority || 'medium'] ?? 1),
      );
      break;
    case 'due_date':
      tasks.sort((x, y) => {
        if (!x.dueDate && !y.dueDate) return 0;
        if (!x.dueDate) return 1;
        if (!y.dueDate) return -1;
        return new Date(x.dueDate) - new Date(y.dueDate);
      });
      break;
  }
  // Reverse if descending
  if (sortOrder === 'desc') tasks.reverse();
  return { tasks, searchRe };
}
