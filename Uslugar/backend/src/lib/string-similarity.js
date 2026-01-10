/**
 * String similarity utilities for company name matching
 */

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Distance (0 = identical, higher = more different)
 */
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  
  // Create matrix
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + 1   // substitution
        );
      }
    }
  }
  
  return dp[m][n];
}

/**
 * Normalize string for comparison (remove accents, lowercase, trim)
 * @param {string} str - String to normalize
 * @returns {string} - Normalized string
 */
function normalizeString(str) {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special chars except letters, numbers, spaces
    .replace(/\s+/g, ' ');   // Normalize whitespace
}

/**
 * Calculate similarity score between two strings (0-1, where 1 = identical)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score 0-1
 */
export function calculateSimilarity(str1, str2) {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);
  
  if (normalized1 === normalized2) return 1.0;
  
  const maxLength = Math.max(normalized1.length, normalized2.length);
  if (maxLength === 0) return 1.0;
  
  const distance = levenshteinDistance(normalized1, normalized2);
  const similarity = 1 - (distance / maxLength);
  
  return Math.max(0, similarity);
}

/**
 * Check if company name is similar enough to official name
 * @param {string} userInput - User-entered company name
 * @param {string} officialName - Official name from registry
 * @param {number} threshold - Minimum similarity threshold (default 0.7)
 * @returns {boolean} - True if similar enough
 */
export function isSimilarEnough(userInput, officialName, threshold = 0.7) {
  const similarity = calculateSimilarity(userInput, officialName);
  return similarity >= threshold;
}

/**
 * Extract main company name (remove common suffixes/prefixes for better matching)
 * @param {string} companyName - Company name
 * @returns {string} - Cleaned company name
 */
export function extractMainName(companyName) {
  if (!companyName) return '';
  
  // Remove common legal suffixes
  const cleaned = companyName
    .replace(/\s+(d\.o\.o\.?|d\.d\.?|d\.n\.o\.?|j\.d\.o\.o\.?|obrt|td\.?)\s*$/i, '')
    .trim();
  
  return cleaned;
}

/**
 * Check if company name contains enough meaningful characters
 * @param {string} companyName - Company name to validate
 * @param {number} minLength - Minimum meaningful length (default 3)
 * @returns {boolean} - True if valid
 */
export function isValidCompanyName(companyName, minLength = 3) {
  if (!companyName || typeof companyName !== 'string') return false;
  
  const cleaned = normalizeString(companyName);
  
  // Check minimum length
  if (cleaned.length < minLength) return false;
  
  // Must contain at least one letter (not just numbers/symbols)
  if (!/[a-zžčćđš]/.test(cleaned)) return false;
  
  // Should not be just common words
  const commonWords = ['tvrtka', 'firma', 'obrt', 'company', 'firm'];
  const words = cleaned.split(/\s+/);
  const meaningfulWords = words.filter(w => w.length >= 2 && !commonWords.includes(w));
  
  return meaningfulWords.length >= 1;
}

