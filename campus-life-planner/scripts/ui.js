// ══════════════════════════════════════════════════════════
// CAMPUS LIFE PLANNER - USER INTERFACE CONTROLLER
// ══════════════════════════════════════════════════════════
// This file handles all DOM manipulation, user interactions,
// animations, and visual updates for the application.

// ── Helper Functions ──────────────────────────────────────

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} userTextInput - Raw text from user
 * @returns {string} - HTML-safe escaped string
 */
function escapeHtmlCharacters(userTextInput) {
  const temporaryDiv = document.createElement('div');
  temporaryDiv.textContent = userTextInput || '';
  return temporaryDiv.innerHTML;
}

/**
 * Formats timestamp into human-readable date and time
 * @param {number|string} timestamp - Unix timestamp or ISO string
 * @returns {string} - Formatted date string (e.g., "Feb 20, 2026, 3:30 PM")
 */
function formatDateTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Announces messages to screen readers via ARIA live regions
 * @param {string} messageText - Message to announce
 * @param {boolean} isUrgent - If true, uses assertive live region
 */
function announceToScreenReader(messageText, isUrgent = false) {
  const liveRegionElement = document.getElementById(
    isUrgent ? 'live-assertive' : 'live-status',
  );
  liveRegionElement.textContent = '';
  requestAnimationFrame(() => {
    liveRegionElement.textContent = messageText;
  });
}

/**
 * Shorthand for document.getElementById
 * @param {string} elementId - Element ID
 * @returns {HTMLElement} - The DOM element
 */
function getElement(elementId) {
  return document.getElementById(elementId);
}

// ── Application State Variables ───────────────────────────

// Currently editing task ID (null when adding new task)
let currentlyEditingTaskId = null;

// Current sort configuration
let currentSortMethod = 'date_created';
let currentSortDirection = 'asc';

// Search settings
let isSearchCaseInsensitive = true;

// Currently visible section
let currentlyVisibleSection = 'tasks';

// ── Settings Tab Management ───────────────────────────────

const settingsTabs = document.querySelectorAll('.settings-tab');
const settingsTabContents = document.querySelectorAll('.tab-content');

settingsTabs.forEach((tabButton) => {
  tabButton.addEventListener('click', () => {
    const targetTabName = tabButton.dataset.tab;

    // Update active tab button
    settingsTabs.forEach((tab) => tab.classList.remove('active'));
    tabButton.classList.add('active');

    // Show corresponding tab content
    settingsTabContents.forEach((tabContentElement) => {
      const isTargetTab = tabContentElement.id === `tab-${targetTabName}`;
      tabContentElement.classList.toggle('hidden', !isTargetTab);
      tabContentElement.classList.toggle('active', isTargetTab);
    });
  });
});

// ── Section Navigation ────────────────────────────────────

/**
 * Shows specified section and hides others
 * @param {string} sectionName - Name of section to show ('tasks' or 'dashboard')
 */
function showSection(sectionName) {
  const allSections = ['tasks', 'dashboard'];

  allSections.forEach((section) => {
    const sectionElement = getElement(`section-${section}`);
    const shouldShow = section === sectionName;
    sectionElement.classList.toggle('hidden', !shouldShow);

    // Add smooth fade-in animation when showing
    if (shouldShow) {
      sectionElement.style.animation = 'fadeIn 0.3s ease-in-out';
    }
  });

  // Update navigation buttons
  document.querySelectorAll('.nav-btn').forEach((navButton) => {
    const isActiveButton = navButton.dataset.section === sectionName;
    navButton.classList.toggle('active', isActiveButton);
    navButton.setAttribute('aria-current', isActiveButton ? 'page' : 'false');
  });

  currentlyVisibleSection = sectionName;

  // Update dashboard when showing it
  if (sectionName === 'dashboard') {
    updateDashboardDisplay();
  }
}

// Wire up navigation buttons
document.querySelectorAll('.nav-btn').forEach((navButton) => {
  navButton.addEventListener('click', () => {
    showSection(navButton.dataset.section);
  });
});

// ── Settings Management ───────────────────────────────────

const taskCardsContainer = getElement('card-wrapp');

/**
 * Applies saved user preferences (theme, columns, etc.)
 */
function applyUserSettings() {
  const userSettings = getSettings();

  // Apply theme
  document.body.dataset.theme = userSettings.theme || 'light';

  // Apply column count
  const columnCount = userSettings.columns || 3;
  taskCardsContainer.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;

  // Apply search preferences
  isSearchCaseInsensitive = userSettings.caseInsensitive !== false;
  const searchFlagsCheckbox = getElement('settings-regex-flags');
  if (searchFlagsCheckbox) {
    searchFlagsCheckbox.checked = isSearchCaseInsensitive;
  }
}

// Settings button - open modal
getElement('settings-btn').addEventListener('click', () => {
  const userSettings = getSettings();
  getElement('settings-theme').value = userSettings.theme || 'light';
  getElement('settings-columns').value = userSettings.columns || '3';
  getElement('settings-regex-flags').checked =
    userSettings.caseInsensitive !== false;
  getElement('settings-modal').classList.remove('hidden');
  getElement('settings-close').focus();
});

// Close settings modal
function closeSettingsModal() {
  getElement('settings-modal').classList.add('hidden');
  getElement('settings-btn').focus();
}

getElement('settings-close').addEventListener('click', closeSettingsModal);
getElement('settings-cancel').addEventListener('click', closeSettingsModal);
getElement('settings-modal').addEventListener('click', (event) => {
  if (event.target === getElement('settings-modal')) {
    closeSettingsModal();
  }
});

// Theme change
getElement('settings-theme').addEventListener('change', () => {
  saveSettings({ theme: getElement('settings-theme').value });
  applyUserSettings();
  announceToScreenReader('Theme updated');
});

// Column count change
getElement('settings-columns').addEventListener('change', () => {
  saveSettings({ columns: getElement('settings-columns').value });
  applyUserSettings();
});

// Search case sensitivity
getElement('settings-regex-flags').addEventListener('change', () => {
  isSearchCaseInsensitive = getElement('settings-regex-flags').checked;
  saveSettings({ caseInsensitive: isSearchCaseInsensitive });
  renderAllTasks();
});

// ── JSON Import/Export ────────────────────────────────────

getElement('btn-export').addEventListener('click', () => {
  exportJSON();
  announceToScreenReader('Tasks exported as JSON file.');
});

getElement('btn-import').addEventListener('change', (event) => {
  const selectedFile = event.target.files[0];
  if (!selectedFile) return;

  importJSON(
    selectedFile,
    (numberOfNewTasks, totalValidTasks) => {
      renderAllTasks();
      updateDashboardDisplay();
      getElement('import-status').textContent =
        `Successfully imported ${numberOfNewTasks} new tasks (${totalValidTasks} valid in file).`;
      announceToScreenReader(`Imported ${numberOfNewTasks} new tasks.`);
    },
    (errorMessage) => {
      getElement('import-status').textContent =
        `Import failed: ${errorMessage}`;
      announceToScreenReader(`Import failed: ${errorMessage}`, true);
    },
  );

  event.target.value = ''; // Reset so same file can be re-imported
});

// ── Sort Dropdown Management ──────────────────────────────

const sortTriggerButton = getElement('sort-trigger');
const sortPanelElement = getElement('sort-panel');

function openSortPanel() {
  sortPanelElement.classList.remove('hidden');
  sortTriggerButton.setAttribute('aria-expanded', 'true');
  sortPanelElement.querySelector('.sort-option.active')?.focus();
}

function closeSortPanel() {
  sortPanelElement.classList.add('hidden');
  sortTriggerButton.setAttribute('aria-expanded', 'false');
}

// Toggle sort panel on click
sortTriggerButton.addEventListener('click', (event) => {
  event.stopPropagation();
  const isCurrentlyOpen = !sortPanelElement.classList.contains('hidden');
  isCurrentlyOpen ? closeSortPanel() : openSortPanel();
});

// Close sort panel when clicking outside
document.addEventListener('click', () => closeSortPanel());

// Prevent clicks inside panel from closing it
sortPanelElement.addEventListener('click', (event) => event.stopPropagation());

// Keyboard navigation within sort panel (arrow keys)
sortPanelElement.addEventListener('keydown', (event) => {
  const allSortItems = [
    ...sortPanelElement.querySelectorAll('.sort-option, .order-btn'),
  ];
  const currentItemIndex = allSortItems.indexOf(document.activeElement);

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    const nextIndex = (currentItemIndex + 1) % allSortItems.length;
    allSortItems[nextIndex]?.focus();
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    const previousIndex =
      (currentItemIndex - 1 + allSortItems.length) % allSortItems.length;
    allSortItems[previousIndex]?.focus();
  }

  if (event.key === 'Escape') {
    closeSortPanel();
    sortTriggerButton.focus();
  }
});

// Sort option selection
document.querySelectorAll('.sort-option').forEach((sortOptionButton) => {
  sortOptionButton.addEventListener('click', () => {
    // Update active state
    document.querySelectorAll('.sort-option').forEach((button) => {
      button.classList.remove('active');
      button.setAttribute('aria-checked', 'false');
    });
    sortOptionButton.classList.add('active');
    sortOptionButton.setAttribute('aria-checked', 'true');

    currentSortMethod = sortOptionButton.dataset.value;
    renderAllTasks();
  });
});

// Sort direction selection
document.querySelectorAll('.order-btn').forEach((orderButton) => {
  orderButton.addEventListener('click', () => {
    // Update active state
    document.querySelectorAll('.order-btn').forEach((button) => {
      button.classList.remove('active');
      button.setAttribute('aria-checked', 'false');
    });
    orderButton.classList.add('active');
    orderButton.setAttribute('aria-checked', 'true');

    currentSortDirection = orderButton.dataset.order;
    renderAllTasks();
  });
});

// ── Task Modal Management ─────────────────────────────────

/**
 * Clears all error messages in the form
 */
function clearAllFormErrors() {
  document.querySelectorAll('.field-error').forEach((errorElement) => {
    errorElement.textContent = '';
    errorElement.classList.add('hidden');
  });
  getElement('form-error').classList.add('hidden');
}

/**
 * Displays error message for a specific field
 * @param {string} errorElementId - ID of the error span element
 * @param {string} errorMessage - Error message to display
 */
function showFieldErrorMessage(errorElementId, errorMessage) {
  const errorElement = getElement(errorElementId);
  if (!errorElement) return;
  errorElement.textContent = errorMessage;
  errorElement.classList.remove('hidden');
}

/**
 * Opens task modal for adding or editing
 * @param {Object} existingTask - Task object if editing, null if adding new
 */
function openTaskModal(existingTask = null) {
  currentlyEditingTaskId = existingTask?.id ?? null;

  // Update modal title
  getElement('modal-title').textContent = existingTask
    ? 'Edit Task'
    : 'Add Task';

  // Populate form fields
  getElement('form-title').value = existingTask?.title ?? '';
  getElement('form-description').value = existingTask?.description ?? '';
  getElement('form-tag').value = existingTask?.tag ?? '';
  getElement('form-priority').value = existingTask?.priority ?? 'medium';
  getElement('form-due-date').value = existingTask?.dueDate ?? '';
  getElement('form-duration-hours').value = existingTask?.durationHours ?? '';
  getElement('form-duration-minutes').value =
    existingTask?.durationMinutes ?? '';

  clearAllFormErrors();

  getElement('task-modal').classList.remove('hidden');
  getElement('form-title').focus();
}

/**
 * Closes the task modal
 */
function closeTaskModal() {
  getElement('task-modal').classList.add('hidden');
  currentlyEditingTaskId = null;
  getElement('add-btn').focus();
}

getElement('modal-close').addEventListener('click', closeTaskModal);
getElement('modal-cancel').addEventListener('click', closeTaskModal);
getElement('task-modal').addEventListener('click', (event) => {
  if (event.target === getElement('task-modal')) {
    closeTaskModal();
  }
});
getElement('modal-submit').addEventListener('click', submitTaskForm);

// Focus trap inside modal (for accessibility)
getElement('task-modal').addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;

  const allFocusableElements = [
    ...getElement('task-modal').querySelectorAll(
      'button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => !element.disabled);

  const firstFocusable = allFocusableElements[0];
  const lastFocusable = allFocusableElements[allFocusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstFocusable) {
    event.preventDefault();
    lastFocusable.focus();
  } else if (!event.shiftKey && document.activeElement === lastFocusable) {
    event.preventDefault();
    firstFocusable.focus();
  }
});

/**
 * Handles form submission for adding/editing tasks
 */
function submitTaskForm() {
  clearAllFormErrors();
  let formHasErrors = false;

  // Validate title
  const taskTitle = getElement('form-title').value.trim();
  const titleError = validateTitle(taskTitle);
  if (titleError) {
    showFieldErrorMessage('err-title', titleError);
    formHasErrors = true;
  }

  // Validate category (now a select dropdown)
  const selectedCategory = getElement('form-tag').value;
  const categoryError = validateCategory(selectedCategory);
  if (categoryError) {
    showFieldErrorMessage('err-tag', categoryError);
    formHasErrors = true;
  }

  // Validate duration
  const durationHours = getElement('form-duration-hours').value;
  const durationMinutes = getElement('form-duration-minutes').value;
  const durationError = validateDuration(durationHours, durationMinutes);
  if (durationError) {
    showFieldErrorMessage('err-dur', durationError);
    formHasErrors = true;
  }

  if (formHasErrors) {
    announceToScreenReader(
      'Form has errors. Please fix them before saving.',
      true,
    );
    // Focus first error field
    document
      .querySelector('.field-error:not(.hidden)')
      ?.previousElementSibling?.focus();
    return;
  }

  // ── SQL Injection Protection (Defense in Depth) ──
  // Sanitize all text inputs as a security best practice
  const sanitizedTitle = sanitizeAgainstSqlInjection(taskTitle);
  const sanitizedDescription = sanitizeAgainstSqlInjection(
    getElement('form-description').value.trim(),
  );
  const sanitizedCategory = sanitizeAgainstSqlInjection(selectedCategory);

  const taskFields = {
    title: sanitizedTitle,
    description: sanitizedDescription,
    tag: sanitizedCategory || null,
    priority: getElement('form-priority').value,
    dueDate: getElement('form-due-date').value || null,
    durationHours: parseInt(durationHours) || 0,
    durationMinutes: parseInt(durationMinutes) || 0,
    modified: Date.now(),
  };

  if (currentlyEditingTaskId !== null) {
    // Editing existing task
    const existingTask = AppState.tasks.find(
      (task) => task.id === currentlyEditingTaskId,
    );
    if (existingTask) {
      Object.assign(existingTask, taskFields);
    }
    announceToScreenReader(`Task "${sanitizedTitle}" updated.`);
  } else {
    // Creating new task
    AppState.tasks.push({
      id: Date.now(),
      createdAt: Date.now(),
      done: false,
      ...taskFields,
    });
    announceToScreenReader(`Task "${sanitizedTitle}" added.`);
  }

  closeTaskModal();
  renderAllTasks();

  if (currentlyVisibleSection === 'dashboard') {
    updateDashboardDisplay();
  }
}

// ── Task Rendering ────────────────────────────────────────

const searchInputElement = getElement('search-input');

/**
 * Renders all tasks to the DOM with current filters and sorting
 */
function renderAllTasks() {
  taskCardsContainer.innerHTML = '';

  const searchQuery = searchInputElement.value;
  const { tasks: filteredTasks, searchRe: searchRegex } = getFilteredTasks(
    searchQuery,
    currentSortMethod,
    currentSortDirection,
    isSearchCaseInsensitive,
  );

  // Show empty state if no tasks
  if (!filteredTasks.length) {
    taskCardsContainer.innerHTML =
      '<p class="empty-msg" role="listitem">No tasks found. Press <kbd>N</kbd> or click <span class="plus-icon">+</span> to create one.</p>';
    return;
  }

  // Render each task card
  filteredTasks.forEach((taskData) => {
    const taskPriority = taskData.priority || 'medium';
    const priorityLabels = { low: 'Low', medium: 'Medium', high: 'High' };
    const priorityLabel = priorityLabels[taskPriority];

    const createdDateString = taskData.createdAt
      ? formatDateTime(taskData.createdAt)
      : taskData.date || '';
    const modifiedDateString = taskData.modified
      ? formatDateTime(taskData.modified)
      : null;
    const shouldShowModified =
      modifiedDateString && modifiedDateString !== createdDateString;
    const dueDateString = taskData.dueDate
      ? formatDateTime(taskData.dueDate)
      : null;

    // Format duration
    const durationParts = [
      taskData.durationHours ? `${taskData.durationHours}h` : '',
      taskData.durationMinutes ? `${taskData.durationMinutes}m` : '',
    ].filter(Boolean);
    const durationString = durationParts.length
      ? durationParts.join(' ')
      : null;

    // Apply regex highlighting
    const highlightRegex = searchRegex
      ? new RegExp(searchRegex.source, searchRegex.flags)
      : null;
    const highlightedTitle = highlight(taskData.title, highlightRegex);
    const highlightedDescription = taskData.description
      ? highlight(taskData.description, highlightRegex)
      : null;
    const highlightedTag = taskData.tag
      ? highlight(taskData.tag, highlightRegex)
      : null;

    // Create task card
    const taskCard = document.createElement('article');
    taskCard.className = `card priority-border-${taskPriority} ${taskData.done ? 'card-done' : ''}`;
    taskCard.dataset.id = taskData.id;
    taskCard.setAttribute('role', 'listitem');
    taskCard.setAttribute(
      'aria-label',
      `Task: ${taskData.title}, priority ${priorityLabel}${taskData.done ? ', completed' : ''}`,
    );

    taskCard.innerHTML = `
      <div class="card-header">
        <label class="checkbox-label">
          <input type="checkbox" class="task-checkbox" ${taskData.done ? 'checked' : ''} 
                 aria-label="Mark ${escapeHtmlCharacters(taskData.title)} as ${taskData.done ? 'incomplete' : 'complete'}" />
          <h3 class="${taskData.done ? 'task-done-text' : ''}">${highlightedTitle}</h3>
        </label>
        <span class="priority-badge priority-${taskPriority}" aria-label="Priority: ${priorityLabel}">${priorityLabel}</span>
      </div>
      <p class="task-date"><time datetime="${taskData.createdAt || ''}">Created: ${createdDateString}</time></p>
      ${shouldShowModified ? `<p class="task-date">Modified: ${modifiedDateString}</p>` : ''}
      ${highlightedTag ? `<p class="task-tag">${highlightedTag}</p>` : ''}
      ${highlightedDescription ? `<p class="task-description">${highlightedDescription}</p>` : ''}
      ${dueDateString ? `<p class="task-due">Due: ${dueDateString}</p>` : ''}
      ${durationString ? `<p class="task-duration">Duration: ${durationString}</p>` : ''}
      <div class="card-actions">
        <button class="edit-btn" aria-label="Edit task: ${escapeHtmlCharacters(taskData.title)}">Edit</button>
        <button class="delete-btn" aria-label="Delete task: ${escapeHtmlCharacters(taskData.title)}">Delete</button>
      </div>
    `;

    // Wire up checkbox
    taskCard
      .querySelector('.task-checkbox')
      .addEventListener('change', (event) => {
        taskData.done = event.target.checked;
        taskData.modified = Date.now();
        announceToScreenReader(
          `Task "${taskData.title}" marked as ${taskData.done ? 'complete' : 'incomplete'}.`,
        );
        renderAllTasks();
        if (currentlyVisibleSection === 'dashboard') {
          updateDashboardDisplay();
        }
      });

    // Wire up edit button
    taskCard.querySelector('.edit-btn').addEventListener('click', () => {
      const taskToEdit = AppState.tasks.find((task) => task.id === taskData.id);
      if (taskToEdit) openTaskModal(taskToEdit);
    });

    // Wire up delete button
    taskCard.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm(`Delete "${taskData.title}"?`)) {
        AppState.tasks = AppState.tasks.filter(
          (task) => task.id !== taskData.id,
        );
        announceToScreenReader(`Task "${taskData.title}" deleted.`);
        renderAllTasks();
        if (currentlyVisibleSection === 'dashboard') {
          updateDashboardDisplay();
        }
      }
    });

    taskCardsContainer.appendChild(taskCard);
  });

  saveTasks();
  updateCapacityStatus();
}

// ── Task Capacity Management ──────────────────────────────

/**
 * Updates the task capacity status message
 */
function updateCapacityStatus() {
  const maxCapacity = parseInt(getElement('cap-input')?.value) || 10;
  const openTaskCount = AppState.tasks.filter((task) => !task.done).length;
  const capacityElement = getElement('cap-status');

  if (!capacityElement) return;

  if (openTaskCount > maxCapacity) {
    const overageAmount = openTaskCount - maxCapacity;
    capacityElement.textContent = `⚠ Over limit: ${openTaskCount}/${maxCapacity} open tasks (${overageAmount} over).`;
    capacityElement.className = 'cap-over';
    capacityElement.setAttribute('aria-live', 'assertive');
    announceToScreenReader(
      `Warning: you have ${overageAmount} tasks over your capacity of ${maxCapacity}.`,
      true,
    );
  } else {
    const remainingCapacity = maxCapacity - openTaskCount;
    capacityElement.textContent = `${openTaskCount}/${maxCapacity} open tasks — ${remainingCapacity} remaining.`;
    capacityElement.className = 'cap-ok';
    capacityElement.setAttribute('aria-live', 'polite');
  }
}

getElement('cap-input')?.addEventListener('input', updateCapacityStatus);

// ── Dashboard Display ─────────────────────────────────────

/**
 * Updates all dashboard statistics and charts
 */
function updateDashboardDisplay() {
  const allTasks = AppState.tasks;
  const openTasks = allTasks.filter((task) => !task.done);
  const completedTasks = allTasks.filter((task) => task.done);

  // Basic stats
  getElement('stat-total').textContent = allTasks.length;
  getElement('stat-high').textContent = openTasks.filter(
    (task) => task.priority === 'high',
  ).length;
  getElement('stat-done').textContent = completedTasks.length;

  // Due this week
  const currentTime = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const dueThisWeek = openTasks.filter(
    (task) =>
      task.dueDate &&
      new Date(task.dueDate) >= new Date() &&
      new Date(task.dueDate) <= new Date(currentTime + oneWeekMs),
  );
  getElement('stat-week').textContent = dueThisWeek.length;

  // Progress meter
  const totalTasks = allTasks.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const progressBar = getElement('progress-bar');
  const progressText = getElement('progress-text');
  if (progressBar && progressText) {
    progressBar.style.width = `${completionPercentage}%`;
    progressText.textContent = `${completionPercentage}% Complete`;
  }

  // Category breakdown
  renderCategoryBreakdown();

  // Priority chart
  renderPriorityDistribution();

  // Activity trend chart
  renderActivityTrend();

  updateCapacityStatus();
}

/**
 * Renders category breakdown chart
 */
function renderCategoryBreakdown() {
  const categoryContainer = getElement('category-breakdown');
  if (!categoryContainer) return;

  categoryContainer.innerHTML = '';

  const categoryCounts = {};
  const categoryNames = {
    academic: 'Academic',
    personal: 'Personal',
    professional: 'Professional',
    financial: 'Financial',
    entertainment: 'Entertainment',
  };

  AppState.tasks.forEach((task) => {
    const category = task.tag || 'none';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(categoryCounts), 1);

  Object.entries(categoryCounts).forEach(([category, count]) => {
    const barWidth = (count / maxCount) * 100;
    const categoryLabel = categoryNames[category] || 'Other';

    const barElement = document.createElement('div');
    barElement.className = 'category-bar';
    barElement.innerHTML = `
      <div class="category-label">${categoryLabel}</div>
      <div class="category-bar-container">
        <div class="category-bar-fill" style="width: ${barWidth}%"></div>
      </div>
      <div class="category-count">${count}</div>
    `;
    categoryContainer.appendChild(barElement);
  });
}

/**
 * Renders priority distribution chart
 */
function renderPriorityDistribution() {
  const priorityContainer = getElement('priority-chart');
  if (!priorityContainer) return;

  priorityContainer.innerHTML = '';

  const priorityCounts = {
    high: AppState.tasks.filter((t) => t.priority === 'high').length,
    medium: AppState.tasks.filter((t) => t.priority === 'medium').length,
    low: AppState.tasks.filter((t) => t.priority === 'low').length,
  };

  const totalTasks = AppState.tasks.length || 1;

  ['high', 'medium', 'low'].forEach((priority) => {
    const count = priorityCounts[priority];
    const percentage = Math.round((count / totalTasks) * 100);

    const priorityLabels = {
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
    };

    const barElement = document.createElement('div');
    barElement.className = `priority-bar priority-${priority}`;
    barElement.innerHTML = `
      <div class="priority-label">${priorityLabels[priority]}</div>
      <div class="priority-bar-container">
        <div class="priority-bar-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="priority-count">${count} (${percentage}%)</div>
    `;
    priorityContainer.appendChild(barElement);
  });
}

/**
 * Renders 7-day activity trend chart
 */
function renderActivityTrend() {
  const chartContainer = getElement('trend-chart');
  if (!chartContainer) return;

  chartContainer.innerHTML = '';

  const numberOfDays = 7;
  const dailyCounts = Array(numberOfDays).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count tasks created each day
  AppState.tasks.forEach((task) => {
    const taskCreationDate = new Date(task.createdAt || task.id);
    const daysDifference = Math.floor(
      (today - taskCreationDate) / (24 * 60 * 60 * 1000),
    );
    if (daysDifference >= 0 && daysDifference < numberOfDays) {
      dailyCounts[numberOfDays - 1 - daysDifference]++;
    }
  });

  const maxDailyCount = Math.max(...dailyCounts, 1);

  dailyCounts.forEach((count, index) => {
    const chartDate = new Date(today);
    chartDate.setDate(today.getDate() - (numberOfDays - 1 - index));
    const dayLabel = chartDate.toLocaleDateString([], { weekday: 'short' });

    const barHeight = Math.round((count / maxDailyCount) * 100);

    const columnElement = document.createElement('div');
    columnElement.className = 'chart-col';
    columnElement.innerHTML = `
      <div class="chart-bar-wrap">
        <span class="chart-count" aria-hidden="true">${count}</span>
        <div class="chart-bar" style="height: ${barHeight}%"
             role="img" aria-label="${dayLabel}: ${count} task${count !== 1 ? 's' : ''}"></div>
      </div>
      <span class="chart-label">${dayLabel}</span>
    `;
    chartContainer.appendChild(columnElement);
  });
}

// ── Search Functionality ──────────────────────────────────

searchInputElement.addEventListener('input', () => {
  const searchQuery = searchInputElement.value;
  const compiledRegex = compileRegexSafely(searchQuery);

  // Show invalid regex indicator
  if (searchQuery && !compiledRegex) {
    searchInputElement.setAttribute('aria-invalid', 'true');
    announceToScreenReader('Invalid search pattern.', true);
  } else {
    searchInputElement.removeAttribute('aria-invalid');
  }

  renderAllTasks();
});

// ── Global Keyboard Shortcuts ─────────────────────────────

document.addEventListener('keydown', (event) => {
  const activeElementTag = document.activeElement?.tagName?.toLowerCase();
  const isTypingInInput = ['input', 'textarea', 'select'].includes(
    activeElementTag,
  );

  // Escape key - close modals and panels
  if (event.key === 'Escape') {
    if (!getElement('task-modal').classList.contains('hidden')) {
      closeTaskModal();
      return;
    }
    if (!getElement('settings-modal').classList.contains('hidden')) {
      closeSettingsModal();
      return;
    }
    if (!sortPanelElement.classList.contains('hidden')) {
      closeSortPanel();
      sortTriggerButton.focus();
      return;
    }
  }

  // Only allow these shortcuts when NOT typing in an input
  if (!isTypingInInput) {
    // N key - New task
    if (event.key === 'n' || event.key === 'N') {
      event.preventDefault();
      openTaskModal();
    }

    // / key - Focus search
    if (event.key === '/') {
      event.preventDefault();
      searchInputElement.focus();
    }
  }
});

// ── Floating Add Button ───────────────────────────────────

getElement('add-btn').addEventListener('click', () => {
  openTaskModal();
});

// ── Mobile Menu Toggle ────────────────────────────────────

getElement('burger').addEventListener('click', () => {
  const navElement = getElement('main-nav');
  const isExpanded =
    getElement('burger').getAttribute('aria-expanded') === 'true';
  getElement('burger').setAttribute('aria-expanded', String(!isExpanded));
  navElement.classList.toggle('nav-open', !isExpanded);
});

// ── Initialization ────────────────────────────────────────

loadTasks();
applyUserSettings();
renderAllTasks();

// Aliases for backward compatibility with old function names
const escapeHtml = escapeHtmlCharacters;
const announce = announceToScreenReader;
const renderTasks = renderAllTasks;
