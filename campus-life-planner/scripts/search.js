function getFilteredTasks(searchText, sortType, sortOrder) {
  let tasks = [...AppState.tasks];
  return { tasks, searchRe: null };
}
