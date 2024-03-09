/**
 * Sanitizes the given text by removing newline characters and trimming leading and trailing spaces.
 *
 * @param {string} text - The text to be sanitized.
 * @returns {string} - The sanitized text.
 */
export const sanitizeText = (text: string) => {
  return text.replace("\n", "").trim();
};

/**
 * Wait for the specified number of milliseconds.
 *
 * @param ms The number of milliseconds to wait.
 * @returns A Promise that resolves after the specified time.
 */
export const wait = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};
