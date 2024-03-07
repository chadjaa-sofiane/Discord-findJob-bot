import { Client, GatewayIntentBits } from "discord.js";
import { createAssistantMessage } from "./controllers/messages";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`logged in as ${client.user?.tag}`);
});

client.on("error", (error) => {
  console.log(`an error has occured ${error}`);
});

// Discord bot messages
client.on("messageCreate", createAssistantMessage);

export default client;
