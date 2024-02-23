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

  const instructionMessages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: `
            "message": "You are a useful Discord bot assistant that will help us find a job designed to output JSON. The json format should be as follows: { 
              message: string (your message to the user), 
              settings: { 
                userId: string (the user ID that contacted you), 
                technologies: string[] (the technologies that the user asks you to add to his desire list) 
              } 
            } 
            The userId will be provided for each message. 
            If the user asks you to add certain technologies for his job search,
            add them to their list. If a technology is unrelated or already exists inform the user.
            Never remove any technology from the stack until the user asks you to do.
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
      messages: [...instructionMessages, ...messages, newMessage],
      response_format: { type: "json_object" },
      model: "gpt-3.5-turbo-0125",
    });
    console.log(completion.choices[0]);

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
