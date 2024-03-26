import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { readdir } from "node:fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createAssistantMessage } from "./controllers/messages";
import "./register-commands";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CustomClient extends Client {
  commands: Collection<string, any>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as CustomClient;

// retrieve commands from commands folder
client.commands = new Collection();

const folderPath = join(__dirname, "commands");
const commandFolders = await readdir(folderPath);

for (const folder of commandFolders) {
  const commandsPath = join(folderPath, folder);
  const commandsFiles = (await readdir(commandsPath)).filter((file) =>
    file.endsWith(".ts"),
  );
  for (const file of commandsFiles) {
    const filePath = join(commandsPath, file);
    const command = (await import(filePath)).default;

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.log(`cannot find command ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
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
