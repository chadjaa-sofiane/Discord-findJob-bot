export const JOB_APPLICATIONS_SET = "processed_job_applications";
export const MESSAGES = "messages";

export const USER_SETTINGS_KEY_PREFIX = "usersSettings";

/**
 * Generates a Redis key for storing user settings based on the provided userId.
 * The key format is: 'usersSettings:{userId}'
 *
 * @param userId - The unique identifier of the user.
 * @returns The constructed Redis key for the user's settings.
 */
export const getUserSettingsKey = (userId: string): string => {
  return `${USER_SETTINGS_KEY_PREFIX}:${userId}`;
};
