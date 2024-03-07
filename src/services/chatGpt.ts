import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import redisClient from "../redis/redisClient";
import { MESSAGES, getUserSettingsKey } from "../configs/constant";

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

const sendChatGptRequest = async (messages: ChatCompletionMessageParam[]) => {
  const completion = await openai.chat.completions.create({
    messages,
    response_format: { type: "json_object" },
    model: "gpt-3.5-turbo-0125",
  });

  return completion.choices[0]?.message?.content || "";
};

const parseChatGptResponse = (response: string): ChatGptCompletionResult => {
  const result: ChatGptCompletionResult = JSON.parse(response);
  return result;
};

// TODO: rename this function to createChatGptAssistant.
// TODO: separate responsibilities, ex: managing redis operations, proccessing chat GPT respones.
const createGPTChat = async () => {
  const usersSettings = await getAllUserSettings();

  const redisMessages = await redisClient.lRange(MESSAGES, 0, -1);

  let messages: ChatCompletionMessageParam[] = redisMessages.map((message) =>
    JSON.parse(message),
  );

  const instructionMessages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: `
            "message": "You are a useful Discord bot assistant that will help us find a job designed to output json. The json format should be as follows: { 
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

    const assistantResponse = await sendChatGptRequest([
      ...instructionMessages,
      ...messages,
    ]);

    const result: ChatGptCompletionResult = JSON.parse(assistantResponse);
    const { settings, message: responseMessage } =
      parseChatGptResponse(assistantResponse);

    const assistantMessage: ChatCompletionMessageParam = {
      role: "assistant",
      content: assistantResponse,
    };

    messages.push(newMessage);
    messages.push(assistantMessage);

    if (result?.settings?.technologies?.length > 0) {
      usersSettings[userId] = {
        technologies: settings.technologies,
      };
      // Store the users settings.
      const userSettingsKey = getUserSettingsKey(userId);
      redisClient.hSet(
        userSettingsKey,
        "technologies",
        JSON.stringify(result.settings.technologies),
      );
    }

    // Store your message
    redisClient.rPush(MESSAGES, JSON.stringify(newMessage));

    // Store Gpt response
    redisClient.rPush(MESSAGES, JSON.stringify(assistantMessage));

    return responseMessage;
  };
  return {
    getMessage,
  };
};

export default createGPTChat;
