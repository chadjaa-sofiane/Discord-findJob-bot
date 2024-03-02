/**
 * Sanitizes the given text by removing newline characters and trimming leading and trailing spaces.
 *
 * @param {string} text - The text to be sanitized.
 * @returns {string} - The sanitized text.
 */
export const sanitizeText = (text: string) => {
  return text.replace("\n", "").trim();
};
