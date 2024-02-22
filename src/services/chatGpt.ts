import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import redisClient from "../redis/redisClient";

type UsersSettings = Record<
  string,
  {
    technologies: string[];
  }
>;

type ChatGptCompletionResult = {
  message: string;
  settings: {
    userId: string;
    technologies: string[];
  };
};

const openai = new OpenAI({
  apiKey: Bun.env.OPEN_AI_SCRET_KEY,
});

const getAllUserSettings = async (): Promise<UsersSettings> => {
  const keys = await redisClient.keys("usersSettings:*");

  const settingsPromises = await keys.reduce(
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
  console.log(settingsPromises);

  return settingsPromises;
};

const createGPTChat = async () => {
  const usersSettings = await getAllUserSettings();

  const redisMessages = await redisClient.lRange("messages", 0, -1);
  let messages: ChatCompletionMessageParam[] = redisMessages.map((message) =>
    JSON.parse(message),
  );

  if (messages.length === 0) {
    messages = [
      ...messages,
      {
        role: "user",
        content: `
          You are a usefull discord bot assistant that will help us find a job, you are gonna return the responses in a JSON format.  
          the json format: {
            message: string (your message to the user),
            settings: {
              userId: string (the user Id that contacted you),
              technologies: string[] (the technologies that the user askes you to add to his desire list),
            }
          }
          the userId will be provided for each message, if the user askes you to add certain languages for his job search add it to his list.
          if a thechonoly already exist or user entered something unrleated, please make it know that
          never remove any technology from the stack until I tell you.
          warning: never break the json format, always answer in JSON
        `,
      },
      {
        role: "assistant",
        content: `
                Hi! I'm your friendly job search assistant I'll guide you through the process and help you create a strong job profile. 
                Tell me about your desired field, skills, or any specific technologies you're interested in.
                I'll keep track of your preferences and recommend relevant technologies.
              `,
      },
    ];
  }

  const getMessage = async ({
    userId,
    message,
  }: {
    userId: string;
    message: string;
  }) => {
    const newMessage: ChatCompletionMessageParam = {
      role: "user",
      content: `
            userid: ${userId}
            message: ${message}
          `,
    };
    const completion = await openai.chat.completions.create({
      messages: [...messages, newMessage],
      model: "gpt-3.5-turbo",
    });

    const GPTAnswer = completion?.choices[0]?.message?.content || "";
    const result: ChatGptCompletionResult = JSON.parse(GPTAnswer);

    const GPTmessage: ChatCompletionMessageParam = {
      role: "assistant",
      content: GPTAnswer,
    };

    messages.push(newMessage);
    messages.push(GPTmessage);

    if (result?.settings?.technologies?.length > 0) {
      usersSettings[userId] = {
        technologies: result.settings.technologies,
      };
      // Store the users settings.
      redisClient.hSet(
        `usersSettings:${userId}`,
        "technologies",
        JSON.stringify(result.settings.technologies),
      );
    }

    // Store your message
    redisClient.rPush(`messages`, JSON.stringify(newMessage));

    // Store Gpt response
    redisClient.rPush(`messages`, JSON.stringify(GPTmessage));

    return result.message;
  };
  return {
    getMessage,
  };
};

export default createGPTChat;
