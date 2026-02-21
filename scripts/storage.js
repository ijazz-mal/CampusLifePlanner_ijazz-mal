//Keys for localStorage
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

// JSON Export
function exportJSON() {
  const blob = new Blob([JSON.stringify(AppState.tasks, null, 2)], {
    type: 'application/json',
  });
  const d = document.createElement('a'); // d for download and an object of type anchor
  d.href = URL.createObjectURL(blob); // creates a temporary URL for the blob(the file container) and assigns it to the href of the anchor
  d.download = 'campus-life-planner-tasks.json';
  d.click(); // force event click to trigger download
  URL.revokeObjectURL(d.href); // clean up the temporary URL after download
}

// JSON Import
function importJSON(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('Root must be an array.');
      const valid = data.filter(validateRecord);
      if (!valid.length) throw new Error('No valid records found.');
      // Merge — skip duplicates by id
      const existingIds = new Set(AppState.tasks.map((t) => t.id));
      const newTasks = valid.filter((t) => !existingIds.has(t.id));
      AppState.tasks = [...AppState.tasks, ...newTasks];
      saveTasks();
      onSuccess(newTasks.length, valid.length);
    } catch (err) {
      onError(err.message);
    }
  };
  reader.readAsText(file);
}

// Validates a single record has the minimum required shape
function validateRecord(importedRecord) {
  return (
    importedRecord &&
    typeof importedRecord === 'object' &&
    (typeof importedRecord.id === 'number' ||
      typeof importedRecord.id === 'string') &&
    typeof importedRecord.title === 'string' &&
    importedRecord.title.trim().length > 0
  );
}
