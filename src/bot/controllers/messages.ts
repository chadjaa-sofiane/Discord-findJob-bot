import { Message } from "discord.js";
import createGPTChat from "../../services/chatGpt";

export const createAssistantMessage = async (message: Message) => {
  if (!message.author.bot) {
    const chat = await createGPTChat();

    const userId = message.author.id;

    const GPTmessage = await chat.getMessage({
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
