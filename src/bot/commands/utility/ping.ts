import { SlashCommandBuilder, CommandInteraction } from "discord.js";

interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

const pingCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Respond to the user with pong"),

  async execute(interaction: CommandInteraction) {
    await interaction.reply("pong");
  },
};

export default pingCommand;
