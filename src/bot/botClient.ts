import { Client, GatewayIntentBits, Events } from "discord.js";
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

client.on(Events.ClientReady, () => {
  console.log(`logged in as ${client.user?.tag}`);
});

client.on(Events.Error, (error) => {
  console.log(`an error has occured ${error}`);
  // const channel = client.channels.cache.get("1192796488888229938");
});

// Discord bot messages
client.on(Events.MessageCreate, createAssistantMessage);

export default client;
