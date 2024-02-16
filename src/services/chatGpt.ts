import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

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

const createGPTChat = () => {
  const usersSettings: UsersSettings = {};
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "user",
      content: `
          You are a usefull chat assistant that will help us find a job, you are gonna return the responses in a JSON format.  
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
      messages: [...messages, newMessage],
      model: "gpt-3.5-turbo",
    });
    const GPTAnswer = completion?.choices[0]?.message?.content || "";
    const result: ChatGptCompletionResult = JSON.parse(GPTAnswer);

    messages.push(newMessage);
    messages.push({
      role: "assistant",
      content: GPTAnswer,
    });

    if (result.settings.technologies.length > 0) {
      usersSettings[userId] = {
        technologies: result.settings.technologies,
      };
    }

    console.log(usersSettings);
    return result.message;
  };
  return {
    getMessage,
  };
};

export default createGPTChat;
