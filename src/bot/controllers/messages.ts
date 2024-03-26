import { Message } from "discord.js";
import createAssistant from "@/services/chatGpt";

const assistant = await createAssistant();

export const createAssistantMessage = async (message: Message) => {
  if (!message.author.bot) {
    const userId = message.author.id;

    const GPTmessage = await assistant.getMessage({
      userId,
      message: `
        createdAt: ${message.createdAt.toISOString()}
        author: ${message.author.username}
        message: ${message.content}
      `,
    });

    message.channel.send(GPTmessage);
  }
};
