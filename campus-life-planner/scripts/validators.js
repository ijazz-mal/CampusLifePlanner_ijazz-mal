// Regex rules
// Title — no leading/trailing spaces, no double spaces
const Title_pattern = /^\S(?:(?!\s{2})[\s\S])*\S$|^\S$/;

// Numeric duration — non-negative integer
const Duration_pattern = /^(0|[1-9]\d*)$/;

// Tag — letters, spaces, hyphens; no leading/trailing punctuation
const Tag_pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;

// (advanced — lookahead): Title must not contain consecutive duplicate words
const Duplicate_pattern = /\b(\w+)\s+\1\b/i;

// Validators — return error message or null if valid
function validateTitle(val) {
  if (!val || !val.trim()) return 'Title is required.';
  if (!Title_pattern.test(val))
    return 'Title must not have leading/trailing spaces or double spaces.';
  if (Duplicate_pattern.test(val))
    return 'Title contains duplicate consecutive words.';
  return null;
}

function validateTag(val) {
  if (!val) return null; //because a tag is optional
  if (!Tag_pattern.test(val))
    return 'Tag must contain only letters, spaces, or hyphens.';
  return null;
}

function validateDuration(hours, minutes) {
  const h = String(hours ?? '').trim();
  const m = String(minutes ?? '').trim();
  if (h && !Duration_pattern.test(h)) return 'Hours must be a whole number.';
  if (m && !Duration_pattern.test(m))
    return 'Minutes must be a whole number (0–59).';
  if (m && parseInt(m) > 59) return 'Minutes cannot exceed 59.';
  return null;
}

// Safe regex compiler for search — lookahead supported by try/catch
function compileRegex(input, flags = 'i') {
  try {
    return input ? new RegExp(input, flags) : null;
  } catch {
    return null;
  }
}

// Uses lookahead to detect SQL injection attempts
const SQL_INJECTION_PATTERN =
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)|(-{2})|([';])/gi;

function sanitizeSqlInput(input) {
  if (!input || typeof input !== 'string') return input;

  // Check for SQL injection patterns
  if (SQL_INJECTION_PATTERN.test(input)) {
    console.warn('⚠️ Potential SQL injection attempt blocked:', input);
    // Remove dangerous patterns
    return input
      .replace(
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
        '',
      )
      .replace(/(-{2})/g, '') // Remove SQL comments
      .replace(/[';]/g, ''); // Remove quotes and semicolons
  }

  return input;
}

// Helper: Validate input is safe for database operations (if app uses backend)
function isSafeDatabaseInput(input) {
  if (!input) return true;
  return !SQL_INJECTION_PATTERN.test(input);
}
