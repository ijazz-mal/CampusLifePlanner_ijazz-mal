const STORAGE_KEY = 'clp:tasks';
const SETTINGS_KEY = 'clp:settings';

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.tasks));
}

function loadTasks() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) AppState.tasks = JSON.parse(data);
}

function getSettings() {
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
}

function saveSettings(patch) {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ ...getSettings(), ...patch }),
  );
}
