import { REST, Routes } from "discord.js";
import path from "node:path";
import { fileURLToPath } from "url";
import { readdir } from "node:fs/promises";
import configs from "../configs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands: unknown[] = [];
const foldersPath = path.join(__dirname, "commands");
const commandsFolder = await readdir(foldersPath);

for (const folder of commandsFolder) {
  const commandPath = path.join(foldersPath, folder);
  const commandFiles = (await readdir(commandPath)).filter((file) =>
    file.endsWith(".ts"),
  );

  for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = (await import(filePath)).default;

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(configs.discordToken);

const slashRegister = async () => {
  console.log(commands);
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        configs.discordClientId,
        configs.discordGulId,
      ),
      { body: commands },
    );
  } catch (error) {
    console.log(error);
  }
};

slashRegister();
