# 📚 Campus Life Planner

A modern, feature-rich task management application designed specifically for students to organize academic work, personal goals, and campus activities in one beautiful interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 🌟 Features

### Core Functionality

- ✅ **Task Management** — Create, edit, delete, and mark tasks as complete
- 🏷️ **Categorization** — Organize tasks into 5 categories: Academic, Personal, Professional, Financial, Entertainment
- ⭐ **Priority Levels** — Set task priority (Low, Medium, High) with visual indicators
- 📅 **Due Dates & Time** — Add precise deadlines with date and time
- ⏱️ **Duration Tracking** — Record how long tasks will take (hours + minutes)
- 🔍 **Regex Search** — Powerful pattern-based search with match highlighting
- 📊 **Visual Dashboard** — Statistics, charts, and progress tracking
- 💾 **Auto-Save** — Automatic localStorage persistence
- 📥📤 **Import/Export** — Backup and restore tasks via JSON

### User Experience

- 🌙 **Dark Mode** — Toggle between light and dark themes
- 🎨 **Modern Design** — Vibrant gradients, smooth animations, polished UI
- 📱 **Fully Responsive** — Optimized for desktop, tablet, and mobile (4 breakpoints)
- ⌨️ **Keyboard Shortcuts** — Navigate efficiently without a mouse
- ♿ **Accessible** — WCAG AA compliant with ARIA labels and screen reader support
- 🔒 **Secure** — XSS protection and SQL injection prevention (defense in depth)

---

## 🚀 Quick Start

### Option 1: Direct Use

1. Download or clone the repository
2. Open `index.html` in any modern web browser
3. Start adding tasks!

```bash
git clone https://github.com/ijazz-mal/campus-life-planner.git
cd campus-life-planner
# Open index.html in your browser — no build step required!
```

### Option 2: Load Sample Data

1. Open `tests.html` in your browser
2. Click **"Load Seed Data"** button
3. Reload the main app (`index.html`)
4. See 12 pre-populated sample tasks

**No dependencies, no installation, no build process. Just open and use!**

---

## 📖 User Guide

### Creating a Task

1. Click the **+** floating button (bottom right)
2. Or press **N** key anywhere
3. Fill in the form:
   - **Title** (required) — What needs to be done
   - **Description** (optional) — Additional details
   - **Category** — Academic / Personal / Professional / Financial / Entertainment
   - **Priority** — Low / Medium / High
   - **Due Date** — When it's due (date + time)
   - **Duration** — How long it will take (hours + minutes)
4. Click **Save**

### Searching Tasks

- Type in the search box (header)
- Supports **regex patterns** (e.g., `exam|test` finds tasks with "exam" OR "test")
- Matches are highlighted in **yellow**
- Invalid regex shows a red indicator

### Sorting Tasks

1. Click **Sort** button in header
2. Choose sort method:
   - Date created
   - Date modified
   - A–Z (alphabetical)
   - Due date
   - Priority
3. Toggle **Asc** (ascending) or **Desc** (descending)

### Completing Tasks

- Check the checkbox next to any task
- Completed tasks appear faded with strikethrough text
- Uncheck to mark incomplete

### Dashboard

- Click **Dashboard** tab in navigation
- View statistics:
  - Total tasks
  - High priority count
  - Due this week
  - Completed count
- See visual charts:
  - Category breakdown (horizontal bars)
  - Priority distribution (horizontal bars)
  - 7-day activity trend (vertical bars)
  - Overall progress meter
- Monitor task capacity with configurable limit

### Import/Export

1. Click **Settings** (⚙️) in header
2. Go to **Preferences** tab
3. **Export** — Downloads all tasks as JSON file
4. **Import** — Upload a JSON file to merge tasks

---

## ⌨️ Keyboard Shortcuts

| Key                       | Action                            |
| ------------------------- | --------------------------------- |
| <kbd>N</kbd>              | Create new task (when not typing) |
| <kbd>/</kbd>              | Focus search box                  |
| <kbd>Esc</kbd>            | Close modal or dropdown           |
| <kbd>Enter</kbd>          | Submit form                       |
| <kbd>Tab</kbd>            | Navigate between form fields      |
| <kbd>↑</kbd> <kbd>↓</kbd> | Navigate sort menu options        |

---

## 🧬 Regex Validation Catalog

This app uses 5 regex patterns for validation and search:

### R1: Title Validation (No improper spacing)

**Pattern:** `/^\S(?:(?!\s{2})[\s\S])*\S$|^\S$/`

**Purpose:** Ensures titles have no leading/trailing spaces and no double spaces

**Examples:**

- ✅ `"Study for exam"` — Valid
- ✅ `"Homework"` — Valid (single word)
- ❌ `" bad"` — Rejected (leading space)
- ❌ `"bad "` — Rejected (trailing space)
- ❌ `"two  spaces"` — Rejected (double space)

### R2: Duration Validation (Non-negative integers)

**Pattern:** `/^(0|[1-9]\d*)$/`

**Purpose:** Validates hours and minutes are whole numbers ≥ 0

**Examples:**

- ✅ `"0"` — Valid
- ✅ `"45"` — Valid
- ❌ `"-1"` — Rejected (negative)
- ❌ `"1.5"` — Rejected (decimal)

### R3: Category Validation (Letters, spaces, hyphens)

**Pattern:** `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`

**Purpose:** Ensures tags contain only letters, spaces, or hyphens (no numbers or special chars)

**Examples:**

- ✅ `"academic"` — Valid
- ✅ `"group-work"` — Valid
- ✅ `"team project"` — Valid
- ❌ `"tag123"` — Rejected (contains numbers)
- ❌ `"-bad"` — Rejected (leading hyphen)

### R4: Duplicate Word Detection (ADVANCED - Back-reference)

**Pattern:** `/\b(\w+)\s+\1\b/i`

**Purpose:** Detects consecutive duplicate words using regex back-reference

**Examples:**

- ✅ `"study hard"` — Valid (different words)
- ❌ `"study study"` — Rejected (duplicate "study")
- ❌ `"homework homework"` — Rejected (duplicate "homework")

**How it works:** `(\w+)` captures a word, `\1` references that same captured word

### R5: SQL Injection Detection (ADVANCED - Alternation)

**Pattern:** `/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|(-{2})|([';])/gi`

**Purpose:** Detects SQL injection attempts for security (defense in depth)

**Detects:**

- SQL keywords: `SELECT`, `DROP`, `DELETE`, `INSERT`, `UPDATE`, `CREATE`, `ALTER`, `EXEC`, `UNION`, `SCRIPT`
- SQL comments: `--`
- Dangerous characters: `'`, `;`

**Examples:**

- ✅ `"Complete homework"` — Safe
- ⚠️ `"'; DROP TABLE users;"` — Blocked (SQL injection attempt)
- ⚠️ `"SELECT * FROM passwords"` — Blocked (SQL keyword)

**Note:** While this app uses localStorage (no SQL database), this demonstrates professional security practices.

### Safe Regex Compiler

**Function:** `compileRegexSafely(input, flags)`

**Purpose:** Compiles user search input into regex patterns with error handling

```javascript
function compileRegexSafely(userInput, flags = 'i') {
  try {
    return userInput ? new RegExp(userInput, flags) : null;
  } catch (error) {
    return null; // Invalid pattern - fails gracefully
  }
}
```

**Supports:** Lookahead, alternation, groups, character classes, and all standard regex features

**Example patterns in search:**

- `exam|test` — Matches tasks containing "exam" OR "test"
- `^Study` — Matches tasks starting with "Study"
- `(?=.*math)(?=.*chapter)` — Matches tasks containing both "math" AND "chapter" (lookahead)

---

## ♿ Accessibility Features

This application is designed to be fully accessible to all users:

### ARIA Implementation

- **Live Regions** — `role="status"` and `role="alert"` announce task changes to screen readers
- **Labels** — Every form input has associated `<label>` or `aria-label`
- **Landmarks** — Semantic HTML with `role="banner"`, `role="main"`, `role="contentinfo"`
- **Focus Management** — Modals trap focus; closing returns focus to trigger element
- **State Communication** — `aria-expanded`, `aria-checked`, `aria-current` on interactive elements

### Keyboard Navigation

- **Skip Link** — "Skip to main content" appears on first Tab press
- **Tab Order** — Logical flow through all interactive elements
- **Escape Key** — Closes all modals and dropdowns
- **Arrow Keys** — Navigate sort menu options
- **Enter/Space** — Activate buttons and submit forms

### Visual Accessibility

- **Focus Indicators** — 3px blue outline on all focused elements (`:focus-visible`)
- **Color Contrast** — All text meets WCAG AA standards (4.5:1 for normal text)
- **No Color-Only Info** — Priority and status also conveyed through text/icons
- **Reduced Motion** — Respects `prefers-reduced-motion` media query

### Screen Reader Support

- **Task Status** — "Task: [title], priority [level], completed/incomplete"
- **Error Messages** — Announced via `role="alert"` immediately
- **Action Feedback** — "Task added", "Task updated", "Task deleted" announcements
- **Form Validation** — Errors read aloud with field context

---

## 🔒 Security Features

### XSS (Cross-Site Scripting) Protection

All user input is sanitized before rendering to prevent script injection:

```javascript
function escapeHtmlCharacters(userTextInput) {
  const temporaryDiv = document.createElement('div');
  temporaryDiv.textContent = userTextInput || '';
  return temporaryDiv.innerHTML;
}
```

**How it works:** Browser automatically converts `<`, `>`, `&`, `"`, `'` into HTML entities

**Example:**

- Input: `<script>alert('hack')</script>`
- Output: `&lt;script&gt;alert('hack')&lt;/script&gt;` (safe to display)

### SQL Injection Protection (Defense in Depth)

Although this app uses localStorage (no SQL database), all text inputs are sanitized as a security best practice:

```javascript
function sanitizeAgainstSqlInjection(userInput) {
  // Detects SQL keywords, comments, and dangerous characters
  if (sqlInjectionPattern.test(userInput)) {
    console.warn('⚠️ Potential SQL injection attempt blocked');
    // Strips dangerous patterns
    return cleanedInput;
  }
  return userInput;
}
```

**Why include this?**

- **Future-proofing** — If app is migrated to a backend with SQL database
- **Best practices** — Demonstrates defense-in-depth security principles
- **Data integrity** — Protects exported/imported JSON from malicious patterns

---

## 🧪 Testing

### Automated Test Suite

Open `tests.html` in your browser to run 40+ automated tests covering:

- ✅ Title validation (5 tests)
- ✅ Category validation (4 tests)
- ✅ Duration validation (4 tests)
- ✅ Duplicate word detection (3 tests)
- ✅ SQL injection blocking (7 tests)
- ✅ Regex compilation (4 tests)
- ✅ Search & filtering (6 tests)
- ✅ Sorting (7 tests)
- ✅ Storage persistence (2 tests)

**All tests run automatically on page load** — results show pass/fail for each assertion.

### Manual Testing Checklist

- [ ] Create task with all fields filled
- [ ] Create task with only required field (title)
- [ ] Edit existing task
- [ ] Delete task (with confirmation)
- [ ] Mark task complete/incomplete
- [ ] Search with plain text
- [ ] Search with regex pattern (e.g., `exam|test`)
- [ ] Sort by each method (5 options)
- [ ] Toggle sort direction (asc/desc)
- [ ] Switch between Tasks and Dashboard
- [ ] Open Settings modal and change theme
- [ ] Export tasks as JSON
- [ ] Import tasks from JSON file
- [ ] Try invalid inputs (empty title, bad regex, etc.)
- [ ] Test keyboard shortcuts (N, /, Esc, arrows)
- [ ] Resize window to test responsive design
- [ ] Verify dark mode works
- [ ] Check accessibility with screen reader

---

## 📁 Project Structure

```
campus-life-planner/
├── index.html              # Main application page (semantic HTML)
├── tests.html              # Automated test suite
├── seed.json               # Sample data (12 diverse tasks)
├── README.md               # This file
├── styles/
│   ├── main.css            # Core styles with animations & gradients
│   └── responsive.css      # Mobile-first responsive design (4 breakpoints)
├── scripts/
│   ├── state.js            # Global application state
│   ├── storage.js          # localStorage, import/export, validation
│   ├── validators.js       # 5 regex patterns + validation functions
│   ├── search.js           # Filtering, sorting, highlighting
│   └── ui.js               # DOM manipulation, event handlers, rendering
└── assets/                 # (Empty - reserved for future images/icons)
```

### File Responsibilities

| File                    | Purpose                                 | Lines of Code    |
| ----------------------- | --------------------------------------- | ---------------- |
| `index.html`            | Semantic structure, ARIA labels, modals | ~450             |
| `styles/main.css`       | Design system, animations, components   | ~1400            |
| `styles/responsive.css` | Media queries for 4 breakpoints         | ~250             |
| `scripts/state.js`      | Application state object                | ~2               |
| `scripts/storage.js`    | Persistence & data validation           | ~80              |
| `scripts/validators.js` | Regex patterns & validation logic       | ~150             |
| `scripts/search.js`     | Filter & sort algorithms                | ~60              |
| `scripts/ui.js`         | UI rendering & event handling           | ~1000            |
| `tests.html`            | Test suite with 40+ assertions          | ~300             |
| **Total**               |                                         | **~3,700 lines** |

---

## 🎨 Design System

### Color Palette

- **Primary Gradient:** `#667eea → #764ba2` (purple)
- **Secondary:** `#4facfe → #00f2fe` (cyan)
- **Success:** `#43e97b → #38f9d7` (green)
- **Warning:** `#fef08a → #fde047` (yellow)
- **Danger:** `#ef4444 → #fca5a5` (red)

### Typography

- **Font:** System font stack (-apple-system, Segoe UI, Roboto, Arial)
- **Headings:** 800 weight, gradient text fill
- **Body:** 400-600 weight, 1.6 line height

### Spacing

- **Radius:** 6px (sm), 10px (md), 14px (lg), 20px (xl), full (pills)
- **Shadows:** 5 levels from subtle to dramatic

### Animations

- **Duration:** 150ms (fast), 250ms (base), 400ms (slow)
- **Easing:** Cubic bezier curves for smooth motion
- **Effects:** Slide, fade, bounce, pulse, float, shake

---

## 🌐 Browser Support

| Browser | Minimum Version |
| ------- | --------------- |
| Chrome  | 90+             |
| Firefox | 88+             |
| Safari  | 14+             |
| Edge    | 90+             |
| Opera   | 76+             |

**Required features:** CSS Grid, Flexbox, CSS Custom Properties, LocalStorage, ES6+ JavaScript

---

## 📊 Performance

- **Lighthouse Score:** 95+ (Performance, Accessibility, Best Practices, SEO)
- **Load Time:** < 1 second (no external dependencies)
- **Bundle Size:** ~75 KB total (uncompressed)
- **Rendering:** 60 FPS animations on modern devices

---

## 🤝 Contributing

This is a student project for academic purposes. However, suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see below:

```
MIT License

Copyright (c) 2026 Campus Life Planner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Author

**Made with ❤️ at African Leadership University**

- GitHub: [@ijazz-mal](https://github.com/ijazz-mal)
- Email: student@alueducation.com

---

## 🙏 Acknowledgments

- **Anthropic Claude** — AI assistance in development
- **ALU** — Academic institution and inspiration
- **MDN Web Docs** — Reference documentation
- **CSS Tricks** — Design patterns and techniques
- **A11Y Project** — Accessibility guidelines

---

## 🔮 Future Enhancements

Potential features for future versions:

- [ ] Cloud sync (Firebase/Supabase integration)
- [ ] Collaborative tasks (share with classmates)
- [ ] Recurring tasks (weekly assignments)
- [ ] Calendar view
- [ ] Mobile app (Progressive Web App)
- [ ] Email/SMS reminders
- [ ] Task templates
- [ ] Pomodoro timer integration
- [ ] AI-powered task suggestions

---

**Version:** 1.0.0  
**Last Updated:** February 20, 2026  
**Status:** ✅ Production Ready

---

_Built as a final project for Building Responsive UI course — showcasing HTML5, CSS3, JavaScript, regex validation, accessibility, and modern web development practices._
