import redisClient from "./redisClient";
import { MESSAGES, getUserSettingsKey } from "../configs/constant";

type UsersSettings = Record<
  string,
  {
    technologies: string[];
  }
>;

export const getAllUserSettings = async (): Promise<UsersSettings> => {
  const allUserSettingsKeys = getUserSettingsKey("*");
  const keys = await redisClient.keys(allUserSettingsKeys);

  const settingsPromises = keys.reduce(
    async (acc, key) => {
      const userId = key.split(":")[1];
      const technologies: string[] = JSON.parse(
        (await redisClient.hGet(key, "technologies")) || "",
      );
      return {
        ...(await acc),
        [userId]: {
          technologies,
        },
      };
    },
    Promise.resolve({} as UsersSettings),
  );
  return settingsPromises;
};
