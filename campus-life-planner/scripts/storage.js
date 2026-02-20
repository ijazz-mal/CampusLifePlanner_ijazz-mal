const STORAGE_KEY = 'clp:tasks';
const SETTINGS_KEY = 'clp:settings';

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) AppState.tasks = parsed;
  } catch (e) {
    console.warn('Corrupt task data, resetting.', e);
    AppState.tasks = [];
  }
}

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveSettings(patch) {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({ ...getSettings(), ...patch }),
  );
}
