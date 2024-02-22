import createGPTChat from "../../services/chatGpt";
import client from "../../services/discord";

client.on("messageCreate", async (message) => {
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
});
